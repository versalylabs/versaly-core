"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  DollarSign,
  Users,
  Target,
  FolderGit2,
  LifeBuoy,
  Download,
} from "lucide-react";

export default function ReportsPage() {
  const [activeReportTab, setActiveReportTab] = useState<"SALES" | "CLIENTS" | "DELIVERY" | "FINANCE" | "OPERATIONS">("SALES");

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Strategic Intelligence &amp; Analytics
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Business Health &amp; Longitudinal Trends</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Insights &amp; Executive Reports
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Deep analytical intelligence: examine why revenue grew, diagnose sales funnel drop-offs, inspect receivables ageing, and analyze onboarding velocity across all 5 product lines.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveReportTab("SALES")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeReportTab === "SALES"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Sales &amp; Conversion Velocity</span>
          </button>
          <button
            onClick={() => setActiveReportTab("CLIENTS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeReportTab === "CLIENTS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Client Retention &amp; Renewals</span>
          </button>
          <button
            onClick={() => setActiveReportTab("DELIVERY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeReportTab === "DELIVERY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>Delivery &amp; Onboarding Velocity</span>
          </button>
          <button
            onClick={() => setActiveReportTab("FINANCE")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeReportTab === "FINANCE"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Finance &amp; Receivables Ageing</span>
          </button>
          <button
            onClick={() => setActiveReportTab("OPERATIONS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap flex items-center gap-1.5 border ${
              activeReportTab === "OPERATIONS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Support &amp; Operations SLAs</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* REPORT 1: SALES & CONVERSION VELOCITY                                     */}
        {/* ========================================================================= */}
        {activeReportTab === "SALES" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Sales Cycle Duration</span>
                <div className="text-2xl font-bold text-white mt-1">8.4 days</div>
                <div className="text-[10px] text-emerald-400 mt-1">Contact to signed contract</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Conversion from Demo</span>
                <div className="text-2xl font-bold text-indigo-300 mt-1">66.7%</div>
                <div className="text-[10px] text-slate-400 mt-1">6 proposals from 9 demos</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Win Rate (Closed)</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">66.7%</div>
                <div className="text-[10px] text-slate-400 mt-1">4 won / 6 closed deals</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Average Setup ACV</span>
                <div className="text-2xl font-bold text-white mt-1">KES 36,250</div>
                <div className="text-[10px] text-slate-400 mt-1">One-time initial cash</div>
              </div>
            </div>

            {/* Funnel By Channel & Lead Source */}
            <div className="liquid-glass p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                Conversion by Lead Source &amp; Acquisition Channel
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Walk-in garage visits and warm referrals yield 3x higher conversion compared to cold WhatsApp drops.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Source Channel</th>
                      <th className="p-3 text-center">Contacted</th>
                      <th className="p-3 text-center">Demos Done</th>
                      <th className="p-3 text-center">Won</th>
                      <th className="p-3 text-center">Conversion %</th>
                      <th className="p-3 text-right">Cash Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">Direct Walk-in Visits (Industrial Area, CBD)</td>
                      <td className="p-3 text-center font-mono text-slate-300">18</td>
                      <td className="p-3 text-center font-mono text-sky-400">6</td>
                      <td className="p-3 text-center font-mono text-emerald-400 font-bold">3</td>
                      <td className="p-3 text-center font-bold text-emerald-400">16.7%</td>
                      <td className="p-3 text-right font-mono font-bold text-white">KES 284,000</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">Referrals from Existing Clients</td>
                      <td className="p-3 text-center font-mono text-slate-300">4</td>
                      <td className="p-3 text-center font-mono text-sky-400">2</td>
                      <td className="p-3 text-center font-mono text-emerald-400 font-bold">1</td>
                      <td className="p-3 text-center font-bold text-emerald-400">25.0%</td>
                      <td className="p-3 text-right font-mono font-bold text-white">KES 105,000</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-semibold text-white">Outbound Phone &amp; WhatsApp Outreach</td>
                      <td className="p-3 text-center font-mono text-slate-300">15</td>
                      <td className="p-3 text-center font-mono text-sky-400">1</td>
                      <td className="p-3 text-center font-mono text-slate-400">0</td>
                      <td className="p-3 text-center text-slate-500">0.0%</td>
                      <td className="p-3 text-right font-mono text-slate-500">KES 0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT 2: CLIENTS & RETENTION                                             */}
        {/* ========================================================================= */}
        {activeReportTab === "CLIENTS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Total Paying Accounts</span>
                <div className="text-2xl font-bold text-white mt-1">34</div>
                <div className="text-[10px] text-emerald-400 mt-1">+5 added this month</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Monthly Churn Rate</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">2.9%</div>
                <div className="text-[10px] text-slate-400 mt-1">1 churned account</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Customer Health Rating</span>
                <div className="text-2xl font-bold text-white mt-1">85.3%</div>
                <div className="text-[10px] text-emerald-400 mt-1">29 accounts in green health</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Renewals Due in 30 Days</span>
                <div className="text-2xl font-bold text-sky-400 mt-1">8 accounts</div>
                <div className="text-[10px] text-slate-400 mt-1">KES 68,000 scheduled MRR</div>
              </div>
            </div>

            {/* Concentration Risk */}
            <div className="liquid-glass p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                Revenue Concentration Risk Analysis
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Top 3 enterprise accounts contribute 24.8% of total MRR. Safe distribution across multiple small and mid-market accounts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">#1 Largest Account</span>
                  <div className="font-bold text-white mt-1 text-sm">Skyline Outdoor Media Ltd</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Adversoft • KES 60,000/mo (20.8% of MRR)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">#2 Largest Account</span>
                  <div className="font-bold text-white mt-1 text-sm">Safari Auto Clinic</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Vehisoft • KES 12,500/mo (4.3% of MRR)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-violet-400 font-bold uppercase">#3 Largest Account</span>
                  <div className="font-bold text-white mt-1 text-sm">Express Wash Kilimani</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Versandry • KES 12,000/mo (4.1% of MRR)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT 3: DELIVERY & ONBOARDING VELOCITY                                  */}
        {/* ========================================================================= */}
        {activeReportTab === "DELIVERY" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="liquid-glass p-4 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 font-medium">Avg Payment-to-Live Speed</span>
                <div className="text-2xl font-bold text-white mt-1">4.8 days</div>
                <div className="text-[10px] text-emerald-400 mt-1">Exceeds &lt;7 day target</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Completed Go-Lives</span>
                <div className="text-2xl font-bold text-white mt-1">28</div>
                <div className="text-[10px] text-slate-400 mt-1">Total active installations</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 font-medium">Active Blockers</span>
                <div className="text-2xl font-bold text-rose-300 mt-1">2</div>
                <div className="text-[10px] text-rose-400 mt-1">Data normalization + hardware</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Staff Training Adoption</span>
                <div className="text-2xl font-bold text-indigo-300 mt-1">100%</div>
                <div className="text-[10px] text-slate-400 mt-1">Within 48 hours of go-live</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT 4: FINANCE & RECEIVABLES AGEING                                     */}
        {/* ========================================================================= */}
        {activeReportTab === "FINANCE" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Total Cash Collected</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">KES 495k</div>
                <div className="text-[10px] text-slate-400 mt-1">Actual receipts (not invoiced)</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Current Monthly MRR</span>
                <div className="text-2xl font-bold text-indigo-300 mt-1">KES 288k</div>
                <div className="text-[10px] text-slate-400 mt-1">34 active subscriptions</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Outstanding Invoices</span>
                <div className="text-2xl font-bold text-white mt-1">KES 63k</div>
                <div className="text-[10px] text-slate-400 mt-1">3 bills within grace window</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl border border-rose-500/20">
                <span className="text-rose-400 font-medium">Overdue Receivables</span>
                <div className="text-2xl font-bold text-rose-300 mt-1">KES 18k</div>
                <div className="text-[10px] text-rose-400 mt-1">Mama Rocks Cafe (3d overdue)</div>
              </div>
            </div>

            {/* Receivables Ageing Table */}
            <div className="liquid-glass p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                Receivables Ageing Breakdown
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                92.8% of invoices are settled via Safaricom Paybill within 48 hours of automated STK push reminder.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Current (0 - 30 Days)</span>
                  <div className="text-xl font-bold text-white mt-1">KES 45,000</div>
                  <div className="text-[10px] text-slate-400 mt-1">Skyline Outdoor setup fee #1042</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Overdue (31 - 60 Days)</span>
                  <div className="text-xl font-bold text-amber-300 mt-1">KES 18,000</div>
                  <div className="text-[10px] text-slate-400 mt-1">Mama Rocks Cafe subscription</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Doubtful (61+ Days)</span>
                  <div className="text-xl font-bold text-slate-500 mt-1">KES 0</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Zero bad debts written off</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT 5: OPERATIONS & SUPPORT SLAS                                       */}
        {/* ========================================================================= */}
        {activeReportTab === "OPERATIONS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="liquid-glass p-4 rounded-xl border border-sky-500/30">
                <span className="text-slate-400 font-medium">Average 1st Response Time</span>
                <div className="text-2xl font-bold text-white mt-1">11.4 mins</div>
                <div className="text-[10px] text-emerald-400 mt-1">Well inside &lt;15m SLA</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Mean Time to Resolution</span>
                <div className="text-2xl font-bold text-white mt-1">1.8 hours</div>
                <div className="text-[10px] text-slate-400 mt-1">Same-day problem resolution</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <span className="text-slate-400 font-medium">Outreach Pace Compliance</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">68.4%</div>
                <div className="text-[10px] text-slate-400 mt-1">342 actions logged this week</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
