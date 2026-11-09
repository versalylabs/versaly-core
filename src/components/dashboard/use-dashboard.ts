"use client";

import { useProductsCatalog, getProductColor } from "@/lib/products-store";
import { useState, useEffect, useMemo } from "react";
import { useCurrentUser } from "@/lib/current-user";
import { OutreachItem, DASHBOARD_QUEUE_KEY, INITIAL_QUEUE, FridayScorecard, computeIntelligenceBriefing } from "@/lib/dashboard-data";
import { appStorage } from "@/lib/app-storage";
import { loadInvoicesFromStorage, loadExpensesFromStorage, loadSubscriptionsFromStorage, computeFinanceSummary, SETUP_FEE_LAUNCH_TARGET, MRR_LAUNCH_TARGET } from "@/lib/finance-store";
import { type InsightDeal, type InsightClient, type InsightProject, computePipelineMetrics, computeFunnel } from "@/lib/insights";
import { KEYS } from "@/lib/storage-keys";
import { type OutreachEntry, OUTREACH_LOG_KEY, countOutreach, countNewLeadsThisWeek, computeDelivery, openSupportTickets, computeProductActivity, computeFollowUps, computeCashAlerts } from "@/lib/ops-metrics";
import { todayIsoDate } from "@/lib/ids";
import { INITIAL_SALES_ACTIVITY_METRICS, INITIAL_PRODUCT_PERFORMANCE } from "@/data/dashboard-metrics";
import { readStored } from "./helpers";

