import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { shortenAddress } from '../utils/formatters';
import { ethers } from 'ethers';
import {
  X,
  Landmark,
  Coins,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowDownToLine,
  ExternalLink,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { CONTRACT_ADDRESS, PROTOCOL_FEE_PERCENT } from '../utils/constants';

export default function TreasuryModal({ isOpen, onClose }) {
  const {
    protocolStats,
    isOwner,
    contractOwner,
    account,
    withdrawProtocolFees,
    txPending,
  } = useWallet();

  const [recipient, setRecipient] = useState(account || '');
  const [withdrawError, setWithdrawError] = useState('');

  if (!isOpen) return null;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');

    if (!ethers.isAddress(recipient.trim())) {
      setWithdrawError('Please enter a valid recipient address');
      return;
    }

    if (parseFloat(protocolStats.treasuryBalance) <= 0) {
      setWithdrawError('Treasury balance is currently 0 ETH');
      return;
    }

    try {
      await withdrawProtocolFees(recipient.trim());
      onClose();
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d1322] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">PayTrust Protocol Treasury</h2>
            <p className="text-xs text-slate-400">
              On-chain fee accounting and protocol treasury management.
            </p>
          </div>
        </div>

        {/* Protocol Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Total Projects</span>
            </div>
            <span className="text-2xl font-bold text-white font-mono">
              {protocolStats.totalProjects}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Escrow Volume</span>
            </div>
            <span className="text-2xl font-bold text-cyan-300 font-mono">
              {parseFloat(protocolStats.totalVolume).toFixed(4)} ETH
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Fees Collected</span>
            </div>
            <span className="text-2xl font-bold text-amber-300 font-mono">
              {parseFloat(protocolStats.accumulatedFees).toFixed(6)} ETH
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30">
            <div className="flex items-center gap-2 text-teal-300 text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Available Treasury</span>
            </div>
            <span className="text-2xl font-bold text-teal-300 font-mono">
              {parseFloat(protocolStats.treasuryBalance).toFixed(6)} ETH
            </span>
          </div>
        </div>

        {/* Protocol Fee Explainer Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2 text-xs text-slate-400 mb-6 leading-relaxed">
          <p>
            <strong className="text-slate-200">Protocol Fee Model:</strong> PayTrust charges an automated{' '}
            <span className="text-teal-300 font-semibold">{PROTOCOL_FEE_PERCENT} protocol fee</span> on
            every successfully released milestone payment.
          </p>
          <p>
            Fees accumulate in the protocol treasury balance inside the smart contract and can be withdrawn
            exclusively by the protocol owner.
          </p>
        </div>

        {/* Contract & Owner Info */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs font-mono mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">PayTrust Contract:</span>
            <a
              href={`https://sepolia.arbiscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>{shortenAddress(CONTRACT_ADDRESS, 6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Protocol Owner:</span>
            <span className="text-slate-300 flex items-center gap-1">
              {contractOwner ? shortenAddress(contractOwner, 6) : 'Loading...'}
              {isOwner && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  (You)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Owner Withdrawal Section */}
        {isOwner ? (
          <form onSubmit={handleWithdraw} className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Owner Fee Withdrawal</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={txPending || parseFloat(protocolStats.treasuryBalance) <= 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {txPending ? (
                <span>Withdrawing Fees...</span>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>
                    Withdraw {parseFloat(protocolStats.treasuryBalance).toFixed(6)} ETH to Recipient
                  </span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="pt-2 text-center text-xs text-slate-500">
            Withdrawal is restricted to the Protocol Owner wallet.
          </div>
        )}
      </div>
    </div>
  );
}