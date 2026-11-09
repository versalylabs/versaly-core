"use client";

import { PiggyBank, X } from "lucide-react";

import type { ReservesModel } from "./use-reserves";

export function FundModal({ d }: { d: ReservesModel }) {
  const { isFundModalOpen, editingFund, setIsFundModalOpen, handleSaveFund, fundName, setFundName, fundPurpose, setFundPurpose, fundAllocatedKES, setFundAllocatedKES, fundTargetKES, setFundTargetKES, fundRunwayMonths, setFundRunwayMonths, fundNotes, setFundNotes } = d;
  return (
    <>
      {/* ADD / EDIT FUND MODAL */}
        {isFundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-indigo-400" />
                  {editingFund ? "Edit Reserve Fund" : "New Reserve Fund"}
                </h3>
                <button
                  onClick={() => setIsFundModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFund} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Fund Name *</label>
                  <input
                    type="text"
                    required
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    placeholder="e.g. Tax & VAT Provision Fund"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Strategic Purpose *</label>
                  <textarea
                    rows={2}
                    required
                    value={fundPurpose}
                    onChange={(e) => setFundPurpose(e.target.value)}
                    placeholder="Why this buffer exists and when it may be tapped..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Allocated Balance (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fundAllocatedKES}
                      onChange={(e) => setFundAllocatedKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Target Amount (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fundTargetKES}
                      onChange={(e) => setFundTargetKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Runway (Months)</label>
                    <input
                      type="number"
                      min="1"
                      value={fundRunwayMonths}
                      onChange={(e) => setFundRunwayMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Governance Notes</label>
                  <textarea
                    rows={2}
                    value={fundNotes}
                    onChange={(e) => setFundNotes(e.target.value)}
                    placeholder="Approval requirements or statutory rules..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFundModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Save Fund
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
