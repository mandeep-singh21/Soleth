import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import TreasuryModal from './components/TreasuryModal';
import Toast from './components/Toast';
import { CONTRACT_ADDRESS, PROTOCOL_FEE_PERCENT } from './utils/constants';
import { shortenAddress } from './utils/formatters';
import { ShieldCheck, ExternalLink } from 'lucide-react';

function MainApp() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTreasuryOpen, setIsTreasuryOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { projects } = useWallet();

  // If a project is selected, keep its details updated from state
  const activeSelectedProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || selectedProject
    : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080b11] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenTreasury={() => setIsTreasuryOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <Hero
            onOpenCreate={() => setIsCreateOpen(true)}
            onLaunchApp={() => setCurrentView('dashboard')}
          />
        ) : (
          <Dashboard
            onOpenCreate={() => setIsCreateOpen(true)}
            onSelectProject={(project) => setSelectedProject(project)}
          />
        )}
      </main>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ProjectDetailsModal
        project={activeSelectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <TreasuryModal
        isOpen={isTreasuryOpen}
        onClose={() => setIsTreasuryOpen(false)}
      />

      {/* Notifications */}
      <Toast />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#06080e] py-10 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">PayTrust</span>
                <span className="block text-[11px] text-slate-400">
                  Secure payments. Trustless milestones.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <a
                href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <span>Contract: {shortenAddress(CONTRACT_ADDRESS, 4)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-teal-400 font-semibold">
                Fee: {PROTOCOL_FEE_PERCENT} (5 BPS)
              </span>
            </div>
          </div>

          {/* Security & Prototype Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 leading-relaxed text-center">
            <p className="font-semibold text-slate-300 mb-1">Hackathon Prototype Disclaimer</p>
            <p>
              This project is a hackathon prototype and has not been professionally audited. Do not use it with real production funds.
              Built for Arbitrum Sepolia Testnet.
            </p>
          </div>

          <div className="text-center text-slate-400 text-[11px]">
            © {new Date().getFullYear()} PayTrust Protocol — Trust the work. Trust the code.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <MainApp />
    </WalletProvider>
  );
}