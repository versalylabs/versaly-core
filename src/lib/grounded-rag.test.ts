import { describe, expect, it } from "vitest";
import { queryInternalKnowledge } from "./grounded-rag";
import { emptyWorkspaceData, type WorkspaceData } from "./insights";

const TODAY = "2026-11-08";

const data = (over: Partial<WorkspaceData> = {}): WorkspaceData => ({ ...emptyWorkspaceData(), ...over });

const overdueInvoice = {
  id: "i1",
  invoiceNumber: "INV-2026-1001",
  clientName: "Mombasa Fleet",
  status: "OVERDUE" as const,
  totalKES: 58000,
  amountPaidKES: 0,
  balanceKES: 58000,
  dueDate: "2026-11-01",
};

describe("assistant answers from your real records", () => {
  it("lists overdue invoices from the data, without any hardcoded payment details", () => {
    const a = queryInternalKnowledge("Which invoices are overdue?", "ADMIN", data({ invoices: [overdueInvoice] }), TODAY);
    expect(a.summary).toContain("1 overdue invoices totaling KES 58,000");
    expect(a.directAnswer).toContain("Mombasa Fleet");
    expect(a.citations[0]).toMatchObject({ sourceType: "INVOICE", title: "INV-2026-1001 - Mombasa Fleet" });
    expect(JSON.stringify(a)).not.toContain("894020");
  });

  it("says plainly when nothing is overdue, and mentions unsent drafts", () => {
    const draft = { ...overdueInvoice, id: "d", status: "DRAFT" as const, dueDate: "2026-11-15" };
    const a = queryInternalKnowledge("any overdue invoices?", "ADMIN", data({ invoices: [draft] }), TODAY);
    expect(a.summary).toBe("No invoices are overdue right now.");
    expect(a.directAnswer).toContain("1 draft invoice(s)");
  });

  it("works with an empty workspace instead of inventing records", () => {
    const a = queryInternalKnowledge("which invoices are overdue", "ADMIN", emptyWorkspaceData(), TODAY);
    expect(a.summary).toBe("No invoices are overdue right now.");
    expect(a.citations).toHaveLength(0);
  });

  it("reports blocked projects from the data", () => {
    const a = queryInternalKnowledge(
      "what is blocked?",
      "ADMIN",
      data({
        projects: [
          { id: "p", clientName: "Nakuru Haulage", name: "Impl", status: "ACTIVE", progressPct: 30, hasBlocker: true, blockerDescription: "Waiting for premises access", blockerDays: 5, targetGoLiveDate: "2026-12-01" },
        ],
      }),
      TODAY
    );
    expect(a.directAnswer).toContain("Nakuru Haulage");
    expect(a.directAnswer).toContain("Waiting for premises access");
  });

  it("describes the open pipeline from the data", () => {
    const a = queryInternalKnowledge(
      "how is the pipeline?",
      "ADMIN",
      data({
        deals: [
          { id: "d", businessName: "Kisumu Cabs", productName: "Vehisoft", stage: "PROPOSAL_SENT", setupFeeKES: 40000, monthlyFeeKES: 9000, winProbability: 60, targetCloseDate: "2026-11-30", nextAction: "Follow up" },
          { id: "w", businessName: "Already Won", productName: "P", stage: "WON", setupFeeKES: 1, monthlyFeeKES: 1, winProbability: 100, targetCloseDate: "2026-11-01" },
        ],
      }),
      TODAY
    );
    expect(a.summary).toContain("1 qualified deals");
    expect(a.directAnswer).toContain("Kisumu Cabs");
    expect(a.directAnswer).not.toContain("Already Won");
  });

  it("answers cash and forecast questions", () => {
    const a = queryInternalKnowledge(
      "what is our cash flow forecast?",
      "OWNER",
      data({
        accounts: [{ id: "a", name: "Bank", accountType: "BANK", balanceKES: 50000, status: "ACTIVE" }],
        expenses: [{ id: "e", description: "Rent", vendor: "Landlord", amountKES: 80000, expenseDate: "2026-11-20", status: "SCHEDULED" }],
      }),
      TODAY
    );
    expect(a.summary).toContain("drops below zero");
    expect(a.directAnswer).toContain("KES 50,000");
    expect(a.citations[0].linkUrl).toBe("/finance/forecast");
  });

  it("answers recurring revenue questions", () => {
    const a = queryInternalKnowledge(
      "what is our MRR?",
      "ADMIN",
      data({
        subscriptions: [
          { id: "s1", clientName: "A", productName: "P", monthlyFeeKES: 15000, billingCycle: "MONTHLY", status: "ACTIVE", nextBillingDate: "2026-12-01" },
          { id: "s2", clientName: "B", productName: "P", monthlyFeeKES: 8000, billingCycle: "MONTHLY", status: "TRIAL", nextBillingDate: "2026-12-01" },
        ],
      }),
      TODAY
    );
    expect(a.summary).toContain("KES 15,000");
    expect(a.directAnswer).toContain("KES 8,000");
  });

  it("keeps finance answers away from staff", () => {
    for (const q of ["which invoices are overdue", "what is our cash forecast", "what is our mrr"]) {
      const a = queryInternalKnowledge(q, "STAFF", data({ invoices: [overdueInvoice] }), TODAY);
      expect(a.keyFacts).toEqual(["Role authorization: ACCESS_DENIED"]);
      expect(a.directAnswer).not.toContain("Mombasa");
    }
  });
});
