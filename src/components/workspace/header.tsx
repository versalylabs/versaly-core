"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, Menu, Sun, Moon, Clock } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { useTheme } from "@/context/theme-context";
import { OfflineStatusPill } from "./offline-banner";
import { HeaderInstallButton } from "./pwa-install";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileNav?: () => void;
}

export function Header({ onOpenCommandPalette, onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  function getBreadcrumbTitle(path: string) {
    if (path === "/dashboard") return "Company Dashboard";
    if (path === "/workspace") return "My Executive Workspace";
    if (path === "/calendar") return "Business Calendar";
    if (path === "/activity") return "Universal Activity Timeline";
    if (path === "/communications") return "Omnichannel Communications";
    if (path === "/people") return "People & Stakeholder Network";
    if (path === "/support") return "Customer Support & SLA Tracking";
    if (path === "/reports") return "Executive Insights & Reports";
    if (path === "/attention") return "Attention Center & AI Approvals";
    if (path === "/directory") return "Directory & Organizations";
    if (path === "/products") return "Products & Offers";
    if (path === "/leads") return "Leads & Sales Pipeline";
    if (path === "/clients") return "Clients & Renewals";
    if (path === "/projects") return "Projects & Onboarding";
    if (path === "/tasks") return "Tasks & Daily Outreach";
    if (path === "/notes") return "Executive Notes & Scratchpad";
    if (path === "/documents") return "Documents & Sales Sheets";
    if (path === "/finance") return "Finance Dashboard";
    if (path === "/finance/invoices") return "Invoices & Billing";
    if (path === "/finance/payments") return "Payments & Income";
    if (path === "/finance/expenses") return "Expenses & Payables";
    if (path === "/finance/budgets") return "Budgets & Financial Planning";
    if (path === "/finance/subscriptions") return "Vendor Subscriptions";
    if (path === "/finance/capital") return "Capital & Shareholder Loans";
    if (path === "/finance/equity") return "Ownership & Equity Register";
    if (path === "/finance/reserves") return "Cash Reserves & Savings";
    if (path === "/finance/compensation") return "Compensation & Commissions";
    if (path === "/finance/revenue") return "Revenue & Client Subscriptions";
    if (path === "/finance/reports") return "Financial Reports & Accounting";
    if (path === "/knowledge") return "Knowledge Base & SOPs";
    if (path === "/assistant") return "AI Grounded Assistant";
    if (path === "/assistant/copilot") return "AI Supervised Co-Pilot";
    if (path === "/settings") return "Workspace Settings";
    if (path === "/settings/automations") return "Operational Automations";
    if (path === "/settings/integrations") return "Integrations & System Health";
    if (path === "/settings/audit") return "Audit Log & System Events";
    return "Workspace";
  }

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
      {/* Left Area: Mobile Menu Toggle + Breadcrumb & Path */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title="Open Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <span className="hidden md:inline text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">
          Versaly Core
        </span>
        <span className="hidden md:inline text-slate-700 shrink-0">/</span>
        <h1 className="text-sm font-bold text-slate-100 truncate whitespace-nowrap min-w-0">
          {getBreadcrumbTitle(pathname)}
        </h1>
      </div>

      {/* Center Command Bar Trigger */}
      <div className="flex-1 max-w-md mx-2 lg:mx-6 hidden md:block min-w-0">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition shadow-inner min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
            <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="truncate whitespace-nowrap block">
              <span className="hidden lg:inline">Search people, clients, activities, deals or SOPs...</span>
              <span className="lg:hidden">Search workspace...</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1 font-mono text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 shrink-0 ml-2">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 relative shrink-0">
        <button
          onClick={onOpenCommandPalette}
          className="inline-flex md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 shrink-0 cursor-pointer"
          title="Search (Ctrl + K)"
        >
          <Search className="h-4 w-4" />
        </button>

        <Link
          href="/workspace"
          className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition shrink-0"
        >
          <span>My Cockpit</span>
        </Link>

        <button
          onClick={onOpenCommandPalette}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition shrink-0 cursor-pointer"
          title="Quick Action"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Quick Action</span>
        </button>

        <div className="h-4 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Light/Dark Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition shrink-0 cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition shrink-0 cursor-pointer"
            title="Notifications & Attention"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <HeaderInstallButton />

        <OfflineStatusPill />

        <Link
          href="/calendar"
          title="Current local time • Click to view Business Calendar"
          className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white text-xs font-mono transition shadow-inner shrink-0"
        >
          <Clock className="h-3.5 w-3.5 text-indigo-400" />
          <span>{currentTime || "--:--:--"}</span>
        </Link>
      </div>
    </header>
  );
}
