"use client";

import { Calendar, X, CheckCircle2, Plus, CheckSquare } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function RoadmapDayModal({ d }: { d: TasksModel }) {
  const { isRoadmapModalOpen, roadmapModalMode, roadmapTargetWeek, setIsRoadmapModalOpen, handleSaveRoadmapDay, formRoadmapDayTitle, setFormRoadmapDayTitle, formRoadmapDate, setFormRoadmapDate, formRoadmapMorningFocus, setFormRoadmapMorningFocus, formRoadmapAfternoonFocus, setFormRoadmapAfternoonFocus, formRoadmapDeliverables, setFormRoadmapDeliverables, newDeliverableInput, setNewDeliverableInput } = d;
  return (
    <>
      {/* Modal: Add / Edit Roadmap Day Card */}
        {isRoadmapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {roadmapModalMode === "ADD" ? "Add New Roadmap Day Card" : "Edit Roadmap Day Card"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Week {roadmapTargetWeek} Launch Push Roadmap
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoadmapModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRoadmapDay} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Day Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monday 19 Oct — Set up the machine"
                      value={formRoadmapDayTitle}
                      onChange={(e) => setFormRoadmapDayTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date (YYYY-MM-DD) *</label>
                    <input
                      type="date"
                      required
                      value={formRoadmapDate}
                      onChange={(e) => setFormRoadmapDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] mr-1">Morning Focus</span>
                    (8:00–12:00)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key priorities and high-volume outreach actions for the morning..."
                    value={formRoadmapMorningFocus}
                    onChange={(e) => setFormRoadmapMorningFocus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mr-1">Afternoon Focus</span>
                    (13:00–18:00)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Afternoon product demos, technical setups, client onboarding, support..."
                    value={formRoadmapAfternoonFocus}
                    onChange={(e) => setFormRoadmapAfternoonFocus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Key Deliverables &amp; Execution Targets ({formRoadmapDeliverables.length})
                  </label>

                  {/* List of deliverables with delete */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto mb-2 pr-1">
                    {formRoadmapDeliverables.length === 0 ? (
                      <div className="p-3 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                        No deliverables added yet. Add one below.
                      </div>
                    ) : (
                      formRoadmapDeliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormRoadmapDeliverables((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                            title="Remove deliverable"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add deliverable input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 20 billboard operator calls completed"
                      value={newDeliverableInput}
                      onChange={(e) => setNewDeliverableInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newDeliverableInput.trim()) {
                            setFormRoadmapDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                            setNewDeliverableInput("");
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDeliverableInput.trim()) {
                          setFormRoadmapDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                          setNewDeliverableInput("");
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Target</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRoadmapModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{roadmapModalMode === "ADD" ? "Create Day Card" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
