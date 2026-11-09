/**
 * The dashboard's operating numbers (outreach, follow-ups, delivery health,
 * product traction, cash alerts), worked out from your real records. Pure
 * functions with plain ISO dates, so they are testable and match the rest of
 * the app. Anything the app doesn't record is left out rather than invented.
 */

import { addDaysIso, collectionState, daysBetween } from "@/lib/money";
import { weekdayIndex } from "@/lib/calendar-grid";
import type { InsightClient, InsightDeal, InsightInvoice, InsightProject } from "@/lib/insights";

const isIso = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}/.test(s);

// ---------------------------------------------------------------------------
// Outreach (calls, visits and WhatsApps you log on the dashboard)
// ---------------------------------------------------------------------------

export const OUTREACH_LOG_KEY = "versaly_outreach_log_v1";

export interface OutreachEntry {
  id: string;
  /** The Nairobi day it was logged, "2026-11-09". */
  date: string;
  business: string;
  channel: string;
  outcome: string;
  optedOut?: boolean;
}

/** The Monday of the week containing `todayIso` (weeks run Monday to Sunday). */
export function weekStart(todayIso: string): string {
  const dow = weekdayIndex(todayIso);
  return addDaysIso(todayIso, dow === 0 ? -6 : 1 - dow);
}

export function countOutreach(log: OutreachEntry[], todayIso: string): { today: number; week: number } {
  const monday = weekStart(todayIso);
  let today = 0;
  let week = 0;
  for (const entry of log) {
    if (!isIso(entry.date)) continue;
    const day = entry.date.slice(0, 10);
    if (day === todayIso) today++;
    if (day >= monday && day <= todayIso) week++;
  }
  return { today, week };
}

/** Leads added since Monday. Leads saved before dates were recorded can't be counted. */
export function countNewLeadsThisWeek(leads: { createdAt?: string }[], todayIso: string): number {
  const monday = weekStart(todayIso);
  return leads.filter((l) => isIso(l.createdAt) && l.createdAt.slice(0, 10) >= monday && l.createdAt.slice(0, 10) <= todayIso).length;
}

// ---------------------------------------------------------------------------
// Follow-ups: deals that have gone quiet after a demo or proposal
// ---------------------------------------------------------------------------

export interface FollowUp {
  id: string;
  business: string;
  contact: string;
  phone: string;
  product: string;
  daysWaiting: number;
  context: string;
}

const QUIET_STAGES: InsightDeal["stage"][] = ["DEMO_BOOKED", "PROPOSAL_SENT", "NEGOTIATION"];

/** Open deals in demo, proposal or negotiation with no change for `minDays` or more. Deals without a recorded date can't be judged and are left out. */
export function computeFollowUps(deals: InsightDeal[], todayIso: string, minDays = 3): FollowUp[] {
  const out: FollowUp[] = [];
  for (const d of deals) {
    if (!QUIET_STAGES.includes(d.stage)) continue;
    const since = isIso(d.stageChangedAt) ? d.stageChangedAt : isIso(d.createdAt) ? d.createdAt : null;
    if (!since) continue;
    const daysWaiting = daysBetween(since.slice(0, 10), todayIso);
    if (daysWaiting < minDays) continue;
    out.push({
      id: d.id,
      business: d.businessName,
      contact: d.contactName || "",
      phone: d.contactPhone || "",
      product: d.productName,
      daysWaiting,
      context: d.nextAction || `${d.stage.toLowerCase().replace(/_/g, " ")}: no update recorded`,
    });
  }
  return out.sort((a, b) => b.daysWaiting - a.daysWaiting);
}

// ---------------------------------------------------------------------------
// Client delivery
// ---------------------------------------------------------------------------

export interface DeliveryBlocker {
  id: string;
  client: string;
  product: string;
  blocker: string;
  assignedTo: string;
  daysBlocked: number;
}

export interface DeliveryMetrics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientsInOnboarding: number;
  onboardingBlockersCount: number;
  goLivesCompleted: number;
  renewalsDue30Days: number;
  health: { healthy: number; needsAttention: number; atRisk: number; healthyPct: number; needsAttentionPct: number; atRiskPct: number };
  blockers: DeliveryBlocker[];
}

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

