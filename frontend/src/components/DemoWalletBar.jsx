import React from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/formatters';
import { DEMO_ACCOUNTS } from '../utils/constants';
import {
  Users,
  Activity,
  Zap,
  Key,
  ShieldCheck,
  CheckCircle2,
  Settings,
  UserCheck,
} from 'lucide-react';

export default function DemoWalletBar({ onOpenSettings }) {
  const {
    account,
    isDemoWallet,
    activeDemoAccount,
    connectWithPrivateKey,
    networkHealth,
  } = useWallet();

  return (
    <div className="bg-[#121620] border-b border-white/5 py-2.5 px-4 sm:px-8 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Quick Persona Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>Quick Roles Access:</span>
          </span>

          {DEMO_ACCOUNTS.map((persona, idx) => {
            const isActive =
              account && account.toLowerCase() === persona.address.toLowerCase();
            return (
              <button
                key={idx}
                onClick={() => connectWithPrivateKey(persona.privateKey, persona.name)}
                className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1a73e8] text-white shadow-sm ring-1 ring-white/30'
                    : 'bg-[#1c2230] text-slate-300 hover:bg-[#283145] hover:text-white'
                }`}
                title={`Switch to ${persona.role} (${persona.address})`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: persona.color }}
                />
                <span>{persona.name}</span>
                {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Right: Network Status & Settings Trigger */}
        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                networkHealth.isConnected
                  ? 'bg-[#34A853] shadow-sm shadow-[#34A853]'
                  : 'bg-[#EA4335]'
              }`}
            />
            <span className="text-slate-300">Arbitrum Sepolia:</span>
            <span className={networkHealth.isConnected ? 'text-[#81c995]' : 'text-slate-500'}>
              {networkHealth.pingMs !== null ? `${networkHealth.pingMs}ms` : 'Connecting...'}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 text-slate-300 hover:text-[#4285F4] transition-colors p-1 rounded-lg hover:bg-white/5"
            title="Configure RPC URL, Demo Keys, or Arbiscan API"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="font-sans font-semibold">RPC & Key Config</span>
          </button>
        </div>
      </div>
    </div>
  );
}