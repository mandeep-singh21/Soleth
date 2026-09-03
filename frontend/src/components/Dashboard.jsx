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
  CheckCircle,
  Key,
} from 'lucide-react';

export default function Dashboard({ onOpenCreate, onSelectProject, onOpenSettings }) {
  const { account, projects, isLoadingData } = useWallet();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'client', 'freelancer', 'funded', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredProjects = projects.filter((project) => {
    const matchesQuery =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.freelancer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toString() === searchQuery.trim();

    if (!matchesQuery) return false;

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
          <div className="p-5 rounded-3xl gpay-card border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                Active Client Escrow Locked
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {myEscrowLocked.toFixed(4)} <span className="text-xs text-[#4285F4]">ETH</span>
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl gpay-card border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#34A853]/15 border border-[#34A853]/30 flex items-center justify-center text-[#34A853]">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                Freelancer Payouts Earned
              </span>
              <span className="text-xl font-extrabold text-[#81c995] font-mono">
                {myEarnings.toFixed(4)} <span className="text-xs text-[#81c995]">ETH</span>
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl gpay-card border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FBBC04]/15 border border-[#FBBC04]/30 flex items-center justify-center text-[#FBBC04]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-mono uppercase">
                My Projects In-Flight
              </span>
              <span className="text-xl font-extrabold text-white font-mono">
                {myClientProjects.length + myFreelancerProjects.length} Projects
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Google Pay Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Material You Style Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#141822] border border-white/5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Projects ({projects.length})
          </button>

          {account && (
            <>
              <button
                onClick={() => setActiveTab('client')}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'client'
                    ? 'bg-[#1a73e8] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                As Client ({myClientProjects.length})
              </button>

              <button
                onClick={() => setActiveTab('freelancer')}
                className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'freelancer'
                    ? 'bg-[#1a73e8] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                As Freelancer ({myFreelancerProjects.length})
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('funded')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'funded'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Escrow
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#1a73e8] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search title, ID, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141822] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4285F4]"
            />
          </div>

          <button
            onClick={onOpenCreate}
            className="gpay-btn-primary px-5 py-2 text-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoadingData ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#4285F4] border-t-transparent rounded-full animate-spin mx-auto" />
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
        <div className="py-20 text-center rounded-3xl gpay-card border border-white/5 max-w-xl mx-auto p-8">
          <div className="w-16 h-16 rounded-3xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] mx-auto mb-4">
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
            className="gpay-btn-primary inline-flex items-center gap-2 px-6 py-3 text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Project</span>
          </button>
        </div>
      )}
    </div>
  );
}