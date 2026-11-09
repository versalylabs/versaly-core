"use client";

import { formatKES, SETUP_FEE_LAUNCH_TARGET, MRR_LAUNCH_TARGET } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function TargetsAndBudget({ d }: { d: FinanceOverviewModel }) {
  const { setupPct, summary, mrrPct, treasury } = d;
  return (
    <>
      {/* Launch Targets & 90-Day Budget Utilization Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Setup Fees Target */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Setup Fees Collected
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {formatKES(SETUP_FEE_LAUNCH_TARGET)}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {setupPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${setupPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(summary.setupFeesCollected)}</span>
              <span className="text-slate-500">
                Rem: {formatKES(Math.max(0, SETUP_FEE_LAUNCH_TARGET - summary.setupFeesCollected))}
              </span>
            </div>
          </div>

          {/* MRR Target */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Monthly Recurring Revenue (MRR)
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {formatKES(MRR_LAUNCH_TARGET)}/mo
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-indigo-400">
                {mrrPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${mrrPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(summary.effectiveMRR)} MRR</span>
              <span className="text-slate-500">ARR: {formatKES(summary.effectiveARR)}</span>
            </div>
          </div>

          {/* 90-Day Budget Headroom */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  90-Day Startup Budget Spend
                </span>
                <span className="text-[11px] text-slate-400">
                  Baseline: {formatKES(treasury.budgetAllocated)}
                </span>
              </div>
              <span className={`text-xs font-bold font-mono ${treasury.budgetUtilPct > 100 ? "text-rose-400" : "text-blue-400"}`}>
                {treasury.budgetUtilPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${treasury.budgetUtilPct > 100 ? "bg-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
                style={{ width: `${Math.min(100, treasury.budgetUtilPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(treasury.budgetSpent)} Spent</span>
              <span className="text-slate-500">
                Headroom: {formatKES(Math.max(0, treasury.budgetAllocated - treasury.budgetSpent))}
              </span>
            </div>
          </div>
        </div>
    </>
  );
}
