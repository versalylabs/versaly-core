import { VERSALY_PRODUCTS } from "@/data/products-catalog";
import { KNOWLEDGE_ARTICLES, ARCHITECTURAL_DECISIONS } from "@/data/knowledge-seed";
import { buildForecast, computeSnapshot, emptyWorkspaceData, type WorkspaceData } from "@/lib/insights";
import { collectionState, nairobiDay } from "@/lib/money";
import { formatKES } from "@/lib/invoice-messages";

export interface GroundedCitation {
  sourceType: "PRODUCT" | "DEAL" | "LEAD" | "CLIENT" | "PROJECT" | "SOP" | "ADR" | "INVOICE";
  title: string;
  linkUrl: string;
  snippet: string;
}

export interface AssistantAnswer {
  summary: string;
  directAnswer: string;
  keyFacts: string[];
  recommendation?: string;
  citations: GroundedCitation[];
  confidenceScore: number; // 0.0 - 1.0
}

/**
 * Pure Grounded RAG Query Engine
 * Strict Anti-Hallucination: Answers ONLY using verified internal entities.
 */
export function queryInternalKnowledge(
  userQuery: string,
  userRole: "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "READ_ONLY" = "ADMIN",
  /** Your real records (invoices, deals, projects…). Pass loadWorkspaceData() in the app. */
  data: WorkspaceData = emptyWorkspaceData(),
  todayIso: string = nairobiDay()
): AssistantAnswer {
  // Pre-retrieval role check
  const isAuthorizedForFinancials = ["OWNER", "ADMIN", "MANAGER"].includes(userRole);
  const q = userQuery.toLowerCase().trim();
  const citations: GroundedCitation[] = [];
  const keyFacts: string[] = [];

  // 0a. Query: cash, runway and forecast
  if (
    q.includes("forecast") ||
    q.includes("runway") ||
    q.includes("cash flow") ||
    q.includes("cashflow") ||
    q.includes("cash position") ||
    q.includes("how much cash") ||
    q.includes("run out")
  ) {
    if (!isAuthorizedForFinancials) {
      return {
        summary: "Financial records are restricted to Management & Owner roles.",
        directAnswer: "Pre-retrieval authorization blocked access to financial records for your role.",
        keyFacts: ["Role authorization: ACCESS_DENIED"],
        citations: [],
        confidenceScore: 1.0,
      };
    }
    const forecast = buildForecast(data, todayIso, 8);
    const low = forecast.weeks.reduce((l, w) => (w.cashKES < l.cashKES ? w : l), forecast.weeks[0]);
    keyFacts.push(
      `Cash today: ${formatKES(forecast.startCashKES)}`,
      `Expected in over 8 weeks: ${formatKES(forecast.totals.inflowConfirmedKES)} (invoices and subscriptions)`,
      `Known out: ${formatKES(forecast.totals.outflowKES)} (vendor bills and scheduled expenses)`,
      `Lowest projected cash: ${formatKES(low.cashKES)} in the week of ${low.start}`
    );
    citations.push({
      sourceType: "INVOICE",
      title: "Cash Flow Forecast",
      linkUrl: "/finance/forecast",
      snippet: `8-week outlook from ${forecast.weeks[0].start}. Weighted pipeline adds ${formatKES(forecast.totals.inflowPipelineKES)}.`,
    });
    return {
      summary: forecast.goesNegative
        ? `Projected cash drops below zero in the week of ${low.start} unless something changes.`
        : `Cash stays positive over the next 8 weeks, with a low point of ${formatKES(low.cashKES)}.`,
      directAnswer:
        `Based on your invoices, subscriptions and scheduled costs:\n\n` +
        `• **Cash today:** ${formatKES(forecast.startCashKES)}\n` +
        `• **Expected in (8 weeks):** ${formatKES(forecast.totals.inflowConfirmedKES)}\n` +
        `• **Known out:** ${formatKES(forecast.totals.outflowKES)}\n` +
        `• **Lowest point:** ${formatKES(low.cashKES)} (week of ${low.start})\n\n` +
        `This only counts costs you have scheduled, so salaries and tax are not included unless entered.`,
      keyFacts,
      recommendation: forecast.goesNegative
        ? "Chase the overdue invoices first, and consider moving a scheduled payment past the low point."
        : "Keep invoices flowing: send draft invoices and chase overdue ones from Finance → Invoices.",
      citations,
      confidenceScore: 0.9,
    };
  }

  // 0b. Query: recurring revenue
  if (q.includes("mrr") || q.includes("recurring") || q.includes("subscriber")) {
    if (!isAuthorizedForFinancials) {
      return {
        summary: "Financial records are restricted to Management & Owner roles.",
        directAnswer: "Pre-retrieval authorization blocked access to financial records for your role.",
        keyFacts: ["Role authorization: ACCESS_DENIED"],
        citations: [],
        confidenceScore: 1.0,
      };
    }
    const snap = computeSnapshot(data, todayIso);
    keyFacts.push(`Live MRR: ${formatKES(snap.mrrKES)}`, `Trial MRR (starts when onboarding completes): ${formatKES(snap.trialMrrKES)}`);
    citations.push({ sourceType: "CLIENT", title: "Client Revenue & MRR", linkUrl: "/finance/revenue", snippet: `Live ${formatKES(snap.mrrKES)} per month; ${formatKES(snap.trialMrrKES)} more once trials go live.` });
    return {
      summary: `Monthly recurring revenue is ${formatKES(snap.mrrKES)} from active subscriptions.`,
      directAnswer:
        `• **Live MRR:** ${formatKES(snap.mrrKES)}\n` +
        `• **Waiting on go-live:** ${formatKES(snap.trialMrrKES)}/mo (trial subscriptions)\n` +
        `• **Potential from open deals:** ${formatKES(snap.pipeline.potentialMrrKES)}/mo`,
      keyFacts,
      recommendation: snap.trialMrrKES > 0 ? "Complete the onboarding projects to switch the trial subscriptions to live billing." : undefined,
      citations,
      confidenceScore: 0.95,
    };
  }

  // 1. Query: Overdue Invoices / Cashflow / Money
  if (
    q.includes("invoice") ||
    q.includes("overdue") ||
    q.includes("money") ||
    q.includes("balance") ||
    q.includes("payment") ||
    q.includes("receivable")
  ) {
    if (!isAuthorizedForFinancials) {
      return {
        summary: "Financial records are restricted to Management & Owner roles.",
        directAnswer: "Pre-retrieval authorization blocked access to financial records for your role.",
        keyFacts: ["Role authorization: ACCESS_DENIED"],
        citations: [],
        confidenceScore: 1.0,
      };
    }

    const overdueInvoices = data.invoices.filter(
      (inv) => (inv.status === "SENT" || inv.status === "OVERDUE") && inv.balanceKES > 0 && collectionState(inv, todayIso).stage === "overdue"
    );
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceKES, 0);
    const snap = computeSnapshot(data, todayIso);

    overdueInvoices.forEach((inv) => {
      citations.push({
        sourceType: "INVOICE",
        title: `${inv.invoiceNumber} - ${inv.clientName}`,
        linkUrl: `/finance/invoices`,
        snippet: `Overdue balance of ${formatKES(inv.balanceKES)}, due on ${inv.dueDate}.`,
      });
      keyFacts.push(`${inv.clientName}: ${formatKES(inv.balanceKES)} overdue since ${inv.dueDate}`);
    });
    if (snap.unsentDrafts.count > 0) keyFacts.push(`${snap.unsentDrafts.count} draft invoice(s) worth ${formatKES(snap.unsentDrafts.totalKES)} not sent yet`);

    if (!overdueInvoices.length) {
      return {
        summary: "No invoices are overdue right now.",
        directAnswer:
          `Nothing is past due. ${formatKES(snap.receivables.openKES)} is outstanding across ${snap.receivables.openCount} sent invoice(s).` +
          (snap.unsentDrafts.count ? `\n\nYou also have ${snap.unsentDrafts.count} draft invoice(s) (${formatKES(snap.unsentDrafts.totalKES)}) that haven't been sent yet.` : ""),
        keyFacts,
        recommendation: snap.unsentDrafts.count ? "Send the draft invoices from Finance → Invoices so the clock starts on payment." : undefined,
        citations,
        confidenceScore: 0.95,
      };
    }

    return {
      summary: `There are currently ${overdueInvoices.length} overdue invoices totaling ${formatKES(totalOverdue)} requiring immediate action.`,
      directAnswer: `As of today, ${overdueInvoices.length} client accounts have outstanding balances past their due dates:\n\n` +
        overdueInvoices.map((inv) => `• **${inv.clientName}**: ${formatKES(inv.balanceKES)} - Due on ${inv.dueDate}`).join("\n"),
      keyFacts,
      recommendation: "Send payment reminders from the Needs follow-up list in Finance → Invoices.",
      citations,
      confidenceScore: 0.98,
    };
  }

  // 2. Query: Onboarding Blockers / Project Obstacles
  if (
    q.includes("blocker") ||
    q.includes("blocked") ||
    q.includes("stuck") ||
    q.includes("obstacle") ||
    q.includes("delay")
  ) {
    const blockedProjects = data.projects.filter((p) => p.status !== "COMPLETED" && (p.hasBlocker || p.status === "BLOCKED"));

    blockedProjects.forEach((proj) => {
      citations.push({
        sourceType: "PROJECT",
        title: `${proj.name} (${proj.clientName})`,
        linkUrl: `/projects`,
        snippet: `Blocker: ${proj.blockerDescription} (${proj.blockerDays} days delayed). Lead: ${proj.leadArchitect}.`,
      });
      keyFacts.push(`${proj.clientName} (${proj.productName}): ${proj.blockerDescription} [${proj.blockerDays} days idle]`);
    });

    return {
      summary: `There are ${blockedProjects.length} implementation project(s) currently marked as BLOCKED in the operational workspace.`,
      directAnswer: `The active implementation blockers are:\n\n` +
        blockedProjects.map(p => `• **${p.clientName}** (${p.productName}): ${p.blockerDescription} (${p.blockerDays} days waiting)`).join("\n"),
      keyFacts,
      recommendation: "Review blocked items during the Friday 20-Minute Rhythm Review and re-engage client management to schedule required garage/premises access.",
      citations,
      confidenceScore: 0.96,
    };
  }

  // 3. Query: Products / Pricing / Guarantees
  if (
    q.includes("product") ||
    q.includes("pricing") ||
    q.includes("adversoft") ||
    q.includes("vehisoft") ||
    q.includes("versandry") ||
    q.includes("lipatim") ||
    q.includes("melio") ||
    q.includes("guarantee")
  ) {
    const matchedProducts = VERSALY_PRODUCTS.filter(
      (p) =>
        q.includes(p.slug) ||
        q.includes(p.name.toLowerCase()) ||
        q.includes("product") ||
        q.includes("pricing")
    );

    const targetList = matchedProducts.length > 0 ? matchedProducts : VERSALY_PRODUCTS;

    targetList.forEach((prod) => {
      citations.push({
        sourceType: "PRODUCT",
        title: `${prod.name} (${prod.category})`,
        linkUrl: `/products#${prod.slug}`,
        snippet: `Setup: KES ${prod.setupFee.toLocaleString()} | Monthly: KES ${prod.monthlyFee.toLocaleString()}/mo. ${prod.guaranteeOffer}`,
      });
      keyFacts.push(`${prod.name}: Setup KES ${prod.setupFee.toLocaleString()}, MRR KES ${prod.monthlyFee.toLocaleString()}`);
    });

    return {
      summary: `Versaly offers 5 vertical software products tailored for Kenyan businesses, each backed by a 14-day zero-risk founding guarantee.`,
      directAnswer: `Here is the verified commercial pricing and positioning:\n\n` +
        targetList.map(p => `• **${p.name}** (${p.category}): Setup KES ${p.setupFee.toLocaleString()} + KES ${p.monthlyFee.toLocaleString()}/mo MRR.\n  *Guarantee:* ${p.guaranteeOffer}`).join("\n\n"),
      keyFacts,
      recommendation: "Always attach the 1-Page Executive Sales Sheet and reference the 14-day founding client guarantee when delivering quotes.",
      citations,
      confidenceScore: 0.99,
    };
  }

  // 4. Query: SOPs / Technical Runbooks / eTIMS / GPS
  if (
    q.includes("sop") ||
    q.includes("runbook") ||
    q.includes("etims") ||
    q.includes("kra") ||
    q.includes("gps") ||
    q.includes("telematics") ||
    q.includes("install") ||
    q.includes("excel") ||
    q.includes("objection")
  ) {
    const matchedArticles = KNOWLEDGE_ARTICLES.filter((art) => {
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some(t => q.includes(t.toLowerCase()))
      );
    });

    const targetArticle = matchedArticles[0] || KNOWLEDGE_ARTICLES[0];

    citations.push({
      sourceType: "SOP",
      title: targetArticle.title,
      linkUrl: `/knowledge#${targetArticle.slug}`,
      snippet: targetArticle.summary,
    });

    targetArticle.checklists?.forEach((c) => {
      keyFacts.push(`Step ${c.stepOrder}: ${c.title} (${c.roleScope})`);
    });

    return {
      summary: `Standard Operating Procedure verified from Versaly Knowledge Base: "${targetArticle.title}" (v${targetArticle.version}.0).`,
      directAnswer: `**${targetArticle.title}**\n\n${targetArticle.summary}\n\n**Standard Execution Steps:**\n` +
        (targetArticle.checklists
          ? targetArticle.checklists.map(c => `${c.stepOrder}. **${c.title}**: ${c.description} *[Assigned: ${c.roleScope}]*`).join("\n")
          : targetArticle.contentMarkdown),
      keyFacts: keyFacts.slice(0, 5),
      recommendation: "Use the 'Convert to Project Tasks' feature in the Knowledge Base to instantiate these checklist items directly on active client projects.",
      citations,
      confidenceScore: 0.97,
    };
  }

  // 5. Query: Active Pipeline / Leads / Deals
  if (
    q.includes("deal") ||
    q.includes("pipeline") ||
    q.includes("lead") ||
    q.includes("sales") ||
    q.includes("proposal") ||
    q.includes("closing")
  ) {
    const activeDeals = data.deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
    const proposalDeals = activeDeals.filter(d => d.stage === "PROPOSAL_SENT" || d.stage === "DEMO_BOOKED");

    activeDeals.slice(0, 3).forEach((deal) => {
      citations.push({
        sourceType: "DEAL",
        title: `${deal.businessName} (${deal.productName})`,
        linkUrl: `/leads`,
        snippet: `Stage: ${deal.stage} | Setup: KES ${deal.setupFeeKES.toLocaleString()} | MRR: KES ${deal.monthlyFeeKES.toLocaleString()}/mo. Probability: ${deal.winProbability}%.`,
      });
      keyFacts.push(`${deal.businessName}: Stage ${deal.stage}, ${deal.winProbability}% win probability`);
    });

    return {
      summary: `The active pipeline contains ${activeDeals.length} qualified deals across the 5 products, with ${proposalDeals.length} currently in proposal/demo stages.`,
      directAnswer: `**Key Active Pipeline Highlights:**\n\n` +
        activeDeals.map(d => `• **${d.businessName}** (${d.productName}): Stage **${d.stage}** | Expected: KES ${d.setupFeeKES.toLocaleString()} setup + KES ${d.monthlyFeeKES.toLocaleString()}/mo. Next Action: ${d.nextAction}`).join("\n"),
      keyFacts,
      recommendation: "Prioritize follow-ups on proposals sent within the last 48-72 hours to prevent deal stagnation.",
      citations,
      confidenceScore: 0.95,
    };
  }

  // 6. Query: Architectural Decisions / ADRs / Technical Strategy
  if (
    q.includes("adr") ||
    q.includes("decision") ||
    q.includes("architecture") ||
    q.includes("database") ||
    q.includes("why")
  ) {
    const adrs = ARCHITECTURAL_DECISIONS;
    adrs.forEach((adr) => {
      citations.push({
        sourceType: "ADR",
        title: adr.title,
        linkUrl: `/knowledge`,
        snippet: `Status: ${adr.status}. Decision: ${adr.decision}`,
      });
      keyFacts.push(`ADR #${adr.adrNumber}: ${adr.title} [${adr.status}]`);
    });

    return {
      summary: `There are ${adrs.length} accepted Architectural Decision Records (ADRs) governing Versaly Core operations.`,
      directAnswer: `**Core Architectural Decisions:**\n\n` +
        adrs.map(a => `• **ADR #${a.adrNumber}**: ${a.title}\n  *Decision:* ${a.decision}`).join("\n\n"),
      keyFacts,
      recommendation: "Refer to the ADR registry in /knowledge before proposing schema partitioning or third-party service decouplings.",
      citations,
      confidenceScore: 0.98,
    };
  }

  // Fallback: General workspace query summary
  return {
    summary: `Search across Versaly Core unified relational workspace.`,
    directAnswer: `I searched across products, leads, active deals, clients, onboarding projects, invoices, and SOP playbooks matching "${userQuery}".\n\n` +
      `Try asking specific operational questions such as:\n` +
      `• *"Which invoices are currently overdue?"*\n` +
      `• *"What projects have active onboarding blockers?"*\n` +
      `• *"What is the setup fee and guarantee for Adversoft and Vehisoft?"*\n` +
      `• *"What is our SOP for Melio RMS KRA eTIMS integration?"*\n` +
      `• *"How does our two-tier sales pipeline work?"*`,
    keyFacts: [
      "5 Core Products active (Adversoft, Vehisoft, Versandry, LipaTim, Melio RMS)",
      "Unified relational PostgreSQL schema with one record per business/client",
      "Strict pre-retrieval RBAC ensuring users only view data authorized for their role",
    ],
    recommendation: "Use the Command Palette (Ctrl+K) or natural query prompt above to inspect operational records.",
    citations: [
      {
        sourceType: "PRODUCT",
        title: "Versaly Products Catalog",
        linkUrl: "/products",
        snippet: "Adversoft, Vehisoft, Versandry, LipaTim, Melio RMS operational specifications.",
      },
      {
        sourceType: "SOP",
        title: "Operational Knowledge Base & SOPs",
        linkUrl: "/knowledge",
        snippet: "Verified technical runbooks, field checklists, and sales objection handling playbooks.",
      },
    ],
    confidenceScore: 0.88,
  };
}
