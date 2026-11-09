"use client";

import { useState, useEffect, useMemo } from "react";
import { MarketingCampaign, INITIAL_CAMPAIGNS, AdSpendEntry, INITIAL_SPEND, SocialPost, INITIAL_SOCIAL_POSTS, MarketingProduct } from "@/data/marketing-seed";
import { appStorage } from "@/lib/app-storage";
import { todayIsoDate } from "@/lib/ids";
import { CAMPAIGNS_STORAGE, SPEND_STORAGE, POSTS_STORAGE } from "./helpers";

export function useMarketingOverview() {

  // Campaigns State
  const [campaigns] = useState<MarketingCampaign[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(CAMPAIGNS_STORAGE);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_CAMPAIGNS;
  });

  // Spend State
  const [spends, setSpends] = useState<AdSpendEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(SPEND_STORAGE);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_SPEND;
  });

  // Social Posts State
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(POSTS_STORAGE);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_SOCIAL_POSTS;
  });

  // Quick Action Modals
  const [showQuickSpendModal, setShowQuickSpendModal] = useState(false);
  const [showQuickPostModal, setShowQuickPostModal] = useState(false);

  // Quick Spend Form State
  const [spendAmount, setSpendAmount] = useState("");
  const [spendVendor, setSpendVendor] = useState("");
  const [spendChannel, setSpendChannel] = useState<AdSpendEntry["channel"]>("Meta Ads");
  const [spendProduct, setSpendProduct] = useState<MarketingProduct>("Vehisoft");
  const [spendNotes, setSpendNotes] = useState("");

  // Quick Post Form State
  const [postTitle, setPostTitle] = useState("");
  const [postProduct, setPostProduct] = useState<MarketingProduct>("Vehisoft");
  const [postCopy, setPostCopy] = useState("");
  const [postChannels, setPostChannels] = useState<SocialPost["channels"]>(["LinkedIn", "X / Twitter"]);

  // Sync to local storage
  useEffect(() => {
    try {
      appStorage.setItem(CAMPAIGNS_STORAGE, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      appStorage.setItem(SPEND_STORAGE, JSON.stringify(spends));
    } catch {
      // ignore
    }
  }, [spends]);

  useEffect(() => {
    try {
      appStorage.setItem(POSTS_STORAGE, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  // Aggregate Metrics
  const totalAllocatedBudget = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.allocatedBudget, 0),
    [campaigns]
  );

  const totalSpent = useMemo(
    () => spends.reduce((acc, s) => acc + s.amount, 0),
    [spends]
  );

  const totalLeads = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0),
    [campaigns]
  );

  const totalRevenue = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0),
    [campaigns]
  );

  const totalImpressions = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.impressions, 0),
    [campaigns]
  );

  const totalClicks = useMemo(
    () => campaigns.reduce((acc, c) => acc + c.clicks, 0),
    [campaigns]
  );

  const costPerLead = useMemo(() => {
    return totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;
  }, [totalSpent, totalLeads]);

  const roas = useMemo(() => {
    return totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : "0.00";
  }, [totalRevenue, totalSpent]);

  // Spend breakdown by channel
  const channelBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    spends.forEach((s) => {
      map[s.channel] = (map[s.channel] || 0) + s.amount;
    });
    return map;
  }, [spends]);

  // Handle Quick Add Spend
  const handleSaveSpend = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(spendAmount);
    if (!parsedAmount || isNaN(parsedAmount)) return;

    const newEntry: AdSpendEntry = {
      id: `spd-${Date.now()}`,
      campaignName: `${spendChannel} - ${spendProduct} Allocation`,
      date: todayIsoDate(),
      channel: spendChannel,
      product: spendProduct,
      amount: parsedAmount,
      paymentMethod: "M-Pesa Paybill",
      vendor: spendVendor.trim() || "Marketing Vendor",
      status: "Paid",
      notes: spendNotes.trim(),
    };

    setSpends((prev) => [newEntry, ...prev]);
    setSpendAmount("");
    setSpendVendor("");
    setSpendNotes("");
    setShowQuickSpendModal(false);
  };

  // Handle Quick Add Post
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postCopy.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      title: postTitle.trim(),
      date: todayIsoDate(),
      timeSlot: "09:00 AM",
      channels: postChannels.length > 0 ? postChannels : ["LinkedIn"],
      product: postProduct,
      contentType: "Educational / Case Study",
      copy: postCopy.trim(),
      status: "Scheduled",
      engagement: { views: 0, likes: 0, shares: 0, comments: 0, inquiries: 0 },
    };

    setPosts((prev) => [newPost, ...prev]);
    setPostTitle("");
    setPostCopy("");
    setShowQuickPostModal(false);
  };

  // Quick toggle post status
  const handlePublishPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              status: "Published",
              engagement: {
                ...p.engagement,
                views: p.engagement.views === 0 ? 320 : p.engagement.views,
                likes: p.engagement.likes === 0 ? 18 : p.engagement.likes,
              },
            }
          : p
      )
    );
  };

  return {
    campaigns,
    spends,
    setSpends,
    posts,
    setPosts,
    showQuickSpendModal,
    setShowQuickSpendModal,
    showQuickPostModal,
    setShowQuickPostModal,
    spendAmount,
    setSpendAmount,
    spendVendor,
    setSpendVendor,
    spendChannel,
    setSpendChannel,
    spendProduct,
    setSpendProduct,
    spendNotes,
    setSpendNotes,
    postTitle,
    setPostTitle,
    postProduct,
    setPostProduct,
    postCopy,
    setPostCopy,
    postChannels,
    setPostChannels,
    totalAllocatedBudget,
    totalSpent,
    totalLeads,
    totalRevenue,
    totalImpressions,
    totalClicks,
    costPerLead,
    roas,
    channelBreakdown,
    handleSaveSpend,
    handleSavePost,
    handlePublishPost,
  };
}

export type MarketingOverviewModel = ReturnType<typeof useMarketingOverview>;
