/**
 * Business insights computed from the workspace data: a snapshot of where
 * things stand, and a week-by-week cash forecast. Pure functions (no React, no
 * browser APIs) so the app, the assistant and the weekly email share one source
 * of truth, and so the logic can be tested.
 */

import { addDaysIso, addMonthsIso, collectionState, cycleMonths, daysBetween, nairobiDay } from "@/lib/money";
import type { BillingCycle } from "@/lib/money";

// ---------------------------------------------------------------------------
// Input shapes (only the fields we use, so the real records satisfy them)
// ---------------------------------------------------------------------------

export interface InsightInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  status: "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "VOID";
  totalKES: number;
  amountPaidKES: number;
  balanceKES: number;
  dueDate: string;
  payments?: { amountKES: number; receivedAt: string }[];
}

export interface InsightSubscription {
  id: string;
  clientName: string;
  productName: string;
  monthlyFeeKES: number;
  billingCycle: BillingCycle;
  status: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED";
  nextBillingDate: string;
}

export interface InsightDeal {
  id: string;
  businessName: string;
  productName: string;
  stage: "CONTACTED" | "DEMO_BOOKED" | "PROPOSAL_SENT" | "NEGOTIATION" | "WON" | "LOST";
  setupFeeKES: number;
  monthlyFeeKES: number;
  winProbability: number;
  targetCloseDate: string;
  nextAction?: string;
  // Optional details the dashboard uses when they exist
  productSlug?: string;
  contactName?: string;
  contactPhone?: string;
  /** The day the deal was created, "2026-11-09" (older deals don't have one). */
  createdAt?: string;
  /** The day the stage last changed. */
  stageChangedAt?: string;
  wonAt?: string;
  lostAt?: string;
}

export interface InsightProject {
  id: string;
  clientName: string;
  name: string;
  productName?: string;
  leadArchitect?: string;
  status: "ACTIVE" | "BLOCKED" | "COMPLETED";
  progressPct: number;
  hasBlocker: boolean;
  blockerDescription?: string;
  blockerDays?: number;
  targetGoLiveDate: string;
}

export interface InsightClient {
  id: string;
  status: "ONBOARDING" | "ACTIVE" | "PAST_DUE";
  // Optional details the assistant can use when they exist (never phone, email or tax PIN)
  businessName?: string;
  contactName?: string;
  productName?: string;
  monthlyMRR?: number;
  renewalDate?: string;
  onboardingProgressPct?: number;
  productSlug?: string;
  /** The day the client record was created (older records don't have one). */
  createdAt?: string;
}

export interface InsightAccount {
  id: string;
  name: string;
  accountType: string;
  balanceKES: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface InsightVendorSubscription {
  id: string;
  provider: string;
  serviceName: string;
  costKES: number;
  billingCycle: BillingCycle;
  renewalDate: string;
  status: "ACTIVE" | "REVIEW_FOR_CANCEL" | "CANCELLED";
}

export interface InsightExpense {
  id: string;
  description: string;
  vendor: string;
  amountKES: number;
  expenseDate: string;
  status: "PAID" | "PENDING_APPROVAL" | "SCHEDULED" | "REJECTED";
}

export interface WorkspaceData {
  invoices: InsightInvoice[];
  subscriptions: InsightSubscription[];
  deals: InsightDeal[];
  projects: InsightProject[];
  clients: InsightClient[];
  accounts: InsightAccount[];
  vendorSubscriptions: InsightVendorSubscription[];
  expenses: InsightExpense[];
}

export const emptyWorkspaceData = (): WorkspaceData => ({
  invoices: [],
  subscriptions: [],
  deals: [],
  projects: [],
  clients: [],
  accounts: [],
  vendorSubscriptions: [],
  expenses: [],
});

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

export interface FollowUp {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  balanceKES: number;
  stage: "overdue" | "due_today" | "due_soon";
  daysToDue: number;
}

export interface Snapshot {
  todayIso: string;
  cashOnHandKES: number;
  receivables: { openKES: number; openCount: number; overdueKES: number; overdueCount: number };
  unsentDrafts: { count: number; totalKES: number };
  collectedThisMonthKES: number;
  mrrKES: number;
  trialMrrKES: number;
  pipeline: {
    openDeals: number;
    setupKES: number;
    weightedSetupKES: number;
    potentialMrrKES: number;
    byStage: Record<string, number>;
  };
  projects: { active: number; blocked: number; late: number; blockers: { client: string; text: string; days: number }[] };
  clients: { total: number; active: number; onboarding: number; pastDue: number };
  followUps: FollowUp[];
}

const isIso = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}/.test(s);

