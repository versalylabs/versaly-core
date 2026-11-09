"use client";

import { useState, useEffect, useMemo } from "react";
import { EquityScenario, loadEquityScenarios, Shareholding, saveEquityScenarios } from "@/lib/finance-store";
import { todayIsoDate } from "@/lib/ids";


export function useEquity() {
  const [scenarios, setScenarios] = useState<EquityScenario[]>(() => loadEquityScenarios());
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => {
    const list = loadEquityScenarios();
    return list.some((s) => s.id === "eq-proposed-seed") ? "eq-proposed-seed" : (list[0]?.id ?? "eq-proposed-seed");
  });
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
  const [vestingStartDate, setVestingStartDate] = useState(() => todayIsoDate());
  const [votingRights, setVotingRights] = useState(true);
  const [isLegallyBinding, setIsLegallyBinding] = useState(false);
  const [notes, setNotes] = useState("");

  // New Scenario Modal
  const [isNewScenarioModalOpen, setIsNewScenarioModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioIsLegal, setNewScenarioIsLegal] = useState(false);
  const [newScenarioNotes, setNewScenarioNotes] = useState("");

  useEffect(() => {
    const handleSync = () => {
      setScenarios(loadEquityScenarios());
    };

    window.addEventListener("versaly_equity_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("versaly_equity_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

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
    setVestingStartDate(todayIsoDate());
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
    setVestingStartDate(sh.vestingStartDate || todayIsoDate());
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

  return {
    scenarios,
    setScenarios,
    activeScenarioId,
    setActiveScenarioId,
    toastMessage,
    setToastMessage,
    isDilutionCalculatorOpen,
    setIsDilutionCalculatorOpen,
    dilutionNewShares,
    setDilutionNewShares,
    dilutionInvestmentAmount,
    setDilutionInvestmentAmount,
    dilutionInvestorName,
    setDilutionInvestorName,
    isShareholderModalOpen,
    setIsShareholderModalOpen,
    editingShareholder,
    setEditingShareholder,
    shareholderName,
    setShareholderName,
    roleTitle,
    setRoleTitle,
    percentage,
    setPercentage,
    sharesCount,
    setSharesCount,
    shareClass,
    setShareClass,
    vestingMonths,
    setVestingMonths,
    cliffMonths,
    setCliffMonths,
    vestingStartDate,
    setVestingStartDate,
    votingRights,
    setVotingRights,
    isLegallyBinding,
    setIsLegallyBinding,
    notes,
    setNotes,
    isNewScenarioModalOpen,
    setIsNewScenarioModalOpen,
    newScenarioName,
    setNewScenarioName,
    newScenarioIsLegal,
    setNewScenarioIsLegal,
    newScenarioNotes,
    setNewScenarioNotes,
    showToast,
    activeScenario,
    totalAllocatedPct,
    totalAllocatedShares,
    simulatedDilution,
    handleOpenAddShareholder,
    handleOpenEditShareholder,
    handleSaveShareholder,
    handleDeleteShareholder,
    handleCreateScenario,
    palette,
  };
}

export type EquityModel = ReturnType<typeof useEquity>;
