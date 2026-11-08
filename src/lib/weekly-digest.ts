/**
 * The Friday weekly review: a plain-language summary of where the business
 * stands, built from the same insights the app uses. Returns text and HTML so
 * it can be emailed or shown on screen. Pure (no React, no browser APIs).
 */

import { buildForecast, computeSnapshot, type WorkspaceData } from "@/lib/insights";
import { formatKES } from "@/lib/invoice-messages";

export interface WeeklyDigest {
  subject: string;
  text: string;
  html: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

interface Section {
  title: string;
  lines: string[];
}

/** What to do this coming week, most valuable first. */
function focusItems(data: WorkspaceData, todayIso: string): string[] {
  const snap = computeSnapshot(data, todayIso);
  const items: string[] = [];
  if (snap.receivables.overdueCount > 0) {
    items.push(`Chase ${snap.receivables.overdueCount} overdue invoice${snap.receivables.overdueCount === 1 ? "" : "s"} (${formatKES(snap.receivables.overdueKES)}).`);
  }
  if (snap.unsentDrafts.count > 0) {
    items.push(`Send ${snap.unsentDrafts.count} draft invoice${snap.unsentDrafts.count === 1 ? "" : "s"} worth ${formatKES(snap.unsentDrafts.totalKES)}. They can't be paid until they're sent.`);
  }
  for (const b of snap.projects.blockers.slice(0, 3)) {
    items.push(`Unblock ${b.client}: ${b.text}${b.days ? ` (${b.days} days)` : ""}.`);
  }
  if (snap.projects.late > 0) {
    items.push(`${snap.projects.late} onboarding project${snap.projects.late === 1 ? " is" : "s are"} past the go-live target. Agree a new date or push to finish.`);
  }
  if (snap.trialMrrKES > 0) {
    items.push(`${formatKES(snap.trialMrrKES)}/month of subscriptions starts billing once onboarding is completed.`);
  }
  if (snap.pipeline.openDeals > 0) {
    items.push(`Follow up the ${snap.pipeline.openDeals} open deal${snap.pipeline.openDeals === 1 ? "" : "s"} (${formatKES(snap.pipeline.setupKES)} in setup fees if all close).`);
  }
  return items;
}

export function buildWeeklyDigest(data: WorkspaceData, todayIso: string, options: { businessName?: string } = {}): WeeklyDigest {
  const business = options.businessName || "Versaly";
  const snap = computeSnapshot(data, todayIso);
  const forecast = buildForecast(data, todayIso, 4);
  const hasAccounts = data.accounts.some((a) => a.status === "ACTIVE");
  const focus = focusItems(data, todayIso);

  const sections: Section[] = [];

  // Money
  const money: string[] = [];
  if (hasAccounts) money.push(`Cash today: ${formatKES(snap.cashOnHandKES)}`);
  money.push(`Collected this month: ${formatKES(snap.collectedThisMonthKES)}`);
  money.push(`Owed to you: ${formatKES(snap.receivables.openKES)} across ${snap.receivables.openCount} sent invoice${snap.receivables.openCount === 1 ? "" : "s"}`);
  money.push(
    snap.receivables.overdueCount
      ? `Overdue: ${formatKES(snap.receivables.overdueKES)} (${snap.receivables.overdueCount} invoice${snap.receivables.overdueCount === 1 ? "" : "s"})`
      : "Overdue: nothing. Nice."
  );
  if (snap.unsentDrafts.count) money.push(`Not sent yet: ${snap.unsentDrafts.count} draft invoice${snap.unsentDrafts.count === 1 ? "" : "s"} (${formatKES(snap.unsentDrafts.totalKES)})`);
  sections.push({ title: "Money", lines: money });

  // Recurring revenue
  sections.push({
    title: "Recurring revenue",
    lines: [`Live MRR: ${formatKES(snap.mrrKES)}`, ...(snap.trialMrrKES ? [`Starting after go-live: ${formatKES(snap.trialMrrKES)}/month`] : [])],
  });

  // Pipeline
  sections.push({
    title: "Sales pipeline",
    lines: snap.pipeline.openDeals
      ? [
          `${snap.pipeline.openDeals} open deal${snap.pipeline.openDeals === 1 ? "" : "s"}: ${formatKES(snap.pipeline.setupKES)} in setup fees (${formatKES(snap.pipeline.weightedSetupKES)} weighted by likelihood)`,
          `Potential new MRR: ${formatKES(snap.pipeline.potentialMrrKES)}/month`,
        ]
      : ["No open deals. Time to prospect."],
  });

  // Delivery
  const delivery = [`${snap.projects.active} active project${snap.projects.active === 1 ? "" : "s"}, ${snap.clients.active} active client${snap.clients.active === 1 ? "" : "s"}, ${snap.clients.onboarding} onboarding`];
  if (snap.projects.blocked) delivery.push(`${snap.projects.blocked} blocked`);
  if (snap.projects.late) delivery.push(`${snap.projects.late} past go-live target`);
  sections.push({ title: "Delivery", lines: [delivery.join(" · ")] });

  // Chasing list
  if (snap.followUps.length) {
    sections.push({
      title: "Who to chase",
      lines: snap.followUps
        .slice(0, 5)
        .map((f) => `${f.clientName}: ${formatKES(f.balanceKES)} (${f.invoiceNumber}), ${f.stage === "overdue" ? `${-f.daysToDue} day${f.daysToDue === -1 ? "" : "s"} overdue` : f.stage === "due_today" ? "due today" : `due in ${f.daysToDue} day${f.daysToDue === 1 ? "" : "s"}`}`),
    });
  }

  // Outlook
  const low = forecast.weeks.reduce((l, w) => (w.cashKES < l.cashKES ? w : l), forecast.weeks[0]);
  const outlook = [
    `Expected in: ${formatKES(forecast.totals.inflowConfirmedKES)}`,
    `Scheduled out: ${formatKES(forecast.totals.outflowKES)}`,
  ];
  if (hasAccounts) outlook.push(forecast.goesNegative ? `Warning: cash is projected to go below zero (${formatKES(low.cashKES)}) in the week of ${low.start}` : `Lowest projected cash: ${formatKES(low.cashKES)}`);
  sections.push({ title: "Next 4 weeks", lines: outlook });

  const subject = `${business} weekly review: ${snap.receivables.overdueCount ? `${snap.receivables.overdueCount} overdue, ` : ""}MRR ${formatKES(snap.mrrKES)}`;

  // Plain text
  const textParts = [`${business} weekly review`, longDate(todayIso), ""];
  if (focus.length) {
    textParts.push("THIS WEEK'S FOCUS", ...focus.map((f) => `• ${f}`), "");
  }
  for (const s of sections) textParts.push(s.title.toUpperCase(), ...s.lines.map((l) => `• ${l}`), "");
  textParts.push("Open Versaly Core for the details.");

  // HTML (simple, inline styles so it survives email clients)
  const li = (t: string) => `<li style="margin:0 0 6px;color:#334155">${escapeHtml(t)}</li>`;
  const h = (t: string) => `<h3 style="margin:22px 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#4f46e5">${escapeHtml(t)}</h3>`;
  const html =
    `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#ffffff;color:#0f172a">` +
    `<h1 style="margin:0;font-size:20px">${escapeHtml(business)} weekly review</h1>` +
    `<div style="color:#64748b;font-size:13px;margin-top:4px">${escapeHtml(longDate(todayIso))}</div>` +
    (focus.length ? h("This week's focus") + `<ul style="margin:0;padding-left:18px;font-size:14px">${focus.map(li).join("")}</ul>` : "") +
    sections.map((s) => h(s.title) + `<ul style="margin:0;padding-left:18px;font-size:14px">${s.lines.map(li).join("")}</ul>`).join("") +
    `<p style="margin-top:28px;font-size:12px;color:#94a3b8">Sent automatically by Versaly Core every Friday.</p>` +
    `</div>`;

  return { subject, text: textParts.join("\n"), html };
}
