"use client";

import { Landmark, Wallet, TrendingUp, Flame } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function MetricCards({ d }: { d: FinanceOverviewModel }) {
  const { treasury, summary } = d;
  return (
    <>
      {/* PRIMARY FINANCIAL METRIC CARDS (8 High-Impact Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Cash Balance */}
          <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Total Company Cash</span>
              <Landmark className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {formatKES(treasury.totalCash)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Free: {formatKES(treasury.unencumberedCash)}</span>
              <span className="text-amber-400">Reserves: {formatKES(treasury.totalReserves)}</span>
            </div>
          </div>

          {/* Card 2: Revenue Collected */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Revenue Collected</span>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-200 font-mono">
              {formatKES(summary.totalCollected)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              Real cash collected across client contracts
            </div>
          </div>

          {/* Card 3: Total Expenses & Net Profit */}
          <div className="liquid-glass p-5 rounded-2xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-indigo-300">Net Operating Profit</span>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div className={`text-2xl font-black font-mono ${summary.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatKES(summary.netProfit)}
            </div>
            <div className="text-[11px] text-slate-400">
              Expenses: {formatKES(summary.totalExpenses)}
            </div>
          </div>

          {/* Card 4: Burn Rate & Cash Runway */}
          <div className="liquid-glass p-5 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-amber-300">Runway &amp; Monthly Burn</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {treasury.cashRunwayMonths} Months
            </div>
            <div className="text-[11px] text-slate-400">
              Est. Burn: {formatKES(treasury.monthlyBurnRate)} / mo
            </div>
          </div>
        </div>
    </>
  );
}
