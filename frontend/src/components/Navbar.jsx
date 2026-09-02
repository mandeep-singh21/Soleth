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
} from 'lucide-react';

export default function Navbar({ onOpenCreate, onOpenTreasury, currentView, setCurrentView }) {
  const {
    account,
    balance,
    chainId,
    isOwner,
    isWrongNetwork,
    isConnecting,
    isLoadingData,
    connectWallet,
    disconnectWallet,
    switchToArbitrumSepolia,
    refreshData,
  } = useWallet();

  const isArbitrum = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;
  const isLocal = chainId === HARDHAT_CHAIN_ID;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080b11]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
              <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
                PayTrust
              </span>
              <span className="block text-[10px] text-teal-400 font-mono tracking-wider font-semibold">
                ARBITRUM ESCROW
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'landing'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              App Dashboard
            </button>
          </nav>
        </div>

        {/* Actions & Wallet Bar */}
        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={refreshData}
            title="Refresh on-chain data"
            className="p-2 rounded-xl border border-white/5 bg-slate-900/40 text-slate-400 hover:text-white hover:border-teal-500/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* Protocol Treasury / Admin */}
          <button
            onClick={onOpenTreasury}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/5 bg-slate-900/40 hover:border-teal-500/30 text-xs font-medium text-slate-300 hover:text-teal-300 transition-all"
          >
            <Landmark className="w-4 h-4 text-teal-400" />
            <span>Protocol Treasury</span>
            {isOwner && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Owner
              </span>
            )}
          </button>

          {/* Create Project Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">Create</span>
          </button>

          {/* Wallet State */}
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold transition-all shadow-sm"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          ) : isWrongNetwork ? (
            <button
              onClick={switchToArbitrumSepolia}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-500/30 transition-all animate-pulse"
            >
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Switch to Arb Sepolia</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-xl p-1 pl-3 text-xs">
              <div className="flex items-center gap-2 pr-2 border-r border-white/10 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                <span className="text-slate-300 hidden md:inline">
                  {isArbitrum ? 'Arb Sepolia' : isLocal ? 'Local Hardhat' : 'Custom'}
                </span>
                <span className="text-teal-300 font-semibold">{parseFloat(balance).toFixed(3)} ETH</span>
              </div>
              <button
                onClick={disconnectWallet}
                title="Click to disconnect"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 font-mono text-[11px] transition-colors"
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