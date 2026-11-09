"use client";

import { CheckSquare, FolderGit2, Clock, ShieldCheck } from "lucide-react";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function WorkspaceTabs({ d }: { d: MyWorkspaceModel }) {
  const { setActiveTab, activeTab, myTasks, myProjects, myFollowUps, myApprovals } = d;
  return (
    <>
      {/* Dynamic Tab Navigation with Live Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab("TASKS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              activeTab === "TASKS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>My Tasks ({myTasks.filter((t) => !t.completed).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PROJECTS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              activeTab === "PROJECTS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>My Assigned Projects ({myProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("FOLLOWUPS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              activeTab === "FOLLOWUPS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>My Follow-ups ({myFollowUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("APPROVALS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              activeTab === "APPROVALS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Awaiting My Approval ({myApprovals.length})</span>
          </button>
        </div>
    </>
  );
}
