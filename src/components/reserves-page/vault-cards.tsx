"use client";

import { Landmark, Edit2, Lock, Wallet, Percent } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { ReservesModel } from "./use-reserves";

export function VaultCards({ d }: { d: ReservesModel }) {
  const { stats, handleOpenAccountsModal, accounts } = d;
  return (
    <>
      {/* Vault Liquidity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Company Vault Cash</span>
              <Landmark className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-2xl font-bold text-white font-mono">
                {formatKES(stats.totalCompanyCash)}
              </p>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                title="Adjust Company Bank & Vault Balances"
              >
                <Edit2 className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Across {accounts.length} bank &amp; M-Pesa accounts</span>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
              >
                Edit Vaults &rarr;
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Earmarked Reserves</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {formatKES(stats.totalEarmarkedReserves)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {((stats.totalEarmarkedReserves / (stats.totalCompanyCash || 1)) * 100).toFixed(1)}% of total cash ringfenced
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Unencumbered Free Cash</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 font-mono ${stats.freeOperatingCash >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatKES(stats.freeOperatingCash)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Available for day-to-day operations & software builds
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Reserve Target Funding</span>
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.fundedPercentage.toFixed(1)}%
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {formatKES(stats.totalEarmarkedReserves)} / {formatKES(stats.totalTargets)} Target
            </span>
          </div>
        </div>
    </>
  );
}
