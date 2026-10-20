"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  PhoneCall,
  AlertTriangle,
  CreditCard,
  Clock,
  Flame,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Send,
  MessageCircle,
  ExternalLink,
  Target,
  ShieldCheck,
  DollarSign,
  BarChart2,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import {
  INITIAL_MONEY_METRICS,
  INITIAL_SALES_ACTIVITY_METRICS,
  INITIAL_PIPELINE_METRICS,
  INITIAL_CLIENT_DELIVERY_METRICS,
  INITIAL_PRODUCT_PERFORMANCE,
} from "@/data/dashboard-metrics";
import {
  loadInvoicesFromStorage,
  loadExpensesFromStorage,
  loadSubscriptionsFromStorage,
  computeFinanceSummary,
  SETUP_FEE_LAUNCH_TARGET,
  MRR_LAUNCH_TARGET,
} from "@/lib/finance-store";

const DASHBOARD_QUEUE_KEY = "versaly_dashboard_outreach_queue_v2";

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
  logOutcome?: string;
  nextAction?: string;
  nextActionDate?: string;
  dealStage?: string;
  isOptedOut?: boolean;
}

interface FridayProductMetrics {
  adversoft: string;
  vehisoft: string;
  versandry: string;
  lipatim: string;
}

interface FridayScorecard {
  contactsMade: FridayProductMetrics;
  checksDelivered: FridayProductMetrics;
  demosHeld: FridayProductMetrics;
  clientsSigned: FridayProductMetrics;
  clientsLive: FridayProductMetrics;
  problemsReported: FridayProductMetrics;
  referralsReceived: FridayProductMetrics;
  leadsStuckNotes: string;
  oneChangeTest: string;
  clientNeedsAttention: string;
}

const INITIAL_QUEUE: OutreachItem[] = [];


