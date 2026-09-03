import React from 'react';
import { useWallet } from '../context/WalletContext';
import FeeCalculatorWidget from './FeeCalculatorWidget';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Lock,
  Zap,
  Coins,
  Sparkles,
  Key,
} from 'lucide-react';
import { PROTOCOL_FEE_PERCENT } from '../utils/constants';

export default function Hero({ onOpenCreate, onLaunchApp, onOpenSettings, onOpenCreateWithAmount }) {
  const { account, connectWallet } = useWallet();

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      {/* Google Pay Blue & Quad-Color Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#4285F4]/15 via-[#FBBC04]/10 to-[#34A853]/15 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Network & Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#171b24] text-slate-200 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
          <span>Live on Arbitrum Sepolia</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-[#8ab4f8]">0.05% Protocol Fee</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          <span className="block mb-2">Decentralized Escrow with</span>
          <span className="google-gradient-text">
            Trustless Milestone Payouts
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl font-semibold text-slate-200 mb-6">
          Secure payments. Trustless milestones.
        </p>

        {/* Sub-description */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
          PayTrust eliminates intermediary trust issues with smart contract-enforced milestone payouts.
          Clients deposit escrow safely on Arbitrum; freelancers build with confidence; funds are released instantly upon approval with a transparent <strong>0.05% protocol fee</strong>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto gpay-btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 shadow-gpay-blue"
          >
            <span>Launch App Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full sm:w-auto gpay-btn-secondary px-8 py-4 text-base flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-[#4285F4]" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <button
              onClick={onOpenCreate}
              className="w-full sm:w-auto gpay-btn-secondary px-8 py-4 text-base flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#34A853]" />
              <span>Create New Project</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto gpay-btn-secondary px-6 py-4 text-sm flex items-center justify-center gap-2 text-slate-400 hover:text-white"
          >
            <Key className="w-4 h-4 text-[#FBBC04]" />
            <span>Demo Keys & RPC</span>
          </button>
        </div>
      </div>

      {/* Interactive Fee Calculator Widget Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <FeeCalculatorWidget onOpenCreateWithAmount={onOpenCreateWithAmount} />
      </div>

      {/* Visual Workflow Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 sm:p-10 rounded-3xl gpay-card border border-white/10 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#4285F4] uppercase mb-2">
              HOW PAYTRUST WORKS
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Trustless Milestone Lifecycle
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/5 group hover:border-[#4285F4] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Create Project</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client specifies freelancer wallet, title, and milestone deliverables with ETH amounts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/5 group hover:border-[#FBBC04] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#FBBC04]/15 border border-[#FBBC04]/30 flex items-center justify-center text-[#FBBC04] font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Lock Escrow</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client deposits the total ETH value into the PayTrust smart contract escrow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/5 group hover:border-[#4285F4] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Submit Work</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Freelancer completes work and triggers milestone submission on-chain.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/5 group hover:border-[#34A853] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#34A853]/15 border border-[#34A853]/30 flex items-center justify-center text-[#34A853] font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold text-white text-sm mb-1">Client Approval</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client reviews deliverables and signs one-click approval on Arbitrum.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-[#11141c] border border-white/5 group hover:border-[#34A853] transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#34A853]/15 border border-[#34A853]/30 flex items-center justify-center text-[#34A853] font-bold mb-3">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* The Problem */}
        <div className="p-8 rounded-3xl bg-[#2a1317]/40 border border-[#EA4335]/25 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">The Trust Dilemma</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Traditional freelance platforms charge 10%–20% in commission fees, withhold payments for weeks, and act as opaque middlemen.
          </p>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-[#EA4335] font-bold">✕</span>
              <span><strong>Clients worry:</strong> "What if I pay upfront and the freelancer never delivers?"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#EA4335] font-bold">✕</span>
              <span><strong>Freelancers worry:</strong> "What if I complete the work and the client refuses to pay?"</span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="p-8 rounded-3xl bg-[#0f241a]/40 border border-[#34A853]/25 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">The PayTrust Solution</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            A transparent smart contract acts as the impartial escrow. Funds are securely locked on Arbitrum Sepolia before work starts.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
              <span><strong>Guaranteed Escrow:</strong> Freelancers see funds locked in the contract before writing code.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
              <span><strong>Milestone Autonomy:</strong> Payments released incrementally as each deliverable is verified.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
              <span><strong>Ultra-Low 0.05% Fee:</strong> 99.95% goes directly to the freelancer.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}