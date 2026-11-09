"use client";

import Link from "next/link";
import { PieChart, Sliders, Plus } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function EquityHeader({ d }: { d: EquityModel }) {
  const { setIsDilutionCalculatorOpen, isDilutionCalculatorOpen, setIsNewScenarioModalOpen, handleOpenAddShareholder } = d;
  return (
    <>
      {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
              <Link href="/finance" className="hover:underline">Finance</Link>
              <span>/</span>
              <span>Ownership & Equity</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <PieChart className="w-8 h-8 text-indigo-400" />
              Ownership & Equity Register
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Restricted cap table governance, share classes, vesting schedules, and dilution modeling for Versaly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDilutionCalculatorOpen(!isDilutionCalculatorOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-sm transition-all"
            >
              <Sliders className="w-4 h-4" />
              {isDilutionCalculatorOpen ? "Hide Dilution Tool" : "Simulate Dilution"}
            </button>
            <button
              onClick={() => setIsNewScenarioModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              New Scenario
            </button>
            <button
              onClick={handleOpenAddShareholder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Shareholder
            </button>
          </div>
        </div>
    </>
  );
}
