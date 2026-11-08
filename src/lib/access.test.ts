import { describe, expect, it } from "vitest";
import {
  assignableRoles,
  canManageUser,
  canReadKey,
  canViewPage,
  canWriteKey,
  dataDomain,
  permissionForPage,
  validatePassword,
} from "./access";

describe("dataDomain", () => {
  it("sorts collections into areas", () => {
    expect(dataDomain("versaly_finance_invoices_v2")).toBe("finance");
    expect(dataDomain("versaly_finance_compensation_v2")).toBe("finance");
    expect(dataDomain("versaly_payment_settings")).toBe("finance");
    expect(dataDomain("versaly_active_deals_v2")).toBe("crm");
    expect(dataDomain("versaly_clients_list_v2")).toBe("crm");
    expect(dataDomain("versaly_projects_list_v2")).toBe("projects");
    expect(dataDomain("versaly_daily_tasks")).toBe("projects");
    expect(dataDomain("versaly_random_notes_list_v2")).toBe("general");
    expect(dataDomain("versaly_something_new")).toBe("general");
  });
});

describe("who can read and write which data", () => {
  const finance = "versaly_finance_invoices_v2";
  const deals = "versaly_active_deals_v2";
  const notes = "versaly_random_notes_list_v2";

  it("owners and admins can do everything", () => {
    for (const role of ["OWNER", "ADMIN"] as const) {
      for (const key of [finance, deals, notes]) {
        expect(canReadKey(role, key)).toBe(true);
        expect(canWriteKey(role, key)).toBe(true);
      }
    }
  });
  it("managers can read finance but not change it", () => {
    expect(canReadKey("MANAGER", finance)).toBe(true);
    expect(canWriteKey("MANAGER", finance)).toBe(false);
    expect(canWriteKey("MANAGER", deals)).toBe(true);
  });
  it("staff never see finance data, but work on deals, projects and notes", () => {
    expect(canReadKey("STAFF", finance)).toBe(false);
    expect(canWriteKey("STAFF", finance)).toBe(false);
    expect(canReadKey("STAFF", "versaly_payment_settings")).toBe(false);
    expect(canWriteKey("STAFF", deals)).toBe(true);
    expect(canWriteKey("STAFF", "versaly_projects_list_v2")).toBe(true);
    expect(canWriteKey("STAFF", notes)).toBe(true);
  });
  it("read-only accounts can look at their areas but change nothing", () => {
    expect(canReadKey("READ_ONLY", deals)).toBe(true);
    expect(canReadKey("READ_ONLY", notes)).toBe(true);
    expect(canReadKey("READ_ONLY", finance)).toBe(false);
    for (const key of [finance, deals, notes, "versaly_projects_list_v2"]) {
      expect(canWriteKey("READ_ONLY", key)).toBe(false);
    }
  });
});

describe("pages", () => {
  it("keeps finance pages for roles that can read finance", () => {
    expect(permissionForPage("/finance")).toBe("finance:read");
    expect(permissionForPage("/finance/forecast")).toBe("finance:read");
    expect(canViewPage("MANAGER", "/finance/invoices")).toBe(true);
    expect(canViewPage("STAFF", "/finance/invoices")).toBe(false);
    expect(canViewPage("READ_ONLY", "/finance")).toBe(false);
  });
  it("keeps team, audit and company settings for owners and admins", () => {
    for (const path of ["/settings", "/settings/team", "/settings/audit"]) {
      expect(canViewPage("OWNER", path)).toBe(true);
      expect(canViewPage("ADMIN", path)).toBe(true);
      expect(canViewPage("MANAGER", path)).toBe(false);
      expect(canViewPage("STAFF", path)).toBe(false);
    }
  });
  it("leaves other pages open, including look-alike paths", () => {
    expect(permissionForPage("/dashboard")).toBeNull();
    expect(permissionForPage("/leads")).toBeNull();
    expect(canViewPage("STAFF", "/settings/integrations")).toBe(true);
    expect(permissionForPage("/financeish")).toBeNull();
    expect(canViewPage("STAFF", "/change-password")).toBe(true);
  });
});

