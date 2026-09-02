import React from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, formatEth, formatDate } from '../utils/formatters';
import { PROJECT_STATUS, MILESTONE_STATUS } from '../utils/constants';
import {
  ChevronRight,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
} from 'lucide-react';

export default function ProjectCard({ project, onSelect }) {
  const { account } = useWallet();

  const isClient = account && project.client.toLowerCase() === account.toLowerCase();
  const isFreelancer = account && project.freelancer.toLowerCase() === account.toLowerCase();

  const statusConfig = PROJECT_STATUS[project.status] || PROJECT_STATUS[0];

  // Calculate Progress
  const paidCount = project.milestones.filter((m) => m.status === 2).length;
  const submittedCount = project.milestones.filter((m) => m.status === 1).length;
  const pendingCount = project.milestones.filter((m) => m.status === 0).length;
  const totalMilestones = project.milestones.length;
  const progressPercent = totalMilestones > 0 ? (paidCount / totalMilestones) * 100 : 0;

  return (
    <div
      onClick={() => onSelect(project)}
      className="p-6 rounded-2xl glass-panel glass-panel-hover border transition-all cursor-pointer group relative flex flex-col justify-between"
    >
      {/* Top Meta */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono font-medium text-slate-400">
              #{project.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* User Role Tag */}
          <div className="flex items-center gap-1.5">
            {isClient && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                You (Client)
              </span>
            )}
            {isFreelancer && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                You (Freelancer)
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors mb-2 line-clamp-1">
          {project.name}
        </h3>

        {/* Addresses */}
        <div className="space-y-1 text-xs text-slate-400 mb-4 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Client:</span>
            <span className="text-slate-300">{shortenAddress(project.client)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Freelancer:</span>
            <span className="text-slate-300">{shortenAddress(project.freelancer)}</span>
          </div>
        </div>

        {/* Milestone Status Indicators */}
        <div className="my-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Milestones ({paidCount}/{totalMilestones} Paid)</span>
            <span className="font-mono text-teal-300 font-semibold">{Math.round(progressPercent)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex mb-3">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
            />
          </div>

          {/* Individual Milestone Chips */}
          <div className="flex flex-wrap gap-1.5">
            {project.milestones.map((m, idx) => {
              const msConfig = MILESTONE_STATUS[m.status] || MILESTONE_STATUS[0];
              return (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 ${msConfig.color}`}
                  title={`${m.description} - ${formatEth(m.amount)} ETH (${msConfig.label})`}
                >
                  <span>{msConfig.icon}</span>
                  <span>M{idx + 1}: {formatEth(m.amount)} ETH</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info & CTA */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-2">
        <div>
          <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            Total Escrow Value
          </span>
          <span className="text-base font-bold text-teal-300 font-mono">
            {formatEth(project.totalAmount)} ETH
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
          <span>Manage</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}