"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import {
  INITIAL_SPEND,
  AdSpendEntry,
  SpendChannel,
  PaymentMethod,
  SpendStatus,
  MarketingProduct,
} from "@/data/marketing-seed";
import { useProductsCatalog } from "@/lib/products-store";

const STORAGE_KEY = "versaly_marketing_spend_v2";

const CHANNELS: SpendChannel[] = [
  "Billboard / Outdoor",
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "LinkedIn Ads",
  "Print & Banners",
  "Influencer / Sponsorship",
];

export default function MarketingSpendPage() {
  const { products: catalogProducts } = useProductsCatalog();
  const productOptions = useMemo(
    () => Array.from(new Set([...catalogProducts.map((p) => p.name), "Versaly Core / Brand"])),
    [catalogProducts]
  );
  const [spends, setSpends] = useState<AdSpendEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_SPEND;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [productFilter, setProductFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formCampaignName, setFormCampaignName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formChannel, setFormChannel] = useState<SpendChannel>("Meta Ads");
  const [formProduct, setFormProduct] = useState<MarketingProduct>("Vehisoft");
  const [formAmount, setFormAmount] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [formInvoice, setFormInvoice] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formStatus, setFormStatus] = useState<SpendStatus>("Paid");
  const [formNotes, setFormNotes] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spends));
    } catch {
      // ignore
    }
  }, [spends]);

  // Financial Aggregations
  const stats = useMemo(() => {
    const totalOutflow = spends.reduce((acc, s) => acc + s.amount, 0);
    const paidOutflow = spends.filter((s) => s.status === "Paid").reduce((acc, s) => acc + s.amount, 0);
    const pendingOutflow = spends.filter((s) => s.status === "Pending" || s.status === "Scheduled").reduce((acc, s) => acc + s.amount, 0);

    const outdoorTotal = spends
      .filter((s) => s.channel === "Billboard / Outdoor" || s.channel === "Print & Banners")
      .reduce((acc, s) => acc + s.amount, 0);

    const digitalTotal = spends
      .filter((s) => s.channel !== "Billboard / Outdoor" && s.channel !== "Print & Banners")
      .reduce((acc, s) => acc + s.amount, 0);

    return { totalOutflow, paidOutflow, pendingOutflow, outdoorTotal, digitalTotal };
  }, [spends]);

  // Filtered Spends
  const filteredSpends = useMemo(() => {
    return spends.filter((item) => {
      const matchesSearch =
        item.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel = channelFilter === "ALL" || item.channel === channelFilter;
      const matchesProduct = productFilter === "ALL" || item.product === productFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesChannel && matchesProduct && matchesStatus;
    });
  }, [spends, searchQuery, channelFilter, productFilter, statusFilter]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingId(null);
    setFormCampaignName("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormChannel("Meta Ads");
    setFormProduct("Vehisoft");
    setFormAmount("");
    setFormPaymentMethod("Credit Card");
    setFormInvoice("");
    setFormVendor("");
    setFormStatus("Paid");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (entry: AdSpendEntry) => {
    setModalMode("EDIT");
    setEditingId(entry.id);
    setFormCampaignName(entry.campaignName);
    setFormDate(entry.date);
    setFormChannel(entry.channel);
    setFormProduct(entry.product);
    setFormAmount(entry.amount.toString());
    setFormPaymentMethod(entry.paymentMethod);
    setFormInvoice(entry.invoiceNumber || "");
    setFormVendor(entry.vendor);
    setFormStatus(entry.status);
    setFormNotes(entry.notes);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (!parsedAmount || isNaN(parsedAmount)) return;

    const payload: AdSpendEntry = {
      id: modalMode === "EDIT" && editingId ? editingId : `spd-${Date.now()}`,
      campaignName: formCampaignName.trim() || `${formChannel} Allocation`,
      date: formDate || new Date().toISOString().split("T")[0],
      channel: formChannel,
      product: formProduct,
      amount: parsedAmount,
      paymentMethod: formPaymentMethod,
      invoiceNumber: formInvoice.trim() || undefined,
      vendor: formVendor.trim() || "Marketing Vendor",
      status: formStatus,
      notes: formNotes.trim(),
    };

    if (modalMode === "ADD") {
      setSpends((prev) => [payload, ...prev]);
    } else {
      setSpends((prev) => prev.map((s) => (s.id === editingId ? payload : s)));
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete spend entry "${name}"?`)) {
      setSpends((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Handle Clear All
  const handleClearAll = () => {
    if (confirm("Clear all ad spend entries to start afresh? This cannot be undone.")) {
      setSpends([]);
    }
  };

  // Quick Toggle Status
  const toggleStatus = (id: string, current: SpendStatus) => {
    const next: SpendStatus = current === "Paid" ? "Pending" : "Paid";
    setSpends((prev) => prev.map((s) => (s.id === id ? { ...s, status: next } : s)));
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Marketing Outflows
              </span>
              <span className="text-xs text-slate-500">Capital Deployment</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-400" />
              <span>Ad Spend & Budget Ledger</span>
            </h1>
            <p className="text-xs text-slate-400">
              Track invoices, billboard leases, Meta/Google ad charges, and printing costs with complete auditability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {spends.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 transition"
                title="Clear all expense records to start afresh"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Start Afresh</span>
              </button>
            )}
            <Link
              href="/marketing/campaigns"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <span>View Campaigns</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Ad Expense</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Total Spend Incurred</div>
            <div className="text-xl font-bold text-white font-mono">
              KES {stats.totalOutflow.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">{spends.length} logged payments</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Paid & Settled</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              KES {stats.paidOutflow.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Cleared invoices</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Pending / Scheduled</div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              KES {stats.pendingOutflow.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Upcoming commitments</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Outdoor / Billboards</div>
            <div className="text-xl font-bold text-rose-400 font-mono">
              KES {stats.outdoorTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.totalOutflow > 0 ? `${Math.round((stats.outdoorTotal / stats.totalOutflow) * 100)}% of total` : "0%"}
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Digital Ads</div>
            <div className="text-xl font-bold text-sky-400 font-mono">
              KES {stats.digitalTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">Meta, Google & TikTok</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendor, invoice, product, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Channel Select */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Channels</option>
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            {/* Product Select */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Products</option>
              {productOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Channel & Product</th>
                  <th className="py-3 px-4">Campaign / Allocation</th>
                  <th className="py-3 px-4">Vendor & Invoice</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount (KES)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredSpends.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No expense entries found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSpends.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/30 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{item.channel}</div>
                        <div className="text-[10px] text-rose-400">{item.product}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-200 line-clamp-1">
                          {item.campaignName}
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-slate-500 line-clamp-1">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-300">{item.vendor}</div>
                        {item.invoiceNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.invoiceNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {item.paymentMethod}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        KES {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(item.id, item.status)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            item.status === "Paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : item.status === "Scheduled"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle Paid/Pending"
                        >
                          {item.status}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Record"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.campaignName)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      {/* CREATE / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "ADD" ? "Log Ad / Marketing Outflow" : "Edit Expense Record"}
                </h3>
                <p className="text-xs text-slate-400">Record payments to billboard sites, digital ad networks, or print vendors</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Campaign / Outflow Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands Roundabout Lease - Month 1"
                  value={formCampaignName}
                  onChange={(e) => setFormCampaignName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel *
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value as SpendChannel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Allocated *
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {productOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Magnate Ventures, Meta, Google"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Invoice / Receipt #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={formInvoice}
                    onChange={(e) => setFormInvoice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="M-Pesa Paybill">M-Pesa Paybill</option>
                    <option value="Bank Wire">Bank Wire</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SpendStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Terms, tax deductions, site lease tenure, or billing cycle details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25"
                >
                  {modalMode === "ADD" ? "Log Expense" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
