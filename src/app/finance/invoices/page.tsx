"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  FinanceInvoice,
  InvoiceLineItem,
  PaymentRecord,
  loadInvoicesFromStorage,
  saveInvoicesToStorage,
} from "@/lib/finance-store";
import { useProductsCatalog } from "@/lib/products-store";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Trash2,
  Send,
  Eye,
  MessageCircle,
  ArrowRight,
  Download,
  DollarSign,
  QrCode,
  CreditCard,
  Building2,
} from "lucide-react";

export default function InvoicesPage() {
  const { products: catalogProducts } = useProductsCatalog();
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<FinanceInvoice | null>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("+254 ");
  const [productSlug, setProductSlug] = useState<string>("semplo");
  const [productName, setProductName] = useState("Semplo");
  const [issueDate, setIssueDate] = useState("2026-10-20");

  useEffect(() => {
    if (catalogProducts.length > 0 && !catalogProducts.some((p) => p.slug === productSlug)) {
      setProductSlug(catalogProducts[0].slug);
      setProductName(catalogProducts[0].name);
    }
  }, [catalogProducts, productSlug]);
  const [dueDate, setDueDate] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<FinanceInvoice["status"]>("SENT");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "System Setup & Database Configuration", quantity: 1, unitPrice: 35000, amountKES: 35000 },
  ]);
  const [notes, setNotes] = useState("Payment via M-Pesa Paybill 247247 or Direct Bank Transfer.");

  // Record Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRef, setPayRef] = useState("");
  const [payChannel, setPayChannel] = useState<PaymentRecord["channel"]>("MPESA_PAYBILL");
  const [payNotes, setPayNotes] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const list = loadInvoicesFromStorage();
    setInvoices(list);
    if (list.length > 0) setSelectedInvoice(list[0]);
  }, []);

  const syncInvoices = (updated: FinanceInvoice[]) => {
    setInvoices(updated);
    saveInvoicesToStorage(updated);
  };

  // Add line item in create modal
  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "Monthly SaaS License Subscription", quantity: 1, unitPrice: 15000, amountKES: 15000 },
    ]);
  };

  const updateLineItem = (idx: number, field: keyof InvoiceLineItem, val: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx], [field]: val };
      item.amountKES = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
      copy[idx] = item;
      return copy;
    });
  };

  const removeLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotalKES = lineItems.reduce((acc, it) => acc + (it.amountKES || 0), 0);
  const taxKES = Math.round(subtotalKES * 0.16); // 16% VAT standard
  const totalKES = subtotalKES + taxKES;

  // Handle Save Invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || lineItems.length === 0) return;

    const newInv: FinanceInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      productSlug,
      productName,
      status: invoiceStatus,
      subtotalKES,
      taxKES,
      totalKES,
      amountPaidKES: invoiceStatus === "PAID" ? totalKES : 0,
      balanceKES: invoiceStatus === "PAID" ? 0 : totalKES,
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      paidAt: invoiceStatus === "PAID" ? "Today" : undefined,
      notes: notes.trim() || undefined,
      kraEtimsCode: `ETIMS-KRA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      lineItems,
      payments:
        invoiceStatus === "PAID"
          ? [
              {
                id: `pay-${Date.now()}`,
                referenceNumber: `MP-${Date.now().toString().slice(-6)}`,
                channel: "MPESA_PAYBILL",
                amountKES: totalKES,
                payerName: clientName.trim(),
                receivedAt: "Today (At issuance)",
              },
            ]
          : [],
    };

    const updated = [newInv, ...invoices];
    syncInvoices(updated);
    setSelectedInvoice(newInv);
    setShowCreateModal(false);
    showToast(`Invoice ${newInv.invoiceNumber} created successfully!`);

    // Reset Form
    setClientName("");
    setClientEmail("");
    setClientPhone("+254 ");
    setLineItems([{ description: "System Setup & Configuration", quantity: 1, unitPrice: 35000, amountKES: 35000 }]);
  };

  // Mark Paid
  const handleMarkAsPaid = (inv: FinanceInvoice) => {
    const updated = invoices.map((i) => {
      if (i.id === inv.id) {
        return {
          ...i,
          status: "PAID" as const,
          amountPaidKES: i.totalKES,
          balanceKES: 0,
          paidAt: "Today",
          payments: [
            ...(i.payments || []),
            {
              id: `pay-${Date.now()}`,
              referenceNumber: `MP-REC-${Date.now().toString().slice(-6)}`,
              channel: "MPESA_PAYBILL" as const,
              amountKES: i.balanceKES,
              payerName: i.clientName,
              receivedAt: "Today",
            },
          ],
        };
      }
      return i;
    });
    syncInvoices(updated);
    const matched = updated.find((i) => i.id === inv.id) || null;
    setSelectedInvoice(matched);
    showToast(`Invoice ${inv.invoiceNumber} marked as fully PAID.`);
  };

  // Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    const updated = invoices.map((i) => {
      if (i.id === selectedInvoice.id) {
        const newPaid = i.amountPaidKES + payAmount;
        const newBalance = Math.max(0, i.totalKES - newPaid);
        const newStatus = newBalance === 0 ? ("PAID" as const) : i.status;
        return {
          ...i,
          status: newStatus,
          amountPaidKES: newPaid,
          balanceKES: newBalance,
          paidAt: newBalance === 0 ? "Today" : i.paidAt,
          payments: [
            ...(i.payments || []),
            {
              id: `pay-${Date.now()}`,
              referenceNumber: payRef || `PAY-${Date.now().toString().slice(-6)}`,
              channel: payChannel,
              amountKES: payAmount,
              payerName: i.clientName,
              receivedAt: "Today (Reconciled)",
              notes: payNotes || undefined,
            },
          ],
        };
      }
      return i;
    });

    syncInvoices(updated);
    const matched = updated.find((i) => i.id === selectedInvoice.id) || null;
    setSelectedInvoice(matched);
    setShowPayModal(false);
    showToast(`Payment of KES ${payAmount.toLocaleString()} recorded for ${selectedInvoice.invoiceNumber}.`);
    setPayAmount(0);
    setPayRef("");
  };

  // Delete Invoice
  const handleDeleteInvoice = (inv: FinanceInvoice) => {
    if (confirm(`Permanently delete invoice ${inv.invoiceNumber} for ${inv.clientName}?`)) {
      const updated = invoices.filter((i) => i.id !== inv.id);
      syncInvoices(updated);
      setSelectedInvoice(updated[0] || null);
      showToast(`Invoice ${inv.invoiceNumber} deleted.`);
    }
  };

  // Filtered List
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Invoicing Engine
              </span>
              <span className="text-xs text-slate-500">eTIMS &amp; M-Pesa Compliant</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Receipt className="h-6 w-6 text-emerald-400" />
              <span>Invoices &amp; Billing</span>
            </h1>
            <p className="text-xs text-slate-400">
              Generate client invoices, track outstanding balances, send payment reminders, and reconcile M-Pesa receipts.
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
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice #, client, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["ALL", "SENT", "OVERDUE", "PAID", "DRAFT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {st === "ALL" ? "All Invoices" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Invoices List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.length === 0 ? (
              <div className="liquid-glass p-8 text-center rounded-2xl border border-slate-800 space-y-3">
                <Receipt className="h-8 w-8 text-slate-600 mx-auto" />
                <h3 className="text-xs font-bold text-white">No Invoices Found</h3>
                <p className="text-[11px] text-slate-400">
                  No invoices match your current search or status filters.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  + Create an invoice
                </button>
              </div>
            ) : (
              filtered.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
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

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="font-bold text-slate-200 text-xs truncate max-w-[200px]">
                          {inv.clientName}
                        </div>
                        <div className="text-[10px] text-slate-500">{inv.productName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs font-black text-white">
                          KES {inv.totalKES.toLocaleString()}
                        </div>
                        {inv.balanceKES > 0 && (
                          <div className="text-[10px] font-mono text-rose-400">
                            Due: KES {inv.balanceKES.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Issued: {inv.issueDate}</span>
                      <span className={inv.status === "OVERDUE" ? "text-rose-400 font-bold" : ""}>
                        Due: {inv.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Invoice Document Preview (7 cols) */}
          <div className="lg:col-span-7">
            {selectedInvoice ? (
              <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-6">
                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">
                      {selectedInvoice.invoiceNumber}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedInvoice.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : selectedInvoice.status === "OVERDUE"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedInvoice.status !== "PAID" && (
                      <>
                        <button
                          onClick={() => {
                            setPayAmount(selectedInvoice.balanceKES);
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Record Payment</span>
                        </button>
                        <button
                          onClick={() => handleMarkAsPaid(selectedInvoice)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                      title="Print / Save PDF"
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteInvoice(selectedInvoice)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                      title="Delete Invoice"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Printable Invoice Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                      Billed To
                    </span>
                    <h3 className="font-extrabold text-base text-white">
                      {selectedInvoice.clientName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedInvoice.clientEmail || "operations@client.co.ke"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedInvoice.clientPhone || "+254 700 000 000"}
                    </p>
                  </div>

                  <div className="text-right space-y-1 text-xs">
                    <div>
                      <span className="text-slate-500">Issue Date: </span>
                      <span className="font-mono text-slate-200">{selectedInvoice.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Due Date: </span>
                      <span className="font-mono text-slate-200">{selectedInvoice.dueDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Product: </span>
                      <span className="text-indigo-400 font-semibold">{selectedInvoice.productName}</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-900/80 p-2.5 font-bold text-slate-400 border-b border-slate-800">
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Unit Price</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>

                  {selectedInvoice.lineItems?.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 p-3 border-b border-slate-800/60 text-slate-300 font-medium items-center"
                    >
                      <span className="col-span-6 font-semibold text-white">{it.description}</span>
                      <span className="col-span-2 text-center font-mono">{it.quantity}</span>
                      <span className="col-span-2 text-right font-mono text-slate-400">
                        KES {it.unitPrice.toLocaleString()}
                      </span>
                      <span className="col-span-2 text-right font-mono font-bold text-slate-200">
                        KES {it.amountKES.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Balances */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs pt-2">
                  <div className="space-y-2 max-w-sm">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        <span>KRA eTIMS Fiscal Clearance</span>
                      </span>
                      <div className="font-mono text-[10px] text-slate-400">
                        Code: {selectedInvoice.kraEtimsCode || "ETIMS-VERIFIED"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Status: Fiscal receipt transmitted to KRA Gateway
                      </div>
                    </div>

                    {selectedInvoice.notes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Note: {selectedInvoice.notes}
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-64 space-y-2 font-mono">
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Subtotal:</span>
                      <span>KES {selectedInvoice.subtotalKES.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>VAT (16%):</span>
                      <span>KES {selectedInvoice.taxKES.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                      <span>Total:</span>
                      <span>KES {selectedInvoice.totalKES.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 text-xs">
                      <span>Amount Paid:</span>
                      <span>KES {selectedInvoice.amountPaidKES.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-400 text-xs pt-1 border-t border-slate-800/60">
                      <span>Balance Due:</span>
                      <span>KES {selectedInvoice.balanceKES.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment History Log */}
                {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Reconciled Transactions on this Invoice
                    </span>
                    <div className="space-y-1.5">
                      {selectedInvoice.payments.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-white font-bold">{p.referenceNumber}</span>
                            <span className="text-slate-500 font-sans text-[10px]">
                              ({p.channel.replace("_", " ")})
                            </span>
                          </div>
                          <span className="text-emerald-400 font-bold">
                            + KES {p.amountKES.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="liquid-glass p-12 text-center rounded-2xl border border-slate-800 space-y-3">
                <Receipt className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">Select an invoice to preview</h3>
                <p className="text-xs text-slate-400">
                  Click any invoice from the left list to view line items, eTIMS clearance, and payments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Issue Client Invoice</h2>
                <p className="text-xs text-slate-400">Generates itemized invoice with eTIMS code &amp; M-Pesa balance</p>
              </div>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Client Business Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Safari Auto Clinic"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Suite</label>
                  <select
                    value={productSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setProductSlug(slug);
                      const found = catalogProducts.find((p) => p.slug === slug);
                      if (found) {
                        setProductName(found.name);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalogProducts.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SENT">SENT (Awaiting Payment)</option>
                    <option value="PAID">PAID (Already Collected)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                    Invoice Line Items
                  </span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                      className="col-span-6 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Price KES"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(idx, "unitPrice", parseInt(e.target.value) || 0)}
                      className="col-span-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-right"
                    />
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length === 1}
                      className="col-span-1 p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-right font-mono text-xs">
                <div className="text-slate-400">Subtotal: KES {subtotalKES.toLocaleString()}</div>
                <div className="text-slate-400">VAT (16%): KES {taxKES.toLocaleString()}</div>
                <div className="text-sm font-bold text-white pt-1 border-t border-slate-800">
                  Total: KES {totalKES.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="liquid-glass border border-emerald-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Record Payment
              </span>
              <h3 className="text-base font-bold text-white">
                Payment for {selectedInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Client: {selectedInvoice.clientName} • Balance: KES {selectedInvoice.balanceKES.toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount Paid (KES) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">M-Pesa Reference / Trans ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QHX892L1P"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={payChannel}
                  onChange={(e) => setPayChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MPESA_PAYBILL">M-Pesa Paybill</option>
                  <option value="MPESA_TILL">M-Pesa Till</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  <option value="CASH">Cash Payment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
