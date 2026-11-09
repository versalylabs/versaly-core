"use client";



import type { EquityModel } from "./use-equity";

export function CapTableBar({ d }: { d: EquityModel }) {
  const { activeScenario, totalAllocatedShares, palette } = d;
  return (
    <>
      {/* Visual Cap Table Proportional Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Equity Distribution Breakdown</h2>
              <p className="text-xs text-slate-400">Visual representation of equity ownership for current scenario</p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Authorized: {activeScenario.totalAuthorizedShares.toLocaleString()} | Issued: {totalAllocatedShares.toLocaleString()}
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="w-full h-7 bg-slate-800 rounded-xl overflow-hidden flex p-1 gap-1">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div
                key={sh.id}
                style={{ width: `${sh.percentage}%` }}
                className={`h-full rounded-lg bg-gradient-to-r ${palette[idx % palette.length]} transition-all group relative`}
                title={`${sh.shareholderName}: ${sh.percentage}% (${sh.sharesCount.toLocaleString()} shares)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div key={sh.id} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${palette[idx % palette.length]}`} />
                <span className="text-slate-300 font-medium">{sh.shareholderName}</span>
                <span className="font-bold text-white">{sh.percentage}%</span>
                <span className="text-slate-500">({sh.sharesCount.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
    </>
  );
}
