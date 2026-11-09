"use client";

import { Sparkles, RotateCcw, Edit2, ArrowRight } from "lucide-react";
import { WEEKLY_RHYTHM_TEMPLATES, DailyTask } from "@/data/tasks-data";

import type { TasksModel } from "./use-tasks";

export function WeeklyRhythmTab({ d }: { d: TasksModel }) {
  const { activeTab, handleResetRhythmsDefaults, weeklyRhythms, todayDayIdx, openEditRhythmModal, setTasks, setActiveTab, setToastMessage } = d;
  return (
    <>
      {/* Tab 2: Weekly Operating Rhythm (Mon-Sun) */}
        {activeTab === "WEEKLY_RHYTHM" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="liquid-glass p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    Versaly Weekly Operating Rhythm (from Week 2)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Structured commercial routine balancing morning high-volume cold outreach (calls, WhatsApp, email), late-morning follow-ups, and afternoon product demos, technical setups, and support. Auto-reloads each morning at 5:00 AM.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetRhythmsDefaults}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Default Rhythm</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                const rhythm = weeklyRhythms[dayIdx] || WEEKLY_RHYTHM_TEMPLATES[dayIdx];
                const isToday = todayDayIdx === dayIdx;

                return (
                  <div
                    key={dayIdx}
                    className={`liquid-glass p-5 rounded-2xl border flex flex-col justify-between transition ${
                      isToday
                        ? "border-amber-500/50 ring-1 ring-amber-500/30"
                        : "border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{rhythm.dayName}</h4>
                          {isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            {rhythm.tasks.length} tasks
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditRhythmModal(dayIdx)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition"
                            title={`Edit ${rhythm.dayName} rhythm & recurring tasks`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mt-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                            Morning (8:00–10:00)
                          </span>
                          <span className="text-slate-300">{rhythm.morningSlot}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                            Late Morning (10:00–13:00)
                          </span>
                          <span className="text-slate-300">{rhythm.lateMorningSlot}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                            Afternoon (14:00–18:00)
                          </span>
                          <span className="text-slate-300">{rhythm.afternoonSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Auto-loads at 5:00 AM</span>
                      <button
                        onClick={() => {
                          const newTasks: DailyTask[] = rhythm.tasks.map((t, idx) => ({
                            id: `rhythm-manual-${dayIdx}-${idx}-${Date.now()}`,
                            title: t.title,
                            category: t.category,
                            product: t.product,
                            due: `Today ${t.due}`,
                            priority: t.priority,
                            completed: false,
                            timeSlot: t.timeSlot,
                          }));
                          setTasks(newTasks);
                          setActiveTab("DAILY");
                          setToastMessage(`✓ Loaded ${rhythm.dayName}'s rhythm tasks into active queue!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Load Day&apos;s Rhythm</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </>
  );
}
