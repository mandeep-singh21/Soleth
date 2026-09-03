import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Navbar from './components/Navbar';
import DemoWalletBar from './components/DemoWalletBar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import TreasuryModal from './components/TreasuryModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { CONTRACT_ADDRESS, PROTOCOL_FEE_PERCENT } from './utils/constants';
import { shortenAddress } from './utils/formatters';
import { ShieldCheck, ExternalLink, Settings } from 'lucide-react';

function MainApp() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTreasuryOpen, setIsTreasuryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [createInitialAmount, setCreateInitialAmount] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const { projects } = useWallet();

  const activeSelectedProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || selectedProject
    : null;

  const handleOpenCreateWithAmount = (amount) => {
    setCreateInitialAmount(amount);
    setIsCreateOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0e1017] text-slate-100 font-sans selection:bg-[#4285F4]/30 selection:text-white">
      <div>
        {/* Top Demo & Network Status Bar */}
        <DemoWalletBar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Top Navbar */}
        <Navbar
          onOpenCreate={() => {
            setCreateInitialAmount(null);
            setIsCreateOpen(true);
          }}
          onOpenTreasury={() => setIsTreasuryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {currentView === 'landing' ? (
            <Hero
              onOpenCreate={() => {
                setCreateInitialAmount(null);
                setIsCreateOpen(true);
              }}
              onLaunchApp={() => setCurrentView('dashboard')}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCreateWithAmount={handleOpenCreateWithAmount}
            />
          ) : (
            <Dashboard
              onOpenCreate={() => {
                setCreateInitialAmount(null);
                setIsCreateOpen(true);
              }}
              onSelectProject={(project) => setSelectedProject(project)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateInitialAmount(null);
        }}
        initialAmount={createInitialAmount}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Notifications */}
      <Toast />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0c12] py-10 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-[#141822] border border-white/10 flex items-center justify-center text-[#4285F4]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  Pay<span className="text-[#4285F4]">Trust</span>
                </span>
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
                className="hover:text-[#8ab4f8] flex items-center gap-1 transition-colors"
              >
                <span>Contract: {shortenAddress(CONTRACT_ADDRESS, 4)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-[#81c995] font-semibold">
                Fee: {PROTOCOL_FEE_PERCENT} (5 BPS)
              </span>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Config</span>
              </button>
            </div>
          </div>

          {/* Security & Prototype Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#121620] border border-white/5 text-[11px] text-slate-400 leading-relaxed text-center">
            <p className="font-semibold text-slate-300 mb-1">Hackathon Prototype Disclaimer</p>
            <p>
              This project is a hackathon prototype and has not been professionally audited. Do not use it with real production funds.
              Built on Arbitrum Sepolia Testnet.
            </p>
          </div>

          <div className="text-center text-slate-500 text-[11px] flex items-center justify-center gap-2">
            <span>© {new Date().getFullYear()} PayTrust Protocol</span>
            <span>•</span>
            <span className="google-gradient-text font-semibold">Google Pay Theme</span>
            <span>•</span>
            <span>Trust the work. Trust the code.</span>
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