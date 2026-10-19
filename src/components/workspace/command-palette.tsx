"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Package,
  Target,
  Users,
  FolderGit2,
  CheckSquare,
  FileText,
  CreditCard,
  BookOpen,
  Settings,
  Plus,
  Clock,
  ArrowRight,
  Flame,
  X,
} from "lucide-react";
import { VERSALY_PRODUCTS } from "@/data/products-catalog";

interface CommandItem {
  id: string;
  category: "Navigation" | "Products" | "Quick Actions" | "Review Mode";
  title: string;
  subtitle?: string;
  href?: string;
  icon: typeof Search;
  action?: () => void;
  badge?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const baseCommands: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = [
      { id: "nav-dash", category: "Navigation", title: "Company Dashboard", subtitle: "Daily operating rhythm & scorecard", href: "/dashboard", icon: LayoutDashboard },
      { id: "nav-prod", category: "Navigation", title: "Products & Pricing", subtitle: "All 5 core offerings", href: "/products", icon: Package },
      { id: "nav-leads", category: "Navigation", title: "Leads & Sales Pipeline", subtitle: "Raw pool and contacted deals", href: "/leads", icon: Target },
      { id: "nav-clients", category: "Navigation", title: "Clients & Renewals", subtitle: "Active subscriptions & contracts", href: "/clients", icon: Users },
      { id: "nav-proj", category: "Navigation", title: "Projects & Onboarding", subtitle: "Implementation tasks & blockers", href: "/projects", icon: FolderGit2 },
      { id: "nav-tasks", category: "Navigation", title: "Daily Tasks & Outreach", subtitle: "Calls, WhatsApp, visits", href: "/tasks", icon: CheckSquare },
      { id: "nav-docs", category: "Navigation", title: "Documents & Sales Sheets", subtitle: "1-pagers, proposals, KRA/eTIMS", href: "/documents", icon: FileText },
      { id: "nav-finance", category: "Navigation", title: "Finance & Invoices", subtitle: "M-Pesa reconciliation & MRR", href: "/finance", icon: CreditCard },
      { id: "nav-sop", category: "Navigation", title: "Knowledge Base & SOPs", subtitle: "Institutional playbooks & FAQs", href: "/knowledge", icon: BookOpen },
      { id: "nav-settings", category: "Navigation", title: "Workspace Settings", subtitle: "Team, roles, company profile", href: "/settings", icon: Settings },
    ];

    const products: CommandItem[] = VERSALY_PRODUCTS.map((prod) => ({
      id: `prod-${prod.slug}`,
      category: "Products",
      title: prod.name,
      subtitle: `${prod.tagline} • KES ${prod.monthlyFee.toLocaleString()}/mo`,
      href: `/products#${prod.slug}`,
      icon: Package,
      badge: prod.category,
    }));

    const actions: CommandItem[] = [
      {
        id: "act-lead",
        category: "Quick Actions",
        title: "Log New Outreach Action",
        subtitle: "Record call, WhatsApp, or walk-in visit to a prospect",
        icon: Plus,
        action: () => {
          router.push("/tasks?action=new-outreach");
          onClose();
        },
      },
      {
        id: "act-demo",
        category: "Quick Actions",
        title: "Schedule Product Demo",
        subtitle: "Book a 10-minute live demonstration for Adversoft, Vehisoft, etc.",
        icon: Clock,
        action: () => {
          router.push("/leads?action=book-demo");
          onClose();
        },
      },
      {
        id: "act-friday",
        category: "Review Mode",
        title: "Launch Friday 20-Minute Review",
        subtitle: "Review pipeline conversion, clear blockers, and set weekly priorities",
        icon: Flame,
        action: () => {
          router.push("/dashboard?mode=friday-review");
          onClose();
        },
        badge: "Weekly Rhythms",
      },
    ];

    return [...actions, ...products, ...nav];
  }, [router, onClose]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return baseCommands;
    const q = query.toLowerCase();
    return baseCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [baseCommands, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="h-5 w-5 text-indigo-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, products, leads, or actions... (Esc to close)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="h-6 w-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or entities found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    if (cmd.action) {
                      cmd.action();
                    } else if (cmd.href) {
                      router.push(cmd.href);
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-indigo-600/10 hover:border-indigo-500/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-200 transition-colors">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })
          )}
        </div>

        {/* Command Bar Footer */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">ESC</kbd> to exit
          </div>
        </div>
      </div>
    </div>
  );
}
