import { describe, expect, it } from "vitest";
import { buildMonthGrid, monthTitle, shiftMonth, weekdayIndex } from "@/lib/calendar-grid";
import { longDate, nairobiDay } from "@/lib/money";

describe("buildMonthGrid", () => {
  it("covers whole Sunday-to-Saturday weeks", () => {
    for (const month of ["2026-02", "2026-03", "2026-10", "2026-11", "2026-12", "2028-02"]) {
      const grid = buildMonthGrid(month);
      expect(grid.length % 7).toBe(0);
      expect(weekdayIndex(grid[0].dateStr)).toBe(0);
      expect(weekdayIndex(grid[grid.length - 1].dateStr)).toBe(6);
    }
  });
  it("matches the real October 2026 (starts Thursday 1 Oct, so the grid starts Sunday 27 Sep)", () => {
    const grid = buildMonthGrid("2026-10");
    expect(grid).toHaveLength(35);
    expect(grid[0]).toEqual({ dayNumber: 27, dateStr: "2026-09-27", isCurrentMonth: false });
    expect(grid[4]).toEqual({ dayNumber: 1, dateStr: "2026-10-01", isCurrentMonth: true });
    expect(grid[34]).toEqual({ dayNumber: 31, dateStr: "2026-10-31", isCurrentMonth: true });
  });
  it("handles November 2026, which starts on a Sunday", () => {
    const grid = buildMonthGrid("2026-11");
    expect(grid[0]).toEqual({ dayNumber: 1, dateStr: "2026-11-01", isCurrentMonth: true });
    expect(grid.filter((d) => d.isCurrentMonth)).toHaveLength(30);
    expect(grid).toHaveLength(35);
  });
  it("uses exactly four weeks for a February that fits", () => {
    expect(buildMonthGrid("2026-02")).toHaveLength(28);
  });
  it("needs six weeks when a long month starts late in the week", () => {
    expect(buildMonthGrid("2026-08")).toHaveLength(42); // 1 Aug 2026 is a Saturday, 31 days
  });
  it("counts leap-year February correctly", () => {
    expect(buildMonthGrid("2028-02").filter((d) => d.isCurrentMonth)).toHaveLength(29);
  });
});

describe("month helpers", () => {
  it("titles and shifts months across year ends", () => {
    expect(monthTitle("2026-11")).toBe("November 2026");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-03", 0)).toBe("2026-03");
  });
});

describe("Nairobi time", () => {
  it("rolls the day over at midnight in Kenya (21:00 UTC), not at midnight UTC", () => {
    expect(nairobiDay(new Date("2026-11-08T20:59:59Z"))).toBe("2026-11-08");
    expect(nairobiDay(new Date("2026-11-08T21:00:00Z"))).toBe("2026-11-09");
    expect(nairobiDay(new Date("2026-11-08T23:30:00Z"))).toBe("2026-11-09");
  });
  it("crosses a year end correctly", () => {
    expect(nairobiDay(new Date("2026-12-31T21:30:00Z"))).toBe("2027-01-01");
    expect(nairobiDay(new Date("2026-12-31T20:30:00Z"))).toBe("2026-12-31");
  });
  it("doesn't depend on the computer's timezone", () => {
    const original = process.env.TZ;
    for (const tz of ["UTC", "America/Los_Angeles", "Asia/Tokyo", "Africa/Nairobi"]) {
      process.env.TZ = tz;
      expect(nairobiDay(new Date("2026-11-08T22:00:00Z"))).toBe("2026-11-09");
    }
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  });
  it("writes dates in full", () => {
    expect(longDate("2026-11-09")).toBe("Monday, 9 November 2026");
  });
});