export function computeSnapshot(data: WorkspaceData, todayIso: string): Snapshot {
  const month = todayIso.slice(0, 7);

  const open = data.invoices.filter((i) => (i.status === "SENT" || i.status === "OVERDUE") && i.balanceKES > 0);
  const overdue = open.filter((i) => collectionState(i, todayIso).stage === "overdue");
  const drafts = data.invoices.filter((i) => i.status === "DRAFT");

  let collectedThisMonth = 0;
  for (const inv of data.invoices) {
    for (const p of inv.payments ?? []) {
      if (isIso(p.receivedAt) && p.receivedAt.slice(0, 7) === month) collectedThisMonth += p.amountKES;
    }
  }

  const activeSubs = data.subscriptions.filter((s) => s.status === "ACTIVE");
  const trialSubs = data.subscriptions.filter((s) => s.status === "TRIAL");

  const openDeals = data.deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
  const byStage: Record<string, number> = {};
  for (const d of openDeals) byStage[d.stage] = (byStage[d.stage] ?? 0) + 1;

  const blockedProjects = data.projects.filter((p) => p.status !== "COMPLETED" && (p.hasBlocker || p.status === "BLOCKED"));
  const lateProjects = data.projects.filter(
    (p) => p.status !== "COMPLETED" && p.progressPct < 100 && isIso(p.targetGoLiveDate) && p.targetGoLiveDate < todayIso
  );

  const followUps: FollowUp[] = [];
  for (const inv of open) {
    const { stage, daysToDue } = collectionState(inv, todayIso);
    if (stage === "overdue" || stage === "due_today" || stage === "due_soon") {
      followUps.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        balanceKES: inv.balanceKES,
        stage,
        daysToDue,
      });
    }
  }
  followUps.sort((a, b) => a.daysToDue - b.daysToDue);

  return {
    todayIso,
    cashOnHandKES: data.accounts.filter((a) => a.status === "ACTIVE").reduce((s, a) => s + a.balanceKES, 0),
    receivables: {
      openKES: open.reduce((s, i) => s + i.balanceKES, 0),
      openCount: open.length,
      overdueKES: overdue.reduce((s, i) => s + i.balanceKES, 0),
      overdueCount: overdue.length,
    },
    unsentDrafts: { count: drafts.length, totalKES: drafts.reduce((s, i) => s + i.totalKES, 0) },
    collectedThisMonthKES: collectedThisMonth,
    mrrKES: activeSubs.reduce((s, x) => s + x.monthlyFeeKES, 0),
    trialMrrKES: trialSubs.reduce((s, x) => s + x.monthlyFeeKES, 0),
    pipeline: {
      openDeals: openDeals.length,
      setupKES: openDeals.reduce((s, d) => s + d.setupFeeKES, 0),
      weightedSetupKES: Math.round(openDeals.reduce((s, d) => s + (d.setupFeeKES * d.winProbability) / 100, 0)),
      potentialMrrKES: openDeals.reduce((s, d) => s + d.monthlyFeeKES, 0),
      byStage,
    },
    projects: {
      active: data.projects.filter((p) => p.status === "ACTIVE").length,
      blocked: blockedProjects.length,
      late: lateProjects.length,
      blockers: blockedProjects.map((p) => ({
        client: p.clientName,
        text: p.blockerDescription || "Marked as blocked",
        days: p.blockerDays ?? 0,
      })),
    },
    clients: {
      total: data.clients.length,
      active: data.clients.filter((c) => c.status === "ACTIVE").length,
      onboarding: data.clients.filter((c) => c.status === "ONBOARDING").length,
      pastDue: data.clients.filter((c) => c.status === "PAST_DUE").length,
    },
    followUps,
  };
}

// ---------------------------------------------------------------------------
// Cash forecast
// ---------------------------------------------------------------------------

export type FlowKind = "invoice" | "subscription" | "pipeline" | "vendor" | "expense";

