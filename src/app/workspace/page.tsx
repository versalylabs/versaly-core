"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function MyWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"TASKS" | "PROJECTS" | "FOLLOWUPS" | "APPROVALS">("TASKS");

  const [myTasks, setMyTasks] = useState([
    { id: "mt-1", title: "Normalize Safari Auto Clinic parts CSV (240 SKUs)", due: "Today 1:00 PM", priority: "HIGH", completed: false },
    { id: "mt-2", title: "Deliver Xprinter XP-420B to Express Wash Kilimani", due: "Today 4:30 PM", priority: "HIGH", completed: false },
    { id: "mt-3", title: "Confirm Safaricom Paybill reconciliation for QHX892L1P", due: "Today 5:30 PM", priority: "MEDIUM", completed: true },
    { id: "mt-4", title: "Review KRA/eTIMS tax invoice #1042 for Skyline Outdoor", due: "Tomorrow 9:00 AM", priority: "MEDIUM", completed: false },
  ]);

  const toggleTask = (id: string) => {
    setMyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
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

        {/* Quick Personal Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="liquid-glass p-4 rounded-xl border border-indigo-500/30">
            <span className="text-slate-400 font-medium">My Open Tasks</span>
            <div className="text-2xl font-bold text-white mt-1">
              {myTasks.filter((t) => !t.completed).length}
            </div>
            <div className="text-[10px] text-amber-400 mt-1">2 high priority due today</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">My Active Projects</span>
            <div className="text-2xl font-bold text-slate-200 mt-1">2</div>
            <div className="text-[10px] text-slate-500 mt-1">Safari Auto &amp; Express Wash</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">My Follow-ups</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">4</div>
            <div className="text-[10px] text-slate-500 mt-1">WhatsApp &amp; calls due</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-violet-500/30">
            <span className="text-slate-400 font-medium">My Approvals</span>
            <div className="text-2xl font-bold text-violet-300 mt-1">3</div>
            <div className="text-[10px] text-violet-400 mt-1">AI proposals &amp; invoices</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab("TASKS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
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
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeTab === "PROJECTS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>My Assigned Projects (2)</span>
          </button>
          <button
            onClick={() => setActiveTab("FOLLOWUPS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeTab === "FOLLOWUPS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>My Follow-ups (4)</span>
          </button>
          <button
            onClick={() => setActiveTab("APPROVALS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeTab === "APPROVALS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Awaiting My Approval (3)</span>
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === "TASKS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                My Assigned Daily Action Tasks
              </span>
              <span className="text-[11px] text-slate-400">Click circle to toggle completion</span>
            </div>

            <div className="space-y-2">
              {myTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                    t.completed
                      ? "bg-slate-950/40 border-slate-800/60 text-slate-500 line-through"
                      : "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`h-4 w-4 rounded-md border flex items-center justify-center transition ${
                        t.completed
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "border-slate-600 hover:border-indigo-400"
                      }`}
                    >
                      {t.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <span className="font-medium">{t.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-amber-400">{t.due}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      t.priority === "HIGH" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-400"
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === "PROJECTS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Safari Auto Clinic Implementation</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                  Blocked (Parts CSV)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lead Architect: Ted Mwangi. Normalizing 240 inventory spare parts before importing into PostgreSQL database.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Target Go-Live: Thursday</span>
                <Link href="/projects" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                  <span>Open Project</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Express Wash Kilimani Implementation</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                  On Track (85%)
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lead Architect: Ted &amp; David. Delivering Xprinter XP-420B thermal hardware today at 4:30 PM. Pickup notification WhatsApp workflow tested and verified.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Go-Live: Tomorrow</span>
                <Link href="/projects" className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                  <span>Open Project</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Follow-ups */}
        {activeTab === "FOLLOWUPS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Immediate Sales &amp; Proposal Follow-ups Assigned to Me
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Grandview Apartments (Faith Kimani)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Answer board query on LipaTim automated rent billing Paybill reconciliation</div>
                </div>
                <Link href="/communications" className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition text-xs">
                  WhatsApp
                </Link>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Turbo Precision Garage (Alex Mutua)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Demo completed; owner evaluating KES 35,000 setup fee invoice</div>
                </div>
                <Link href="/communications" className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-xs">
                  Follow Up
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Approvals */}
        {activeTab === "APPROVALS" && (
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Items Awaiting My Authorization
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white">AI-Drafted Proposal: Grandview Apartments</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">LipaTim 64-unit deployment scope with automated tenant STK push</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/attention?tab=approvals" className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition">
                    Review &amp; Approve
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
