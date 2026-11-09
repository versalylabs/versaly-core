/**
 * Small helpers for ids, dates and codes used when a record is created.
 * Kept in one place so pages don't call Date.now()/Math.random() inline, and
 * so the behaviour is consistent everywhere.
 */

import { addDaysIso, nairobiDay } from "@/lib/money";

export const nowMs = (): number => Date.now();

export const currentYear = (): number => Number(nairobiDay().slice(0, 4));

/** "inv-1762600000000": a unique-enough id for a record created in the browser. */
export const newId = (prefix: string): string => `${prefix}-${Date.now()}`;

/** Today in Nairobi as "2026-11-09". */
export const todayIsoDate = (): string => nairobiDay();

/** A date `days` from now (negative for the past), as "2026-11-16". */
export const isoDaysFromNow = (days: number): string => addDaysIso(nairobiDay(), days);

/** A short random upper-case code such as "K3F9Q2LM". */
export const randomCode = (length = 8): string => Math.random().toString(36).substring(2, 2 + length).toUpperCase().padEnd(length, "0");