export interface FlowItem {
  kind: FlowKind;
  label: string;
  /** Amount counted in the forecast (probability-weighted for inflows). */
  amountKES: number;
  /** The full amount before weighting. */
  fullKES: number;
  date: string;
  note?: string;
}

export interface ForecastWeek {
  index: number;
  start: string;
  end: string;
  inflowConfirmedKES: number;
  inflowPipelineKES: number;
  outflowKES: number;
  /** Cash at the end of the week, counting confirmed inflows and outflows only. */
  cashKES: number;
  /** Cash at the end of the week, also counting weighted pipeline. */
  cashWithPipelineKES: number;
  items: FlowItem[];
}

export interface Forecast {
  startCashKES: number;
  weeks: ForecastWeek[];
  totals: { inflowConfirmedKES: number; inflowPipelineKES: number; outflowKES: number };
  lowest: { weekIndex: number; cashKES: number };
  /** True if projected cash (without pipeline) drops below zero in the window. */
  goesNegative: boolean;
}

export const PAYMENT_TERMS_DAYS = 7;

/** How likely an invoice is to be paid on time, by how late it already is. */
export function paymentLikelihood(daysToDue: number): number {
  if (daysToDue >= 0) return 0.9;
  if (daysToDue >= -14) return 0.6;
  return 0.35;
}

const DRAFT_LIKELIHOOD = 0.7;
const PIPELINE_TERMS_DAYS = 14;

