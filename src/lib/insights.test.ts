import { describe, expect, it } from "vitest";
import {
  buildForecast,
  computeSnapshot,
  emptyWorkspaceData,
  paymentLikelihood,
  type InsightInvoice,
  type WorkspaceData,
} from "./insights";

const TODAY = "2026-11-08";

const invoice = (over: Partial<InsightInvoice> = {}): InsightInvoice => ({
  id: "i1",
  invoiceNumber: "INV-2026-1001",
  clientName: "Mombasa Fleet",
  status: "SENT",
  totalKES: 58000,
  amountPaidKES: 0,
  balanceKES: 58000,
  dueDate: "2026-11-15",
  payments: [],
  ...over,
});

const data = (over: Partial<WorkspaceData> = {}): WorkspaceData => ({ ...emptyWorkspaceData(), ...over });

describe("computeSnapshot", () => {
  it("sums cash from active accounts only", () => {
    const s = computeSnapshot(
      data({
        accounts: [
          { id: "a", name: "KCB", accountType: "BANK", balanceKES: 100000, status: "ACTIVE" },
          { id: "b", name: "Old", accountType: "BANK", balanceKES: 50000, status: "INACTIVE" },
        ],
      }),
      TODAY
    );
    expect(s.cashOnHandKES).toBe(100000);
  });

  it("splits receivables into open and overdue, ignoring drafts and paid", () => {
    const s = computeSnapshot(
      data({
        invoices: [
          invoice({ id: "a", balanceKES: 10000, dueDate: "2026-11-20" }),
          invoice({ id: "b", status: "OVERDUE", balanceKES: 5000, dueDate: "2026-11-01" }),
          invoice({ id: "c", status: "DRAFT", balanceKES: 7000, totalKES: 7000 }),
          invoice({ id: "d", status: "PAID", balanceKES: 0 }),
        ],
      }),
      TODAY
    );
    expect(s.receivables).toEqual({ openKES: 15000, openCount: 2, overdueKES: 5000, overdueCount: 1 });
    expect(s.unsentDrafts).toEqual({ count: 1, totalKES: 7000 });
  });

  it("counts only this month's dated payments as collected", () => {
    const s = computeSnapshot(
      data({
        invoices: [
          invoice({
            payments: [
              { amountKES: 1000, receivedAt: "2026-11-02" },
              { amountKES: 2000, receivedAt: "2026-10-30" },
              { amountKES: 4000, receivedAt: "Today" },
            ],
          }),
        ],
      }),
      TODAY
    );
    expect(s.collectedThisMonthKES).toBe(1000);
  });

  it("separates live MRR from trial MRR", () => {
    const sub = (id: string, status: "ACTIVE" | "TRIAL" | "CANCELLED", fee: number) => ({
      id,
      clientName: "C",
      productName: "P",
      monthlyFeeKES: fee,
      billingCycle: "MONTHLY" as const,
      status,
      nextBillingDate: "2026-12-01",
    });
    const s = computeSnapshot(data({ subscriptions: [sub("1", "ACTIVE", 15000), sub("2", "TRIAL", 8000), sub("3", "CANCELLED", 9000)] }), TODAY);
    expect(s.mrrKES).toBe(15000);
    expect(s.trialMrrKES).toBe(8000);
  });

  it("weights the pipeline by win probability and skips won and lost deals", () => {
    const deal = (id: string, stage: "NEGOTIATION" | "WON" | "LOST" | "CONTACTED", setup: number, p: number) => ({
      id,
      businessName: id,
      productName: "P",
      stage,
      setupFeeKES: setup,
      monthlyFeeKES: 1000,
      winProbability: p,
      targetCloseDate: "2026-11-20",
    });
    const s = computeSnapshot(
      data({ deals: [deal("a", "NEGOTIATION", 100000, 50), deal("b", "CONTACTED", 40000, 25), deal("c", "WON", 90000, 100), deal("d", "LOST", 90000, 0)] }),
      TODAY
    );
    expect(s.pipeline.openDeals).toBe(2);
    expect(s.pipeline.setupKES).toBe(140000);
    expect(s.pipeline.weightedSetupKES).toBe(60000);
    expect(s.pipeline.potentialMrrKES).toBe(2000);
    expect(s.pipeline.byStage).toEqual({ NEGOTIATION: 1, CONTACTED: 1 });
  });

  it("flags blocked and late projects but not completed ones", () => {
    const proj = (id: string, over: object = {}) => ({
      id,
      clientName: id,
      name: "Impl",
      status: "ACTIVE" as const,
      progressPct: 40,
      hasBlocker: false,
      targetGoLiveDate: "2026-12-01",
      ...over,
    });
    const s = computeSnapshot(
      data({
        projects: [
          proj("blocked", { hasBlocker: true, blockerDescription: "Waiting for garage access", blockerDays: 6 }),
          proj("late", { targetGoLiveDate: "2026-11-01" }),
          proj("done", { status: "COMPLETED", progressPct: 100, targetGoLiveDate: "2026-10-01" }),
        ],
      }),
      TODAY
    );
    expect(s.projects.blocked).toBe(1);
    expect(s.projects.late).toBe(1);
    expect(s.projects.blockers).toEqual([{ client: "blocked", text: "Waiting for garage access", days: 6 }]);
  });

  it("lists follow-ups most overdue first", () => {
    const s = computeSnapshot(
      data({
        invoices: [
          invoice({ id: "soon", invoiceNumber: "INV-2", dueDate: "2026-11-10" }),
          invoice({ id: "late", invoiceNumber: "INV-1", status: "OVERDUE", dueDate: "2026-11-01" }),
          invoice({ id: "later", invoiceNumber: "INV-3", dueDate: "2026-12-30" }),
        ],
      }),
      TODAY
    );
    expect(s.followUps.map((f) => f.invoiceNumber)).toEqual(["INV-1", "INV-2"]);
    expect(s.followUps[0]).toMatchObject({ stage: "overdue", daysToDue: -7 });
  });

  it("copes with no data at all", () => {
    const s = computeSnapshot(emptyWorkspaceData(), TODAY);
    expect(s.cashOnHandKES).toBe(0);
    expect(s.receivables.openKES).toBe(0);
    expect(s.followUps).toEqual([]);
  });
});

