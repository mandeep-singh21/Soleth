import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_SEPOLIA_HEX,
  ARBITRUM_SEPOLIA_PARAMS,
  HARDHAT_CHAIN_ID,
} from '../utils/constants';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);
  const [contractOwner, setContractOwner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Protocol Stats & Projects
  const [projects, setProjects] = useState([]);
  const [protocolStats, setProtocolStats] = useState({
    totalProjects: 0,
    totalVolume: '0',
    accumulatedFees: '0',
    treasuryBalance: '0',
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show Toast Helper
  const showToast = useCallback((type, message, txHash = null) => {
    setToastMessage({ type, message, txHash, id: Date.now() });
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Initialize Provider & Fallback
  const getFallbackProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(
      ARBITRUM_SEPOLIA_PARAMS.rpcUrls[0]
    );
  }, []);

  // Get Contract Instance (Signer or Provider)
  const getContract = useCallback(
    (customSignerOrProvider = null) => {
      const activeProviderOrSigner =
        customSignerOrProvider || signer || provider || getFallbackProvider();
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, activeProviderOrSigner);
    },
    [signer, provider, getFallbackProvider]
  );

  // Fetch Balance
  const fetchBalance = useCallback(async (walletAddress, ethProvider) => {
    try {
      if (!walletAddress || !ethProvider) return;
      const balWei = await ethProvider.getBalance(walletAddress);
      setBalance(ethers.formatEther(balWei));
    } catch (err) {
      console.warn('Error fetching balance:', err);
    }
  }, []);

  // Fetch All Projects & Protocol Stats from Contract
  const refreshData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const contract = getContract();

      // Fetch Protocol Stats
      try {
        const stats = await contract.getProtocolStats();
        setProtocolStats({
          totalProjects: Number(stats[0]),
          totalVolume: ethers.formatEther(stats[1]),
          accumulatedFees: ethers.formatEther(stats[2]),
          treasuryBalance: ethers.formatEther(stats[3]),
        });
      } catch (err) {
        console.warn('Could not fetch protocol stats:', err);
      }

      // Check Contract Owner
      try {
        const ownerAddr = await contract.owner();
        setContractOwner(ownerAddr);
        if (account && ownerAddr.toLowerCase() === account.toLowerCase()) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.warn('Could not fetch contract owner:', err);
      }

      // Fetch All Project IDs
      try {
        const projectIds = await contract.getAllProjects();
        const loadedProjects = [];

        for (const id of projectIds) {
          try {
            const [proj, milestones] = await contract.getProject(id);
            loadedProjects.push({
              id: Number(proj.id),
              name: proj.name,
              client: proj.client,
              freelancer: proj.freelancer,
              totalAmount: proj.totalAmount,
              paidAmount: proj.paidAmount,
              refundedAmount: proj.refundedAmount,
              isFunded: proj.isFunded,
              status: Number(proj.status),
              createdAt: Number(proj.createdAt),
              milestoneCount: Number(proj.milestoneCount),
              milestones: milestones.map((m, idx) => ({
                index: idx,
                description: m.description,
                amount: m.amount,
                status: Number(m.status),
                submissionTime: Number(m.submissionTime),
                paidTime: Number(m.paidTime),
              })),
            });
          } catch (itemErr) {
            console.warn(`Error loading project #${id}:`, itemErr);
          }
        }

        // Sort by ID descending (newest first)
        setProjects(loadedProjects.reverse());
      } catch (projErr) {
        console.warn('Error fetching all projects:', projErr);
      }
    } catch (error) {
      console.error('Error in refreshData:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [account, getContract]);

  // Connect Wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showToast('error', 'MetaMask is not installed. Please install MetaMask to interact.');
      return;
    }

    try {
      setIsConnecting(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      const ethSigner = await browserProvider.getSigner();
      setProvider(browserProvider);
      setSigner(ethSigner);
      setAccount(accounts[0]);
      setChainId(currentChainId);

      const isSupported =
        currentChainId === ARBITRUM_SEPOLIA_CHAIN_ID || currentChainId === HARDHAT_CHAIN_ID;
      setIsWrongNetwork(!isSupported);

      await fetchBalance(accounts[0], browserProvider);
      showToast('success', `Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
    } catch (err) {
      console.error('Wallet connection error:', err);
      showToast('error', err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to Arbitrum Sepolia
  const switchToArbitrumSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARBITRUM_SEPOLIA_HEX }],
      });
      setIsWrongNetwork(false);
      showToast('success', 'Switched to Arbitrum Sepolia network');
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARBITRUM_SEPOLIA_PARAMS],
          });
          setIsWrongNetwork(false);
          showToast('success', 'Arbitrum Sepolia network added and switched');
        } catch (addError) {
          showToast('error', 'Failed to add Arbitrum Sepolia network');
        }
      } else {
        showToast('error', switchError.message || 'Failed to switch network');
      }
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setBalance('0');
    setIsOwner(false);
    showToast('info', 'Wallet disconnected');
  };

  // Smart Contract Action: Create Project
  const createProject = async (name, freelancerAddress, descriptions, amountsEth) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const amountsWei = amountsEth.map((a) => ethers.parseEther(a.toString()));
      const tx = await contract.createProject(name, freelancerAddress, descriptions, amountsWei);
      showToast('info', 'Creating project transaction submitted...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', 'Project created successfully on-chain!', receipt.hash);
      await refreshData();
      return receipt;
    } catch (error) {
      console.error('createProject error:', error);
      showToast('error', error.reason || error.message || 'Transaction failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Smart Contract Action: Fund Project
  const fundProject = async (projectId, totalAmountWei) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.fundProject(projectId, { value: totalAmountWei });
      showToast('info', 'Funding escrow transaction submitted...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Project #${projectId} funded! Escrow locked in contract.`, receipt.hash);
      await refreshData();
      if (account && provider) fetchBalance(account, provider);
      return receipt;
    } catch (error) {
      console.error('fundProject error:', error);
      showToast('error', error.reason || error.message || 'Funding failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Smart Contract Action: Submit Milestone
  const submitMilestone = async (projectId, milestoneIndex) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.submitMilestone(projectId, milestoneIndex);
      showToast('info', 'Submitting milestone completion...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Milestone #${milestoneIndex + 1} submitted for client review!`, receipt.hash);
      await refreshData();
      return receipt;
    } catch (error) {
      console.error('submitMilestone error:', error);
      showToast('error', error.reason || error.message || 'Milestone submission failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Smart Contract Action: Approve Milestone (Triggers 0.05% fee + 99.95% payout)
  const approveMilestone = async (projectId, milestoneIndex) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.approveMilestone(projectId, milestoneIndex);
      showToast('info', 'Approving milestone & releasing payment...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Milestone #${milestoneIndex + 1} approved! 99.95% paid to freelancer, 0.05% protocol fee collected.`, receipt.hash);
      await refreshData();
      if (account && provider) fetchBalance(account, provider);
      return receipt;
    } catch (error) {
      console.error('approveMilestone error:', error);
      showToast('error', error.reason || error.message || 'Milestone approval failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Smart Contract Action: Cancel Project
  const cancelProject = async (projectId) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.cancelProject(projectId);
      showToast('info', 'Cancelling project & requesting refund...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Project #${projectId} cancelled. Remaining escrow refunded to client.`, receipt.hash);
      await refreshData();
      if (account && provider) fetchBalance(account, provider);
      return receipt;
    } catch (error) {
      console.error('cancelProject error:', error);
      showToast('error', error.reason || error.message || 'Cancellation failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Smart Contract Action: Withdraw Protocol Fees (Owner only)
  const withdrawProtocolFees = async (recipientAddress) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.withdrawProtocolFees(recipientAddress);
      showToast('info', 'Withdrawing protocol treasury fees...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', 'Accumulated protocol fees withdrawn successfully!', receipt.hash);
      await refreshData();
      if (account && provider) fetchBalance(account, provider);
      return receipt;
    } catch (error) {
      console.error('withdrawProtocolFees error:', error);
      showToast('error', error.reason || error.message || 'Treasury withdrawal failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Listen to Account and Network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider) fetchBalance(accounts[0], provider);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (newChainHex) => {
        const newChainId = parseInt(newChainHex, 16);
        setChainId(newChainId);
        const isSupported =
          newChainId === ARBITRUM_SEPOLIA_CHAIN_ID || newChainId === HARDHAT_CHAIN_ID;
        setIsWrongNetwork(!isSupported);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider, fetchBalance]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isOwner,
    contractOwner,
    isConnecting,
    isWrongNetwork,
    projects,
    protocolStats,
    isLoadingData,
    txPending,
    toastMessage,
    connectWallet,
    disconnectWallet,
    switchToArbitrumSepolia,
    refreshData,
    createProject,
    fundProject,
    submitMilestone,
    approveMilestone,
    cancelProject,
    withdrawProtocolFees,
    showToast,
    closeToast,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}