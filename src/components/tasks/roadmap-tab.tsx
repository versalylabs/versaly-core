"use client";

import { Plus, RotateCcw, Edit2, Trash2, X, CheckCircle2 } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function RoadmapTab({ d }: { d: TasksModel }) {
  const { activeTab, roadmapWeeks, setSelectedWeekNumber, selectedWeekNumber, openAddRoadmapDayModal, handleResetRoadmapDefaults, loadRoadmapDayIntoQueue, openEditRoadmapDayModal, setDeleteConfirmRoadmapDay, setActiveInlineAddDay, activeInlineAddDay, setInlineDeliverableText, inlineDeliverableText, handleAddDeliverableInline, handleRemoveDeliverable } = d;
  return (
    <>
      {/* Tab 3: 4-Week Launch Roadmap (Oct 19 – Nov 14) */}
        {activeTab === "FOUR_WEEKS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Week Selector Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roadmapWeeks.map((w) => (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekNumber(w.weekNumber)}
                  className={`p-4 rounded-xl text-left border transition ${
                    selectedWeekNumber === w.weekNumber
                      ? "liquid-glass border-indigo-500/50 ring-1 ring-indigo-500/40 shadow-lg"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Week {w.weekNumber}
                  </div>
                  <div className="font-bold text-xs text-white mt-0.5 truncate">{w.theme}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{w.dateRange}</div>
                </button>
              ))}
            </div>

            {/* Selected Week Detail Card */}
            {(() => {
              const currentWeek =
                roadmapWeeks.find((w) => w.weekNumber === selectedWeekNumber) ||
                roadmapWeeks[0];

              return (
                <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Launch Roadmap • Week {currentWeek.weekNumber}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 font-mono">{currentWeek.dateRange}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{currentWeek.theme}</h3>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Week {currentWeek.weekNumber} Targets
                        </span>
                        <span className="text-emerald-400 font-semibold">{currentWeek.targetsSummary}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddRoadmapDayModal(currentWeek.weekNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Day Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetRoadmapDefaults}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-xs flex items-center gap-1"
                        title="Reset Roadmap to Default Plan"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Days in Selected Week */}
                  <div className="space-y-4">
                    {currentWeek.days.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                        No day cards in this week. Click &quot;Add Day Card&quot; above to create one.
                      </div>
                    ) : (
                      currentWeek.days.map((day) => (
                        <div
                          key={day.date}
                          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3 hover:border-slate-700 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/60">
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{day.dayTitle}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => loadRoadmapDayIntoQueue(day.dayTitle, day.keyDeliverables)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition shrink-0"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Load Into Daily Queue</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditRoadmapDayModal(currentWeek.weekNumber, day)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                                title="Edit Day Card"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmRoadmapDay({
                                    weekNumber: currentWeek.weekNumber,
                                    date: day.date,
                                    dayTitle: day.dayTitle,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition"
                                title="Delete Day Card"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                Morning Focus
                              </span>
                              <p className="text-slate-300 leading-relaxed">
                                {day.morningFocus || "No morning focus specified"}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                Afternoon Focus
                              </span>
                              <p className="text-slate-300 leading-relaxed">
                                {day.afternoonFocus || "No afternoon focus specified"}
                              </p>
                            </div>
                          </div>

                          {/* Deliverables checklist */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Key Deliverables &amp; Execution Targets ({day.keyDeliverables.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveInlineAddDay(activeInlineAddDay === day.date ? null : day.date);
                                  setInlineDeliverableText("");
                                }}
                                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Target</span>
                              </button>
                            </div>

                            {activeInlineAddDay === day.date && (
                              <div className="mb-2 p-2 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={inlineDeliverableText}
                                  onChange={(e) => setInlineDeliverableText(e.target.value)}
                                  placeholder="Enter new execution target..."
                                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddDeliverableInline(currentWeek.weekNumber, day.date);
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddDeliverableInline(currentWeek.weekNumber, day.date)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveInlineAddDay(null)}
                                  className="p-1 text-slate-400 hover:text-slate-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {day.keyDeliverables.map((item, dIdx) => (
                                <div
                                  key={`${item}-${dIdx}`}
                                  className="flex items-center justify-between gap-2 text-slate-300 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 group/item hover:border-slate-700 transition"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                    <span className="truncate">{item}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDeliverable(currentWeek.weekNumber, day.date, dIdx)}
                                    className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                                    title="Remove target"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
    </>
  );
}
