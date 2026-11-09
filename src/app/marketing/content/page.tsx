"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useMarketingContent } from "@/components/marketing-content/use-marketing-content";
import { ContentHeader } from "@/components/marketing-content/content-header";
import { StreakRow } from "@/components/marketing-content/streak-row";
import { FilterBar } from "@/components/marketing-content/filter-bar";
import { PostsFeed } from "@/components/marketing-content/posts-feed";
import { PostModal } from "@/components/marketing-content/post-modal";
import { MetricsModal } from "@/components/marketing-content/metrics-modal";

export default function MarketingContentPage() {
  const d = useMarketingContent();

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        <ContentHeader d={d} />
        <StreakRow d={d} />
        <FilterBar d={d} />
        <PostsFeed d={d} />
      </div>
      <PostModal d={d} />
      <MetricsModal d={d} />
    </WorkspaceLayout>
  );
}
