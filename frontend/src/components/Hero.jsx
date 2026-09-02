import React from 'react';
import { useWallet } from '../context/WalletContext';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Lock,
  Zap,
  Coins,
  Sparkles,
} from 'lucide-react';
import { PROTOCOL_FEE_PERCENT } from '../utils/constants';

export default function Hero({ onOpenCreate, onLaunchApp }) {
  const { account, connectWallet } = useWallet();

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/15 via-cyan-500/10 to-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Network & Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-medium mb-8 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Live on Arbitrum Sepolia</span>
          <span className="w-1 h-1 rounded-full bg-teal-400"></span>
          <span className="font-mono text-[11px] text-teal-200">0.05% Protocol Fee</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          <span className="block mb-2">Decentralized Escrow for</span>
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            Freelancers & Clients
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-medium text-slate-300 mb-6">
          Secure payments. Trustless milestones.
        </p>

        {/* Sub-description */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
          PayTrust eliminates intermediary trust issues with smart contract-enforced milestone payouts.
          Clients lock project funds in escrow; freelancers submit milestones with confidence; funds are released instantly upon approval.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch App Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-base transition-all hover:border-teal-500/30"
            >
              <Zap className="w-5 h-5 text-teal-400" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <button
              onClick={onOpenCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold text-base transition-all"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Workflow Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-20">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase mb-2">
              HOW PAYTRUST WORKS
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Trustless Milestone Lifecycle
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 relative group hover:border-teal-500/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Create Project</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client specifies freelancer wallet, title, and milestone deliverables with ETH amounts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 relative group hover:border-teal-500/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Lock Escrow</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client deposits the total ETH value into the PayTrust smart contract escrow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 relative group hover:border-teal-500/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Submit Milestone</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Freelancer completes work and triggers milestone submission on-chain.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 relative group hover:border-teal-500/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Client Approval</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client reviews deliverables and signs one-click approval on Arbitrum.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/5 relative group hover:border-teal-500/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold mb-3">
                5
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Auto Payout</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                99.95% flows to freelancer wallet, 0.05% accumulates in the Protocol Treasury.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem vs The Solution Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {/* The Problem */}
        <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-500/20 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">The Trust Problem</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Traditional freelance platforms charge 10%–20% in hefty fees, withhold payments for weeks, and act as opaque centralized middlemen.
          </p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>Clients worry:</strong> "What if I pay upfront and the freelancer never delivers?"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>Freelancers worry:</strong> "What if I complete the work and the client ghosts or refuses to pay?"</span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="p-8 rounded-3xl bg-teal-950/20 border border-teal-500/20 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">The PayTrust Solution</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            A transparent smart contract acts as the impartial escrow. Funds are securely locked on Arbitrum Sepolia before work starts, guaranteeing fair settlement.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Guaranteed Escrow:</strong> Freelancers see funds locked in the contract before writing code.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Milestone Autonomy:</strong> Payments released incrementally as each deliverable is verified.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Ultra-Low 0.05% Fee:</strong> 99.95% goes directly to the creator.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Protocol Fee Spotlight */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1322] border border-teal-500/30 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Coins className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Transparent 0.05% Protocol Fee</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  PayTrust charges a <strong>0.05% protocol fee</strong> on every successfully released milestone payment. Fees accumulate in the protocol treasury and can be withdrawn by the protocol owner.
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0 bg-slate-950/60 p-4 rounded-xl border border-white/5">
              <span className="block text-2xl font-extrabold text-teal-300 font-mono">0.05%</span>
              <span className="block text-[11px] text-slate-400 font-mono">5 BPS / Payout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}