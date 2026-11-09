"use client";

import { Landmark, SlidersHorizontal, Plus, TrendingDown } from "lucide-react";
import Link from "next/link";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function FinanceHeader({ d }: { d: FinanceOverviewModel }) {
  const { dateRange, setDateRange } = d;
  return (
    <>
      {/* Top Header Banner */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Treasury &amp; Financial Command
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Versaly Core Kenya</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Landmark className="h-6 w-6 text-emerald-400" />
              <span>Financial Overview &amp; Treasury</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Centralized financial governance for company capital, bank accounts, revenue, expenses, budgets, equity, and reserves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as Parameters<typeof setDateRange>[0])}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="THIS_QUARTER">This Quarter</option>
                <option value="THIS_YEAR">FY 2026</option>
              </select>
            </div>

            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Link>
            <Link
              href="/finance/expenses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span>Log Expense</span>
            </Link>
          </div>
        </div>
    </>
  );
}
