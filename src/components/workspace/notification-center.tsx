"use client";

import { useState } from "react";
import Link from "next/link";
import { NOTIFICATIONS_SEED, NotificationSeed } from "@/data/automations-seed";
import {
  Bell,
  Clock,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationSeed[]>(NOTIFICATIONS_SEED);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Operational Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notification Items */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
        {notifications.map((notif) => {
          const priorityColor =
            notif.priority === "URGENT"
              ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
              : notif.priority === "HIGH"
              ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
              : notif.priority === "MEDIUM"
              ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
              : "text-slate-400 bg-slate-800/80 border-slate-700/60";

          return (
            <div
              key={notif.id}
              className={`p-3.5 transition-colors ${
                notif.isRead ? "bg-slate-900/40 opacity-75" : "bg-slate-900 hover:bg-slate-800/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${priorityColor}`}
                  >
                    {notif.priority}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {notif.timeAgo}
                  </span>
                </div>

                <button
                  onClick={() => toggleRead(notif.id)}
                  title={notif.isRead ? "Mark unread" : "Mark read"}
                  className="text-slate-500 hover:text-slate-300 transition"
                >
                  <Check className={`h-3 w-3 ${notif.isRead ? "text-emerald-400" : ""}`} />
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {notif.message}
              </p>

              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <Link
                  href={notif.linkUrl}
                  onClick={onClose}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  <span>Resolve in {notif.entityType}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
                <span className="text-[10px] font-mono text-slate-500">
                  {notif.entityType}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
        <Link
          href="/settings/automations"
          onClick={onClose}
          className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition"
        >
          Configure Automation Rules & Alert Channels →
        </Link>
      </div>
    </div>
  );
}
