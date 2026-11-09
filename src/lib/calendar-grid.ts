/**
 * The month grid for the calendar page, built from plain ISO dates ("2026-11")
 * so it never depends on the device's timezone. Weeks start on Sunday.
 */

import { addDaysIso, addMonthsIso } from "@/lib/money";

export interface CalendarDay {
  dayNumber: number;
  dateStr: string;
  /** False for the greyed-out days of the neighbouring months. */
  isCurrentMonth: boolean;
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Whole weeks covering the month, e.g. "2026-11" → 35 cells from Sun 1 Nov to Sat 5 Dec. */
export function buildMonthGrid(month: string): CalendarDay[] {
  const first = `${month}-01`;
  const [year, monthNumber] = month.split("-").map(Number);
  const leading = new Date(`${first}T00:00:00Z`).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cells = Math.ceil((leading + daysInMonth) / 7) * 7;
  const start = addDaysIso(first, -leading);

  return Array.from({ length: cells }, (_, i) => {
    const dateStr = addDaysIso(start, i);
    return { dayNumber: Number(dateStr.slice(8, 10)), dateStr, isCurrentMonth: dateStr.startsWith(month) };
  });
}

/** "2026-11" → "November 2026". */
export function monthTitle(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Move a month forward or back: ("2026-12", 1) → "2027-01". */
export function shiftMonth(month: string, delta: number): string {
  return addMonthsIso(`${month}-01`, delta).slice(0, 7);
}

/** 0 = Sunday … 6 = Saturday for an ISO date. */
export const weekdayIndex = (iso: string): number => new Date(`${iso}T00:00:00Z`).getUTCDay();
