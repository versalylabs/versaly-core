"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Search,
  MessageCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { INITIAL_CLIENTS, ClientItem } from "@/data/clients-projects-seed";

export default function ClientsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(INITIAL_CLIENTS[0]);

  const filteredClients = useMemo(() => {
    return INITIAL_CLIENTS.filter((c) => {
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      const matchesSearch =
        c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchQuery]);

  const totalMRRKES = useMemo(() => {
    return INITIAL_CLIENTS.reduce((sum, c) => sum + c.monthlyMRR, 0);
  }, []);

  const onboardingCount = useMemo(() => {
    return INITIAL_CLIENTS.filter((c) => c.status === "ONBOARDING").length;
  }, []);

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Phase 5 Client Operations
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">360° Relationship Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Client Command Center & Renewals
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Every signed client has an active subscription, linked contacts, signed documents, payment method, and live 8-step onboarding journey.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              <span>View Implementations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Portfolio Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Active Subscriptions</div>
            <div className="text-xl font-bold text-white mt-1">{INITIAL_CLIENTS.length} Accounts</div>
            <div className="text-[10px] text-indigo-400 mt-1">Across 5 products</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Total Monthly MRR</div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              KES {totalMRRKES.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>100% M-Pesa / Bank verified</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">In Active Onboarding</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{onboardingCount} Clients</div>
            <div className="text-[10px] text-slate-500 mt-1">Advancing towards Step 7 win</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Upcoming Renewals</div>
            <div className="text-xl font-bold text-indigo-300 mt-1">2 This Week</div>
            <div className="text-[10px] text-slate-500 mt-1">Auto-invoices queued</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "ONBOARDING", "ACTIVE"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {s === "ALL" ? "All Subscriptions" : s}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, owners, products..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 360° Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Cards List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isSelected
                      ? "bg-indigo-950/30 border-indigo-500/40 shadow-sm"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
                        {client.businessName}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {client.productName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          client.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Owner: <strong className="text-slate-300 font-medium">{client.contactName}</strong></span>
                      <span>•</span>
                      <span>Renewal: {client.renewalDate}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="text-slate-300 font-medium">
                        Onboarding Step {client.currentOnboardingStep}/8 ({client.onboardingProgressPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 shrink-0 text-right">
                    <div className="text-sm font-bold text-emerald-400 font-mono">
                      KES {client.monthlyMRR.toLocaleString()}/mo
                    </div>
                    <span className="text-[11px] text-slate-500">{client.paymentMethod}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 360° Profile Side-Drawer (1 col) */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-5">
            {selectedClient ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {selectedClient.productName} Client
                    </span>
                    <span className="text-xs text-slate-400 font-mono">PIN: {selectedClient.taxPin || "N/A"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedClient.businessName}</h3>
                  <p className="text-xs text-slate-400">
                    Active subscription since Oct 2026 • Monthly billing
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Monthly MRR:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      KES {selectedClient.monthlyMRR.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payment Channel:</span>
                    <span className="text-slate-200">{selectedClient.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Next Renewal Date:</span>
                    <span className="text-indigo-300 font-medium">{selectedClient.renewalDate}</span>
                  </div>
                </div>

                {/* Primary Contact with WhatsApp Action */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Decision Maker
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{selectedClient.contactName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{selectedClient.contactPhone}</div>
                    </div>
                    <a
                      href={`https://wa.me/${selectedClient.contactWhatsApp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition flex items-center gap-1"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 8-Step Onboarding Journey Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      8-Step Onboarding Journey
                    </h4>
                    <span className="text-xs font-bold text-indigo-400">
                      Step {selectedClient.currentOnboardingStep}/8
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${selectedClient.onboardingProgressPct}%` }}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Agreement & payment instructions sent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Setup fee payment confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Data collection & bay layout</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedClient.currentOnboardingStep >= 4 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className={selectedClient.currentOnboardingStep >= 4 ? "text-slate-200" : "text-slate-500"}>
                        Product configuration & catalog
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connected Documents & Implementation Button */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-indigo-400" />
                      <span className="text-slate-300 text-[11px] font-mono">{selectedClient.signedContractDoc}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-medium">Signed</span>
                  </div>

                  <Link
                    href={`/projects#${selectedClient.id}`}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Implementation Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select a client to view their complete 360° profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
