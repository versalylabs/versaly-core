import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWeeklyDigest } from "./weekly-digest";
import { emailConfigured, sendEmail } from "./email";
import { emptyWorkspaceData, type WorkspaceData } from "./insights";

const TODAY = "2026-11-06"; // a Friday

const data = (over: Partial<WorkspaceData> = {}): WorkspaceData => ({ ...emptyWorkspaceData(), ...over });

const overdue = {
  id: "i1",
  invoiceNumber: "INV-2026-1001",
  clientName: "Mombasa Fleet",
  status: "OVERDUE" as const,
  totalKES: 58000,
  amountPaidKES: 0,
  balanceKES: 58000,
  dueDate: "2026-11-01",
};

describe("buildWeeklyDigest", () => {
  it("leads with the things to do, in order of value", () => {
    const d = buildWeeklyDigest(
      data({
        invoices: [overdue, { ...overdue, id: "d", invoiceNumber: "INV-2", status: "DRAFT", dueDate: "2026-11-20", totalKES: 10000, balanceKES: 10000 }],
        projects: [{ id: "p", clientName: "Nakuru Haulage", name: "Impl", status: "ACTIVE", progressPct: 20, hasBlocker: true, blockerDescription: "Needs garage access", blockerDays: 4, targetGoLiveDate: "2026-12-10" }],
      }),
      TODAY
    );
    const focus = d.text.split("THIS WEEK'S FOCUS")[1].split("\n\n")[0];
    expect(focus.indexOf("Chase 1 overdue invoice")).toBeLessThan(focus.indexOf("Send 1 draft invoice"));
    expect(focus.indexOf("Send 1 draft invoice")).toBeLessThan(focus.indexOf("Unblock Nakuru Haulage"));
    expect(d.text).toContain("Needs garage access (4 days)");
  });

  it("states the numbers plainly", () => {
    const d = buildWeeklyDigest(
      data({
        invoices: [overdue],
        subscriptions: [{ id: "s", clientName: "A", productName: "P", monthlyFeeKES: 15000, billingCycle: "MONTHLY", status: "ACTIVE", nextBillingDate: "2026-12-01" }],
        accounts: [{ id: "a", name: "Bank", accountType: "BANK", balanceKES: 120000, status: "ACTIVE" }],
      }),
      TODAY,
      { businessName: "Versaly" }
    );
    expect(d.subject).toBe("Versaly weekly review: 1 overdue, MRR KES 15,000");
    expect(d.text).toContain("Cash today: KES 120,000");
    expect(d.text).toContain("Overdue: KES 58,000 (1 invoice)");
    expect(d.text).toContain("Live MRR: KES 15,000");
    expect(d.text).toContain("Mombasa Fleet: KES 58,000 (INV-2026-1001), 5 days overdue");
  });

  it("does not quote a cash balance when no accounts are set up", () => {
    const d = buildWeeklyDigest(data(), TODAY);
    expect(d.text).not.toContain("Cash today");
    expect(d.text).not.toContain("Lowest projected cash");
  });

  it("warns when cash is projected to run out", () => {
    const d = buildWeeklyDigest(
      data({
        accounts: [{ id: "a", name: "Bank", accountType: "BANK", balanceKES: 10000, status: "ACTIVE" }],
        expenses: [{ id: "e", description: "Rent", vendor: "Landlord", amountKES: 50000, expenseDate: "2026-11-10", status: "SCHEDULED" }],
      }),
      TODAY
    );
    expect(d.text).toContain("Warning: cash is projected to go below zero");
  });

  it("copes with an empty workspace", () => {
    const d = buildWeeklyDigest(emptyWorkspaceData(), TODAY);
    expect(d.text).toContain("Overdue: nothing. Nice.");
    expect(d.text).toContain("No open deals");
    expect(d.text).not.toContain("THIS WEEK'S FOCUS");
  });

  it("escapes anything typed into your records in the HTML version", () => {
    const d = buildWeeklyDigest(data({ invoices: [{ ...overdue, clientName: "<script>alert(1)</script> & Co" }] }), TODAY);
    expect(d.html).not.toContain("<script>");
    expect(d.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; Co");
  });
});

describe("sendEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  const mail = { to: "ted@example.com", subject: "Hi", text: "Hello" };

  it("does nothing, and says why, when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await sendEmail(mail);
    expect(r).toMatchObject({ ok: false, notConfigured: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(emailConfigured()).toBe(false);
  });

  it("sends through Resend with the key and sender", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Versaly <reports@versaly.test>");
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "msg_1" }) });
    vi.stubGlobal("fetch", fetchSpy);
    const r = await sendEmail({ ...mail, html: "<p>Hello</p>" });
    expect(r).toEqual({ ok: true, id: "msg_1" });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body)).toMatchObject({ from: "Versaly <reports@versaly.test>", to: ["ted@example.com"], subject: "Hi" });
  });

  it("reports the provider's error message", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: "You can only send to your own email" }) }));
    expect(await sendEmail(mail)).toEqual({ ok: false, error: "You can only send to your own email" });
  });

  it("survives a network failure", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await sendEmail(mail)).toEqual({ ok: false, error: "Could not reach the email service." });
  });
});
