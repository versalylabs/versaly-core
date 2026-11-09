/**
 * Turns the workspace into the text the AI assistant reads. Pure functions (no
 * database, no network) so the rules about WHAT it may see are easy to test.
 *
 * Two safeguards live here:
 *  1. Role filtering: an area the person's role can't read is left out entirely
 *     and named in the "withheld" list, so the assistant says "I can't see that
 *     for your role" instead of wrongly reporting zero.
 *  2. Data minimisation: contact phone numbers, emails and tax PINs are never
 *     included, and free text is cleaned and shortened.
 */

import type { UserRole } from "@prisma/client";
import { canReadKey } from "@/lib/access";
import { KEYS } from "@/lib/storage-keys";
import { buildForecast, computeSnapshot, type WorkspaceData } from "@/lib/insights";
import { daysBetween } from "@/lib/money";
import { formatKES } from "@/lib/invoice-messages";

export type AssistantArea = "finance" | "pipeline" | "projects";

export const AREA_LABEL: Record<AssistantArea, string> = {
  finance: "Finance (invoices, subscriptions, expenses, bank accounts, vendor bills, cash forecast)",
  pipeline: "Sales pipeline and clients",
  projects: "Client projects",
};

/** Which areas a role may read. */
export function visibleAreas(role: UserRole): Record<AssistantArea, boolean> {
  return {
    finance: canReadKey(role, KEYS.invoices),
    pipeline: canReadKey(role, KEYS.deals) && canReadKey(role, KEYS.clients),
    projects: canReadKey(role, KEYS.projects),
  };
}

/** Free text in the workspace is typed by people (and sometimes copied from clients): strip anything that could pose as structure, and cap the length. */
export function clean(text: unknown, max = 140): string {
  const s = String(text ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export interface AssistantContext {
  /** The workspace as plain text, ready to put in the prompt. */
  text: string;
  /** Areas that were included. */
  included: AssistantArea[];
  /** Areas left out because of the person's role. */
  withheld: AssistantArea[];
}

const MAX_ROWS = 50;

const rows = <T>(title: string, all: T[], line: (item: T) => string, empty = "None."): string => {
  if (!all.length) return `${title}\n${empty}`;
  const shown = all.slice(0, MAX_ROWS);
  const more = all.length > shown.length ? `\n(showing ${shown.length} of ${all.length})` : "";
  return `${title} (${all.length})\n${shown.map(line).join("\n")}${more}`;
};

const when = (todayIso: string, dateIso: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateIso || "")) return "no date";
  const d = daysBetween(todayIso, dateIso.slice(0, 10));
  if (d === 0) return "due today";
  return d > 0 ? `due in ${d} day${d === 1 ? "" : "s"}` : `${-d} day${d === -1 ? "" : "s"} overdue`;
};

const sortedBy = <T>(list: T[], key: keyof T): T[] => [...list].sort((a, b) => String(a[key] ?? "").localeCompare(String(b[key] ?? "")));

