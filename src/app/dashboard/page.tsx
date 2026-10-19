"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  PhoneCall,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Clock,
  Flame,
} from "lucide-react";
import { VERSALY_PRODUCTS } from "@/data/products-catalog";

export default function DashboardPage() {
  const [isFridayReview, setIsFridayReview] = useState(false);

  // Daily Operating Metrics
  const scorecard = {
    weeklyOutreach: 48,
    targetOutreach: 60,
    demosBooked: 7,
    proposalsSent: 5,
    dealsWon: 3,
    cashCollectedKES: 145000,
    activeMRRKES: 286500,
  };

  const todayOutreachQueue = [
    {
      id: "out-1",
      business: "Apex Auto Garage (Industrial Area)",
      contact: "James Mwangi (Owner)",
      channel: "Walk-in Visit",
      product: "Vehisoft",
      status: "Scheduled 10:30 AM",
      script: "Pitch mechanic parts leak & digital job card demo",
    },
    {
      id: "out-2",
      business: "Prime Clean Laundromat (Kilimani)",
      contact: "Grace Wanjiku",
      channel: "WhatsApp Message",
      product: "Versandry",
      status: "Due Now",
      script: "Follow up on customer pickup WhatsApp alert demo",
    },
    {
      id: "out-3",
      business: "Urban Plate Bistro (Westlands)",
      contact: "Chef Dennis",
      channel: "Phone Call",
      product: "Melio RMS",
      status: "Scheduled 2:00 PM",
      script: "Address Android tablet hardware objection & propose trial",
    },
    {
      id: "out-4",
      business: "Horizon Signcraft (CBD)",
      contact: "Peter Ochieng",
      channel: "Phone Call",
      product: "Adversoft",
      status: "Follow-up",
      script: "Send 1-page executive sheet & proposal review",
    },
  ];

  const followUpsDue = [
    {
      id: "fu-1",
      business: "Grandview Apartments",
      contact: "Faith Kimani",
      product: "LipaTim",
      daysWaiting: 3,
      context: "Sent LipaTim M-Pesa automated tenant billing proposal",
    },
    {
      id: "fu-2",
      business: "Turbo Precision Garage",
      contact: "Alex Mutua",
      product: "Vehisoft",
      daysWaiting: 2,
      context: "Demo completed; awaiting owner decision on setup fee",
    },
  ];

  const onboardingBlockers = [
    {
      id: "blk-1",
      client: "Safari Auto Clinic",
      product: "Vehisoft",
      blocker: "Waiting on client's Excel list of 240 inventory spare parts",
      assignedTo: "Ted (Ops)",
      daysBlocked: 2,
    },
    {
      id: "blk-2",
      client: "Express Wash Laundry",
      product: "Versandry",
      blocker: "Thermal barcode printer arriving tomorrow for driver dispatch",
      assignedTo: "David (Field)",
      daysBlocked: 1,
    },
  ];

  const cashAlerts = [
    {
      id: "c-1",
      client: "Mama Rocks Cafe (Melio RMS)",
      amountKES: 18000,
      type: "Monthly Subscription",
      status: "Overdue by 3 days",
      urgency: "high",
    },
    {
      id: "c-2",
      client: "Skyline Outdoor Media (Adversoft)",
      amountKES: 45000,
      type: "Setup Fee Invoice #1042",
      status: "Due Friday via M-Pesa Paybill",
      urgency: "medium",
    },
  ];

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Top Operational Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Daily Operating Rhythm
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">Today&apos;s Focus & Action Plan</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Versaly Command Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              One connected operating system across all 5 products, leads, active clients, and cashflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFridayReview(!isFridayReview)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                isFridayReview
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{isFridayReview ? "Exit Friday Review" : "Launch Friday 20-Min Review"}</span>
            </button>
          </div>
        </div>

        {/* Friday 20-Min Review Spotlight Banner */}
        {isFridayReview && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs animate-in slide-in-from-top-2 duration-200 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Flame className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300">Friday 20-Minute Operational Review Mode Active</div>
                <p className="text-amber-200/80 mt-1 leading-relaxed">
                  Review the 3 weekly targets: (1) Reconcile all uncontacted leads & update pipeline deal stages, (2) Resolve client onboarding blockers for go-live, (3) Confirm M-Pesa payments collected vs. monthly MRR target.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFridayReview(false)}
              className="text-amber-400 hover:text-amber-200 text-xs font-semibold underline shrink-0 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Weekly Scorecard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Outreach This Week</div>
            <div className="text-xl font-bold text-white mt-1">
              {scorecard.weeklyOutreach}
              <span className="text-xs text-slate-500 font-normal"> / {scorecard.targetOutreach}</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(scorecard.weeklyOutreach / scorecard.targetOutreach) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Demos Booked</div>
            <div className="text-xl font-bold text-white mt-1">{scorecard.demosBooked}</div>
            <div className="text-[10px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Across 4 products</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Proposals Sent</div>
            <div className="text-xl font-bold text-white mt-1">{scorecard.proposalsSent}</div>
            <div className="text-[10px] text-slate-500 mt-2">Active in negotiation</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Deals Won (Week)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{scorecard.dealsWon}</div>
            <div className="text-[10px] text-emerald-400 mt-2 font-medium">Auto-onboarding triggered</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Cash Collected</div>
            <div className="text-xl font-bold text-white mt-1">KES {(scorecard.cashCollectedKES / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-slate-500 mt-2">M-Pesa + Bank</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Monthly Recurring (MRR)</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">KES {(scorecard.activeMRRKES / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-indigo-400 mt-2 font-medium">34 Active clients</div>
          </div>
        </div>

        {/* Primary Operational Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Today's Outreach Queue (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outreach Queue */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">Today&apos;s Outreach Action Queue</h2>
                    <p className="text-[11px] text-slate-400">Walk-ins, calls, WhatsApp follow-ups scheduled for today</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {todayOutreachQueue.length} actions pending
                </span>
              </div>

              <div className="space-y-3">
                {todayOutreachQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {item.business}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                          {item.product}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>{item.contact}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{item.channel}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        &ldquo;{item.script}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                        {item.status}
                      </span>
                      <button className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm">
                        Log Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-ups Due */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">Follow-Ups Due (Awaiting Reply)</h2>
                    <p className="text-[11px] text-slate-400">Proposals and demos where prospects have not responded</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {followUpsDue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{item.business}</span>
                        <span className="text-[10px] text-slate-400">({item.contact})</span>
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                          {item.product}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.context}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-amber-400">
                        {item.daysWaiting} days no reply
                      </span>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline">
                        Send WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Blockers, Cash & Products Overview */}
          <div className="space-y-6">
            {/* Onboarding Blockers */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Onboarding Blockers
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Clients waiting on technical setup or client data</p>

              <div className="space-y-2.5">
                {onboardingBlockers.map((blk) => (
                  <div key={blk.id} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-200">{blk.client}</span>
                      <span className="text-[10px] text-rose-400 font-mono">{blk.daysBlocked}d blocked</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{blk.blocker}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Product: {blk.product}</span>
                      <span className="text-indigo-300 font-medium">Owner: {blk.assignedTo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash & Unpaid Invoices */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Cash & Receivables Alerts
                </h3>
              </div>

              <div className="space-y-2.5">
                {cashAlerts.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{c.client}</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        KES {c.amountKES.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{c.type}</span>
                      <span className={c.urgency === "high" ? "text-rose-400 font-medium" : "text-amber-400 font-medium"}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Versaly 5 Products Quick Status */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Product Portfolios
                </h3>
                <span className="text-[10px] text-indigo-400 font-medium">5 Offerings</span>
              </div>

              <div className="space-y-2">
                {VERSALY_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{prod.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        KES {prod.monthlyFee.toLocaleString()}/mo MRR
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-300">
                        {prod.activeClientsCount} clients
                      </div>
                      <div className="text-[10px] text-indigo-400">
                        {prod.pipelineDealsCount} in pipeline
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
