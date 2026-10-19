"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { AlertTriangle, CheckCircle2, User, Clock } from "lucide-react";

export default function ProjectsPage() {
  const implementations = [
    {
      id: "proj-1",
      name: "Vehisoft Deployment — Safari Auto Clinic",
      client: "Safari Auto Clinic",
      product: "Vehisoft",
      lead: "Ted (Ops Lead)",
      goLiveTarget: "2026-10-25",
      progressPct: 65,
      currentStep: "Importing 240 inventory spare parts & mechanics job card setup",
      hasBlocker: true,
      blockerText: "Awaiting Excel parts price list from garage owner",
    },
    {
      id: "proj-2",
      name: "Versandry Delivery Workflow — Express Wash",
      client: "Express Wash Kilimani",
      product: "Versandry",
      lead: "David (Field Tech)",
      goLiveTarget: "2026-10-30",
      progressPct: 40,
      currentStep: "Thermal barcode printer deployment & WhatsApp customer notifications",
      hasBlocker: false,
    },
    {
      id: "proj-3",
      name: "LipaTim Tenant Billing Integration — Greenfield",
      client: "Greenfield Residential",
      product: "LipaTim",
      lead: "Ted (Ops Lead)",
      goLiveTarget: "2026-11-05",
      progressPct: 90,
      currentStep: "Final test of M-Pesa STK Push on tenant phone numbers",
      hasBlocker: false,
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Delivery & Implementations
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-amber-400">Phase 5 Operational Preview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Client Implementations & Go-Live Trackers
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Track technical setup, staff training, responsible team leads, and prevent slow or stalled client onboarding.
          </p>
        </div>

        <div className="space-y-4">
          {implementations.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-100">{proj.name}</h2>
                    <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {proj.product}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>{proj.lead}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>Target Go-Live: {proj.goLiveTarget}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200">{proj.progressPct}% Complete</div>
                  <div className="mt-1.5 h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${proj.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-300 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400">Current Phase:</span>
                  <span>{proj.currentStep}</span>
                </div>

                {proj.hasBlocker ? (
                  <div className="flex items-center gap-1 text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20 text-[11px] font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Blocker: {proj.blockerText}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>On Schedule</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
