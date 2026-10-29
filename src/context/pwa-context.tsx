"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type PlatformType = "desktop" | "android" | "ios" | "unknown";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: PlatformType;
  promptToInstall: () => Promise<boolean>;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
  isDismissedBanner: boolean;
  dismissBanner: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  platform: "unknown",
  promptToInstall: async () => false,
  showIOSModal: false,
  setShowIOSModal: () => {},
  isDismissedBanner: false,
  dismissBanner: () => {},
});

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("unknown");
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissedBanner, setIsDismissedBanner] = useState(true); // default true until hydrated

  // Detect platform & standalone mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone mode (running as installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari legacy property
      navigator.standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);

    if (isIOSDevice) {
      setPlatform("ios");
      // On iOS Safari, if not already installed, it's installable via manual Add to Home Screen
      if (!isStandalone) {
        setIsInstallable(true);
      }
    } else if (isAndroidDevice) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Check banner dismissal status
    const dismissed = localStorage.getItem("versaly_pwa_banner_dismissed");
    if (!dismissed && !isStandalone) {
      setIsDismissedBanner(false);
    }

    // Listen for display-mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
      if (e.matches) {
        setIsInstallable(false);
      }
    };
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    // Capture Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem("versaly_pwa_banner_dismissed", "true");
      setIsDismissedBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptToInstall = useCallback(async (): Promise<boolean> => {
    // If iOS Safari, show the iOS specific guide modal
    if (platform === "ios") {
      setShowIOSModal(true);
      return false;
    }

    // If native prompt is available (Chrome, Edge, Samsung Internet, Android)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return true;
        }
      } catch (err) {
        console.warn("[Versaly Core] PWA install error:", err);
      }
      return false;
    }

    // Fallback: If on desktop Safari or Firefox where beforeinstallprompt isn't emitted
    setShowIOSModal(true);
    return false;
  }, [deferredPrompt, platform]);

  const dismissBanner = useCallback(() => {
    setIsDismissedBanner(true);
    localStorage.setItem("versaly_pwa_banner_dismissed", "true");
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        platform,
        promptToInstall,
        showIOSModal,
        setShowIOSModal,
        isDismissedBanner,
        dismissBanner,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
