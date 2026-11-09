"use client";

/**
 * Standalone pieces of the executive dashboard: types, constants and the
 * "intelligence briefing" calculator. Moved out of the page so the page file is
 * smaller and these can be reused or tested on their own.
 */

import { appStorage } from "@/lib/app-storage";
import { INITIAL_CALENDAR_EVENTS } from "@/data/calendar-seed";
import { WEEKLY_RHYTHM_TEMPLATES } from "@/data/tasks-data";

import { todayIsoDate } from "@/lib/ids";
export const DASHBOARD_QUEUE_KEY = "versaly_dashboard_outreach_queue_v2";

export interface OutreachItem {
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

export type FridayScorecardMetricKey =
  | "contactsMade"
  | "checksDelivered"
  | "demosHeld"
  | "clientsSigned"
  | "clientsLive"
  | "problemsReported"
  | "referralsReceived";

export interface FridayScorecard {
  contactsMade: Record<string, string>;
  checksDelivered: Record<string, string>;
  demosHeld: Record<string, string>;
  clientsSigned: Record<string, string>;
  clientsLive: Record<string, string>;
  problemsReported: Record<string, string>;
  referralsReceived: Record<string, string>;
  leadsStuckNotes: string;
  oneChangeTest: string;
  clientNeedsAttention: string;
}

export const SCORECARD_ROWS: { key: FridayScorecardMetricKey; label: string }[] = [
  { key: "contactsMade", label: "1. Contacts made this week" },
  { key: "checksDelivered", label: "2. Free checks or maps delivered" },
  { key: "demosHeld", label: "3. Demos held" },
  { key: "clientsSigned", label: "4. Clients signed" },
  { key: "clientsLive", label: "5. Clients gone live" },
  { key: "problemsReported", label: "6. Problems or bugs reported" },
  { key: "referralsReceived", label: "7. Referrals received" },
];

export const INITIAL_QUEUE: OutreachItem[] = [];

// ── Intelligence Briefing helper (runs outside React, reads localStorage) ──
export function computeIntelligenceBriefing() {
  if (typeof window === "undefined") {
    return { activeTasks: 0, upcomingEvents: 0, activeProjects: 0, openDeals: 0, overdueInvoices: 0, uncontactedLeads: 0 };
  }

  // Active (incomplete) tasks
  let activeTasks = 0;
  try {
    const raw = appStorage.getItem("versaly_daily_tasks");
    if (raw) {
      const tasks = JSON.parse(raw) as Array<{ completed?: boolean }>;
      activeTasks = tasks.filter((t) => !t.completed).length;
    } else {
      activeTasks = WEEKLY_RHYTHM_TEMPLATES[1]?.tasks?.length || 0;
    }
  } catch { /* ignore */ }

  // Upcoming events in next 7 days
  let upcomingEvents = 0;
  try {
    const raw = appStorage.getItem("versaly_business_calendar_v2");
    const sourceEvents = raw ? (JSON.parse(raw) as Array<{ date?: string }>) : INITIAL_CALENDAR_EVENTS;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7 = new Date(today);
    next7.setDate(next7.getDate() + 7);
    upcomingEvents = sourceEvents.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d >= today && d <= next7;
    }).length;
  } catch { /* ignore */ }

  // Active projects
  let activeProjects = 0;
  try {
    const raw = appStorage.getItem("versaly_projects_list_v2");
    if (raw) {
      const projects = JSON.parse(raw) as Array<{ status?: string }>;
      activeProjects = projects.filter((p) => p.status === "ACTIVE" || (p.status !== "COMPLETED" && p.status !== "CANCELLED")).length;
    }
  } catch { /* ignore */ }

  // Open deals (not WON or LOST)
  let openDeals = 0;
  try {
    const raw = appStorage.getItem("versaly_active_deals_v2");
    if (raw) {
      const deals = JSON.parse(raw) as Array<{ stage?: string }>;
      openDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST").length;
    }
  } catch { /* ignore */ }

  // Overdue invoices
  let overdueInvoices = 0;
  try {
    const raw = appStorage.getItem("versaly_finance_invoices_v2");
    if (raw) {
      const invoices = JSON.parse(raw) as Array<{ status?: string; balanceKES?: number; dueDate?: string }>;
      const today = todayIsoDate();
      overdueInvoices = invoices.filter(
        (i) => (i.status === "SENT" || i.status === "OVERDUE") && (i.balanceKES ?? 0) > 0 && Boolean(i.dueDate) && String(i.dueDate) < today
      ).length;
    }
  } catch { /* ignore */ }

  // Uncontacted leads
  let uncontactedLeads = 0;
  try {
    const raw = appStorage.getItem("versaly_raw_leads_v2");
    if (raw) {
      const leads = JSON.parse(raw) as Array<{ status?: string }>;
      uncontactedLeads = leads.filter((l) => l.status === "UNCONTACTED").length;
    }
  } catch { /* ignore */ }

  return { activeTasks, upcomingEvents, activeProjects, openDeals, overdueInvoices, uncontactedLeads };
}
