"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useMarketingOverview } from "@/components/marketing-overview/use-marketing-overview";
import { OverviewHeader } from "@/components/marketing-overview/overview-header";
import { MetricCards } from "@/components/marketing-overview/metric-cards";
import { ChannelInvestment } from "@/components/marketing-overview/channel-investment";
import { CampaignsTable } from "@/components/marketing-overview/campaigns-table";
import { QuickLinks } from "@/components/marketing-overview/quick-links";
import { QuickSpendModal } from "@/components/marketing-overview/quick-spend-modal";
import { QuickPostModal } from "@/components/marketing-overview/quick-post-modal";

export default function MarketingDashboardPage() {
  const d = useMarketingOverview();

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        <OverviewHeader d={d} />
        <MetricCards d={d} />
        <ChannelInvestment d={d} />
        <CampaignsTable d={d} />
        <QuickLinks />
      </div>
      <QuickSpendModal d={d} />
      <QuickPostModal d={d} />
    </WorkspaceLayout>
  );
}