export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<"ALL" | "MONEY" | "SALES" | "PIPELINE" | "DELIVERY" | "PRODUCTS">("ALL");
  const [isFridayReview, setIsFridayReview] = useState(false);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("ALL");

  const [queue, setQueue] = useState<OutreachItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(DASHBOARD_QUEUE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
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
  const [logNextAction, setLogNextAction] = useState("");
  const [logNextActionDate, setLogNextActionDate] = useState("");
  const [logDealStage, setLogDealStage] = useState("Demo Booked");
  const [logOptOut, setLogOptOut] = useState(false);
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

  // Friday Review Scorecard State (Section 7)
  const [fridayScorecard, setFridayScorecard] = useState<FridayScorecard>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("versaly_friday_weekly_review_v2");
        if (stored) return JSON.parse(stored) as FridayScorecard;
      } catch {
        // ignore
      }
    }
    return {
      contactsMade: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      checksDelivered: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      demosHeld: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      clientsSigned: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      clientsLive: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      problemsReported: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      referralsReceived: { adversoft: "0", vehisoft: "0", versandry: "0", lipatim: "0" },
      leadsStuckNotes: "",
      oneChangeTest: "",
      clientNeedsAttention: "",
    };
  });

  // Save Friday Scorecard
  const handleSaveFridayScorecard = () => {
    try {
      localStorage.setItem("versaly_friday_weekly_review_v2", JSON.stringify(fridayScorecard));
      setToastMessage("✓ Friday Weekly Review Scorecard saved successfully!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      // ignore
    }
  };

  // Save queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  }, [queue]);

  const loggedCount = useMemo(() => {
    return queue.filter((q) => q.loggedAt).length;
  }, [queue]);

  const [finInvoices, setFinInvoices] = useState(() =>
    typeof window !== "undefined" ? loadInvoicesFromStorage() : []
  );
  const [finExpenses, setFinExpenses] = useState(() =>
    typeof window !== "undefined" ? loadExpensesFromStorage() : []
  );
  const [finSubscriptions, setFinSubscriptions] = useState(() =>
    typeof window !== "undefined" ? loadSubscriptionsFromStorage() : []
  );

  useEffect(() => {
    setFinInvoices(loadInvoicesFromStorage());
    setFinExpenses(loadExpensesFromStorage());
    setFinSubscriptions(loadSubscriptionsFromStorage());

    const handleSync = () => {
      setFinInvoices(loadInvoicesFromStorage());
      setFinExpenses(loadExpensesFromStorage());
      setFinSubscriptions(loadSubscriptionsFromStorage());
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const financeSummary = useMemo(() => {
    return computeFinanceSummary(finInvoices, finExpenses, finSubscriptions);
  }, [finInvoices, finExpenses, finSubscriptions]);

  const money = useMemo(() => {
    const totalCollected = financeSummary.totalCollected;
    const colors: Record<string, string> = {
      Semplo: "#10b981",
      Vehisoft: "#6366f1",
      Versandry: "#06b6d4",
      Adversoft: "#8b5cf6",
      LipaTim: "#3b82f6",
      "Melio RMS": "#f59e0b",
    };

    const productRevenueBreakdown = [
      "Semplo",
      "Vehisoft",
      "Versandry",
      "Adversoft",
      "LipaTim",
      "Melio RMS",
    ].map((name) => {
      const collected = financeSummary.productRevenue[name] || 0;
      const mrr = financeSummary.productMRR[name] || 0;
      const pct = totalCollected > 0 ? Math.round((collected / totalCollected) * 100) : 20;
      return {
        name,
        collected,
        mrr,
        pct,
        color: colors[name] || "#6366f1",
      };
    });

    const activeCount = financeSummary.activeSubscriptionsCount || 1;
    const avgRevenue = activeCount > 0 ? Math.round(totalCollected / activeCount) : 0;

    return {
      revenueCollectedThisMonth: financeSummary.totalCollected,
      setupFeesCollected: financeSummary.setupFeesCollected,
      setupFeeTarget: SETUP_FEE_LAUNCH_TARGET,
      mrr: financeSummary.effectiveMRR,
      mrrTarget: MRR_LAUNCH_TARGET,
      arr: financeSummary.effectiveARR,
      outstandingInvoicesKES: financeSummary.totalOutstanding,
      overduePaymentsKES: financeSummary.totalOverdue,
      overdueClientsCount: financeSummary.overdueCount,
      averageRevenuePerClient: avgRevenue,
      productRevenueBreakdown,
    };
  }, [financeSummary]);
  const sales = useMemo(() => {
    return {
      ...INITIAL_SALES_ACTIVITY_METRICS,
      outreachToday: INITIAL_SALES_ACTIVITY_METRICS.outreachToday + loggedCount,
      outreachThisWeek: INITIAL_SALES_ACTIVITY_METRICS.outreachThisWeek + loggedCount,
    };
  }, [loggedCount]);
  const pipeline = INITIAL_PIPELINE_METRICS;
  const clientDelivery = INITIAL_CLIENT_DELIVERY_METRICS;
  const products = INITIAL_PRODUCT_PERFORMANCE;

  const filteredProducts = useMemo(() => {
    if (selectedProductFilter === "ALL") return products;
    return products.filter((p) => p.slug === selectedProductFilter);
  }, [products, selectedProductFilter]);

  const followUpsDue: {
    id: string;
    business: string;
    contact: string;
    phone: string;
    product: string;
    daysWaiting: number;
    context: string;
  }[] = [];

  const onboardingBlockers: {
    id: string;
    client: string;
    product: string;
    blocker: string;
    assignedTo: string;
    daysBlocked: number;
  }[] = [];

  const cashAlerts: {
    id: string;
    client: string;
    amountKES: number;
    type: string;
    status: string;
    urgency: string;
  }[] = [];


  // Open Log Modal
  const openLogModal = (item: OutreachItem) => {
    setLoggingItem(item);
    setLogOutcome("Connected - Demo Booked");
    setLogNotes(`Pitch delivered to ${item.contact}. Follow-up scheduled.`);
    setLogNextAction("Conduct 15-min software demo & workflow audit");
    setLogNextActionDate("Tomorrow 10:30 AM");
    setLogDealStage("Demo Booked");
    setLogOptOut(false);
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
              status: logOptOut ? "Opted Out (DNC)" : `Logged: ${logOutcome}`,
              loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              logNotes,
              logOutcome,
              nextAction: logNextAction,
              nextActionDate: logNextActionDate,
              dealStage: logDealStage,
              isOptedOut: logOptOut,
            }
          : item
      )
    );

    setToastMessage(`✓ Logged outcome for ${loggingItem.business}: "${logOutcome}" (Stage: ${logDealStage})`);
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
  const openWhatsAppModal = (item: { business: string; contact: string; phone: string; product?: string; context?: string }) => {
    setWhatsAppItem({
      business: item.business,
      contact: item.contact,
      phone: item.phone,
      context: item.context || "",
    });
    setWhatsAppMessage(
      `Hi ${item.contact}, this is Versaly operations following up on your ${item.product || "solution"} proposal. Are you available for a quick 5-minute call today?`
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
                Command Operations
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">Launch Push • Day 19 of 28</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Versaly Executive Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live intelligence across Money, Sales Activity, Pipeline, Client Delivery, and Product Traction.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
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
              <span>{isFridayReview ? "Exit Review Mode" : "Friday 20-Min Review"}</span>
            </button>
          </div>
        </div>

        {/* Business Health Bar: 82/100 */}
        <div className="liquid-glass p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-base shadow-sm">
              82
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">Business Health Score</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  82 / 100 • Strong
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Composite index tracking 5 core operational vectors across the 4-week launch push.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">Sales:</span>
              <span className="text-emerald-400 font-semibold">🟢 88/100</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">Clients:</span>
              <span className="text-emerald-400 font-semibold">🟢 90/100</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">Projects:</span>
              <span className="text-amber-400 font-semibold">🟡 72/100</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-medium">Cash:</span>
              <span className="text-amber-400 font-semibold">🟡 75/100</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">Operations:</span>
              <span className="text-emerald-400 font-semibold">🟢 85/100</span>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Friday 20-Min Review Spotlight Banner & Scorecard */}
        {isFridayReview && (
          <div className="liquid-glass p-6 rounded-2xl border border-amber-500/40 text-xs animate-in slide-in-from-top-2 duration-200 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                    <span>Friday Weekly Review (17:00, 30 Minutes)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                      Executive Scorecard
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    Fill this in every Friday at 17:00 across all 4 core products to calibrate conversion, eliminate lead bottlenecks, and audit client delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveFridayScorecard}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-sm"
                >
                  Save Scorecard
                </button>
                <button
                  type="button"
                  onClick={() => setIsFridayReview(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 4-Product Scorecard Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60">
                    <th className="p-3">Weekly Review Question</th>
                    <th className="p-3 text-center text-indigo-400">Adversoft</th>
                    <th className="p-3 text-center text-indigo-400">Vehisoft</th>
                    <th className="p-3 text-center text-indigo-400">Versandry</th>
                    <th className="p-3 text-center text-indigo-400">LipaTim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="p-3 font-medium text-slate-200">1. Contacts made this week</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.contactsMade.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            contactsMade: { ...p.contactsMade, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.contactsMade.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            contactsMade: { ...p.contactsMade, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.contactsMade.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            contactsMade: { ...p.contactsMade, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.contactsMade.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            contactsMade: { ...p.contactsMade, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">2. Free checks or maps delivered</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.checksDelivered.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            checksDelivered: { ...p.checksDelivered, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.checksDelivered.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            checksDelivered: { ...p.checksDelivered, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.checksDelivered.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            checksDelivered: { ...p.checksDelivered, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.checksDelivered.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            checksDelivered: { ...p.checksDelivered, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">3. Demos held</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.demosHeld.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            demosHeld: { ...p.demosHeld, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.demosHeld.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            demosHeld: { ...p.demosHeld, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.demosHeld.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            demosHeld: { ...p.demosHeld, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.demosHeld.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            demosHeld: { ...p.demosHeld, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">4. Clients signed</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsSigned.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsSigned: { ...p.clientsSigned, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-emerald-400 rounded bg-slate-900 border border-slate-800"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsSigned.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsSigned: { ...p.clientsSigned, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-emerald-400 rounded bg-slate-900 border border-slate-800"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsSigned.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsSigned: { ...p.clientsSigned, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-emerald-400 rounded bg-slate-900 border border-slate-800"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsSigned.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsSigned: { ...p.clientsSigned, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold text-emerald-400 rounded bg-slate-900 border border-slate-800"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">5. Clients live</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsLive.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsLive: { ...p.clientsLive, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsLive.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsLive: { ...p.clientsLive, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsLive.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsLive: { ...p.clientsLive, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.clientsLive.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            clientsLive: { ...p.clientsLive, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">6. Problems reported by clients</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.problemsReported.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            problemsReported: { ...p.problemsReported, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.problemsReported.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            problemsReported: { ...p.problemsReported, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.problemsReported.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            problemsReported: { ...p.problemsReported, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.problemsReported.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            problemsReported: { ...p.problemsReported, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3 font-medium text-slate-200">7. Referrals received</td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.referralsReceived.adversoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            referralsReceived: { ...p.referralsReceived, adversoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.referralsReceived.vehisoft}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            referralsReceived: { ...p.referralsReceived, vehisoft: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.referralsReceived.versandry}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            referralsReceived: { ...p.referralsReceived, versandry: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={fridayScorecard.referralsReceived.lipatim}
                        onChange={(e) =>
                          setFridayScorecard((p) => ({
                            ...p,
                            referralsReceived: { ...p.referralsReceived, lipatim: e.target.value },
                          }))
                        }
                        className="w-16 px-2 py-1 text-center font-mono rounded bg-slate-900 border border-slate-800 text-slate-100"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* The 3 Core Diagnostic Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  Question 1: Where are leads getting stuck?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Few replies → fix message. Few demos → fix free check. Few sales → fix offer/price.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.leadsStuckNotes}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, leadsStuckNotes: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                  Question 2: What one change will I test next week?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Iterate on a specific outreach script, diagnostic deliverable, or demo angle.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.oneChangeTest}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, oneChangeTest: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                  Question 3: Which client needs attention?
                </span>
                <span className="text-[10px] text-slate-400 italic block">
                  Identify implementation blockers, training needs, or overdue invoice accounts.
                </span>
                <textarea
                  rows={3}
                  value={fridayScorecard.clientNeedsAttention}
                  onChange={(e) =>
                    setFridayScorecard((p) => ({ ...p, clientNeedsAttention: e.target.value }))
                  }
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Link
                  href="/leads"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition"
                >
                  Review Pipeline Deals →
                </Link>
                <Link
                  href="/projects"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition"
                >
                  Check Go-Live Blockers →
                </Link>
              </div>

              <button
                type="button"
                onClick={handleSaveFridayScorecard}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20"
              >
                Save Friday Scorecard
              </button>
            </div>
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveSection("ALL")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border ${
              activeSection === "ALL"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            All Executive Sections
          </button>
          <button
            onClick={() => setActiveSection("MONEY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "MONEY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>1. Money & Cash</span>
          </button>
          <button
            onClick={() => setActiveSection("SALES")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "SALES"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <PhoneCall className="h-3.5 w-3.5 text-indigo-400" />
            <span>2. Sales Activity & Funnel</span>
          </button>
          <button
            onClick={() => setActiveSection("PIPELINE")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "PIPELINE"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Target className="h-3.5 w-3.5 text-violet-400" />
            <span>3. Pipeline & Forecast</span>
          </button>
          <button
            onClick={() => setActiveSection("DELIVERY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "DELIVERY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>4. Client & Delivery Health</span>
          </button>
          <button
            onClick={() => setActiveSection("PRODUCTS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeSection === "PRODUCTS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5 text-amber-400" />
            <span>5. Product Performance Matrix</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: MONEY METRICS (At the top)                                     */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "MONEY") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    1. Money Metrics (Financial Reality)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Real cash received, recurring engine, and receivables tracking against the 4-week launch target.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-slate-400">Launch Target:</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  KES 520k Setup / KES 120k MRR
                </span>
              </div>
            </div>

            {/* Money Scorecard Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* 1. Cash Collected */}
              <div className="liquid-glass p-4 rounded-xl border border-emerald-500/30">
                <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
                  <span>Revenue Collected</span>
                  <span className="text-[9px] bg-emerald-500/20 px-1 rounded uppercase font-bold">Cash</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.revenueCollectedThisMonth / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5">
                  Actual bank & M-Pesa receipts
                </div>
              </div>

              {/* 2. Setup Fees Collected */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Setup Fees</span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    {((money.setupFeesCollected / money.setupFeeTarget) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xl font-bold text-amber-300 mt-1">
                  KES {(money.setupFeesCollected / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Target: KES {(money.setupFeeTarget / 1000).toFixed(0)}k
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(money.setupFeesCollected / money.setupFeeTarget) * 100}%` }}
                  />
                </div>
              </div>

              {/* 3. MRR */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Monthly Recurring</span>
                  <span className="text-[9px] text-emerald-400 font-bold">+240% Target</span>
                </div>
                <div className="text-xl font-bold text-indigo-300 mt-1">
                  KES {(money.mrr / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Base Target: KES 120k/mo
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-full" />
                </div>
              </div>

              {/* 4. ARR */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Annual Run-Rate (ARR)</div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.arr / 1000000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  MRR × 12 annualized
                </div>
              </div>

              {/* 5. Outstanding Invoices */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Outstanding Invoices</span>
                  <span className="text-[9px] text-amber-400 font-mono">3 bills</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(money.outstandingInvoicesKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Money owed within grace period
                </div>
              </div>

              {/* 6. Overdue Payments */}
              <div className="liquid-glass p-4 rounded-xl border border-rose-500/20">
                <div className="text-[11px] font-medium text-rose-400 flex items-center justify-between">
                  <span>Overdue Payments</span>
                  <span className="text-[9px] bg-rose-500/20 px-1 rounded font-bold">Immediate</span>
                </div>
                <div className="text-xl font-bold text-rose-300 mt-1">
                  KES {(money.overduePaymentsKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-rose-400/90 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{money.overdueClientsCount} clients need action</span>
                </div>
              </div>

              {/* 7. ARPU */}
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Avg Revenue / Client</div>
                <div className="text-xl font-bold text-slate-200 mt-1">
                  KES {money.averageRevenuePerClient.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  34 active paying accounts
                </div>
              </div>
            </div>

            {/* Money Visual Breakdown Chart: Revenue by Product */}
            <div className="liquid-glass p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Revenue Collected & MRR Share by Product</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Which product is actively producing cash vs. predictable subscription recurring revenue
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Vehisoft (35.2%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span>Versandry (22.6%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    <span>Adversoft (21.2%)</span>
                  </div>
                </div>
              </div>

              {/* Visual Stacked Bar Chart */}
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                {money.productRevenueBreakdown.map((item) => (
                  <div
                    key={item.name}
                    className="h-full transition-all duration-300 hover:opacity-85"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    title={`${item.name}: KES ${item.collected.toLocaleString()} (${item.pct}%)`}
                  />
                ))}
              </div>

              {/* Grid of Product Cash Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-3 border-t border-slate-800/60">
                {money.productRevenueBreakdown.map((item) => (
                  <div key={item.name} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="font-mono text-[10px] text-indigo-400">{item.pct}%</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      KES {(item.collected / 1000).toFixed(1)}k <span className="text-[9px] text-slate-400 font-normal">cash</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      KES {(item.mrr / 1000).toFixed(1)}k/mo MRR
                    </div>
                  </div>
                ))}
              </div>

              {/* Cash & Unpaid Invoices Alerts */}
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Immediate Receivables & Overdue Invoices ({cashAlerts.length})
                    </h4>
                  </div>
                  <Link
                    href="/finance"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Open Finance Hub</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                {cashAlerts.length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                    No overdue receivables or pending cash alerts. All client invoices are in good standing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cashAlerts.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{c.client}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{c.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 font-mono">KES {c.amountKES.toLocaleString()}</div>
                          <div className={c.urgency === "high" ? "text-[10px] text-rose-400 font-bold" : "text-[10px] text-amber-400 font-medium"}>
                            {c.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: SALES ACTIVITY METRICS                                         */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "SALES") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Sales Activity Metrics (Daily Operating Work)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    High-volume outreach, uncontacted separation, and demo follow-through.
                  </p>
                </div>
              </div>
              <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                Daily Goal: 100 Actions
              </span>
            </div>

            {/* Sales Activity KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="liquid-glass p-3.5 rounded-xl border border-indigo-500/30">
                <div className="text-[11px] font-medium text-slate-400">Outreach Today</div>
                <div className="text-lg font-bold text-white mt-1">
                  {sales.outreachToday}
                  <span className="text-xs text-slate-500 font-normal"> / {sales.outreachTodayTarget}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (sales.outreachToday / sales.outreachTodayTarget) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Outreach Week</div>
                <div className="text-lg font-bold text-white mt-1">
                  {sales.outreachThisWeek}
                  <span className="text-xs text-slate-500 font-normal"> / {sales.outreachThisWeekTarget}</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-medium">68.4% Pace</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">New Leads Added</div>
                <div className="text-lg font-bold text-slate-200 mt-1">+{sales.newLeadsAddedWeek}</div>
                <div className="text-[10px] text-slate-500 mt-1">From scrapers & field</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-sky-500/20">
                <div className="text-[11px] font-medium text-sky-400 flex items-center justify-between">
                  <span>Contacted Leads</span>
                  <span className="text-[9px] text-slate-400">Pool: {sales.uncontactedPool}</span>
                </div>
                <div className="text-lg font-bold text-white mt-1">{sales.leadsContacted}</div>
                <div className="text-[10px] text-slate-400 mt-1">In active sales rhythm</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Demos Booked</div>
                <div className="text-lg font-bold text-white mt-1">{sales.demosBooked}</div>
                <div className="text-[10px] text-indigo-400 mt-1">Across 4 products</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Demos Done</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{sales.demosCompleted}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-medium">{sales.demoCompletionRatePct}% show rate</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Proposals Sent</div>
                <div className="text-lg font-bold text-white mt-1">{sales.proposalsSent}</div>
                <div className="text-[10px] text-slate-500 mt-1">Pending signature</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-emerald-500/30">
                <div className="text-[11px] font-medium text-emerald-400">Deals Won / Lost</div>
                <div className="text-lg font-bold text-white mt-1">
                  <span className="text-emerald-400">{sales.dealsWon}</span>
                  <span className="text-slate-600 font-normal"> / </span>
                  <span className="text-rose-400">{sales.dealsLost}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{sales.referralsReceived} referrals rcvd</div>
              </div>
            </div>

            {/* Sales Conversion Funnel & Action Queue Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Outreach Queue (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="liquid-glass p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                          Today&apos;s Outreach Action Queue
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Scheduled calls, visits, and WhatsApp pitches
                        </p>
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
                    {queue.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                        No outreach actions queued today. Click &quot;+&quot; to queue a call, visit, or WhatsApp pitch.
                      </div>
                    ) : (
                      queue.map((item) => (
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
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Graphical Funnel & Loss Analysis (1 col) */}
              <div className="space-y-4">
                <div className="liquid-glass p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Sales Conversion Funnel</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {sales.contactedToWonConversionPct}% Win Rate
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Tracking progression from uncontacted pool down to closed-won revenue
                  </p>

                  <div className="space-y-2 text-xs">
                    {/* Uncontacted Pool */}
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Uncontacted Leads Pool</span>
                      <span className="font-mono font-bold text-slate-300">{sales.uncontactedPool}</span>
                    </div>

                    {/* Contacted */}
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                      <span className="text-indigo-200">1. Leads Contacted</span>
                      <span className="font-mono font-bold text-indigo-300">{sales.leadsContacted}</span>
                    </div>

                    {/* Demos Booked */}
                    <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-500/30 flex items-center justify-between">
                      <span className="text-sky-200">2. Demos Booked</span>
                      <span className="font-mono font-bold text-sky-300">{sales.demosBooked}</span>
                    </div>

                    {/* Demos Completed */}
                    <div className="p-2 rounded-lg bg-violet-950/30 border border-violet-500/30 flex items-center justify-between">
                      <span className="text-violet-200">3. Demos Completed</span>
                      <span className="font-mono font-bold text-violet-300">{sales.demosCompleted}</span>
                    </div>

                    {/* Proposals Sent */}
                    <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                      <span className="text-purple-200">4. Proposals Sent</span>
                      <span className="font-mono font-bold text-purple-300">{sales.proposalsSent}</span>
                    </div>

                    {/* Deals Won */}
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>5. Paying Deals Won</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{sales.dealsWon}</span>
                    </div>
                  </div>

                  {/* Deals Lost Breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-semibold text-rose-400 flex items-center justify-between mb-2">
                      <span>Deals Lost ({sales.dealsLost})</span>
                      <span className="text-[10px] text-slate-500">Loss Diagnosis</span>
                    </div>
                    <div className="space-y-1.5">
                      {sales.lossReasons.map((lr, idx) => (
                        <div key={idx} className="p-2 rounded bg-rose-950/20 border border-rose-500/20 text-[11px]">
                          <div className="text-rose-200 font-medium">{lr.reason}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Product: {lr.product}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: PIPELINE METRICS                                               */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "PIPELINE") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Target className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    3. Pipeline Metrics (Future Revenue & Stalling Analysis)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Weighted deal forecasting, stage distribution, and immediate follow-ups.
                  </p>
                </div>
              </div>
              <Link
                href="/leads"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Pipeline Board</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Pipeline KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Total Pipeline Value</div>
                <div className="text-xl font-bold text-white mt-1">
                  KES {(pipeline.totalPipelineValueKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">32 active deals</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl border border-violet-500/30">
                <div className="text-[11px] font-medium text-violet-400">Weighted Pipeline</div>
                <div className="text-xl font-bold text-violet-300 mt-1">
                  KES {(pipeline.weightedPipelineValueKES / 1000).toFixed(0)}k
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Probability adjusted</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Deals Won This Month</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{pipeline.dealsWonThisMonth}</div>
                <div className="text-[10px] text-emerald-400/90 mt-1">KES {(pipeline.dealsWonValueKES / 1000).toFixed(0)}k volume</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Win Rate</div>
                <div className="text-xl font-bold text-white mt-1">{pipeline.winRatePct}%</div>
                <div className="text-[10px] text-slate-500 mt-1">Won vs closed opportunities</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Average Deal Size</div>
                <div className="text-xl font-bold text-slate-200 mt-1">
                  KES {(pipeline.averageDealSizeKES / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Setup fee + 1st mo</div>
              </div>

              <div className="liquid-glass p-4 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Average Time to Close</div>
                <div className="text-xl font-bold text-amber-300 mt-1">{pipeline.averageTimeToCloseDays} days</div>
                <div className="text-[10px] text-slate-500 mt-1">Fast B2B velocity</div>
              </div>
            </div>

            {/* Pipeline Stage Distribution & Follow-ups Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deals by Stage Chart */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Deals by Stage & Probability Forecast
                  </h3>
                  <span className="text-[10px] text-slate-400">Shows where opportunities are moving</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  Healthy progression: 75% of demos progress to proposals; no bottlenecks in negotiation.
                </p>

                <div className="space-y-3">
                  {pipeline.dealsByStage.map((s) => (
                    <div key={s.stage} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${s.color}`} />
                          <span className="font-semibold text-slate-200">{s.stage}</span>
                          <span className="text-[10px] text-slate-400">({s.count} deals)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-white">
                            KES {(s.nominalValueKES / 1000).toFixed(0)}k
                          </span>
                          <span className="text-[10px] text-indigo-400 font-mono ml-2">
                            ({s.probabilityPct}% prob → KES {(s.weightedValueKES / 1000).toFixed(0)}k)
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${s.color} rounded-full`}
                          style={{ width: `${(s.nominalValueKES / 200000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-ups Due Today (Immediate Action List) */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Follow-Ups Due Today ({followUpsDue.length})
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Immediate Sales To-Do
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  Prospects awaiting your follow-up after demos, proposals, or WhatsApp reviews
                </p>

                <div className="space-y-2.5">
                  {followUpsDue.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                      All follow-ups completed. Great job staying on top of outreach!
                    </div>
                  ) : (
                    followUpsDue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{item.business}</span>
                            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                              {item.product}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono">{item.daysWaiting}d waiting</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.context}</p>
                        </div>

                        <button
                          onClick={() => openWhatsAppModal(item)}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition shrink-0"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: CLIENT & DELIVERY HEALTH                                       */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "DELIVERY") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    4. Client & Delivery Health (Retention & Go-Live Velocity)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Prevent churn, accelerate onboarding under 7 days, and resolve field blockers.
                  </p>
                </div>
              </div>
              <Link
                href="/projects"
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Projects Hub</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Client Delivery KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="liquid-glass p-3.5 rounded-xl border border-sky-500/30">
                <div className="text-[11px] font-medium text-sky-400">Active Paying Clients</div>
                <div className="text-xl font-bold text-white mt-1">{clientDelivery.activeClients}</div>
                <div className="text-[10px] text-slate-400 mt-1">+{clientDelivery.newClientsThisMonth} new this month</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">In Onboarding</div>
                <div className="text-xl font-bold text-amber-300 mt-1">{clientDelivery.clientsInOnboarding}</div>
                <div className="text-[10px] text-slate-500 mt-1">Implementation phase</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-rose-500/20">
                <div className="text-[11px] font-medium text-rose-400">Onboarding Blockers</div>
                <div className="text-xl font-bold text-rose-300 mt-1">{clientDelivery.onboardingBlockersCount}</div>
                <div className="text-[10px] text-rose-400 mt-1">Requires ops intervention</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Go-Lives Completed</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{clientDelivery.goLivesCompleted}</div>
                <div className="text-[10px] text-emerald-400 mt-1">Fully activated software</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl border border-emerald-500/20">
                <div className="text-[11px] font-medium text-emerald-400">Time to Go-Live</div>
                <div className="text-xl font-bold text-white mt-1">
                  {clientDelivery.averageDaysPaymentToGoLive} <span className="text-xs text-slate-400 font-normal">days</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">Target is &lt; 7 days</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Renewals (30 Days)</div>
                <div className="text-xl font-bold text-slate-200 mt-1">{clientDelivery.renewalsDue30Days}</div>
                <div className="text-[10px] text-slate-500 mt-1">Automated invoices queued</div>
              </div>

              <div className="liquid-glass p-3.5 rounded-xl">
                <div className="text-[11px] font-medium text-slate-400">Churn Rate</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{clientDelivery.churnRatePct}%</div>
                <div className="text-[10px] text-slate-500 mt-1">{clientDelivery.churnedClients} churned overall</div>
              </div>
            </div>

            {/* Client Health Breakdown & Blockers Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Health Status Gauge */}
              <div className="liquid-glass p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-2">
                  Client Health Status Distribution
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Continuous retention monitoring across 34 active enterprise accounts
                </p>

                {/* Visual Progress Bar */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner mb-4">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${clientDelivery.clientHealth.healthyPct}%` }}
                    title={`Healthy: ${clientDelivery.clientHealth.healthy} (${clientDelivery.clientHealth.healthyPct}%)`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${clientDelivery.clientHealth.needsAttentionPct}%` }}
                    title={`Needs Attention: ${clientDelivery.clientHealth.needsAttention}`}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${clientDelivery.clientHealth.atRiskPct}%` }}
                    title={`At Risk: ${clientDelivery.clientHealth.atRisk}`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Healthy</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.healthy} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.healthyPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Attention</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.needsAttention} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.needsAttentionPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 font-bold uppercase">At Risk</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {clientDelivery.clientHealth.atRisk} <span className="text-[10px] text-slate-400">({clientDelivery.clientHealth.atRiskPct}%)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Support Tickets</span>
                    <div className="text-sm font-bold text-slate-300 mt-0.5">
                      {clientDelivery.supportIssuesOpen} <span className="text-[10px] text-slate-500">open</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Blockers Card */}
              <div className="liquid-glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Active Onboarding Blockers ({onboardingBlockers.length})
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
                <p className="text-[11px] text-slate-400 mb-3">Clients waiting on technical setup, training, or data</p>

                <div className="space-y-2.5">
                  {onboardingBlockers.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                      Zero onboarding blockers. All client deployments are moving forward smoothly.
                    </div>
                  ) : (
                    onboardingBlockers.map((blk) => (
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: PRODUCT PERFORMANCE & DAY-45 TRACTION MATRIX                   */}
        {/* ========================================================================= */}
        {(activeSection === "ALL" || activeSection === "PRODUCTS") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    5. Product Performance & Day-45 Review Matrix
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Decide which products deserve full effort, require price/packaging adjustments, or should be paused.
                  </p>
                </div>
              </div>

              {/* Product Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Filter Product:</span>
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All 5 Products</option>
                  <option value="vehisoft">Vehisoft (Garages)</option>
                  <option value="versandry">Versandry (Laundromats)</option>
                  <option value="adversoft">Adversoft (Signage)</option>
                  <option value="lipatim">LipaTim (Rent Billing)</option>
                  <option value="melio-rms">Melio RMS (Restaurants)</option>
                </select>
              </div>
            </div>

            {/* Product Performance Matrix Table */}
            <div className="liquid-glass rounded-2xl overflow-hidden border border-slate-800/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product & Target</th>
                      <th className="p-3.5 text-center">Contacted</th>
                      <th className="p-3.5 text-center">Demos</th>
                      <th className="p-3.5 text-center">Won</th>
                      <th className="p-3.5 text-center">Conversion</th>
                      <th className="p-3.5 text-right">Cash Collected</th>
                      <th className="p-3.5 text-right">MRR</th>
                      <th className="p-3.5 text-center">Clients (Churn)</th>
                      <th className="p-3.5 text-center">Traction Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredProducts.map((p) => {
                      const tractionBadge = {
                        "Strong Traction": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                        "High ACV": "bg-violet-500/10 text-violet-400 border-violet-500/20",
                        "Steady Growth": "bg-sky-500/10 text-sky-400 border-sky-500/20",
                        "Watchlist": "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      }[p.tractionStatus];

                      return (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.category}</div>
                            <div className="text-[10px] text-indigo-300 mt-0.5 italic">
                              &ldquo;{p.day45Action}&rdquo;
                            </div>
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300 font-semibold">
                            {p.leadsContacted}
                          </td>
                          <td className="p-3.5 text-center font-mono text-sky-400 font-semibold">
                            {p.demosBooked}
                          </td>
                          <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">
                            {p.dealsWon}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="font-mono text-xs font-bold text-slate-200">
                              {p.conversionRatePct}%
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-white">
                            KES {(p.revenueCollected / 1000).toFixed(1)}k
                          </td>
                          <td className="p-3.5 text-right font-mono text-indigo-300 font-semibold">
                            KES {(p.mrr / 1000).toFixed(1)}k/mo
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="font-bold text-slate-200">{p.activeClients}</span>
                            {p.churnedClients > 0 && (
                              <span className="text-[10px] text-rose-400 ml-1">({p.churnedClients} churn)</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tractionBadge}`}>
                              {p.tractionStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Log Action */}
        {loggingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Log Outreach Outcome & Next Step</h3>
                    <p className="text-[11px] text-slate-400">{loggingItem.business} • {loggingItem.contact}</p>
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

              <form onSubmit={handleConfirmLog} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Outreach Outcome *</label>
                    <select
                      value={logOutcome}
                      onChange={(e) => setLogOutcome(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Connected - Demo Booked">Connected - Demo Booked</option>
                      <option value="Connected - Follow-up Needed">Connected - Follow-up Needed</option>
                      <option value="Left Message / Audio Note">Left Message / Audio Note</option>
                      <option value="No Answer / Voicemail">No Answer / Voicemail</option>
                      <option value="Gatekeeper Block / Call Back Later">Gatekeeper Block / Call Back Later</option>
                      <option value="Not Interested (Disqualified)">Not Interested (Disqualified)</option>
                      <option value="Wrong Contact / Disconnected">Wrong Contact / Disconnected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Update Deal Stage</label>
                    <select
                      value={logDealStage}
                      onChange={(e) => setLogDealStage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Contacted / Pitching">Contacted / Pitching</option>
                      <option value="Demo Booked">Demo Booked</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won / Closed">Won / Closed</option>
                      <option value="Disqualified">Disqualified</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Next Action</label>
                    <input
                      type="text"
                      value={logNextAction}
                      onChange={(e) => setLogNextAction(e.target.value)}
                      placeholder="e.g. Conduct live demo, send contract..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Next Action Date & Time</label>
                    <input
                      type="text"
                      value={logNextActionDate}
                      onChange={(e) => setLogNextActionDate(e.target.value)}
                      placeholder="e.g. Tomorrow 10:30 AM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notes & Objections Discussed</label>
                  <textarea
                    rows={2}
                    required
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Describe feedback, customer objection, or agreed meeting time..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="optOutToggle"
                      checked={logOptOut}
                      onChange={(e) => setLogOptOut(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                    <label htmlFor="optOutToggle" className="text-slate-300 font-medium cursor-pointer">
                      Prospect requested not to be contacted (Do Not Contact / DNC)
                    </label>
                  </div>
                  {logOptOut && (
                    <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                      Opted Out
                    </span>
                  )}
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