export function buildForecast(data: WorkspaceData, todayIso: string, weeks = 8): Forecast {
  const horizonEnd = addDaysIso(todayIso, weeks * 7 - 1);
  const items: FlowItem[] = [];
  const inWindow = (d: string) => d >= todayIso && d <= horizonEnd;
  const clampToToday = (d: string) => (d < todayIso ? todayIso : d);

  // 1. Invoices already sent and unpaid
  for (const inv of data.invoices) {
    if (inv.balanceKES <= 0 || inv.status === "PAID" || inv.status === "VOID") continue;
    const daysToDue = daysBetween(todayIso, inv.dueDate);
    const isDraft = inv.status === "DRAFT";
    const likelihood = isDraft ? DRAFT_LIKELIHOOD : paymentLikelihood(daysToDue);
    const date = clampToToday(inv.dueDate);
    if (!inWindow(date)) continue;
    items.push({
      kind: "invoice",
      label: `${inv.invoiceNumber} · ${inv.clientName}`,
      amountKES: Math.round(inv.balanceKES * likelihood),
      fullKES: inv.balanceKES,
      date,
      note: isDraft ? "Not sent yet" : daysToDue < 0 ? `${-daysToDue} days overdue` : undefined,
    });
  }

  // 2. Subscriptions that will be invoiced inside the window
  for (const sub of data.subscriptions) {
    if (sub.status !== "ACTIVE" || !isIso(sub.nextBillingDate)) continue;
    const months = cycleMonths(sub.billingCycle);
    let billing = sub.nextBillingDate;
    let guard = 0;
    while (guard++ < 24) {
      const due = addDaysIso(billing, PAYMENT_TERMS_DAYS);
      if (due > horizonEnd) break;
      // A billing date that has already passed is covered by the invoice itself (if it was generated)
      if (billing >= todayIso) {
        const full = sub.monthlyFeeKES * months;
        items.push({
          kind: "subscription",
          label: `${sub.clientName} · ${sub.productName} subscription`,
          amountKES: Math.round(full * 0.9),
          fullKES: full,
          date: due,
        });
      }
      billing = addMonthsIso(billing, months);
    }
  }

  // 3. Weighted pipeline setup fees
  for (const deal of data.deals) {
    if (deal.stage === "WON" || deal.stage === "LOST" || deal.setupFeeKES <= 0) continue;
    const close = isIso(deal.targetCloseDate) ? clampToToday(deal.targetCloseDate) : addDaysIso(todayIso, 14);
    const date = addDaysIso(close, PIPELINE_TERMS_DAYS);
    if (!inWindow(date)) continue;
    items.push({
      kind: "pipeline",
      label: `${deal.businessName} · ${deal.productName} setup (${deal.winProbability}% likely)`,
      amountKES: Math.round((deal.setupFeeKES * deal.winProbability) / 100),
      fullKES: deal.setupFeeKES,
      date,
    });
  }

  // 4. Known outflows: vendor subscriptions and scheduled expenses
  for (const v of data.vendorSubscriptions) {
    if (v.status === "CANCELLED" || !isIso(v.renewalDate)) continue;
    const months = cycleMonths(v.billingCycle);
    let renewal = v.renewalDate;
    let guard = 0;
    while (renewal < todayIso && guard++ < 60) renewal = addMonthsIso(renewal, months);
    while (renewal <= horizonEnd && guard++ < 120) {
      items.push({
        kind: "vendor",
        label: `${v.provider} · ${v.serviceName}`,
        amountKES: v.costKES,
        fullKES: v.costKES,
        date: renewal,
      });
      renewal = addMonthsIso(renewal, months);
    }
  }
  for (const e of data.expenses) {
    if (e.status !== "SCHEDULED" || !isIso(e.expenseDate)) continue;
    const date = clampToToday(e.expenseDate);
    if (!inWindow(date)) continue;
    items.push({ kind: "expense", label: `${e.vendor} · ${e.description}`, amountKES: e.amountKES, fullKES: e.amountKES, date });
  }

  // Bucket into weeks and run the cash balance forward
  const startCash = data.accounts.filter((a) => a.status === "ACTIVE").reduce((s, a) => s + a.balanceKES, 0);
  const out: ForecastWeek[] = [];
  let cash = startCash;
  let cashWith = startCash;

  for (let w = 0; w < weeks; w++) {
    const start = addDaysIso(todayIso, w * 7);
    const end = addDaysIso(start, 6);
    const inWeek = items.filter((i) => i.date >= start && i.date <= end).sort((a, b) => a.date.localeCompare(b.date));
    const confirmed = inWeek.filter((i) => i.kind === "invoice" || i.kind === "subscription").reduce((s, i) => s + i.amountKES, 0);
    const pipeline = inWeek.filter((i) => i.kind === "pipeline").reduce((s, i) => s + i.amountKES, 0);
    const outflow = inWeek.filter((i) => i.kind === "vendor" || i.kind === "expense").reduce((s, i) => s + i.amountKES, 0);
    cash += confirmed - outflow;
    cashWith += confirmed + pipeline - outflow;
    out.push({
      index: w,
      start,
      end,
      inflowConfirmedKES: confirmed,
      inflowPipelineKES: pipeline,
      outflowKES: outflow,
      cashKES: cash,
      cashWithPipelineKES: cashWith,
      items: inWeek,
    });
  }

  const lowestWeek = out.reduce((low, w) => (w.cashKES < low.cashKES ? w : low), out[0]);
  return {
    startCashKES: startCash,
    weeks: out,
    totals: {
      inflowConfirmedKES: out.reduce((s, w) => s + w.inflowConfirmedKES, 0),
      inflowPipelineKES: out.reduce((s, w) => s + w.inflowPipelineKES, 0),
      outflowKES: out.reduce((s, w) => s + w.outflowKES, 0),
    },
    lowest: { weekIndex: lowestWeek.index, cashKES: lowestWeek.cashKES },
    goesNegative: out.some((w) => w.cashKES < 0),
  };
}

// ---------------------------------------------------------------------------
// Sales pipeline and funnel (the dashboard's numbers, from your real deals)
// ---------------------------------------------------------------------------

export type OpenStage = "CONTACTED" | "DEMO_BOOKED" | "PROPOSAL_SENT" | "NEGOTIATION";
export const OPEN_STAGES: OpenStage[] = ["CONTACTED", "DEMO_BOOKED", "PROPOSAL_SENT", "NEGOTIATION"];

export interface StageSummary {
  stage: OpenStage;
  count: number;
  /** Average win probability of the deals in this stage (0 if none). */
  probabilityPct: number;
  nominalValueKES: number;
  weightedValueKES: number;
}

