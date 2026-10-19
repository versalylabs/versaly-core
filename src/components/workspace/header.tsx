"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Plus, Bell, Sparkles, Menu, Sun, Moon } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { useTheme } from "@/context/theme-context";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileNav?: () => void;
}

export function Header({ onOpenCommandPalette, onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  function getBreadcrumbTitle(path: string) {
    if (path === "/dashboard") return "Company Dashboard";
    if (path === "/products") return "Products & Pricing";
    if (path === "/leads") return "Leads & Sales Pipeline";
    if (path === "/clients") return "Clients & Renewals";
    if (path === "/projects") return "Projects & Implementations";
    if (path === "/tasks") return "Tasks & Daily Outreach";
    if (path === "/documents") return "Documents & Sales Sheets";
    if (path === "/finance") return "Finance & Invoicing";
    if (path === "/knowledge") return "Knowledge Base & SOPs";
    if (path === "/assistant") return "AI Grounded Assistant";
    if (path === "/assistant/copilot") return "AI Supervised Co-Pilot";
    if (path === "/settings") return "Workspace Settings";
    if (path === "/settings/automations") return "Operational Automations";
    if (path === "/settings/audit") return "Audit Log & System Events";
    return "Workspace";
  }

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Left Area: Mobile Menu Toggle + Breadcrumb & Path */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Open Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <span className="hidden sm:inline text-xs text-slate-500 font-medium">Versaly Core</span>
        <span className="hidden sm:inline text-slate-700">/</span>
        <h1 className="text-sm font-bold text-slate-100 truncate max-w-[150px] sm:max-w-xs">
          {getBreadcrumbTitle(pathname)}
        </h1>
      </div>

      {/* Center Command Bar Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Search products, leads, deals or SOPs...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={onOpenCommandPalette}
          className="inline-flex sm:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Quick Action</span>
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Light/Dark Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
          <Sparkles className="h-3 w-3" />
          <span>Core Hub Online</span>
        </div>
      </div>
    </header>
  );
}

