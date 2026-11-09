"use client";

import { Search, Clock, Edit2, Trash2 } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function DailyQueueTab({ d }: { d: TasksModel }) {
  const { activeTab, pendingCount, completedCount, tasks, setStatusFilter, statusFilter, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, filteredTasks, toggleTask, openEditModal, setDeleteConfirmTask } = d;
  return (
    <>
      {/* Tab 1: Daily Active Queue */}
        {activeTab === "DAILY" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Action Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Pending Today</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
                  {pendingCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Due before 6:00 PM</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Completed Today</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                  {completedCount}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Logged into activity audit</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Outreach Actions</div>
                <div className="text-2xl font-extrabold text-indigo-300 mt-1 font-mono">
                  {tasks.filter((t) => t.category === "Outreach").length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Phone calls &amp; WhatsApp</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Daily Completion Rate</div>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                  {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Operating rhythm target: 85%</div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {["ALL", "PENDING", "COMPLETED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      statusFilter === status
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {status === "ALL" ? "All Tasks" : status === "PENDING" ? "To Do" : "Completed"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search action or client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Demos">Demos</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Content">Content</option>
                  <option value="Review">Review</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 liquid-glass rounded-2xl p-8 border border-slate-800">
                  No tasks matching the selected filter. Click &quot;5:00 AM Reset Now&quot; to reload today&apos;s rhythm.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const priorityBadge =
                    task.priority === "HIGH"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : task.priority === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20";

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 cursor-pointer group ${
                        task.completed
                          ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="mt-1 sm:mt-0 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-semibold ${
                                task.completed
                                  ? "line-through text-slate-500"
                                  : "text-slate-100 group-hover:text-indigo-300"
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${priorityBadge}`}
                            >
                              {task.priority}
                            </span>
                            {task.timeSlot && (
                              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.2 rounded border border-slate-800 font-mono">
                                {task.timeSlot}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            <span className="font-medium text-indigo-400">{task.product}</span>
                            <span>•</span>
                            <span className="text-slate-500">{task.category}</span>
                            {task.due && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span>{task.due}</span>
                                </span>
                              </>
                            )}
                            {task.contactPerson && (
                              <>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">
                                  Contact: {task.contactPerson}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(task, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit action"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmTask(task);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Delete action"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
    </>
  );
}
