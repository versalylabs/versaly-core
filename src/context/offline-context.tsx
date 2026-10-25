"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface OfflineContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOffline: boolean;
  toggleSimulatedOffline: () => void;
  lastLocalSaveTime: Date | null;
  recordLocalSave: () => void;
  serviceWorkerRegistered: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSimulatedOffline: false,
  effectiveOffline: false,
  toggleSimulatedOffline: () => {},
  lastLocalSaveTime: null,
  recordLocalSave: () => {},
  serviceWorkerRegistered: false,
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [lastLocalSaveTime, setLastLocalSaveTime] = useState<Date | null>(null);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);

  // Initialize online status on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      // Check if user previously toggled simulated offline mode
      const savedOfflineMode = localStorage.getItem("versaly_simulate_offline");
      if (savedOfflineMode === "true") {
        setIsSimulatedOffline(true);
      }

      // Check last local save time
      const savedTime = localStorage.getItem("versaly_last_local_save");
      if (savedTime) {
        setLastLocalSaveTime(new Date(savedTime));
      } else {
        setLastLocalSaveTime(new Date());
      }
    }
  }, []);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Register Service Worker for offline PWA caching
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setServiceWorkerRegistered(true);
          // Check for worker updates
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  console.info("[Versaly Core] New offline cache version available.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[Versaly Core] Service Worker registration failed:", err);
        });
    }
  }, []);

  // Record a local action/save
  const recordLocalSave = useCallback(() => {
    const now = new Date();
    setLastLocalSaveTime(now);
    try {
      localStorage.setItem("versaly_last_local_save", now.toISOString());
    } catch {}
  }, []);

  // Listen to custom platform update events to track local saves
  useEffect(() => {
    const handleAnyUpdate = () => {
      recordLocalSave();
    };

    const events = [
      "versaly_tasks_updated",
      "versaly_calendar_updated",
      "versaly_projects_updated",
      "versaly_deals_updated",
      "versaly_leads_updated",
      "versaly_products_updated",
      "versaly_clients_updated",
      "versaly_finance_updated",
      "versaly_invoices_updated",
    ];

    events.forEach((ev) => window.addEventListener(ev, handleAnyUpdate));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleAnyUpdate));
    };
  }, [recordLocalSave]);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("versaly_simulate_offline", String(next));
      } catch {}
      return next;
    });
  }, []);

  const effectiveOffline = !isOnline || isSimulatedOffline;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        effectiveOffline,
        toggleSimulatedOffline,
        lastLocalSaveTime,
        recordLocalSave,
        serviceWorkerRegistered,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
