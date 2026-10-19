"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  AlertTriangle,
  Check,
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  X,
  FolderGit2,
  AlertCircle,
} from "lucide-react";
import {
  INITIAL_PROJECTS,
  ImplementationProjectItem,
  ProjectTaskItem,
} from "@/data/clients-projects-seed";

const STORAGE_KEY = "versaly_projects_list_v2";

const DEFAULT_8_STEPS = [
  { stepNumber: 1, title: "Agreement & Payment Instructions", description: "Send MSA contract and setup fee Paybill invoice", assignedTo: "Ted" },
  { stepNumber: 2, title: "Payment Confirmation", description: "Confirm setup fee receipt via M-Pesa or bank", assignedTo: "Finance" },
  { stepNumber: 3, title: "Data Collection & Layout", description: "Collect operational catalogs, floor/bay layout, and contacts", assignedTo: "David" },
  { stepNumber: 4, title: "Product Configuration & Setup", description: "Upload initial database catalogs and configure rates", assignedTo: "Ted" },
  { stepNumber: 5, title: "Team & Staff Training", description: "Conduct training with frontline operational team", assignedTo: "David" },
  { stepNumber: 6, title: "First Live Intake Transaction", description: "Shadow live transaction intake on premise", assignedTo: "David" },
  { stepNumber: 7, title: "First Measurable Win Confirmation", description: "Confirm 100% digital tracking across 3 consecutive days", assignedTo: "Ted" },
  { stepNumber: 8, title: "30-Day Executive Review & Referral", description: "Review metrics and request client referral", assignedTo: "Mercy" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ImplementationProjectItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PROJECTS;
  });

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PROJECTS[0]?.id || "";
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ImplementationProjectItem | null>(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState<ImplementationProjectItem | null>(null);
  const [blockerModalProject, setBlockerModalProject] = useState<ImplementationProjectItem | null>(null);
  const [blockerInputText, setBlockerInputText] = useState("");

  // Form State
  const [formName, setFormName] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formProductSlug, setFormProductSlug] = useState("vehisoft");
  const [formLeadArchitect, setFormLeadArchitect] = useState("Ted Khalwale (Lead)");
  const [formTargetDate, setFormTargetDate] = useState("2026-11-15");
  const [formStatus, setFormStatus] = useState<ImplementationProjectItem["status"]>("ACTIVE");

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const productMap: Record<string, string> = {
    adversoft: "Adversoft",
    vehisoft: "Vehisoft",
    versandry: "Versandry",
    lipatim: "LipaTim",
    "melio-rms": "Melio RMS",
  };

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

  // Open Blocker Modal
  function handleOpenBlockerModal(proj: ImplementationProjectItem) {
    setBlockerModalProject(proj);
    setBlockerInputText(proj.blockerDescription || "");
  }

  // Save or Resolve Blocker
  function handleSaveBlocker() {
    if (!blockerModalProject) return;

    if (blockerModalProject.hasBlocker) {
      // Resolve it
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === blockerModalProject.id) {
            return {
              ...p,
              hasBlocker: false,
              blockerDescription: undefined,
              blockerDays: undefined,
              status: p.progressPct === 100 ? "COMPLETED" : "ACTIVE",
            };
          }
          return p;
        })
      );
    } else {
      // Flag it
      if (!blockerInputText.trim()) return;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === blockerModalProject.id) {
            return {
              ...p,
              hasBlocker: true,
              blockerDescription: blockerInputText.trim(),
              blockerDays: 1,
              status: "BLOCKED",
            };
          }
          return p;
        })
      );
    }

    setBlockerModalProject(null);
  }

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
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

  const openAddModal = () => {
    setEditingProject(null);
    setFormName("");
    setFormClientName("");
    setFormProductSlug("vehisoft");
    setFormLeadArchitect("Ted Khalwale (Lead)");
    setFormTargetDate("2026-11-15");
    setFormStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const openEditModal = (proj: ImplementationProjectItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProject(proj);
    setFormName(proj.name);
    setFormClientName(proj.clientName);
    setFormProductSlug(proj.productSlug);
    setFormLeadArchitect(proj.leadArchitect);
    setFormTargetDate(proj.targetGoLiveDate);
    setFormStatus(proj.status);
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formClientName.trim()) return;

    if (editingProject) {
      // Update
      const updated: ImplementationProjectItem = {
        ...editingProject,
        name: formName.trim(),
        clientName: formClientName.trim(),
        productSlug: formProductSlug,
        productName: productMap[formProductSlug] || "Custom Solution",
        leadArchitect: formLeadArchitect.trim(),
        targetGoLiveDate: formTargetDate,
        status: formStatus,
      };

      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updated : p)));
    } else {
      // Add
      const newId = `proj-${Date.now()}`;
      const defaultTasks: ProjectTaskItem[] = DEFAULT_8_STEPS.map((s, idx) => ({
        id: `tsk-${newId}-${idx + 1}`,
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
        completed: false,
        assignedTo: s.assignedTo,
      }));

      const newProj: ImplementationProjectItem = {
        id: newId,
        clientId: `cli-${Date.now()}`,
        clientName: formClientName.trim(),
        name: formName.trim(),
        productSlug: formProductSlug,
        productName: productMap[formProductSlug] || "Custom Solution",
        status: formStatus,
        leadArchitect: formLeadArchitect.trim(),
        targetGoLiveDate: formTargetDate,
        progressPct: 0,
        hasBlocker: false,
        tasks: defaultTasks,
      };

      setProjects((prev) => [newProj, ...prev]);
      setSelectedProjectId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProject = (projId: string) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projId);
      if (selectedProjectId === projId && remaining.length > 0) {
        setSelectedProjectId(remaining[0].id);
      }
      return remaining;
    });
    setDeleteConfirmProject(null);
  };

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

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Implementation</span>
            </button>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20">
              {projects.length} Active
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
              { slug: "lipatim", label: "LipaTim" },
              { slug: "melio-rms", label: "Melio RMS" },
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
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No implementation projects found.</p>
                <button
                  onClick={openAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>New Project</span>
                </button>
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 group relative ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/40 shadow-sm"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-200 transition-colors truncate">
                            {proj.clientName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700 shrink-0">
                            {proj.productName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{proj.name}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
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

                        {/* Quick action buttons */}
                        <button
                          type="button"
                          onClick={(e) => openEditModal(proj, e)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                          title="Edit Project"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmProject(proj);
                          }}
                          className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                          title="Delete Project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
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
              })
            )}
          </div>

          {/* Project Details & Interactive 8-Step Checklist (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 space-y-6">
            {selectedProject ? (
              <>
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
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                        <span>
                          Client: <strong className="text-slate-200">{selectedProject.clientName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Lead: <strong className="text-slate-200">{selectedProject.leadArchitect}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Target: <strong className="text-indigo-400">{selectedProject.targetGoLiveDate}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(selectedProject)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1"
                        title="Edit Project Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleOpenBlockerModal(selectedProject)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                          selectedProject.hasBlocker
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{selectedProject.hasBlocker ? "Resolve Blocker" : "Flag Blocker"}</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmProject(selectedProject)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        title="Delete Implementation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                        <span className="font-mono text-[11px]">{selectedProject.blockerDays || 1} days blocked</span>
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
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select an implementation project to view the checklist.
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {editingProject ? "Edit Implementation Project" : "New Implementation Project"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vehisoft Mechanic Bay Onboarding"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Client Business *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Clinic"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Solution</label>
                    <select
                      value={formProductSlug}
                      onChange={(e) => setFormProductSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="vehisoft">Vehisoft</option>
                      <option value="versandry">Versandry</option>
                      <option value="adversoft">Adversoft</option>
                      <option value="lipatim">LipaTim</option>
                      <option value="melio-rms">Melio RMS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Lead Architect</label>
                    <input
                      type="text"
                      value={formLeadArchitect}
                      onChange={(e) => setFormLeadArchitect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Go-Live</label>
                    <input
                      type="date"
                      value={formTargetDate}
                      onChange={(e) => setFormTargetDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as ImplementationProjectItem["status"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingProject ? "Save Changes" : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Blocker Modal */}
        {blockerModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {blockerModalProject.hasBlocker ? "Resolve Implementation Blocker" : "Flag Implementation Blocker"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{blockerModalProject.name}</p>
                </div>
              </div>

              {blockerModalProject.hasBlocker ? (
                <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  Are you ready to mark this blocker as resolved and return this implementation project to <strong>ACTIVE</strong> status?
                </p>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-300 font-semibold">Blocker Reason & Client Dependency:</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Waiting for client to provide spare parts Excel list..."
                    value={blockerInputText}
                    onChange={(e) => setBlockerInputText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlockerModalProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBlocker}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                    blockerModalProject.hasBlocker
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                      : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25"
                  }`}
                >
                  {blockerModalProject.hasBlocker ? "Confirm Resolution" : "Flag Blocker"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Implementation Project?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will remove <strong className="text-white">{deleteConfirmProject.name}</strong> and all associated milestone task records.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(deleteConfirmProject.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/25"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
