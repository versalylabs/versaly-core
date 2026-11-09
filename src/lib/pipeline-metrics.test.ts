import { describe, expect, it } from "vitest";
import { computeFunnel, computePipelineMetrics, type InsightDeal } from "@/lib/insights";

const deal = (id: string, stage: InsightDeal["stage"], setup: number, monthly: number, prob: number): InsightDeal => ({
  id,
  businessName: `Business ${id}`,
  productName: "Versandry",
  stage,
  setupFeeKES: setup,
  monthlyFeeKES: monthly,
  winProbability: prob,
  targetCloseDate: "2026-12-01",
});

describe("computePipelineMetrics", () => {
  it("is all zeros, not invented numbers, when there are no deals", () => {
    const m = computePipelineMetrics([]);
    expect(m).toMatchObject({ openDealCount: 0, totalPipelineValueKES: 0, weightedPipelineValueKES: 0, wonCount: 0, lostCount: 0, winRatePct: 0, averageDealSizeKES: 0 });
    expect(m.dealsByStage.map((s) => s.count)).toEqual([0, 0, 0, 0]);
  });

  const deals = [
    deal("a", "CONTACTED", 40000, 10000, 10),
    deal("b", "DEMO_BOOKED", 90000, 12000, 25),
    deal("c", "DEMO_BOOKED", 60000, 8000, 35),
    deal("d", "PROPOSAL_SENT", 100000, 20000, 75),
    deal("e", "WON", 50000, 5000, 100),
    deal("f", "LOST", 70000, 7000, 0),
  ];

  it("counts and values only the open deals in the pipeline", () => {
    const m = computePipelineMetrics(deals);
    expect(m.openDealCount).toBe(4);
    // setup fee + first month for each open deal
    expect(m.totalPipelineValueKES).toBe(50000 + 102000 + 68000 + 120000);
    // each deal weighted by its own probability: 5000 + 25500 + 23800 + 90000
    expect(m.weightedPipelineValueKES).toBe(144300);
  });

  it("breaks the pipeline down by stage", () => {
    const stages = computePipelineMetrics(deals).dealsByStage;
    expect(stages.map((s) => s.stage)).toEqual(["CONTACTED", "DEMO_BOOKED", "PROPOSAL_SENT", "NEGOTIATION"]);
    const demo = stages[1];
    expect(demo.count).toBe(2);
    expect(demo.nominalValueKES).toBe(170000);
    expect(demo.probabilityPct).toBe(30); // average of 25 and 35
    expect(stages[3].count).toBe(0);
    expect(stages[3].probabilityPct).toBe(0);
  });

  it("reports won, lost and the win rate among closed deals", () => {
    const m = computePipelineMetrics(deals);
    expect(m.wonCount).toBe(1);
    expect(m.wonValueKES).toBe(55000);
    expect(m.lostCount).toBe(1);
    expect(m.winRatePct).toBe(50);
  });

  it("averages the deal size across every deal", () => {
    expect(computePipelineMetrics(deals).averageDealSizeKES).toBe(Math.round((50000 + 102000 + 68000 + 120000 + 55000 + 77000) / 6));
  });

  it("ignores missing numbers instead of producing NaN", () => {
    const messy = [{ ...deal("x", "CONTACTED", 0, 0, 0), setupFeeKES: undefined as never, winProbability: undefined as never }];
    const m = computePipelineMetrics(messy);
    expect(Number.isNaN(m.totalPipelineValueKES)).toBe(false);
    expect(Number.isNaN(m.weightedPipelineValueKES)).toBe(false);
  });
});

describe("computeFunnel", () => {
  it("counts the uncontacted pool from leads and the rest from deals", () => {
    const leads = [{ status: "UNCONTACTED" }, { status: "UNCONTACTED" }, { status: "CONTACTED" }, { status: "ARCHIVED" }];
    const deals = [
      deal("a", "CONTACTED", 1, 1, 10),
      deal("b", "DEMO_BOOKED", 1, 1, 25),
      deal("c", "PROPOSAL_SENT", 1, 1, 75),
      deal("d", "NEGOTIATION", 1, 1, 90),
      deal("e", "WON", 1, 1, 100),
      deal("f", "LOST", 1, 1, 0),
    ];
    expect(computeFunnel(leads, deals)).toEqual({
      uncontactedPool: 2,
      leadsContacted: 6,
      demosBooked: 4, // demo booked, proposal, negotiation, won
      proposalsSent: 3, // proposal, negotiation, won
      dealsWon: 1,
      dealsLost: 1,
      contactedToWonConversionPct: 17,
    });
  });

  it("never divides by zero", () => {
    expect(computeFunnel([], []).contactedToWonConversionPct).toBe(0);
  });
});
