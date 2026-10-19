"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { Clock, ArrowRight } from "lucide-react";

export default function ClientsPage() {
  const clients = [
    {
      id: "cli-1",
      business: "Safari Auto Clinic",
      contact: "Dan Omondi",
      product: "Vehisoft",
      monthlyMRR: 12500,
      onboardingStage: "Step 4/8: Product Configuration & Spare Parts Import",
      status: "Onboarding",
      renewalDate: "2026-11-15",
    },
    {
      id: "cli-2",
      business: "Mama Rocks Gourmet Burgers",
      contact: "Samantha Lee",
      product: "Melio RMS",
      monthlyMRR: 18000,
      onboardingStage: "Step 8/8: Live Active (30-day health check pending)",
      status: "Active",
      renewalDate: "2026-10-28",
    },
    {
      id: "cli-3",
      business: "Express Wash Kilimani",
      contact: "George Kariuki",
      product: "Versandry",
      monthlyMRR: 10000,
      onboardingStage: "Step 5/8: Staff Training on Driver WhatsApp Alerts",
      status: "Onboarding",
      renewalDate: "2026-11-01",
    },
    {
      id: "cli-4",
      business: "Greenfield Residential Society",
      contact: "Treasurer Mbugua",
      product: "LipaTim",
      monthlyMRR: 8000,
      onboardingStage: "Step 8/8: Live Active (M-Pesa STK Push reconciled)",
      status: "Active",
      renewalDate: "2026-11-30",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Client Operating Directory
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400">34 Active Subscriptions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Signed Clients & Onboarding Journeys
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Every signed deal runs through the standardized 8-step onboarding system until their first measurable win is achieved.
          </p>
        </div>

        <div className="space-y-3">
          {clients.map((cli) => (
            <div
              key={cli.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-100">{cli.business}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {cli.product}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase tracking-wider ${
                      cli.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {cli.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Primary Contact: <span className="text-slate-300 font-medium">{cli.contact}</span> • Next Renewal: {cli.renewalDate}
                </div>
                <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>{cli.onboardingStage}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0 text-right">
                <div className="text-xs font-bold text-indigo-300 font-mono">
                  KES {cli.monthlyMRR.toLocaleString()}/mo MRR
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mt-1">
                  <span>View 360° Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
