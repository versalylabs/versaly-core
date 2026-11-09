"use client";

import { CheckSquare, Calendar, Layers } from "lucide-react";

import type { TasksModel } from "./use-tasks";

export function TasksTabs({ d }: { d: TasksModel }) {
  const { setActiveTab, activeTab, tasks } = d;
  return (
    <>
      {/* Action View Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            onClick={() => setActiveTab("DAILY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "DAILY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Daily Active Queue ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("WEEKLY_RHYTHM")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "WEEKLY_RHYTHM"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Weekly Operating Rhythm (Mon–Sun)</span>
          </button>

          <button
            onClick={() => setActiveTab("FOUR_WEEKS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "FOUR_WEEKS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>4-Week Launch Roadmap (Oct 19 – Nov 14)</span>
          </button>
        </div>
    </>
  );
}
