"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CashReserveFund,
  CompanyAccount,
  loadReservesFromStorage,
  saveReservesToStorage,
  loadAccountsFromStorage,
  saveAccountsToStorage,
  formatKES,
} from "@/lib/finance-store";
import {
  PiggyBank,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  Plus,
  AlertCircle,
  CheckCircle2,
  Lock,
  Wallet,
  TrendingUp,
  Percent,
  Clock,
  Edit2,
  Trash2,
  X,
  Check,
  Scale,
  Landmark,
  Building2,
  CreditCard,
} from "lucide-react";

export default function CashReservesPage() {
  const [reserves, setReserves] = useState<CashReserveFund[]>([]);
  const [accounts, setAccounts] = useState(loadAccountsFromStorage());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transfer / Allocation Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<CashReserveFund | null>(null);
  const [transferType, setTransferType] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [transferAmount, setTransferAmount] = useState<number>(25000);
  const [transferNotes, setTransferNotes] = useState("");

  // Add / Edit Fund Modal
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<CashReserveFund | null>(null);
  const [fundName, setFundName] = useState("");
  const [fundPurpose, setFundPurpose] = useState("");
  const [fundTargetKES, setFundTargetKES] = useState<number>(200000);
  const [fundAllocatedKES, setFundAllocatedKES] = useState<number>(50000);
  const [fundRunwayMonths, setFundRunwayMonths] = useState<number>(3);
  const [fundNotes, setFundNotes] = useState("");

  // Quick inline edit of Allocated Balance on card
  const [editingBalanceFundId, setEditingBalanceFundId] = useState<string | null>(null);
  const [quickBalanceValue, setQuickBalanceValue] = useState<number>(0);

  // Manage Company Vault Accounts Modal
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [editingAccounts, setEditingAccounts] = useState<CompanyAccount[]>([]);
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccInstitution, setNewAccInstitution] = useState("");
  const [newAccNumber, setNewAccNumber] = useState("");
  const [newAccBalance, setNewAccBalance] = useState<number>(50000);
  const [newAccCurrency, setNewAccCurrency] = useState("KES");
  const [newAccType, setNewAccType] = useState<CompanyAccount["accountType"]>("BANK_CHECKING");

  useEffect(() => {
    setReserves(loadReservesFromStorage());
    setAccounts(loadAccountsFromStorage());

    const handleSync = () => {
      setReserves(loadReservesFromStorage());
      setAccounts(loadAccountsFromStorage());
    };

    window.addEventListener("versaly_reserves_updated", handleSync);
    window.addEventListener("versaly_accounts_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_reserves_updated", handleSync);
      window.removeEventListener("versaly_accounts_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Liquidity Vault Calculations
  const stats = useMemo(() => {
    const totalCompanyCash = accounts.reduce((sum, acc) => sum + acc.balanceKES, 0);
    const totalEarmarkedReserves = reserves.reduce((sum, r) => sum + r.currentAllocatedKES, 0);
    const totalTargets = reserves.reduce((sum, r) => sum + r.targetKES, 0);
    const freeOperatingCash = totalCompanyCash - totalEarmarkedReserves;
    const fundedPercentage = totalTargets > 0 ? (totalEarmarkedReserves / totalTargets) * 100 : 0;

    return {
      totalCompanyCash,
      totalEarmarkedReserves,
      freeOperatingCash,
      totalTargets,
      fundedPercentage,
    };
  }, [accounts, reserves]);

  const handleOpenTransfer = (fund: CashReserveFund, type: "DEPOSIT" | "WITHDRAW") => {
    setSelectedFund(fund);
    setTransferType(type);
    setTransferAmount(25000);
    setTransferNotes("");
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund || transferAmount <= 0) return;

    if (transferType === "DEPOSIT" && transferAmount > stats.freeOperatingCash) {
      alert(`Transfer exceeds unencumbered cash (${formatKES(stats.freeOperatingCash)})`);
      return;
    }

    if (transferType === "WITHDRAW" && transferAmount > selectedFund.currentAllocatedKES) {
      alert(`Withdrawal exceeds fund balance (${formatKES(selectedFund.currentAllocatedKES)})`);
      return;
    }

    const nextReserves = reserves.map((r) => {
      if (r.id !== selectedFund.id) return r;
      const delta = transferType === "DEPOSIT" ? transferAmount : -transferAmount;
      return {
        ...r,
        currentAllocatedKES: Math.max(0, r.currentAllocatedKES + delta),
      };
    });

    saveReservesToStorage(nextReserves);
    setReserves(nextReserves);
    setIsTransferModalOpen(false);
    showToast(
      transferType === "DEPOSIT"
        ? `Allocated ${formatKES(transferAmount)} into ${selectedFund.fundName}`
        : `Released ${formatKES(transferAmount)} from ${selectedFund.fundName} into Free Cash`
    );
  };

  const handleOpenAddFund = () => {
    setEditingFund(null);
    setFundName("");
    setFundPurpose("");
    setFundTargetKES(200000);
    setFundAllocatedKES(0);
    setFundRunwayMonths(3);
    setFundNotes("");
    setIsFundModalOpen(true);
  };

  const handleOpenEditFund = (f: CashReserveFund) => {
    setEditingFund(f);
    setFundName(f.fundName);
    setFundPurpose(f.purpose);
    setFundTargetKES(f.targetKES);
    setFundAllocatedKES(f.currentAllocatedKES);
    setFundRunwayMonths(f.targetMonthsRunway || 3);
    setFundNotes(f.notes || "");
    setIsFundModalOpen(true);
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName || !fundPurpose) return;

    let next: CashReserveFund[];
    if (editingFund) {
      next = reserves.map((r) =>
        r.id === editingFund.id
          ? {
              ...r,
              fundName,
              purpose: fundPurpose,
              targetKES: fundTargetKES,
              currentAllocatedKES: fundAllocatedKES,
              targetMonthsRunway: fundRunwayMonths,
              notes: fundNotes,
            }
          : r
      );
    } else {
      const newFund: CashReserveFund = {
        id: `res-${Date.now()}`,
        fundName,
        purpose: fundPurpose,
        targetKES: fundTargetKES,
        currentAllocatedKES: fundAllocatedKES,
        targetMonthsRunway: fundRunwayMonths,
        notes: fundNotes,
      };
      next = [...reserves, newFund];
    }

    saveReservesToStorage(next);
    setReserves(next);
    setIsFundModalOpen(false);
    showToast(editingFund ? "Reserve fund updated" : "Reserve fund created");
  };

  const handleDeleteFund = (id: string, name: string) => {
    if (!confirm(`Delete reserve fund "${name}"? Any allocated balance will revert to unencumbered cash.`)) return;
    const next = reserves.filter((r) => r.id !== id);
    saveReservesToStorage(next);
    setReserves(next);
    showToast(`Removed reserve fund "${name}"`);
  };

  const handleStartQuickEdit = (fund: CashReserveFund) => {
    setEditingBalanceFundId(fund.id);
    setQuickBalanceValue(fund.currentAllocatedKES);
  };

  const handleSaveQuickBalance = (fundId: string) => {
    const fund = reserves.find((r) => r.id === fundId);
    if (!fund) return;
    const newAllocated = Math.max(0, quickBalanceValue);
    const nextReserves = reserves.map((r) =>
      r.id === fundId ? { ...r, currentAllocatedKES: newAllocated } : r
    );
    saveReservesToStorage(nextReserves);
    setReserves(nextReserves);
    setEditingBalanceFundId(null);
    showToast(`Updated ${fund.fundName} allocated balance to ${formatKES(newAllocated)}`);
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
    if (!newAccName || !newAccInstitution) {
      alert("Please provide the account name and institution");
      return;
    }
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
              <span>Cash Reserves & Savings</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <PiggyBank className="w-8 h-8 text-indigo-400" />
              Cash Reserves & Financial Earmarks
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Internal risk buffers, tax provisions, emergency runway, and capital growth funds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAccountsModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-sm transition-all cursor-pointer"
            >
              <Landmark className="w-4 h-4" />
              <span>Manage Vault Balances</span>
            </button>
            <button
              onClick={handleOpenAddFund}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Reserve Fund
            </button>
          </div>
        </div>

        {/* MANDATORY ACCOUNTING SAFEGUARD BANNER */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <span className="font-bold text-indigo-300">ACCOUNTING SAFEGUARD:</span> Reserve allocations are internal earmarks within company vaults, NOT additional cash and NOT realized expenses. In Balance Sheet and P&L statements, these funds remain part of Total Cash and are never double-counted.
              <div className="mt-1 text-slate-400 text-xs">
                Free Operating Cash reflects cash immediately available after accounting for your internal earmarked buffers.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Zero Double-Counting
          </span>
        </div>

        {/* Vault Liquidity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Company Vault Cash</span>
              <Landmark className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-2xl font-bold text-white font-mono">
                {formatKES(stats.totalCompanyCash)}
              </p>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
                title="Adjust Company Bank & Vault Balances"
              >
                <Edit2 className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Across {accounts.length} bank &amp; M-Pesa accounts</span>
              <button
                type="button"
                onClick={handleOpenAccountsModal}
                className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
              >
                Edit Vaults &rarr;
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Earmarked Reserves</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {formatKES(stats.totalEarmarkedReserves)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {((stats.totalEarmarkedReserves / (stats.totalCompanyCash || 1)) * 100).toFixed(1)}% of total cash ringfenced
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Unencumbered Free Cash</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 font-mono ${stats.freeOperatingCash >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatKES(stats.freeOperatingCash)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Available for day-to-day operations & software builds
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Reserve Target Funding</span>
              <Percent className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {stats.fundedPercentage.toFixed(1)}%
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {formatKES(stats.totalEarmarkedReserves)} / {formatKES(stats.totalTargets)} Target
            </span>
          </div>
        </div>

        {/* Global Reserve Progress Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-white">Aggregated Reserve Funding Progress</span>
            <span className="font-mono text-indigo-400 font-bold">{stats.fundedPercentage.toFixed(1)}% Funded</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, stats.fundedPercentage)}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Reserve Funds Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Designated Reserve Funds</h2>
              <p className="text-xs text-slate-400">
                Track each ringfenced capital pool against its strategic operational target.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {reserves.length} Active Reserve Funds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reserves.map((fund) => {
              const fundingPct = fund.targetKES > 0 ? (fund.currentAllocatedKES / fund.targetKES) * 100 : 0;
              const isTargetMet = fund.currentAllocatedKES >= fund.targetKES;

              return (
                <div
                  key={fund.id}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{fund.fundName}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{fund.purpose}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        isTargetMet
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {fundingPct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-400">Allocated Balance:</span>
                        {editingBalanceFundId === fund.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={quickBalanceValue}
                              onChange={(e) => setQuickBalanceValue(Math.max(0, Number(e.target.value)))}
                              className="w-28 sm:w-32 bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveQuickBalance(fund.id);
                                if (e.key === "Escape") setEditingBalanceFundId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuickBalance(fund.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] flex items-center gap-1 transition"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBalanceFundId(null)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => handleStartQuickEdit(fund)}
                              className="font-bold text-white font-mono text-sm cursor-pointer hover:text-indigo-300 transition-colors"
                              title="Click to edit balance"
                            >
                              {formatKES(fund.currentAllocatedKES)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartQuickEdit(fund)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/30 border border-indigo-500/20 transition-all cursor-pointer"
                              title="Edit Allocated Balance"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Target Envelope:</span>
                        <span className="font-medium text-slate-300 font-mono">
                          {formatKES(fund.targetKES)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Runway Objective:</span>
                        <span className="font-medium text-indigo-300 font-mono">
                          {fund.targetMonthsRunway || 3} Months
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${Math.min(100, fundingPct)}%` }}
                          className={`h-full rounded-full transition-all ${
                            isTargetMet ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-indigo-500"
                          }`}
                        />
                      </div>
                    </div>

                    {fund.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-800/30 p-2.5 rounded-lg">
                        {fund.notes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenTransfer(fund, "DEPOSIT")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Allocate In
                      </button>
                      <button
                        onClick={() => handleOpenTransfer(fund, "WITHDRAW")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Release Out
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                      <button
                        onClick={() => handleOpenEditFund(fund)}
                        className="hover:text-slate-300 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Terms
                      </button>
                      <button
                        onClick={() => handleDeleteFund(fund.id, fund.fundName)}
                        className="hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRANSFER / REALLOCATION MODAL */}
        {isTransferModalOpen && selectedFund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                  {transferType === "DEPOSIT" ? "Allocate Cash to Reserve" : "Release Cash to Free Liquidity"}
                </h3>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-medium">Selected Fund: <span className="text-white font-bold">{selectedFund.fundName}</span></div>
                <div className="text-slate-400">Current Balance: <span className="font-mono text-amber-400 font-bold">{formatKES(selectedFund.currentAllocatedKES)}</span></div>
                <div className="text-slate-400">Unencumbered Free Cash: <span className="font-mono text-emerald-400 font-bold">{formatKES(stats.freeOperatingCash)}</span></div>
              </div>

              <form onSubmit={handleExecuteTransfer} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {transferType === "DEPOSIT" ? "Amount to Ringfence (KES) *" : "Amount to Release (KES) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Allocation Reason / Board Note</label>
                  <textarea
                    rows={2}
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="e.g. Allocation of Q1 client milestone payment buffer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Confirm {transferType === "DEPOSIT" ? "Allocation" : "Release"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT FUND MODAL */}
        {isFundModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-indigo-400" />
                  {editingFund ? "Edit Reserve Fund" : "New Reserve Fund"}
                </h3>
                <button
                  onClick={() => setIsFundModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFund} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Fund Name *</label>
                  <input
                    type="text"
                    required
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    placeholder="e.g. Tax & VAT Provision Fund"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Strategic Purpose *</label>
                  <textarea
                    rows={2}
                    required
                    value={fundPurpose}
                    onChange={(e) => setFundPurpose(e.target.value)}
                    placeholder="Why this buffer exists and when it may be tapped..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Allocated Balance (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fundAllocatedKES}
                      onChange={(e) => setFundAllocatedKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Target Amount (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fundTargetKES}
                      onChange={(e) => setFundTargetKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Runway (Months)</label>
                    <input
                      type="number"
                      min="1"
                      value={fundRunwayMonths}
                      onChange={(e) => setFundRunwayMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Governance Notes</label>
                  <textarea
                    rows={2}
                    value={fundNotes}
                    onChange={(e) => setFundNotes(e.target.value)}
                    placeholder="Approval requirements or statutory rules..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFundModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Save Fund
                  </button>
                </div>
              </form>
            </div>
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
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                  <span>Unencumbered Free Cash: </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatKES(
                      Math.max(
                        0,
                        editingAccounts.reduce((sum, a) => sum + (Number(a.balanceKES) || 0), 0) - stats.totalEarmarkedReserves
                      )
                    )}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ({formatKES(stats.totalEarmarkedReserves)} internal reserves earmarked)
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
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition mt-3"
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
                        className="text-xs text-slate-400 hover:text-white"
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
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
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
