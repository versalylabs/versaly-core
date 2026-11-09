"use client";

import { ArrowRightLeft, X } from "lucide-react";
import { formatKES } from "@/lib/finance-store";

import type { ReservesModel } from "./use-reserves";

export function TransferModal({ d }: { d: ReservesModel }) {
  const { isTransferModalOpen, selectedFund, transferType, setIsTransferModalOpen, stats, handleExecuteTransfer, transferAmount, setTransferAmount, transferNotes, setTransferNotes } = d;
  return (
    <>
      {/* TRANSFER / REALLOCATION MODAL */}
        {isTransferModalOpen && selectedFund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                  {transferType === "DEPOSIT" ? "Allocate Cash to Reserve" : "Release Cash to Free Liquidity"}
                </h3>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-medium">Selected Fund: <span className="text-white font-bold">{selectedFund.fundName}</span></div>
                <div className="text-slate-400">Current Balance: <span className="font-mono text-amber-400 font-bold">{formatKES(selectedFund.currentAllocatedKES)}</span></div>
                <div className="text-slate-400">Unencumbered Free Cash: <span className="font-mono text-emerald-400 font-bold">{formatKES(stats.freeOperatingCash)}</span></div>
              </div>

              <form onSubmit={handleExecuteTransfer} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {transferType === "DEPOSIT" ? "Amount to Ringfence (KES) *" : "Amount to Release (KES) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Allocation Reason / Board Note</label>
                  <textarea
                    rows={2}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="e.g. Allocation of Q1 client milestone payment buffer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Confirm {transferType === "DEPOSIT" ? "Allocation" : "Release"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
