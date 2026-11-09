"use client";

import { useProductsCatalog } from "@/lib/products-store";
import { useMemo, useState, useCallback, useEffect } from "react";
import { SocialPost, INITIAL_SOCIAL_POSTS, SocialChannel, MarketingProduct, ContentCategory, ContentStatus } from "@/data/marketing-seed";
import { appStorage } from "@/lib/app-storage";
import { todayIsoDate } from "@/lib/ids";
import { STORAGE_KEY, WeekDayItem, getCurrentWeekDays, STREAK_STORAGE_KEY } from "./helpers";

export function useMarketingContent() {
  const { products: catalogProducts } = useProductsCatalog();
  const productOptions = useMemo(
    () => Array.from(new Set([...catalogProducts.map((p) => p.name), "Versaly Core / Brand"])),
    [catalogProducts]
  );
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_KEY);
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
  const [weekDays] = useState<WeekDayItem[]>(() => getCurrentWeekDays());
  const [tickedDates, setTickedDates] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STREAK_STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch {}
    }
    return {};
  });

  const toggleDayTicked = (dateStr: string) => {
    setTickedDates((prev) => {
      const isCurrentlyPosted = prev[dateStr] !== undefined
        ? prev[dateStr]
        : posts.some((p) => p.date === dateStr && p.status === "Published");
      const next = { ...prev, [dateStr]: !isCurrentlyPosted };
      try {
        appStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isDayPosted = useCallback(
    (d: WeekDayItem) => {
      if (tickedDates[d.dateStr] !== undefined) {
        return tickedDates[d.dateStr];
      }
      return posts.some((p) => p.date === d.dateStr && p.status === "Published");
    },
    [tickedDates, posts]
  );

  const completedDaysCount = useMemo(() => {
    if (!weekDays.length) return 0;
    return weekDays.filter((d) => isDayPosted(d)).length;
  }, [weekDays, isDayPosted]);

  const todayItem = useMemo(() => {
    return weekDays.find((d) => d.isToday) || null;
  }, [weekDays]);

  const isTodayPosted = useMemo(() => {
    if (!todayItem) return false;
    return isDayPosted(todayItem);
  }, [todayItem, isDayPosted]);

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

  // Form Fields - Engagement Metrics (Manual Inputs)
  const [formViews, setFormViews] = useState<number>(0);
  const [formInquiries, setFormInquiries] = useState<number>(0);
  const [formLikes, setFormLikes] = useState<number>(0);
  const [formShares, setFormShares] = useState<number>(0);

  // Quick Metrics Log Modal
  const [metricsPost, setMetricsPost] = useState<SocialPost | null>(null);
  const [metricViews, setMetricViews] = useState<number>(0);
  const [metricInquiries, setMetricInquiries] = useState<number>(0);
  const [metricLikes, setMetricLikes] = useState<number>(0);
  const [metricShares, setMetricShares] = useState<number>(0);

  const openMetricsModal = (post: SocialPost) => {
    setMetricsPost(post);
    setMetricViews(post.engagement.views || 0);
    setMetricInquiries(post.engagement.inquiries || 0);
    setMetricLikes(post.engagement.likes || 0);
    setMetricShares(post.engagement.shares || 0);
  };

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricsPost) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === metricsPost.id
          ? {
              ...p,
              engagement: {
                ...p.engagement,
                views: Math.max(0, Number(metricViews) || 0),
                inquiries: Math.max(0, Number(metricInquiries) || 0),
                likes: Math.max(0, Number(metricLikes) || 0),
                shares: Math.max(0, Number(metricShares) || 0),
              },
            }
          : p
      )
    );
    setMetricsPost(null);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  // Performance Aggregates
  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "Published");
    const scheduled = posts.filter((p) => p.status === "Scheduled");
    const totalViews = published.reduce((acc, p) => acc + (p.engagement?.views || 0), 0);
    const totalInquiries = published.reduce((acc, p) => acc + (p.engagement?.inquiries || 0), 0);
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
    setFormDate(todayIsoDate());
    setFormTimeSlot("09:00 AM");
    setFormChannels(["LinkedIn", "X / Twitter"]);
    setFormProduct("Vehisoft");
    setFormCategory("Customer Pain Point");
    setFormCopy("");
    setFormMediaUrl("");
    setFormStatus("Scheduled");
    setFormNotes("");
    setFormViews(0);
    setFormInquiries(0);
    setFormLikes(0);
    setFormShares(0);
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
    setFormViews(post.engagement?.views || 0);
    setFormInquiries(post.engagement?.inquiries || 0);
    setFormLikes(post.engagement?.likes || 0);
    setFormShares(post.engagement?.shares || 0);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCopy.trim()) return;

    const payload: SocialPost = {
      id: modalMode === "EDIT" && editingId ? editingId : `post-${Date.now()}`,
      title: formTitle.trim(),
      date: formDate || todayIsoDate(),
      timeSlot: formTimeSlot,
      channels: formChannels.length > 0 ? formChannels : ["LinkedIn"],
      product: formProduct,
      contentType: formCategory,
      copy: formCopy.trim(),
      mediaAssetUrl: formMediaUrl.trim() || undefined,
      status: formStatus,
      engagement: {
        views: Math.max(0, Number(formViews) || 0),
        inquiries: Math.max(0, Number(formInquiries) || 0),
        likes: Math.max(0, Number(formLikes) || 0),
        shares: Math.max(0, Number(formShares) || 0),
        comments: modalMode === "EDIT" && editingId ? posts.find((p) => p.id === editingId)?.engagement?.comments || 0 : 0,
      },
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

  // One-click Publish (retains real manually logged engagement)
  const handlePublishNow = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Published",
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

  return {
    catalogProducts,
    productOptions,
    posts,
    setPosts,
    weekDays,
    tickedDates,
    setTickedDates,
    toggleDayTicked,
    isDayPosted,
    completedDaysCount,
    todayItem,
    isTodayPosted,
    searchQuery,
    setSearchQuery,
    selectedChannel,
    setSelectedChannel,
    selectedStatus,
    setSelectedStatus,
    selectedProduct,
    setSelectedProduct,
    copiedId,
    setCopiedId,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    setModalMode,
    editingId,
    setEditingId,
    formTitle,
    setFormTitle,
    formDate,
    setFormDate,
    formTimeSlot,
    setFormTimeSlot,
    formChannels,
    setFormChannels,
    formProduct,
    setFormProduct,
    formCategory,
    setFormCategory,
    formCopy,
    setFormCopy,
    formMediaUrl,
    setFormMediaUrl,
    formStatus,
    setFormStatus,
    formNotes,
    setFormNotes,
    formViews,
    setFormViews,
    formInquiries,
    setFormInquiries,
    formLikes,
    setFormLikes,
    formShares,
    setFormShares,
    metricsPost,
    setMetricsPost,
    metricViews,
    setMetricViews,
    metricInquiries,
    setMetricInquiries,
    metricLikes,
    setMetricLikes,
    metricShares,
    setMetricShares,
    openMetricsModal,
    handleSaveMetrics,
    stats,
    filteredPosts,
    openAddModal,
    openEditModal,
    handleSave,
    handleDelete,
    handleClearAll,
    handlePublishNow,
    handleCopyText,
  };
}

export type MarketingContentModel = ReturnType<typeof useMarketingContent>;
