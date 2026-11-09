"use client";

import { DollarSign, PhoneCall, Target, ShieldCheck, BarChart2 } from "lucide-react";

import type { DashboardModel } from "./use-dashboard";

export function SectionTabs({ d }: { d: DashboardModel }) {
  const { setActiveSection, activeSection, canSeeFinance } = d;
  return (
    <>
      {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setActiveSection("ALL")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border ${
              activeSection === "ALL"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            All Executive Sections
          </button>
          {canSeeFinance && (
          <button
            onClick={() => setActiveSection("MONEY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "MONEY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>1. Money & Cash</span>
          </button>
          )}
          <button
            onClick={() => setActiveSection("SALES")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "SALES"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5 text-indigo-400" />
            <span>2. Sales Activity & Funnel</span>
          </button>
          <button
            onClick={() => setActiveSection("PIPELINE")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "PIPELINE"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Target className="h-3.5 w-3.5 text-violet-400" />
            <span>3. Pipeline & Forecast</span>
          </button>
          <button
            onClick={() => setActiveSection("DELIVERY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "DELIVERY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>4. Client & Delivery Health</span>
          </button>
          <button
            onClick={() => setActiveSection("PRODUCTS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "PRODUCTS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5 text-amber-400" />
            <span>5. Product Performance Matrix</span>
          </button>
        </div>
    </>
  );
}
