"use client";

import { Sliders, X, Award } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { EquityModel } from "./use-equity";

export function DilutionCalculator({ d }: { d: EquityModel }) {
  const { isDilutionCalculatorOpen, setIsDilutionCalculatorOpen, dilutionInvestorName, setDilutionInvestorName, dilutionNewShares, setDilutionNewShares, activeScenario, dilutionInvestmentAmount, setDilutionInvestmentAmount, simulatedDilution } = d;
  return (
    <>
      {/* INTERACTIVE DILUTION CALCULATOR (Collapsible) */}
        {isDilutionCalculatorOpen && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sliders className="w-3.5 h-3.5" />
                  Interactive Scenario Simulation
                </div>
                <h2 className="text-lg font-bold text-white">Investment Round & Equity Dilution Calculator</h2>
                <p className="text-xs text-slate-400">
                  Model how a new funding round or option pool affects the existing cap table.
                </p>
              </div>
              <button
                onClick={() => setIsDilutionCalculatorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Incoming Investor / Pool Name</label>
                <input
                  type="text"
                  value={dilutionInvestorName}
                  onChange={(e) => setDilutionInvestorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Angel Investor or ESOP Pool"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">New Shares to Issue</label>
                <input
                  type="number"
                  value={dilutionNewShares}
                  onChange={(e) => setDilutionNewShares(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New shares issued = {((dilutionNewShares / (activeScenario.totalIssuedShares + dilutionNewShares)) * 100).toFixed(1)}% post-money
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Capital Invested (KES)</label>
                <input
                  type="number"
                  value={dilutionInvestmentAmount}
                  onChange={(e) => setDilutionInvestmentAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-indigo-400 mt-1 block font-mono">
                  {formatKES(dilutionInvestmentAmount)}
                </span>
              </div>
            </div>

            {/* Simulation Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Shareholder</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Pre-Round %</th>
                    <th className="p-3 text-right">Post-Round %</th>
                    <th className="p-3 text-right">Dilution Delta</th>
                    <th className="p-3 text-right">Post-Round Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {simulatedDilution.dilutedHolders.map((dh) => (
                    <tr key={dh.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-white">{dh.shareholderName}</td>
                      <td className="p-3 text-slate-400">{dh.roleTitle}</td>
                      <td className="p-3 text-right font-medium text-slate-300">{dh.percentage.toFixed(1)}%</td>
                      <td className="p-3 text-right font-bold text-indigo-300">{dh.newPct.toFixed(1)}%</td>
                      <td className="p-3 text-right text-rose-400 font-mono">
                        -{dh.pctDrop.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-slate-300 font-mono">{dh.sharesCount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-950/40 border-t border-indigo-500/30 font-semibold text-indigo-200">
                    <td className="p-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      {dilutionInvestorName} (New)
                    </td>
                    <td className="p-3 text-indigo-300">Incoming Equity</td>
                    <td className="p-3 text-right text-slate-500">0.0%</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {simulatedDilution.investorPct.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-emerald-400">+{simulatedDilution.investorPct.toFixed(1)}%</td>
                    <td className="p-3 text-right font-mono text-white">{dilutionNewShares.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
              <div>
                Estimated Implied Pre-Money Valuation:{" "}
                <span className="font-bold text-white font-mono">{formatKES(simulatedDilution.preMoneyValuation)}</span>
              </div>
              <div>
                Post-Money Total Shares:{" "}
                <span className="font-bold text-white font-mono">{simulatedDilution.postMoneyShares.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