export interface PipelineMetrics {
  openDealCount: number;
  /** What the open deals would bring in: setup fee plus the first month. */
  totalPipelineValueKES: number;
  weightedPipelineValueKES: number;
  wonCount: number;
  wonValueKES: number;
  /** Deals won this month, counted only where the win date was recorded. */
  wonThisMonthCount: number;
  wonThisMonthValueKES: number;
  /** Average days from creation to win, or null when no won deal has both dates. */
  averageDaysToClose: number | null;
  lostCount: number;
  /** Won as a share of closed deals (won + lost). */
  winRatePct: number;
  averageDealSizeKES: number;
  dealsByStage: StageSummary[];
}

const dealValue = (d: InsightDeal) => (d.setupFeeKES || 0) + (d.monthlyFeeKES || 0);

export function computePipelineMetrics(deals: InsightDeal[], todayIso: string = nairobiDay()): PipelineMetrics {
  const open = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
  const won = deals.filter((d) => d.stage === "WON");
  const lost = deals.filter((d) => d.stage === "LOST");
  const closed = won.length + lost.length;
  const month = todayIso.slice(0, 7);
  const wonThisMonth = won.filter((d) => isIso(d.wonAt) && d.wonAt.slice(0, 7) === month);
  const timed = won.filter((d) => isIso(d.createdAt) && isIso(d.wonAt));

  const dealsByStage = OPEN_STAGES.map((stage) => {
    const inStage = open.filter((d) => d.stage === stage);
    return {
      stage,
      count: inStage.length,
      probabilityPct: inStage.length ? Math.round(inStage.reduce((s, d) => s + (d.winProbability || 0), 0) / inStage.length) : 0,
      nominalValueKES: inStage.reduce((s, d) => s + dealValue(d), 0),
      weightedValueKES: Math.round(inStage.reduce((s, d) => s + (dealValue(d) * (d.winProbability || 0)) / 100, 0)),
    };
  });

  return {
    openDealCount: open.length,
    totalPipelineValueKES: open.reduce((s, d) => s + dealValue(d), 0),
    weightedPipelineValueKES: dealsByStage.reduce((s, x) => s + x.weightedValueKES, 0),
    wonCount: won.length,
    wonValueKES: won.reduce((s, d) => s + dealValue(d), 0),
    wonThisMonthCount: wonThisMonth.length,
    wonThisMonthValueKES: wonThisMonth.reduce((s, d) => s + dealValue(d), 0),
    averageDaysToClose: timed.length
      ? Math.round(timed.reduce((sum, d) => sum + Math.max(0, daysBetween(String(d.createdAt).slice(0, 10), String(d.wonAt).slice(0, 10))), 0) / timed.length)
      : null,
    lostCount: lost.length,
    winRatePct: closed ? Math.round((won.length / closed) * 100) : 0,
    averageDealSizeKES: deals.length ? Math.round(deals.reduce((s, d) => s + dealValue(d), 0) / deals.length) : 0,
    dealsByStage,
  };
}

export interface FunnelCounts {
  uncontactedPool: number;
  /** Everything that has become a deal. */
  leadsContacted: number;
  /** Deals that reached a demo or went further. */
  demosBooked: number;
  /** Deals that reached a proposal or went further. */
  proposalsSent: number;
  /** A demo counts as done once the deal has moved on to a proposal or beyond. */
  demosCompleted: number;
  /** Demos done as a share of demos booked. */
  demoCompletionRatePct: number;
  dealsWon: number;
  dealsLost: number;
  /** Won deals as a share of deals created. */
  contactedToWonConversionPct: number;
}

export function computeFunnel(leads: { status?: string }[], deals: InsightDeal[]): FunnelCounts {
  const reached = (...stages: InsightDeal["stage"][]) => deals.filter((d) => stages.includes(d.stage)).length;
  const won = reached("WON");
  const booked = reached("DEMO_BOOKED", "PROPOSAL_SENT", "NEGOTIATION", "WON");
  const proposals = reached("PROPOSAL_SENT", "NEGOTIATION", "WON");
  return {
    uncontactedPool: leads.filter((l) => l.status === "UNCONTACTED").length,
    leadsContacted: deals.length,
    demosBooked: booked,
    proposalsSent: proposals,
    demosCompleted: proposals,
    demoCompletionRatePct: booked ? Math.round((proposals / booked) * 100) : 0,
    dealsWon: won,
    dealsLost: reached("LOST"),
    contactedToWonConversionPct: deals.length ? Math.round((won / deals.length) * 100) : 0,
  };
}
