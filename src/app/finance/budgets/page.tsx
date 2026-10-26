"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  BudgetPlan,
  BudgetItem,
  loadBudgetsFromStorage,
  saveBudgetsToStorage,
  formatKES,
} from "@/lib/finance-store";
import {
  Calculator,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  PieChart,
  TrendingDown,
  TrendingUp,
  Download,
  Edit2,
  Trash2,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Briefcase,
  DollarSign,
  Layers,
} from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("budget-90day-startup");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit item modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [itemCategory, setItemCategory] = useState("");
  const [itemAllocated, setItemAllocated] = useState<number>(10000);
  const [itemSpent, setItemSpent] = useState<number>(0);
  const [itemDepartment, setItemDepartment] = useState<BudgetItem["department"]>("Engineering");
  const [itemNotes, setItemNotes] = useState("");

  // New budget plan modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPeriod, setNewPlanPeriod] = useState<BudgetPlan["period"]>("MONTHLY");
  const [newPlanYear, setNewPlanYear] = useState<number>(2026);
  const [newPlanQuarter, setNewPlanQuarter] = useState<number>(1);
  const [newPlanNotes, setNewPlanNotes] = useState("");

  useEffect(() => {
    const loaded = loadBudgetsFromStorage();
    setBudgets(loaded);
    if (loaded.length > 0 && !loaded.some((b) => b.id === selectedPlanId)) {
      setSelectedPlanId(loaded[0].id);
    }

    const handleSync = () => {
      setBudgets(loadBudgetsFromStorage());
    };

    window.addEventListener("versaly_budgets_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_budgets_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [selectedPlanId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentPlan = useMemo(() => {
    return budgets.find((b) => b.id === selectedPlanId) || budgets[0];
  }, [budgets, selectedPlanId]);

  // Aggregate metrics
  const planStats = useMemo(() => {
    if (!currentPlan) {
      return { totalAllocated: 0, totalSpent: 0, remaining: 0, percentUsed: 0, overBudgetCount: 0 };
    }
    const totalAllocated = currentPlan.items.reduce((sum, item) => sum + item.allocatedKES, 0);
    const totalSpent = currentPlan.items.reduce((sum, item) => sum + item.spentKES, 0);
    const remaining = totalAllocated - totalSpent;
    const percentUsed = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const overBudgetCount = currentPlan.items.filter((i) => i.spentKES > i.allocatedKES).length;

    return {
      totalAllocated,
      totalSpent,
      remaining,
      percentUsed,
      overBudgetCount,
    };
  }, [currentPlan]);

  // Departmental distribution
  const departmentBreakdown = useMemo(() => {
    if (!currentPlan) return [];
    const depts: Record<string, { allocated: number; spent: number }> = {};
    currentPlan.items.forEach((item) => {
      if (!depts[item.department]) {
        depts[item.department] = { allocated: 0, spent: 0 };
      }
      depts[item.department].allocated += item.allocatedKES;
      depts[item.department].spent += item.spentKES;
    });

    return Object.entries(depts).map(([dept, data]) => ({
      dept,
      allocated: data.allocated,
      spent: data.spent,
      pct: data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0,
    }));
  }, [currentPlan]);

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemCategory("");
    setItemAllocated(10000);
    setItemSpent(0);
    setItemDepartment("Engineering");
    setItemNotes("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setItemCategory(item.category);
    setItemAllocated(item.allocatedKES);
    setItemSpent(item.spentKES);
    setItemDepartment(item.department);
    setItemNotes(item.notes || "");
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCategory || !currentPlan) return;

    let updatedItems: BudgetItem[];
    if (editingItem) {
      updatedItems = currentPlan.items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              category: itemCategory,
              allocatedKES: itemAllocated,
              spentKES: itemSpent,
              department: itemDepartment,
              notes: itemNotes,
            }
          : it
      );
    } else {
      const newItem: BudgetItem = {
        id: `bi-${Date.now()}`,
        category: itemCategory,
        allocatedKES: itemAllocated,
        spentKES: itemSpent,
        department: itemDepartment,
        notes: itemNotes,
        isSampleScenario: currentPlan.period === "NINETY_DAY_STARTUP",
      };
      updatedItems = [...currentPlan.items, newItem];
    }

    const updatedTotal = updatedItems.reduce((s, i) => s + i.allocatedKES, 0);
    const nextBudgets = budgets.map((b) =>
      b.id === currentPlan.id
        ? {
            ...b,
            totalBudgetKES: updatedTotal,
            items: updatedItems,
          }
        : b
    );

    saveBudgetsToStorage(nextBudgets);
    setBudgets(nextBudgets);
    setIsItemModalOpen(false);
    showToast(editingItem ? "Budget category updated" : "Budget category added");
  };

  const handleDeleteItem = (itemId: string, name: string) => {
    if (!confirm(`Delete budget allocation for "${name}"?`) || !currentPlan) return;
    const updatedItems = currentPlan.items.filter((i) => i.id !== itemId);
    const updatedTotal = updatedItems.reduce((s, i) => s + i.allocatedKES, 0);
    const nextBudgets = budgets.map((b) =>
      b.id === currentPlan.id
        ? {
            ...b,
            totalBudgetKES: updatedTotal,
            items: updatedItems,
          }
        : b
    );
    saveBudgetsToStorage(nextBudgets);
    setBudgets(nextBudgets);
    showToast(`Removed "${name}" from budget`);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName) return;

    const newPlan: BudgetPlan = {
      id: `budget-${Date.now()}`,
      name: newPlanName,
      period: newPlanPeriod,
      year: newPlanYear,
      quarter: newPlanPeriod === "QUARTERLY" ? newPlanQuarter : undefined,
      totalBudgetKES: 0,
      status: "DRAFT",
      notes: newPlanNotes,
      items: [],
    };

    const next = [...budgets, newPlan];
    saveBudgetsToStorage(next);
    setBudgets(next);
    setSelectedPlanId(newPlan.id);
    setIsPlanModalOpen(false);
    setNewPlanName("");
    setNewPlanNotes("");
    showToast(`Created budget plan: ${newPlan.name}`);
  };

  const handleExportCSV = () => {
    if (!currentPlan) return;
    const headers = ["Category", "Department", "Allocated (KES)", "Spent (KES)", "Remaining (KES)", "Utilization (%)", "Notes"];
    const rows = currentPlan.items.map((i) => [
      `"${i.category}"`,
      `"${i.department}"`,
      i.allocatedKES,
      i.spentKES,
      i.allocatedKES - i.spentKES,
      ((i.spentKES / (i.allocatedKES || 1)) * 100).toFixed(1) + "%",
      `"${i.notes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `versaly-budget-${currentPlan.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Budget exported to CSV");
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
              <span>Budgets & Planning</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-400" />
              Budgets & Financial Planning
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Planned vs actual spending controls, departmental allocations, and the 90-Day Startup Budget scenario.
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
              onClick={() => setIsPlanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              New Budget Plan
            </button>
            <button
              onClick={handleOpenAddItem}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* Sample Estimates Disclaimer Notice */}
        {currentPlan?.period === "NINETY_DAY_STARTUP" && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-semibold text-indigo-300">ESTIMATED PLANNING SCENARIO:</span> The KSh 120,000 baseline figures shown below are editable operational planning estimates, not actual historical company expenses. Adjust allocations as actual invoices arrive.
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              Initial 90-Day Runway
            </span>
          </div>
        )}

        {/* Plan Switcher Pills */}
        <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider shrink-0">Plans:</span>
            {budgets.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedPlanId(b.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
                  selectedPlanId === b.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                {b.name}
                <span className="text-[11px] opacity-75 font-mono">({formatKES(b.totalBudgetKES)})</span>
              </button>
            ))}
          </div>

          {currentPlan && (
            <div className="hidden md:flex items-center gap-2 px-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {currentPlan.status}
              </span>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Planned Allocation</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(planStats.totalAllocated)}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              Across {currentPlan?.items.length || 0} designated categories
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Actual Realized Spend</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              {formatKES(planStats.totalSpent)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {planStats.percentUsed.toFixed(1)}% of planned budget absorbed
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Unspent / Headroom</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 font-mono ${planStats.remaining >= 0 ? "text-white" : "text-rose-400"}`}>
              {formatKES(planStats.remaining)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {planStats.remaining >= 0 ? "Available operational headroom" : "Budget deficit detected"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Budget Health & Variance</span>
              <AlertTriangle className={`w-4 h-4 ${planStats.overBudgetCount > 0 ? "text-amber-400" : "text-emerald-400"}`} />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {planStats.overBudgetCount === 0 ? "On Target" : `${planStats.overBudgetCount} Over Limit`}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {planStats.overBudgetCount === 0 ? "All items within allocated thresholds" : "Requires manager reallocation"}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-white">Overall Plan Utilization</span>
            <span className="font-mono text-indigo-400 font-bold">{planStats.percentUsed.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, planStats.percentUsed)}%` }}
              className={`h-full transition-all duration-500 rounded-full ${
                planStats.percentUsed > 100
                  ? "bg-rose-500"
                  : planStats.percentUsed > 80
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-indigo-500 to-emerald-500"
              }`}
            />
          </div>
        </div>

        {/* Departmental Allocation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentBreakdown.map((d) => (
            <div key={d.dept} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{d.dept}</span>
                <span className={`font-mono text-xs ${d.pct > 100 ? "text-rose-400 font-bold" : "text-slate-400"}`}>
                  {d.pct.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, d.pct)}%` }}
                  className={`h-full ${d.pct > 100 ? "bg-rose-500" : "bg-indigo-500"}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Spend: {formatKES(d.spent)}</span>
                <span>Plan: {formatKES(d.allocated)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Budget Items Table */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Line Item Allocations & Variance</h2>
              <p className="text-xs text-slate-400">
                Track real spending versus planned envelope across each cost center.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {currentPlan?.items.length || 0} line items listed
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-right">Allocated</th>
                  <th className="p-3.5 text-right">Actual Spent</th>
                  <th className="p-3.5 text-right">Remaining Headroom</th>
                  <th className="p-3.5 text-center">Utilization</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {currentPlan?.items.map((item) => {
                  const rem = item.allocatedKES - item.spentKES;
                  const util = item.allocatedKES > 0 ? (item.spentKES / item.allocatedKES) * 100 : 0;
                  const isOver = item.spentKES > item.allocatedKES;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-3.5 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          {item.category}
                          {item.isSampleScenario && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              Estimate
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium">
                          {item.department}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-medium text-slate-200">
                        {formatKES(item.allocatedKES)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        {formatKES(item.spentKES)}
                      </td>
                      <td className={`p-3.5 text-right font-mono font-medium ${rem >= 0 ? "text-slate-300" : "text-rose-400 font-bold"}`}>
                        {formatKES(rem)}
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-[11px] font-mono font-semibold ${isOver ? "text-rose-400" : "text-slate-300"}`}>
                            {util.toFixed(0)}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, util)}%` }}
                              className={`h-full ${isOver ? "bg-rose-500" : util > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate text-[11px]">
                        {item.notes || "—"}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit allocation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.category)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            title="Remove category"
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

        {/* EDIT / ADD BUDGET ITEM MODAL */}
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" />
                  {editingItem ? "Edit Budget Allocation" : "Add Budget Line Item"}
                </h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="e.g. Sales outreach, calls, transport"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Allocated (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={itemAllocated}
                      onChange={(e) => setItemAllocated(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Actual Spent (KES)</label>
                    <input
                      type="number"
                      min="0"
                      value={itemSpent}
                      onChange={(e) => setItemSpent(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Department</label>
                  <select
                    value={itemDepartment}
                    onChange={(e) => setItemDepartment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Legal">Legal & Accounting</option>
                    <option value="Engineering">Engineering / Infrastructure</option>
                    <option value="Sales">Sales Outreach</option>
                    <option value="Marketing">Marketing & Advertising</option>
                    <option value="Customer Success">Customer Success & Onboarding</option>
                    <option value="Admin">Administration</option>
                    <option value="Reserves">Emergency Reserves</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Operational Notes</label>
                  <textarea
                    rows={2}
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="Specific purpose, vendor breakdown or timeline..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NEW PLAN MODAL */}
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  New Financial Budget Plan
                </h3>
                <button
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Plan Title *</label>
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. Q3 2026 Expansion Budget"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Period</label>
                    <select
                      value={newPlanPeriod}
                      onChange={(e) => setNewPlanPeriod(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="ANNUAL">Annual</option>
                      <option value="NINETY_DAY_STARTUP">90-Day Startup Runway</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Year</label>
                    <input
                      type="number"
                      value={newPlanYear}
                      onChange={(e) => setNewPlanYear(parseInt(e.target.value) || 2026)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Plan Notes / Strategic Focus</label>
                  <textarea
                    rows={2}
                    value={newPlanNotes}
                    onChange={(e) => setNewPlanNotes(e.target.value)}
                    placeholder="Key strategic priorities, hiring limits, growth milestones..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Create Plan
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
