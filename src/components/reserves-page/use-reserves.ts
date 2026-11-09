"use client";

import { useState, useEffect, useMemo } from "react";
import { CashReserveFund, loadReservesFromStorage, loadAccountsFromStorage, CompanyAccount, formatKES, saveReservesToStorage, saveAccountsToStorage } from "@/lib/finance-store";


export function useReserves() {
  const [reserves, setReserves] = useState<CashReserveFund[]>(() => loadReservesFromStorage());
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
  const [newAccCurrency] = useState("KES");
  const [newAccType] = useState<CompanyAccount["accountType"]>("BANK_CHECKING");

  useEffect(() => {
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

  return {
    reserves,
    setReserves,
    accounts,
    setAccounts,
    toastMessage,
    setToastMessage,
    isTransferModalOpen,
    setIsTransferModalOpen,
    selectedFund,
    setSelectedFund,
    transferType,
    setTransferType,
    transferAmount,
    setTransferAmount,
    transferNotes,
    setTransferNotes,
    isFundModalOpen,
    setIsFundModalOpen,
    editingFund,
    setEditingFund,
    fundName,
    setFundName,
    fundPurpose,
    setFundPurpose,
    fundTargetKES,
    setFundTargetKES,
    fundAllocatedKES,
    setFundAllocatedKES,
    fundRunwayMonths,
    setFundRunwayMonths,
    fundNotes,
    setFundNotes,
    editingBalanceFundId,
    setEditingBalanceFundId,
    quickBalanceValue,
    setQuickBalanceValue,
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
    stats,
    handleOpenTransfer,
    handleExecuteTransfer,
    handleOpenAddFund,
    handleOpenEditFund,
    handleSaveFund,
    handleDeleteFund,
    handleStartQuickEdit,
    handleSaveQuickBalance,
    handleOpenAccountsModal,
    handleAccountBalanceChange,
    handleAddNewAccount,
    handleDeleteAccount,
    handleSaveAccounts,
  };
}

export type ReservesModel = ReturnType<typeof useReserves>;
