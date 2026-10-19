"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Plus, Filter } from "lucide-react";

export default function LeadsPage() {
  const pipelineStages = [
    { name: "Uncontacted Pool", count: 28, color: "border-slate-700 bg-slate-900/40 text-slate-300" },
    { name: "First Contact", count: 9, color: "border-indigo-500/30 bg-indigo-950/20 text-indigo-300" },
    { name: "Demo Booked", count: 7, color: "border-cyan-500/30 bg-cyan-950/20 text-cyan-300" },
    { name: "Proposal Sent", count: 4, color: "border-amber-500/30 bg-amber-950/20 text-amber-300" },
    { name: "Negotiation", count: 3, color: "border-purple-500/30 bg-purple-950/20 text-purple-300" },
    { name: "Won (Auto-Onboarding)", count: 3, color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-300" },
  ];

  const sampleDeals = [
    {
      id: "deal-1",
      business: "Apex Auto Workshop",
      contact: "James Mwangi",
      product: "Vehisoft",
      stage: "Demo Booked",
      valueKES: 35000,
      mrrKES: 12500,
      source: "Walk-in Visit",
      nextAction: "Conduct 10-min live job card demo today 10:30 AM",
    },
    {
      id: "deal-2",
      business: "Prime Clean Laundromat",
      contact: "Grace Wanjiku",
      product: "Versandry",
      stage: "First Contact",
      valueKES: 30000,
      mrrKES: 10000,
      source: "WhatsApp Outreach",
      nextAction: "Send WhatsApp video mockup of customer pickup alerts",
    },
    {
      id: "deal-3",
      business: "Urban Plate Bistro",
      contact: "Chef Dennis",
      product: "Melio RMS",
      stage: "Proposal Sent",
      valueKES: 50000,
      mrrKES: 18000,
      source: "Referral",
      nextAction: "Follow up on tablet POS proposal by Thursday",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Two-Tier Commercial Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Phase 4 CRM Preview</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Leads & Sales Pipeline
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Uncontacted prospects are isolated in the Raw Pool to keep conversion rates accurate. Once contacted, deals advance through standard pipeline stages until won.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Raw Lead</span>
            </button>
          </div>
        </div>

        {/* Pipeline Stage Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage) => (
            <div key={stage.name} className={`p-3 rounded-xl border ${stage.color}`}>
              <div className="text-[11px] font-medium opacity-80">{stage.name}</div>
              <div className="text-lg font-bold mt-1">{stage.count}</div>
            </div>
          ))}
        </div>

        {/* Active Deals Table */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Active Pipeline Deals (Contacted to Won)</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>All Products</span>
            </div>
          </div>

          <div className="space-y-3">
            {sampleDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{deal.business}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {deal.product}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {deal.stage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Contact: {deal.contact}</span>
                    <span>•</span>
                    <span>Channel: {deal.source}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-400 font-semibold">Next Action:</span>
                    <span>{deal.nextAction}</span>
                  </p>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0 text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    KES {deal.valueKES.toLocaleString()} setup
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    + KES {deal.mrrKES.toLocaleString()}/mo MRR
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
