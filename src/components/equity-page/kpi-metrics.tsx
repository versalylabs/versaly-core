"use client";

import { Award, Users, Percent } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function KpiMetrics({ d }: { d: EquityModel }) {
  const { activeScenario, totalAllocatedShares, totalAllocatedPct } = d;
  return (
    <>
      {/* High Level KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Authorized Shares</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {activeScenario.totalAuthorizedShares.toLocaleString()}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">Nominal share capital pool</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Issued & Allocated Shares</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {totalAllocatedShares.toLocaleString()}
            </p>
            <span className="text-xs text-emerald-400 mt-1 block">
              {((totalAllocatedShares / activeScenario.totalAuthorizedShares) * 100).toFixed(1)}% of authorized pool
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Allocated %</span>
              <Percent className="w-4 h-4 text-violet-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 ${totalAllocatedPct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {totalAllocatedPct}%
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {totalAllocatedPct === 100 ? "Cap table 100% reconciled" : `${(100 - totalAllocatedPct).toFixed(1)}% unallocated reserve`}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Shareholders Listed</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {activeScenario.stakeholders.length} Stakeholders
            </p>
            <span className="text-xs text-slate-400 mt-1 block">Founders, co-founders & strategic partners</span>
          </div>
        </div>
    </>
  );
}
