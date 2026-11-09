"use client";

import { Plus, FolderGit2, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { MyWorkspaceModel } from "./use-my-workspace";

export function ProjectsTab({ d }: { d: MyWorkspaceModel }) {
  const { activeTab, openAddProject, myProjects, getStatusBadge, openEditProject, setDeleteTarget } = d;
  return (
    <>
      {/* Tab 2: Projects */}
        {activeTab === "PROJECTS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Assigned Implementation Projects
                </span>
                <span className="text-[11px] text-slate-400">Manage client deployment status and go-live schedules</span>
              </div>
              <button
                onClick={openAddProject}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {myProjects.length === 0 ? (
              <div className="liquid-glass p-10 rounded-2xl border border-slate-800/80 text-center space-y-2">
                <FolderGit2 className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No projects currently assigned to you.</p>
                <button
                  onClick={openAddProject}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add a new project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white block truncate">
                          {proj.title}
                        </span>
                        <span className="text-[11px] text-indigo-400 font-medium">
                          Lead: {proj.leadArchitect}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(proj.statusVariant, proj.status)}
                        <button
                          onClick={() => openEditProject(proj)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                          title="Edit project"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "PROJECT", id: proj.id, title: proj.title })}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                      {proj.description || "No project description specified."}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/60">
                      <span className="text-slate-500 font-mono text-[11px]">
                        Target Go-Live: {proj.targetGoLive}
                      </span>
                      <Link
                        href={proj.link || "/projects"}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition"
                      >
                        <span>Open Project</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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
