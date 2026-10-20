"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Share2,
  Plus,
  Search,
  Calendar,
  Send,
  Eye,
  MessageSquare,
  Flame,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  Copy,
  CheckCircle2,
  Circle,
  Check,
} from "lucide-react";
import {
  INITIAL_SOCIAL_POSTS,
  SocialPost,
  SocialChannel,
  ContentStatus,
  ContentCategory,
  MarketingProduct,
} from "@/data/marketing-seed";

const STORAGE_KEY = "versaly_marketing_posts_v2";

const CHANNELS: SocialChannel[] = [
  "LinkedIn",
  "X / Twitter",
  "TikTok",
  "Instagram",
  "Facebook",
  "YouTube Shorts",
];

const CATEGORIES: ContentCategory[] = [
  "Educational / Case Study",
  "Product Demo Reel",
  "Customer Pain Point",
  "Launch Announcement",
  "Behind The Scenes",
  "eTIMS Compliance Tip",
];

const PRODUCTS: MarketingProduct[] = [
  "Vehisoft",
  "Adversoft",
  "Versandry",
  "LipaTim",
  "Melio RMS",
  "Versaly Core / Brand",
];

const STREAK_STORAGE_KEY = "versaly_marketing_streak_days_v2";

interface WeekDayItem {
  dayShort: string;
  dayName: string;
  dateStr: string;
  dayNum: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isSunday: boolean;
}

function getCurrentWeekDays(): WeekDayItem[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const daysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return daysShort.map((dayShort, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split("T")[0];
    const isToday = d.toDateString() === now.toDateString();
    const isPast = d < now && !isToday;
    const isFuture = d > now && !isToday;
    return {
      dayShort,
      dayName: daysFull[idx],
      dateStr,
      dayNum: d.getDate(),
      isToday,
      isPast,
      isFuture,
      isSunday: idx === 6,
    };
  });
}

