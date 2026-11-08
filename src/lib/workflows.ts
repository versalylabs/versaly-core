"use client";

/**
 * Business workflows that connect the modules:
 *
 *   Lead won ──► client + onboarding project + setup invoice + subscription
 *   Subscription due ──► draft invoice for the billing period
 *   Invoice sent and past due ──► marked overdue
 *   Project completed ──► subscription goes live (trial → active), client active
 *
 * All records are created with deterministic ids, so running a workflow twice
 * (or on two devices) never creates duplicates.
 */

import { appStorage } from "@/lib/app-storage";
import type { ActiveDealItem } from "@/data/leads-seed";
import type {
  ClientItem,
  ImplementationProjectItem,
  ProjectTaskItem,
} from "@/data/clients-projects-seed";
import {
  loadInvoicesFromStorage,
  saveInvoicesToStorage,
  loadSubscriptionsFromStorage,
  saveSubscriptionsToStorage,
  type ClientSubscription,
  type FinanceInvoice,
} from "@/lib/finance-store";

export const CLIENTS_STORAGE_KEY = "versaly_clients_list_v2";
export const PROJECTS_STORAGE_KEY = "versaly_projects_list_v2";

const VAT_RATE = 0.16;
const DEFAULT_LEAD_ARCHITECT = "Ted";
const GO_LIVE_TARGET_DAYS = 21;
const PAYMENT_TERMS_DAYS = 7;

