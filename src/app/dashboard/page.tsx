"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  PhoneCall,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Send,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { VERSALY_PRODUCTS } from "@/data/products-catalog";

const DASHBOARD_QUEUE_KEY = "versaly_dashboard_outreach_queue";

interface OutreachItem {
  id: string;
  business: string;
  contact: string;
  phone?: string;
  channel: string;
  product: string;
  status: string;
  script: string;
  loggedAt?: string;
  logNotes?: string;
}

const INITIAL_QUEUE: OutreachItem[] = [
  {
    id: "out-1",
    business: "Apex Auto Garage (Industrial Area)",
    contact: "James Mwangi (Owner)",
    phone: "+254 721 345 678",
    channel: "Walk-in Visit",
    product: "Vehisoft",
    status: "Scheduled 10:30 AM",
    script: "Pitch mechanic parts leak & digital job card demo",
  },
  {
    id: "out-2",
    business: "Prime Clean Laundromat (Kilimani)",
    contact: "Grace Wanjiku",
    phone: "+254 722 990 123",
    channel: "WhatsApp Message",
    product: "Versandry",
    status: "Due Now",
    script: "Follow up on customer pickup WhatsApp alert demo",
  },
  {
    id: "out-3",
    business: "Urban Plate Bistro (Westlands)",
    contact: "Chef Dennis",
    phone: "+254 711 902 345",
    channel: "Phone Call",
    product: "Melio RMS",
    status: "Scheduled 2:00 PM",
    script: "Address Android tablet hardware objection & propose trial",
  },
  {
    id: "out-4",
    business: "Horizon Signcraft (CBD)",
    contact: "Peter Ochieng",
    phone: "+254 701 555 777",
    channel: "Phone Call",
    product: "Adversoft",
    status: "Follow-up",
    script: "Send 1-page executive sheet & proposal review",
  },
];