export default function MarketingContentPage() {
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
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

  // Week days & dynamic interactive streak tracker
  const [weekDays, setWeekDays] = useState<WeekDayItem[]>([]);
  const [tickedDates, setTickedDates] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STREAK_STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch {}
    }
    return {};
  });

  useEffect(() => {
    setWeekDays(getCurrentWeekDays());
  }, []);

  const toggleDayTicked = (dateStr: string) => {
    setTickedDates((prev) => {
      const isCurrentlyPosted = prev[dateStr] !== undefined
        ? prev[dateStr]
        : posts.some((p) => p.date === dateStr && p.status === "Published");
      const next = { ...prev, [dateStr]: !isCurrentlyPosted };
      try {
        localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isDayPosted = (d: WeekDayItem) => {
    if (tickedDates[d.dateStr] !== undefined) {
      return tickedDates[d.dateStr];
    }
    return posts.some((p) => p.date === d.dateStr && p.status === "Published");
  };

  const completedDaysCount = useMemo(() => {
    if (!weekDays.length) return 0;
    return weekDays.filter((d) => isDayPosted(d)).length;
  }, [weekDays, tickedDates, posts]);

  const todayItem = useMemo(() => {
    return weekDays.find((d) => d.isToday) || null;
  }, [weekDays]);

  const isTodayPosted = useMemo(() => {
    if (!todayItem) return false;
    return isDayPosted(todayItem);
  }, [todayItem, tickedDates, posts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTimeSlot, setFormTimeSlot] = useState("08:30 AM");
  const [formChannels, setFormChannels] = useState<SocialChannel[]>(["LinkedIn", "X / Twitter"]);
  const [formProduct, setFormProduct] = useState<MarketingProduct>("Vehisoft");
  const [formCategory, setFormCategory] = useState<ContentCategory>("Customer Pain Point");
  const [formCopy, setFormCopy] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formStatus, setFormStatus] = useState<ContentStatus>("Scheduled");
  const [formNotes, setFormNotes] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  // Performance Aggregates
  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "Published");
    const scheduled = posts.filter((p) => p.status === "Scheduled");
    const totalViews = published.reduce((acc, p) => acc + p.engagement.views, 0);
    const totalInquiries = published.reduce((acc, p) => acc + p.engagement.inquiries, 0);
    return {
      publishedCount: published.length,
      scheduledCount: scheduled.length,
      totalViews,
      totalInquiries,
    };
  }, [posts]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.copy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.contentType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel =
        selectedChannel === "ALL" || post.channels.includes(selectedChannel as SocialChannel);

      const matchesStatus = selectedStatus === "ALL" || post.status === selectedStatus;
      const matchesProduct = selectedProduct === "ALL" || post.product === selectedProduct;

      return matchesSearch && matchesChannel && matchesStatus && matchesProduct;
    });
  }, [posts, searchQuery, selectedChannel, selectedStatus, selectedProduct]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("ADD");
    setEditingId(null);
    setFormTitle("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormTimeSlot("09:00 AM");
    setFormChannels(["LinkedIn", "X / Twitter"]);
    setFormProduct("Vehisoft");
    setFormCategory("Customer Pain Point");
    setFormCopy("");
    setFormMediaUrl("");
    setFormStatus("Scheduled");
    setFormNotes("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (post: SocialPost) => {
    setModalMode("EDIT");
    setEditingId(post.id);
    setFormTitle(post.title);
    setFormDate(post.date);
    setFormTimeSlot(post.timeSlot);
    setFormChannels(post.channels);
    setFormProduct(post.product);
    setFormCategory(post.contentType);
    setFormCopy(post.copy);
    setFormMediaUrl(post.mediaAssetUrl || "");
    setFormStatus(post.status);
    setFormNotes(post.notes || "");
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCopy.trim()) return;

    const payload: SocialPost = {
      id: modalMode === "EDIT" && editingId ? editingId : `post-${Date.now()}`,
      title: formTitle.trim(),
      date: formDate || new Date().toISOString().split("T")[0],
      timeSlot: formTimeSlot,
      channels: formChannels.length > 0 ? formChannels : ["LinkedIn"],
      product: formProduct,
      contentType: formCategory,
      copy: formCopy.trim(),
      mediaAssetUrl: formMediaUrl.trim() || undefined,
      status: formStatus,
      engagement:
        modalMode === "EDIT" && editingId
          ? posts.find((p) => p.id === editingId)?.engagement || {
              views: 0,
              likes: 0,
              shares: 0,
              comments: 0,
              inquiries: 0,
            }
          : { views: 0, likes: 0, shares: 0, comments: 0, inquiries: 0 },
      notes: formNotes.trim() || undefined,
    };

    if (modalMode === "ADD") {
      setPosts((prev) => [payload, ...prev]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === editingId ? payload : p)));
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete post "${title}"?`)) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Handle Clear All
  const handleClearAll = () => {
    if (confirm("Clear all scheduled/draft posts to start afresh? This cannot be undone.")) {
      setPosts([]);
    }
  };

  // One-click Publish
  const handlePublishNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Published",
              engagement: {
                ...p.engagement,
                views: p.engagement.views === 0 ? 450 : p.engagement.views,
                likes: p.engagement.likes === 0 ? 24 : p.engagement.likes,
                shares: p.engagement.shares === 0 ? 6 : p.engagement.shares,
                inquiries: p.engagement.inquiries === 0 ? 2 : p.engagement.inquiries,
              },
            }
          : p
      )
    );
  };

  // Copy text to clipboard
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Daily Social Cadence
              </span>
              <span className="text-xs text-slate-500">Organic Distribution</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Share2 className="h-6 w-6 text-sky-400" />
              <span>Content & Social Media Calendar</span>
            </h1>
            <p className="text-xs text-slate-400">
              Publish daily educational insights across LinkedIn, X/Twitter, and TikTok to attract high-intent Nairobi business owners.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {posts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 transition"
                title="Clear all social posts to start afresh"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Start Afresh</span>
              </button>
            )}
            <Link
              href="/marketing/creatives"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              <span>Creative Assets</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Draft Daily Post</span>
            </button>
          </div>
        </div>

        {/* Daily Streak & Organic Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Daily Streak Banner */}
          <div className="md:col-span-2 liquid-glass p-4 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/20 to-slate-950/40 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Daily Publishing Streak:</span>
                    <span className="text-sky-400 font-mono">
                      {completedDaysCount} {completedDaysCount === 1 ? "Day" : "Days"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {todayItem ? (
                      <>
                        Today is <span className="font-semibold text-slate-200">{todayItem.dayName}</span> • Click any day to tick if posted
                      </>
                    ) : (
                      "Target: 1 high-value piece posted every morning"
                    )}
                  </p>
                </div>
              </div>

              <div>
                {isTodayPosted ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Posted Today</span>
                  </span>
                ) : todayItem?.isSunday ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Sunday Rest
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                    <Circle className="h-2.5 w-2.5" />
                    <span>Due Today</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 pt-2 border-t border-slate-800/80 text-center">
              {weekDays.map((d) => {
                const posted = isDayPosted(d);
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => toggleDayTicked(d.dateStr)}
                    title={`Click to toggle posted status for ${d.dayName} (${d.dateStr})`}
                    className={`p-1.5 rounded-lg border transition text-center cursor-pointer select-none group ${
                      d.isToday
                        ? "bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/40 shadow-sm shadow-sky-500/10"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-[10px] font-bold ${d.isToday ? "text-sky-300 font-extrabold" : "text-slate-400"}`}>
                        {d.dayShort}
                      </span>
                      <span className={`text-[9px] font-mono ${d.isToday ? "text-sky-400" : "text-slate-500"}`}>
                        {d.dayNum}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-center">
                      {posted ? (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>Done</span>
                        </div>
                      ) : d.isToday ? (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400 group-hover:text-sky-300">
                          <Circle className="h-2.5 w-2.5 shrink-0" />
                          <span>Today</span>
                        </div>
                      ) : d.isSunday ? (
                        <span className="text-[10px] font-semibold text-slate-500">Rest</span>
                      ) : d.isPast ? (
                        <span className="text-[10px] font-semibold text-rose-400/80">Missed</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-400/80">Sched</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Organic Views */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Organic Impressions</span>
              <Eye className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Across LinkedIn & Twitter</p>
            <div className="text-[10px] text-emerald-400 font-medium pt-1">
              +42% week-on-week
            </div>
          </div>

          {/* Direct Inbound Leads from Social */}
          <div className="liquid-glass p-4 rounded-xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Social DMs & Inquiries</span>
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {stats.totalInquiries}
            </div>
            <p className="text-[10px] text-slate-500">Converted into pipeline</p>
            <div className="text-[10px] text-indigo-400 font-medium pt-1">
              Zero ad cost inbound
            </div>
          </div>
        </div>

        {/* Filter and Channel Selector */}
        <div className="liquid-glass p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts, hooks, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Channel Filter */}
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Social Channels</option>
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>

            {/* Product Filter */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Products</option>
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Drafting">Drafting</option>
              <option value="Idea">Idea</option>
            </select>
          </div>
        </div>

        {/* Posts Feed Grid */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="liquid-glass p-12 text-center rounded-2xl border border-slate-800/80 space-y-3">
              <Share2 className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Content Pieces Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No posts match the current filter. Draft your daily piece to maintain your publishing streak.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition"
              >
                <Plus className="h-4 w-4" />
                <span>Draft Daily Post</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition p-5 space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {post.product}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {post.contentType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.status === "Published"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : post.status === "Scheduled"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {post.status}
                        </span>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Post"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Post"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {post.date} at {post.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Copy Box with Quick Copy */}
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 relative group/copy">
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                        {post.copy}
                      </p>
                      <button
                        onClick={() => handleCopyText(post.id, post.copy)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shadow-sm opacity-80 group-hover/copy:opacity-100 flex items-center gap-1 text-[10px]"
                        title="Copy text to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedId === post.id ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Target Channels */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {post.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-sky-400 border border-slate-700/60"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Engagement / Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {post.status === "Published" ? (
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-white">
                          <Eye className="h-3.5 w-3.5 text-sky-400" />
                          {post.engagement.views} views
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.engagement.inquiries} inquiries
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Ready for scheduled release
                      </span>
                    )}

                    {post.status !== "Published" && (
                      <button
                        onClick={() => handlePublishNow(post.id)}
                        className="px-3 py-1 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <Send className="h-3 w-3" />
                        <span>Publish Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="liquid-glass border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalMode === "ADD" ? "Draft Daily Social Post" : "Edit Social Piece"}
                </h3>
                <p className="text-xs text-slate-400">Craft educational copy and schedule channel broadcast</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Topic / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why Nairobi Car Yards Lose 30% of Prospects After Hours"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Product Focus *
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value as MarketingProduct)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Content Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ContentCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Publish Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={formTimeSlot}
                    onChange={(e) => setFormTimeSlot(e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ContentStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Idea">Idea</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Distribution Channels
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CHANNELS.map((ch) => {
                    const isSelected = formChannels.includes(ch);
                    return (
                      <button
                        type="button"
                        key={ch}
                        onClick={() => {
                          setFormChannels((prev) =>
                            isSelected ? prev.filter((c) => c !== ch) : [...prev, ch]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isSelected
                            ? "bg-sky-500 text-white shadow-sm"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Post Copy & Hook *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Draft the text, formatting, call to action, and WhatsApp link..."
                  value={formCopy}
                  onChange={(e) => setFormCopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Media / Reel Attachment Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /marketing/assets/vehisoft-reel.mp4"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white transition shadow-lg shadow-sky-600/25"
                >
                  {modalMode === "ADD" ? "Schedule Post" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
