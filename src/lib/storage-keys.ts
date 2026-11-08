/**
 * Where each business collection lives in the synced workspace store.
 * A plain module (no React, no browser APIs) so both the app and server routes
 * (e.g. the weekly review email) can use the same names.
 */
export const KEYS = {
  invoices: "versaly_finance_invoices_v2",
  subscriptions: "versaly_finance_subscriptions_v2",
  expenses: "versaly_finance_expenses_v2",
  accounts: "versaly_finance_accounts_v2",
  vendorSubscriptions: "versaly_finance_vendor_subs_v2",
  deals: "versaly_active_deals_v2",
  projects: "versaly_projects_list_v2",
  clients: "versaly_clients_list_v2",
} as const;