export default function DashboardPage() {
  const [isFridayReview, setIsFridayReview] = useState(false);
  const [queue, setQueue] = useState<OutreachItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(DASHBOARD_QUEUE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_QUEUE;
  });

  // Log Action Modal State
  const [loggingItem, setLoggingItem] = useState<OutreachItem | null>(null);
  const [logOutcome, setLogOutcome] = useState("Connected - Demo Booked");
  const [logNotes, setLogNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Outreach Modal State
  const [isNewActionModalOpen, setIsNewActionModalOpen] = useState(false);
  const [newBusiness, setNewBusiness] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("+254 ");
  const [newChannel, setNewChannel] = useState("Phone Call");
  const [newProduct, setNewProduct] = useState("Vehisoft");
  const [newTiming, setNewTiming] = useState("Today 3:30 PM");
  const [newScript, setNewScript] = useState("");

  // WhatsApp Quick Send Modal State
  const [whatsAppItem, setWhatsAppItem] = useState<{ business: string; contact: string; phone: string; context: string } | null>(null);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");

  // Save queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  }, [queue]);

  const scorecard = useMemo(() => {
    const loggedCount = queue.filter((q) => q.loggedAt).length;
    return {
      weeklyOutreach: 48 + loggedCount,
      targetOutreach: 60,
      demosBooked: 7 + (loggedCount > 0 ? 1 : 0),
      proposalsSent: 5,
      dealsWon: 3,
      cashCollectedKES: 145000,
      activeMRRKES: 286500,
    };
  }, [queue]);

  const followUpsDue = [
    {
      id: "fu-1",
      business: "Grandview Apartments",
      contact: "Faith Kimani",
      phone: "+254 701 333 222",
      product: "LipaTim",
      daysWaiting: 3,
      context: "Sent LipaTim M-Pesa automated tenant billing proposal",
    },
    {
      id: "fu-2",
      business: "Turbo Precision Garage",
      contact: "Alex Mutua",
      phone: "+254 722 888 444",
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

  // Open Log Modal
  const openLogModal = (item: OutreachItem) => {
    setLoggingItem(item);
    setLogOutcome("Connected - Demo Booked");
    setLogNotes(`Pitch delivered to ${item.contact}. Follow-up scheduled.`);
  };

  // Submit Log Modal
  const handleConfirmLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingItem) return;

    setQueue((prev) =>
      prev.map((item) =>
        item.id === loggingItem.id
          ? {
              ...item,
              status: `Logged: ${logOutcome}`,
              loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              logNotes,
            }
          : item
      )
    );

    setToastMessage(`✓ Logged action for ${loggingItem.business}: "${logOutcome}"`);
    setLoggingItem(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit New Action
  const handleCreateNewAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusiness.trim() || !newContact.trim()) return;

    const newItem: OutreachItem = {
      id: `out-${Date.now()}`,
      business: newBusiness.trim(),
      contact: newContact.trim(),
      phone: newPhone.trim(),
      channel: newChannel,
      product: newProduct,
      status: newTiming,
      script: newScript.trim() || `Discuss ${newProduct} solution for operations`,
    };

    setQueue((prev) => [newItem, ...prev]);
    setIsNewActionModalOpen(false);
    setNewBusiness("");
    setNewContact("");
    setNewScript("");
    setToastMessage(`✓ Scheduled new action: "${newItem.business}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open WhatsApp Modal
  const openWhatsAppModal = (item: typeof followUpsDue[0]) => {
    setWhatsAppItem(item);
    setWhatsAppMessage(
      `Hi ${item.contact}, this is Versaly operations following up on your ${item.product} proposal. Are you available for a quick 5-minute call today?`
    );
  };

  const handleSendWhatsApp = () => {
    if (!whatsAppItem) return;
    const cleanPhone = whatsAppItem.phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(whatsAppMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setWhatsAppItem(null);
    setToastMessage(`✓ Dispatched WhatsApp message to ${whatsAppItem.contact}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Top Operational Bar with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Daily Operating Rhythm
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Today&apos;s Focus & Action Plan</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Versaly Command Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              One connected operating system across all 5 products, leads, active clients, and cashflow.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsNewActionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Daily Action</span>
            </button>
            <button
              onClick={() => setIsFridayReview(!isFridayReview)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                isFridayReview
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>{isFridayReview ? "Exit Friday Review" : "Launch Friday 20-Min Review"}</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Friday 20-Min Review Spotlight Banner */}
        {isFridayReview && (
          <div className="liquid-glass p-5 rounded-2xl border-amber-500/30 text-amber-200 text-xs animate-in slide-in-from-top-2 duration-200 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Flame className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300 text-sm">Friday 20-Minute Operational Review Mode Active</div>
                <p className="text-amber-200/90 mt-1 leading-relaxed">
                  Review the 3 weekly targets: (1) Reconcile all uncontacted leads & update pipeline deal stages, (2) Resolve client onboarding blockers for go-live, (3) Confirm M-Pesa payments collected vs. monthly MRR target.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/leads"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition"
                  >
                    Review Pipeline Deals →
                  </Link>
                  <Link
                    href="/projects"
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition"
                  >
                    Check Go-Live Blockers →
                  </Link>
                </div>
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

        {/* Weekly Scorecard Grid with Liquid Glass */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="liquid-glass p-4 rounded-xl">
            <div className="text-[11px] font-medium text-slate-400">Outreach This Week</div>
            <div className="text-xl font-bold text-white mt-1">
              {scorecard.weeklyOutreach}
              <span className="text-xs text-slate-500 font-normal"> / {scorecard.targetOutreach}</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (scorecard.weeklyOutreach / scorecard.targetOutreach) * 100)}%` }}
              />
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <div className="text-[11px] font-medium text-slate-400">Demos Booked</div>
            <div className="text-xl font-bold text-white mt-1">{scorecard.demosBooked}</div>
            <div className="text-[10px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Across 4 products</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <div className="text-[11px] font-medium text-slate-400">Proposals Sent</div>
            <div className="text-xl font-bold text-white mt-1">{scorecard.proposalsSent}</div>
            <div className="text-[10px] text-slate-500 mt-2">Active in negotiation</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <div className="text-[11px] font-medium text-slate-400">Deals Won (Week)</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{scorecard.dealsWon}</div>
            <div className="text-[10px] text-emerald-400 mt-2 font-medium">Auto-onboarding triggered</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <div className="text-[11px] font-medium text-slate-400">Cash Collected</div>
            <div className="text-xl font-bold text-white mt-1">KES {(scorecard.cashCollectedKES / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-slate-500 mt-2">M-Pesa + Bank</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
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
            <div className="liquid-glass p-6 rounded-2xl">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    {queue.length} actions
                  </span>
                  <button
                    onClick={() => setIsNewActionModalOpen(true)}
                    className="p-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                    title="Add Action"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {item.business}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-slate-800 text-indigo-300 border border-slate-700">
                          {item.product}
                        </span>
                        {item.loggedAt && (
                          <span className="text-[10px] px-2 py-0.2 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Logged ({item.loggedAt})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>{item.contact}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{item.channel}</span>
                        {item.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{item.phone}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                        &ldquo;{item.script}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                        {item.status}
                      </span>
                      <button
                        onClick={() => openLogModal(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                      >
                        Log Action
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-ups Due */}
            <div className="liquid-glass p-6 rounded-2xl">
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
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-medium text-amber-400">
                        {item.daysWaiting} days no reply
                      </span>
                      <button
                        onClick={() => openWhatsAppModal(item)}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Send WhatsApp</span>
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
            <div className="liquid-glass p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Onboarding Blockers
                  </h3>
                </div>
                <Link
                  href="/projects"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Resolve in Projects</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
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
            <div className="liquid-glass p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Cash & Receivables Alerts
                  </h3>
                </div>
                <Link
                  href="/finance"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Finance Hub</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
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
            <div className="liquid-glass p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Product Portfolios
                </h3>
                <Link
                  href="/products"
                  className="text-[10px] text-indigo-400 font-medium hover:underline"
                >
                  View All 5 →
                </Link>
              </div>

              <div className="space-y-2">
                {VERSALY_PRODUCTS.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/products#${prod.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs hover:border-slate-700 hover:bg-slate-950/60 transition group"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {prod.name}
                      </div>
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Log Action */}
        {loggingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Log Outreach Outcome</h3>
                    <p className="text-[11px] text-slate-400">{loggingItem.business}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoggingItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmLog} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Outreach Outcome *</label>
                  <select
                    value={logOutcome}
                    onChange={(e) => setLogOutcome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Connected - Demo Booked">Connected - Demo Booked</option>
                    <option value="Proposal Requested">Proposal Requested</option>
                    <option value="Follow-up Call Scheduled">Follow-up Call Scheduled</option>
                    <option value="Left WhatsApp Audio/Video">Left WhatsApp Audio/Video</option>
                    <option value="Gatekeeper Block / Call Back Later">Gatekeeper Block / Call Back Later</option>
                    <option value="Not Interested (Disqualified)">Not Interested (Disqualified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notes & Next Step Details</label>
                  <textarea
                    rows={3}
                    required
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Describe feedback, customer objection, or agreed meeting time..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setLoggingItem(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete & Save Log</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Action */}
        {isNewActionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Schedule New Outreach Action</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewActionModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewAction} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline Logistics Ltd"
                    value={newBusiness}
                    onChange={(e) => setNewBusiness(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dennis Mwangi"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+254 722 000 000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Channel</label>
                    <select
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Walk-in Visit">Walk-in Visit</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="WhatsApp Message">WhatsApp Message</option>
                      <option value="Demo Session">Demo Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product</label>
                    <select
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Vehisoft">Vehisoft</option>
                      <option value="Versandry">Versandry</option>
                      <option value="Adversoft">Adversoft</option>
                      <option value="LipaTim">LipaTim</option>
                      <option value="Melio RMS">Melio RMS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Timing</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Today 3:30 PM"
                    value={newTiming}
                    onChange={(e) => setNewTiming(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pitch Focus / Script</label>
                  <input
                    type="text"
                    placeholder="e.g. Pitch M-Pesa automated tenant billing"
                    value={newScript}
                    onChange={(e) => setNewScript(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewActionModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    Add to Queue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: WhatsApp Direct */}
        {whatsAppItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Send WhatsApp Follow-up</h3>
                    <p className="text-[11px] text-slate-400">{whatsAppItem.business} ({whatsAppItem.contact})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsAppItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Recipient Phone</label>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                    {whatsAppItem.phone}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    value={whatsAppMessage}
                    onChange={(e) => setWhatsAppMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWhatsAppItem(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
