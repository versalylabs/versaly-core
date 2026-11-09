"use client";

import Link from "next/link";
import { Wallet, Receipt, ArrowDownLeft, TrendingDown, Landmark, PieChart, Calculator, Repeat, PiggyBank, Banknote, TrendingUp, BarChart3 } from "lucide-react";

import type { FinanceOverviewModel } from "./use-finance-overview";

export function SectionNavGrid({ d }: { d: FinanceOverviewModel }) {
  const { invoices, summary, expenses, vendorSubs } = d;
  return (
    <>
      {/* Section Navigation Quick Grid (Full 10 Core Subsections) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/finance"
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Wallet className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="truncate">Overview</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
              Live
            </span>
          </Link>

          <Link
            href="/finance/invoices"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Receipt className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Invoices</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">({invoices.length})</span>
          </Link>

          <Link
            href="/finance/payments"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ArrowDownLeft className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Receivables</span>
            </div>
            {summary.overdueCount > 0 && (
              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                {summary.overdueCount} due
              </span>
            )}
          </Link>

          <Link
            href="/finance/expenses"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Expenses</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">({expenses.length})</span>
          </Link>

          <Link
            href="/finance/capital"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Landmark className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Capital &amp; Loans</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono shrink-0 ml-1">Debt/Eq</span>
          </Link>

          <Link
            href="/finance/equity"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <PieChart className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Cap Table</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">51/29/20</span>
          </Link>

          <Link
            href="/finance/budgets"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calculator className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Budgets</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">90-Day</span>
          </Link>

          <Link
            href="/finance/subscriptions"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Repeat className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Subscriptions</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">({vendorSubs.length})</span>
          </Link>

          <Link
            href="/finance/reserves"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <PiggyBank className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Reserves</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono shrink-0 ml-1">Earmarks</span>
          </Link>

          <Link
            href="/finance/compensation"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Banknote className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">Compensation</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">Payroll</span>
          </Link>

          <Link
            href="/finance/revenue"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">MRR &amp; ARR</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono shrink-0 ml-1">SaaS</span>
          </Link>

          <Link
            href="/finance/reports"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white shrink-0" />
              <span className="truncate">P&amp;L Statements</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">Audit</span>
          </Link>
        </div>
    </>
  );
}
