"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  OperationalSubscription,
  loadOperationalSubscriptions,
  saveOperationalSubscriptions,
  formatKES,
} from "@/lib/finance-store";
import {
  Repeat,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CreditCard,
  User,
  Shield,
  Layers,
  Sparkles,
  Server,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  Filter,
} from "lucide-react";

export default function OperationalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<OperationalSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<OperationalSubscription | null>(null);
  const [provider, setProvider] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<OperationalSubscription["category"]>("CLOUD_HOSTING");
  const [costAmount, setCostAmount] = useState<number>(20);
  const [currency, setCurrency] = useState<string>("USD");
  const [costKES, setCostKES] = useState<number>(2600);
  const [billingCycle, setBillingCycle] = useState<OperationalSubscription["billingCycle"]>("MONTHLY");
  const [renewalDate, setRenewalDate] = useState("2026-10-26");
  const [currentDate, setCurrentDate] = useState("2026-10-26");
  const [paymentMethod, setPaymentMethod] = useState<OperationalSubscription["paymentMethod"]>("CARD");
  const [responsiblePerson, setResponsiblePerson] = useState("Chief Technology Officer");
  const [status, setStatus] = useState<OperationalSubscription["status"]>("ACTIVE");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      setRenewalDate(todayStr);
      setCurrentDate(todayStr);
    } catch {}

    setSubscriptions(loadOperationalSubscriptions());

    const handleSync = () => {
      setSubscriptions(loadOperationalSubscriptions());
    };

    window.addEventListener("versaly_vendor_subs_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_vendor_subs_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep KES synchronized when USD changes
  const handleAmountChange = (amt: number, curr: string) => {
    setCostAmount(amt);
    setCurrency(curr);
    if (curr === "USD") {
      setCostKES(Math.round(amt * 130));
    } else {
      setCostKES(amt);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
    const monthlyKES = activeSubs.reduce((sum, s) => {
      if (s.billingCycle === "ANNUAL") return sum + Math.round(s.costKES / 12);
      if (s.billingCycle === "QUARTERLY") return sum + Math.round(s.costKES / 3);
      return sum + s.costKES;
    }, 0);

    const annualKES = monthlyKES * 12;
    const reviewCount = subscriptions.filter((s) => s.status === "REVIEW_FOR_CANCEL").length;

    // Upcoming renewals in next 10 days
    const today = new Date(currentDate);
    const upcomingRenewals = activeSubs.filter((s) => {
      const renew = new Date(s.renewalDate);
      const diffDays = Math.ceil((renew.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    });

    return {
      monthlyKES,
      annualKES,
      activeCount: activeSubs.length,
      reviewCount,
      upcomingRenewals,
    };
  }, [subscriptions, currentDate]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || sub.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [subscriptions, searchQuery, categoryFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingSub(null);
    setProvider("");
    setServiceName("");
    setCategory("CLOUD_HOSTING");
    setCostAmount(20);
    setCurrency("USD");
    setCostKES(2600);
    setBillingCycle("MONTHLY");
    setRenewalDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("CARD");
    setResponsiblePerson("Chief Technology Officer");
    setStatus("ACTIVE");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: OperationalSubscription) => {
    setEditingSub(s);
    setProvider(s.provider);
    setServiceName(s.serviceName);
    setCategory(s.category);
    setCostAmount(s.costAmount);
    setCurrency(s.currency);
    setCostKES(s.costKES);
    setBillingCycle(s.billingCycle);
    setRenewalDate(s.renewalDate);
    setPaymentMethod(s.paymentMethod);
    setResponsiblePerson(s.responsiblePerson);
    setStatus(s.status);
    setNotes(s.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !serviceName) return;

    let next: OperationalSubscription[];
    if (editingSub) {
      next = subscriptions.map((s) =>
        s.id === editingSub.id
          ? {
              ...s,
              provider,
              serviceName,
              category,
              costAmount,
              currency,
              costKES,
              billingCycle,
              renewalDate,
              paymentMethod,
              responsiblePerson,
              status,
              notes,
            }
          : s
      );
    } else {
      const newSub: OperationalSubscription = {
        id: `vsub-${Date.now()}`,
        provider,
        serviceName,
        category,
        costAmount,
        currency,
        costKES,
        billingCycle,
        renewalDate,
        paymentMethod,
        responsiblePerson,
        status,
        notes,
      };
      next = [newSub, ...subscriptions];
    }

    saveOperationalSubscriptions(next);
    setSubscriptions(next);
    setIsModalOpen(false);
    showToast(editingSub ? "Subscription updated" : "Subscription added");
  };

  const handleDeleteSub = (id: string, name: string) => {
    if (!confirm(`Delete subscription for "${name}"?`)) return;
    const next = subscriptions.filter((s) => s.id !== id);
    saveOperationalSubscriptions(next);
    setSubscriptions(next);
    showToast(`Removed subscription "${name}"`);
  };

  const handleStatusToggle = (s: OperationalSubscription) => {
    const nextStatus: OperationalSubscription["status"] =
      s.status === "ACTIVE" ? "REVIEW_FOR_CANCEL" : s.status === "REVIEW_FOR_CANCEL" ? "CANCELLED" : "ACTIVE";

    const next = subscriptions.map((item) => (item.id === s.id ? { ...item, status: nextStatus } : item));
    saveOperationalSubscriptions(next);
    setSubscriptions(next);
    showToast(`Updated status to ${nextStatus}`);
  };

  const handleExportCSV = () => {
    const headers = ["Provider", "Service", "Category", "Amount", "Currency", "KES Equiv", "Cycle", "Renewal Date", "Payment Method", "Owner", "Status"];
    const rows = subscriptions.map((s) => [
      `"${s.provider}"`,
      `"${s.serviceName}"`,
      `"${s.category}"`,
      s.costAmount,
      s.currency,
      s.costKES,
      s.billingCycle,
      s.renewalDate,
      s.paymentMethod,
      `"${s.responsiblePerson}"`,
      s.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `versaly-subscriptions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Subscriptions exported to CSV");
  };

  return (
    <WorkspaceLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-100" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
              <Link href="/finance" className="hover:underline">Finance</Link>
              <span>/</span>
              <span>Subscriptions & Recurring</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Repeat className="w-8 h-8 text-indigo-400" />
              Vendor Subscriptions & Commitments
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Centralized operational tracking for cloud infrastructure, AI models, developer tools, and telecom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Subscription
            </button>
          </div>
        </div>

        {/* Renewal Alerts Banner */}
        {stats.upcomingRenewals.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">UPCOMING RENEWALS DETECTED:</span> {stats.upcomingRenewals.length} service{stats.upcomingRenewals.length > 1 ? "s" : ""} renewing in the next 14 days (
                {stats.upcomingRenewals.map((u) => `${u.provider}: ${u.renewalDate}`).join(", ")}
                ).
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
              Check Corporate Card / M-Pesa Balance
            </span>
          </div>
        )}

        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Monthly Run-Rate Spend</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(stats.monthlyKES)}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              ~ ${(stats.monthlyKES / 130).toFixed(0)} USD / month
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Annualized Run-Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              {formatKES(stats.annualKES)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              12-month commitment projection
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Active Subscriptions</span>
              <Repeat className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.activeCount} Services
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Cloud, AI, telecommunications & tools
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Review for Cancellation</span>
              <AlertTriangle className={`w-4 h-4 ${stats.reviewCount > 0 ? "text-amber-400" : "text-slate-500"}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.reviewCount} Flagged
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Under audit for cost pruning
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search provider, service, owner..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="CLOUD_HOSTING">Cloud & Hosting</option>
              <option value="AI_DEVELOPMENT">AI Development & API</option>
              <option value="BUSINESS_TOOLS">Business Tools & Workspace</option>
              <option value="TELECOM_INTERNET">Telecom & Fiber Internet</option>
              <option value="DOMAINS_SECURITY">Domains & Security</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="REVIEW_FOR_CANCEL">Review for Cancel</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Provider & Service</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Cost (Original)</th>
                  <th className="p-3.5 text-right">Cost (KES)</th>
                  <th className="p-3.5">Billing Cycle</th>
                  <th className="p-3.5">Next Renewal</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredSubscriptions.map((sub) => {
                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-3.5">
                        <div className="font-semibold text-white text-sm">{sub.provider}</div>
                        <div className="text-[11px] text-slate-400">{sub.serviceName}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                          {sub.category.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-medium text-slate-300">
                        {sub.currency === "USD" ? `$${sub.costAmount}` : formatKES(sub.costAmount)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">
                        {formatKES(sub.costKES)}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                          {sub.billingCycle}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {sub.renewalDate}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          {sub.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {sub.responsiblePerson}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleStatusToggle(sub)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                            sub.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : sub.status === "REVIEW_FOR_CANCEL"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {sub.status === "ACTIVE" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : sub.status === "REVIEW_FOR_CANCEL" ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {sub.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSub(sub.id, sub.provider)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-indigo-400" />
                  {editingSub ? "Edit Subscription" : "Add Vendor Subscription"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSub} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Provider *</label>
                    <input
                      type="text"
                      required
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      placeholder="e.g. OpenAI / Vercel"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Service / Tier *</label>
                    <input
                      type="text"
                      required
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="e.g. API Tier 4 / Pro"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CLOUD_HOSTING">Cloud Hosting & Database</option>
                      <option value="AI_DEVELOPMENT">AI Development & APIs</option>
                      <option value="BUSINESS_TOOLS">Business Tools & Workspace</option>
                      <option value="TELECOM_INTERNET">Telecom & Fiber Internet</option>
                      <option value="DOMAINS_SECURITY">Domains & Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Billing Cycle</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="QUARTERLY">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => handleAmountChange(costAmount, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KES">KES (KSh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Cost ({currency})</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={costAmount}
                      onChange={(e) => handleAmountChange(Number(e.target.value), currency)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">KES Equivalent</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={costKES}
                      onChange={(e) => setCostKES(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Next Renewal Date</label>
                    <input
                      type="date"
                      required
                      value={renewalDate}
                      onChange={(e) => setRenewalDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CARD">Corporate Card</option>
                      <option value="MPESA">M-Pesa Paybill / Till</option>
                      <option value="BANK_TRANSFER">Bank EFT / Wire</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Responsible Lead</label>
                    <input
                      type="text"
                      value={responsiblePerson}
                      onChange={(e) => setResponsiblePerson(e.target.value)}
                      placeholder="e.g. CTO / Operations Lead"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Subscription Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="REVIEW_FOR_CANCEL">Review for Cancellation</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Notes / Plan Link</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Login reference, annual renewal discounts, etc."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Save Subscription
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
