import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { DEMO_ACCOUNTS, DEFAULT_ARBITRUM_SEPOLIA_RPC, CONTRACT_ADDRESS } from '../utils/constants';
import { shortenAddress } from '../utils/formatters';
import {
  X,
  Key,
  Globe,
  Radio,
  Check,
  ShieldCheck,
  Zap,
  ExternalLink,
  RefreshCw,
  User,
  Activity,
  AlertCircle,
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const {
    rpcUrl,
    updateRpcUrl,
    arbiscanApiKey,
    updateArbiscanApiKey,
    networkHealth,
    checkNetworkHealth,
    connectWithPrivateKey,
    isDemoWallet,
    activeDemoAccount,
    account,
    disconnectWallet,
    isConnecting,
  } = useWallet();

  const [activeTab, setActiveTab] = useState('demo'); // 'demo', 'rpc', 'arbiscan'
  const [customKey, setCustomKey] = useState('');
  const [tempRpc, setTempRpc] = useState(rpcUrl);
  const [tempApiKey, setTempApiKey] = useState(arbiscanApiKey);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  if (!isOpen) return null;

  // Handle Demo Key Connection
  const handleConnectCustomKey = async (e) => {
    e.preventDefault();
    if (!customKey.trim()) return;
    const success = await connectWithPrivateKey(customKey.trim(), 'Custom Key');
    if (success) {
      setCustomKey('');
      onClose();
    }
  };

  const handleSelectPreset = async (preset) => {
    const success = await connectWithPrivateKey(preset.privateKey, preset.name);
    if (success) {
      onClose();
    }
  };

  // Handle RPC Save & Ping
  const handleSaveRpc = async (e) => {
    e.preventDefault();
    await updateRpcUrl(tempRpc.trim());
  };

  const handlePingRpc = async () => {
    setIsPinging(true);
    setPingResult(null);
    const res = await checkNetworkHealth();
    setPingResult(res);
    setIsPinging(false);
  };

  // Handle Arbiscan Key Save
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    updateArbiscanApiKey(tempApiKey.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#141822] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        {/* Google 4-Color Accent Top Bar */}
        <div className="absolute top-0 left-8 right-8 h-1 google-gradient-bg rounded-t-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Developer & Demo Controls</span>
            </h2>
            <p className="text-xs text-slate-400">
              Demo private keys, Arbitrum Sepolia RPC, and Arbiscan configuration.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0e1118] border border-white/10 rounded-2xl mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Demo Wallets</span>
          </button>

          <button
            onClick={() => setActiveTab('rpc')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rpc'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>RPC Endpoint</span>
          </button>

          <button
            onClick={() => setActiveTab('arbiscan')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'arbiscan'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Arbiscan API</span>
          </button>
        </div>

        {/* TAB 1: DEMO WALLET ENTRY */}
        {activeTab === 'demo' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  1-Click Demo Personas
                </span>
                <span className="text-[11px] text-[#34A853] font-semibold">Instant Hackathon Testing</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Switch roles instantly without needing MetaMask approval popups:
              </p>

              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((preset, idx) => {
                  const isActive =
                    account && account.toLowerCase() === preset.address.toLowerCase();
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-[#4285F4]/15 border-[#4285F4] text-white shadow-md'
                          : 'bg-[#1a1f2c] border-white/5 hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
                          style={{ backgroundColor: `${preset.color}25`, color: preset.color }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{preset.name}</span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: `${preset.color}20`, color: preset.color }}
                            >
                              {preset.role}
                            </span>
                          </div>
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {shortenAddress(preset.address, 6)} • {preset.description}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#34A853]/20 text-[#81c995] text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-full bg-[#232936] text-xs font-semibold text-slate-300 group-hover:bg-[#4285F4] group-hover:text-white transition-colors"
                        >
                          Switch Role
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Private Key Entry */}
            <form onSubmit={handleConnectCustomKey} className="pt-4 border-t border-white/10 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Or Enter Custom Private Key (Local Memory Only)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Paste 0x... 64-char hex private key"
                  className="flex-1 gpay-input font-mono text-xs"
                />
                <button
                  type="submit"
                  disabled={!customKey.trim() || isConnecting}
                  className="gpay-btn-primary px-5 py-2.5 text-xs whitespace-nowrap disabled:opacity-50"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Key'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                🔒 Note: Private keys are held strictly in browser session memory and never transmitted to external servers.
              </p>
            </form>

            {isDemoWallet && (
              <div className="p-3.5 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-between text-xs">
                <span className="text-[#8ab4f8]">
                  Currently active as <strong>{activeDemoAccount?.name || 'Demo Account'}</strong>
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-rose-400 hover:underline font-semibold"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARBITRUM SEPOLIA RPC URL */}
        {activeTab === 'rpc' && (
          <form onSubmit={handleSaveRpc} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Arbitrum Sepolia RPC URL
              </label>
              <input
                type="text"
                value={tempRpc}
                onChange={(e) => setTempRpc(e.target.value)}
                placeholder="https://sepolia-rollup.arbitrum.io/rpc"
                className="w-full gpay-input font-mono text-xs mb-2"
              />
              <p className="text-xs text-slate-400">
                Default: <code className="text-[#8ab4f8]">{DEFAULT_ARBITRUM_SEPOLIA_RPC}</code>
              </p>
            </div>

            {/* Network Health Check */}
            <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Activity className="w-4 h-4 text-[#34A853]" />
                  <span>RPC Status & Ping</span>
                </span>
                <button
                  type="button"
                  onClick={handlePingRpc}
                  disabled={isPinging}
                  className="inline-flex items-center gap-1 text-[11px] text-[#4285F4] hover:underline font-semibold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>

              {networkHealth.isConnected ? (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Latency:</span>
                    <span className="text-[#34A853] font-bold">
                      {networkHealth.pingMs !== null ? `${networkHealth.pingMs} ms` : 'N/A'} (Healthy)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Block Height:</span>
                    <span className="text-white font-bold">
                      #{networkHealth.blockNumber || 'Syncing...'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/5 text-slate-400 text-[11px]">
                  Click "Test Connection" to check latency to Arbitrum Sepolia.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setTempRpc(DEFAULT_ARBITRUM_SEPOLIA_RPC)}
                className="gpay-btn-secondary px-4 py-2 text-xs"
              >
                Reset Default
              </button>
              <button type="submit" className="gpay-btn-primary px-6 py-2 text-xs">
                Save RPC URL
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ARBISCAN API KEY */}
        {activeTab === 'arbiscan' && (
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Arbiscan Sepolia API Key
              </label>
              <input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="e.g. ABC123XYZ456..."
                className="w-full gpay-input font-mono text-xs mb-2"
              />
              <p className="text-xs text-slate-400">
                Optional: Used for verified contract verification, automated ABI sync, and transaction lookups.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5 space-y-2 text-xs">
              <span className="text-slate-300 font-bold block">Contract Explorer Links:</span>
              <div className="space-y-1 font-mono text-[11px]">
                <a
                  href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4285F4] hover:underline flex items-center gap-1"
                >
                  <span>View PayTrust on Arbiscan Sepolia</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://arbiscan.io/apis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                  <span>Get a Free Arbiscan API Key</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button type="submit" className="gpay-btn-primary px-6 py-2 text-xs">
                Save API Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}