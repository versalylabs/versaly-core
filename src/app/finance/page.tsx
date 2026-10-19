"use client";

import { useState } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  INVOICES_SEED,
  BUSINESS_EXPENSES_SEED,
  InvoiceSeed,
} from "@/data/finance-seed";
import {
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Search,
  DollarSign,
  ArrowUpRight,
  Plus,
  X,
  FileText,
  QrCode,
  Smartphone,
} from "lucide-react";

type FinanceTab = "invoices" | "payments" | "expenses" | "profitability";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("invoices");
  const [invoices, setInvoices] = useState<InvoiceSeed[]>(INVOICES_SEED);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSeed | null>(invoices[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Quick Action notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Invoice form state
  const [newClientName, setNewClientName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("adversoft");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemAmount, setNewItemAmount] = useState(30000);

  // Payment form state
  const [payRef, setPayRef] = useState("");
  const [payChannel, setPayChannel] = useState<"MPESA_PAYBILL" | "MPESA_TILL" | "BANK_TRANSFER">("MPESA_PAYBILL");
  const [payAmount, setPayAmount] = useState(0);

  // Aggregate Metrics
  const totalInvoicedKES = invoices.reduce((sum, inv) => sum + inv.totalKES, 0);
  const totalCollectedKES = invoices.reduce((sum, inv) => sum + inv.amountPaidKES, 0);
  const totalOverdueKES = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + inv.balanceKES, 0);
  const totalExpensesKES = BUSINESS_EXPENSES_SEED.reduce((sum, exp) => sum + exp.amountKES, 0);
  const netOperationalCashflow = totalCollectedKES - totalExpensesKES;

  // Filter Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkAsPaid = (invId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invId) {
          return {
            ...inv,
            status: "PAID",
            amountPaidKES: inv.totalKES,
            balanceKES: 0,
            paidAt: "Today (Just now)",
            payments: [
              ...inv.payments,
              {
                referenceNumber: `MP-DIR-${Date.now().toString().slice(-6)}`,
                channel: "MPESA_PAYBILL",
                amountKES: inv.balanceKES,
                payerName: inv.clientName,
                receivedAt: "Today (Just now)",
              },
            ],
          };
        }
        return inv;
      })
    );
    if (selectedInvoice?.id === invId) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              status: "PAID",
              amountPaidKES: prev.totalKES,
              balanceKES: 0,
              paidAt: "Today (Just now)",
            }
          : null
      );
    }
    setToastMessage("✓ Invoice marked as PAID and transaction reconciled into ledger.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const newPaid = inv.amountPaidKES + payAmount;
          const newBalance = Math.max(0, inv.totalKES - newPaid);
          const newStatus = newBalance === 0 ? "PAID" : inv.status;
          return {
            ...inv,
            status: newStatus,
            amountPaidKES: newPaid,
            balanceKES: newBalance,
            payments: [
              ...inv.payments,
              {
                referenceNumber: payRef || `REC-${Date.now().toString().slice(-6)}`,
                channel: payChannel,
                amountKES: payAmount,
                payerName: inv.clientName,
                receivedAt: "Today (Reconciled)",
              },
            ],
          };
        }
        return inv;
      })
    );

    setSelectedInvoice((prev) =>
      prev
        ? {
            ...prev,
            amountPaidKES: prev.amountPaidKES + payAmount,
            balanceKES: Math.max(0, prev.totalKES - (prev.amountPaidKES + payAmount)),
            status: prev.totalKES - (prev.amountPaidKES + payAmount) <= 0 ? "PAID" : prev.status,
          }
        : null
    );

    setShowPaymentModal(false);
    setPayRef("");
    setToastMessage(`✓ Successfully recorded payment of KES ${payAmount.toLocaleString()} via ${payChannel}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || newItemAmount <= 0) return;

    const subtotal = newItemAmount;
    const tax = Math.round(subtotal * 0.16); // 16% VAT
    const total = subtotal + tax;

    const newInv: InvoiceSeed = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-00${invoices.length + 41}`,
      organizationId: `org-${Date.now()}`,
      clientName: newClientName,
      productSlug: newProductSlug,
      productName:
        newProductSlug === "adversoft"
          ? "Adversoft"
          : newProductSlug === "vehisoft"
          ? "Vehisoft"
          : newProductSlug === "versandry"
          ? "Versandry"
          : newProductSlug === "lipatim"
          ? "LipaTim"
          : "Melio RMS",
      status: "SENT",
      subtotalKES: subtotal,
      taxKES: tax,
      totalKES: total,
      amountPaidKES: 0,
      balanceKES: total,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      kraEtimsQrCode: `010100${invoices.length + 41}KRAETIMS#${newClientName.replace(/\s+/g, "")}#${total}#KES`,
      notes: "Commercial invoice with eTIMS compliance.",
      lineItems: [
        {
          description: newItemDesc || `${newProductSlug.toUpperCase()} Deployment & Setup`,
          quantity: 1,
          unitPrice: subtotal,
          amountKES: subtotal,
        },
      ],
      payments: [],
    };

    setInvoices([newInv, ...invoices]);
    setSelectedInvoice(newInv);
    setShowCreateModal(false);
    setNewClientName("");
    setNewItemDesc("");
    setToastMessage(`✓ Created new invoice ${newInv.invoiceNumber} for ${newInv.clientName}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Operational Finance & Invoicing
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Cashflow, eTIMS & M-Pesa Ledger</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-indigo-400" />
              Invoices, M-Pesa Collections & Cash Flow
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Automated invoice tracking, M-Pesa Paybill / Till reconciliations, KRA eTIMS cryptographic signatures, and operational expense margins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate New Invoice</span>
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Total Cash Inflow (Collected)</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2 font-mono">
              KES {totalCollectedKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>100% reconciled to bank/M-Pesa</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Total Invoiced (Gross)</span>
              <Receipt className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-2 font-mono">
              KES {totalInvoicedKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Across all 5 products</div>
          </div>

          <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <div className="text-xs text-rose-300 font-medium flex items-center justify-between">
              <span>Overdue Receivables</span>
              <AlertCircle className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">
              KES {totalOverdueKES.toLocaleString()}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-2 flex items-center gap-1 font-medium">
              <span>Follow-up WhatsApp reminders queued</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
              <span>Net Operational Cashflow</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
              KES {netOperationalCashflow.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              After KES {totalExpensesKES.toLocaleString()} expenses
            </div>
          </div>
        </div>

        {/* Tab Controls & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "invoices", label: "Invoices & Receivables", count: invoices.length },
              {
                id: "payments",
                label: "M-Pesa & Bank Transactions",
                count: invoices.reduce((c, i) => c + i.payments.length, 0),
              },
              { id: "expenses", label: "Business Expenses", count: BUSINESS_EXPENSES_SEED.length },
              { id: "profitability", label: "Product Margins", count: 5 },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FinanceTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === "invoices" && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search invoice or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter invoices by status"
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="SENT">Sent</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Invoices & Interactive Drawer */}
        {activeTab === "invoices" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Invoice List */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Issued Invoices ({filteredInvoices.length})
              </div>

              <div className="space-y-2.5">
                {filteredInvoices.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500">
                    No invoices recorded yet. Click &quot;Generate New Invoice&quot; to create your first client bill.
                  </div>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    const statusBadge =
                      inv.status === "PAID"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : inv.status === "OVERDUE"
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20";

                    return (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30"
                            : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {inv.productName}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge}`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="font-bold text-white">{inv.clientName}</span>
                          <span className="font-mono font-extrabold text-slate-100">
                            KES {inv.totalKES.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Due: {inv.dueDate}</span>
                          {inv.balanceKES > 0 ? (
                            <span className="text-rose-400 font-medium">
                              Balance: KES {inv.balanceKES.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Settled in Full
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Invoice Detail Inspector & Actions */}
            <div className="lg:col-span-6">
              {selectedInvoice ? (
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-extrabold text-white">
                          {selectedInvoice.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            selectedInvoice.status === "PAID"
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                              : selectedInvoice.status === "OVERDUE"
                              ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          }`}
                        >
                          {selectedInvoice.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Billed to: <strong className="text-slate-200">{selectedInvoice.clientName}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedInvoice.balanceKES > 0 && (
                        <>
                          <button
                            onClick={() => {
                              setPayAmount(selectedInvoice.balanceKES);
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Record Payment</span>
                          </button>
                          <button
                            onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Paid</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Line Items
                    </h3>
                    <div className="rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-2 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 text-slate-300">
                          {selectedInvoice.lineItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3 font-medium text-slate-200">
                                {item.description}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold">
                                {item.amountKES.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-300">
                        KES {selectedInvoice.subtotalKES.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>VAT (16% eTIMS Compliance):</span>
                      <span className="font-mono text-slate-300">
                        KES {selectedInvoice.taxKES.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                      <span>Total Invoiced:</span>
                      <span className="font-mono text-indigo-300">
                        KES {selectedInvoice.totalKES.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 text-slate-400">
                      <span>Amount Paid:</span>
                      <span className="font-mono text-emerald-400">
                        KES {selectedInvoice.amountPaidKES.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1 text-rose-400">
                      <span>Balance Outstanding:</span>
                      <span className="font-mono">
                        KES {selectedInvoice.balanceKES.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* KRA eTIMS Fiscal QR Signature */}
                  {selectedInvoice.kraEtimsQrCode && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
                      <div className="p-2 rounded bg-white text-slate-950 shrink-0">
                        <QrCode className="h-6 w-6" />
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          KRA eTIMS Cryptographic Fiscal Seal
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          {selectedInvoice.kraEtimsQrCode}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reconciled Payments */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reconciled Transactions ({selectedInvoice.payments.length})
                    </h3>
                    {selectedInvoice.payments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedInvoice.payments.map((p, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-emerald-950/15 border border-emerald-500/20 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                                <Smartphone className="h-3.5 w-3.5" />
                                {p.referenceNumber}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {p.payerName} • {p.channel.replace("_", " ")}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-white">
                                + KES {p.amountKES.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-500">{p.receivedAt}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                        No payments received yet for this invoice.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  Select an invoice to inspect line items, eTIMS QR, and payment receipts.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Payments & M-Pesa Reconciliations */}
        {activeTab === "payments" && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-bold text-white">Consolidated M-Pesa & Bank Transactions</h2>
            <div className="space-y-2.5">
              {invoices.flatMap((inv) => inv.payments).length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No payments received yet. Reconciled M-Pesa and bank transactions will appear here.
                </div>
              ) : (
                invoices
                  .flatMap((inv) =>
                    inv.payments.map((p) => ({
                      ...p,
                      invoiceNumber: inv.invoiceNumber,
                      clientName: inv.clientName,
                      productName: inv.productName,
                    }))
                  )
                  .map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-emerald-400">
                            {tx.referenceNumber}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {tx.productName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            for {tx.invoiceNumber}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-200">
                          {tx.clientName} ({tx.payerName})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Channel: {tx.channel.replace("_", " ")} • {tx.receivedAt}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          KES {tx.amountKES.toLocaleString()}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          RECONCILED
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Business Expenses */}
        {activeTab === "expenses" && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Operational & Infrastructure Expenses</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cloud hosting, GPS telematics batch imports, thermal printers, and field crew logistics.
                </p>
              </div>
              <div className="text-right font-mono text-xs font-bold text-rose-400">
                Total Expenses: KES {totalExpensesKES.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2.5">
              {BUSINESS_EXPENSES_SEED.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  No business expenses logged yet. Operational expenses will appear here.
                </div>
              ) : (
                BUSINESS_EXPENSES_SEED.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {exp.category.replace("_", " ")}
                        </span>
                        {exp.productName && (
                          <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {exp.productName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-slate-200">{exp.description}</div>
                      <div className="text-[11px] text-slate-500">
                        Vendor: <span className="text-slate-400">{exp.vendor}</span> • {exp.expenseDate}
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-white text-sm">
                      KES {exp.amountKES.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Product Profitability Margins */}
        {activeTab === "profitability" && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h2 className="text-sm font-bold text-white">Product Unit Economics & Net Margins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  product: "Adversoft",
                  invoiced: 52200,
                  collected: 52200,
                  directCosts: 8500,
                  marginPct: "83.7%",
                },
                {
                  product: "Vehisoft",
                  invoiced: 92800,
                  collected: 40600,
                  directCosts: 42000,
                  marginPct: "54.7%",
                },
                {
                  product: "Versandry",
                  invoiced: 34800,
                  collected: 34800,
                  directCosts: 4500,
                  marginPct: "87.0%",
                },
                {
                  product: "LipaTim",
                  invoiced: 58000,
                  collected: 0,
                  directCosts: 5000,
                  marginPct: "91.3% (Projected)",
                },
                {
                  product: "Melio RMS",
                  invoiced: 20880,
                  collected: 0,
                  directCosts: 26000,
                  marginPct: "Negative (Initial Hardware)",
                },
              ].map((p) => (
                <div key={p.product} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-white">{p.product}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.marginPct}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Total Invoiced:</span>
                      <span className="font-mono text-slate-200">KES {p.invoiced.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Costs:</span>
                      <span className="font-mono text-rose-300">KES {p.directCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-300">
                      <span>Cash Inflow:</span>
                      <span className="font-mono font-bold text-white">KES {p.collected.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Create Invoice */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Generate Commercial Invoice
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Client Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carnivore Restaurant Ltd"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Product Subscribed</label>
                  <select
                    value={newProductSlug}
                    onChange={(e) => setNewProductSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="adversoft">Adversoft</option>
                    <option value="vehisoft">Vehisoft</option>
                    <option value="versandry">Versandry</option>
                    <option value="lipatim">LipaTim</option>
                    <option value="melio-rms">Melio RMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Invoice Item Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Founding Client Setup & Hardware Deployment"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subtotal Amount (KES)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  >
                    Generate Invoice & eTIMS Hash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Record Payment */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  Record Payment for {selectedInvoice.invoiceNumber}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">M-Pesa Code / Bank Wire Ref</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SJK48910LM"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Payment Channel</label>
                  <select
                    value={payChannel}
                    onChange={(e) => setPayChannel(e.target.value as "MPESA_PAYBILL" | "MPESA_TILL" | "BANK_TRANSFER")}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MPESA_PAYBILL">M-Pesa Paybill</option>
                    <option value="MPESA_TILL">M-Pesa Buy Goods Till</option>
                    <option value="BANK_TRANSFER">Bank Wire / Electronic Funds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Amount Paid (KES)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedInvoice.balanceKES}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Confirm Reconciled Receipt
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
