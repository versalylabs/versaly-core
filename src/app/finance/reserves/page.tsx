"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CashReserveFund,
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
  Scale,
  Landmark,
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
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Company Vault Cash</span>
              <Landmark className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(stats.totalCompanyCash)}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              Across KCB, Safaricom M-Pesa & Petty Cash
            </span>
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
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Allocated Balance:</span>
                        <span className="font-bold text-white font-mono text-sm">
                          {formatKES(fund.currentAllocatedKES)}
                        </span>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Target Amount (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fundTargetKES}
                      onChange={(e) => setFundTargetKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Target Runway (Months)</label>
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
      </div>
    </WorkspaceLayout>
  );
}
