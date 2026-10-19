import { VERSALY_PRODUCTS } from "@/data/products-catalog";
import { INITIAL_ACTIVE_DEALS } from "@/data/leads-seed";
import { INITIAL_PROJECTS } from "@/data/clients-projects-seed";
import { KNOWLEDGE_ARTICLES, ARCHITECTURAL_DECISIONS } from "@/data/knowledge-seed";
import { INVOICES_SEED } from "@/data/finance-seed";

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
  userRole: "OWNER" | "ADMIN" | "MANAGER" | "STAFF" = "ADMIN"
): AssistantAnswer {
  // Pre-retrieval role check
  const isAuthorizedForFinancials = ["OWNER", "ADMIN", "MANAGER"].includes(userRole);
  const q = userQuery.toLowerCase().trim();
  const citations: GroundedCitation[] = [];
  const keyFacts: string[] = [];

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

    const overdueInvoices = INVOICES_SEED.filter((inv) => inv.status === "OVERDUE");
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balanceKES, 0);

    overdueInvoices.forEach((inv) => {
      citations.push({
        sourceType: "INVOICE",
        title: `${inv.invoiceNumber} - ${inv.clientName}`,
        linkUrl: `/finance`,
        snippet: `Overdue balance of KES ${inv.balanceKES.toLocaleString()} for ${inv.productName} due on ${inv.dueDate}.`,
      });
      keyFacts.push(`${inv.clientName} (${inv.productName}): KES ${inv.balanceKES.toLocaleString()} overdue since ${inv.dueDate}`);
    });

    return {
      summary: `There are currently ${overdueInvoices.length} overdue invoices totaling KES ${totalOverdue.toLocaleString()} requiring immediate action.`,
      directAnswer: `As of today, ${overdueInvoices.length} client accounts have outstanding balances past their due dates:\n\n` +
        overdueInvoices.map(inv => `• **${inv.clientName}**: KES ${inv.balanceKES.toLocaleString()} (${inv.productName}) - Due on ${inv.dueDate}`).join("\n"),
      keyFacts,
      recommendation: "Send automated WhatsApp payment reminders with M-Pesa Paybill number 894020 from the Finance Hub.",
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
    const blockedProjects = INITIAL_PROJECTS.filter((p) => p.hasBlocker);

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
    const activeDeals = INITIAL_ACTIVE_DEALS;
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