export function useDashboard() {

  const { products: catalogProducts } = useProductsCatalog();
  const [activeSection, setActiveSection] = useState<"ALL" | "MONEY" | "SALES" | "PIPELINE" | "DELIVERY" | "PRODUCTS">("ALL");
  // Finance figures are only for roles that may read finance (the server withholds the data from everyone else too)
  const me = useCurrentUser();
  const canSeeFinance = !me || me.permissions.includes("finance:read");
  const [isFridayReview, setIsFridayReview] = useState(false);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("ALL");

  const [queue, setQueue] = useState<OutreachItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(DASHBOARD_QUEUE_KEY);
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
        const stored = appStorage.getItem("versaly_friday_weekly_review_v2");
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
      appStorage.setItem("versaly_friday_weekly_review_v2", JSON.stringify(fridayScorecard));
      setToastMessage("✓ Friday Weekly Review Scorecard saved successfully!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      // ignore
    }
  };

  // Save queue to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(DASHBOARD_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
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
    const handleSync = () => {
      setFinInvoices(loadInvoicesFromStorage());
      setFinExpenses(loadExpensesFromStorage());
      setFinSubscriptions(loadSubscriptionsFromStorage());
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("versaly_finance_updated", handleSync);
    window.addEventListener("versaly_invoices_updated", handleSync);
    window.addEventListener("versaly_subscriptions_updated", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("versaly_finance_updated", handleSync);
      window.removeEventListener("versaly_invoices_updated", handleSync);
      window.removeEventListener("versaly_subscriptions_updated", handleSync);
    };
  }, []);

  const financeSummary = useMemo(() => {
    return computeFinanceSummary(finInvoices, finExpenses, finSubscriptions);
  }, [finInvoices, finExpenses, finSubscriptions]);

  // ── Intelligence Briefing ─────────────────────────────────────────────────
  const [intelligenceBriefing, setIntelligenceBriefing] = useState(() =>
    computeIntelligenceBriefing()
  );

  useEffect(() => {
    const refresh = () => setIntelligenceBriefing(computeIntelligenceBriefing());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("versaly_products_updated", refresh);
    window.addEventListener("versaly_tasks_updated", refresh);
    window.addEventListener("versaly_calendar_updated", refresh);
    window.addEventListener("versaly_projects_updated", refresh);
    window.addEventListener("versaly_deals_updated", refresh);
    window.addEventListener("versaly_leads_updated", refresh);
    window.addEventListener("versaly_invoices_updated", refresh);
    window.addEventListener("versaly_finance_updated", refresh);
    window.addEventListener("versaly_clients_updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("versaly_products_updated", refresh);
      window.removeEventListener("versaly_tasks_updated", refresh);
      window.removeEventListener("versaly_calendar_updated", refresh);
      window.removeEventListener("versaly_projects_updated", refresh);
      window.removeEventListener("versaly_deals_updated", refresh);
      window.removeEventListener("versaly_leads_updated", refresh);
      window.removeEventListener("versaly_invoices_updated", refresh);
      window.removeEventListener("versaly_finance_updated", refresh);
      window.removeEventListener("versaly_clients_updated", refresh);
    };
  }, []);

  const money = useMemo(() => {
    const totalCollected = financeSummary.totalCollected;

    const productRevenueBreakdown = catalogProducts.map((prod) => {
      const collected =
        financeSummary.productRevenue[prod.name] ||
        financeSummary.productRevenue[prod.slug] ||
        0;
      const mrr =
        financeSummary.productMRR[prod.name] ||
        financeSummary.productMRR[prod.slug] ||
        0;
      const pct = totalCollected > 0 ? Math.round((collected / totalCollected) * 100) : 0;
      return {
        name: prod.name,
        slug: prod.slug,
        collected,
        mrr,
        pct,
        color: getProductColor(prod.slug || prod.name),
      };
    });

    const activeCount = financeSummary.activeSubscriptionsCount || 0;
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
      activePayingAccountsCount: activeCount,
      productRevenueBreakdown,
    };
  }, [financeSummary, catalogProducts]);

  // Everything below is worked out from your real records (the same ones the briefing counts)
  const [crm] = useState(() => ({
    deals: readStored<InsightDeal>(KEYS.deals),
    leads: readStored<{ status?: string; createdAt?: string }>("versaly_raw_leads_v2"),
    clients: readStored<InsightClient>(KEYS.clients),
    projects: readStored<InsightProject>(KEYS.projects),
    tickets: readStored<{ status?: string }>("versaly_support_tickets_list_v2"),
  }));
  const [outreachLog, setOutreachLog] = useState<OutreachEntry[]>(() => readStored<OutreachEntry>(OUTREACH_LOG_KEY));
  useEffect(() => {
    if (!outreachLog.length) return;
    try {
      appStorage.setItem(OUTREACH_LOG_KEY, JSON.stringify(outreachLog.slice(0, 2000)));
    } catch {
      // ignore
    }
  }, [outreachLog]);

  const pipeline = useMemo(() => computePipelineMetrics(crm.deals, todayIsoDate()), [crm]);
  const funnel = useMemo(() => computeFunnel(crm.leads, crm.deals), [crm]);
  const outreach = useMemo(() => countOutreach(outreachLog, todayIsoDate()), [outreachLog]);

  const sales = useMemo(() => {
    return {
      ...INITIAL_SALES_ACTIVITY_METRICS,
      ...funnel,
      outreachToday: outreach.today,
      outreachThisWeek: outreach.week,
      newLeadsAddedWeek: countNewLeadsThisWeek(crm.leads, todayIsoDate()),
    };
  }, [outreach, funnel, crm]);

  const delivery = useMemo(() => computeDelivery(crm.clients, crm.projects, todayIsoDate()), [crm]);
  const clientDelivery = { ...delivery, clientHealth: delivery.health, supportIssuesOpen: openSupportTickets(crm.tickets) };

  const products = useMemo(() => {
    return catalogProducts.map((p) => {
      const existing = INITIAL_PRODUCT_PERFORMANCE.find(
        (item) => item.slug === p.slug || item.name.toLowerCase() === p.name.toLowerCase()
      );
      const collected = financeSummary.productRevenue[p.name] || financeSummary.productRevenue[p.slug] || 0;
      const mrr = financeSummary.productMRR[p.name] || financeSummary.productMRR[p.slug] || 0;
      const activity = computeProductActivity({ slug: p.slug, name: p.name }, crm.deals, crm.clients);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category || existing?.category || "",
        leadsContacted: activity.leadsContacted,
        demosBooked: activity.demosBooked,
        dealsWon: activity.dealsWon,
        revenueCollected: collected,
        mrr,
        activeClients: activity.clients,
        churnedClients: 0,
        averageDealSize: activity.averageDealSize,
        conversionRatePct: activity.conversionRatePct,
        tractionStatus: activity.traction,
        day45Action: existing?.day45Action || `${p.name} active pipeline expansion and direct client acquisition.`,
      };
    });
  }, [catalogProducts, financeSummary, crm]);

  const filteredProducts = useMemo(() => {
    if (selectedProductFilter === "ALL") return products;
    return products.filter((p) => p.slug === selectedProductFilter);
  }, [products, selectedProductFilter]);

  const followUpsDue = useMemo(() => computeFollowUps(crm.deals, todayIsoDate()), [crm]);
  const onboardingBlockers = delivery.blockers;
  const cashAlerts = useMemo(() => computeCashAlerts(finInvoices, todayIsoDate()), [finInvoices]);

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

    setOutreachLog((prev) => [
      { id: `log-${Date.now()}`, date: todayIsoDate(), business: loggingItem.business, channel: loggingItem.channel, outcome: logOutcome, optedOut: logOptOut },
      ...prev,
    ]);
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

  return {
    catalogProducts,
    activeSection,
    setActiveSection,
    me,
    canSeeFinance,
    isFridayReview,
    setIsFridayReview,
    selectedProductFilter,
    setSelectedProductFilter,
    queue,
    setQueue,
    loggingItem,
    setLoggingItem,
    logOutcome,
    setLogOutcome,
    logNotes,
    setLogNotes,
    logNextAction,
    setLogNextAction,
    logNextActionDate,
    setLogNextActionDate,
    logDealStage,
    setLogDealStage,
    logOptOut,
    setLogOptOut,
    toastMessage,
    setToastMessage,
    isNewActionModalOpen,
    setIsNewActionModalOpen,
    newBusiness,
    setNewBusiness,
    newContact,
    setNewContact,
    newPhone,
    setNewPhone,
    newChannel,
    setNewChannel,
    newProduct,
    setNewProduct,
    newTiming,
    setNewTiming,
    newScript,
    setNewScript,
    whatsAppItem,
    setWhatsAppItem,
    whatsAppMessage,
    setWhatsAppMessage,
    fridayScorecard,
    setFridayScorecard,
    handleSaveFridayScorecard,
    finInvoices,
    setFinInvoices,
    finExpenses,
    setFinExpenses,
    finSubscriptions,
    setFinSubscriptions,
    financeSummary,
    intelligenceBriefing,
    setIntelligenceBriefing,
    money,
    crm,
    outreachLog,
    setOutreachLog,
    pipeline,
    funnel,
    outreach,
    sales,
    delivery,
    clientDelivery,
    products,
    filteredProducts,
    followUpsDue,
    onboardingBlockers,
    cashAlerts,
    openLogModal,
    handleConfirmLog,
    handleCreateNewAction,
    openWhatsAppModal,
    handleSendWhatsApp,
  };
}

export type DashboardModel = ReturnType<typeof useDashboard>;