function financeSection(data: WorkspaceData, todayIso: string): string {
  const snap = computeSnapshot(data, todayIso);
  const forecast = buildForecast(data, todayIso, 8);

  const figures = [
    "## Finance: headline figures (exact, already calculated)",
    `Cash on hand (active accounts): ${formatKES(snap.cashOnHandKES)}`,
    `Open receivables: ${formatKES(snap.receivables.openKES)} across ${snap.receivables.openCount} sent invoice(s); overdue: ${formatKES(snap.receivables.overdueKES)} across ${snap.receivables.overdueCount}`,
    `Draft invoices not yet sent: ${snap.unsentDrafts.count} worth ${formatKES(snap.unsentDrafts.totalKES)}`,
    `Collected this month: ${formatKES(snap.collectedThisMonthKES)}`,
    `Live monthly recurring revenue (MRR): ${formatKES(snap.mrrKES)}; trial MRR waiting on go-live: ${formatKES(snap.trialMrrKES)}`,
  ].join("\n");

  const weeks = forecast.weeks
    .map(
      (w) =>
        `Week ${w.index + 1} (${w.start} to ${w.end}): confirmed in ${formatKES(w.inflowConfirmedKES)}, pipeline ${formatKES(w.inflowPipelineKES)}, out ${formatKES(w.outflowKES)}, cash at end ${formatKES(w.cashKES)} (${formatKES(w.cashWithPipelineKES)} with pipeline)`
    )
    .join("\n");
  const forecastText = [
    "## Finance: 8-week cash forecast (calculated by the app)",
    "Confirmed in = open invoices and subscriptions weighted by how likely they are to be paid on time. Out = vendor subscriptions and scheduled expenses only. Salaries and tax are NOT included unless entered as scheduled expenses.",
    `Starting cash: ${formatKES(forecast.startCashKES)}`,
    weeks,
    `Lowest projected cash (without pipeline): ${formatKES(forecast.lowest.cashKES)} in week ${forecast.lowest.weekIndex + 1}. ${forecast.goesNegative ? "Cash goes NEGATIVE in this window." : "Cash stays positive."}`,
  ].join("\n");

  const open = sortedBy(
    data.invoices.filter((i) => i.status !== "PAID" && i.status !== "VOID"),
    "dueDate"
  );
  const paid = data.invoices
    .filter((i) => i.status === "PAID")
    .sort((a, b) => String(b.dueDate).localeCompare(String(a.dueDate)))
    .slice(0, 10);

  const invoices = rows(
    "## Finance: unpaid invoices",
    open,
    (i) =>
      `${clean(i.invoiceNumber, 30)} | ${clean(i.clientName, 60)} | ${i.status} | total ${formatKES(i.totalKES)} | paid ${formatKES(i.amountPaidKES)} | balance ${formatKES(i.balanceKES)} | due ${clean(i.dueDate, 10)} (${i.status === "DRAFT" ? "draft, not sent" : when(todayIso, i.dueDate)})`
  );
  const paidInvoices = rows(
    "## Finance: recently paid invoices",
    paid,
    (i) => `${clean(i.invoiceNumber, 30)} | ${clean(i.clientName, 60)} | total ${formatKES(i.totalKES)} | due ${clean(i.dueDate, 10)}`
  );

  const subs = rows(
    "## Finance: client subscriptions",
    sortedBy(data.subscriptions.filter((s) => s.status !== "CANCELLED"), "nextBillingDate"),
    (s) => `${clean(s.clientName, 60)} | ${clean(s.productName, 40)} | ${s.status} | ${formatKES(s.monthlyFeeKES)}/month, billed ${String(s.billingCycle).toLowerCase()} | next billing ${clean(s.nextBillingDate, 10)}`
  );

  const vendors = rows(
    "## Finance: vendor subscriptions (money going out)",
    sortedBy(data.vendorSubscriptions.filter((v) => v.status !== "CANCELLED"), "renewalDate"),
    (v) => `${clean(v.provider, 40)} | ${clean(v.serviceName, 60)} | ${formatKES(v.costKES)} ${String(v.billingCycle).toLowerCase()} | renews ${clean(v.renewalDate, 10)}${v.status === "REVIEW_FOR_CANCEL" ? " | flagged: review for cancellation" : ""}`
  );

  const upcoming = sortedBy(data.expenses.filter((e) => e.status === "PENDING_APPROVAL" || e.status === "SCHEDULED"), "expenseDate");
  const expenses = rows(
    "## Finance: expenses waiting or scheduled",
    upcoming,
    (e) => `${clean(e.vendor, 40)} | ${clean(e.description, 80)} | ${formatKES(e.amountKES)} | ${e.status} | ${clean(e.expenseDate, 10)}`
  );

  const accounts = rows(
    "## Finance: accounts",
    data.accounts.filter((a) => a.status === "ACTIVE"),
    (a) => `${clean(a.name, 40)} (${clean(a.accountType, 20)}) | ${formatKES(a.balanceKES)}`
  );

  return [figures, forecastText, invoices, paidInvoices, subs, vendors, expenses, accounts].join("\n\n");
}

