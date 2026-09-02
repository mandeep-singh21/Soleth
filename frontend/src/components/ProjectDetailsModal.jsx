import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, formatEth, formatDate, calculateFeeAndPayout } from '../utils/formatters';
import { PROJECT_STATUS, MILESTONE_STATUS, PROTOCOL_FEE_PERCENT } from '../utils/constants';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Coins,
  AlertTriangle,
  User,
  ArrowUpRight,
  ExternalLink,
  Ban,
  Check,
} from 'lucide-react';

export default function ProjectDetailsModal({ project, isOpen, onClose }) {
  const {
    account,
    fundProject,
    submitMilestone,
    approveMilestone,
    cancelProject,
    txPending,
    connectWallet,
  } = useWallet();

  const [activeActionIndex, setActiveActionIndex] = useState(null);

  if (!isOpen || !project) return null;

  const isClient = account && project.client.toLowerCase() === account.toLowerCase();
  const isFreelancer = account && project.freelancer.toLowerCase() === account.toLowerCase();
  const statusConfig = PROJECT_STATUS[project.status] || PROJECT_STATUS[0];

  const paidCount = project.milestones.filter((m) => m.status === 2).length;
  const totalMilestones = project.milestones.length;

  // Handlers
  const handleFund = async () => {
    try {
      await fundProject(project.id, project.totalAmount);
    } catch (err) {}
  };

  const handleSubmitMilestone = async (milestoneIndex) => {
    try {
      setActiveActionIndex(milestoneIndex);
      await submitMilestone(project.id, milestoneIndex);
    } catch (err) {
    } finally {
      setActiveActionIndex(null);
    }
  };

  const handleApproveMilestone = async (milestoneIndex) => {
    try {
      setActiveActionIndex(milestoneIndex);
      await approveMilestone(project.id, milestoneIndex);
    } catch (err) {
    } finally {
      setActiveActionIndex(null);
    }
  };

  const handleCancel = async () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this project? Any remaining unreleased escrow funds will be immediately refunded to your wallet.'
      )
    ) {
      try {
        await cancelProject(project.id);
      } catch (err) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0d1322] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Details */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-medium text-slate-400">
              Project #{project.id}
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Created: {formatDate(project.createdAt)}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>

          {/* User Role Indicator */}
          <div className="flex items-center gap-2">
            {isClient && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                You are the Client
              </span>
            )}
            {isFreelancer && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                You are the Freelancer
              </span>
            )}
            {!isClient && !isFreelancer && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400">
                Observer View
              </span>
            )}
          </div>
        </div>

        {/* Financial & Escrow Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Total Escrow
            </span>
            <span className="text-lg font-bold text-teal-300 font-mono">
              {formatEth(project.totalAmount)} ETH
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Released Payments
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {formatEth(project.paidAmount)} ETH
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Milestone Progress
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {paidCount} / {totalMilestones} Paid
            </span>
          </div>
        </div>

        {/* Addresses Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-6">
          <div>
            <span className="text-slate-400 block mb-1 font-sans font-semibold">
              Client Address:
            </span>
            <a
              href={`https://sepolia.arbiscan.io/address/${project.client}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:underline flex items-center gap-1"
            >
              <span>{project.client}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 font-sans font-semibold">
              Freelancer Address:
            </span>
            <a
              href={`https://sepolia.arbiscan.io/address/${project.freelancer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline flex items-center gap-1"
            >
              <span>{project.freelancer}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Client Top-Level Actions (Fund / Cancel) */}
        {isClient && project.status === 0 && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-bold text-white text-sm">Deposit Project Escrow</h4>
              <p className="text-xs text-slate-400">
                Lock {formatEth(project.totalAmount)} ETH into the smart contract to activate the project.
              </p>
            </div>
            <button
              onClick={handleFund}
              disabled={txPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Fund Escrow ({formatEth(project.totalAmount)} ETH)</span>
            </button>
          </div>
        )}

        {/* Milestones Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Milestone Schedule & Deliverables
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {project.milestones.map((m, idx) => {
              const msConfig = MILESTONE_STATUS[m.status] || MILESTONE_STATUS[0];
              const { fee, payout } = calculateFeeAndPayout(formatEth(m.amount));
              const isActionLoading = txPending && activeActionIndex === idx;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-teal-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{m.description}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>Amount: {formatEth(m.amount)} ETH</span>
                          <span>•</span>
                          <span>Fee (0.05%): {fee} ETH</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Payout: {payout} ETH</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border self-start sm:self-center ${msConfig.color}`}
                    >
                      {msConfig.icon} {msConfig.label}
                    </span>
                  </div>

                  {/* Contextual Action Button for Milestone */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-400">
                      {m.status === 1 && m.submissionTime > 0 && (
                        <span>Submitted on {formatDate(m.submissionTime)}</span>
                      )}
                      {m.status === 2 && m.paidTime > 0 && (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid on {formatDate(m.paidTime)} (99.95% Payout / 0.05% Treasury)</span>
                        </span>
                      )}
                      {m.status === 0 && (
                        <span>Awaiting milestone completion & submission</span>
                      )}
                    </div>

                    {/* Freelancer Submit Button */}
                    {isFreelancer && project.status === 1 && m.status === 0 && (
                      <button
                        onClick={() => handleSubmitMilestone(idx)}
                        disabled={txPending}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Submit Work</span>
                      </button>
                    )}

                    {/* Client Approve & Pay Button */}
                    {isClient && project.status === 1 && m.status === 1 && (
                      <button
                        onClick={() => handleApproveMilestone(idx)}
                        disabled={txPending}
                        className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Release Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions (Cancellation / Close) */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            {isClient && (project.status === 0 || project.status === 1) && (
              <button
                onClick={handleCancel}
                disabled={txPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Project & Refund</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}