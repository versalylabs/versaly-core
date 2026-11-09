"use client";

import { Check, X, Edit2, Plus, ArrowRightLeft, Trash2 } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { ReservesModel } from "./use-reserves";

export function FundsGrid({ d }: { d: ReservesModel }) {
  const { reserves, editingBalanceFundId, quickBalanceValue, setQuickBalanceValue, handleSaveQuickBalance, setEditingBalanceFundId, handleStartQuickEdit, handleOpenTransfer, handleOpenEditFund, handleDeleteFund } = d;
  return (
    <>
      {/* Reserve Funds Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Designated Reserve Funds</h2>
              <p className="text-xs text-slate-400">
                Track each ringfenced capital pool against its strategic operational target.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {reserves.length} Active Reserve Funds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reserves.map((fund) => {
              const fundingPct = fund.targetKES > 0 ? (fund.currentAllocatedKES / fund.targetKES) * 100 : 0;
              const isTargetMet = fund.currentAllocatedKES >= fund.targetKES;

              return (
                <div
                  key={fund.id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{fund.fundName}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fund.purpose}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        isTargetMet
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {fundingPct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-400">Allocated Balance:</span>
                        {editingBalanceFundId === fund.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={quickBalanceValue}
                              onChange={(e) => setQuickBalanceValue(Math.max(0, Number(e.target.value)))}
                              className="w-28 sm:w-32 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveQuickBalance(fund.id);
                                if (e.key === "Escape") setEditingBalanceFundId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuickBalance(fund.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBalanceFundId(null)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleStartQuickEdit(fund)}
                              className="font-bold text-white font-mono text-sm cursor-pointer hover:text-indigo-300 transition-colors"
                              title="Click to edit balance"
                            >
                              {formatKES(fund.currentAllocatedKES)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartQuickEdit(fund)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all cursor-pointer"
                              title="Edit Allocated Balance"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Target Envelope:</span>
                        <span className="font-medium text-slate-300 font-mono">
                          {formatKES(fund.targetKES)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Runway Objective:</span>
                        <span className="font-medium text-indigo-300 font-mono">
                          {fund.targetMonthsRunway || 3} Months
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${Math.min(100, fundingPct)}%` }}
                          className={`h-full rounded-full transition-all ${
                            isTargetMet ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-indigo-500"
                          }`}
                        />
                      </div>
                    </div>

                    {fund.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-800/30 p-2.5 rounded-lg">
                        {fund.notes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenTransfer(fund, "DEPOSIT")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Allocate In
                      </button>
                      <button
                        onClick={() => handleOpenTransfer(fund, "WITHDRAW")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Release Out
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                      <button
                        onClick={() => handleOpenEditFund(fund)}
                        className="hover:text-slate-300 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Terms
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id, fund.fundName)}
                        className="hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </>
  );
}
