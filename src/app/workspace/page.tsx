"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CheckSquare,
  FolderGit2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Check,
  Layers,
} from "lucide-react";

// Data types
export interface WorkspaceTask {
  id: string;
  title: string;
  due: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  status: string;
  statusVariant: "warning" | "success" | "info" | "neutral";
  leadArchitect: string;
  description: string;
  targetGoLive: string;
  link: string;
}

export interface WorkspaceFollowUp {
  id: string;
  contact: string;
  description: string;
  channel: "WhatsApp" | "Call" | "Email" | "Meeting";
  due: string;
  link: string;
}

export interface WorkspaceApproval {
  id: string;
  title: string;
  description: string;
  type: "Proposal" | "Invoice" | "Discount" | "Contract" | "Scope";
  status: "Pending" | "Approved" | "Rejected";
  link: string;
}

// Storage keys
const STORAGE_TASKS = "versaly_workspace_tasks_v2";
const STORAGE_PROJECTS = "versaly_workspace_projects_v2";
const STORAGE_FOLLOWUPS = "versaly_workspace_followups_v2";
const STORAGE_APPROVALS = "versaly_workspace_approvals_v2";

// Initial seed data
const DEFAULT_TASKS: WorkspaceTask[] = [
  { id: "mt-1", title: "Normalize Safari Auto Clinic parts CSV (240 SKUs)", due: "Today 1:00 PM", priority: "HIGH", completed: false },
  { id: "mt-2", title: "Deliver Xprinter XP-420B to Express Wash Kilimani", due: "Today 4:30 PM", priority: "HIGH", completed: false },
  { id: "mt-3", title: "Confirm Safaricom Paybill reconciliation for QHX892L1P", due: "Today 5:30 PM", priority: "MEDIUM", completed: true },
  { id: "mt-4", title: "Review KRA/eTIMS tax invoice #1042 for Skyline Outdoor", due: "Tomorrow 9:00 AM", priority: "MEDIUM", completed: false },
];

const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: "mp-1",
    title: "Safari Auto Clinic Implementation",
    status: "Blocked (Parts CSV)",
    statusVariant: "warning",
    leadArchitect: "Ted Mwangi",
    description: "Lead Architect: Ted Mwangi. Normalizing 240 inventory spare parts before importing into PostgreSQL database.",
    targetGoLive: "Thursday",
    link: "/projects",
  },
  {
    id: "mp-2",
    title: "Express Wash Kilimani Implementation",
    status: "On Track (85%)",
    statusVariant: "success",
    leadArchitect: "Ted & David",
    description: "Lead Architect: Ted & David. Delivering Xprinter XP-420B thermal hardware today at 4:30 PM. Pickup notification WhatsApp workflow tested and verified.",
    targetGoLive: "Tomorrow",
    link: "/projects",
  },
];

const DEFAULT_FOLLOWUPS: WorkspaceFollowUp[] = [
  {
    id: "mf-1",
    contact: "Grandview Apartments (Faith Kimani)",
    description: "Answer board query on LipaTim automated rent billing Paybill reconciliation",
    channel: "WhatsApp",
    due: "Today 2:00 PM",
    link: "/communications",
  },
  {
    id: "mf-2",
    contact: "Turbo Precision Garage (Alex Mutua)",
    description: "Demo completed; owner evaluating KES 35,000 setup fee invoice",
    channel: "WhatsApp",
    due: "Today 4:00 PM",
    link: "/communications",
  },
  {
    id: "mf-3",
    contact: "Apex Auto Yard (Dennis M.)",
    description: "Follow up on Vehisoft DMS vehicle catalogue migration timeline",
    channel: "Call",
    due: "Tomorrow 10:00 AM",
    link: "/communications",
  },
  {
    id: "mf-4",
    contact: "City Cleaners Westlands (Purity)",
    description: "Share Versandry thermal receipt setup instructions and driver tags",
    channel: "Email",
    due: "Tomorrow 11:30 AM",
    link: "/communications",
  },
];

