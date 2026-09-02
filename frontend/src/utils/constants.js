import contractConfig from '../contracts/contractConfig.json';

export const CONTRACT_ADDRESS = contractConfig.address || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ABI = contractConfig.abi || [];

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX = '0x66eee';

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_HEX = '0x7a69';

export const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX,
  chainName: 'Arbitrum Sepolia Testnet',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
};

export const PROTOCOL_FEE_BPS = 5;
export const BPS_DENOMINATOR = 10000;
export const PROTOCOL_FEE_PERCENT = '0.05%';

export const PROJECT_STATUS = {
  0: { label: 'Created', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  1: { label: 'Active (Funded)', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  2: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  3: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export const MILESTONE_STATUS = {
  0: { label: 'Pending', icon: '⏳', color: 'bg-slate-800/60 text-slate-400 border-slate-700' },
  1: { label: 'Submitted', icon: '🔵', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  2: { label: 'Paid', icon: '✓', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};