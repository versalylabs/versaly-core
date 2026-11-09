import { describe, expect, it } from "vitest";
import {
  computeCashAlerts,
  computeDelivery,
  computeFollowUps,
  computeProductActivity,
  countNewLeadsThisWeek,
  countOutreach,
  openSupportTickets,
  weekStart,
  type OutreachEntry,
} from "@/lib/ops-metrics";
import { computePipelineMetrics, type InsightClient, type InsightDeal, type InsightInvoice, type InsightProject } from "@/lib/insights";

const TODAY = "2026-11-11"; // a Wednesday

const deal = (id: string, stage: InsightDeal["stage"], extra: Partial<InsightDeal> = {}): InsightDeal => ({
  id,
  businessName: `Biz ${id}`,
  productName: "Versandry",
  stage,
  setupFeeKES: 50000,
  monthlyFeeKES: 10000,
  winProbability: 50,
  targetCloseDate: "2026-12-01",
  ...extra,
});

describe("weekStart", () => {
  it("is the Monday of the week, with Sunday belonging to the week before", () => {
    expect(weekStart("2026-11-11")).toBe("2026-11-09"); // Wed → Mon
    expect(weekStart("2026-11-09")).toBe("2026-11-09"); // Mon
    expect(weekStart("2026-11-15")).toBe("2026-11-09"); // Sun
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
  });
});

describe("outreach counts", () => {
  const entry = (date: string): OutreachEntry => ({ id: date, date, business: "B", channel: "Phone Call", outcome: "Connected" });
  it("counts today and this week separately", () => {
    const log = [entry("2026-11-11"), entry("2026-11-11"), entry("2026-11-10"), entry("2026-11-09"), entry("2026-11-08"), entry("2026-10-01")];
    expect(countOutreach(log, TODAY)).toEqual({ today: 2, week: 4 });
  });
  it("is zero with nothing logged, and ignores entries without a usable date", () => {
    expect(countOutreach([], TODAY)).toEqual({ today: 0, week: 0 });
    expect(countOutreach([{ ...entry("x"), date: "yesterday" }], TODAY)).toEqual({ today: 0, week: 0 });
  });
  it("counts new leads since Monday and skips ones with no recorded day", () => {
    const leads = [{ createdAt: "2026-11-10" }, { createdAt: "2026-11-02" }, { createdAt: "Just now" }, {}];
    expect(countNewLeadsThisWeek(leads, TODAY)).toBe(1);
  });
});

describe("follow-ups", () => {
  it("lists quiet deals in demo, proposal or negotiation, longest waiting first", () => {
    const deals = [
      deal("a", "PROPOSAL_SENT", { stageChangedAt: "2026-11-05", nextAction: "Call about the quote" }),
      deal("b", "DEMO_BOOKED", { stageChangedAt: "2026-11-01" }),
      deal("c", "NEGOTIATION", { stageChangedAt: "2026-11-10" }), // only 1 day: not yet
      deal("d", "CONTACTED", { stageChangedAt: "2026-10-01" }), // wrong stage
      deal("e", "WON", { stageChangedAt: "2026-10-01" }),
      deal("f", "PROPOSAL_SENT"), // no date recorded: can't tell
    ];
    const list = computeFollowUps(deals, TODAY);
    expect(list.map((f) => [f.id, f.daysWaiting])).toEqual([["b", 10], ["a", 6]]);
    expect(list[1].context).toBe("Call about the quote");
  });
  it("falls back to the creation day when the stage never changed", () => {
    expect(computeFollowUps([deal("a", "DEMO_BOOKED", { createdAt: "2026-11-01" })], TODAY)).toHaveLength(1);
  });
});

describe("pipeline dates", () => {
  it("counts wins this month and the average days to close from recorded dates only", () => {
    const deals = [
      deal("a", "WON", { createdAt: "2026-10-20", wonAt: "2026-11-02" }), // 13 days, this month
      deal("b", "WON", { createdAt: "2026-11-01", wonAt: "2026-11-05" }), // 4 days, this month
      deal("c", "WON", { createdAt: "2026-09-01", wonAt: "2026-09-10" }), // 9 days, last quarter
      deal("d", "WON"), // no dates: counted as won, not as timed
    ];
    const m = computePipelineMetrics(deals, TODAY);
    expect(m.wonCount).toBe(4);
    expect(m.wonThisMonthCount).toBe(2);
    expect(m.wonThisMonthValueKES).toBe(120000);
    expect(m.averageDaysToClose).toBe(9); // (13 + 4 + 9) / 3 = 8.67
  });
  it("has no average until a won deal has both dates", () => {
    expect(computePipelineMetrics([deal("a", "WON")], TODAY).averageDaysToClose).toBeNull();
    expect(computePipelineMetrics([], TODAY).averageDaysToClose).toBeNull();
  });
});