const DEFAULT_APPROVALS: WorkspaceApproval[] = [
  {
    id: "ma-1",
    title: "AI-Drafted Proposal: Grandview Apartments",
    description: "LipaTim 64-unit deployment scope with automated tenant STK push",
    type: "Proposal",
    status: "Pending",
    link: "/attention",
  },
  {
    id: "ma-2",
    title: "KES 5,000 Setup Discount: Skyline Outdoor",
    description: "Special launch concession for Adversoft 3-screen digital signage pilot",
    type: "Discount",
    status: "Pending",
    link: "/attention",
  },
  {
    id: "ma-3",
    title: "Tax Exemption Certificate: St. Jude Hospital",
    description: "Verify withholding tax exemption before issuing LipaTim invoice #1049",
    type: "Invoice",
    status: "Pending",
    link: "/finance",
  },
];

export default function MyWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"TASKS" | "PROJECTS" | "FOLLOWUPS" | "APPROVALS">("TASKS");

  // State with LocalStorage initialization
  const [myTasks, setMyTasks] = useState<WorkspaceTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_TASKS);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return DEFAULT_TASKS;
  });

  const [myProjects, setMyProjects] = useState<WorkspaceProject[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_PROJECTS);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return DEFAULT_PROJECTS;
  });

  const [myFollowUps, setMyFollowUps] = useState<WorkspaceFollowUp[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_FOLLOWUPS);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return DEFAULT_FOLLOWUPS;
  });

  const [myApprovals, setMyApprovals] = useState<WorkspaceApproval[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_APPROVALS);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return DEFAULT_APPROVALS;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS, JSON.stringify(myTasks));
      window.dispatchEvent(new CustomEvent("versaly_tasks_updated"));
    } catch {}
  }, [myTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(myProjects));
      window.dispatchEvent(new CustomEvent("versaly_projects_updated"));
    } catch {}
  }, [myProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FOLLOWUPS, JSON.stringify(myFollowUps));
    } catch {}
  }, [myFollowUps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPROVALS, JSON.stringify(myApprovals));
    } catch {}
  }, [myApprovals]);

  // Modal State
  const [modalType, setModalType] = useState<"TASK" | "PROJECT" | "FOLLOWUP" | "APPROVAL" | null>(null);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields - Task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState("Today 5:00 PM");
  const [taskPriority, setTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  // Form Fields - Project
  const [projTitle, setProjTitle] = useState("");
  const [projStatus, setProjStatus] = useState("In Progress");
  const [projStatusVariant, setProjStatusVariant] = useState<"warning" | "success" | "info" | "neutral">("info");
  const [projLead, setProjLead] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projGoLive, setProjGoLive] = useState("Next Week");
  const [projLink, setProjLink] = useState("/projects");

  // Form Fields - FollowUp
  const [fuContact, setFuContact] = useState("");
  const [fuDesc, setFuDesc] = useState("");
  const [fuChannel, setFuChannel] = useState<"WhatsApp" | "Call" | "Email" | "Meeting">("WhatsApp");
  const [fuDue, setFuDue] = useState("Today 3:00 PM");
  const [fuLink, setFuLink] = useState("/communications");

  // Form Fields - Approval
  const [appTitle, setAppTitle] = useState("");
  const [appDesc, setAppDesc] = useState("");
  const [appType, setAppType] = useState<"Proposal" | "Invoice" | "Discount" | "Contract" | "Scope">("Proposal");
  const [appStatus, setAppStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [appLink, setAppLink] = useState("/attention");

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "TASK" | "PROJECT" | "FOLLOWUP" | "APPROVAL";
    id: string;
    title: string;
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Task toggler
  const toggleTask = (id: string) => {
    setMyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Open Handlers
  const openAddTask = () => {
    setModalType("TASK");
    setModalMode("ADD");
    setEditingId(null);
    setTaskTitle("");
    setTaskDue("Today 5:00 PM");
    setTaskPriority("MEDIUM");
  };

  const openEditTask = (task: WorkspaceTask) => {
    setModalType("TASK");
    setModalMode("EDIT");
    setEditingId(task.id);
    setTaskTitle(task.title);
    setTaskDue(task.due);
    setTaskPriority(task.priority);
  };

  const openAddProject = () => {
    setModalType("PROJECT");
    setModalMode("ADD");
    setEditingId(null);
    setProjTitle("");
    setProjStatus("In Progress (50%)");
    setProjStatusVariant("info");
    setProjLead("Ted Mwangi");
    setProjDesc("");
    setProjGoLive("Next Week");
    setProjLink("/projects");
  };

  const openEditProject = (proj: WorkspaceProject) => {
    setModalType("PROJECT");
    setModalMode("EDIT");
    setEditingId(proj.id);
    setProjTitle(proj.title);
    setProjStatus(proj.status);
    setProjStatusVariant(proj.statusVariant);
    setProjLead(proj.leadArchitect);
    setProjDesc(proj.description);
    setProjGoLive(proj.targetGoLive);
    setProjLink(proj.link || "/projects");
  };

  const openAddFollowUp = () => {
    setModalType("FOLLOWUP");
    setModalMode("ADD");
    setEditingId(null);
    setFuContact("");
    setFuDesc("");
    setFuChannel("WhatsApp");
    setFuDue("Today 3:00 PM");
    setFuLink("/communications");
  };

  const openEditFollowUp = (fu: WorkspaceFollowUp) => {
    setModalType("FOLLOWUP");
    setModalMode("EDIT");
    setEditingId(fu.id);
    setFuContact(fu.contact);
    setFuDesc(fu.description);
    setFuChannel(fu.channel);
    setFuDue(fu.due);
    setFuLink(fu.link || "/communications");
  };

  const openAddApproval = () => {
    setModalType("APPROVAL");
    setModalMode("ADD");
    setEditingId(null);
    setAppTitle("");
    setAppDesc("");
    setAppType("Proposal");
    setAppStatus("Pending");
    setAppLink("/attention");
  };

  const openEditApproval = (app: WorkspaceApproval) => {
    setModalType("APPROVAL");
    setModalMode("EDIT");
    setEditingId(app.id);
    setAppTitle(app.title);
    setAppDesc(app.description);
    setAppType(app.type);
    setAppStatus(app.status);
    setAppLink(app.link || "/attention");
  };

  // Save Handlers
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (modalMode === "ADD") {
      const newTask: WorkspaceTask = {
        id: `mt-${Date.now()}`,
        title: taskTitle.trim(),
        due: taskDue.trim() || "Today",
        priority: taskPriority,
        completed: false,
      };
      setMyTasks((prev) => [newTask, ...prev]);
      showToast("Task added to workspace");
    } else if (editingId) {
      setMyTasks((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, title: taskTitle.trim(), due: taskDue.trim(), priority: taskPriority }
            : t
        )
      );
      showToast("Task updated");
    }
    setModalType(null);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    if (modalMode === "ADD") {
      const newProj: WorkspaceProject = {
        id: `mp-${Date.now()}`,
        title: projTitle.trim(),
        status: projStatus.trim(),
        statusVariant: projStatusVariant,
        leadArchitect: projLead.trim() || "Ted Mwangi",
        description: projDesc.trim(),
        targetGoLive: projGoLive.trim() || "TBD",
        link: projLink.trim() || "/projects",
      };
      setMyProjects((prev) => [newProj, ...prev]);
      showToast("Assigned project added");
    } else if (editingId) {
      setMyProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: projTitle.trim(),
                status: projStatus.trim(),
                statusVariant: projStatusVariant,
                leadArchitect: projLead.trim(),
                description: projDesc.trim(),
                targetGoLive: projGoLive.trim(),
                link: projLink.trim() || "/projects",
              }
            : p
        )
      );
      showToast("Project details updated");
    }
    setModalType(null);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuContact.trim()) return;

    if (modalMode === "ADD") {
      const newFu: WorkspaceFollowUp = {
        id: `mf-${Date.now()}`,
        contact: fuContact.trim(),
        description: fuDesc.trim(),
        channel: fuChannel,
        due: fuDue.trim() || "Today",
        link: fuLink.trim() || "/communications",
      };
      setMyFollowUps((prev) => [newFu, ...prev]);
      showToast("Follow-up item added");
    } else if (editingId) {
      setMyFollowUps((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                contact: fuContact.trim(),
                description: fuDesc.trim(),
                channel: fuChannel,
                due: fuDue.trim(),
                link: fuLink.trim() || "/communications",
              }
            : f
        )
      );
      showToast("Follow-up item updated");
    }
    setModalType(null);
  };

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle.trim()) return;

    if (modalMode === "ADD") {
      const newApp: WorkspaceApproval = {
        id: `ma-${Date.now()}`,
        title: appTitle.trim(),
        description: appDesc.trim(),
        type: appType,
        status: appStatus,
        link: appLink.trim() || "/attention",
      };
      setMyApprovals((prev) => [newApp, ...prev]);
      showToast("Approval item added");
    } else if (editingId) {
      setMyApprovals((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: appTitle.trim(),
                description: appDesc.trim(),
                type: appType,
                status: appStatus,
                link: appLink.trim() || "/attention",
              }
            : a
        )
      );
      showToast("Approval item updated");
    }
    setModalType(null);
  };

  // Delete Action Execution
  const executeDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    if (type === "TASK") {
      setMyTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Task removed");
    } else if (type === "PROJECT") {
      setMyProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("Project removed from workspace");
    } else if (type === "FOLLOWUP") {
      setMyFollowUps((prev) => prev.filter((f) => f.id !== id));
      showToast("Follow-up item removed");
    } else if (type === "APPROVAL") {
      setMyApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast("Approval item removed");
    }
    setDeleteTarget(null);
  };

  // Helper badge styles
  const getStatusBadge = (variant: WorkspaceProject["statusVariant"], label: string) => {
    if (variant === "warning") {
      return (
        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
          {label}
        </span>
      );
    }
    if (variant === "success") {
      return (
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
          {label}
        </span>
      );
    }
    if (variant === "info") {
      return (
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
          {label}
        </span>
      );
    }
    return (
      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
        {label}
      </span>
    );
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-indigo-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Personal Executive Cockpit
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">What Do I Need To Do Today?</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              My Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Your personal operational focus: assigned implementation projects, daily outreach queues, upcoming client meetings, and items waiting for your approval.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <span>View Company Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

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

        {/* Tab 3: Follow-ups */}
        {activeTab === "FOLLOWUPS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Immediate Sales &amp; Proposal Follow-ups Assigned to Me
                </span>
                <span className="text-[11px] text-slate-400">Direct outreach touchpoints and scheduled follow-ups</span>
              </div>
              <button
                onClick={openAddFollowUp}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Follow-up</span>
              </button>
            </div>

            {myFollowUps.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No scheduled follow-up actions right now.</p>
                <button
                  onClick={openAddFollowUp}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add a follow-up action
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{fu.contact}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase">
                          {fu.channel}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          {fu.due}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        {fu.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={fu.link || "/communications"}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition text-xs flex items-center gap-1.5 ${
                          fu.channel === "WhatsApp"
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white"
                        }`}
                      >
                        {fu.channel === "WhatsApp" && <MessageSquare className="h-3.5 w-3.5" />}
                        {fu.channel === "Call" && <Phone className="h-3.5 w-3.5" />}
                        {fu.channel === "Email" && <Mail className="h-3.5 w-3.5" />}
                        <span>Take Action</span>
                      </Link>

                      <button
                        onClick={() => openEditFollowUp(fu)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                        title="Edit follow-up"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: "FOLLOWUP", id: fu.id, title: fu.contact })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete follow-up"
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

        {/* Tab 4: Approvals */}
        {activeTab === "APPROVALS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Items Awaiting My Authorization
                </span>
                <span className="text-[11px] text-slate-400">Proposals, invoices, and contracts pending executive approval</span>
              </div>
              <button
                onClick={openAddApproval}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Approval</span>
              </button>
            </div>

            {myApprovals.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ShieldCheck className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No items currently waiting for authorization.</p>
                <button
                  onClick={openAddApproval}
                  className="text-xs text-indigo-400 hover:underline font-semibold"
                >
                  + Add an approval item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myApprovals.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{app.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold uppercase">
                          {app.type}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                            app.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : app.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        {app.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={app.link || "/attention"}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                      >
                        Review &amp; Authorize
                      </Link>

                      <button
                        onClick={() => openEditApproval(app)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-slate-800 transition"
                        title="Edit approval item"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: "APPROVAL", id: app.id, title: app.title })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete approval item"
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
      </div>

      {/* MODAL: TASK ADD / EDIT */}
      {modalType === "TASK" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Workspace Task" : "Edit Workspace Task"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Task Title / Action Item
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Call Safari Auto Clinic for parts CSV"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    placeholder="Today 4:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  {modalMode === "ADD" ? "Create Task" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROJECT ADD / EDIT */}
      {modalType === "PROJECT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Assigned Project" : "Edit Assigned Project"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Skyline Media LED Screen Implementation"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status Label
                  </label>
                  <input
                    type="text"
                    required
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                    placeholder="e.g. On Track (85%)"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Badge Color Tone
                  </label>
                  <select
                    value={projStatusVariant}
                    onChange={(e) => setProjStatusVariant(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="success">Green (Success / On Track)</option>
                    <option value="warning">Amber (Warning / Blocked)</option>
                    <option value="info">Indigo (Info / Testing)</option>
                    <option value="neutral">Slate (Neutral / Planned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Lead Architect / Owner
                  </label>
                  <input
                    type="text"
                    value={projLead}
                    onChange={(e) => setProjLead(e.target.value)}
                    placeholder="e.g. Ted Mwangi"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Go-Live
                  </label>
                  <input
                    type="text"
                    value={projGoLive}
                    onChange={(e) => setProjGoLive(e.target.value)}
                    placeholder="e.g. Thursday or 24 Oct"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description &amp; Operational Notes
                </label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Details regarding hardware, data migration, or client handoff..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  {modalMode === "ADD" ? "Create Project" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FOLLOW-UP ADD / EDIT */}
      {modalType === "FOLLOWUP" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Follow-up Action" : "Edit Follow-up Action"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Contact / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={fuContact}
                  onChange={(e) => setFuContact(e.target.value)}
                  placeholder="e.g. Grandview Apartments (Faith Kimani)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel
                  </label>
                  <select
                    value={fuChannel}
                    onChange={(e) => setFuChannel(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Due Date / Time
                  </label>
                  <input
                    type="text"
                    value={fuDue}
                    onChange={(e) => setFuDue(e.target.value)}
                    placeholder="Today 3:00 PM"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Touchpoint Objective / Description
                </label>
                <textarea
                  rows={3}
                  value={fuDesc}
                  onChange={(e) => setFuDesc(e.target.value)}
                  placeholder="e.g. Answer board query on LipaTim automated rent billing..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  {modalMode === "ADD" ? "Create Follow-up" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPROVAL ADD / EDIT */}
      {modalType === "APPROVAL" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Add Approval Item" : "Edit Approval Item"}</span>
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApproval} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="e.g. AI-Drafted Proposal: Grandview Apartments"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Approval Type
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Discount">Discount</option>
                    <option value="Contract">Contract</option>
                    <option value="Scope">Scope Change</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Scope &amp; Approval Justification
                </label>
                <textarea
                  rows={3}
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  placeholder="e.g. LipaTim 64-unit deployment scope with automated tenant STK push..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  {modalMode === "ADD" ? "Create Approval" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Confirm Deletion</h3>
                <p className="text-[11px] text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              Are you sure you want to remove <span className="font-bold text-white">"{deleteTarget.title}"</span> from your workspace?
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
