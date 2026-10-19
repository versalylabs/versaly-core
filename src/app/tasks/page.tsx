"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const dailyTasks = [
    {
      id: "t-1",
      category: "Outreach",
      title: "Walk-in garage visit: Apex Auto Clinic (Industrial Area)",
      product: "Vehisoft",
      due: "Today 10:30 AM",
      priority: "HIGH",
      completed: false,
    },
    {
      id: "t-2",
      category: "Demos",
      title: "Live Melio RMS POS table-ordering walkthrough: Chef Dennis",
      product: "Melio RMS",
      due: "Today 2:00 PM",
      priority: "HIGH",
      completed: false,
    },
    {
      id: "t-3",
      category: "Follow-up",
      title: "Send WhatsApp pickup alert demo video to Prime Clean Laundromat",
      product: "Versandry",
      due: "Today 4:00 PM",
      priority: "MEDIUM",
      completed: false,
    },
    {
      id: "t-4",
      category: "Onboarding",
      title: "Follow up with Safari Auto Clinic for spare parts inventory spreadsheet",
      product: "Vehisoft",
      due: "Today 5:00 PM",
      priority: "HIGH",
      completed: false,
    },
    {
      id: "t-5",
      category: "Finance",
      title: "Reconcile M-Pesa setup fee payment for Skyline Outdoor Media (Adversoft)",
      product: "Adversoft",
      due: "Today 5:30 PM",
      priority: "MEDIUM",
      completed: true,
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Action List & Operating Rhythm
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Turns Strategy into Daily Actions</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Daily Action Queue & Outreach
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Calls, visits, WhatsApp messages, product demos, onboarding tasks, and overdue items organized for execution.
            </p>
          </div>

          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition">
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {dailyTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition ${
                task.completed
                  ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={task.completed}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-100"}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {task.product}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span className="font-medium text-slate-300">{task.category}</span>
                    <span>•</span>
                    <span className="text-amber-400">{task.due}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  task.priority === "HIGH"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