describe("managing the team", () => {
  const owner = { id: "owner", role: "OWNER" as const };
  const admin = { id: "admin", role: "ADMIN" as const };
  const admin2 = { id: "admin2", role: "ADMIN" as const };
  const manager = { id: "mgr", role: "MANAGER" as const };
  const staff = { id: "staff", role: "STAFF" as const };

  it("only owners and admins can manage anyone", () => {
    expect(canManageUser(manager, staff, { kind: "role", to: "READ_ONLY" }).ok).toBe(false);
    expect(canManageUser(staff, null, { kind: "create", role: "STAFF" }).ok).toBe(false);
  });
  it("lets the owner create admins; admins cannot", () => {
    expect(assignableRoles(owner)).toEqual(["ADMIN", "MANAGER", "STAFF", "READ_ONLY"]);
    expect(assignableRoles(admin)).toEqual(["MANAGER", "STAFF", "READ_ONLY"]);
    expect(canManageUser(owner, null, { kind: "create", role: "ADMIN" }).ok).toBe(true);
    expect(canManageUser(admin, null, { kind: "create", role: "ADMIN" })).toMatchObject({ ok: false });
    expect(canManageUser(admin, null, { kind: "create", role: "STAFF" }).ok).toBe(true);
  });
  it("never creates or promotes anyone to owner", () => {
    expect(canManageUser(owner, null, { kind: "create", role: "OWNER" })).toMatchObject({ ok: false, reason: "There can only be one owner." });
    expect(canManageUser(owner, staff, { kind: "role", to: "OWNER" })).toMatchObject({ ok: false });
  });
  it("stops people changing themselves", () => {
    expect(canManageUser(admin, admin, { kind: "role", to: "STAFF" })).toMatchObject({ ok: false });
    expect(canManageUser(admin, admin, { kind: "status", to: "SUSPENDED" })).toMatchObject({ ok: false });
    expect(canManageUser(admin, admin, { kind: "resetPassword" })).toMatchObject({ ok: false });
  });
  it("protects the owner and, from other admins, each admin", () => {
    expect(canManageUser(admin, owner, { kind: "status", to: "SUSPENDED" })).toMatchObject({ ok: false });
    expect(canManageUser(owner, owner, { kind: "role", to: "ADMIN" })).toMatchObject({ ok: false });
    expect(canManageUser(admin, admin2, { kind: "status", to: "SUSPENDED" })).toMatchObject({ ok: false });
    expect(canManageUser(owner, admin2, { kind: "status", to: "SUSPENDED" }).ok).toBe(true);
  });
  it("lets admins manage everyone below them", () => {
    expect(canManageUser(admin, staff, { kind: "role", to: "MANAGER" }).ok).toBe(true);
    expect(canManageUser(admin, staff, { kind: "status", to: "SUSPENDED" }).ok).toBe(true);
    expect(canManageUser(admin, manager, { kind: "resetPassword" }).ok).toBe(true);
    expect(canManageUser(admin, staff, { kind: "role", to: "ADMIN" })).toMatchObject({ ok: false });
  });
  it("reports a missing person", () => {
    expect(canManageUser(owner, null, { kind: "status", to: "SUSPENDED" })).toMatchObject({ ok: false, reason: "That person was not found." });
  });
});

describe("validatePassword", () => {
  it("accepts a long, varied password", () => {
    expect(validatePassword("river-Lantern-47-quiet", "ted@versaly.co.ke")).toBeNull();
  });
  it("rejects short, repetitive, common and email-based passwords", () => {
    expect(validatePassword("Short1!")).toMatch(/at least 12/);
    expect(validatePassword("aaaaaaaaaaaaaaaa")).toMatch(/wider mix/);
    expect(validatePassword("MyPassword12345")).toMatch(/easy to guess/);
    expect(validatePassword("versaly-team-2026")).toMatch(/easy to guess/);
    expect(validatePassword("ted.khalwale-2026-xyz", "ted.khalwale@versaly.co.ke")).toMatch(/email name/);
  });
  it("is not fooled by letter case", () => {
    expect(validatePassword("PASSWORD-is-fine-1")).toMatch(/easy to guess/);
  });
});
