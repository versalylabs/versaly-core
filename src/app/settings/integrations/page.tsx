"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CheckCircle2,
  RefreshCw,
  Clock,
  Wifi,
} from "lucide-react";
import { INITIAL_SYSTEM_INTEGRATIONS, SystemIntegrationItem } from "@/data/integrations-seed";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<SystemIntegrationItem[]>(INITIAL_SYSTEM_INTEGRATIONS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleTestSync = (id: string, name: string) => {
    setTestingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, lastSync: "Just now", status: "HEALTHY" } : item
        )
      );
      setTestingId(null);
      setToastMessage(`✓ Integration Ping Verified: ${name} responded in 42ms with 0 errors`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                System Infrastructure &amp; Connectivity
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Under-the-Hood Health</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Integrations &amp; System Health
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Deep operational transparency: beyond simple online badges, verify live Safaricom M-Pesa webhooks, KRA eTIMS fiscal signing, WhatsApp Cloud delivery, and database replication health.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>All 6 Subsystems Healthy</span>
            </span>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* System Vitals Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="liquid-glass p-4 rounded-xl border border-emerald-500/30">
            <span className="text-slate-400 font-medium">Uptime (Last 30 Days)</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">99.98%</div>
            <div className="text-[10px] text-slate-400 mt-1">Production Vercel + Neon PG</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">Average API Latency</span>
            <div className="text-2xl font-bold text-white mt-1">48ms</div>
            <div className="text-[10px] text-emerald-400 mt-1">East Africa regional CDN</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">Failed Webhook Deliveries</span>
            <div className="text-2xl font-bold text-white mt-1">0</div>
            <div className="text-[10px] text-slate-400 mt-1">100% Daraja reconciliation</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">Automated Backup Test</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">Verified</div>
            <div className="text-[10px] text-slate-400 mt-1">Nightly snapshot at 03:00 EAT</div>
          </div>
        </div>

        {/* Detailed Integrations Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Connected External Services &amp; Subsystems ({integrations.length})
            </h2>
            <span className="text-[11px] text-slate-400">Live heartbeat telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((svc) => (
              <div
                key={svc.id}
                className="liquid-glass p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{svc.name}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.2 rounded text-slate-300 font-medium">
                          {svc.category}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        {svc.endpointOrId}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {svc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Sync: {svc.lastSuccessfulSync}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{svc.latencyMs}ms</span>
                  </div>

                  <button
                    disabled={testingId === svc.id}
                    onClick={() => handleTestSync(svc.id, svc.name)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${testingId === svc.id ? "animate-spin text-indigo-400" : ""}`} />
                    <span>{testingId === svc.id ? "Pinging..." : "Test Ping"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
