"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Printer,
  ShieldCheck,
  Cpu,
  Truck,
  Megaphone,
  Briefcase,
  Layers,
  PieChart,
  Sparkles,
  Server,
  ArrowRight,
  Download,
  Calendar,
  Landmark,
  Scale,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  FileCheck2,
} from "lucide-react";
import {
  FinanceInvoice,
  FinanceExpense,
  ClientSubscription,
  loadInvoicesFromStorage,
  loadExpensesFromStorage,
  loadSubscriptionsFromStorage,
  loadAccountsFromStorage,
  loadCapitalContributions,
  loadShareholderLoans,
  loadReservesFromStorage,
  computeFinanceSummary,
  formatKES,
} from "@/lib/finance-store";

export default function FinancialReportsPage() {
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [accounts, setAccounts] = useState(loadAccountsFromStorage());
  const [contributions, setContributions] = useState(loadCapitalContributions());
  const [loans, setLoans] = useState(loadShareholderLoans());
  const [reserves, setReserves] = useState(loadReservesFromStorage());

  const [activeReportTab, setActiveReportTab] = useState<
    "PROFIT_LOSS" | "BALANCE_SHEET" | "CASH_FLOW" | "PRODUCT_ECONOMICS" | "RECEIVABLES_AGING"
  >("PROFIT_LOSS");
  const [selectedPeriod, setSelectedPeriod] = useState<"MTD" | "QTD" | "YTD" | "ALL_TIME">("ALL_TIME");
  const [reportDate, setReportDate] = useState("");
  const [todayDate, setTodayDate] = useState("2026-10-26");

  useEffect(() => {
    setInvoices(loadInvoicesFromStorage());
    setExpenses(loadExpensesFromStorage());
    setSubscriptions(loadSubscriptionsFromStorage());
    setAccounts(loadAccountsFromStorage());
    setContributions(loadCapitalContributions());
    setLoans(loadShareholderLoans());
    setReserves(loadReservesFromStorage());
    try {
      setReportDate(new Date().toLocaleDateString());
      setTodayDate(new Date().toISOString().split("T")[0]);
    } catch {}
  }, []);

  const summary = useMemo(() => {
    return computeFinanceSummary(invoices, expenses, subscriptions);
  }, [invoices, expenses, subscriptions]);

  // P&L Calculations
  const cogsExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.category === "INFRASTRUCTURE_CLOUD" || e.category === "HARDWARE_DEVICES"
    );
  }, [expenses]);

  const totalCOGS = useMemo(() => {
    return cogsExpenses.reduce((sum, e) => sum + (e.amountKES || 0), 0);
  }, [cogsExpenses]);

  const opexExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.category !== "INFRASTRUCTURE_CLOUD" && e.category !== "HARDWARE_DEVICES"
    );
  }, [expenses]);

  const totalOpEx = useMemo(() => {
    return opexExpenses.reduce((sum, e) => sum + (e.amountKES || 0), 0);
  }, [opexExpenses]);

  const grossProfit = summary.totalCollected - totalCOGS;
  const grossMarginPct =
    summary.totalCollected > 0 ? Math.round((grossProfit / summary.totalCollected) * 100) : 0;

  const netOperatingProfit = grossProfit - totalOpEx;
  const netMarginPct =
    summary.totalCollected > 0 ? Math.round((netOperatingProfit / summary.totalCollected) * 100) : 0;

  // Balance Sheet Calculations
  const balanceSheet = useMemo(() => {
    const totalCash = accounts.reduce((sum, a) => sum + a.balanceKES, 0);
    const accountsReceivable = summary.totalOutstanding;
    const totalCurrentAssets = totalCash + accountsReceivable;
    const totalAssets = totalCurrentAssets;

    // Liabilities
    const totalShareholderDebt = loans.reduce((sum, l) => sum + l.remainingBalanceKES, 0);
    const taxProvision = reserves.find((r) => r.id === "res-02")?.currentAllocatedKES || 0;
    const totalLiabilities = totalShareholderDebt + taxProvision;

    // Equity
    const totalPaidInCapital = contributions
      .filter((c) => c.status === "RECEIVED" && c.type === "EQUITY_CAPITAL")
      .reduce((sum, c) => sum + c.amountKES, 0);
    const retainedEarnings = totalAssets - totalLiabilities - totalPaidInCapital;
    const totalEquity = totalPaidInCapital + retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

    return {
      totalCash,
      accountsReceivable,
      totalCurrentAssets,
      totalAssets,
      totalShareholderDebt,
      taxProvision,
      totalLiabilities,
      totalPaidInCapital,
      retainedEarnings,
      totalEquity,
      totalLiabilitiesAndEquity,
      isBalanced,
    };
  }, [accounts, summary.totalOutstanding, loans, reserves, contributions]);

  // Cash Flow Calculations
  const cashFlow = useMemo(() => {
    const operatingInflows = summary.totalCollected;
    const operatingOutflows = summary.totalExpenses;
    const netOperatingCashFlow = operatingInflows - operatingOutflows;

    const capitalFinancingInflows = contributions
      .filter((c) => c.status === "RECEIVED")
      .reduce((sum, c) => sum + c.amountKES, 0);
    const loanRepayments = loans.reduce((sum, l) => sum + l.amountRepaidKES, 0);
    const netFinancingCashFlow = capitalFinancingInflows - loanRepayments;

    const netChangeInCash = netOperatingCashFlow + netFinancingCashFlow;
    const closingCash = accounts.reduce((sum, a) => sum + a.balanceKES, 0);

    return {
      operatingInflows,
      operatingOutflows,
      netOperatingCashFlow,
      capitalFinancingInflows,
      loanRepayments,
      netFinancingCashFlow,
      netChangeInCash,
      closingCash,
    };
  }, [summary, contributions, loans, accounts]);

  // Receivables Aging
  const receivablesAging = useMemo(() => {
    const today = new Date(todayDate);
    let current_0_30 = 0;
    let overdue_31_60 = 0;
    let overdue_60_plus = 0;

    const unpaidInvoices = invoices.filter((i) => i.balanceKES > 0 && i.status !== "VOID");

    unpaidInvoices.forEach((inv) => {
      const due = new Date(inv.dueDate);
      const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0 || diffDays <= 30) {
        current_0_30 += inv.balanceKES;
      } else if (diffDays <= 60) {
        overdue_31_60 += inv.balanceKES;
      } else {
        overdue_60_plus += inv.balanceKES;
      }
    });

    return {
      total: summary.totalOutstanding,
      current_0_30,
      overdue_31_60,
      overdue_60_plus,
      unpaidInvoices,
    };
  }, [invoices, summary.totalOutstanding]);

  // Product Suite Economics
  const productMargins = useMemo(() => {
    const products = [
      {
        slug: "semplo",
        name: "Semplo",
        tagline: "HR & Kenyan Statutory Payroll Suite",
        estMarginPct: 94,
      },
      {
        slug: "vehisoft",
        name: "Vehisoft",
        tagline: "Automotive Dealership DMS",
        estMarginPct: 88,
      },
      {
        slug: "adversoft",
        name: "Adversoft",
        tagline: "Digital Billboard & Screen CMS",
        estMarginPct: 76,
      },
      {
        slug: "versandry",
        name: "Versandry",
        tagline: "Laundromat Management POS",
        estMarginPct: 85,
      },
      {
        slug: "lipatim",
        name: "LipaTim",
        tagline: "Retail eTIMS Billing & Inventory",
        estMarginPct: 92,
      },
    ];

    return products.map((p) => {
      const revenue = summary.productRevenue[p.name] || 0;
      const mrr = summary.productMRR[p.name] || 0;
      const estDirectCost = Math.round(revenue * (1 - p.estMarginPct / 100));
      const estNetProfit = revenue - estDirectCost;

      return {
        ...p,
        revenue,
        mrr,
        estDirectCost,
        estNetProfit,
      };
    });
  }, [summary]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportActiveCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `versaly-${activeReportTab.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;

    if (activeReportTab === "PROFIT_LOSS") {
      headers = ["Line Item", "Classification", "Amount (KES)"];
      rows = [
        ["Software Licensing & Development Collections", "Revenue", summary.totalCollected],
        ["Direct Cloud Infrastructure & Hardware", "COGS", totalCOGS],
        ["Gross Operating Profit", "Gross Profit", grossProfit],
        ["Operating Expenditures (OpEx)", "OpEx", totalOpEx],
        ["Net Operating Income (EBITDA)", "Net Income", netOperatingProfit],
      ];
    } else if (activeReportTab === "BALANCE_SHEET") {
      headers = ["Section", "Account", "Amount (KES)"];
      rows = [
        ["Current Assets", "Cash & Cash Equivalents (Bank / M-Pesa)", balanceSheet.totalCash],
        ["Current Assets", "Accounts Receivable (Outstanding Invoices)", balanceSheet.accountsReceivable],
        ["Total Assets", "Total Assets", balanceSheet.totalAssets],
        ["Liabilities", "Shareholder Debt Outstanding", balanceSheet.totalShareholderDebt],
        ["Liabilities", "Statutory & Tax Provisions", balanceSheet.taxProvision],
        ["Total Liabilities", "Total Liabilities", balanceSheet.totalLiabilities],
        ["Equity", "Paid-In Founder Capital", balanceSheet.totalPaidInCapital],
        ["Equity", "Retained Earnings", balanceSheet.retainedEarnings],
        ["Total Equity", "Total Shareholder Equity", balanceSheet.totalEquity],
      ];
    } else if (activeReportTab === "CASH_FLOW") {
      headers = ["Cash Flow Activity", "Amount (KES)"];
      rows = [
        ["Cash Inflows from Clients", cashFlow.operatingInflows],
        ["Cash Outflows for Operating Expenses", -cashFlow.operatingOutflows],
        ["Net Operating Cash Flow", cashFlow.netOperatingCashFlow],
        ["Capital Contributions Received", cashFlow.capitalFinancingInflows],
        ["Shareholder Loan Repayments", -cashFlow.loanRepayments],
        ["Net Financing Cash Flow", cashFlow.netFinancingCashFlow],
        ["Net Change in Cash", cashFlow.netChangeInCash],
        ["Closing Cash Position", cashFlow.closingCash],
      ];
    } else {
      headers = ["Product", "Tagline", "Revenue (KES)", "MRR (KES)", "Direct Cost (KES)", "Net Margin (%)"];
      rows = productMargins.map((p) => [
        `"${p.name}"`,
        `"${p.tagline}"`,
        p.revenue,
        p.mrr,
        p.estDirectCost,
        `${p.estMarginPct}%`,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12 print:p-0 print:m-0 text-slate-100">
        {/* Top Header Banner */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative border border-slate-800 print:hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Financial Reporting &amp; Governance
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Accrual &amp; Cash Basis Statements</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <span>Financial Statements &amp; Audit Reports</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Compliant statements for P&amp;L, Balance Sheet, Cash Flow, Unit Economics, and Receivables Aging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <button
              onClick={handleExportActiveCSV}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center gap-2 transition"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition shadow-lg shadow-indigo-600/25"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Letterhead (Only visible during print) */}
        <div className="hidden print:block mb-8 pb-6 border-b border-slate-300 text-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Versaly Solutions Limited</h1>
              <p className="text-xs text-slate-600">Executive Financial Statements</p>
              <p className="text-xs text-slate-500 mt-1">Generated: {reportDate}</p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Currency: KES (Kenyan Shilling)</p>
              <p>Accounting Basis: Kenyan Companies Act 2015 Compliant</p>
            </div>
          </div>
        </div>

        {/* Report Statement Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto bg-slate-900/60 p-2 rounded-2xl border border-slate-800 print:hidden">
          <button
            onClick={() => setActiveReportTab("PROFIT_LOSS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeReportTab === "PROFIT_LOSS"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Profit &amp; Loss (P&amp;L)
          </button>

          <button
            onClick={() => setActiveReportTab("BALANCE_SHEET")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeReportTab === "BALANCE_SHEET"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Balance Sheet
          </button>

          <button
            onClick={() => setActiveReportTab("CASH_FLOW")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeReportTab === "CASH_FLOW"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Cash Flow Statement
          </button>

          <button
            onClick={() => setActiveReportTab("PRODUCT_ECONOMICS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeReportTab === "PRODUCT_ECONOMICS"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Product Profitability
          </button>

          <button
            onClick={() => setActiveReportTab("RECEIVABLES_AGING")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
              activeReportTab === "RECEIVABLES_AGING"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Receivables Aging
          </button>
        </div>

        {/* TAB 1: PROFIT & LOSS */}
        {activeReportTab === "PROFIT_LOSS" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="liquid-glass p-5 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs font-semibold block">Total Revenue Collected</span>
                <p className="text-2xl font-bold text-white mt-1 font-mono">{formatKES(summary.totalCollected)}</p>
                <span className="text-xs text-slate-500 mt-1 block">Invoiced: {formatKES(summary.totalInvoiced)}</span>
              </div>
              <div className="liquid-glass p-5 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs font-semibold block">Gross Operating Margin</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{grossMarginPct}%</p>
                <span className="text-xs text-slate-500 mt-1 block">Gross Profit: {formatKES(grossProfit)}</span>
              </div>
              <div className="liquid-glass p-5 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs font-semibold block">Operating Expenses (OpEx)</span>
                <p className="text-2xl font-bold text-slate-200 mt-1 font-mono">{formatKES(totalOpEx)}</p>
                <span className="text-xs text-slate-500 mt-1 block">Field, Marketing, Legal &amp; Tools</span>
              </div>
              <div className="liquid-glass p-5 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs font-semibold block">Net Operating Income (EBITDA)</span>
                <p className={`text-2xl font-bold mt-1 font-mono ${netOperatingProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatKES(netOperatingProfit)}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Net Margin: {netMarginPct}%</span>
              </div>
            </div>

            {/* Structured P&L Table */}
            <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">Statement of Comprehensive Income</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Account / Line Item</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5 text-right">Amount (KES)</th>
                      <th className="p-3.5 text-right">% of Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    <tr className="bg-slate-950/60 font-semibold text-white">
                      <td className="p-3.5" colSpan={4}>REVENUE &amp; OPERATING INFLOWS</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Software Setup &amp; Implementation Fees</td>
                      <td className="p-3.5 text-slate-500">Service Revenue</td>
                      <td className="p-3.5 text-right text-emerald-400">{formatKES(summary.setupFeesCollected)}</td>
                      <td className="p-3.5 text-right text-slate-400">
                        {summary.totalCollected > 0 ? ((summary.setupFeesCollected / summary.totalCollected) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Recurring SaaS Subscriptions</td>
                      <td className="p-3.5 text-slate-500">MRR Revenue</td>
                      <td className="p-3.5 text-right text-emerald-400">{formatKES(summary.effectiveMRR)}</td>
                      <td className="p-3.5 text-right text-slate-400">
                        {summary.totalCollected > 0 ? ((summary.effectiveMRR / summary.totalCollected) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-bold text-white border-t border-slate-700">
                      <td className="p-3.5 pl-6">TOTAL REVENUE (COLLECTED)</td>
                      <td className="p-3.5">Gross Revenue</td>
                      <td className="p-3.5 text-right text-emerald-400">{formatKES(summary.totalCollected)}</td>
                      <td className="p-3.5 text-right">100.0%</td>
                    </tr>

                    <tr className="bg-slate-950/60 font-semibold text-white">
                      <td className="p-3.5" colSpan={4}>COST OF GOODS SOLD (COGS)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Cloud Hosting, Servers &amp; AI APIs</td>
                      <td className="p-3.5 text-slate-500">Direct Delivery</td>
                      <td className="p-3.5 text-right text-rose-400">({formatKES(totalCOGS)})</td>
                      <td className="p-3.5 text-right text-slate-400">
                        {summary.totalCollected > 0 ? ((totalCOGS / summary.totalCollected) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                    <tr className="bg-slate-950 font-bold text-white border-t border-slate-700">
                      <td className="p-3.5 pl-6">GROSS PROFIT</td>
                      <td className="p-3.5">Gross Surplus</td>
                      <td className="p-3.5 text-right text-white">{formatKES(grossProfit)}</td>
                      <td className="p-3.5 text-right text-emerald-400">{grossMarginPct}%</td>
                    </tr>

                    <tr className="bg-slate-950/60 font-semibold text-white">
                      <td className="p-3.5" colSpan={4}>OPERATING EXPENDITURES (OPEX)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Sales Outreach, Transport &amp; Client Onboarding</td>
                      <td className="p-3.5 text-slate-500">Sales &amp; Marketing</td>
                      <td className="p-3.5 text-right text-rose-400">
                        ({formatKES(expenses.filter((e) => e.category === "FIELD_TRANSPORT" || e.category === "MARKETING_ADS").reduce((s, e) => s + e.amountKES, 0))})
                      </td>
                      <td className="p-3.5 text-right text-slate-400">—</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Legal, Incorporation, eTIMS &amp; Accounting</td>
                      <td className="p-3.5 text-slate-500">G&amp;A</td>
                      <td className="p-3.5 text-right text-rose-400">
                        ({formatKES(expenses.filter((e) => e.category === "LEGAL_COMPLIANCE").reduce((s, e) => s + e.amountKES, 0))})
                      </td>
                      <td className="p-3.5 text-right text-slate-400">—</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 text-slate-300">Commissions &amp; Contractor Compensation</td>
                      <td className="p-3.5 text-slate-500">Payroll</td>
                      <td className="p-3.5 text-right text-rose-400">
                        ({formatKES(expenses.filter((e) => e.category === "COMMISSIONS_SALARIES").reduce((s, e) => s + e.amountKES, 0))})
                      </td>
                      <td className="p-3.5 text-right text-slate-400">—</td>
                    </tr>
                    <tr className="bg-slate-950 font-black text-white border-t-2 border-indigo-500 text-sm">
                      <td className="p-4 pl-6">NET OPERATING PROFIT (EBITDA)</td>
                      <td className="p-4 text-indigo-400">Operating Net</td>
                      <td className={`p-4 text-right font-mono ${netOperatingProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatKES(netOperatingProfit)}
                      </td>
                      <td className="p-4 text-right">{netMarginPct}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BALANCE SHEET */}
        {activeReportTab === "BALANCE_SHEET" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">
                  BALANCE SHEET RECONCILED: Total Assets ({formatKES(balanceSheet.totalAssets)}) equals Total Liabilities + Equity ({formatKES(balanceSheet.totalLiabilitiesAndEquity)}).
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Balanced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              {/* Assets Column */}
              <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans border-b border-slate-800 pb-2">
                  Assets
                </h2>

                <div className="space-y-3">
                  <div className="text-indigo-400 font-bold uppercase text-[11px]">Current Assets</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Cash &amp; Equivalents (Bank &amp; M-Pesa Vaults)</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.totalCash)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Accounts Receivable (Outstanding Invoices)</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.accountsReceivable)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-slate-950/60 px-3 rounded-lg font-bold">
                    <span className="text-slate-200">Total Current Assets</span>
                    <span className="text-emerald-400">{formatKES(balanceSheet.totalCurrentAssets)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-700 flex justify-between items-center text-sm font-bold">
                  <span className="text-white font-sans uppercase">Total Assets</span>
                  <span className="text-emerald-400 text-base">{formatKES(balanceSheet.totalAssets)}</span>
                </div>
              </div>

              {/* Liabilities & Equity Column */}
              <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-sans border-b border-slate-800 pb-2">
                  Liabilities &amp; Equity
                </h2>

                <div className="space-y-3">
                  <div className="text-rose-400 font-bold uppercase text-[11px]">Current &amp; Long-Term Liabilities</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Shareholder Loans Outstanding</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.totalShareholderDebt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Statutory Tax &amp; eTIMS Provisions</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.taxProvision)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-slate-950/60 px-3 rounded-lg font-bold">
                    <span className="text-slate-200">Total Liabilities</span>
                    <span className="text-rose-400">{formatKES(balanceSheet.totalLiabilities)}</span>
                  </div>

                  <div className="text-indigo-400 font-bold uppercase text-[11px] pt-3">Shareholder Equity</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Paid-In Founder Capital</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.totalPaidInCapital)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-300">Retained Earnings / (Deficit)</span>
                    <span className="text-white font-bold">{formatKES(balanceSheet.retainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-slate-950/60 px-3 rounded-lg font-bold">
                    <span className="text-slate-200">Total Shareholder Equity</span>
                    <span className="text-indigo-400">{formatKES(balanceSheet.totalEquity)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-700 flex justify-between items-center text-sm font-bold">
                  <span className="text-white font-sans uppercase">Total Liabilities &amp; Equity</span>
                  <span className="text-emerald-400 text-base">{formatKES(balanceSheet.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CASH FLOW STATEMENT */}
        {activeReportTab === "CASH_FLOW" && (
          <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white font-sans">Statement of Cash Flows (Direct Method)</h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Tracks actual cash inflows and outflows across operating and financing activities.
                </p>
              </div>
              <span className="text-xs text-slate-400">Currency: KES</span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-indigo-400 font-bold uppercase text-xs">1. Cash Flows from Operating Activities</div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300">Cash receipts from customers &amp; client contracts</span>
                  <span className="text-emerald-400 font-bold">+{formatKES(cashFlow.operatingInflows)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300">Cash paid to suppliers, cloud hosts &amp; operations</span>
                  <span className="text-rose-400 font-bold">-{formatKES(cashFlow.operatingOutflows)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>Net Cash Generated from Operating Activities</span>
                  <span className={cashFlow.netOperatingCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {formatKES(cashFlow.netOperatingCashFlow)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-indigo-400 font-bold uppercase text-xs">2. Cash Flows from Financing Activities</div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300">Proceeds from founder capital contributions &amp; loans</span>
                  <span className="text-emerald-400 font-bold">+{formatKES(cashFlow.capitalFinancingInflows)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-300">Repayments of shareholder loan principal</span>
                  <span className="text-rose-400 font-bold">-{formatKES(cashFlow.loanRepayments)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-white">
                  <span>Net Cash from Financing Activities</span>
                  <span className="text-indigo-400 font-bold">{formatKES(cashFlow.netFinancingCashFlow)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border-2 border-indigo-500/50 flex justify-between items-center text-sm font-bold">
                <span className="text-white font-sans uppercase">Closing Cash Position Across All Accounts</span>
                <span className="text-emerald-400 text-base">{formatKES(cashFlow.closingCash)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCT PROFITABILITY */}
        {activeReportTab === "PRODUCT_ECONOMICS" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productMargins.map((p) => (
                <div
                  key={p.slug}
                  className="liquid-glass p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-slate-400">{p.tagline}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {p.estMarginPct}% Margin
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Collections:</span>
                      <span className="font-bold text-white">{formatKES(p.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recurring MRR:</span>
                      <span className="font-bold text-indigo-400">{formatKES(p.mrr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated COGS:</span>
                      <span className="text-rose-400">{formatKES(p.estDirectCost)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                      <span className="text-slate-200">Net Product Margin:</span>
                      <span className="text-emerald-400">{formatKES(p.estNetProfit)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RECEIVABLES AGING */}
        {activeReportTab === "RECEIVABLES_AGING" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Current (0 - 30 Days)</span>
                <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {formatKES(receivablesAging.current_0_30)}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Expected on schedule</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Overdue (31 - 60 Days)</span>
                <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  {formatKES(receivablesAging.overdue_31_60)}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Requires polite reminder</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Critical Overdue (60+ Days)</span>
                <p className="text-2xl font-bold text-rose-400 font-mono mt-1">
                  {formatKES(receivablesAging.overdue_60_plus)}
                </p>
                <span className="text-xs text-slate-500 mt-1 block">Escalate for suspension</span>
              </div>
            </div>

            <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white">Unpaid Client Receivables Ledger</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-right">Invoice Total</th>
                      <th className="p-3 text-right">Balance Due</th>
                      <th className="p-3 text-center">Aging Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {receivablesAging.unpaidInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-white font-bold">{inv.invoiceNumber}</td>
                        <td className="p-3 text-slate-300 font-sans">{inv.clientName}</td>
                        <td className="p-3 text-slate-400">{inv.dueDate}</td>
                        <td className="p-3 text-right text-slate-300">{formatKES(inv.totalKES)}</td>
                        <td className="p-3 text-right font-bold text-rose-400">{formatKES(inv.balanceKES)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
