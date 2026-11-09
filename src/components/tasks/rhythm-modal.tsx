"use client";

import { Sparkles, X, CheckCircle2, Plus, CheckSquare } from "lucide-react";
import { DailyTask } from "@/data/tasks-data";

import type { TasksModel } from "./use-tasks";

export function RhythmModal({ d }: { d: TasksModel }) {
  const { isRhythmModalOpen, formRhythmDayName, setIsRhythmModalOpen, handleSaveRhythm, formRhythmMorningSlot, setFormRhythmMorningSlot, formRhythmLateMorningSlot, setFormRhythmLateMorningSlot, formRhythmAfternoonSlot, setFormRhythmAfternoonSlot, formRhythmTasks, setFormRhythmTasks, newRhythmTaskTitle, setNewRhythmTaskTitle, newRhythmTaskSlot, setNewRhythmTaskSlot, newRhythmTaskProduct, setNewRhythmTaskProduct, catalogProducts, newRhythmTaskCategory, setNewRhythmTaskCategory, newRhythmTaskPriority, setNewRhythmTaskPriority, newRhythmTaskDue, setNewRhythmTaskDue } = d;
  return (
    <>
      {/* Modal: Edit Weekly Operating Rhythm */}
        {isRhythmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Edit {formRhythmDayName} Operating Rhythm
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Customize timeslots and 5:00 AM recurring tasks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRhythmModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRhythm} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Morning Slot (8:00–10:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmMorningSlot}
                    onChange={(e) => setFormRhythmMorningSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Late Morning Slot (10:00–13:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmLateMorningSlot}
                    onChange={(e) => setFormRhythmLateMorningSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Afternoon Slot (14:00–18:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmAfternoonSlot}
                    onChange={(e) => setFormRhythmAfternoonSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    5:00 AM Auto-Reload Tasks ({formRhythmTasks.length})
                  </label>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2 pr-1">
                    {formRhythmTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormRhythmTasks((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                          title="Remove task"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Add New 5 AM Task
                    </span>
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={newRhythmTaskTitle}
                      onChange={(e) => setNewRhythmTaskTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newRhythmTaskSlot}
                        onChange={(e) =>
                          setNewRhythmTaskSlot(
                            e.target.value as "Morning (8:00–10:00)" | "Late morning (10:00–13:00)" | "Afternoon (14:00–18:00)"
                          )
                        }
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        <option value="Morning (8:00–10:00)">Morning (8:00–10:00)</option>
                        <option value="Late morning (10:00–13:00)">Late morning (10:00–13:00)</option>
                        <option value="Afternoon (14:00–18:00)">Afternoon (14:00–18:00)</option>
                      </select>
                      <select
                        value={newRhythmTaskProduct}
                        onChange={(e) => setNewRhythmTaskProduct(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        {catalogProducts.map((p) => (
                          <option key={p.slug} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                        <option value="Multi-product">Multi-product</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={newRhythmTaskCategory}
                        onChange={(e) => setNewRhythmTaskCategory(e.target.value as DailyTask["category"])}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      >
                        <option value="Outreach">Outreach</option>
                        <option value="Demos">Demos</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Content">Content</option>
                        <option value="Review">Review</option>
                        <option value="Finance">Finance</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <select
                        value={newRhythmTaskPriority}
                        onChange={(e) => setNewRhythmTaskPriority(e.target.value as DailyTask["priority"])}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Due (e.g. 10:00 AM)"
                        value={newRhythmTaskDue}
                        onChange={(e) => setNewRhythmTaskDue(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRhythmTaskTitle.trim()) return;
                        setFormRhythmTasks((prev) => [
                          ...prev,
                          {
                            title: newRhythmTaskTitle.trim(),
                            category: newRhythmTaskCategory,
                            product: newRhythmTaskProduct,
                            due: newRhythmTaskDue,
                            priority: newRhythmTaskPriority,
                            timeSlot: newRhythmTaskSlot,
                          },
                        ]);
                        setNewRhythmTaskTitle("");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Rhythm</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRhythmModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Save Rhythm</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}
