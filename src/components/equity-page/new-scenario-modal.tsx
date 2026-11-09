"use client";

import { Scale, X } from "lucide-react";

import type { EquityModel } from "./use-equity";

export function NewScenarioModal({ d }: { d: EquityModel }) {
  const { isNewScenarioModalOpen, setIsNewScenarioModalOpen, handleCreateScenario, newScenarioName, setNewScenarioName, newScenarioNotes, setNewScenarioNotes, newScenarioIsLegal, setNewScenarioIsLegal } = d;
  return (
    <>
      {/* NEW SCENARIO MODAL */}
        {isNewScenarioModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  Create Equity Scenario
                </h3>
                <button
                  onClick={() => setIsNewScenarioModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateScenario} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scenario Name *</label>
                  <input
                    type="text"
                    required
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="e.g. Series Seed Post-Money Cap Table"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scenario Description / Context</label>
                  <textarea
                    rows={2}
                    value={newScenarioNotes}
                    onChange={(e) => setNewScenarioNotes(e.target.value)}
                    placeholder="Rationale for this ownership distribution scenario..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newScenarioIsLegal}
                      onChange={(e) => setNewScenarioIsLegal(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-0"
                    />
                    <span className="font-medium text-white">This scenario is legally issued at BRS</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 ml-5">
                    Leave unchecked if this is an unfinalized planning or negotiation scenario.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewScenarioModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Create Scenario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
