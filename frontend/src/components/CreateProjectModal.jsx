import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import {
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Coins,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PROTOCOL_FEE_PERCENT } from '../utils/constants';

export default function CreateProjectModal({ isOpen, onClose }) {
  const { createProject, txPending, account, connectWallet } = useWallet();

  const [projectName, setProjectName] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [milestones, setMilestones] = useState([
    { description: 'Phase 1: Architecture & Design Mockups', amount: '0.1' },
    { description: 'Phase 2: Smart Contract & Core Integration', amount: '0.2' },
  ]);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  // Add new milestone row
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { description: `Phase ${milestones.length + 1}: Deliverable`, amount: '0.1' },
    ]);
  };

  // Remove milestone row
  const removeMilestone = (index) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Update milestone field
  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  // Calculations
  const totalEth = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const totalFeeEth = (totalEth * 5) / 10000;
  const totalPayoutEth = totalEth - totalFeeEth;

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!projectName.trim()) {
      setValidationError('Please enter a project title');
      return;
    }

    if (!ethers.isAddress(freelancerAddress.trim())) {
      setValidationError('Please enter a valid Ethereum address for the freelancer');
      return;
    }

    if (account && freelancerAddress.trim().toLowerCase() === account.toLowerCase()) {
      setValidationError('Freelancer address cannot be the same as client address');
      return;
    }

    if (milestones.length === 0) {
      setValidationError('At least one milestone is required');
      return;
    }

    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].description.trim()) {
        setValidationError(`Milestone #${i + 1} description cannot be empty`);
        return;
      }
      const amt = parseFloat(milestones[i].amount);
      if (isNaN(amt) || amt <= 0) {
        setValidationError(`Milestone #${i + 1} must have an ETH amount greater than 0`);
        return;
      }
    }

    try {
      const descriptions = milestones.map((m) => m.description.trim());
      const amounts = milestones.map((m) => m.amount.toString());

      await createProject(projectName.trim(), freelancerAddress.trim(), descriptions, amounts);
      onClose();
    } catch (err) {
      // Toast handles error display
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d1322] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-8">
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
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Milestone Project</h2>
            <p className="text-xs text-slate-400">
              Define deliverables, lock milestone amounts, and collaborate securely.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Project Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Full-Stack DApp Development & Smart Contracts"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm transition-colors"
            />
          </div>

          {/* Freelancer Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Freelancer Wallet Address *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Arbitrum Sepolia Compatible</span>
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={freelancerAddress}
              onChange={(e) => setFreelancerAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-sm transition-colors"
            />
          </div>

          {/* Milestones Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Milestones & Deliverables ({milestones.length})
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {milestones.map((m, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3"
                >
                  <span className="w-6 text-center font-mono text-xs font-bold text-teal-400">
                    #{index + 1}
                  </span>

                  <input
                    type="text"
                    placeholder="Milestone description / scope"
                    value={m.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />

                  <div className="w-28 relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      placeholder="ETH"
                      value={m.amount}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                      className="w-full pl-3 pr-10 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-right"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 pointer-events-none">
                      ETH
                    </span>
                  </div>

                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Escrow & Fee Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-teal-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Total Project Value (Escrow Deposit):</span>
              <span className="font-mono font-bold text-white text-sm">
                {totalEth.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <span>PayTrust Protocol Fee ({PROTOCOL_FEE_PERCENT}):</span>
              </span>
              <span className="font-mono text-teal-400">
                {totalFeeEth.toFixed(6)} ETH
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/5">
              <span>Freelancer Net Payout (99.95%):</span>
              <span className="font-mono font-semibold text-emerald-400">
                {totalPayoutEth.toFixed(6)} ETH
              </span>
            </div>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            {!account ? (
              <button
                type="button"
                onClick={connectWallet}
                className="px-6 py-2.5 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-400 transition-all"
              >
                Connect Wallet to Create
              </button>
            ) : (
              <button
                type="submit"
                disabled={txPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {txPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Creating On-Chain...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}