describe("paymentLikelihood", () => {
  it("falls as an invoice gets later", () => {
    expect(paymentLikelihood(5)).toBe(0.9);
    expect(paymentLikelihood(0)).toBe(0.9);
    expect(paymentLikelihood(-3)).toBe(0.6);
    expect(paymentLikelihood(-14)).toBe(0.6);
    expect(paymentLikelihood(-30)).toBe(0.35);
  });
});

describe("buildForecast: inflows", () => {
  const cash = [{ id: "a", name: "Bank", accountType: "BANK", balanceKES: 100000, status: "ACTIVE" as const }];

  it("starts from cash on hand and has the requested number of weeks", () => {
    const f = buildForecast(data({ accounts: cash }), TODAY, 8);
    expect(f.startCashKES).toBe(100000);
    expect(f.weeks).toHaveLength(8);
    expect(f.weeks[0]).toMatchObject({ start: "2026-11-08", end: "2026-11-14" });
    expect(f.weeks[1].start).toBe("2026-11-15");
    expect(f.weeks[7].cashKES).toBe(100000);
    expect(f.goesNegative).toBe(false);
  });

  it("puts a sent invoice in the week it is due, weighted at 90%", () => {
    const f = buildForecast(data({ invoices: [invoice({ dueDate: "2026-11-15" })] }), TODAY);
    expect(f.weeks[1].inflowConfirmedKES).toBe(52200);
    expect(f.weeks[1].items[0]).toMatchObject({ kind: "invoice", fullKES: 58000, amountKES: 52200 });
  });

  it("brings overdue invoices into this week at a lower confidence", () => {
    const f = buildForecast(
      data({
        invoices: [
          invoice({ id: "a", status: "OVERDUE", balanceKES: 10000, dueDate: "2026-11-05" }), // 3 days: 60%
          invoice({ id: "b", status: "OVERDUE", balanceKES: 10000, dueDate: "2026-10-01" }), // 38 days: 35%
        ],
      }),
      TODAY
    );
    expect(f.weeks[0].inflowConfirmedKES).toBe(6000 + 3500);
  });

  it("counts a draft invoice at 70% and ignores paid, void and zero-balance invoices", () => {
    const f = buildForecast(
      data({
        invoices: [
          invoice({ id: "d", status: "DRAFT", balanceKES: 10000, dueDate: "2026-11-09" }),
          invoice({ id: "p", status: "PAID", balanceKES: 0 }),
          invoice({ id: "v", status: "VOID", balanceKES: 5000 }),
          invoice({ id: "z", balanceKES: 0 }),
        ],
      }),
      TODAY
    );
    expect(f.totals.inflowConfirmedKES).toBe(7000);
  });

  it("forecasts each future billing of an active subscription, 7 days after it is invoiced", () => {
    const f = buildForecast(
      data({
        subscriptions: [
          { id: "s", clientName: "C", productName: "Vehisoft", monthlyFeeKES: 15000, billingCycle: "MONTHLY", status: "ACTIVE", nextBillingDate: "2026-11-10" },
        ],
      }),
      TODAY
    );
    // 10 Nov billing -> due 17 Nov (week 1); 10 Dec -> 17 Dec (week 5)
    expect(f.weeks[1].inflowConfirmedKES).toBe(13500);
    expect(f.weeks[5].inflowConfirmedKES).toBe(13500);
    expect(f.totals.inflowConfirmedKES).toBe(27000);
  });

  it("bills quarterly subscriptions for three months at a time, and skips trials and cancelled ones", () => {
    const sub = (id: string, status: "ACTIVE" | "TRIAL" | "CANCELLED", cycle: "MONTHLY" | "QUARTERLY") => ({
      id,
      clientName: id,
      productName: "P",
      monthlyFeeKES: 10000,
      billingCycle: cycle,
      status,
      nextBillingDate: "2026-11-10",
    });
    const f = buildForecast(data({ subscriptions: [sub("q", "ACTIVE", "QUARTERLY"), sub("t", "TRIAL", "MONTHLY"), sub("x", "CANCELLED", "MONTHLY")] }), TODAY);
    expect(f.totals.inflowConfirmedKES).toBe(27000);
  });

  it("keeps weighted pipeline separate from confirmed cash", () => {
    const f = buildForecast(
      data({
        accounts: cash,
        deals: [
          { id: "d", businessName: "Nakuru", productName: "Vehisoft", stage: "NEGOTIATION", setupFeeKES: 50000, monthlyFeeKES: 8000, winProbability: 60, targetCloseDate: "2026-11-12" },
          { id: "w", businessName: "Won", productName: "P", stage: "WON", setupFeeKES: 99999, monthlyFeeKES: 0, winProbability: 100, targetCloseDate: "2026-11-12" },
        ],
      }),
      TODAY
    );
    // close 12 Nov + 14 days terms = 26 Nov -> week 2
    expect(f.weeks[2].inflowPipelineKES).toBe(30000);
    expect(f.totals.inflowConfirmedKES).toBe(0);
    expect(f.weeks[2].cashKES).toBe(100000);
    expect(f.weeks[2].cashWithPipelineKES).toBe(130000);
  });
});

