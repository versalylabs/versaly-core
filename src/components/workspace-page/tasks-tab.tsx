"use client";

import { Plus, CheckSquare, CheckCircle2, Pencil, Trash2 } from "lucide-react";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function TasksTab({ d }: { d: MyWorkspaceModel }) {
  const { activeTab, openAddTask, myTasks, toggleTask, openEditTask, setDeleteTarget } = d;
  return (
    <>
      {/* Tab 1: Tasks */}
        {activeTab === "TASKS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  My Assigned Daily Action Tasks
                </span>
                <span className="text-[11px] text-slate-400">Click circle to toggle completion</span>
              </div>
              <button
                onClick={openAddTask}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckSquare className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No tasks currently in your queue.</p>
                <button
                  onClick={openAddTask}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add your first task
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {myTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between text-xs group ${
                      t.completed
                        ? "bg-slate-950/40 border-slate-800/60 text-slate-500"
                        : "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div
                      onClick={() => toggleTask(t.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-3"
                    >
                      <button
                        type="button"
                        className={`h-4 w-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                          t.completed
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "border-slate-600 hover:border-indigo-400"
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <span className={`font-medium truncate ${t.completed ? "line-through text-slate-500" : ""}`}>
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono text-[10px] text-amber-400">{t.due}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          t.priority === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : t.priority === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.priority}
                      </span>

                      {/* Edit & Delete Controls */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTask(t);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                        title="Edit task"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: "TASK", id: t.id, title: t.title });
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </>
  );
}
