"use client";



import type { MyWorkspaceModel } from "./use-my-workspace";

export function StatusCards({ d }: { d: MyWorkspaceModel }) {
  const { myTasks, myProjects, myFollowUps, myApprovals } = d;
  return (
    <>
      {/* Dynamic Personal Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="liquid-glass p-4 rounded-xl border border-indigo-500/30">
            <span className="text-slate-400 font-medium">My Open Tasks</span>
            <div className="text-2xl font-bold text-white mt-1">
              {myTasks.filter((t) => !t.completed).length}
            </div>
            <div className="text-[10px] text-amber-400 mt-1">
              {myTasks.filter((t) => !t.completed && t.priority === "HIGH").length} high priority due
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">My Active Projects</span>
            <div className="text-2xl font-bold text-slate-200 mt-1">
              {myProjects.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              {myProjects.map((p) => p.title.split(" ")[0]).join(", ") || "No projects"}
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">My Follow-ups</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              {myFollowUps.length}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Direct client communications</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-violet-500/30">
            <span className="text-slate-400 font-medium">My Approvals</span>
            <div className="text-2xl font-bold text-violet-300 mt-1">
              {myApprovals.length}
            </div>
            <div className="text-[10px] text-violet-400 mt-1">Awaiting sign-off</div>
          </div>
        </div>
    </>
  );
}
