import contractConfig from '../contracts/contractConfig.json';

export const CONTRACT_ADDRESS = contractConfig.address || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ABI = contractConfig.abi || [];

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_HEX = '0x66eee';

export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_HEX = '0x7a69';

export const DEFAULT_ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
export const DEFAULT_ARBISCAN_API_KEY = '';

export const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX,
  chainName: 'Arbitrum Sepolia Testnet',
  nativeCurrency: {
    name: 'Arbitrum Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [DEFAULT_ARBITRUM_SEPOLIA_RPC],
  blockExplorerUrls: ['https://sepolia.arbiscan.io'],
};

export const PROTOCOL_FEE_BPS = 5;
export const BPS_DENOMINATOR = 10000;
export const PROTOCOL_FEE_PERCENT = '0.05%';

// Demo Accounts for Quick 1-Click Simulation
export const DEMO_ACCOUNTS = [
  {
    role: 'Client (Project Creator)',
    name: 'Alice (Client)',
    description: 'Creates projects & approves deliverables',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    color: '#4285F4', // Google Blue
  },
  {
    role: 'Freelancer (Developer)',
    name: 'Bob (Freelancer)',
    description: 'Submits completed milestones for payout',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb219e863dac274e33e54165251483728914142',
    color: '#34A853', // Google Green
  },
  {
    role: 'Protocol Owner',
    name: 'PayTrust Treasury Admin',
    description: 'Deploys contract & withdraws protocol fees',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    color: '#FBBC04', // Google Yellow
  },
];

// Google Pay Style Status Badges
export const PROJECT_STATUS = {
  0: { label: 'Created (Unfunded)', color: 'bg-[#FBBC04]/15 text-[#fbbc04] border-[#FBBC04]/30', dot: '#FBBC04' },
  1: { label: 'Active Escrow', color: 'bg-[#4285F4]/15 text-[#8ab4f8] border-[#4285F4]/30', dot: '#4285F4' },
  2: { label: 'Completed', color: 'bg-[#34A853]/15 text-[#81c995] border-[#34A853]/30', dot: '#34A853' },
  3: { label: 'Cancelled / Refunded', color: 'bg-[#EA4335]/15 text-[#f28b82] border-[#EA4335]/30', dot: '#EA4335' },
};

export const MILESTONE_STATUS = {
  0: { label: 'Pending', icon: '⏳', color: 'bg-slate-800 text-slate-400 border-slate-700' },
  1: { label: 'Submitted', icon: '🔵', color: 'bg-[#4285F4]/15 text-[#8ab4f8] border-[#4285F4]/30' },
  2: { label: 'Paid (99.95%)', icon: '✓', color: 'bg-[#34A853]/15 text-[#81c995] border-[#34A853]/30' },
};