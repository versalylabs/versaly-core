"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  EquityScenario,
  Shareholding,
  loadEquityScenarios,
  saveEquityScenarios,
  formatKES,
} from "@/lib/finance-store";
import {
  PieChart,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Scale,
  Users,
  Percent,
  Sliders,
  Award,
  Calendar,
  Lock,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  FileCheck2,
} from "lucide-react";

export default function EquityRegisterPage() {
  const [scenarios, setScenarios] = useState<EquityScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("eq-proposed-seed");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dilution Calculator state
  const [isDilutionCalculatorOpen, setIsDilutionCalculatorOpen] = useState(false);
  const [dilutionNewShares, setDilutionNewShares] = useState<number>(25000);
  const [dilutionInvestmentAmount, setDilutionInvestmentAmount] = useState<number>(3000000);
  const [dilutionInvestorName, setDilutionInvestorName] = useState<string>("Series Seed Investor");

  // Add/Edit Shareholder Modal
  const [isShareholderModalOpen, setIsShareholderModalOpen] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<Shareholding | null>(null);
  const [shareholderName, setShareholderName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [percentage, setPercentage] = useState<number>(10);
  const [sharesCount, setSharesCount] = useState<number>(10000);
  const [shareClass, setShareClass] = useState<"ORDINARY_A" | "ORDINARY_B" | "PREFERRED">("ORDINARY_A");
  const [vestingMonths, setVestingMonths] = useState<number>(48);
  const [cliffMonths, setCliffMonths] = useState<number>(12);
  const [vestingStartDate, setVestingStartDate] = useState("2026-10-26");
  const [votingRights, setVotingRights] = useState(true);
  const [isLegallyBinding, setIsLegallyBinding] = useState(false);
  const [notes, setNotes] = useState("");

  // New Scenario Modal
  const [isNewScenarioModalOpen, setIsNewScenarioModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioIsLegal, setNewScenarioIsLegal] = useState(false);
  const [newScenarioNotes, setNewScenarioNotes] = useState("");

  useEffect(() => {
    try {
      setVestingStartDate(new Date().toISOString().split("T")[0]);
    } catch {}

    const loaded = loadEquityScenarios();
    setScenarios(loaded);
    if (loaded.length > 0 && !loaded.some((s) => s.id === activeScenarioId)) {
      setActiveScenarioId(loaded[0].id);
    }

    const handleSync = () => {
      setScenarios(loadEquityScenarios());
    };

    window.addEventListener("versaly_equity_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_equity_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [activeScenarioId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeScenario = useMemo(() => {
    return (
      scenarios.find((s) => s.id === activeScenarioId) ||
      scenarios[0] || {
        id: "fallback",
        scenarioName: "Default Scenario",
        isLegallyIssued: false,
        totalAuthorizedShares: 1000000,
        totalIssuedShares: 100000,
        notes: "",
        stakeholders: [],
      }
    );
  }, [scenarios, activeScenarioId]);

  const totalAllocatedPct = useMemo(() => {
    return activeScenario.stakeholders.reduce((sum, s) => sum + s.percentage, 0);
  }, [activeScenario]);

  const totalAllocatedShares = useMemo(() => {
    return activeScenario.stakeholders.reduce((sum, s) => sum + s.sharesCount, 0);
  }, [activeScenario]);

  // Dilution simulation calculations
  const simulatedDilution = useMemo(() => {
    const currentTotalShares = activeScenario.totalIssuedShares || 100000;
    const postMoneyShares = currentTotalShares + dilutionNewShares;
    const investorPct = (dilutionNewShares / postMoneyShares) * 100;
    const preMoneyValuation =
      dilutionNewShares > 0
        ? (dilutionInvestmentAmount / (dilutionNewShares / postMoneyShares)) - dilutionInvestmentAmount
        : 0;

    const dilutedHolders = activeScenario.stakeholders.map((s) => {
      const newPct = (s.sharesCount / postMoneyShares) * 100;
      const pctDrop = s.percentage - newPct;
      return {
        ...s,
        newPct,
        pctDrop,
      };
    });

    return {
      postMoneyShares,
      investorPct,
      preMoneyValuation,
      dilutedHolders,
    };
  }, [activeScenario, dilutionNewShares, dilutionInvestmentAmount]);

  const handleOpenAddShareholder = () => {
    setEditingShareholder(null);
    setShareholderName("");
    setRoleTitle("");
    setPercentage(10);
    setSharesCount(10000);
    setShareClass("ORDINARY_A");
    setVestingMonths(48);
    setCliffMonths(12);
    setVestingStartDate(new Date().toISOString().split("T")[0]);
    setVotingRights(true);
    setIsLegallyBinding(false);
    setNotes("");
    setIsShareholderModalOpen(true);
  };

  const handleOpenEditShareholder = (sh: Shareholding) => {
    setEditingShareholder(sh);
    setShareholderName(sh.shareholderName);
    setRoleTitle(sh.roleTitle);
    setPercentage(sh.percentage);
    setSharesCount(sh.sharesCount);
    setShareClass(sh.shareClass);
    setVestingMonths(sh.vestingMonths || 48);
    setCliffMonths(sh.cliffMonths || 12);
    setVestingStartDate(sh.vestingStartDate || new Date().toISOString().split("T")[0]);
    setVotingRights(sh.votingRights !== false);
    setIsLegallyBinding(sh.isLegallyBinding);
    setNotes(sh.notes || "");
    setIsShareholderModalOpen(true);
  };

  const handleSaveShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareholderName) {
      alert("Please provide the shareholder name");
      return;
    }

    const updatedScenarios = scenarios.map((sc) => {
      if (sc.id !== activeScenario.id) return sc;

      let updatedHolders: Shareholding[];
      if (editingShareholder) {
        updatedHolders = sc.stakeholders.map((item) =>
          item.id === editingShareholder.id
            ? {
                ...item,
                shareholderName,
                roleTitle,
                percentage,
                sharesCount,
                shareClass,
                vestingMonths,
                cliffMonths,
                vestingStartDate,
                votingRights,
                isLegallyBinding,
                notes,
              }
            : item
        );
      } else {
        const newHolder: Shareholding = {
          id: `sh-${Date.now()}`,
          shareholderName,
          roleTitle,
          percentage,
          sharesCount,
          shareClass,
          vestingMonths,
          cliffMonths,
          vestingStartDate,
          votingRights,
          isLegallyBinding,
          notes,
        };
        updatedHolders = [...sc.stakeholders, newHolder];
      }

      const totalShares = updatedHolders.reduce((sum, h) => sum + h.sharesCount, 0);

      return {
        ...sc,
        totalIssuedShares: totalShares,
        stakeholders: updatedHolders,
      };
    });

    saveEquityScenarios(updatedScenarios);
    setScenarios(updatedScenarios);
    setIsShareholderModalOpen(false);
    showToast(editingShareholder ? "Shareholder record updated" : "New shareholder added to cap table");
  };

  const handleDeleteShareholder = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from this scenario?`)) return;

    const updatedScenarios = scenarios.map((sc) => {
      if (sc.id !== activeScenario.id) return sc;
      const updatedHolders = sc.stakeholders.filter((h) => h.id !== id);
      const totalShares = updatedHolders.reduce((sum, h) => sum + h.sharesCount, 0);
      return {
        ...sc,
        totalIssuedShares: totalShares,
        stakeholders: updatedHolders,
      };
    });

    saveEquityScenarios(updatedScenarios);
    setScenarios(updatedScenarios);
    showToast(`${name} removed from cap table`);
  };

  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName) return;

    const newScenario: EquityScenario = {
      id: `eq-${Date.now()}`,
      scenarioName: newScenarioName,
      isLegallyIssued: newScenarioIsLegal,
      totalAuthorizedShares: 1000000,
      totalIssuedShares: activeScenario.totalIssuedShares,
      notes: newScenarioNotes,
      stakeholders: activeScenario.stakeholders.map((s) => ({ ...s, id: `sh-${Date.now()}-${s.id}` })),
    };

    const next = [...scenarios, newScenario];
    saveEquityScenarios(next);
    setScenarios(next);
    setActiveScenarioId(newScenario.id);
    setIsNewScenarioModalOpen(false);
    setNewScenarioName("");
    setNewScenarioNotes("");
    showToast(`Created scenario: ${newScenario.scenarioName}`);
  };

  const palette = [
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-sky-600",
  ];

  return (
    <WorkspaceLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-5 h-5 text-indigo-100" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
              <Link href="/finance" className="hover:underline">Finance</Link>
              <span>/</span>
              <span>Ownership & Equity</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <PieChart className="w-8 h-8 text-indigo-400" />
              Ownership & Equity Register
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Restricted cap table governance, share classes, vesting schedules, and dilution modeling for Versaly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDilutionCalculatorOpen(!isDilutionCalculatorOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-sm transition-all"
            >
              <Sliders className="w-4 h-4" />
              {isDilutionCalculatorOpen ? "Hide Dilution Tool" : "Simulate Dilution"}
            </button>
            <button
              onClick={() => setIsNewScenarioModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              New Scenario
            </button>
            <button
              onClick={handleOpenAddShareholder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Shareholder
            </button>
          </div>
        </div>

        {/* MANDATORY LEGAL SAFEGUARD BANNER */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <span className="font-bold text-amber-300">LEGAL COMPLIANCE NOTICE:</span> Financial contributions do not automatically calculate or issue shares. Ownership percentages must be managed separately and only updated following properly authorized legal board minutes and official filings with the Kenyan Business Registration Service (BRS).
              <div className="mt-1 text-slate-400 text-xs">
                Proposed ownership percentages are for strategic planning only and are not legally binding until formal issuance.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Restricted Admin Area
          </span>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider">Scenarios:</span>
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 ${
                  activeScenarioId === sc.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {sc.isLegallyIssued ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                )}
                {sc.scenarioName}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              activeScenario.isLegallyIssued
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}>
              {activeScenario.isLegallyIssued ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Legally Issued & BRS Filed
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  Proposed / Unfinalized Scenario
                </>
              )}
            </span>
          </div>
        </div>

        {/* High Level KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Authorized Shares</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {activeScenario.totalAuthorizedShares.toLocaleString()}
            </p>
            <span className="text-xs text-slate-500 mt-1 block">Nominal share capital pool</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Issued & Allocated Shares</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {totalAllocatedShares.toLocaleString()}
            </p>
            <span className="text-xs text-emerald-400 mt-1 block">
              {((totalAllocatedShares / activeScenario.totalAuthorizedShares) * 100).toFixed(1)}% of authorized pool
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Allocated %</span>
              <Percent className="w-4 h-4 text-violet-400" />
            </div>
            <p className={`text-2xl font-bold mt-2 ${totalAllocatedPct === 100 ? "text-emerald-400" : "text-amber-400"}`}>
              {totalAllocatedPct}%
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {totalAllocatedPct === 100 ? "Cap table 100% reconciled" : `${(100 - totalAllocatedPct).toFixed(1)}% unallocated reserve`}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Shareholders Listed</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">
              {activeScenario.stakeholders.length} Stakeholders
            </p>
            <span className="text-xs text-slate-400 mt-1 block">Founders, co-founders & strategic partners</span>
          </div>
        </div>

        {/* Visual Cap Table Proportional Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Equity Distribution Breakdown</h2>
              <p className="text-xs text-slate-400">Visual representation of equity ownership for current scenario</p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Authorized: {activeScenario.totalAuthorizedShares.toLocaleString()} | Issued: {totalAllocatedShares.toLocaleString()}
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="w-full h-7 bg-slate-800 rounded-xl overflow-hidden flex p-1 gap-1">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div
                key={sh.id}
                style={{ width: `${sh.percentage}%` }}
                className={`h-full rounded-lg bg-gradient-to-r ${palette[idx % palette.length]} transition-all group relative`}
                title={`${sh.shareholderName}: ${sh.percentage}% (${sh.sharesCount.toLocaleString()} shares)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div key={sh.id} className="flex items-center gap-2 text-xs">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${palette[idx % palette.length]}`} />
                <span className="text-slate-300 font-medium">{sh.shareholderName}</span>
                <span className="font-bold text-white">{sh.percentage}%</span>
                <span className="text-slate-500">({sh.sharesCount.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE DILUTION CALCULATOR (Collapsible) */}
        {isDilutionCalculatorOpen && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Sliders className="w-3.5 h-3.5" />
                  Interactive Scenario Simulation
                </div>
                <h2 className="text-lg font-bold text-white">Investment Round & Equity Dilution Calculator</h2>
                <p className="text-xs text-slate-400">
                  Model how a new funding round or option pool affects the existing cap table.
                </p>
              </div>
              <button
                onClick={() => setIsDilutionCalculatorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Incoming Investor / Pool Name</label>
                <input
                  type="text"
                  value={dilutionInvestorName}
                  onChange={(e) => setDilutionInvestorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Angel Investor or ESOP Pool"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">New Shares to Issue</label>
                <input
                  type="number"
                  value={dilutionNewShares}
                  onChange={(e) => setDilutionNewShares(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New shares issued = {((dilutionNewShares / (activeScenario.totalIssuedShares + dilutionNewShares)) * 100).toFixed(1)}% post-money
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Capital Invested (KES)</label>
                <input
                  type="number"
                  value={dilutionInvestmentAmount}
                  onChange={(e) => setDilutionInvestmentAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-indigo-400 mt-1 block font-mono">
                  {formatKES(dilutionInvestmentAmount)}
                </span>
              </div>
            </div>

            {/* Simulation Results Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Shareholder</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Pre-Round %</th>
                    <th className="p-3 text-right">Post-Round %</th>
                    <th className="p-3 text-right">Dilution Delta</th>
                    <th className="p-3 text-right">Post-Round Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {simulatedDilution.dilutedHolders.map((dh) => (
                    <tr key={dh.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-white">{dh.shareholderName}</td>
                      <td className="p-3 text-slate-400">{dh.roleTitle}</td>
                      <td className="p-3 text-right font-medium text-slate-300">{dh.percentage.toFixed(1)}%</td>
                      <td className="p-3 text-right font-bold text-indigo-300">{dh.newPct.toFixed(1)}%</td>
                      <td className="p-3 text-right text-rose-400 font-mono">
                        -{dh.pctDrop.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-slate-300 font-mono">{dh.sharesCount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-950/40 border-t border-indigo-500/30 font-semibold text-indigo-200">
                    <td className="p-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      {dilutionInvestorName} (New)
                    </td>
                    <td className="p-3 text-indigo-300">Incoming Equity</td>
                    <td className="p-3 text-right text-slate-500">0.0%</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {simulatedDilution.investorPct.toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-emerald-400">+{simulatedDilution.investorPct.toFixed(1)}%</td>
                    <td className="p-3 text-right font-mono text-white">{dilutionNewShares.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 gap-2">
              <div>
                Estimated Implied Pre-Money Valuation:{" "}
                <span className="font-bold text-white font-mono">{formatKES(simulatedDilution.preMoneyValuation)}</span>
              </div>
              <div>
                Post-Money Total Shares:{" "}
                <span className="font-bold text-white font-mono">{simulatedDilution.postMoneyShares.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stakeholder Table & Detail Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Shareholders & Cap Table Register</h2>
              <p className="text-xs text-slate-400">Detailed rights, vesting terms, and share classes</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Scenario: <strong className="text-white">{activeScenario.scenarioName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeScenario.stakeholders.map((sh, idx) => (
              <div
                key={sh.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${palette[idx % palette.length]} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                        {sh.shareholderName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{sh.shareholderName}</h3>
                        <p className="text-xs text-slate-400">{sh.roleTitle}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-indigo-400 font-mono">
                      {sh.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Shares Count</span>
                      <span className="font-bold text-white font-mono mt-0.5 block">{sh.sharesCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Share Class</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-800 font-mono text-indigo-300 font-medium">
                        {sh.shareClass}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Voting Rights</span>
                      <span className={`inline-flex items-center gap-1 font-medium mt-0.5 ${sh.votingRights !== false ? "text-emerald-400" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {sh.votingRights !== false ? "Voting" : "Non-Voting"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Legal Status</span>
                      <span className={`inline-flex items-center gap-1 font-medium mt-0.5 ${sh.isLegallyBinding ? "text-emerald-400" : "text-amber-400"}`}>
                        {sh.isLegallyBinding ? "BRS Filed" : "Proposed"}
                      </span>
                    </div>
                  </div>

                  {/* Vesting Schedule Details */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        Vesting Schedule
                      </span>
                      <span className="font-mono text-white font-medium">{sh.vestingMonths || 48} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Cliff Period</span>
                      <span className="font-mono text-white">{sh.cliffMonths || 12} Months</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Commencement</span>
                      <span className="font-mono text-slate-300">{sh.vestingStartDate || "At incorporation"}</span>
                    </div>
                  </div>

                  {sh.notes && (
                    <div className="mt-3 text-[11px] text-slate-400 italic bg-slate-800/30 p-2 rounded-lg">
                      &ldquo;{sh.notes}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEditShareholder(sh)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                    title="Edit shareholder terms"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteShareholder(sh.id, sh.shareholderName)}
                    className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs flex items-center gap-1"
                    title="Remove shareholder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD / EDIT SHAREHOLDER MODAL */}
        {isShareholderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  {editingShareholder ? "Edit Shareholder Terms" : "Add New Shareholder"}
                </h3>
                <button
                  onClick={() => setIsShareholderModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveShareholder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Shareholder Name *</label>
                    <input
                      type="text"
                      required
                      value={shareholderName}
                      onChange={(e) => setShareholderName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="e.g. Founder & CEO"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Ownership Percentage (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Shares Count</label>
                    <input
                      type="number"
                      min="1"
                      value={sharesCount}
                      onChange={(e) => setSharesCount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Share Class</label>
                    <select
                      value={shareClass}
                      onChange={(e) => setShareClass(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ORDINARY_A">Ordinary Class A (Voting)</option>
                      <option value="ORDINARY_B">Ordinary Class B (Non-voting)</option>
                      <option value="PREFERRED">Preferred Shares</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Vesting Period (Months)</label>
                    <input
                      type="number"
                      value={vestingMonths}
                      onChange={(e) => setVestingMonths(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Cliff Period (Months)</label>
                    <input
                      type="number"
                      value={cliffMonths}
                      onChange={(e) => setCliffMonths(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Vesting Commencement Date</label>
                    <input
                      type="date"
                      value={vestingStartDate}
                      onChange={(e) => setVestingStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={votingRights}
                      onChange={(e) => setVotingRights(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    Voting Rights Granted
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLegallyBinding}
                      onChange={(e) => setIsLegallyBinding(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                    />
                    Legally Filed at BRS
                  </label>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Governance Notes / Agreement Ref</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Shareholders agreement date, transfer restrictions, etc."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsShareholderModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    {editingShareholder ? "Save Changes" : "Add to Cap Table"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NEW SCENARIO MODAL */}
        {isNewScenarioModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  Create Equity Scenario
                </h3>
                <button
                  onClick={() => setIsNewScenarioModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateScenario} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scenario Name *</label>
                  <input
                    type="text"
                    required
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="e.g. Series Seed Post-Money Cap Table"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Scenario Description / Context</label>
                  <textarea
                    rows={2}
                    value={newScenarioNotes}
                    onChange={(e) => setNewScenarioNotes(e.target.value)}
                    placeholder="Rationale for this ownership distribution scenario..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newScenarioIsLegal}
                      onChange={(e) => setNewScenarioIsLegal(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-0"
                    />
                    <span className="font-medium text-white">This scenario is legally issued at BRS</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 ml-5">
                    Leave unchecked if this is an unfinalized planning or negotiation scenario.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewScenarioModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                  >
                    Create Scenario
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
