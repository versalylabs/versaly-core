"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  TrendingUp,
  Target,
  Plus,
  Search,
  Building2,
  Calendar,
  Phone,
  ArrowUpRight,
  Receipt,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Trash2,
  Edit2,
  X,
  CreditCard,
} from "lucide-react";
import {
  ClientSubscription,
  loadSubscriptionsFromStorage,
  saveSubscriptionsToStorage,
  loadInvoicesFromStorage,
  loadExpensesFromStorage,
  computeFinanceSummary,
  SETUP_FEE_LAUNCH_TARGET,
  MRR_LAUNCH_TARGET,
} from "@/lib/finance-store";

export default function RevenueSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<ClientSubscription | null>(null);

  const [formData, setFormData] = useState({
    clientName: "",
    productSlug: "semplo" as "semplo" | "vehisoft" | "adversoft" | "versandry" | "lipatim" | "melio" | "custom",
    productName: "Semplo",
    planTier: "HR & Payroll Pro (Up to 50 Staff)",
    monthlyFeeKES: 20000,
    billingCycle: "MONTHLY" as "MONTHLY" | "QUARTERLY" | "ANNUAL",
    status: "ACTIVE" as "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELLED",
    startDate: "2026-10-01",
    nextBillingDate: "2026-11-01",
    contactPerson: "",
    phone: "",
    notes: "",
  });

  // Load subscriptions on mount
  useEffect(() => {
    const subs = loadSubscriptionsFromStorage();
    setSubscriptions(subs);
  }, []);

  const syncSubscriptions = (newSubs: ClientSubscription[]) => {
    setSubscriptions(newSubs);
    saveSubscriptionsToStorage(newSubs);
  };

  // Cross-reference with invoices for global finance metrics
  const invoices = useMemo(() => {
    return typeof window !== "undefined" ? loadInvoicesFromStorage() : [];
  }, [subscriptions]);

  const expenses = useMemo(() => {
    return typeof window !== "undefined" ? loadExpensesFromStorage() : [];
  }, []);

  const financeSummary = useMemo(() => {
    return computeFinanceSummary(invoices, expenses, subscriptions);
  }, [invoices, expenses, subscriptions]);

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.contactPerson && sub.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.phone && sub.phone.includes(searchQuery));
      const matchesProduct = productFilter === "ALL" || sub.productSlug === productFilter;
      const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [subscriptions, searchQuery, productFilter, statusFilter]);

  // Aggregate subscription metrics
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalMRR = activeSubs.reduce((sum, s) => sum + (s.monthlyFeeKES || 0), 0);
  const totalARR = totalMRR * 12;
  const avgARPU = activeSubs.length > 0 ? Math.round(totalMRR / activeSubs.length) : 0;
  const mrrProgress = Math.min(100, Math.round((totalMRR / MRR_LAUNCH_TARGET) * 100));
  const setupProgress = Math.min(
    100,
    Math.round((financeSummary.setupFeesCollected / SETUP_FEE_LAUNCH_TARGET) * 100)
  );

  // Product breakdown calculation
  const productMRRBreakdown = useMemo(() => {
    const map: Record<string, { count: number; mrr: number; color: string; slug: string }> = {
      Semplo: { count: 0, mrr: 0, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", slug: "semplo" },
      Vehisoft: { count: 0, mrr: 0, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", slug: "vehisoft" },
      Adversoft: { count: 0, mrr: 0, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", slug: "adversoft" },
      Versandry: { count: 0, mrr: 0, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", slug: "versandry" },
      LipaTim: { count: 0, mrr: 0, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", slug: "lipatim" },
      "Melio RMS": { count: 0, mrr: 0, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", slug: "melio" },
    };

    activeSubs.forEach((s) => {
      if (map[s.productName]) {
        map[s.productName].count += 1;
        map[s.productName].mrr += s.monthlyFeeKES;
      }
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      pctOfTotal: totalMRR > 0 ? Math.round((data.mrr / totalMRR) * 100) : 0,
    }));
  }, [activeSubs, totalMRR]);

  const handleOpenAddModal = () => {
    setEditingSub(null);
    setFormData({
      clientName: "",
      productSlug: "semplo",
      productName: "Semplo",
      planTier: "HR & Payroll Pro (Up to 50 Staff)",
      monthlyFeeKES: 20000,
      billingCycle: "MONTHLY",
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      contactPerson: "",
      phone: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: ClientSubscription) => {
    setEditingSub(sub);
    setFormData({
      clientName: sub.clientName,
      productSlug: sub.productSlug,
      productName: sub.productName,
      planTier: sub.planTier,
      monthlyFeeKES: sub.monthlyFeeKES,
      billingCycle: sub.billingCycle,
      status: sub.status,
      startDate: sub.startDate,
      nextBillingDate: sub.nextBillingDate,
      contactPerson: sub.contactPerson || "",
      phone: sub.phone || "",
      notes: sub.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) return;

    if (editingSub) {
      const updated = subscriptions.map((s) =>
        s.id === editingSub.id ? { ...s, ...formData } : s
      );
      syncSubscriptions(updated);
    } else {
      const newSub: ClientSubscription = {
        id: `sub-${Date.now()}`,
        ...formData,
      };
      syncSubscriptions([newSub, ...subscriptions]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm("Are you sure you want to remove this client subscription?")) {
      const filtered = subscriptions.filter((s) => s.id !== id);
      syncSubscriptions(filtered);
    }
  };

  const handleToggleStatus = (sub: ClientSubscription) => {
    const nextStatus = sub.status === "ACTIVE" ? "PAST_DUE" : sub.status === "PAST_DUE" ? "CANCELLED" : "ACTIVE";
    const updated = subscriptions.map((s) =>
      s.id === sub.id ? { ...s, status: nextStatus as any } : s
    );
    syncSubscriptions(updated);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header Banner matching the system's liquid-glass design */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Revenue &amp; Subscriptions
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Recurring SaaS Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
              <span>Revenue &amp; Subscriptions</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Live Monthly Recurring Revenue (MRR), ARR pacing, and active client contracts across Versaly products.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <Link
              href="/finance/invoices"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-2 transition"
            >
              <Receipt className="h-3.5 w-3.5 text-emerald-400" />
              <span>Issue Invoice</span>
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics in liquid-glass */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR Card */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Contracted MRR</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {totalMRR.toLocaleString()}
              <span className="text-xs text-slate-500 font-normal ml-1">/mo</span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Target: KES {MRR_LAUNCH_TARGET.toLocaleString()}</span>
                <span className="text-emerald-400 font-bold">{mrrProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${mrrProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* ARR Card */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Annual Run Rate (ARR)</span>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {(totalARR / 1000000).toFixed(2)}M
              <span className="text-xs text-slate-500 font-normal ml-1">/yr</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>MRR × 12 months</span>
              <span className="text-blue-400 font-semibold">KES {totalARR.toLocaleString()}</span>
            </div>
          </div>

          {/* Setup Fees Target Card */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Setup Fees Collected</span>
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {financeSummary.setupFeesCollected.toLocaleString()}
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Target: KES {SETUP_FEE_LAUNCH_TARGET.toLocaleString()}</span>
                <span className="text-purple-400 font-bold">{setupProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${setupProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Subscriptions / ARPU */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Accounts &amp; ARPU</span>
              <Building2 className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {activeSubs.length} <span className="text-sm font-normal text-slate-400">Clients</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Avg Revenue Per Client</span>
              <span className="text-amber-400 font-semibold">KES {avgARPU.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Product MRR Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 liquid-glass p-6 rounded-2xl border border-slate-800">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              MRR Contribution by Product Line
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Recurring monthly revenue generated across Versaly&apos;s 4 core B2B verticals.
            </p>

            <div className="space-y-4">
              {productMRRBreakdown.map((prod) => (
                <div key={prod.name} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${prod.color}`}>
                        {prod.name}
                      </span>
                      <span className="text-xs text-slate-400">{prod.count} active accounts</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">KES {prod.mrr.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 ml-1.5">({prod.pctOfTotal}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prod.slug === "semplo"
                          ? "bg-emerald-500"
                          : prod.slug === "vehisoft"
                          ? "bg-indigo-500"
                          : prod.slug === "adversoft"
                          ? "bg-purple-500"
                          : prod.slug === "versandry"
                          ? "bg-cyan-500"
                          : prod.slug === "lipatim"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${prod.pctOfTotal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SaaS Pricing Guide Reference in liquid-glass */}
          <div className="liquid-glass p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Standard Tier Pricing Card
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Launch pricing benchmarks for recurring subscriptions and setup fees.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>Semplo (HR &amp; Payroll Management)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">Priority</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Starter: KES 12k/mo</span>
                    <span>Pro: KES 20k/mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Setup &amp; calibration: KES 40,000</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-indigo-400 mb-1">Vehisoft (Dealerships)</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Starter: KES 15k/mo</span>
                    <span>Pro: KES 25k/mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Setup fee: KES 45,000 - 65,000</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-purple-400 mb-1">Adversoft (Digital Signage)</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Single: KES 10k/mo</span>
                    <span>4-Screen: KES 32k/mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Setup/box: KES 30,000 per screen</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-cyan-400 mb-1">Versandry (Laundromat POS)</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Single: KES 10k/mo</span>
                    <span>Multi: KES 18k/mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Setup fee: KES 25,000 with thermal printer</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-emerald-400 mb-1">LipaTim (eTIMS Retail POS)</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Single Till: KES 7.5k/mo</span>
                    <span>2-Tills: KES 12.5k/mo</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">eTIMS API Integration: KES 35,000</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                KRA eTIMS Compliant
              </span>
              <Link href="/finance/reports" className="text-emerald-400 hover:underline flex items-center gap-1">
                View P&amp;L <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Subscriptions Registry Table Section in liquid-glass */}
        <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                Active Client Subscription Registry ({filteredSubscriptions.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track recurring billing cycles, renewals, and subscription status per client.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client, contact or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/70 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white w-56 placeholder-slate-500"
                />
              </div>

              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Products</option>
                <option value="semplo">Semplo</option>
                <option value="vehisoft">Vehisoft</option>
                <option value="adversoft">Adversoft</option>
                <option value="versandry">Versandry</option>
                <option value="lipatim">LipaTim</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-medium">
                  <th className="py-3 px-4">Client &amp; Contact</th>
                  <th className="py-3 px-4">Product &amp; Plan Tier</th>
                  <th className="py-3 px-4">Monthly Fee</th>
                  <th className="py-3 px-4">Cycle &amp; Next Invoice</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No client subscriptions found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{sub.clientName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {sub.contactPerson && <span>{sub.contactPerson}</span>}
                          {sub.phone && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Phone className="h-3 w-3" />
                              {sub.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-200">{sub.planTier}</span>
                        <div className="text-[11px] text-slate-500">{sub.productName}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">KES {sub.monthlyFeeKES.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-500">per month</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{sub.nextBillingDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 uppercase">{sub.billingCycle}</div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : sub.status === "PAST_DUE"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                              : sub.status === "TRIAL"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              sub.status === "ACTIVE"
                                ? "bg-emerald-400 animate-pulse"
                                : sub.status === "PAST_DUE"
                                ? "bg-amber-400"
                                : sub.status === "TRIAL"
                                ? "bg-blue-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {sub.status}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/finance/invoices`}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition"
                            title="Generate invoice"
                          >
                            <Receipt className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Edit subscription"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscription(sub.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete subscription"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add / Edit Subscription with slate styling */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  {editingSub ? "Edit Client Subscription" : "Add New Client Subscription"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSubscription} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Client / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Prestige Auto Hub Ltd"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Product Vertical *
                    </label>
                    <select
                      value={formData.productSlug}
                      onChange={(e) => {
                        const slug = e.target.value as any;
                        const nameMap: Record<string, string> = {
                          semplo: "Semplo",
                          vehisoft: "Vehisoft",
                          adversoft: "Adversoft",
                          versandry: "Versandry",
                          lipatim: "LipaTim",
                          melio: "Melio RMS",
                        };
                        setFormData({
                          ...formData,
                          productSlug: slug,
                          productName: nameMap[slug] || "Semplo",
                        });
                      }}
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white cursor-pointer"
                    >
                      <option value="semplo">Semplo (HR &amp; Payroll Management)</option>
                      <option value="vehisoft">Vehisoft (Dealerships)</option>
                      <option value="adversoft">Adversoft (Digital Signage)</option>
                      <option value="versandry">Versandry (Laundromats)</option>
                      <option value="lipatim">LipaTim (eTIMS Retail)</option>
                      <option value="melio">Melio RMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Monthly Fee (KES) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={formData.monthlyFeeKES}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyFeeKES: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Plan / Subscription Tier Description
                  </label>
                  <input
                    type="text"
                    value={formData.planTier}
                    onChange={(e) => setFormData({ ...formData, planTier: e.target.value })}
                    placeholder="e.g. Pro Dealer (Up to 100 Cars)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) =>
                        setFormData({ ...formData, billingCycle: e.target.value as any })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white cursor-pointer"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUAL">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Next Billing Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextBillingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, nextBillingDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="e.g. David Kimani"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+2547XXXXXXXX"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25 cursor-pointer"
                  >
                    {editingSub ? "Update Subscription" : "Save Subscription"}
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
