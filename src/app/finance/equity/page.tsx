"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useEquity } from "@/components/equity-page/use-equity";
import { EquityToast } from "@/components/equity-page/equity-toast";
import { EquityHeader } from "@/components/equity-page/equity-header";
import { LegalBanner } from "@/components/equity-page/legal-banner";
import { ScenarioTabs } from "@/components/equity-page/scenario-tabs";
import { KpiMetrics } from "@/components/equity-page/kpi-metrics";
import { CapTableBar } from "@/components/equity-page/cap-table-bar";
import { DilutionCalculator } from "@/components/equity-page/dilution-calculator";
import { StakeholderTable } from "@/components/equity-page/stakeholder-table";
import { ShareholderModal } from "@/components/equity-page/shareholder-modal";
import { NewScenarioModal } from "@/components/equity-page/new-scenario-modal";

export default function EquityRegisterPage() {
  const d = useEquity();

  return (
    <WorkspaceLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
        <EquityToast d={d} />
        <EquityHeader d={d} />
        <LegalBanner />
        <ScenarioTabs d={d} />
        <KpiMetrics d={d} />
        <CapTableBar d={d} />
        <DilutionCalculator d={d} />
        <StakeholderTable d={d} />
        <ShareholderModal d={d} />
        <NewScenarioModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
