"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CompensationRecord,
  CompensationCategory,
  loadCompensationRecords,
  saveCompensationRecords,
  formatKES,
  loadAccountsFromStorage,
  loadFinanceRole,
} from "@/lib/finance-store";
import {
  Banknote,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  FileCheck2,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";

export default function CompensationPage() {
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Record Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CompensationRecord | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [compType, setCompType] = useState<CompensationCategory>("SALARY");
  const [amountKES, setAmountKES] = useState<number>(50000);
  const [paymentDate, setPaymentDate] = useState("2026-10-26");
  const [paymentMethod, setPaymentMethod] = useState<CompensationRecord["paymentMethod"]>("MPESA_B2C");
  const [status, setStatus] = useState<CompensationRecord["status"]>("PENDING_APPROVAL");
  const [periodCovered, setPeriodCovered] = useState("October 2026");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Commission Calculator Drawer/Tool
  const [isCommissionCalculatorOpen, setIsCommissionCalculatorOpen] = useState(false);
  const [dealValueKES, setDealValueKES] = useState<number>(350000);
  const [commissionRatePct, setCommissionRatePct] = useState<number>(10);
  const [salesRepName, setSalesRepName] = useState("Sales Lead");

  useEffect(() => {
    try {
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch {}

    setRecords(loadCompensationRecords());

    const handleSync = () => {
      setRecords(loadCompensationRecords());
    };

    window.addEventListener("versaly_compensation_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_compensation_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stats = useMemo(() => {
    const approvedOrPaid = records.filter((r) => r.status === "PAID" || r.status === "APPROVED");
    const totalPaid = records.filter((r) => r.status === "PAID").reduce((s, r) => s + r.amountKES, 0);
    const pendingApproval = records.filter((r) => r.status === "PENDING_APPROVAL");
    const pendingTotal = pendingApproval.reduce((s, r) => s + r.amountKES, 0);

    const salariesTotal = approvedOrPaid
      .filter((r) => r.type === "SALARY")
      .reduce((s, r) => s + r.amountKES, 0);
    const commissionsTotal = approvedOrPaid
      .filter((r) => r.type === "COMMISSION")
      .reduce((s, r) => s + r.amountKES, 0);
    const contractorTotal = approvedOrPaid
      .filter((r) => r.type === "CONTRACTOR_FEE")
      .reduce((s, r) => s + r.amountKES, 0);
    const dividendsTotal = approvedOrPaid
      .filter((r) => r.type === "DIVIDEND_DISTRIBUTION")
      .reduce((s, r) => s + r.amountKES, 0);

    return {
      totalPaid,
      pendingCount: pendingApproval.length,
      pendingTotal,
      salariesTotal,
      commissionsTotal,
      contractorTotal,
      dividendsTotal,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        rec.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.referenceNumber && rec.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === "ALL" || rec.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [records, searchQuery, typeFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setRecipientName("");
    setRoleTitle("");
    setCompType("SALARY");
    setAmountKES(50000);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("MPESA_B2C");
    setStatus("PENDING_APPROVAL");
    setPeriodCovered("October 2026");
    setReferenceNumber("");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: CompensationRecord) => {
    setEditingRecord(rec);
    setRecipientName(rec.recipientName);
    setRoleTitle(rec.roleTitle);
    setCompType(rec.type);
    setAmountKES(rec.amountKES);
    setPaymentDate(rec.paymentDate);
    setPaymentMethod(rec.paymentMethod);
    setStatus(rec.status);
    setPeriodCovered(rec.periodCovered);
    setReferenceNumber(rec.referenceNumber || "");
    setNotes(rec.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || amountKES <= 0) return;

    let next: CompensationRecord[];
    if (editingRecord) {
      next = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              recipientName,
              roleTitle,
              type: compType,
              amountKES,
              paymentDate,
              paymentMethod,
              status,
              periodCovered,
              referenceNumber: referenceNumber || undefined,
              notes: notes || undefined,
            }
          : r
      );
    } else {
      const newRec: CompensationRecord = {
        id: `comp-${Date.now()}`,
        recipientName,
        roleTitle,
        type: compType,
        amountKES,
        paymentDate,
        paymentMethod,
        status,
        periodCovered,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      };
      next = [newRec, ...records];
    }

    saveCompensationRecords(next);
    setRecords(next);
    setIsModalOpen(false);
    showToast(editingRecord ? "Compensation record updated" : "Compensation record logged");
  };

  const handleApprove = (rec: CompensationRecord) => {
    const next = records.map((r) =>
      r.id === rec.id
        ? {
            ...r,
            status: "APPROVED" as const,
            approvedBy: "Founder & CEO",
            approvalDate: new Date().toISOString().split("T")[0],
          }
        : r
    );
    saveCompensationRecords(next);
    setRecords(next);
    showToast(`Approved compensation for ${rec.recipientName}`);
  };

  const handleMarkPaid = (rec: CompensationRecord) => {
    const ref = prompt("Enter M-Pesa / Bank Reference Number (e.g. QK8912KL99):", rec.referenceNumber || "QK" + Math.floor(10000000 + Math.random() * 90000000));
    if (!ref) return;

    const next = records.map((r) =>
      r.id === rec.id
        ? {
            ...r,
            status: "PAID" as const,
            referenceNumber: ref,
            paymentDate: new Date().toISOString().split("T")[0],
          }
        : r
    );
    saveCompensationRecords(next);
    setRecords(next);
    showToast(`Payment executed for ${rec.recipientName} (${formatKES(rec.amountKES)})`);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete compensation record for ${name}?`)) return;
    const next = records.filter((r) => r.id !== id);
    saveCompensationRecords(next);
    setRecords(next);
    showToast(`Removed compensation entry for ${name}`);
  };

  const handleCreateCommissionFromCalc = () => {
    const calculatedAmount = Math.round((dealValueKES * commissionRatePct) / 100);
    setRecipientName(salesRepName);
    setRoleTitle("Sales Executive");
    setCompType("COMMISSION");
    setAmountKES(calculatedAmount);
    setNotes(`Commission for closed contract worth ${formatKES(dealValueKES)} at ${commissionRatePct}% rate`);
    setIsCommissionCalculatorOpen(false);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ["Recipient", "Role", "Category", "Amount (KES)", "Period", "Date", "Method", "Status", "Reference", "Notes"];
    const rows = records.map((r) => [
      `"${r.recipientName}"`,
      `"${r.roleTitle}"`,
      r.type,
      r.amountKES,
      `"${r.periodCovered}"`,
      r.paymentDate,
      r.paymentMethod,
      r.status,
      `"${r.referenceNumber || ""}"`,
      `"${r.notes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `versaly-compensation-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Compensation records exported to CSV");
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
              <span>Compensation & Distributions</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Banknote className="w-8 h-8 text-indigo-400" />
              Compensation, Commissions & Distributions
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Payroll salaries, sales commissions, contractor disbursements, and board-authorized shareholder dividends.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCommissionCalculatorOpen(!isCommissionCalculatorOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-sm transition-all"
            >
              <TrendingUp className="w-4 h-4" />
              Commission Calculator
            </button>
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
              Record Compensation
            </button>
          </div>
        </div>

        {/* MANDATORY GOVERNANCE SAFEGUARD BANNER */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <span className="font-bold text-amber-300">FIDUCIARY & STATUTORY NOTICE:</span> Client revenue belongs entirely to the company. Never automatically distribute client payments by shareholder percentages. Operating costs, statutory payroll deductions (PAYE, NSSF, SHIF/NHIF, Housing Levy), and capital reserves must be accounted for before any dividend distribution.
              <div className="mt-1 text-slate-400 text-xs">
                Dividend declarations require formal board approval and must reference actual legally issued share capital filed at BRS.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Board Approval Required
          </span>
        </div>

        {/* Commission Calculator Tool (Collapsible) */}
        {isCommissionCalculatorOpen && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Sales Commission Tier Calculator
                </h2>
                <p className="text-xs text-slate-400">
                  Compute performance commissions for client deals closed in Versaly Core.
                </p>
              </div>
              <button
                onClick={() => setIsCommissionCalculatorOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Deal Value (KES)</label>
                <input
                  type="number"
                  min="0"
                  value={dealValueKES}
                  onChange={(e) => setDealValueKES(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={commissionRatePct}
                  onChange={(e) => setCommissionRatePct(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Sales Representative</label>
                <input
                  type="text"
                  value={salesRepName}
                  onChange={(e) => setSalesRepName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-950/80 border border-slate-800 gap-3">
              <div className="text-xs text-slate-300">
                Calculated Payout:{" "}
                <span className="text-lg font-bold text-emerald-400 font-mono ml-2">
                  {formatKES(Math.round((dealValueKES * commissionRatePct) / 100))}
                </span>
                <span className="text-slate-500 ml-2">({commissionRatePct}% of {formatKES(dealValueKES)})</span>
              </div>
              <button
                onClick={handleCreateCommissionFromCalc}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
              >
                Create Payout Record
              </button>
            </div>
          </div>
        )}

        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Paid Out</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(stats.totalPaid)}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">
              Disbursed via M-Pesa B2C & Wire
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">
              {formatKES(stats.pendingTotal)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {stats.pendingCount} payment requests awaiting CEO review
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Staff & Founder Salaries</span>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(stats.salariesTotal)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Approved core payroll
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Commissions & Contractor Fees</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2 font-mono">
              {formatKES(stats.commissionsTotal + stats.contractorTotal)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              Sales incentives + engineering deliverables
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient, role, reference..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="SALARY">Salaries</option>
              <option value="COMMISSION">Sales Commission</option>
              <option value="CONTRACTOR_FEE">Contractor Fees</option>
              <option value="REIMBURSEMENT">Reimbursements</option>
              <option value="SHAREHOLDER_LOAN_REPAYMENT">Loan Repayments</option>
              <option value="DIVIDEND_DISTRIBUTION">Dividends</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved (Ready to Pay)</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Amount (KES)</th>
                  <th className="p-3.5">Coverage Period</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Reference / Notes</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-all">
                      <td className="p-3.5">
                        <div className="font-semibold text-white text-sm">{rec.recipientName}</div>
                        <div className="text-[11px] text-slate-400">{rec.roleTitle}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300 border border-slate-700">
                          {rec.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                        {formatKES(rec.amountKES)}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {rec.periodCovered}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          {rec.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">
                        {rec.paymentDate}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          rec.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : rec.status === "APPROVED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : rec.status === "PENDING_APPROVAL"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}>
                          {rec.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                          {rec.status === "APPROVED" && <ShieldCheck className="w-3 h-3" />}
                          {rec.status === "PENDING_APPROVAL" && <Clock className="w-3 h-3" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-[11px] text-slate-400">
                        {rec.referenceNumber && (
                          <span className="font-mono text-indigo-300 block font-medium">Ref: {rec.referenceNumber}</span>
                        )}
                        <span className="truncate block">{rec.notes || "—"}</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rec.status === "PENDING_APPROVAL" && (
                            <button
                              onClick={() => handleApprove(rec)}
                              className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-medium border border-indigo-500/30"
                              title="Approve for payout"
                            >
                              Approve
                            </button>
                          )}
                          {rec.status === "APPROVED" && (
                            <button
                              onClick={() => handleMarkPaid(rec)}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-medium border border-emerald-500/30"
                              title="Execute payment"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id, rec.recipientName)}
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
                  <Banknote className="w-5 h-5 text-indigo-400" />
                  {editingRecord ? "Edit Compensation Record" : "Record Compensation / Disbursement"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Ted (Founder & CEO)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Role / Function</label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Lead Full-Stack Engineer"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Disbursement Category</label>
                    <select
                      value={compType}
                      onChange={(e) => setCompType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="SALARY">Founder / Staff Salary</option>
                      <option value="COMMISSION">Sales Commission</option>
                      <option value="CONTRACTOR_FEE">Contractor Fee</option>
                      <option value="REIMBURSEMENT">Approved Reimbursement</option>
                      <option value="SHAREHOLDER_LOAN_REPAYMENT">Shareholder Loan Repayment</option>
                      <option value="DIVIDEND_DISTRIBUTION">Dividends (Board Authorized)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Amount (KES) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amountKES}
                      onChange={(e) => setAmountKES(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Coverage Period</label>
                    <input
                      type="text"
                      value={periodCovered}
                      onChange={(e) => setPeriodCovered(e.target.value)}
                      placeholder="e.g. October 2026"
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
                      <option value="MPESA_B2C">M-Pesa B2C</option>
                      <option value="BANK_TRANSFER">Bank Transfer (EFT)</option>
                      <option value="CASH">Petty Cash</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Approval Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Paid</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Payment / Target Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Transaction Ref (Optional)</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. M-Pesa Receipt Code"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Notes / Board Resolution</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Milestone delivered, board minutes reference, contract terms..."
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
                    Save Disbursement
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
