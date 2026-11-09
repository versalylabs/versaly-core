"use client";

import { ShieldCheck, Scale, CheckCircle2 } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function ScenarioTabs({ d }: { d: EquityModel }) {
  const { scenarios, setActiveScenarioId, activeScenarioId, activeScenario } = d;
  return (
    <>
      {/* Scenario Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider">Scenarios:</span>
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
                  activeScenarioId === sc.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {sc.isLegallyIssued ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                )}
                {sc.scenarioName}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              activeScenario.isLegallyIssued
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}>
              {activeScenario.isLegallyIssued ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Legally Issued & BRS Filed
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  Proposed / Unfinalized Scenario
                </>
              )}
            </span>
          </div>
        </div>
    </>
  );
}
