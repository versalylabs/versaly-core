"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useDashboard } from "@/components/dashboard/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { IntelligenceBriefing } from "@/components/dashboard/intelligence-briefing";
import { DashboardToast } from "@/components/dashboard/dashboard-toast";
import { FridayReview } from "@/components/dashboard/friday-review";
import { SectionTabs } from "@/components/dashboard/section-tabs";
import { MoneySection } from "@/components/dashboard/money-section";
import { SalesSection } from "@/components/dashboard/sales-section";
import { PipelineSection } from "@/components/dashboard/pipeline-section";
import { DeliverySection } from "@/components/dashboard/delivery-section";
import { ProductsSection } from "@/components/dashboard/products-section";
import { LogActionModal } from "@/components/dashboard/log-action-modal";
import { NewActionModal } from "@/components/dashboard/new-action-modal";
import { WhatsAppModal } from "@/components/dashboard/whatsapp-modal";

export default function DashboardPage() {
  const d = useDashboard();

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <DashboardHeader d={d} />
        <IntelligenceBriefing d={d} />
        <DashboardToast d={d} />
        <FridayReview d={d} />
        <SectionTabs d={d} />
        <MoneySection d={d} />
        <SalesSection d={d} />
        <PipelineSection d={d} />
        <DeliverySection d={d} />
        <ProductsSection d={d} />
        <LogActionModal d={d} />
        <NewActionModal d={d} />
        <WhatsAppModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
