"use client";

import { useCallback, useState } from "react";
import { appStorage } from "@/lib/app-storage";
import { DEFAULT_PAYMENT_SETTINGS, PAYMENT_SETTINGS_KEY, type PaymentSettings } from "@/lib/invoice-messages";

export function loadPaymentSettings(): PaymentSettings {
  try {
    const raw = appStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fall through to defaults
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

export function savePaymentSettings(settings: PaymentSettings): void {
  appStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
}

export function hasPaymentMethod(s: PaymentSettings): boolean {
  return Boolean(s.paybillNumber || s.tillNumber || s.bankDetails);
}

/** Payment details, loaded once per mount and saved back to the synced workspace. */
export function usePaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(() => loadPaymentSettings());
  const update = useCallback((next: PaymentSettings) => {
    setSettings(next);
    savePaymentSettings(next);
  }, []);
  return [settings, update] as const;
}
