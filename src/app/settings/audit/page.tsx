"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
// AuditLog Page

export default function AuditLogPage() {
  const events = [
    {
      id: "ev-1",
      action: "USER_REGISTERED",
      entity: "User (Ted Khalwale)",
      user: "System Bootstrap",
      metadata: "Role: OWNER, Auto-provisioned",
      timestamp: "Today 08:29 AM",
    },
    {
      id: "ev-2",
      action: "PRODUCT_PORTFOLIO_SYNC",
      entity: "Product Catalog (5 Items)",
      user: "Ted Khalwale (OWNER)",
      metadata: "Synced Adversoft, Vehisoft, Versandry, LipaTim, Melio RMS",
      timestamp: "Today 08:35 AM",
    },
    {
      id: "ev-3",
      action: "WORKSPACE_SETTINGS_UPDATED",
      entity: "Company (Versaly)",
      user: "Ted Khalwale (OWNER)",
      metadata: "Timezone: Africa/Nairobi, Currency: KES",
      timestamp: "Today 08:39 AM",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Compliance & Security
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">System Mutation Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Audit Log & Event Stream
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Immutable log of system mutations, access role changes, entity creations, and operational state transitions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400">{ev.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-medium text-slate-200">{ev.entity}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Actor: <span className="text-slate-300 font-medium">{ev.user}</span> • Context: {ev.metadata}
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 shrink-0">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
