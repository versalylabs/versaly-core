"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  LifeBuoy,
  CheckCircle2,
  Search,
  Plus,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { INITIAL_SUPPORT_TICKETS, SupportTicket } from "@/data/support-seed";

const STORAGE_KEY = "versaly_support_tickets_list_v2";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_SUPPORT_TICKETS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form State
  const [formClientName, setFormClientName] = useState("");
  const [formProduct, setFormProduct] = useState("Vehisoft");
  const formIssueType: SupportTicket["issueType"] = "Bug";
  const [formPriority, setFormPriority] = useState<SupportTicket["priority"]>("HIGH");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImpact, setFormImpact] = useState("");
  const formOwner = "Ted Mwangi (Ops Lead)";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const critical = tickets.filter((t) => t.priority === "CRITICAL" || t.priority === "HIGH").length;
    const resolved = tickets.filter((t) => t.status === "RESOLVED").length;
    return { open, critical, resolved, total: tickets.length };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formTitle.trim()) return;

    const newTicket: SupportTicket = {
      id: `sup-${Date.now()}`,
      ticketNumber: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      clientId: `cli-${Date.now()}`,
      clientName: formClientName.trim(),
      contactName: "Client Contact",
      contactPhone: "+254 700 000 000",
      product: formProduct,
      issueType: formIssueType,
      priority: formPriority,
      status: "OPEN",
      assignedOwner: formOwner,
      businessImpact: formImpact.trim() || "Operational query.",
      firstResponseTime: "Pending (<15m SLA)",
      resolutionTarget: "Today within 4 hours",
      title: formTitle.trim(),
      description: formDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    setIsNewTicketOpen(false);
    setFormClientName("");
    setFormTitle("");
    setFormDescription("");
    setFormImpact("");
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "RESOLVED", resolutionTarget: "Resolved" } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: "RESOLVED" } : null));
    }
  };

  const getPriorityBadge = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-extrabold">CRITICAL</span>;
      case "HIGH":
        return <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">HIGH</span>;
      case "MEDIUM":
        return <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-medium">MEDIUM</span>;
      default:
        return <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">LOW</span>;
    }
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Customer Support &amp; Incident Operations
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Rapid Response &amp; SLAs</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Support &amp; Operational Issues
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Separate from onboarding tasks: protect recurring subscriptions by resolving payment blockers, printer hardware offline issues, and staff queries with strict response SLAs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Support Ticket</span>
            </button>
          </div>
        </div>

        {/* SLA & Backlog Health Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="liquid-glass p-4 rounded-xl border border-sky-500/30">
            <span className="text-slate-400 font-medium">Open Support Backlog</span>
            <div className="text-2xl font-bold text-white mt-1">{stats.open}</div>
            <div className="text-[10px] text-sky-400 mt-1">Average SLA: &lt;15 mins</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-rose-500/20">
            <span className="text-slate-400 font-medium">High / Critical Issues</span>
            <div className="text-2xl font-bold text-rose-300 mt-1">{stats.critical}</div>
            <div className="text-[10px] text-rose-400 mt-1">Impacts checkout/pos</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">Resolved This Week</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.resolved}</div>
            <div className="text-[10px] text-emerald-400 mt-1">100% SLA compliance</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 font-medium">Overall Client Satisfaction</span>
            <div className="text-2xl font-bold text-white mt-1">98.4%</div>
            <div className="text-[10px] text-slate-400 mt-1">Across 34 paying accounts</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter("OPEN")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === "OPEN"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("RESOLVED")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === "RESOLVED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              Resolved
            </button>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticket number, client, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className={`liquid-glass p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                t.status === "RESOLVED"
                  ? "border-slate-800/60 opacity-80"
                  : "border-slate-800/90 hover:border-slate-700"
              }`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {t.ticketNumber}
                  </span>
                  <span className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors">
                    {t.title}
                  </span>
                  {getPriorityBadge(t.priority)}
                  <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-slate-800 text-slate-300">
                    {t.issueType}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                  <strong className="text-slate-200">{t.clientName}</strong>
                  <span>•</span>
                  <span className="text-indigo-400">{t.product}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <User className="h-3 w-3 text-slate-500" />
                    <span>Owner: {t.assignedOwner}</span>
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">1st Response: {t.firstResponseTime}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {t.description}
                </p>

                <div className="mt-2 text-[11px] text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/15 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span><strong>Business Impact:</strong> {t.businessImpact}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {t.status !== "RESOLVED" ? (
                  <button
                    onClick={() => handleResolveTicket(t.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resolve Ticket</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="p-12 text-center liquid-glass rounded-2xl text-xs text-slate-500">
              No support tickets found matching current filters.
            </div>
          )}
        </div>

        {/* Modal: Log New Ticket */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <LifeBuoy className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Log Customer Incident / Ticket</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mama Rocks Cafe"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Affected Product</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Vehisoft">Vehisoft</option>
                      <option value="Versandry">Versandry</option>
                      <option value="Adversoft">Adversoft</option>
                      <option value="LipaTim">LipaTim</option>
                      <option value="Melio RMS">Melio RMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as SupportTicket["priority"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CRITICAL">Critical (Blocks Cash/Sales)</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ticket Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thermal printer driver offline on Windows tablet"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Impact</label>
                  <input
                    type="text"
                    placeholder="e.g. Counter unable to issue laundry pickup receipts"
                    value={formImpact}
                    onChange={(e) => setFormImpact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detailed Technical Observations</label>
                  <textarea
                    rows={3}
                    placeholder="Steps to reproduce, error codes, network IP details..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Create Ticket</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
