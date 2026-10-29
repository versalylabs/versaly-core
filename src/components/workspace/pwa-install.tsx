"use client";

import React from "react";
import Image from "next/image";
import {
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { usePWA } from "@/context/pwa-context";

/**
 * Interactive Guide Modal for iOS Safari users & manual installs
 */
export function IOSInstallModal() {
  const { showIOSModal, setShowIOSModal, platform } = usePWA();

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setShowIOSModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-600/30 shrink-0 flex items-center justify-center">
            <Image
              src="/icons/icon-192.png"
              alt="Versaly Core"
              width={44}
              height={44}
              className="rounded-[10px]"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Install Versaly Core
              <span className="text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                {platform === "ios" ? "iOS Safari" : "Native App"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Install on your home screen or dock for instant offline access.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 pt-1">
          {platform === "ios" ? (
            <>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
                  <Share className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-200">1. Tap the Share button</span>
                  <p className="text-slate-400">
                    In Safari&apos;s bottom bar (or top right on iPad), tap the{" "}
                    <span className="text-indigo-300 font-medium">Share</span> icon.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
                  <PlusSquare className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-200">2. Select &quot;Add to Home Screen&quot;</span>
                  <p className="text-slate-400">
                    Scroll down through the share sheet and tap{" "}
                    <span className="text-indigo-300 font-medium">&quot;Add to Home Screen&quot;</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-200">3. Tap &quot;Add&quot;</span>
                  <p className="text-slate-400">
                    Confirm in the top right corner. Versaly Core will be installed as a full-screen app!
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-200">Desktop Browser Installation</span>
                  <p className="text-slate-400">
                    Look for the <span className="text-indigo-300 font-medium">Install app</span> icon in your browser&apos;s address bar (Chrome, Edge, Brave), or choose &quot;Install Versaly Core&quot; from the browser menu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-slate-200">Desktop & Mobile Standalone</span>
                  <p className="text-slate-400">
                    Once installed, Versaly Core launches without browser address bars, supports full offline navigation, and integrates with your OS window manager.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setShowIOSModal(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Smart floating install banner on mobile / tablet / desktop
 */
export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isDismissedBanner, promptToInstall, dismissBanner, platform } =
    usePWA();

  if (isInstalled || isDismissedBanner || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/30 backdrop-blur-md shadow-2xl shadow-indigo-950/80 text-slate-100 flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md shadow-indigo-600/30 shrink-0 flex items-center justify-center">
          <Image
            src="/icons/icon-192.png"
            alt="Versaly Core"
            width={36}
            height={36}
            className="rounded-[8px]"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-white truncate">Install Versaly Core</h4>
            <span className="text-[10px] font-semibold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1 rounded shrink-0">
              {platform === "desktop" ? "Desktop App" : "Phone App"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            Run natively with instant offline access and home screen launch.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => promptToInstall()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install Now</span>
            </button>
            <button
              onClick={dismissBanner}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <button
          onClick={dismissBanner}
          className="text-slate-500 hover:text-slate-300 p-1 -mr-1 -mt-1 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Install Button for the Left Navigation Sidebar
 */
export function SidebarInstallButton() {
  const { isInstalled, isInstallable, promptToInstall, platform } = usePWA();

  if (isInstalled) {
    return (
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800/50 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-medium text-slate-300">App Installed</span>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Native
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => promptToInstall()}
      type="button"
      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/50 border border-indigo-500/20 hover:border-indigo-500/40 text-slate-200 hover:text-white transition group shadow-sm cursor-pointer"
      title="Install Versaly Core on phone or desktop"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="h-6 w-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
          <Download className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 text-left">
          <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
            Install App
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            {platform === "desktop" ? (
              <>
                <Monitor className="h-2.5 w-2.5" />
                <span>Desktop & Phone</span>
              </>
            ) : (
              <>
                <Smartphone className="h-2.5 w-2.5" />
                <span>Phone & Desktop</span>
              </>
            )}
          </div>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
    </button>
  );
}

/**
 * Header Quick Install Pill
 */
export function HeaderInstallButton() {
  const { isInstalled, promptToInstall } = usePWA();

  if (isInstalled) return null;

  return (
    <button
      onClick={() => promptToInstall()}
      type="button"
      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition shrink-0 cursor-pointer"
      title="Install Versaly Core to your phone or desktop"
    >
      <Download className="h-3.5 w-3.5 text-indigo-400" />
      <span className="hidden xl:inline">Install App</span>
    </button>
  );
}
