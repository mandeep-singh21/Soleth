import React from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/formatters';
import { ARBITRUM_SEPOLIA_CHAIN_ID, HARDHAT_CHAIN_ID } from '../utils/constants';
import {
  ShieldCheck,
  Wallet,
  AlertCircle,
  Plus,
  Landmark,
  RefreshCw,
  Settings,
  Zap,
} from 'lucide-react';

export default function Navbar({
  onOpenCreate,
  onOpenTreasury,
  onOpenSettings,
  currentView,
  setCurrentView,
}) {
  const {
    account,
    balance,
    chainId,
    isOwner,
    isWrongNetwork,
    isConnecting,
    isLoadingData,
    isDemoWallet,
    activeDemoAccount,
    connectWallet,
    disconnectWallet,
    switchToArbitrumSepolia,
    refreshData,
  } = useWallet();

  const isArbitrum = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;
  const isLocal = chainId === HARDHAT_CHAIN_ID;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0e1017]/90 backdrop-blur-xl">
      {/* Top Google 4-Color Accent Line */}
      <div className="h-0.5 google-gradient-bg w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#171b24] border border-white/10 p-0.5 shadow-md flex items-center justify-center group-hover:border-[#4285F4] transition-all">
              <ShieldCheck className="w-6 h-6 text-[#4285F4]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">
                  Pay<span className="text-[#4285F4]">Trust</span>
                </span>
                
              </div>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider font-semibold">
                ARBITRUM MILESTONE ESCROW
              </span>
            </div>
          </button>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-[#141822] p-1 rounded-full border border-white/5">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentView === 'landing'
                  ? 'bg-[#1a73e8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-[#1a73e8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        {/* Actions & Wallet Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh button */}
          <button
            onClick={refreshData}
            title="Refresh on-chain data"
            className="p-2.5 rounded-full border border-white/10 bg-[#171b24] text-slate-400 hover:text-white hover:border-[#4285F4] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#4285F4]' : ''}`} />
          </button>

          {/* Settings / RPC / Demo Key Modal Trigger */}
          <button
            onClick={onOpenSettings}
            title="Network RPC & Demo Private Key Config"
            className="p-2.5 rounded-full border border-white/10 bg-[#171b24] text-slate-300 hover:text-[#4285F4] hover:border-[#4285F4] transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Protocol Treasury / Admin */}
          <button
            onClick={onOpenTreasury}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#171b24] hover:border-[#4285F4] text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Landmark className="w-4 h-4 text-[#FBBC04]" />
            <span>Treasury</span>
            {isOwner && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FBBC04]/20 text-[#fbbc04] font-bold">
                Owner
              </span>
            )}
          </button>

          {/* Create Project Button */}
          <button
            onClick={onOpenCreate}
            className="gpay-btn-primary px-4 sm:px-5 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">Create</span>
          </button>

          {/* Wallet State */}
          {!account ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="gpay-btn-secondary px-4 py-2 text-xs flex items-center gap-2"
              >
                <Wallet className="w-4 h-4 text-[#4285F4]" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            </div>
          ) : isWrongNetwork ? (
            <button
              onClick={switchToArbitrumSepolia}
              className="px-4 py-2 rounded-full bg-[#EA4335]/20 border border-[#EA4335]/40 text-[#f28b82] text-xs font-semibold hover:bg-[#EA4335]/30 transition-all animate-pulse flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-[#EA4335]" />
              <span>Switch to Arb Sepolia</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#171b24] border border-white/10 rounded-full p-1 pl-3.5 text-xs">
              <div className="flex items-center gap-2 pr-2 border-r border-white/10 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#34A853] shadow-sm shadow-[#34A853]"></span>
                <span className="text-slate-300 hidden md:inline">
                  {isDemoWallet ? (
                    <span className="text-[#8ab4f8] font-sans font-semibold">
                      {activeDemoAccount?.name || 'Demo'}
                    </span>
                  ) : isArbitrum ? (
                    'Arb Sepolia'
                  ) : isLocal ? (
                    'Hardhat'
                  ) : (
                    'Custom'
                  )}
                </span>
                <span className="text-[#8ab4f8] font-bold">{parseFloat(balance).toFixed(3)} ETH</span>
              </div>
              <button
                onClick={disconnectWallet}
                title="Click to disconnect"
                className="px-3 py-1 rounded-full bg-[#232936] hover:bg-[#EA4335]/20 hover:text-[#f28b82] text-slate-300 font-mono text-[11px] transition-colors"
              >
                {shortenAddress(account)}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}