"use client";

import { useState, useEffect, useMemo } from "react";
import { FinanceInvoice, FinanceExpense, ClientSubscription, CompanyAccount, CashReserveFund, BudgetPlan, OperationalSubscription, saveAccountsToStorage, formatKES, loadInvoicesFromStorage, loadExpensesFromStorage, loadSubscriptionsFromStorage, loadAccountsFromStorage, loadReservesFromStorage, loadBudgetsFromStorage, loadOperationalSubscriptions, computeFinanceSummary, SETUP_FEE_LAUNCH_TARGET, MRR_LAUNCH_TARGET } from "@/lib/finance-store";


export function useFinanceOverview() {
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
  const [newAccCurrency] = useState("KES");
  const [newAccType] = useState<CompanyAccount["accountType"]>("BANK_CHECKING");

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

  return {
    invoices,
    setInvoices,
    expenses,
    setExpenses,
    clientSubs,
    setClientSubs,
    accounts,
    setAccounts,
    reserves,
    setReserves,
    budgets,
    setBudgets,
    vendorSubs,
    setVendorSubs,
    dateRange,
    setDateRange,
    toastMessage,
    setToastMessage,
    isAccountsModalOpen,
    setIsAccountsModalOpen,
    editingAccounts,
    setEditingAccounts,
    isAddingNewAccount,
    setIsAddingNewAccount,
    newAccName,
    setNewAccName,
    newAccInstitution,
    setNewAccInstitution,
    newAccNumber,
    setNewAccNumber,
    newAccBalance,
    setNewAccBalance,
    newAccCurrency,
    newAccType,
    showToast,
    handleOpenAccountsModal,
    handleAccountBalanceChange,
    handleAddNewAccount,
    handleDeleteAccount,
    handleSaveAccounts,
    summary,
    treasury,
    setupPct,
    mrrPct,
  };
}

export type FinanceOverviewModel = ReturnType<typeof useFinanceOverview>;
