"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  Target,
  Users,
  FolderGit2,
  CheckSquare,
  FileText,
  CreditCard,
  BookOpen,
  Settings,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  FileCheck2,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning";
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Company Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Directory (Orgs & People)",
    href: "/directory",
    icon: Building2,
    badge: "12",
  },
  {
    title: "Products & Offers",
    href: "/products",
    icon: Package,
    badge: "5",
  },
  {
    title: "Leads & Pipeline",
    href: "/leads",
    icon: Target,
    badge: "51",
  },
  {
    title: "Clients & Renewals",
    href: "/clients",
    icon: Users,
    badge: "34",
  },
  {
    title: "Projects & Onboarding",
    href: "/projects",
    icon: FolderGit2,
    badge: "6 active",
    badgeVariant: "warning",
  },
  {
    title: "Daily Tasks & Outreach",
    href: "/tasks",
    icon: CheckSquare,
    badge: "9 due",
    badgeVariant: "warning",
  },
  {
    title: "Documents & Templates",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Finance & Invoicing",
    href: "/finance",
    icon: CreditCard,
  },
  {
    title: "Knowledge Base & SOPs",
    href: "/knowledge",
    icon: BookOpen,
  },
  {
    title: "AI Grounded Assistant",
    href: "/assistant",
    icon: Sparkles,
    badge: "RAG",
    badgeVariant: "success",
  },
  {
    title: "AI Supervised Co-Pilot",
    href: "/assistant/copilot",
    icon: FileCheck2,
    badge: "Action",
    badgeVariant: "warning",
  },
];

const SECONDARY_ITEMS: NavItem[] = [
  {
    title: "Automations & Rules",
    href: "/settings/automations",
    icon: Sparkles,
  },
  {
    title: "Workspace Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Audit Log & Events",
    href: "/settings/audit",
    icon: ShieldCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 selection:bg-indigo-500 selection:text-white">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Versaly Core
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Single Source of Truth</p>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Operations Hub
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.badgeVariant === "warning"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation & Profile Badge */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        <div className="space-y-1">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span>{item.title}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              </Link>
            );
          })}
        </div>

        {/* User Role Card */}
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              V
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Versaly Admin</div>
              <div className="text-[10px] text-emerald-400 font-medium">Role: OWNER</div>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
        </div>
      </div>
    </aside>
  );
}
