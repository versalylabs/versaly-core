"use client";

import { RefreshCw, Plus } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function TasksHeader({ d }: { d: TasksModel }) {
  const { execute5AMReset, openAddModal } = d;
  return (
    <>
      {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Operating Rhythm
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">5:00 AM Automated Daily Reset Active</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Tasks &amp; Daily Outreach Queue
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              High-urgency commercial actions across cold calling sprints, remote diagnostic audits, live software demos, follow-ups, and onboarding check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => execute5AMReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-sm transition"
              title="Uncheck completed items and reload today's weekly rhythm tasks"
            >
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
              <span>5:00 AM Reset Now</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Action</span>
            </button>
          </div>
        </div>
    </>
  );
}
