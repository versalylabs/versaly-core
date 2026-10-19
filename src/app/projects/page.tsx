"use client";

import { useState, useMemo } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  AlertTriangle,
  Check,
  ShieldAlert,
} from "lucide-react";
import {
  INITIAL_PROJECTS,
  ImplementationProjectItem,
} from "@/data/clients-projects-seed";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ImplementationProjectItem[]>(INITIAL_PROJECTS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_PROJECTS[0].id);

  // Toggle task completion
  function handleToggleTask(projectId: string, taskId: string) {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const updatedTasks = proj.tasks.map((t) => {
            if (t.id === taskId) {
              return { ...t, completed: !t.completed, completedAt: !t.completed ? "Just now" : undefined };
            }
            return t;
          });

          const completedCount = updatedTasks.filter((t) => t.completed).length;
          const progressPct = Math.round((completedCount / updatedTasks.length) * 100);
          const isComplete = progressPct === 100;

          return {
            ...proj,
            tasks: updatedTasks,
            progressPct,
            status: isComplete ? "COMPLETED" : proj.hasBlocker ? "BLOCKED" : "ACTIVE",
          };
        }
        return proj;
      })
    );
  }

  // Toggle blocker resolution
  function handleToggleBlocker(projectId: string) {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const newHasBlocker = !proj.hasBlocker;
          return {
            ...proj,
            hasBlocker: newHasBlocker,
            status: newHasBlocker ? "BLOCKED" : proj.progressPct === 100 ? "COMPLETED" : "ACTIVE",
          };
        }
        return proj;
      })
    );
  }

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesProduct = productFilter === "ALL" || p.productSlug === productFilter;
      return matchesStatus && matchesProduct;
    });
  }, [projects, statusFilter, productFilter]);

  const blockedCount = useMemo(() => {
    return projects.filter((p) => p.hasBlocker).length;
  }, [projects]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Implementation Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-amber-400">Automated 8-Step Go-Live System</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Client Implementations & Go-Live Trackers
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Prevent slow or stalled onboarding. Supervise task delivery, assign team leads, track client dependencies, and resolve blockers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              {projects.length} Active Implementations
            </span>
          </div>
        </div>

        {/* Blocker Alert Banner */}
        {blockedCount > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>
                <strong>{blockedCount} implementation blocked:</strong> Client dependencies require immediate operational attention to preserve target go-live dates.
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "ACTIVE", "BLOCKED", "COMPLETED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {s === "ALL" ? "All Projects" : s}
              </button>
            ))}
          </div>

          {/* Product Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { slug: "ALL", label: "All Products" },
              { slug: "adversoft", label: "Adversoft" },
              { slug: "vehisoft", label: "Vehisoft" },
              { slug: "versandry", label: "Versandry" },
            ].map((p) => (
              <button
                key={p.slug}
                onClick={() => setProductFilter(p.slug)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition ${
                  productFilter === p.slug
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Implementation Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List (1 col) */}
          <div className="space-y-3">
            {filteredProjects.map((proj) => {
              const isSelected = selectedProject.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-2 group ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/40 shadow-sm"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                          {proj.clientName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                          {proj.productName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{proj.name}</p>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        proj.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : proj.status === "BLOCKED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{proj.progressPct}% Complete</span>
                      <span>Target: {proj.targetGoLiveDate}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${proj.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {proj.hasBlocker && (
                    <div className="text-[10px] text-rose-400 font-medium flex items-center gap-1 pt-1 border-t border-slate-800/60">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{proj.blockerDescription}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Project Details & Interactive 8-Step Checklist (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-6">
            {/* Project Header Card */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{selectedProject.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {selectedProject.productName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Client: <strong className="text-slate-200">{selectedProject.clientName}</strong></span>
                    <span>•</span>
                    <span>Lead: <strong className="text-slate-200">{selectedProject.leadArchitect}</strong></span>
                    <span>•</span>
                    <span>Target Go-Live: <strong className="text-indigo-400">{selectedProject.targetGoLiveDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBlocker(selectedProject.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      selectedProject.hasBlocker
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                        : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{selectedProject.hasBlocker ? "Resolve Blocker" : "Flag Blocker"}</span>
                  </button>
                </div>
              </div>

              {/* Blocker Notice Box */}
              {selectedProject.hasBlocker && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Active Implementation Blocker</span>
                    </span>
                    <span className="font-mono text-[11px]">{selectedProject.blockerDays} days blocked</span>
                  </div>
                  <p className="text-rose-200/90 leading-relaxed">{selectedProject.blockerDescription}</p>
                </div>
              )}
            </div>

            {/* Interactive 8-Step Milestone Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  The 8-Step Onboarding Milestones
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {selectedProject.tasks.filter((t) => t.completed).length} of 8 Steps Complete ({selectedProject.progressPct}%)
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(selectedProject.id, task.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      task.completed
                        ? "bg-slate-950/40 border-slate-800/60 opacity-80"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`h-5 w-5 rounded-md flex items-center justify-center border transition ${
                          task.completed
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-slate-700 bg-slate-900 text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-100"}`}>
                            Step {task.stepNumber}: {task.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right text-[11px]">
                      <span className="text-slate-400">Owner: {task.assignedTo}</span>
                      {task.completedAt && (
                        <span className="text-emerald-400 font-medium font-mono">({task.completedAt})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
