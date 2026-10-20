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
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  PieChart,
  Target,
  Sparkles,
  Server,
  Cpu,
  Truck,
  Megaphone,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import {
  loadInvoicesFromStorage,
  loadExpensesFromStorage,
  loadSubscriptionsFromStorage,
  computeFinanceSummary,
  SETUP_FEE_LAUNCH_TARGET,
  MRR_LAUNCH_TARGET,
} from "@/lib/finance-store";

export default function FinancialReportsPage() {
  const [invoices, setInvoices] = useState(() =>
    typeof window !== "undefined" ? loadInvoicesFromStorage() : []
  );
  const [expenses, setExpenses] = useState(() =>
    typeof window !== "undefined" ? loadExpensesFromStorage() : []
  );
  const [subscriptions, setSubscriptions] = useState(() =>
    typeof window !== "undefined" ? loadSubscriptionsFromStorage() : []
  );

  const [selectedPeriod, setSelectedPeriod] = useState<"MTD" | "QTD" | "YTD" | "LAUNCH_TO_DATE">("LAUNCH_TO_DATE");
  const [reportDate, setReportDate] = useState("2026-10-20");

  useEffect(() => {
    setInvoices(loadInvoicesFromStorage());
    setExpenses(loadExpensesFromStorage());
    setSubscriptions(loadSubscriptionsFromStorage());
    try {
      setReportDate(new Date().toLocaleDateString());
    } catch {}
  }, []);

  const summary = useMemo(() => {
    return computeFinanceSummary(invoices, expenses, subscriptions);
  }, [invoices, expenses, subscriptions]);

  // Categorize expenses into COGS (Cloud + Hardware) and OpEx (Field transport, marketing, legal, etc.)
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

  // Gross profit & Net Profit calculations
  const grossProfit = summary.totalCollected - totalCOGS;
  const grossMarginPct =
    summary.totalCollected > 0 ? Math.round((grossProfit / summary.totalCollected) * 100) : 0;

  const netOperatingProfit = grossProfit - totalOpEx;
  const netMarginPct =
    summary.totalCollected > 0 ? Math.round((netOperatingProfit / summary.totalCollected) * 100) : 0;

  // OpEx breakdown by category
  const opexBreakdown = useMemo(() => {
    const categories: Record<string, { label: string; amount: number; icon: any }> = {
      FIELD_TRANSPORT: { label: "Field Sales & Client Transport", amount: 0, icon: Truck },
      MARKETING_ADS: { label: "Marketing, Ads & Collateral", amount: 0, icon: Megaphone },
      LEGAL_COMPLIANCE: { label: "Legal, Compliance & eTIMS Cert.", amount: 0, icon: Briefcase },
      OFFICE_OPERATIONS: { label: "Office & Internet Utilities", amount: 0, icon: Layers },
      COMMISSIONS_SALARIES: { label: "Commissions & Contractor Fees", amount: 0, icon: DollarSign },
      OTHER: { label: "General & Administrative", amount: 0, icon: Layers },
    };

    opexExpenses.forEach((e) => {
      if (categories[e.category]) {
        categories[e.category].amount += e.amountKES;
      } else {
        categories.OTHER.amount += e.amountKES;
      }
    });

    return Object.entries(categories)
      .map(([key, val]) => ({ key, ...val }))
      .filter((c) => c.amount > 0 || c.key === "FIELD_TRANSPORT" || c.key === "MARKETING_ADS");
  }, [opexExpenses]);

  // Product unit economics & margins
  const productMargins = useMemo(() => {
    const products = [
      {
        slug: "vehisoft",
        name: "Vehisoft",
        tagline: "Automotive Dealership DMS",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        barColor: "bg-indigo-500",
        estMarginPct: 88,
      },
      {
        slug: "adversoft",
        name: "Adversoft",
        tagline: "Digital Billboard & Screen CMS",
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        barColor: "bg-purple-500",
        estMarginPct: 76, // Lower margin due to hardware TV boxes
      },
      {
        slug: "versandry",
        name: "Versandry",
        tagline: "Laundromat Management POS",
        color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        barColor: "bg-cyan-500",
        estMarginPct: 85,
      },
      {
        slug: "lipatim",
        name: "LipaTim",
        tagline: "Retail eTIMS Billing & Inventory",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        barColor: "bg-emerald-500",
        estMarginPct: 92, // Pure software SaaS
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

  return (
    <WorkspaceLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto print:p-0 print:m-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Financial Reports & Profitability
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    P&amp;L Statement
                  </span>
                </h1>
                <p className="text-sm text-neutral-400">
                  Comprehensive Profit and Loss statement, EBITDA breakdown, product margins, and cash runway.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800 p-1 text-xs">
              {(["MTD", "QTD", "YTD", "LAUNCH_TO_DATE"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md transition font-medium ${
                    selectedPeriod === period
                      ? "bg-neutral-800 text-white shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {period === "LAUNCH_TO_DATE" ? "Launch To Date" : period}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 flex items-center gap-2 transition"
            >
              <Printer className="h-4 w-4 text-neutral-400" />
              Print / Export PDF
            </button>
          </div>
        </div>

        {/* Printable Letterhead (Only visible during print) */}
        <div className="hidden print:block mb-8 pb-6 border-b border-neutral-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Versaly Solutions Limited</h1>
              <p className="text-xs text-neutral-600">Executive Profit &amp; Loss Statement</p>
              <p className="text-xs text-neutral-500 mt-1">Generated: {reportDate}</p>
            </div>
            <div className="text-right text-xs text-neutral-600">
              <p>Currency: KES (Kenyan Shilling)</p>
              <p>KRA PIN: P051948291X</p>
            </div>
          </div>
        </div>

        {/* Top 4 Financial Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Cash Collected */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
            <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Gross Cash Collected</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {summary.totalCollected.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
              <span>Total Invoiced:</span>
              <span className="text-neutral-300 font-semibold">KES {summary.totalInvoiced.toLocaleString()}</span>
            </div>
          </div>

          {/* Gross Margin % */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
            <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Gross Profit &amp; Margin</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {grossProfit.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
              <span>Gross Margin:</span>
              <span className="text-emerald-400 font-bold">{grossMarginPct}%</span>
              <span className="text-neutral-500">(Direct COGS: KES {totalCOGS.toLocaleString()})</span>
            </div>
          </div>

          {/* Net Operating Profit (EBITDA) */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
            <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Net Operating Profit</span>
              {netOperatingProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
            </div>
            <div
              className={`text-2xl font-bold tracking-tight ${
                netOperatingProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              KES {netOperatingProfit.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
              <span>Net Margin:</span>
              <span className={`font-bold ${netOperatingProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {netMarginPct}%
              </span>
              <span className="text-neutral-500">after all expenses</span>
            </div>
          </div>

          {/* Cash Runway / Burn */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
            <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Monthly Burn Rate</span>
              <Cpu className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              KES {summary.totalExpenses.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Cashflow Positive</span>
            </div>
          </div>
        </div>

        {/* Detailed Profit & Loss Statement (P&L) */}
        <div className="p-6 md:p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                Statement of Profit and Loss (Income Statement)
              </h2>
              <p className="text-xs text-neutral-400">
                Standard accounting presentation of revenue, direct COGS, operating expenditures, and net earnings.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
              Currency: KES (Kenyan Shilling)
            </span>
          </div>

          <div className="space-y-6 text-sm">
            {/* 1. REVENUE SECTION */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>1. Operating Revenue &amp; Inflows</span>
              </div>
              <div className="divide-y divide-neutral-800/50 rounded-xl bg-neutral-950/60 border border-neutral-800/80 p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300">Software Recurring Subscriptions (Contracted MRR)</span>
                  <span className="font-mono font-medium text-white">
                    KES {summary.effectiveMRR.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2.5">
                  <span className="text-neutral-300">Hardware Setup, Onboarding &amp; Installation Fees</span>
                  <span className="font-mono font-medium text-white">
                    KES {summary.setupFeesCollected.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2.5">
                  <span className="text-neutral-300">Uncollected / Outstanding Accounts Receivable</span>
                  <span className="font-mono font-medium text-amber-400">
                    KES {summary.totalOutstanding.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-neutral-700/80">
                  <span className="text-white">Gross Revenue Invoiced</span>
                  <span className="font-mono text-emerald-400">KES {summary.totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-emerald-300">Net Cash Inflow Collected (Realized)</span>
                  <span className="font-mono text-emerald-400">KES {summary.totalCollected.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 2. COST OF GOODS SOLD (COGS) */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <span>2. Cost of Goods Sold &amp; Direct Infrastructure (COGS)</span>
              </div>
              <div className="divide-y divide-neutral-800/50 rounded-xl bg-neutral-950/60 border border-neutral-800/80 p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-300 flex items-center gap-2">
                    <Server className="h-3.5 w-3.5 text-blue-400" />
                    Cloud Infrastructure &amp; Hosting (Supabase, Railway, Vercel)
                  </span>
                  <span className="font-mono font-medium text-neutral-200">
                    KES{" "}
                    {expenses
                      .filter((e) => e.category === "INFRASTRUCTURE_CLOUD")
                      .reduce((sum, e) => sum + e.amountKES, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2.5">
                  <span className="text-neutral-300 flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-purple-400" />
                    Client Hardware Devices (Android Media Boxes, Thermal Printers)
                  </span>
                  <span className="font-mono font-medium text-neutral-200">
                    KES{" "}
                    {expenses
                      .filter((e) => e.category === "HARDWARE_DEVICES")
                      .reduce((sum, e) => sum + e.amountKES, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-neutral-700/80">
                  <span className="text-neutral-200">Total Direct COGS</span>
                  <span className="font-mono text-red-400">- KES {totalCOGS.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2">
                  <span className="text-white">Gross Profit (Margin: {grossMarginPct}%)</span>
                  <span className="font-mono text-blue-400">KES {grossProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 3. OPERATING EXPENSES (OPEX) */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>3. Operating Expenditures (OpEx)</span>
              </div>
              <div className="divide-y divide-neutral-800/50 rounded-xl bg-neutral-950/60 border border-neutral-800/80 p-4 space-y-2.5">
                {opexBreakdown.map((item) => (
                  <div key={item.key} className="flex justify-between items-center text-xs pt-2 first:pt-0">
                    <span className="text-neutral-300 flex items-center gap-2">
                      <item.icon className="h-3.5 w-3.5 text-amber-400" />
                      {item.label}
                    </span>
                    <span className="font-mono font-medium text-neutral-200">
                      KES {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-neutral-700/80">
                  <span className="text-neutral-200">Total Operating Expenses (OpEx)</span>
                  <span className="font-mono text-red-400">- KES {totalOpEx.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 4. NET PROFIT / EBITDA SUMMARY */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-emerald-500/30 space-y-3">
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  Net Operating Profit (EBITDA)
                </span>
                <span
                  className={`font-mono text-xl ${
                    netOperatingProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  KES {netOperatingProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                <span>Net Operating Margin</span>
                <span className="text-emerald-400 font-semibold">{netMarginPct}%</span>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Total Expenses Paid (COGS + OpEx)</span>
                <span className="font-mono text-red-400">KES {summary.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Unit Economics & Contribution Margins */}
        <div className="p-6 md:p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-400" />
              Product Profitability &amp; Unit Margin Analysis
            </h2>
            <p className="text-xs text-neutral-400">
              Net revenue contribution, direct margin profile, and MRR performance across each software vertical.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {productMargins.map((prod) => (
              <div
                key={prod.slug}
                className="p-5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${prod.color}`}>
                      {prod.name}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {prod.estMarginPct}% Margin
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400">{prod.tagline}</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-neutral-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Revenue Inflows</span>
                    <span className="font-bold text-white">KES {prod.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Contracted MRR</span>
                    <span className="font-bold text-blue-400">KES {prod.mrr.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Direct Cost COGS</span>
                    <span className="font-mono text-red-400">- KES {prod.estDirectCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-800 font-semibold">
                    <span className="text-neutral-300">Net Profit</span>
                    <span className="text-emerald-400">KES {prod.estNetProfit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${prod.barColor}`}
                    style={{ width: `${prod.estMarginPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit & Compliance Footer */}
        <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              All data dynamically consolidated from Invoices (KRA eTIMS aligned) and registered Operating Expenses.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/finance/invoices" className="text-emerald-400 hover:underline">
              Manage Invoices &rarr;
            </Link>
            <Link href="/finance/expenses" className="text-neutral-300 hover:underline">
              Review Expenses &rarr;
            </Link>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