function pipelineSection(data: WorkspaceData, todayIso: string): string {
  const snap = computeSnapshot(data, todayIso);
  const figures = [
    "## Sales: headline figures (exact, already calculated)",
    `Open deals: ${snap.pipeline.openDeals} (${Object.entries(snap.pipeline.byStage).map(([s, n]) => `${s.toLowerCase().replace(/_/g, " ")}: ${n}`).join(", ") || "none"})`,
    `Setup fees in play: ${formatKES(snap.pipeline.setupKES)}; probability-weighted: ${formatKES(snap.pipeline.weightedSetupKES)}; potential new MRR: ${formatKES(snap.pipeline.potentialMrrKES)}`,
    `Clients: ${snap.clients.total} (active ${snap.clients.active}, onboarding ${snap.clients.onboarding}, past due ${snap.clients.pastDue})`,
  ].join("\n");

  const deals = rows(
    "## Sales: open deals",
    sortedBy(data.deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST"), "targetCloseDate"),
    (d) =>
      `${clean(d.businessName, 60)} | ${clean(d.productName, 40)} | ${d.stage} | setup ${formatKES(d.setupFeeKES)} + ${formatKES(d.monthlyFeeKES)}/month | ${d.winProbability}% likely | target close ${clean(d.targetCloseDate, 10)}${d.nextAction ? ` | next: ${clean(d.nextAction, 100)}` : ""}`
  );

  const clients = rows(
    "## Clients",
    data.clients,
    (c) =>
      `${clean(c.businessName || c.id, 60)} | ${c.status}${c.productName ? ` | ${clean(c.productName, 40)}` : ""}${typeof c.monthlyMRR === "number" ? ` | ${formatKES(c.monthlyMRR)}/month` : ""}${c.renewalDate ? ` | renews ${clean(c.renewalDate, 10)}` : ""}${typeof c.onboardingProgressPct === "number" && c.status === "ONBOARDING" ? ` | onboarding ${Math.round(c.onboardingProgressPct)}%` : ""}${c.contactName ? ` | contact ${clean(c.contactName, 40)}` : ""}`
  );

  return [figures, deals, clients].join("\n\n");
}

function projectsSection(data: WorkspaceData, todayIso: string): string {
  const snap = computeSnapshot(data, todayIso);
  const figures = `## Projects: headline figures (exact, already calculated)\nActive: ${snap.projects.active}; with a blocker: ${snap.projects.blocked}; past their go-live date: ${snap.projects.late}`;
  const list = rows(
    "## Projects (not completed)",
    sortedBy(data.projects.filter((p) => p.status !== "COMPLETED"), "targetGoLiveDate"),
    (p) =>
      `${clean(p.name, 60)} | ${clean(p.clientName, 60)}${p.productName ? ` | ${clean(p.productName, 40)}` : ""} | ${p.status} | ${Math.round(p.progressPct)}% done | go-live ${clean(p.targetGoLiveDate, 10)}${p.leadArchitect ? ` | lead ${clean(p.leadArchitect, 40)}` : ""}${p.hasBlocker || p.status === "BLOCKED" ? ` | BLOCKER: ${clean(p.blockerDescription || "marked as blocked", 140)}${p.blockerDays ? ` (${p.blockerDays} days)` : ""}` : ""}`
  );
  return [figures, list].join("\n\n");
}

export function buildAssistantContext(data: WorkspaceData, role: UserRole, todayIso: string): AssistantContext {
  const areas = visibleAreas(role);
  const included: AssistantArea[] = [];
  const withheld: AssistantArea[] = [];
  const parts: string[] = [];

  (["finance", "pipeline", "projects"] as AssistantArea[]).forEach((area) => {
    if (!areas[area]) {
      withheld.push(area);
      return;
    }
    included.push(area);
    parts.push(area === "finance" ? financeSection(data, todayIso) : area === "pipeline" ? pipelineSection(data, todayIso) : projectsSection(data, todayIso));
  });

  const access = [
    "## Access for this person",
    included.length ? `You can see: ${included.map((a) => AREA_LABEL[a]).join("; ")}.` : "You can see none of the business data areas.",
    withheld.length
      ? `Withheld because of their role (do not guess at these, and do not treat them as empty): ${withheld.map((a) => AREA_LABEL[a]).join("; ")}.`
      : "Nothing is withheld.",
  ].join("\n");

  return { text: [access, ...parts].join("\n\n"), included, withheld };
}