/** The standard 8-step onboarding every new client goes through. */
export const ONBOARDING_STEPS = [
  { stepNumber: 1, title: "Agreement & Payment Instructions", description: "Send MSA contract and setup fee Paybill invoice", assignedTo: "Ted" },
  { stepNumber: 2, title: "Payment Confirmation", description: "Confirm setup fee receipt via M-Pesa or bank", assignedTo: "Finance" },
  { stepNumber: 3, title: "Data Collection & Layout", description: "Collect operational catalogs, floor/bay layout, and contacts", assignedTo: "David" },
  { stepNumber: 4, title: "Product Configuration & Setup", description: "Upload initial database catalogs and configure rates", assignedTo: "Ted" },
  { stepNumber: 5, title: "Team & Staff Training", description: "Conduct training with frontline operational team", assignedTo: "David" },
  { stepNumber: 6, title: "First Live Intake Transaction", description: "Shadow live transaction intake on premise", assignedTo: "David" },
  { stepNumber: 7, title: "First Measurable Win Confirmation", description: "Confirm 100% digital tracking across 3 consecutive days", assignedTo: "Ted" },
  { stepNumber: 8, title: "30-Day Executive Review & Referral", description: "Review metrics and request client referral", assignedTo: "Mercy" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isoDay = (d: Date) => d.toISOString().split("T")[0];

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function addMonths(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return isoDay(d);
}

function cycleMonths(cycle: ClientSubscription["billingCycle"]): number {
  return cycle === "ANNUAL" ? 12 : cycle === "QUARTERLY" ? 3 : 1;
}

function readList<T>(key: string): T[] {
  try {
    const raw = appStorage.getItem(key);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  appStorage.setItem(key, JSON.stringify(list));
}

/** Next invoice number for the year, continuing after the highest used so far. */
function nextInvoiceNumber(existing: FinanceInvoice[], year: number): string {
  let max = 1000;
  for (const inv of existing) {
    const m = /^INV-(\d{4})-(\d+)$/.exec(inv.invoiceNumber);
    if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
  }
  return `INV-${year}-${max + 1}`;
}

function buildInvoice(args: {
  id: string;
  number: string;
  clientName: string;
  clientId?: string;
  clientEmail?: string;
  clientPhone?: string;
  productSlug: string;
  productName: string;
  description: string;
  amountKES: number;
  issueDate: string;
  dueDate: string;
  notes: string;
  incomeType: NonNullable<FinanceInvoice["incomeType"]>;
  dealId?: string;
}): FinanceInvoice {
  const subtotalKES = Math.round(args.amountKES);
  const taxKES = Math.round(subtotalKES * VAT_RATE);
  const totalKES = subtotalKES + taxKES;
  return {
    id: args.id,
    invoiceNumber: args.number,
    clientName: args.clientName,
    clientId: args.clientId,
    dealId: args.dealId,
    clientEmail: args.clientEmail || undefined,
    clientPhone: args.clientPhone || undefined,
    productSlug: args.productSlug,
    productName: args.productName,
    status: "DRAFT",
    subtotalKES,
    taxKES,
    totalKES,
    amountPaidKES: 0,
    balanceKES: totalKES,
    issueDate: args.issueDate,
    dueDate: args.dueDate,
    notes: args.notes,
    incomeType: args.incomeType,
    lineItems: [
      { description: args.description, quantity: 1, unitPrice: subtotalKES, amountKES: subtotalKES },
    ],
    payments: [],
  };
}

// ---------------------------------------------------------------------------
// 1. Lead won → client, project, setup invoice, subscription
// ---------------------------------------------------------------------------

export interface DealConversionResult {
  clientId: string;
  projectId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  subscriptionId?: string;
  /** What was newly created (false = it already existed and was left untouched). */
  created: { client: boolean; project: boolean; invoice: boolean; subscription: boolean };
}

export function convertWonDeal(deal: ActiveDealItem, today = new Date()): DealConversionResult {
  const todayIso = isoDay(today);
  const clientId = `cli-${deal.id}`;
  const projectId = `proj-${deal.id}`;
  const invoiceId = `inv-setup-${deal.id}`;
  const subscriptionId = `sub-${deal.id}`;
  const created = { client: false, project: false, invoice: false, subscription: false };

  // Client
  const clients = readList<ClientItem>(CLIENTS_STORAGE_KEY);
  if (!clients.some((c) => c.id === clientId)) {
    const client: ClientItem = {
      id: clientId,
      organizationId: `org-${deal.id}`,
      businessName: deal.businessName,
      contactName: deal.contactName,
      contactPhone: deal.contactPhone,
      contactWhatsApp: deal.contactWhatsApp,
      contactEmail: deal.contactEmail,
      productSlug: deal.productSlug,
      productName: deal.productName,
      monthlyMRR: deal.monthlyFeeKES,
      status: "ONBOARDING",
      renewalDate: addMonths(todayIso, 1),
      currentOnboardingStep: 1,
      onboardingProgressPct: 0,
      signedContractDoc: "Pending",
      paymentMethod: "M-Pesa Paybill",
    };
    writeList(CLIENTS_STORAGE_KEY, [client, ...clients]);
    created.client = true;
  }

  // Onboarding project
  const projects = readList<ImplementationProjectItem>(PROJECTS_STORAGE_KEY);
  if (!projects.some((p) => p.id === projectId)) {
    const tasks: ProjectTaskItem[] = ONBOARDING_STEPS.map((s) => ({
      id: `tsk-${projectId}-${s.stepNumber}`,
      stepNumber: s.stepNumber,
      title: s.title,
      description: s.description,
      completed: false,
      assignedTo: s.assignedTo,
    }));
    const project: ImplementationProjectItem = {
      id: projectId,
      clientId,
      clientName: deal.businessName,
      name: `${deal.productName} Implementation`,
      productSlug: deal.productSlug,
      productName: deal.productName,
      status: "ACTIVE",
      leadArchitect: DEFAULT_LEAD_ARCHITECT,
      targetGoLiveDate: isoDay(addDays(today, GO_LIVE_TARGET_DAYS)),
      progressPct: 0,
      hasBlocker: false,
      tasks,
    };
    writeList(PROJECTS_STORAGE_KEY, [project, ...projects]);
    created.project = true;
  }

  // Setup-fee invoice (draft, for you to review and send)
  let invoiceNumber: string | undefined;
  let hasInvoice = false;
  if (deal.setupFeeKES > 0) {
    const invoices = loadInvoicesFromStorage();
    const existing = invoices.find((i) => i.id === invoiceId);
    if (existing) {
      invoiceNumber = existing.invoiceNumber;
      hasInvoice = true;
    } else {
      invoiceNumber = nextInvoiceNumber(invoices, today.getUTCFullYear());
      const invoice = buildInvoice({
        id: invoiceId,
        number: invoiceNumber,
        clientName: deal.businessName,
        clientId,
        dealId: deal.id,
        clientEmail: deal.contactEmail,
        clientPhone: deal.contactPhone,
        productSlug: deal.productSlug,
        productName: deal.productName,
        description: `${deal.productName} — one-time setup & implementation`,
        amountKES: deal.setupFeeKES,
        issueDate: todayIso,
        dueDate: isoDay(addDays(today, PAYMENT_TERMS_DAYS)),
        notes: "Auto-created when the deal was won. Review, then send to the client.",
        incomeType: "SETUP_IMPLEMENTATION",
      });
      saveInvoicesToStorage([invoice, ...invoices]);
      created.invoice = true;
      hasInvoice = true;
    }
  }

  // Subscription (trial until the onboarding project is completed)
  let hasSubscription = false;
  if (deal.monthlyFeeKES > 0) {
    const subs = loadSubscriptionsFromStorage();
    if (!subs.some((s) => s.id === subscriptionId)) {
      const sub: ClientSubscription = {
        id: subscriptionId,
        clientId,
        clientName: deal.businessName,
        productSlug: deal.productSlug,
        productName: deal.productName,
        planTier: "Standard",
        monthlyFeeKES: deal.monthlyFeeKES,
        billingCycle: "MONTHLY",
        status: "TRIAL",
        startDate: todayIso,
        nextBillingDate: addMonths(todayIso, 1),
        contactPerson: deal.contactName,
        phone: deal.contactPhone,
        notes: "Auto-created when the deal was won. Becomes active when onboarding is completed.",
      };
      saveSubscriptionsToStorage([sub, ...subs]);
      created.subscription = true;
    }
    hasSubscription = true;
  }

  return {
    clientId,
    projectId,
    invoiceId: hasInvoice ? invoiceId : undefined,
    invoiceNumber,
    subscriptionId: hasSubscription ? subscriptionId : undefined,
    created,
  };
}

// ---------------------------------------------------------------------------
// 2. Housekeeping workflows (run when the app loads and when you return to it)
// ---------------------------------------------------------------------------

export interface WorkflowRunResult {
  changed: boolean;
  invoicesGenerated: number;
  invoicesMarkedOverdue: number;
  subscriptionsActivated: number;
}

/** Draft an invoice for every subscription that has come due. */
function generateRecurringInvoices(todayIso: string): number {
  const subs = loadSubscriptionsFromStorage();
  const due = subs.filter((s) => s.status === "ACTIVE" && s.nextBillingDate && s.nextBillingDate <= todayIso);
  if (!due.length) return 0;

  const invoices = loadInvoicesFromStorage();
  const known = new Set(invoices.map((i) => i.id));
  const fresh: FinanceInvoice[] = [];

  const updatedSubs = subs.map((sub) => {
    if (sub.status !== "ACTIVE" || !sub.nextBillingDate || sub.nextBillingDate > todayIso) return sub;

    let next = sub.nextBillingDate;
    let guard = 0;
    while (next <= todayIso && guard < 12) {
      const id = `inv-sub-${sub.id}-${next}`;
      if (!known.has(id)) {
        const number = nextInvoiceNumber([...invoices, ...fresh], Number(next.slice(0, 4)));
        const months = cycleMonths(sub.billingCycle);
        const label = months === 1 ? "monthly" : months === 3 ? "quarterly" : "annual";
        fresh.push(
          buildInvoice({
            id,
            number,
            clientName: sub.clientName,
            clientId: sub.clientId,
            clientPhone: sub.phone,
            productSlug: sub.productSlug,
            productName: sub.productName,
            description: `${sub.productName} ${sub.planTier} — ${label} subscription (from ${next})`,
            amountKES: sub.monthlyFeeKES * months,
            issueDate: next,
            dueDate: isoDay(addDays(new Date(`${next}T00:00:00Z`), PAYMENT_TERMS_DAYS)),
            notes: "Auto-generated for the billing period. Review, then send to the client.",
            incomeType: "SAAS_SUBSCRIPTION",
          })
        );
        known.add(id);
      }
      next = addMonths(next, cycleMonths(sub.billingCycle));
      guard++;
    }
    return { ...sub, nextBillingDate: next };
  });

  if (fresh.length) saveInvoicesToStorage([...fresh, ...invoices]);
  saveSubscriptionsToStorage(updatedSubs);
  return fresh.length;
}

/** Sent invoices that are past their due date and unpaid become overdue. */
function markOverdueInvoices(todayIso: string): number {
  const invoices = loadInvoicesFromStorage();
  let count = 0;
  const updated = invoices.map((inv) => {
    if (inv.status === "SENT" && inv.balanceKES > 0 && inv.dueDate && inv.dueDate < todayIso) {
      count++;
      return { ...inv, status: "OVERDUE" as const };
    }
    return inv;
  });
  if (count) saveInvoicesToStorage(updated);
  return count;
}

/** When an onboarding project is completed, its subscription goes live. */
function activateCompletedOnboardings(todayIso: string): number {
  const projects = readList<ImplementationProjectItem>(PROJECTS_STORAGE_KEY);
  const finished = projects.filter(
    (p) => p.id.startsWith("proj-") && (p.status === "COMPLETED" || p.progressPct >= 100)
  );
  if (!finished.length) return 0;

  let activated = 0;
  const subs = loadSubscriptionsFromStorage();
  const updatedSubs = subs.map((sub) => {
    const project = finished.find((p) => sub.id === `sub-${p.id.slice("proj-".length)}`);
    if (project && sub.status === "TRIAL") {
      activated++;
      return { ...sub, status: "ACTIVE" as const, nextBillingDate: addMonths(todayIso, cycleMonths(sub.billingCycle)) };
    }
    return sub;
  });
  if (!activated) return 0;
  saveSubscriptionsToStorage(updatedSubs);

  const clients = readList<ClientItem>(CLIENTS_STORAGE_KEY);
  const liveClientIds = new Set(finished.map((p) => p.clientId));
  const updatedClients = clients.map((c) =>
    liveClientIds.has(c.id) && c.status === "ONBOARDING" ? { ...c, status: "ACTIVE" as const } : c
  );
  writeList(CLIENTS_STORAGE_KEY, updatedClients);
  return activated;
}

/** Keep each client's onboarding step and progress in step with its project. */
function syncClientOnboardingProgress(): number {
  const projects = readList<ImplementationProjectItem>(PROJECTS_STORAGE_KEY);
  if (!projects.length) return 0;
  const clients = readList<ClientItem>(CLIENTS_STORAGE_KEY);
  let changed = 0;
  const updated = clients.map((client) => {
    const project = projects.find((p) => p.clientId === client.id);
    if (!project || !project.tasks.length) return client;
    const nextOpen = project.tasks.find((t) => !t.completed);
    const finished = project.status === "COMPLETED" || project.progressPct >= 100;
    const step = !finished && nextOpen ? nextOpen.stepNumber : project.tasks.length;
    if (client.currentOnboardingStep === step && client.onboardingProgressPct === project.progressPct) return client;
    changed++;
    return { ...client, currentOnboardingStep: step, onboardingProgressPct: project.progressPct };
  });
  if (changed) writeList(CLIENTS_STORAGE_KEY, updated);
  return changed;
}

export function runWorkflows(today = new Date()): WorkflowRunResult {
  const todayIso = isoDay(today);
  const subscriptionsActivated = activateCompletedOnboardings(todayIso);
  const invoicesGenerated = generateRecurringInvoices(todayIso);
  const invoicesMarkedOverdue = markOverdueInvoices(todayIso);
  const clientsSynced = syncClientOnboardingProgress();
  return {
    changed: subscriptionsActivated + invoicesGenerated + invoicesMarkedOverdue + clientsSynced > 0,
    invoicesGenerated,
    invoicesMarkedOverdue,
    subscriptionsActivated,
  };
}
