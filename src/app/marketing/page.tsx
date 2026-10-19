"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Megaphone,
  Flame,
  DollarSign,
  Share2,
  Palette,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Target,
  MapPin,
  ChevronRight,
  X,
  Zap,
} from "lucide-react";
import {
  INITIAL_CAMPAIGNS,
  INITIAL_SPEND,
  INITIAL_SOCIAL_POSTS,
  MarketingCampaign,
  AdSpendEntry,
  SocialPost,
  MarketingProduct,
} from "@/data/marketing-seed";

const CAMPAIGNS_STORAGE = "versaly_marketing_campaigns_v1";
const SPEND_STORAGE = "versaly_marketing_spend_v1";
const POSTS_STORAGE = "versaly_marketing_posts_v1";

export default function MarketingDashboardPage() {
  // Campaigns State
  const [campaigns] = useState<MarketingCampaign[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CAMPAIGNS_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        const stored = localStorage.getItem(SPEND_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
        const stored = localStorage.getItem(POSTS_STORAGE);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      localStorage.setItem(CAMPAIGNS_STORAGE, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem(SPEND_STORAGE, JSON.stringify(spends));
    } catch {
      // ignore
    }
  }, [spends]);

  useEffect(() => {
    try {
      localStorage.setItem(POSTS_STORAGE, JSON.stringify(posts));
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
      date: new Date().toISOString().split("T")[0],
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
      date: new Date().toISOString().split("T")[0],
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

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Marketing Engine
              </span>
              <span className="text-xs text-slate-500">Launch Growth & Ad Spend</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-rose-500" />
              <span>Marketing Command Center</span>
            </h1>
            <p className="text-xs text-slate-400">
              Track billboard investments, high-converting digital campaigns, daily social media cadence, and CAC attribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowQuickSpendModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition shadow-sm"
            >
              <DollarSign className="h-4 w-4" />
              <span>+ Log Ad Spend</span>
            </button>
            <button
              onClick={() => setShowQuickPostModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              <span>+ Draft Daily Post</span>
            </button>
            <Link
              href="/marketing/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition"
            >
              <Flame className="h-4 w-4" />
              <span>Campaigns Overview</span>
            </Link>
          </div>
        </div>

        {/* 6 Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Ad Spend */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Total Ad Invested</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {totalSpent.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                <span>Budget: KES {totalAllocatedBudget.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    totalAllocatedBudget > 0 ? (totalSpent / totalAllocatedBudget) * 100 : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Card 2: Marketing Leads */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Marketing Leads</span>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{totalLeads}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {totalImpressions.toLocaleString()} views · {totalClicks} clicks
              </p>
            </div>
            <div className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>High intent inbound</span>
            </div>
          </div>

          {/* Card 3: Cost Per Lead (CPL) */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Avg Cost / Lead</span>
              <Target className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {costPerLead.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Blended digital & outdoor</p>
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              Target: &lt; KES 2,500
            </div>
          </div>

          {/* Card 4: Attributed Revenue */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Attributed Sales</span>
              <TrendingUp className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                KES {totalRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Closed deals from campaigns</p>
            </div>
            <div className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
              <span>{campaigns.reduce((a, b) => a + b.dealsWon, 0)} won clients</span>
            </div>
          </div>

          {/* Card 5: Blended ROAS */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Blended ROAS</span>
              <Zap className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{roas}x</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Return on ad investment</p>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              Profitable acquisition
            </div>
          </div>

          {/* Card 6: Daily Posting Cadence */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium">Daily Social Posts</span>
              <Share2 className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">
                {posts.filter((p) => p.status === "Published").length} / {posts.length}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Published pieces</p>
            </div>
            <div className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Daily rhythm active</span>
            </div>
          </div>
        </div>

        {/* Channel Investment & Billboard Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Billboard / Outdoor High-Impact Card (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Billboard & Outdoor</h3>
                  <p className="text-[10px] text-slate-400">Prime Nairobi corridors</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Sites
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Westlands Roundabout</span>
                <span className="text-[10px] text-emerald-400 font-mono">KES 90,000 / mo</span>
              </div>
              <p className="text-[11px] text-slate-400">
                High-visibility static billboard targeted at agency directors & commercial brand managers.
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span>Est. 280k daily eyeballs</span>
                <span>QR scans: 742</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Ngong Road (Adams Arcade)</span>
                <span className="text-[10px] text-emerald-400 font-mono">KES 60,000 / mo</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Corridor connecting Kilimani, Lavington, and Karen. Promotes Adversoft billboard automation.
              </p>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                <span>Est. 200k daily eyeballs</span>
                <span>QR scans: 498</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Total Outdoor Investment:</span>
              <span className="font-bold text-white font-mono">
                KES {(channelBreakdown["Billboard / Outdoor"] || 150000).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Spend by Channel Chart / Breakdown (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Investment by Channel</h3>
                <p className="text-[10px] text-slate-400">Outdoor vs Digital allocations</p>
              </div>
              <Link
                href="/marketing/spend"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
              >
                <span>Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: "Billboard / Outdoor", amount: channelBreakdown["Billboard / Outdoor"] || 150000, color: "bg-rose-500" },
                { name: "Meta Ads (FB/IG)", amount: channelBreakdown["Meta Ads"] || 24500, color: "bg-blue-500" },
                { name: "Google Ads", amount: channelBreakdown["Google Ads"] || 18200, color: "bg-amber-500" },
                { name: "TikTok Ads", amount: channelBreakdown["TikTok Ads"] || 12800, color: "bg-pink-500" },
                { name: "Print & Flyers", amount: channelBreakdown["Print & Banners"] || 8500, color: "bg-emerald-500" },
              ].map((c) => {
                const pct = totalSpent > 0 ? ((c.amount / totalSpent) * 100).toFixed(1) : "0";
                return (
                  <div key={c.name} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className="font-mono text-slate-400">
                        KES {c.amount.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${c.color} h-1.5 rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Billboards establish local Nairobi authority, while Meta & Google ads harvest daily direct signups.
              </span>
            </div>
          </div>

          {/* Today's Social Content Cadence (1 col) */}
          <div className="liquid-glass p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Social Cadence</h3>
                <p className="text-[10px] text-slate-400">Post daily on social media</p>
              </div>
              <Link
                href="/marketing/content"
                className="text-[11px] text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 font-semibold"
              >
                <span>Calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-white line-clamp-1">
                      {post.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        post.status === "Published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : post.status === "Scheduled"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {post.copy}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      {post.channels.map((ch) => (
                        <span key={ch} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {ch}
                        </span>
                      ))}
                    </div>
                    {post.status !== "Published" ? (
                      <button
                        onClick={() => handlePublishPost(post.id)}
                        className="px-2 py-0.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition text-[10px] font-semibold"
                      >
                        Publish Now
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-mono">
                        {post.engagement.views} views
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowQuickPostModal(true)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Draft Next Piece</span>
            </button>
          </div>
        </div>

        {/* Active Campaigns Table */}
        <div className="liquid-glass rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Active & Planned Campaigns</span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-channel acquisition performance across Versaly&apos;s product suite
              </p>
            </div>
            <Link
              href="/marketing/campaigns"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"
            >
              <span>Manage All Campaigns</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Budget / Spent</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">Won Sales</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-900/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{camp.name}</div>
                      {camp.locationDetails && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-rose-400" />
                          <span>{camp.locationDetails}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                        {camp.product}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {camp.channel}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          camp.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : camp.status === "Planned"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-semibold">
                        KES {camp.totalSpend.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Budget: KES {camp.allocatedBudget.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-indigo-400">
                        {camp.leadsGenerated} leads
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {camp.clicks > 0 ? `${camp.clicks} clicks` : `${camp.impressions} impr`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-emerald-400">
                        KES {camp.revenueGenerated.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {camp.dealsWon} won deals
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/marketing/campaigns#${camp.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links Footer to all Marketing Sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <Link
            href="/marketing/campaigns"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">
                  Campaigns
                </div>
                <div className="text-[10px] text-slate-400">Outdoor & Digital</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/spend"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Ad Spend Ledger
                </div>
                <div className="text-[10px] text-slate-400">Invoices & Outflows</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/content"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  Content & Social
                </div>
                <div className="text-[10px] text-slate-400">Daily Posting Plan</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>

          <Link
            href="/marketing/creatives"
            className="liquid-glass p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                  Creative & Assets
                </div>
                <div className="text-[10px] text-slate-400">Mockups & Reels</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>
        </div>
      </div>

      {/* QUICK SPEND MODAL */}
      {showQuickSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowQuickSpendModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Log Ad / Outdoor Spend</h3>
                <p className="text-xs text-slate-400">Add an ad expense or billboard site fee</p>
              </div>
            </div>

            <form onSubmit={handleSaveSpend} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Channel *
                  </label>
                  <select
                    value={spendChannel}
                    onChange={(e) => setSpendChannel(e.target.value as AdSpendEntry["channel"])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Billboard / Outdoor">Billboard / Outdoor</option>
                    <option value="Meta Ads">Meta Ads (FB/IG)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="Print & Banners">Print & Flyers</option>
                    <option value="Influencer / Sponsorship">Sponsorship / Expo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product *
                  </label>
                  <select
                    value={spendProduct}
                    onChange={(e) => setSpendProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Adversoft">Adversoft</option>
                    <option value="Vehisoft">Vehisoft</option>
                    <option value="Versandry">Versandry</option>
                    <option value="LipaTim">LipaTim</option>
                    <option value="Melio RMS">Melio RMS</option>
                    <option value="Versaly Core / Brand">Versaly Core / Brand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Magnate Ventures, Meta Ireland, Ramco"
                  value={spendVendor}
                  onChange={(e) => setSpendVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Notes / Context
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Site rental payment for month 1, includes high-res skin mounting"
                  value={spendNotes}
                  onChange={(e) => setSpendNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuickSpendModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/25"
                >
                  Save Ad Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK POST MODAL */}
      {showQuickPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowQuickPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Draft Daily Social Post</h3>
                <p className="text-xs text-slate-400">Schedule or draft high-value educational social copy</p>
              </div>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Headline / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why Nairobi Car Yards Lose 30% of Prospects After Hours"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Focus *
                  </label>
                  <select
                    value={postProduct}
                    onChange={(e) => setPostProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Vehisoft">Vehisoft (Car Yards)</option>
                    <option value="Adversoft">Adversoft (Billboards)</option>
                    <option value="Versandry">Versandry (Laundromats)</option>
                    <option value="LipaTim">LipaTim (eTIMS POS)</option>
                    <option value="Melio RMS">Melio RMS (Hospitality)</option>
                    <option value="Versaly Core / Brand">Versaly Core (Brand)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Channels
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(["LinkedIn", "X / Twitter", "TikTok", "Instagram", "Facebook"] as SocialPost["channels"]).map((ch) => {
                      const isSelected = postChannels.includes(ch);
                      return (
                        <button
                          type="button"
                          key={ch}
                          onClick={() => {
                            setPostChannels((prev) =>
                              isSelected ? prev.filter((c) => c !== ch) : [...prev, ch]
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                            isSelected
                              ? "bg-sky-500 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Copy / Script *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft the hook, the business pain point, and the solution..."
                  value={postCopy}
                  onChange={(e) => setPostCopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuickPostModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/25"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