describe("delivery health", () => {
  const client = (id: string, status: InsightClient["status"], extra: Partial<InsightClient> = {}): InsightClient => ({ id, status, businessName: `Client ${id}`, ...extra });
  const project = (id: string, clientName: string, extra: Partial<InsightProject> = {}): InsightProject => ({
    id,
    clientName,
    name: `Onboarding ${clientName}`,
    status: "ACTIVE",
    progressPct: 30,
    hasBlocker: false,
    targetGoLiveDate: "2026-12-01",
    ...extra,
  });

  const clients = [
    client("1", "ACTIVE", { createdAt: "2026-11-03", renewalDate: "2026-11-20" }),
    client("2", "ACTIVE", { createdAt: "2026-09-03", renewalDate: "2027-03-01" }),
    client("3", "ONBOARDING", { createdAt: "2026-11-08" }),
    client("4", "PAST_DUE"),
  ];
  const projects = [
    project("p1", "Client 3", { hasBlocker: true, blockerDescription: "Waiting on garage access", blockerDays: 6, leadArchitect: "Wanjiru" }),
    project("p2", "Client 1", { status: "COMPLETED", progressPct: 100 }),
  ];

  it("counts clients, onboarding, go-lives, new clients and renewals", () => {
    const d = computeDelivery(clients, projects, TODAY);
    expect(d).toMatchObject({ totalClients: 4, activeClients: 2, clientsInOnboarding: 1, goLivesCompleted: 1, newClientsThisMonth: 2, renewalsDue30Days: 1, onboardingBlockersCount: 1 });
  });
  it("sorts clients into healthy, needs attention and at risk", () => {
    const { health } = computeDelivery(clients, projects, TODAY);
    expect(health).toMatchObject({ healthy: 2, needsAttention: 1, atRisk: 1, healthyPct: 50, needsAttentionPct: 25, atRiskPct: 25 });
  });
  it("lists blockers with who owns them and how long", () => {
    const { blockers } = computeDelivery(clients, projects, TODAY);
    expect(blockers).toEqual([{ id: "p1", client: "Client 3", product: "Onboarding Client 3", blocker: "Waiting on garage access", assignedTo: "Wanjiru", daysBlocked: 6 }]);
  });
  it("is all zeros with no clients, never NaN", () => {
    const d = computeDelivery([], [], TODAY);
    expect(d.health).toEqual({ healthy: 0, needsAttention: 0, atRisk: 0, healthyPct: 0, needsAttentionPct: 0, atRiskPct: 0 });
  });
  it("counts support tickets that aren't resolved", () => {
    expect(openSupportTickets([{ status: "OPEN" }, { status: "IN_PROGRESS" }, { status: "WAITING_ON_CLIENT" }, { status: "RESOLVED" }])).toBe(3);
  });
});

describe("product activity", () => {
  const product = { slug: "versandry", name: "Versandry" };
  it("matches deals and clients to the product by slug or name", () => {
    const deals = [
      deal("a", "CONTACTED", { productSlug: "versandry" }),
      deal("b", "DEMO_BOOKED", { productName: "versandry" }),
      deal("c", "WON", { productSlug: "versandry" }),
      deal("d", "WON", { productSlug: "vehisoft", productName: "Vehisoft" }),
    ];
    const clients: InsightClient[] = [{ id: "1", status: "ACTIVE", productSlug: "versandry" }];
    const a = computeProductActivity(product, deals, clients);
    expect(a).toMatchObject({ leadsContacted: 3, demosBooked: 2, dealsWon: 1, conversionRatePct: 33, clients: 1, traction: "Winning" });
  });
  it("says there is no activity, instead of claiming traction", () => {
    expect(computeProductActivity(product, [], []).traction).toBe("No activity yet");
    expect(computeProductActivity(product, [deal("a", "CONTACTED", { productSlug: "versandry" })], []).traction).toBe("Building pipeline");
  });
});

describe("cash alerts", () => {
  const inv = (id: string, dueDate: string, extra: Partial<InsightInvoice> = {}): InsightInvoice => ({
    id,
    invoiceNumber: `INV-${id}`,
    clientName: `Client ${id}`,
    status: "SENT",
    totalKES: 58000,
    amountPaidKES: 0,
    balanceKES: 58000,
    dueDate,
    ...extra,
  });
  it("lists overdue and due-today invoices, biggest first, and flags the long overdue as urgent", () => {
    const alerts = computeCashAlerts(
      [
        inv("1", "2026-11-01"), // 10 days overdue
        inv("2", "2026-11-09", { balanceKES: 90000 }), // 2 days
        inv("3", "2026-11-11"), // due today
        inv("4", "2026-11-30"), // later
        inv("5", "2026-10-01", { status: "PAID", balanceKES: 0 }),
        inv("6", "2026-10-01", { status: "DRAFT" }),
      ],
      TODAY
    );
    expect(alerts.map((a) => [a.id, a.status, a.urgency])).toEqual([
      ["2", "2 days overdue", "medium"],
      ["1", "10 days overdue", "high"],
      ["3", "Due today", "medium"],
    ]);
  });
});
