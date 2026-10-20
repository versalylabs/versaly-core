"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FinanceExpense,
  loadExpensesFromStorage,
  saveExpensesToStorage,
} from "@/lib/finance-store";
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  CreditCard,
  Building2,
  DollarSign,
  Cloud,
  Cpu,
  Truck,
  Megaphone,
  Scale,
  Briefcase,
} from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<FinanceExpense["category"]>("INFRASTRUCTURE_CLOUD");
  const [formDesc, setFormDesc] = useState("");
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formVendor, setFormVendor] = useState("");
  const [formDate, setFormDate] = useState("2026-10-20");
  const [formMethod, setFormMethod] = useState<FinanceExpense["paymentMethod"]>("MPESA");
  const [formStatus, setFormStatus] = useState<FinanceExpense["status"]>("PAID");
  const [formProduct, setFormProduct] = useState("");

  useEffect(() => {
    setExpenses(loadExpensesFromStorage());
  }, []);

  const syncExpenses = (updated: FinanceExpense[]) => {
    setExpenses(updated);
    saveExpensesToStorage(updated);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalExpenseKES = expenses.reduce((sum, e) => sum + (e.amountKES || 0), 0);

  // Category Aggregates
  const categoryTotals = useMemo(() => {
    const acc: Record<string, number> = {};
    expenses.forEach((e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amountKES || 0);
    });
    return acc;
  }, [expenses]);

  const openAddModal = () => {
    setModalMode("ADD");
    setEditingId(null);
    setFormCategory("INFRASTRUCTURE_CLOUD");
    setFormDesc("");
    setFormAmount(0);
    setFormVendor("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMethod("MPESA");
    setFormStatus("PAID");
    setFormProduct("");
    setIsModalOpen(true);
  };

  const openEditModal = (exp: FinanceExpense) => {
    setModalMode("EDIT");
    setEditingId(exp.id);
    setFormCategory(exp.category);
    setFormDesc(exp.description);
    setFormAmount(exp.amountKES);
    setFormVendor(exp.vendor);
    setFormDate(exp.expenseDate);
    setFormMethod(exp.paymentMethod);
    setFormStatus(exp.status);
    setFormProduct(exp.productSlug || "");
    setIsModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim() || formAmount <= 0) return;

    if (modalMode === "ADD") {
      const newExp: FinanceExpense = {
        id: `exp-${Date.now()}`,
        category: formCategory,
        description: formDesc.trim(),
        amountKES: Number(formAmount) || 0,
        vendor: formVendor.trim() || "Vendor",
        expenseDate: formDate || new Date().toISOString().split("T")[0],
        paymentMethod: formMethod,
        status: formStatus,
        productSlug: formProduct.trim() || undefined,
      };
      const updated = [newExp, ...expenses];
      syncExpenses(updated);
      showToast("Expense logged successfully!");
    } else if (editingId) {
      const updated = expenses.map((exp) =>
        exp.id === editingId
          ? {
              ...exp,
              category: formCategory,
              description: formDesc.trim(),
              amountKES: Number(formAmount) || 0,
              vendor: formVendor.trim(),
              expenseDate: formDate,
              paymentMethod: formMethod,
              status: formStatus,
              productSlug: formProduct.trim() || undefined,
            }
          : exp
      );
      syncExpenses(updated);
      showToast("Expense updated.");
    }
    setIsModalOpen(false);
  };

  const handleDeleteExpense = (exp: FinanceExpense) => {
    if (confirm(`Delete expense "${exp.description}" for KES ${exp.amountKES.toLocaleString()}?`)) {
      const updated = expenses.filter((e) => e.id !== exp.id);
      syncExpenses(updated);
      showToast("Expense removed.");
    }
  };

  // Filtered List
  const filtered = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "ALL" || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-rose-500/40 text-rose-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Operating Expenditure (OpEx)
              </span>
              <span className="text-xs text-slate-500">Cost Controls &amp; Payables</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingDown className="h-6 w-6 text-rose-400" />
              <span>Expenses &amp; Payables</span>
            </h1>
            <p className="text-xs text-slate-400">
              Track cloud servers, client hardware procurement (printers, POS units), field transport, marketing, and legal expenses.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/finance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition"
            >
              <span>Finance Dashboard</span>
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Total Burn Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="liquid-glass p-4 rounded-xl border border-rose-500/30">
            <span className="text-slate-400 text-xs font-medium">Total Operating Spend</span>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              KES {totalExpenseKES.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{expenses.length} entries recorded</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 text-xs font-medium">Hardware &amp; Devices</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              KES {(categoryTotals["HARDWARE_DEVICES"] || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Xprinter &amp; POS units</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 text-xs font-medium">Cloud Infrastructure</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              KES {(categoryTotals["INFRASTRUCTURE_CLOUD"] || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Hosting, DB &amp; domains</div>
          </div>

          <div className="liquid-glass p-4 rounded-xl">
            <span className="text-slate-400 text-xs font-medium">Field &amp; Sales Route</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              KES {(categoryTotals["FIELD_TRANSPORT"] || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Transport &amp; pitching</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by vendor, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Categories</option>
              <option value="INFRASTRUCTURE_CLOUD">Cloud Infrastructure</option>
              <option value="HARDWARE_DEVICES">Hardware Devices</option>
              <option value="FIELD_TRANSPORT">Field Transport</option>
              <option value="MARKETING_ADS">Marketing &amp; Ads</option>
              <option value="LEGAL_COMPLIANCE">Legal &amp; eTIMS</option>
              <option value="OFFICE_OPERATIONS">Office Operations</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Expense Item Ledger ({filtered.length})
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <TrendingDown className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No expenses recorded yet.</p>
              <button
                onClick={openAddModal}
                className="text-xs text-rose-400 font-semibold hover:underline"
              >
                + Log an operating expense
              </button>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-slate-900/80 p-3 font-bold text-slate-400 border-b border-slate-800">
                <span className="col-span-4">Description / Purpose</span>
                <span className="col-span-2">Category</span>
                <span className="col-span-2">Vendor</span>
                <span className="col-span-2">Date / Method</span>
                <span className="col-span-2 text-right">Amount (KES)</span>
              </div>

              {filtered.map((exp) => (
                <div
                  key={exp.id}
                  className="grid grid-cols-12 p-3 border-b border-slate-800/60 text-slate-300 font-medium items-center hover:bg-slate-900/40 transition group"
                >
                  <div className="col-span-4 pr-3">
                    <span className="font-semibold text-white block truncate">{exp.description}</span>
                    {exp.productSlug && (
                      <span className="text-[10px] text-indigo-400">Target: {exp.productSlug}</span>
                    )}
                  </div>

                  <span className="col-span-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      {exp.category.replace("_", " ")}
                    </span>
                  </span>

                  <span className="col-span-2 truncate pr-2 text-slate-400">
                    {exp.vendor}
                  </span>

                  <div className="col-span-2 font-mono text-[10px] text-slate-400">
                    <div>{exp.expenseDate}</div>
                    <span className="text-slate-500">{exp.paymentMethod}</span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2 shrink-0">
                    <span className="font-mono font-bold text-rose-400 text-xs">
                      KES {exp.amountKES.toLocaleString()}
                    </span>
                    <button
                      onClick={() => openEditModal(exp)}
                      className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass border border-slate-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
                Operating Spend
              </span>
              <h3 className="text-base font-bold text-white">
                {modalMode === "ADD" ? "Log Business Expense" : "Edit Expense Entry"}
              </h3>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2x Xprinter XP-420B thermal receipt printers for Express Wash"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (KES) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="INFRASTRUCTURE_CLOUD">Cloud Infrastructure</option>
                    <option value="HARDWARE_DEVICES">Hardware Devices</option>
                    <option value="FIELD_TRANSPORT">Field Transport</option>
                    <option value="MARKETING_ADS">Marketing &amp; Ads</option>
                    <option value="LEGAL_COMPLIANCE">Legal &amp; eTIMS</option>
                    <option value="OFFICE_OPERATIONS">Office Operations</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Nairobi Hardware Ltd / Vercel"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Allocation</label>
                  <input
                    type="text"
                    placeholder="e.g. Versandry"
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 cursor-pointer"
                >
                  {modalMode === "ADD" ? "Save Expense" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
