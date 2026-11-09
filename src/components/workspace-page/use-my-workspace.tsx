"use client";

import { useState, useEffect } from "react";
import { appStorage } from "@/lib/app-storage";
import { WorkspaceTask, STORAGE_TASKS, DEFAULT_TASKS, WorkspaceProject, STORAGE_PROJECTS, DEFAULT_PROJECTS, WorkspaceFollowUp, STORAGE_FOLLOWUPS, DEFAULT_FOLLOWUPS, WorkspaceApproval, STORAGE_APPROVALS, DEFAULT_APPROVALS } from "./helpers";

export function useMyWorkspace() {

  const [activeTab, setActiveTab] = useState<"TASKS" | "PROJECTS" | "FOLLOWUPS" | "APPROVALS">("TASKS");

  // State with LocalStorage initialization
  const [myTasks, setMyTasks] = useState<WorkspaceTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_TASKS);
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
        const stored = appStorage.getItem(STORAGE_PROJECTS);
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
        const stored = appStorage.getItem(STORAGE_FOLLOWUPS);
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
        const stored = appStorage.getItem(STORAGE_APPROVALS);
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
      appStorage.setItem(STORAGE_TASKS, JSON.stringify(myTasks));
      window.dispatchEvent(new CustomEvent("versaly_tasks_updated"));
    } catch {}
  }, [myTasks]);

  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_PROJECTS, JSON.stringify(myProjects));
      window.dispatchEvent(new CustomEvent("versaly_projects_updated"));
    } catch {}
  }, [myProjects]);

  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_FOLLOWUPS, JSON.stringify(myFollowUps));
    } catch {}
  }, [myFollowUps]);

  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_APPROVALS, JSON.stringify(myApprovals));
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

  return {
    activeTab,
    setActiveTab,
    myTasks,
    setMyTasks,
    myProjects,
    setMyProjects,
    myFollowUps,
    setMyFollowUps,
    myApprovals,
    setMyApprovals,
    modalType,
    setModalType,
    modalMode,
    setModalMode,
    editingId,
    setEditingId,
    taskTitle,
    setTaskTitle,
    taskDue,
    setTaskDue,
    taskPriority,
    setTaskPriority,
    projTitle,
    setProjTitle,
    projStatus,
    setProjStatus,
    projStatusVariant,
    setProjStatusVariant,
    projLead,
    setProjLead,
    projDesc,
    setProjDesc,
    projGoLive,
    setProjGoLive,
    projLink,
    setProjLink,
    fuContact,
    setFuContact,
    fuDesc,
    setFuDesc,
    fuChannel,
    setFuChannel,
    fuDue,
    setFuDue,
    fuLink,
    setFuLink,
    appTitle,
    setAppTitle,
    appDesc,
    setAppDesc,
    appType,
    setAppType,
    appStatus,
    setAppStatus,
    appLink,
    setAppLink,
    deleteTarget,
    setDeleteTarget,
    toastMessage,
    setToastMessage,
    showToast,
    toggleTask,
    openAddTask,
    openEditTask,
    openAddProject,
    openEditProject,
    openAddFollowUp,
    openEditFollowUp,
    openAddApproval,
    openEditApproval,
    handleSaveTask,
    handleSaveProject,
    handleSaveFollowUp,
    handleSaveApproval,
    executeDelete,
    getStatusBadge,
  };
}

export type MyWorkspaceModel = ReturnType<typeof useMyWorkspace>;
