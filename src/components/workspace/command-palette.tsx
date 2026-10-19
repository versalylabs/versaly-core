"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
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
  Plus,
  Clock,
  ArrowRight,
  Flame,
  X,
  Sparkles,
  StickyNote,
  Inbox,
  UserCheck,
  LifeBuoy,
  BarChart3,
  User,
  ShieldAlert,
  Cpu,
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
      { id: "nav-workspace", category: "Navigation", title: "My Executive Workspace", subtitle: "Personal tasks, projects, approvals & today's agenda", href: "/workspace", icon: User, badge: "Cockpit" },
      { id: "nav-calendar", category: "Navigation", title: "Business Calendar", subtitle: "Meetings, demos, renewals, deadlines & daily briefing", href: "/calendar", icon: Clock },
      { id: "nav-activity", category: "Navigation", title: "Activity Timeline", subtitle: "Universal business history across leads, clients, invoices", href: "/activity", icon: Clock, badge: "Live" },
      { id: "nav-comms", category: "Navigation", title: "Omnichannel Communications", subtitle: "Unified inbox for WhatsApp, email, calls, SMS & templates", href: "/communications", icon: Inbox },
      { id: "nav-people", category: "Navigation", title: "People & Network", subtitle: "First-class people entities & multi-org relationship graph", href: "/people", icon: UserCheck },
      { id: "nav-support", category: "Navigation", title: "Customer Support & SLA Tracking", subtitle: "Client issues, bugs, escalations & resolution SLAs", href: "/support", icon: LifeBuoy },
      { id: "nav-reports", category: "Navigation", title: "Executive Insights & Reports", subtitle: "Sales velocity, cohort retention, and debtor ageing analysis", href: "/reports", icon: BarChart3 },
      { id: "nav-attention", category: "Navigation", title: "Attention Center & AI Approvals", subtitle: "Human-in-the-loop oversight on AI proposals & critical alerts", href: "/attention", icon: ShieldAlert, badge: "Approvals" },
      { id: "nav-dir", category: "Navigation", title: "Directory (Organizations & People)", subtitle: "Clients, prospects, partners, and contacts", href: "/directory", icon: Building2 },
      { id: "nav-prod", category: "Navigation", title: "Products & Pricing", subtitle: "All 5 core offerings (Adversoft, Vehisoft, etc.)", href: "/products", icon: Package },
      { id: "nav-leads", category: "Navigation", title: "Leads & Sales Pipeline", subtitle: "Raw pool and contacted deals", href: "/leads", icon: Target },
      { id: "nav-clients", category: "Navigation", title: "Clients & Renewals", subtitle: "Active subscriptions & contracts", href: "/clients", icon: Users },
      { id: "nav-proj", category: "Navigation", title: "Projects & Onboarding", subtitle: "Implementation tasks & blockers", href: "/projects", icon: FolderGit2 },
      { id: "nav-tasks", category: "Navigation", title: "Daily Tasks & Outreach", subtitle: "Calls, WhatsApp, visits", href: "/tasks", icon: CheckSquare },
      { id: "nav-notes", category: "Navigation", title: "Executive Notes & Scratchpad", subtitle: "Quick thoughts, meeting logs, and project-linked notes", href: "/notes", icon: StickyNote },
      { id: "nav-docs", category: "Navigation", title: "Documents & Sales Sheets", subtitle: "1-pagers, proposals, KRA/eTIMS", href: "/documents", icon: FileText },
      { id: "nav-finance", category: "Navigation", title: "Finance & Invoices", subtitle: "M-Pesa reconciliation & MRR", href: "/finance", icon: CreditCard },
      { id: "nav-sop", category: "Navigation", title: "Knowledge Base & SOPs", subtitle: "Institutional playbooks & FAQs", href: "/knowledge", icon: BookOpen },
      { id: "nav-assistant", category: "Navigation", title: "AI Grounded Assistant", subtitle: "Query internal knowledge, blockers, and overdue balances", href: "/assistant", icon: Sparkles, badge: "RAG" },
      { id: "nav-copilot", category: "Navigation", title: "AI Supervised Co-Pilot", subtitle: "Inspect proposed mutations, drafts, and human approvals", href: "/assistant/copilot", icon: Sparkles, badge: "Actions" },
      { id: "nav-integrations", category: "Navigation", title: "Integrations & System Health", subtitle: "M-Pesa Paybill, eTIMS, WhatsApp Cloud API & DB latency", href: "/settings/integrations", icon: Cpu },
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
        id: "act-workspace",
        category: "Quick Actions",
        title: "Go to My Workspace Cockpit",
        subtitle: "See your assigned tasks, active projects, and morning agenda",
        icon: User,
        action: () => {
          router.push("/workspace");
          onClose();
        },
      },
      {
        id: "act-note",
        category: "Quick Actions",
        title: "Create Executive Note",
        subtitle: "Capture standalone idea, scratchpad, or tie to a project",
        icon: StickyNote,
        action: () => {
          router.push("/notes?action=new");
          onClose();
        },
      },
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
        id: "act-comms",
        category: "Quick Actions",
        title: "Dispatch WhatsApp / Email Template",
        subtitle: "Open communications hub to send cold or follow-up messages",
        icon: Inbox,
        action: () => {
          router.push("/communications?tab=templates");
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
          router.push("/calendar");
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="liquid-glass w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/80 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, products, contacts (or type 'help')..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-slate-300 text-xs px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching commands found for &ldquo;{query}&rdquo;
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
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/80 transition group text-left"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40 group-hover:bg-indigo-600/10 transition">
                      <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white flex items-center gap-2">
                        <span>{cmd.title}</span>
                        {cmd.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-slate-500 truncate">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation & Actions</span>
            <span>•</span>
            <span>Versaly Core OS</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