export function computeDelivery(clients: InsightClient[], projects: InsightProject[], todayIso: string): DeliveryMetrics {
  const month = todayIso.slice(0, 7);
  const blockedProjects = projects.filter((p) => p.status !== "COMPLETED" && (p.hasBlocker || p.status === "BLOCKED"));
  const blockedClients = new Set(blockedProjects.map((p) => norm(p.clientName)));
  const renewalEnd = addDaysIso(todayIso, 30);

  let healthy = 0;
  let needsAttention = 0;
  let atRisk = 0;
  for (const c of clients) {
    if (c.status === "PAST_DUE") atRisk++;
    else if (blockedClients.has(norm(c.businessName))) needsAttention++;
    else healthy++;
  }
  const total = clients.length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return {
    totalClients: total,
    activeClients: clients.filter((c) => c.status === "ACTIVE").length,
    newClientsThisMonth: clients.filter((c) => isIso(c.createdAt) && c.createdAt.slice(0, 7) === month).length,
    clientsInOnboarding: clients.filter((c) => c.status === "ONBOARDING").length,
    onboardingBlockersCount: blockedProjects.length,
    goLivesCompleted: projects.filter((p) => p.status === "COMPLETED").length,
    renewalsDue30Days: clients.filter((c) => isIso(c.renewalDate) && c.renewalDate.slice(0, 10) >= todayIso && c.renewalDate.slice(0, 10) <= renewalEnd).length,
    health: { healthy, needsAttention, atRisk, healthyPct: pct(healthy), needsAttentionPct: pct(needsAttention), atRiskPct: pct(atRisk) },
    blockers: blockedProjects
      .map((p) => ({
        id: p.id,
        client: p.clientName,
        product: p.productName || p.name,
        blocker: p.blockerDescription || "Marked as blocked",
        assignedTo: p.leadArchitect || "Unassigned",
        daysBlocked: p.blockerDays ?? 0,
      }))
      .sort((a, b) => b.daysBlocked - a.daysBlocked),
  };
}

export const openSupportTickets = (tickets: { status?: string }[]): number => tickets.filter((t) => t.status !== "RESOLVED").length;

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type Traction = "No activity yet" | "Building pipeline" | "Winning";

export interface ProductActivity {
  leadsContacted: number;
  demosBooked: number;
  dealsWon: number;
  conversionRatePct: number;
  clients: number;
  averageDealSize: number;
  traction: Traction;
}

export function computeProductActivity(product: { slug: string; name: string }, deals: InsightDeal[], clients: InsightClient[]): ProductActivity {
  const mine = deals.filter((d) => (d.productSlug && d.productSlug === product.slug) || norm(d.productName) === norm(product.name));
  const myClients = clients.filter((c) => (c.productSlug && c.productSlug === product.slug) || norm(c.productName) === norm(product.name));
  const won = mine.filter((d) => d.stage === "WON").length;
  const value = (d: InsightDeal) => (d.setupFeeKES || 0) + (d.monthlyFeeKES || 0);
  return {
    leadsContacted: mine.length,
    demosBooked: mine.filter((d) => d.stage !== "CONTACTED" && d.stage !== "LOST").length,
    dealsWon: won,
    conversionRatePct: mine.length ? Math.round((won / mine.length) * 100) : 0,
    clients: myClients.length,
    averageDealSize: mine.length ? Math.round(mine.reduce((s, d) => s + value(d), 0) / mine.length) : 0,
    traction: won > 0 || myClients.length > 0 ? "Winning" : mine.length > 0 ? "Building pipeline" : "No activity yet",
  };
}

// ---------------------------------------------------------------------------
// Cash alerts
// ---------------------------------------------------------------------------

export interface CashAlert {
  id: string;
  client: string;
  amountKES: number;
  type: string;
  status: string;
  urgency: "high" | "medium";
}

/** Sent invoices that are overdue or due today, oldest first. */
export function computeCashAlerts(invoices: InsightInvoice[], todayIso: string): CashAlert[] {
  const out: CashAlert[] = [];
  for (const inv of invoices) {
    if ((inv.status !== "SENT" && inv.status !== "OVERDUE") || !(inv.balanceKES > 0)) continue;
    const { stage, daysToDue } = collectionState(inv, todayIso);
    if (stage !== "overdue" && stage !== "due_today") continue;
    out.push({
      id: inv.id,
      client: inv.clientName,
      amountKES: inv.balanceKES,
      type: `Invoice ${inv.invoiceNumber}`,
      status: stage === "due_today" ? "Due today" : `${-daysToDue} day${daysToDue === -1 ? "" : "s"} overdue`,
      urgency: stage === "overdue" && daysToDue <= -7 ? "high" : "medium",
    });
  }
  return out.sort((a, b) => b.amountKES - a.amountKES);
}
