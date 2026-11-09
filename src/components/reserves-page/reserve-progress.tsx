"use client";



import type { ReservesModel } from "./use-reserves";

export function ReserveProgress({ d }: { d: ReservesModel }) {
  const { stats } = d;
  return (
    <>
      {/* Global Reserve Progress Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-white">Aggregated Reserve Funding Progress</span>
            <span className="font-mono text-indigo-400 font-bold">{stats.fundedPercentage.toFixed(1)}% Funded</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.fundedPercentage)}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
    </>
  );
}
