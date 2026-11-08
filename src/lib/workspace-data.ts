"use client";

import { appStorage } from "@/lib/app-storage";
import { KEYS } from "@/lib/storage-keys";
import {
  loadAccountsFromStorage,
  loadExpensesFromStorage,
  loadInvoicesFromStorage,
  loadOperationalSubscriptions,
  loadSubscriptionsFromStorage,
} from "@/lib/finance-store";
import type { WorkspaceData } from "@/lib/insights";

function readList<T>(key: string): T[] {
  try {
    const raw = appStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Everything the insights, forecast and assistant need, read from this browser's synced copy. */
export function loadWorkspaceData(): WorkspaceData {
  return {
    invoices: loadInvoicesFromStorage(),
    subscriptions: loadSubscriptionsFromStorage(),
    deals: readList(KEYS.deals),
    projects: readList(KEYS.projects),
    clients: readList(KEYS.clients),
    accounts: loadAccountsFromStorage(),
    vendorSubscriptions: loadOperationalSubscriptions(),
    expenses: loadExpensesFromStorage(),
  };
}
