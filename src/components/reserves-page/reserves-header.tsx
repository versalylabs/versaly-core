"use client";

import Link from "next/link";
import { PiggyBank, Landmark, Plus } from "lucide-react";

import type { ReservesModel } from "./use-reserves";

export function ReservesHeader({ d }: { d: ReservesModel }) {
  const { handleOpenAccountsModal, handleOpenAddFund } = d;
  return (
    <>
      {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
              <Link href="/finance" className="hover:underline">Finance</Link>
              <span>/</span>
              <span>Cash Reserves & Savings</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <PiggyBank className="w-8 h-8 text-indigo-400" />
              Cash Reserves & Financial Earmarks
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Internal risk buffers, tax provisions, emergency runway, and capital growth funds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAccountsModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-sm transition-all cursor-pointer"
            >
              <Landmark className="w-4 h-4" />
              <span>Manage Vault Balances</span>
            </button>
            <button
              onClick={handleOpenAddFund}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Reserve Fund
            </button>
          </div>
        </div>
    </>
  );
}
