"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronDown,
  Layers,
  Sparkles,
  FileCheck2,
  StickyNote,
  X,
  Clock,
  Inbox,
  UserCheck,
  LifeBuoy,
  BarChart3,
  User,
  ShieldAlert,
  Cpu,
  Megaphone,
  Flame,
  DollarSign,
  Share2,
  Palette,
  TrendingUp,
  LogOut,
  Wallet,
  Receipt,
  ArrowDownLeft,
  TrendingDown,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavCategory {
  name: string;
  items: NavItem[];
}

const CATEGORIES: NavCategory[] = [
  {
    name: "OPERATIONS",
    items: [
      { title: "Company Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "My Workspace", href: "/workspace", icon: User },
      { title: "Daily Tasks & Outreach", href: "/tasks", icon: CheckSquare },
      { title: "Business Calendar", href: "/calendar", icon: Clock },
      { title: "Activity Timeline", href: "/activity", icon: Clock },
    ],
  },
  {
    name: "RELATIONSHIPS",
    items: [
      { title: "Leads & Pipeline", href: "/leads", icon: Target },
      { title: "Clients & Renewals", href: "/clients", icon: Users },
      { title: "People & Network", href: "/people", icon: UserCheck },
      { title: "Directory (Orgs)", href: "/directory", icon: Building2 },
      { title: "Omnichannel Inbox", href: "/communications", icon: Inbox },
    ],
  },
  {
    name: "MARKETING",
    items: [
      { title: "Marketing Dashboard", href: "/marketing", icon: Megaphone },
      { title: "Campaigns", href: "/marketing/campaigns", icon: Flame },
      { title: "Ad Spend", href: "/marketing/spend", icon: DollarSign },
      { title: "Content & Social", href: "/marketing/content", icon: Share2 },
      { title: "Creative & Assets", href: "/marketing/creatives", icon: Palette },
      { title: "Marketing Reports", href: "/marketing/reports", icon: TrendingUp },
    ],
  },
  {
    name: "DELIVERY",
    items: [
      { title: "Projects & Onboarding", href: "/projects", icon: FolderGit2 },
      { title: "Products & Offers", href: "/products", icon: Package },
      { title: "Support & Issues", href: "/support", icon: LifeBuoy },
    ],
  },
  {
    name: "KNOWLEDGE",
    items: [
      { title: "Documents & Templates", href: "/documents", icon: FileText },
      { title: "Knowledge Base & SOPs", href: "/knowledge", icon: BookOpen },
      { title: "Notes & Scratchpad", href: "/notes", icon: StickyNote },
    ],
  },
  {
    name: "MONEY",
    items: [
      { title: "Finance Dashboard", href: "/finance", icon: Wallet },
      { title: "Invoices", href: "/finance/invoices", icon: Receipt },
      { title: "Payments & Receivables", href: "/finance/payments", icon: ArrowDownLeft },
      { title: "Expenses", href: "/finance/expenses", icon: TrendingDown },
      { title: "Revenue & Subscriptions", href: "/finance/revenue", icon: TrendingUp },
      { title: "Financial Reports", href: "/finance/reports", icon: BarChart3 },
    ],
  },
  {
    name: "INTELLIGENCE",
    items: [
      { title: "AI Grounded Assistant", href: "/assistant", icon: Sparkles },
      { title: "AI Supervised Co-Pilot", href: "/assistant/copilot", icon: FileCheck2 },
      { title: "Insights & Reports", href: "/reports", icon: BarChart3 },
      { title: "Attention & Approvals", href: "/attention", icon: ShieldAlert },
    ],
  },
  {
    name: "SYSTEM",
    items: [
      { title: "Workspace Settings", href: "/settings", icon: Settings },
      { title: "Automations & Rules", href: "/settings/automations", icon: Sparkles },
      { title: "Integrations & Health", href: "/settings/integrations", icon: Cpu },
      { title: "Audit Log & Events", href: "/settings/audit", icon: ShieldCheck },
    ],
  },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Collapsible category state, all open by default
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("versaly_auth_active");
      localStorage.removeItem("versaly_current_user");
    }
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-64 border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/90 backdrop-blur-md flex flex-col shrink-0 transition-transform duration-300 ease-in-out selection:bg-indigo-500 selection:text-white ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
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
              <p className="text-[11px] text-slate-500">The operating system for Versaly</p>
            </div>
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              title="Close Navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
          {CATEGORIES.map((category) => {
            const isCollapsed = collapsedCategories[category.name];
            const hasActiveChild = category.items.some(
              (item) => pathname === item.href || (item.href !== "/dashboard" && item.href !== "/settings" && pathname.startsWith(item.href))
            );

            return (
              <div key={category.name} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition rounded"
                >
                  <span className={hasActiveChild ? "text-indigo-400 font-extrabold" : ""}>
                    {category.name}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-slate-600" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 animate-in fade-in duration-150">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && item.href !== "/settings" && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                            isActive
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-950/50"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                              }`}
                            />
                            <span className="truncate">{item.title}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Profile Badge & Logout */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0">
                V
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">versalylabs@gmail.com</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Role: OWNER</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer shrink-0"
              title="Sign out of Versaly Core"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
