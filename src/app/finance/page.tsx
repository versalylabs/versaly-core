"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FinanceInvoice,
  FinanceExpense,
  ClientSubscription,
  CompanyAccount,
  CashReserveFund,
  BudgetPlan,
  OperationalSubscription,
  loadInvoicesFromStorage,
  loadExpensesFromStorage,
  loadSubscriptionsFromStorage,
  loadAccountsFromStorage,
  saveAccountsToStorage,
  loadReservesFromStorage,
  loadBudgetsFromStorage,
  loadOperationalSubscriptions,
  loadCompensationRecords,
  loadCapitalContributions,
  loadShareholderLoans,
  computeFinanceSummary,
  formatKES,
  SETUP_FEE_LAUNCH_TARGET,
  MRR_LAUNCH_TARGET,
} from "@/lib/finance-store";
import {
  Wallet,
  Receipt,
  ArrowDownLeft,
  TrendingDown,
  TrendingUp,
  BarChart3,
  CreditCard,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Landmark,
  PieChart,
  Calculator,
  PiggyBank,
  Banknote,
  Repeat,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Hourglass,
  Layers,
  Building2,
  DollarSign,
  Smartphone,
  SlidersHorizontal,
  Edit2,
  Trash2,
  X,
} from "lucide-react";

export default function FinanceDashboardPage() {
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [clientSubs, setClientSubs] = useState<ClientSubscription[]>([]);
  const [accounts, setAccounts] = useState<CompanyAccount[]>([]);
  const [reserves, setReserves] = useState<CashReserveFund[]>([]);
  const [budgets, setBudgets] = useState<BudgetPlan[]>([]);
  const [vendorSubs, setVendorSubs] = useState<OperationalSubscription[]>([]);
  const [dateRange, setDateRange] = useState<"ALL" | "THIS_MONTH" | "THIS_QUARTER" | "THIS_YEAR">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manage Accounts Modal State
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [editingAccounts, setEditingAccounts] = useState<CompanyAccount[]>([]);
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccInstitution, setNewAccInstitution] = useState("");
  const [newAccNumber, setNewAccNumber] = useState("");
  const [newAccBalance, setNewAccBalance] = useState<number>(50000);
  const [newAccCurrency, setNewAccCurrency] = useState("KES");
  const [newAccType, setNewAccType] = useState<CompanyAccount["accountType"]>("BANK_CHECKING");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAccountsModal = () => {
    setEditingAccounts(accounts.map((a) => ({ ...a })));
    setIsAddingNewAccount(false);
    setIsAccountsModalOpen(true);
  };

  const handleAccountBalanceChange = (id: string, val: number) => {
    setEditingAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, balanceKES: Math.max(0, val) } : a))
    );
  };

  const handleAddNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccInstitution) return;
    const newAcc: CompanyAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName,
      institution: newAccInstitution,
      accountNumber: newAccNumber || "N/A",
      accountType: newAccType,
      currency: newAccCurrency,
      balanceKES: Math.max(0, newAccBalance),
      isDefault: false,
      status: "ACTIVE",
    };
    const next = [...editingAccounts, newAcc];
    setEditingAccounts(next);
    setIsAddingNewAccount(false);
    setNewAccName("");
    setNewAccInstitution("");
    setNewAccNumber("");
    setNewAccBalance(50000);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (!confirm(`Remove account "${name}" from company vault?`)) return;
    setEditingAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveAccounts = (e: React.FormEvent) => {
    e.preventDefault();
    saveAccountsToStorage(editingAccounts);
    setAccounts(editingAccounts);
    setIsAccountsModalOpen(false);
    const newTotal = editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0);
    showToast(`Company vault accounts updated. Total Vault Cash is now ${formatKES(newTotal)}`);
  };

  useEffect(() => {
    const refreshData = () => {
      setInvoices(loadInvoicesFromStorage());
      setExpenses(loadExpensesFromStorage());
      setClientSubs(loadSubscriptionsFromStorage());
      setAccounts(loadAccountsFromStorage());
      setReserves(loadReservesFromStorage());
      setBudgets(loadBudgetsFromStorage());
      setVendorSubs(loadOperationalSubscriptions());
    };

    refreshData();

    window.addEventListener("versaly_finance_updated", refreshData);
    window.addEventListener("versaly_accounts_updated", refreshData);
    window.addEventListener("versaly_reserves_updated", refreshData);
    window.addEventListener("versaly_budgets_updated", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("versaly_finance_updated", refreshData);
      window.removeEventListener("versaly_accounts_updated", refreshData);
      window.removeEventListener("versaly_reserves_updated", refreshData);
      window.removeEventListener("versaly_budgets_updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const summary = useMemo(() => {
    return computeFinanceSummary(invoices, expenses, clientSubs);
  }, [invoices, expenses, clientSubs]);

  // Aggregate Treasury Calculations
  const treasury = useMemo(() => {
    const totalCash = accounts.reduce((sum, a) => sum + a.balanceKES, 0);
    const totalReserves = reserves.reduce((sum, r) => sum + r.currentAllocatedKES, 0);
    const unencumberedCash = totalCash - totalReserves;

    // Monthly burn rate calculation
    const monthlyVendorSubs = vendorSubs
      .filter((s) => s.status === "ACTIVE")
      .reduce((sum, s) => {
        if (s.billingCycle === "ANNUAL") return sum + Math.round(s.costKES / 12);
        if (s.billingCycle === "QUARTERLY") return sum + Math.round(s.costKES / 3);
        return sum + s.costKES;
      }, 0);

    const monthlyExpenses = summary.totalExpenses > 0 ? summary.totalExpenses : 45000;
    const monthlyBurnRate = monthlyExpenses + monthlyVendorSubs;

    // Estimated runway in months
    const cashRunwayMonths = monthlyBurnRate > 0 ? (totalCash / monthlyBurnRate).toFixed(1) : "12+";

    // 90-Day Startup Budget Utilization
    const startupBudget = budgets.find((b) => b.period === "NINETY_DAY_STARTUP") || budgets[0];
    const budgetAllocated = startupBudget?.totalBudgetKES || 120000;
    const budgetSpent = startupBudget?.items.reduce((s, i) => s + i.spentKES, 0) || 0;
    const budgetUtilPct = Math.round((budgetSpent / budgetAllocated) * 100);

    return {
      totalCash,
      totalReserves,
      unencumberedCash,
      monthlyBurnRate,
      cashRunwayMonths,
      budgetAllocated,
      budgetSpent,
      budgetUtilPct,
    };
  }, [accounts, reserves, vendorSubs, summary.totalExpenses, budgets]);

  const setupPct = Math.min(100, Math.round((summary.setupFeesCollected / SETUP_FEE_LAUNCH_TARGET) * 100));
  const mrrPct = Math.min(100, Math.round((summary.effectiveMRR / MRR_LAUNCH_TARGET) * 100));

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12 text-slate-100">
        {/* Top Header Banner */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Treasury &amp; Financial Command
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Versaly Core Kenya</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Landmark className="h-6 w-6 text-emerald-400" />
              <span>Financial Overview &amp; Treasury</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Centralized financial governance for company capital, bank accounts, revenue, expenses, budgets, equity, and reserves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none text-xs cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="THIS_QUARTER">This Quarter</option>
                <option value="THIS_YEAR">FY 2026</option>
              </select>
            </div>

            <Link
              href="/finance/invoices"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Link>
            <Link
              href="/finance/expenses"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
            >
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span>Log Expense</span>
            </Link>
          </div>
        </div>

        {/* Section Navigation Quick Grid (Full 10 Core Subsections) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/finance"
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span>Overview</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              Live
            </span>
          </Link>

          <Link
            href="/finance/invoices"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Invoices</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">({invoices.length})</span>
          </Link>

          <Link
            href="/finance/payments"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Receivables</span>
            </div>
            {summary.overdueCount > 0 && (
              <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                {summary.overdueCount} due
              </span>
            )}
          </Link>

          <Link
            href="/finance/expenses"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Expenses</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">({expenses.length})</span>
          </Link>

          <Link
            href="/finance/capital"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Capital &amp; Loans</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">Debt/Eq</span>
          </Link>

          <Link
            href="/finance/equity"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Cap Table</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">51/29/20</span>
          </Link>

          <Link
            href="/finance/budgets"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Budgets</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">90-Day</span>
          </Link>

          <Link
            href="/finance/subscriptions"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Vendor Subscriptions</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">({vendorSubs.length})</span>
          </Link>

          <Link
            href="/finance/reserves"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Cash Reserves</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Earmarks</span>
          </Link>

          <Link
            href="/finance/compensation"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Compensation</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Payroll</span>
          </Link>

          <Link
            href="/finance/revenue"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>Client MRR</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">SaaS</span>
          </Link>

          <Link
            href="/finance/reports"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-white" />
              <span>P&amp;L &amp; Balance</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Audit</span>
          </Link>
        </div>

        {/* PRIMARY FINANCIAL METRIC CARDS (8 High-Impact Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Cash Balance */}
          <div className="liquid-glass p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Total Company Cash</span>
              <Landmark className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {formatKES(treasury.totalCash)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Free: {formatKES(treasury.unencumberedCash)}</span>
              <span className="text-amber-400">Reserves: {formatKES(treasury.totalReserves)}</span>
            </div>
          </div>

          {/* Card 2: Revenue Collected */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-slate-300">Revenue Collected</span>
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-slate-200 font-mono">
              {formatKES(summary.totalCollected)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              Real cash collected across client contracts
            </div>
          </div>

          {/* Card 3: Total Expenses & Net Profit */}
          <div className="liquid-glass p-5 rounded-2xl border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-indigo-300">Net Operating Profit</span>
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
            <div className={`text-2xl font-black font-mono ${summary.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatKES(summary.netProfit)}
            </div>
            <div className="text-[11px] text-slate-400">
              Expenses: {formatKES(summary.totalExpenses)}
            </div>
          </div>

          {/* Card 4: Burn Rate & Cash Runway */}
          <div className="liquid-glass p-5 rounded-2xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-semibold text-amber-300">Runway &amp; Monthly Burn</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {treasury.cashRunwayMonths} Months
            </div>
            <div className="text-[11px] text-slate-400">
              Est. Burn: {formatKES(treasury.monthlyBurnRate)} / mo
            </div>
          </div>
        </div>

        {/* Multi-Vault Account Balances Row */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Company Account Balances
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Total Liquidity: <strong className="text-emerald-400">{formatKES(treasury.totalCash)}</strong>
              </span>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                title="Manage Account Balances"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Manage Accounts</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{acc.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                    {acc.currency}
                  </span>
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {formatKES(acc.balanceKES)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{acc.institution}</span>
                  <span className="font-mono text-slate-500">{acc.accountNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Launch Targets & 90-Day Budget Utilization Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Setup Fees Target */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Setup Fees Collected
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {formatKES(SETUP_FEE_LAUNCH_TARGET)}
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">
                {setupPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${setupPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(summary.setupFeesCollected)}</span>
              <span className="text-slate-500">
                Rem: {formatKES(Math.max(0, SETUP_FEE_LAUNCH_TARGET - summary.setupFeesCollected))}
              </span>
            </div>
          </div>

          {/* MRR Target */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Monthly Recurring Revenue (MRR)
                </span>
                <span className="text-[11px] text-slate-400">
                  Target: {formatKES(MRR_LAUNCH_TARGET)}/mo
                </span>
              </div>
              <span className="text-xs font-bold font-mono text-indigo-400">
                {mrrPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${mrrPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(summary.effectiveMRR)} MRR</span>
              <span className="text-slate-500">ARR: {formatKES(summary.effectiveARR)}</span>
            </div>
          </div>

          {/* 90-Day Budget Headroom */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  90-Day Startup Budget Spend
                </span>
                <span className="text-[11px] text-slate-400">
                  Baseline: {formatKES(treasury.budgetAllocated)}
                </span>
              </div>
              <span className={`text-xs font-bold font-mono ${treasury.budgetUtilPct > 100 ? "text-rose-400" : "text-blue-400"}`}>
                {treasury.budgetUtilPct}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${treasury.budgetUtilPct > 100 ? "bg-rose-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
                style={{ width: `${Math.min(100, treasury.budgetUtilPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-bold">{formatKES(treasury.budgetSpent)} Spent</span>
              <span className="text-slate-500">
                Headroom: {formatKES(Math.max(0, treasury.budgetAllocated - treasury.budgetSpent))}
              </span>
            </div>
          </div>
        </div>

        {/* Product Revenue Distribution */}
        <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Revenue by Product Suite
              </span>
              <span className="text-[11px] text-slate-400">
                Performance breakdown across Versaly vertical software systems
              </span>
            </div>
            <Link
              href="/finance/revenue"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View Subscriptions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(summary.productRevenue).map(([prod, rev]) => (
              <div key={prod} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-xs font-semibold block truncate">{prod}</span>
                <div className="text-sm font-bold text-white font-mono">
                  {formatKES(rev)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {summary.totalCollected > 0 ? Math.round((rev / summary.totalCollected) * 100) : 0}% of collections
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Columns: Recent Invoices & Recent Cash Receipts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Invoices
                </span>
              </div>
              <Link
                href="/finance/invoices"
                className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View All ({invoices.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Receipt className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No invoices issued yet.</p>
                <Link
                  href="/finance/invoices"
                  className="text-xs text-emerald-400 font-semibold hover:underline inline-block"
                >
                  + Create your first client invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {invoices.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono text-[11px]">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            inv.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : inv.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : inv.status === "SENT"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs font-medium truncate mt-0.5">
                        {inv.clientName}
                      </div>
                      <div className="text-[10px] text-slate-500">Due: {inv.dueDate}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-200">
                        {formatKES(inv.totalKES)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Bal: {formatKES(inv.balanceKES)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments & Reconciliations */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Cash Receipts
                </span>
              </div>
              <Link
                href="/finance/payments"
                className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Ledger ({summary.allPayments.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {summary.allPayments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ArrowDownLeft className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No payment records logged yet.</p>
                <Link
                  href="/finance/payments"
                  className="text-xs text-emerald-400 font-semibold hover:underline inline-block"
                >
                  + Record incoming payment
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.allPayments.slice(0, 5).map((pay) => (
                  <div
                    key={pay.id || pay.referenceNumber}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 font-mono text-[11px]">
                          {pay.referenceNumber}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {pay.channel.replace("_", " ")}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs font-medium truncate mt-0.5">
                        {pay.clientName} ({pay.invoiceNumber})
                      </div>
                      <div className="text-[10px] text-slate-500">{pay.receivedAt}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-emerald-400">
                        + {formatKES(pay.amountKES)}
                      </div>
                      <div className="text-[10px] text-slate-500">Reconciled</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-100" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* MANAGE COMPANY VAULT ACCOUNTS MODAL */}
        {isAccountsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Company Vault Accounts &amp; Real Cash Balances</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Aggregate Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Consolidated Vault Liquidity</span>
                  <p className="text-2xl font-black text-white font-mono mt-0.5">
                    {formatKES(editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0))}
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-400">
                  <span>Free Operating Cash: </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatKES(
                      Math.max(
                        0,
                        editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0) - treasury.totalReserves
                      )
                    )}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ({formatKES(treasury.totalReserves)} internal reserves earmarked)
                  </div>
                </div>
              </div>

              {/* Account list with balance inputs */}
              <form onSubmit={handleSaveAccounts} className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {editingAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{acc.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            {acc.currency}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{acc.institution}</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="font-mono text-slate-500">Acc: {acc.accountNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <label className="text-[10px] text-slate-400 block font-medium">Balance (KES)</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={acc.balanceKES}
                            onChange={(e) => handleAccountBalanceChange(acc.id, Number(e.target.value))}
                            className="w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono text-right focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        {editingAccounts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition mt-3 cursor-pointer"
                            title="Remove account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new account expandable form */}
                {!isAddingNewAccount ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAccount(true)}
                    className="w-full py-2.5 border border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Account / Vault</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Add New Account</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAccount(false)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Account Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Equity Bank Checking"
                          value={newAccName}
                          onChange={(e) => setNewAccName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Institution *</label>
                        <input
                          type="text"
                          placeholder="e.g. Equity Bank Kenya"
                          value={newAccInstitution}
                          onChange={(e) => setNewAccInstitution(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Account / Till / Paybill #</label>
                        <input
                          type="text"
                          placeholder="Account or Till number"
                          value={newAccNumber}
                          onChange={(e) => setNewAccNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Initial Balance (KES)</label>
                        <input
                          type="number"
                          placeholder="Initial Balance"
                          value={newAccBalance}
                          onChange={(e) => setNewAccBalance(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewAccount}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add to Vault List
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAccountsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                  >
                    Save Vault Balances
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
