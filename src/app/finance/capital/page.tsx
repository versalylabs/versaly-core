"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CapitalContribution,
  ShareholderLoan,
  loadCapitalContributions,
  saveCapitalContributions,
  loadShareholderLoans,
  saveShareholderLoans,
  loadAccountsFromStorage,
  formatKES,
  CapitalType,
} from "@/lib/finance-store";
import {
  Landmark,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Percent,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Receipt,
  Scale,
} from "lucide-react";

export default function CapitalFinancingPage() {
  const [contributions, setContributions] = useState<CapitalContribution[]>([]);
  const [loans, setLoans] = useState<ShareholderLoan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"CONTRIBUTIONS" | "LOANS">("CONTRIBUTIONS");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Contribution Modal
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<CapitalContribution | null>(null);
  const [contributorName, setContributorName] = useState("");
  const [contributionAmount, setContributionAmount] = useState<number>(50000);
  const [contributionDate, setContributionDate] = useState("2026-10-26");
  const [contributionType, setContributionType] = useState<CapitalType>("EQUITY_CAPITAL");
  const [contributionStatus, setContributionStatus] = useState<"RECEIVED" | "PENDING">("RECEIVED");
  const [supportingDoc, setSupportingDoc] = useState("");
  const [contributionNotes, setContributionNotes] = useState("");

  // New Shareholder Loan Modal
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanLender, setLoanLender] = useState("");
  const [loanPrincipal, setLoanPrincipal] = useState<number>(100000);
  const [loanInterestPct, setLoanInterestPct] = useState<number>(6.0);
  const [loanStartDate, setLoanStartDate] = useState("2026-10-26");
  const [loanTermMonths, setLoanTermMonths] = useState<number>(12);
  const [loanNotes, setLoanNotes] = useState("");

  // Loan Repayment Modal
  const [repayingLoan, setRepayingLoan] = useState<ShareholderLoan | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(15000);
  const [repayDate, setRepayDate] = useState("2026-10-26");
  const [repayRef, setRepayRef] = useState("");

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      setContributionDate(todayStr);
      setLoanStartDate(todayStr);
      setRepayDate(todayStr);
    } catch {}

    setContributions(loadCapitalContributions());
    setLoans(loadShareholderLoans());

    const handleSync = () => {
      setContributions(loadCapitalContributions());
      setLoans(loadShareholderLoans());
    };

    window.addEventListener("versaly_capital_updated", handleSync);
    window.addEventListener("versaly_loans_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_capital_updated", handleSync);
      window.removeEventListener("versaly_loans_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Capital Totals
  const stats = useMemo(() => {
    const totalReceivedCapital = contributions
      .filter((c) => c.status === "RECEIVED")
      .reduce((sum, c) => sum + c.amountKES, 0);

    const equityCapital = contributions
      .filter((c) => c.type === "EQUITY_CAPITAL" && c.status === "RECEIVED")
      .reduce((sum, c) => sum + c.amountKES, 0);

    const pendingPledged = contributions
      .filter((c) => c.status === "PENDING")
      .reduce((sum, c) => sum + c.amountKES, 0);

    const totalLoansPrincipal = loans.reduce((sum, l) => sum + l.principalAmountKES, 0);
    const totalLoansRepaid = loans.reduce((sum, l) => sum + l.amountRepaidKES, 0);
    const totalLoansOutstanding = loans
      .filter((l) => l.status === "ACTIVE")
      .reduce((sum, l) => sum + l.remainingBalanceKES, 0);

    return {
      totalReceivedCapital,
      equityCapital,
      pendingPledged,
      totalLoansPrincipal,
      totalLoansRepaid,
      totalLoansOutstanding,
    };
  }, [contributions, loans]);

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      const matchSearch =
        c.contributorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.supportingDoc && c.supportingDoc.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = typeFilter === "ALL" || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [contributions, searchQuery, typeFilter]);

  // Handle Save Contribution
  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName.trim() || contributionAmount <= 0) return;

    if (editingContribution) {
      const updated = contributions.map((c) =>
        c.id === editingContribution.id
          ? {
              ...c,
              contributorName: contributorName.trim(),
              amountKES: Number(contributionAmount),
              contributionDate,
              type: contributionType,
              status: contributionStatus,
              supportingDoc: supportingDoc.trim() || undefined,
              notes: contributionNotes.trim() || undefined,
            }
          : c
      );
      setContributions(updated);
      saveCapitalContributions(updated);
      showToast("✓ Capital contribution updated successfully!");
    } else {
      const newContribution: CapitalContribution = {
        id: `cap-${Date.now()}`,
        contributorName: contributorName.trim(),
        amountKES: Number(contributionAmount),
        contributionDate,
        type: contributionType,
        status: contributionStatus,
        supportingDoc: supportingDoc.trim() || undefined,
        notes: contributionNotes.trim() || undefined,
      };

      // If it's a shareholder loan, create linked loan record
      if (contributionType === "SHAREHOLDER_LOAN") {
        const monthlyEst = Math.round(
          (Number(contributionAmount) * (1 + 0.06)) / 12
        );
        const newLoan: ShareholderLoan = {
          id: `loan-${Date.now()}`,
          contributionId: newContribution.id,
          lenderName: contributorName.trim(),
          principalAmountKES: Number(contributionAmount),
          interestRateAnnualPct: 6.0,
          startDate: contributionDate,
          repaymentTermMonths: 12,
          amountRepaidKES: 0,
          remainingBalanceKES: Number(contributionAmount),
          monthlyInstallmentKES: monthlyEst,
          nextPaymentDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          status: "ACTIVE",
          notes: "Generated from shareholder loan contribution record",
        };
        const updatedLoans = [newLoan, ...loans];
        setLoans(updatedLoans);
        saveShareholderLoans(updatedLoans);
      }

      const updated = [newContribution, ...contributions];
      setContributions(updated);
      saveCapitalContributions(updated);
      showToast("✓ New capital contribution logged successfully!");
    }

    setIsContributionModalOpen(false);
    setEditingContribution(null);
    resetContributionForm();
  };

  const resetContributionForm = () => {
    setContributorName("");
    setContributionAmount(50000);
    setContributionDate(new Date().toISOString().split("T")[0]);
    setContributionType("EQUITY_CAPITAL");
    setContributionStatus("RECEIVED");
    setSupportingDoc("");
    setContributionNotes("");
  };

  const handleOpenEdit = (c: CapitalContribution) => {
    setEditingContribution(c);
    setContributorName(c.contributorName);
    setContributionAmount(c.amountKES);
    setContributionDate(c.contributionDate);
    setContributionType(c.type);
    setContributionStatus(c.status as "RECEIVED" | "PENDING");
    setSupportingDoc(c.supportingDoc || "");
    setContributionNotes(c.notes || "");
    setIsContributionModalOpen(true);
  };

  const handleDeleteContribution = (id: string) => {
    if (confirm("Are you sure you want to remove this contribution entry?")) {
      const updated = contributions.filter((c) => c.id !== id);
      setContributions(updated);
      saveCapitalContributions(updated);
      showToast("Contribution record removed.");
    }
  };

  // Handle Record Loan Repayment
  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingLoan || repayAmount <= 0) return;

    const newRepaid = repayingLoan.amountRepaidKES + Number(repayAmount);
    const newRemaining = Math.max(0, repayingLoan.principalAmountKES - newRepaid);

    const updatedLoans = loans.map((l) =>
      l.id === repayingLoan.id
        ? {
            ...l,
            amountRepaidKES: newRepaid,
            remainingBalanceKES: newRemaining,
            status: (newRemaining === 0 ? "FULLY_REPAID" : "ACTIVE") as ShareholderLoan["status"],
            notes: `${l.notes || ""} | Repayment of KES ${repayAmount.toLocaleString()} on ${repayDate} (Ref: ${repayRef || "N/A"})`.trim(),
          }
        : l
    );

    setLoans(updatedLoans);
    saveShareholderLoans(updatedLoans);
    showToast(`✓ Repayment of KES ${repayAmount.toLocaleString()} applied to ${repayingLoan.lenderName}'s loan!`);
    setRepayingLoan(null);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Founders &amp; Financing
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Company Capital Ledger</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Capital Contributions &amp; Shareholder Financing
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Track founder seed injections, shareholder loans, and partner financing.
              <span className="text-amber-400/90 font-medium ml-1">
                Note: Financial contributions do not automatically alter legal shareholding percentages.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/finance/equity"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            >
              <Scale className="h-3.5 w-3.5 text-indigo-400" />
              <span>Equity Cap Table</span>
            </Link>
            <button
              onClick={() => {
                setEditingContribution(null);
                resetContributionForm();
                setIsContributionModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Contribution</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Critical Legal Guardrail Notice */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] block mb-0.5">
              Strict Legal Governance Guardrail
            </span>
            Capital contributions and loans tracked in this module are financial transactions. In accordance with Kenyan Company Law, shares are never automatically issued or diluted by monetary deposits. Legal ownership is managed strictly via authorized board resolutions in the{" "}
            <Link href="/finance/equity" className="text-amber-300 underline font-semibold hover:text-white">
              Ownership &amp; Equity Register
            </Link>.
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Total Capital Received</div>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {formatKES(stats.totalReceivedCapital)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Paid in to company</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Founders Equity Capital</div>
            <div className="text-lg font-bold text-indigo-400 mt-1 font-mono">
              {formatKES(stats.equityCapital)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Non-repayable base</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Shareholder Loans</div>
            <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
              {formatKES(stats.totalLoansPrincipal)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Working capital debt</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Loans Repaid to Date</div>
            <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
              {formatKES(stats.totalLoansRepaid)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Returned to founders</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Outstanding Loan Balance</div>
            <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
              {formatKES(stats.totalLoansOutstanding)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Company liability</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 font-medium">Pending Pledges</div>
            <div className="text-lg font-bold text-purple-300 mt-1 font-mono">
              {formatKES(stats.pendingPledged)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Committed term sheets</div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("CONTRIBUTIONS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeTab === "CONTRIBUTIONS"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              All Capital Injections ({contributions.length})
            </button>
            <button
              onClick={() => setActiveTab("LOANS")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeTab === "LOANS"
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              Shareholder Loans &amp; Amortization ({loans.length})
            </button>
          </div>

          {activeTab === "CONTRIBUTIONS" && (
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search contributor, agreement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Types</option>
                <option value="EQUITY_CAPITAL">Equity Capital</option>
                <option value="SHAREHOLDER_LOAN">Shareholder Loan</option>
                <option value="REIMBURSABLE_EXPENSE">Reimbursable Expense</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CAPITAL INJECTIONS */}
        {activeTab === "CONTRIBUTIONS" && (
          <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Contributor</th>
                    <th className="p-3.5">Type &amp; Category</th>
                    <th className="p-3.5 text-right">Amount (KES)</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Supporting Agreement</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredContributions.map((c) => {
                    const typeBadge = {
                      EQUITY_CAPITAL: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
                      SHAREHOLDER_LOAN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      REIMBURSABLE_EXPENSE: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                      GRANT_SUBSIDY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      OTHER: "bg-slate-800 text-slate-400 border-slate-700",
                    }[c.type];

                    return (
                      <tr key={c.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-xs">{c.contributorName}</div>
                          {c.notes && <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{c.notes}</div>}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeBadge}`}>
                            {c.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-white text-xs">
                          {formatKES(c.amountKES)}
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                          {c.contributionDate}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              c.status === "RECEIVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {c.supportingDoc ? (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                              <FileText className="h-3 w-3 text-indigo-400" />
                              <span className="font-mono">{c.supportingDoc}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-[11px]">Internal resolution</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Edit Contribution"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteContribution(c.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
        )}

        {/* TAB 2: SHAREHOLDER LOANS */}
        {activeTab === "LOANS" && (
          <div className="space-y-4">
            <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Active Shareholder Loans &amp; Repayment Terms</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Loans made by founders/shareholders to fund company cash runway. Repaid via monthly installments out of operational free cash flow.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {loans.map((loan) => {
                  const pctRepaid = Math.round((loan.amountRepaidKES / loan.principalAmountKES) * 100);

                  return (
                    <div key={loan.id} className="p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{loan.lenderName}</h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                loan.status === "ACTIVE"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {loan.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Started: {loan.startDate} • {loan.repaymentTermMonths}-month term @ {loan.interestRateAnnualPct}% p.a.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRepayingLoan(loan);
                              setRepayAmount(loan.monthlyInstallmentKES || 10000);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Record Loan Repayment</span>
                          </button>
                        </div>
                      </div>

                      {/* Repayment Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Repayment Progress</span>
                          <span className="font-mono text-emerald-400 font-semibold">{pctRepaid}% Repaid</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, pctRepaid)}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                          <div className="text-slate-500">Original Principal</div>
                          <div className="font-bold text-white font-mono mt-0.5">
                            {formatKES(loan.principalAmountKES)}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                          <div className="text-slate-500">Total Repaid</div>
                          <div className="font-bold text-emerald-400 font-mono mt-0.5">
                            {formatKES(loan.amountRepaidKES)}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                          <div className="text-slate-500">Remaining Balance</div>
                          <div className="font-bold text-rose-400 font-mono mt-0.5">
                            {formatKES(loan.remainingBalanceKES)}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                          <div className="text-slate-500">Monthly Target</div>
                          <div className="font-bold text-indigo-300 font-mono mt-0.5">
                            {formatKES(loan.monthlyInstallmentKES)} / mo
                          </div>
                        </div>
                      </div>

                      {loan.notes && (
                        <div className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                          Notes: {loan.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD / EDIT CAPITAL CONTRIBUTION */}
        {isContributionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg liquid-glass p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">
                    {editingContribution ? "Edit Capital Contribution" : "Record New Capital Contribution"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsContributionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContribution} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-medium">Contributor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ted (Founder &amp; CEO), Strategic Partner"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Amount (KES)</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(Number(e.target.value))}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium">Date</label>
                    <input
                      type="date"
                      required
                      value={contributionDate}
                      onChange={(e) => setContributionDate(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Contribution Type</label>
                    <select
                      value={contributionType}
                      onChange={(e) => setContributionType(e.target.value as CapitalType)}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="EQUITY_CAPITAL">Equity Capital (Non-repayable)</option>
                      <option value="SHAREHOLDER_LOAN">Shareholder Loan (Repayable)</option>
                      <option value="REIMBURSABLE_EXPENSE">Reimbursable Expense</option>
                      <option value="GRANT_SUBSIDY">Grant / Non-dilutive Subsidy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium">Payment Status</label>
                    <select
                      value={contributionStatus}
                      onChange={(e) => setContributionStatus(e.target.value as "RECEIVED" | "PENDING")}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="RECEIVED">Received in Company Account</option>
                      <option value="PENDING">Pledged / Pending Closing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Supporting Agreement / Doc Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Founders_Resolution_2026.pdf, TermSheet_01"
                    value={supportingDoc}
                    onChange={(e) => setSupportingDoc(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Notes &amp; Purpose</label>
                  <textarea
                    rows={2}
                    placeholder="Context, bank wire receipt reference, terms..."
                    value={contributionNotes}
                    onChange={(e) => setContributionNotes(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsContributionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  >
                    {editingContribution ? "Update Record" : "Save Contribution"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: RECORD LOAN REPAYMENT */}
        {repayingLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md liquid-glass p-6 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    Record Loan Repayment to {repayingLoan.lenderName}
                  </h3>
                </div>
                <button
                  onClick={() => setRepayingLoan(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Outstanding Balance:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {formatKES(repayingLoan.remainingBalanceKES)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Monthly Installment:</span>
                  <span className="font-bold text-white font-mono">
                    {formatKES(repayingLoan.monthlyInstallmentKES)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleRecordRepayment} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-medium">Repayment Amount (KES)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={repayingLoan.remainingBalanceKES}
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(Number(e.target.value))}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium">Repayment Date</label>
                    <input
                      type="date"
                      required
                      value={repayDate}
                      onChange={(e) => setRepayDate(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium">Transaction Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. KCB-EFT-9912"
                      value={repayRef}
                      onChange={(e) => setRepayRef(e.target.value)}
                      className="mt-1 w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRepayingLoan(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                  >
                    Confirm &amp; Record Repayment
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
