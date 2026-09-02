import React from 'react';
import { useWallet } from '../context/WalletContext';
import { CheckCircle2, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

export default function Toast() {
  const { toastMessage, closeToast } = useWallet();

  if (!toastMessage) return null;

  const { type, message, txHash } = toastMessage;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100',
    error: 'border-rose-500/40 bg-rose-950/90 text-rose-100',
    info: 'border-teal-500/40 bg-slate-900/95 text-slate-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
      <div
        className={`p-4 rounded-xl border shadow-2xl backdrop-blur-lg flex items-start gap-3 ${
          borderColors[type] || borderColors.info
        }`}
      >
        {icons[type] || icons.info}
        <div className="flex-1 text-sm">
          <p className="font-medium leading-relaxed">{message}</p>
          {txHash && (
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-teal-400 hover:text-teal-300 font-mono underline"
            >
              <span>View on Arbiscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <button
          onClick={closeToast}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}