import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import ProjectCard from './ProjectCard';
import { formatEth } from '../utils/formatters';
import {
  Search,
  Plus,
  Shield,
  Coins,
  Inbox,
  UserCheck,
} from 'lucide-react';

export default function Dashboard({ onOpenCreate, onSelectProject }) {
  const { account, projects, isLoadingData } = useWallet();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'client', 'freelancer', 'funded', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    // Search query filter
    const matchesQuery =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.freelancer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toString() === searchQuery.trim();

    if (!matchesQuery) return false;

    // Tab filter
    if (activeTab === 'client') {
      return account && project.client.toLowerCase() === account.toLowerCase();
    }
    if (activeTab === 'freelancer') {
      return account && project.freelancer.toLowerCase() === account.toLowerCase();
    }
    if (activeTab === 'funded') {
      return project.status === 1;
    }
    if (activeTab === 'completed') {
      return project.status === 2;
    }

    return true;
  });

  // Calculate User Stats
  const myClientProjects = account
    ? projects.filter((p) => p.client.toLowerCase() === account.toLowerCase())
    : [];
  const myFreelancerProjects = account
    ? projects.filter((p) => p.freelancer.toLowerCase() === account.toLowerCase())
    : [];

  const myEscrowLocked = myClientProjects
    .filter((p) => p.status === 1)
    .reduce((sum, p) => sum + (parseFloat(formatEth(p.totalAmount)) - parseFloat(formatEth(p.paidAmount))), 0);

  const myEarnings = myFreelancerProjects.reduce(
    (sum, p) => sum + parseFloat(formatEth(p.paidAmount)),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Stats */}
      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                Active Client Escrow Locked
              </span>
              <span className="text-xl font-bold text-white font-mono">
                {myEscrowLocked.toFixed(4)} ETH
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                Freelancer Payouts Earned
              </span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {myEarnings.toFixed(4)} ETH
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                My Projects In-Flight
              </span>
              <span className="text-xl font-bold text-teal-300 font-mono">
                {myClientProjects.length + myFreelancerProjects.length} Projects
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Projects ({projects.length})
          </button>

          {account && (
            <>
              <button
                onClick={() => setActiveTab('client')}
                className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'client'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                As Client ({myClientProjects.length})
              </button>

              <button
                onClick={() => setActiveTab('freelancer')}
                className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'freelancer'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                As Freelancer ({myFreelancerProjects.length})
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('funded')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'funded'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Escrow
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, ID, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoadingData ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Syncing contracts on Arbitrum Sepolia...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl glass-panel border border-white/5 max-w-xl mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Projects Found</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {searchQuery
              ? 'No projects matched your search criteria. Try modifying your filters.'
              : 'Create your first milestone escrow contract to start working securely.'}
          </p>

          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-cyan-400 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Project</span>
          </button>
        </div>
      )}
    </div>
  );
}