describe("buildForecast: outflows and cash", () => {
  const cash = [{ id: "a", name: "Bank", accountType: "BANK", balanceKES: 50000, status: "ACTIVE" as const }];

  it("schedules vendor renewals, rolling past dates forward by their billing cycle", () => {
    const f = buildForecast(
      data({
        vendorSubscriptions: [
          { id: "v", provider: "Vercel", serviceName: "Pro", costKES: 2600, billingCycle: "MONTHLY", renewalDate: "2026-09-12", status: "ACTIVE" },
        ],
      }),
      TODAY
    );
    // 12 Sep -> 12 Oct -> 12 Nov (week 0: 8-14 Nov) -> 12 Dec (day 34 = week 4)
    expect(f.weeks[0].outflowKES).toBe(2600);
    expect(f.weeks[4].outflowKES).toBe(2600);
    expect(f.totals.outflowKES).toBe(5200);
  });

  it("ignores cancelled vendors and only counts scheduled expenses", () => {
    const f = buildForecast(
      data({
        vendorSubscriptions: [
          { id: "v", provider: "X", serviceName: "Old", costKES: 9999, billingCycle: "MONTHLY", renewalDate: "2026-11-10", status: "CANCELLED" },
        ],
        expenses: [
          { id: "e1", description: "Rent", vendor: "Landlord", amountKES: 30000, expenseDate: "2026-11-20", status: "SCHEDULED" },
          { id: "e2", description: "Paid already", vendor: "Shop", amountKES: 5000, expenseDate: "2026-11-09", status: "PAID" },
          { id: "e3", description: "Waiting", vendor: "Shop", amountKES: 4000, expenseDate: "2026-11-09", status: "PENDING_APPROVAL" },
        ],
      }),
      TODAY
    );
    expect(f.totals.outflowKES).toBe(30000);
  });

  it("runs cash forward, finds the low point and warns if it goes negative", () => {
    const f = buildForecast(
      data({
        accounts: cash,
        invoices: [invoice({ balanceKES: 20000, totalKES: 20000, dueDate: "2026-11-30" })], // +18,000 in week 3
        expenses: [{ id: "e", description: "Salaries", vendor: "Team", amountKES: 60000, expenseDate: "2026-11-16", status: "SCHEDULED" }], // week 1
      }),
      TODAY
    );
    expect(f.weeks[0].cashKES).toBe(50000);
    expect(f.weeks[1].cashKES).toBe(-10000);
    expect(f.weeks[3].cashKES).toBe(8000);
    expect(f.lowest).toEqual({ weekIndex: 1, cashKES: -10000 });
    expect(f.goesNegative).toBe(true);
  });

  it("returns a flat forecast for an empty workspace", () => {
    const f = buildForecast(emptyWorkspaceData(), TODAY);
    expect(f.totals).toEqual({ inflowConfirmedKES: 0, inflowPipelineKES: 0, outflowKES: 0 });
    expect(f.goesNegative).toBe(false);
    expect(f.lowest.cashKES).toBe(0);
  });
});
