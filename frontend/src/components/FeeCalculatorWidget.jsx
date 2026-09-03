import React, { useState } from 'react';
import { calculateFeeAndPayout } from '../utils/formatters';
import { PROTOCOL_FEE_PERCENT } from '../utils/constants';
import { Calculator, ArrowRight, Sparkles, DollarSign, CheckCircle2 } from 'lucide-react';

export default function FeeCalculatorWidget({ onOpenCreateWithAmount }) {
  const [amount, setAmount] = useState('1.0');
  const [ethPrice] = useState(3000); // Approximate ETH price for quick USD reference

  const numAmount = parseFloat(amount) || 0;
  const { fee, payout } = calculateFeeAndPayout(numAmount);

  const numFee = parseFloat(fee) || 0;
  const numPayout = parseFloat(payout) || 0;

  const presetAmounts = ['0.25', '0.5', '1.0', '2.5', '5.0'];

  return (
    <div className="gpay-card p-6 sm:p-8 relative overflow-hidden border border-white/10">
      {/* Google Quad-Color Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 google-gradient-bg" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interactive Fee & Payout Simulator</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#34A853]/20 text-[#81c995] font-mono font-bold">
                0.05% PROTOCOL FEE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact 99.95% freelancer payout and 0.05% protocol treasury fee in real-time.
            </p>
          </div>
        </div>

        {/* Quick Amount Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                amount === preset
                  ? 'bg-[#1a73e8] text-white shadow-md'
                  : 'bg-[#232936] text-slate-300 hover:bg-[#2e3748]'
              }`}
            >
              {preset} ETH
            </button>
          ))}
        </div>
      </div>

      {/* Input & Slider Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Milestone ETH Amount
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full gpay-input font-mono text-base font-bold pr-14 text-white"
            />
            <span className="absolute right-4 top-3.5 text-xs font-mono text-[#4285F4] font-bold">
              ETH
            </span>
          </div>
          <span className="block text-[11px] text-slate-400 mt-1 font-mono">
            ≈ ${(numAmount * ethPrice).toLocaleString()} USD
          </span>
        </div>

        {/* Visual Dual Card Results */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {/* Freelancer Payout */}
          <div className="p-4 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#81c995] font-semibold">Freelancer Payout</span>
              <span className="text-[11px] font-mono font-bold text-[#81c995]">99.95%</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-white font-mono block">
                {payout} <span className="text-sm font-normal text-[#81c995]">ETH</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ≈ ${(numPayout * ethPrice).toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* PayTrust Protocol Fee */}
          <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8ab4f8] font-semibold">PayTrust Protocol Fee</span>
              <span className="text-[11px] font-mono font-bold text-[#8ab4f8]">0.05%</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-[#4285F4] font-mono block">
                {fee} <span className="text-sm font-normal text-[#8ab4f8]">ETH</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ≈ ${(numFee * ethPrice).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Proportional Bar */}
      <div className="space-y-1.5 mb-6">
        <div className="w-full h-3 rounded-full bg-[#11141c] overflow-hidden flex p-0.5 border border-white/5">
          <div
            style={{ width: '99.95%' }}
            className="h-full bg-gradient-to-r from-[#34A853] to-[#81c995] rounded-l-full"
            title="99.95% to Freelancer"
          />
          <div
            style={{ width: '0.05%', minWidth: '4px' }}
            className="h-full bg-[#4285F4] rounded-r-full"
            title="0.05% to Protocol Treasury"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            <span>Freelancer Net (99.95%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]"></span>
            <span>Protocol Treasury (0.05% / 5 BPS)</span>
          </span>
        </div>
      </div>

      {/* CTA Button */}
      {onOpenCreateWithAmount && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onOpenCreateWithAmount(amount)}
            className="gpay-btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
          >
            <span>Create Project with {amount} ETH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}