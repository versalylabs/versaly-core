"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useFinanceOverview } from "@/components/finance-overview/use-finance-overview";
import { FinanceHeader } from "@/components/finance-overview/finance-header";
import { SectionNavGrid } from "@/components/finance-overview/section-nav-grid";
import { MetricCards } from "@/components/finance-overview/metric-cards";
import { VaultBalances } from "@/components/finance-overview/vault-balances";
import { TargetsAndBudget } from "@/components/finance-overview/targets-and-budget";
import { ProductRevenue } from "@/components/finance-overview/product-revenue";
import { RecentActivity } from "@/components/finance-overview/recent-activity";
import { FinanceToast } from "@/components/finance-overview/finance-toast";
import { AccountsModal } from "@/components/finance-overview/accounts-modal";

export default function FinanceDashboardPage() {
  const d = useFinanceOverview();

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12 text-slate-100">
        <FinanceHeader d={d} />
        <SectionNavGrid d={d} />
        <MetricCards d={d} />
        <VaultBalances d={d} />
        <TargetsAndBudget d={d} />
        <ProductRevenue d={d} />
        <RecentActivity d={d} />
        <FinanceToast d={d} />
        <AccountsModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
