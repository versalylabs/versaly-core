/**
 * Small helpers for ids, dates and codes used when a record is created.
 * Kept in one place so pages don't call Date.now()/Math.random() inline, and
 * so the behaviour is consistent everywhere.
 */

export const nowMs = (): number => Date.now();

export const currentYear = (): number => new Date().getFullYear();

/** "inv-1762600000000": a unique-enough id for a record created in the browser. */
export const newId = (prefix: string): string => `${prefix}-${Date.now()}`;

/** Today as "2026-11-09". */
export const todayIsoDate = (): string => new Date().toISOString().split("T")[0];

/** A date `days` from now (negative for the past), as "2026-11-16". */
export const isoDaysFromNow = (days: number): string => new Date(Date.now() + days * 86_400_000).toISOString().split("T")[0];

/** A short random upper-case code such as "K3F9Q2LM". */
export const randomCode = (length = 8): string => Math.random().toString(36).substring(2, 2 + length).toUpperCase().padEnd(length, "0");
