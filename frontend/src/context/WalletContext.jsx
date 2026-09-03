import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_SEPOLIA_HEX,
  ARBITRUM_SEPOLIA_PARAMS,
  HARDHAT_CHAIN_ID,
  DEFAULT_ARBITRUM_SEPOLIA_RPC,
  DEFAULT_ARBISCAN_API_KEY,
  DEMO_ACCOUNTS,
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

  // Demo Wallet & Private Key Entry
  const [isDemoWallet, setIsDemoWallet] = useState(false);
  const [activeDemoAccount, setActiveDemoAccount] = useState(null);

  // Custom RPC URL & Arbiscan API Key
  const [rpcUrl, setRpcUrl] = useState(() => {
    return localStorage.getItem('paytrust_rpc_url') || DEFAULT_ARBITRUM_SEPOLIA_RPC;
  });
  const [arbiscanApiKey, setArbiscanApiKey] = useState(() => {
    return localStorage.getItem('paytrust_arbiscan_key') || DEFAULT_ARBISCAN_API_KEY;
  });
  const [networkHealth, setNetworkHealth] = useState({
    isConnected: false,
    pingMs: null,
    blockNumber: null,
  });

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

  // Initialize Active Fallback RPC Provider
  const getFallbackProvider = useCallback(() => {
    return new ethers.JsonRpcProvider(rpcUrl);
  }, [rpcUrl]);

  // Test and Ping RPC Network
  const checkNetworkHealth = useCallback(async () => {
    try {
      const start = Date.now();
      const testProv = new ethers.JsonRpcProvider(rpcUrl);
      const block = await testProv.getBlockNumber();
      const latency = Date.now() - start;
      setNetworkHealth({
        isConnected: true,
        pingMs: latency,
        blockNumber: block,
      });
      return { isConnected: true, latency, block };
    } catch (err) {
      console.warn('RPC Ping error:', err);
      setNetworkHealth({
        isConnected: false,
        pingMs: null,
        blockNumber: null,
      });
      return { isConnected: false, error: err.message };
    }
  }, [rpcUrl]);

  // Update RPC URL with test
  const updateRpcUrl = useCallback(async (newUrl) => {
    try {
      const testProv = new ethers.JsonRpcProvider(newUrl);
      await testProv.getBlockNumber();
      setRpcUrl(newUrl);
      localStorage.setItem('paytrust_rpc_url', newUrl);
      showToast('success', 'Arbitrum Sepolia RPC URL updated successfully!');
      return true;
    } catch (err) {
      showToast('error', `RPC Connection Failed: ${err.message}`);
      return false;
    }
  }, [showToast]);

  // Update Arbiscan API Key
  const updateArbiscanApiKey = useCallback((newKey) => {
    setArbiscanApiKey(newKey);
    localStorage.setItem('paytrust_arbiscan_key', newKey);
    showToast('success', 'Arbiscan API Key saved!');
  }, [showToast]);

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
      if (!walletAddress) return;
      const activeProv = ethProvider || provider || getFallbackProvider();
      const balWei = await activeProv.getBalance(walletAddress);
      setBalance(ethers.formatEther(balWei));
    } catch (err) {
      console.warn('Error fetching balance:', err);
    }
  }, [provider, getFallbackProvider]);

  // Fetch All Projects & Protocol Stats from Contract
  const refreshData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const contract = getContract();

      // Check Network Health
      checkNetworkHealth();

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

        setProjects(loadedProjects.reverse());
      } catch (projErr) {
        console.warn('Error fetching all projects:', projErr);
      }
    } catch (error) {
      console.error('Error in refreshData:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [account, getContract, checkNetworkHealth]);

  // Connect via MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showToast('error', 'MetaMask is not installed. You can also use Demo Private Key entry!');
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
      setIsDemoWallet(false);
      setActiveDemoAccount(null);

      const isSupported =
        currentChainId === ARBITRUM_SEPOLIA_CHAIN_ID || currentChainId === HARDHAT_CHAIN_ID;
      setIsWrongNetwork(!isSupported);

      await fetchBalance(accounts[0], browserProvider);
      showToast('success', `MetaMask Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
    } catch (err) {
      console.error('Wallet connection error:', err);
      showToast('error', err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect via Demo Private Key (Arbitrum Sepolia or Local)
  const connectWithPrivateKey = async (privateKey, label = 'Demo Account') => {
    try {
      setIsConnecting(true);
      const cleanKey = privateKey.trim().startsWith('0x') ? privateKey.trim() : `0x${privateKey.trim()}`;
      const activeProv = getFallbackProvider();
      const demoWallet = new ethers.Wallet(cleanKey, activeProv);

      setProvider(activeProv);
      setSigner(demoWallet);
      setAccount(demoWallet.address);
      setChainId(ARBITRUM_SEPOLIA_CHAIN_ID);
      setIsWrongNetwork(false);
      setIsDemoWallet(true);

      const matchedPreset = DEMO_ACCOUNTS.find(
        (d) => d.address.toLowerCase() === demoWallet.address.toLowerCase()
      );
      setActiveDemoAccount(matchedPreset || { name: label, address: demoWallet.address });

      await fetchBalance(demoWallet.address, activeProv);
      showToast('success', `Connected as ${matchedPreset ? matchedPreset.name : 'Custom Demo Wallet'}: ${demoWallet.address.substring(0, 6)}...`);
      return true;
    } catch (err) {
      console.error('Private key connection failed:', err);
      showToast('error', `Invalid Private Key: ${err.message}`);
      return false;
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
    setIsDemoWallet(false);
    setActiveDemoAccount(null);
    showToast('info', 'Wallet disconnected');
  };

  // Smart Contract Actions
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
      if (account) fetchBalance(account);
      return receipt;
    } catch (error) {
      console.error('fundProject error:', error);
      showToast('error', error.reason || error.message || 'Funding failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  const submitMilestone = async (projectId, milestoneIndex) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.submitMilestone(projectId, milestoneIndex);
      showToast('info', 'Submitting milestone completion...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Milestone #${milestoneIndex + 1} submitted for review!`, receipt.hash);
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

  const approveMilestone = async (projectId, milestoneIndex) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getContract(signer);
      const tx = await contract.approveMilestone(projectId, milestoneIndex);
      showToast('info', 'Approving milestone & releasing payment...', tx.hash);
      const receipt = await tx.wait();
      showToast('success', `Milestone #${milestoneIndex + 1} approved! 99.95% sent to freelancer, 0.05% protocol fee collected.`, receipt.hash);
      await refreshData();
      if (account) fetchBalance(account);
      return receipt;
    } catch (error) {
      console.error('approveMilestone error:', error);
      showToast('error', error.reason || error.message || 'Milestone approval failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

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
      if (account) fetchBalance(account);
      return receipt;
    } catch (error) {
      console.error('cancelProject error:', error);
      showToast('error', error.reason || error.message || 'Cancellation failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

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
      if (account) fetchBalance(account);
      return receipt;
    } catch (error) {
      console.error('withdrawProtocolFees error:', error);
      showToast('error', error.reason || error.message || 'Treasury withdrawal failed');
      throw error;
    } finally {
      setTxPending(false);
    }
  };

  // Listen to MetaMask account / chain changes
  useEffect(() => {
    if (window.ethereum && !isDemoWallet) {
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
  }, [provider, fetchBalance, isDemoWallet]);

  // Initial Data Load & Network Check
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
    isDemoWallet,
    activeDemoAccount,
    rpcUrl,
    arbiscanApiKey,
    networkHealth,
    projects,
    protocolStats,
    isLoadingData,
    txPending,
    toastMessage,
    connectWallet,
    connectWithPrivateKey,
    disconnectWallet,
    switchToArbitrumSepolia,
    updateRpcUrl,
    updateArbiscanApiKey,
    checkNetworkHealth,
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