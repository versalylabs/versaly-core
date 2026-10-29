"use client";

import React, { useState, useEffect } from "react";
import { useOffline } from "@/context/offline-context";
import { Wifi, WifiOff, CheckCircle2, ShieldCheck, HardDrive, X, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const { effectiveOffline, isSimulatedOffline, toggleSimulatedOffline, lastLocalSaveTime } = useOffline();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const [previousOffline, setPreviousOffline] = useState(false);

  // Detect when connection transitions from offline to online
  useEffect(() => {
    if (previousOffline && !effectiveOffline) {
      setShowReconnectedToast(true);
      const timer = setTimeout(() => setShowReconnectedToast(false), 4000);
      return () => clearTimeout(timer);
    }
    setPreviousOffline(effectiveOffline);
  }, [effectiveOffline, previousOffline]);

  // Reset dismissed state when transitioning into offline
  useEffect(() => {
    if (effectiveOffline) {
      setDismissed(false);
    }
  }, [effectiveOffline]);

  return (
    <>
      {/* Offline Mode Sticky Alert Banner */}
      {effectiveOffline && !dismissed && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Offline Mode Active"
          className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 backdrop-blur z-50 animate-in slide-in-from-top-2 duration-300"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-bold text-amber-300">
                  {isSimulatedOffline ? "Offline Mode (Simulated)" : "Offline Mode Active"}
                </span>
                <span className="text-amber-400/80 hidden sm:inline">•</span>
                <span className="text-slate-300">
                  You can freely check off tasks, manage leads, update calendar, and review finances. All actions are saved locally on this device.
                </span>
                {lastLocalSaveTime && (
                  <span className="text-[10px] text-amber-400/90 font-mono hidden md:inline ml-1">
                    (Last saved: {lastLocalSaveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isSimulatedOffline && (
                <button
                  type="button"
                  onClick={toggleSimulatedOffline}
                  className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                >
                  Exit Test Mode
                </button>
              )}
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition"
                title="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Connection Restored Toast */}
      {showReconnectedToast && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Connection restored"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl shadow-emerald-950/50 backdrop-blur animate-in slide-in-from-bottom-2 duration-300"
        >
          <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-white font-bold">Connection Restored</div>
            <div className="text-[11px] text-emerald-300/80 font-normal">All your local changes are intact and up to date.</div>
          </div>
        </aside>
      )}
    </>
  );
}

/**
 * Compact Pill button rendered in Header
 */
export function OfflineStatusPill() {
  const { effectiveOffline, isSimulatedOffline, toggleSimulatedOffline, lastLocalSaveTime } = useOffline();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition border whitespace-nowrap shrink-0 ${
          effectiveOffline
            ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-500/50 shadow-sm shadow-amber-500/10"
            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:border-emerald-500/40"
        }`}
        title={effectiveOffline ? "Offline Mode: Working Locally" : "Online: Live System"}
      >
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${
            effectiveOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
          }`}
        />
        <span className="hidden sm:inline whitespace-nowrap">
          {effectiveOffline ? (isSimulatedOffline ? "Offline (Test)" : "Offline") : "Online"}
        </span>
      </button>

      {/* Quick Offline Controls Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-72 p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 text-xs text-slate-300 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {effectiveOffline ? (
                  <WifiOff className="h-4 w-4 text-amber-400" />
                ) : (
                  <Wifi className="h-4 w-4 text-emerald-400" />
                )}
                <span className="font-bold text-white text-xs">
                  {effectiveOffline ? "Offline Mode Active" : "Online — Live Sync"}
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  effectiveOffline
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {effectiveOffline ? "Local" : "Connected"}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Versaly Core stores tasks, leads, calendar events, and financial records locally in your browser storage so you can continue working without an internet connection.
            </p>

            <div className="space-y-1.5 text-[11px] p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 mb-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3 w-3 text-indigo-400" />
                  Local Storage:
                </span>
                <span className="text-emerald-400 font-semibold">Active &amp; Persisted</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-indigo-400" />
                  Offline Tasks:
                </span>
                <span className="text-slate-200 font-semibold">Available</span>
              </div>
              {lastLocalSaveTime && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Last Local Save:</span>
                  <span className="text-slate-300 font-mono">
                    {lastLocalSaveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                toggleSimulatedOffline();
                setShowMenu(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] transition"
            >
              <RefreshCw className="h-3 w-3" />
              <span>{isSimulatedOffline ? "Disable Simulated Offline" : "Test Offline Mode"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
