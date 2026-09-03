import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, formatEth, formatDate, calculateFeeAndPayout } from '../utils/formatters';
import { PROJECT_STATUS, MILESTONE_STATUS, PROTOCOL_FEE_PERCENT, DEMO_ACCOUNTS } from '../utils/constants';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Coins,
  Send,
  Check,
  Ban,
  ExternalLink,
  Users,
  Sparkles,
} from 'lucide-react';

export default function ProjectDetailsModal({ project, isOpen, onClose }) {
  const {
    account,
    fundProject,
    submitMilestone,
    approveMilestone,
    cancelProject,
    connectWithPrivateKey,
    txPending,
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
        'Are you sure you want to cancel this project? Any remaining unreleased escrow funds will be immediately refunded to the client.'
      )
    ) {
      try {
        await cancelProject(project.id);
      } catch (err) {}
    }
  };

  // Quick Switch Persona Helper
  const handleQuickSwitchTo = (targetAddress) => {
    const matched = DEMO_ACCOUNTS.find(
      (d) => d.address.toLowerCase() === targetAddress.toLowerCase()
    );
    if (matched) {
      connectWithPrivateKey(matched.privateKey, matched.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#141822] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        {/* Google 4-Color Accent Top Bar */}
        <div className="absolute top-0 left-8 right-8 h-1 google-gradient-bg rounded-t-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Details */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-[#11141c] border border-white/10 text-xs font-mono font-semibold text-slate-400">
              Project #{project.id}
            </span>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.color}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.dot }}
              />
              <span>{statusConfig.label}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Created: {formatDate(project.createdAt)}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>

          {/* User Role Indicator with Quick Persona Switch Option */}
          <div className="flex items-center gap-2 flex-wrap">
            {isClient && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4285F4]/20 text-[#8ab4f8] border border-[#4285F4]/40">
                You are currently the Client
              </span>
            )}
            {isFreelancer && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#34A853]/20 text-[#81c995] border border-[#34A853]/40">
                You are currently the Freelancer
              </span>
            )}
            {!isClient && !isFreelancer && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                  Observer Mode
                </span>
                <button
                  onClick={() => handleQuickSwitchTo(project.client)}
                  className="text-xs text-[#4285F4] hover:underline font-semibold"
                >
                  Switch to Client
                </button>
                <span>•</span>
                <button
                  onClick={() => handleQuickSwitchTo(project.freelancer)}
                  className="text-xs text-[#34A853] hover:underline font-semibold"
                >
                  Switch to Freelancer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Total Escrow Value
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {formatEth(project.totalAmount)} <span className="text-xs text-[#4285F4]">ETH</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Paid Out
            </span>
            <span className="text-xl font-bold text-[#81c995] font-mono">
              {formatEth(project.paidAmount)} <span className="text-xs text-[#81c995]">ETH</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5">
            <span className="block text-[11px] text-slate-400 font-mono uppercase">
              Milestone Progress
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {paidCount} / {totalMilestones} Paid
            </span>
          </div>
        </div>

        {/* Addresses Banner */}
        <div className="p-4 rounded-2xl bg-[#0e1118] border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-6">
          <div>
            <span className="text-slate-400 block mb-1 font-sans font-semibold">
              Client Address:
            </span>
            <a
              href={`https://sepolia.arbiscan.io/address/${project.client}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8ab4f8] hover:underline flex items-center gap-1"
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
              className="text-[#81c995] hover:underline flex items-center gap-1"
            >
              <span>{project.freelancer}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Client Top-Level Actions (Fund / Deposit) */}
        {isClient && project.status === 0 && (
          <div className="p-5 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="font-bold text-white text-sm">Deposit Project Escrow</h4>
              <p className="text-xs text-slate-400">
                Lock {formatEth(project.totalAmount)} ETH into the smart contract to activate the project.
              </p>
            </div>
            <button
              onClick={handleFund}
              disabled={txPending}
              className="w-full sm:w-auto gpay-btn-primary px-6 py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Fund Escrow ({formatEth(project.totalAmount)} ETH)</span>
            </button>
          </div>
        )}

        {/* Milestones Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
            Milestone Deliverables & Status
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {project.milestones.map((m, idx) => {
              const msConfig = MILESTONE_STATUS[m.status] || MILESTONE_STATUS[0];
              const { fee, payout } = calculateFeeAndPayout(formatEth(m.amount));
              const isActionLoading = txPending && activeActionIndex === idx;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0e1118] border border-white/5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#141822] border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-[#4285F4]">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{m.description}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>Amount: {formatEth(m.amount)} ETH</span>
                          <span>•</span>
                          <span>Fee (0.05%): {fee} ETH</span>
                          <span>•</span>
                          <span className="text-[#81c995] font-semibold">Payout: {payout} ETH</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border self-start sm:self-center ${msConfig.color}`}
                    >
                      {msConfig.icon} {msConfig.label}
                    </span>
                  </div>

                  {/* Contextual Action Button */}
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-400">
                      {m.status === 1 && m.submissionTime > 0 && (
                        <span>Submitted on {formatDate(m.submissionTime)}</span>
                      )}
                      {m.status === 2 && m.paidTime > 0 && (
                        <span className="text-[#81c995] flex items-center gap-1 font-mono font-semibold">
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
                        className="w-full sm:w-auto gpay-btn-primary px-4 py-1.5 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                        className="w-full sm:w-auto bg-[#34A853] hover:bg-[#2e944b] text-white rounded-full px-5 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-gpay-green transition-all"
                      >
                        {isActionLoading ? (
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EA4335]/30 hover:bg-[#EA4335]/15 text-[#f28b82] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Project & Refund Escrow</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="gpay-btn-secondary px-6 py-2.5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}