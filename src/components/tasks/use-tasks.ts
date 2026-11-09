"use client";

import { useProductsCatalog } from "@/lib/products-store";
import { useState, useEffect, useCallback } from "react";
import { DailyTask, WEEKLY_RHYTHM_TEMPLATES, RoadmapWeek, FOUR_WEEK_LAUNCH_ROADMAP, DayRhythm, get5AMCycleKey, getRhythmTasksForDate, RoadmapDay } from "@/data/tasks-data";
import { appStorage } from "@/lib/app-storage";
import { STORAGE_KEY, ROADMAP_STORAGE_KEY, RHYTHM_STORAGE_KEY, CYCLE_KEY } from "./helpers";

export function useTasks() {

  const { products: catalogProducts } = useProductsCatalog();
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return WEEKLY_RHYTHM_TEMPLATES[1].tasks.map((t, idx) => ({
      ...t,
      id: `rhythm-1-${idx}`,
      completed: false,
    }));
  });

  // 1. Roadmap State (Weeks and Day Cards)
  const [roadmapWeeks, setRoadmapWeeks] = useState<RoadmapWeek[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(ROADMAP_STORAGE_KEY);
        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return FOUR_WEEK_LAUNCH_ROADMAP;
  });

  // Save Roadmap state to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmapWeeks));
    } catch {
      // ignore
    }
  }, [roadmapWeeks]);

  // 2. Weekly Operating Rhythm State
  const [weeklyRhythms, setWeeklyRhythms] = useState<Record<number, DayRhythm>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = appStorage.getItem(RHYTHM_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch {
        // ignore
      }
    }
    return WEEKLY_RHYTHM_TEMPLATES;
  });

  // Save Weekly Rhythm state to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(RHYTHM_STORAGE_KEY, JSON.stringify(weeklyRhythms));
    } catch {
      // ignore
    }
  }, [weeklyRhythms]);

  const [activeTab, setActiveTab] = useState<"DAILY" | "WEEKLY_RHYTHM" | "FOUR_WEEKS">("DAILY");
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [lastCycle, setLastCycle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<DailyTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [todayLabel, setTodayLabel] = useState<string>("");
  const [todayDayIdx, setTodayDayIdx] = useState<number>(1);

  // Modal: Add / Edit Roadmap Day Card
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [roadmapModalMode, setRoadmapModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [roadmapTargetWeek, setRoadmapTargetWeek] = useState<number>(1);
  const [originalDayDate, setOriginalDayDate] = useState<string>("");
  const [formRoadmapDayTitle, setFormRoadmapDayTitle] = useState("");
  const [formRoadmapDate, setFormRoadmapDate] = useState("");
  const [formRoadmapMorningFocus, setFormRoadmapMorningFocus] = useState("");
  const [formRoadmapAfternoonFocus, setFormRoadmapAfternoonFocus] = useState("");
  const [formRoadmapDeliverables, setFormRoadmapDeliverables] = useState<string[]>([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState("");

  // Modal: Delete Roadmap Day Card confirmation
  const [deleteConfirmRoadmapDay, setDeleteConfirmRoadmapDay] = useState<{
    weekNumber: number;
    date: string;
    dayTitle: string;
  } | null>(null);

  // Quick inline deliverable adding
  const [activeInlineAddDay, setActiveInlineAddDay] = useState<string | null>(null);
  const [inlineDeliverableText, setInlineDeliverableText] = useState("");

  // Modal: Edit Weekly Operating Rhythm
  const [isRhythmModalOpen, setIsRhythmModalOpen] = useState(false);
  const [editingRhythmDayIdx, setEditingRhythmDayIdx] = useState<number | null>(null);
  const [formRhythmDayName, setFormRhythmDayName] = useState("");
  const [formRhythmMorningSlot, setFormRhythmMorningSlot] = useState("");
  const [formRhythmLateMorningSlot, setFormRhythmLateMorningSlot] = useState("");
  const [formRhythmAfternoonSlot, setFormRhythmAfternoonSlot] = useState("");
  const [formRhythmTasks, setFormRhythmTasks] = useState<Omit<DailyTask, "id" | "completed">[]>([]);
  const [newRhythmTaskTitle, setNewRhythmTaskTitle] = useState("");
  const [newRhythmTaskCategory, setNewRhythmTaskCategory] = useState<DailyTask["category"]>("Outreach");
  const [newRhythmTaskProduct, setNewRhythmTaskProduct] = useState("Vehisoft");
  const [newRhythmTaskDue, setNewRhythmTaskDue] = useState("10:00 AM");
  const [newRhythmTaskPriority, setNewRhythmTaskPriority] = useState<DailyTask["priority"]>("HIGH");
  const [newRhythmTaskSlot, setNewRhythmTaskSlot] = useState<
    "Morning (8:00–10:00)" | "Late morning (10:00–13:00)" | "Afternoon (14:00–18:00)"
  >("Morning (8:00–10:00)");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<DailyTask["category"]>("Outreach");
  const [formProduct, setFormProduct] = useState("Vehisoft");
  const [formPriority, setFormPriority] = useState<DailyTask["priority"]>("HIGH");
  const [formDue, setFormDue] = useState("Today 3:00 PM");
  const [formContact, setFormContact] = useState("");

  // Save tasks to localStorage
  useEffect(() => {
    try {
      appStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent("versaly_tasks_updated"));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Execute 5:00 AM Reset & Reload
  const execute5AMReset = useCallback((forceManual: boolean = false) => {
    const currentCycle = get5AMCycleKey(new Date());
    const storedCycle = typeof window !== "undefined" ? appStorage.getItem(CYCLE_KEY) : null;

    if (forceManual || storedCycle !== currentCycle) {
      const todayRhythmTasks = getRhythmTasksForDate(new Date(), weeklyRhythms);

      // If user had custom non-rhythm tasks, keep them but uncheck them; merge with today's rhythm
      setTasks((prev) => {
        const customTasks = prev
          .filter((t) => !t.id.startsWith("rhythm-"))
          .map((t) => ({ ...t, completed: false }));
        return [...todayRhythmTasks, ...customTasks];
      });

      try {
        appStorage.setItem(CYCLE_KEY, currentCycle);
      } catch {
        // ignore
      }
      setLastCycle(currentCycle);

      const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
      setToastMessage(
        forceManual
          ? `✓ 5:00 AM Reset Triggered: Loaded & unchecked ${dayName}'s operating rhythm tasks!`
          : `✓ 5:00 AM Daily Cycle Activated: Today's ${dayName} tasks reloaded & unchecked!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } else if (storedCycle) {
      setLastCycle(storedCycle);
    }
  }, [weeklyRhythms]);

  // Run cycle check on mount and every 30 seconds (reactive 5 AM check)
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      setTodayLabel(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
      setTodayDayIdx(now.getDay());
      execute5AMReset(false);
    }, 0);

    const interval = setInterval(() => {
      const currentCycle = get5AMCycleKey(new Date());
      const storedCycle = appStorage.getItem(CYCLE_KEY);
      if (storedCycle !== currentCycle) {
        execute5AMReset(false);
      }
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [execute5AMReset]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          setToastMessage(next ? "✓ Task marked complete!" : "Task re-opened");
          setTimeout(() => setToastMessage(null), 2500);
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const openAddModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormCategory("Outreach");
    setFormProduct("Vehisoft");
    setFormPriority("HIGH");
    setFormDue("Today 3:00 PM");
    setFormContact("");
    setShowModal(true);
  };

  const openEditModal = (task: DailyTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormProduct(task.product);
    setFormPriority(task.priority);
    setFormDue(task.due);
    setFormContact(task.contactPerson || "");
    setShowModal(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      // Edit
      const updated: DailyTask = {
        ...editingTask,
        title: formTitle.trim(),
        category: formCategory,
        product: formProduct,
        priority: formPriority,
        due: formDue.trim(),
        contactPerson: formContact.trim() || undefined,
      };

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      setToastMessage(`✓ Updated action: "${updated.title}"`);
    } else {
      // Create
      const newTask: DailyTask = {
        id: `t-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        product: formProduct,
        priority: formPriority,
        due: formDue.trim(),
        contactPerson: formContact.trim() || undefined,
        completed: false,
      };

      setTasks((prev) => [newTask, ...prev]);
      setToastMessage(`✓ Scheduled action: "${newTask.title}"`);
    }

    setShowModal(false);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeleteConfirmTask(null);
    setToastMessage("✓ Action deleted from queue");
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load a day's deliverables from 4-week roadmap into active queue
  const loadRoadmapDayIntoQueue = (dayTitle: string, deliverables: string[]) => {
    const newTasks: DailyTask[] = deliverables.map((deliv, idx) => ({
      id: `roadmap-${Date.now()}-${idx}`,
      title: deliv,
      category: "Outreach",
      product: deliv.includes("Adversoft")
        ? "Adversoft"
        : deliv.includes("Vehisoft")
        ? "Vehisoft"
        : deliv.includes("Versandry")
        ? "Versandry"
        : deliv.includes("LipaTim")
        ? "LipaTim"
        : "Multi-product",
      due: "Today",
      priority: "HIGH",
      completed: false,
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    setActiveTab("DAILY");
    setToastMessage(`✓ Loaded ${deliverables.length} tasks from "${dayTitle}" into active queue!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Roadmap CRUD Handlers
  const openAddRoadmapDayModal = (weekNum: number) => {
    setRoadmapModalMode("ADD");
    setRoadmapTargetWeek(weekNum);
    setOriginalDayDate("");
    setFormRoadmapDate("2026-10-25");
    setFormRoadmapDayTitle("");
    setFormRoadmapMorningFocus("");
    setFormRoadmapAfternoonFocus("");
    setFormRoadmapDeliverables([]);
    setNewDeliverableInput("");
    setIsRoadmapModalOpen(true);
  };

  const openEditRoadmapDayModal = (weekNum: number, day: RoadmapDay) => {
    setRoadmapModalMode("EDIT");
    setRoadmapTargetWeek(weekNum);
    setOriginalDayDate(day.date);
    setFormRoadmapDate(day.date);
    setFormRoadmapDayTitle(day.dayTitle);
    setFormRoadmapMorningFocus(day.morningFocus);
    setFormRoadmapAfternoonFocus(day.afternoonFocus);
    setFormRoadmapDeliverables([...day.keyDeliverables]);
    setNewDeliverableInput("");
    setIsRoadmapModalOpen(true);
  };

  const handleSaveRoadmapDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoadmapDayTitle.trim() || !formRoadmapDate.trim()) return;

    const newDay: RoadmapDay = {
      date: formRoadmapDate.trim(),
      dayTitle: formRoadmapDayTitle.trim(),
      morningFocus: formRoadmapMorningFocus.trim(),
      afternoonFocus: formRoadmapAfternoonFocus.trim(),
      keyDeliverables: formRoadmapDeliverables.filter((d) => d.trim().length > 0),
    };

    setRoadmapWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNumber !== roadmapTargetWeek) return w;
        if (roadmapModalMode === "ADD") {
          return { ...w, days: [...w.days, newDay] };
        } else {
          return {
            ...w,
            days: w.days.map((d) => (d.date === originalDayDate ? newDay : d)),
          };
        }
      })
    );

    setIsRoadmapModalOpen(false);
    setToastMessage(
      roadmapModalMode === "ADD"
        ? `✓ Created roadmap card: "${newDay.dayTitle}"`
        : `✓ Updated roadmap card: "${newDay.dayTitle}"`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteRoadmapDay = (weekNum: number, date: string) => {
    setRoadmapWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNumber !== weekNum) return w;
        return {
          ...w,
          days: w.days.filter((d) => d.date !== date),
        };
      })
    );
    setDeleteConfirmRoadmapDay(null);
    setToastMessage("✓ Roadmap card deleted");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddDeliverableInline = (weekNum: number, date: string) => {
    if (!inlineDeliverableText.trim()) return;
    const text = inlineDeliverableText.trim();
    setRoadmapWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNumber !== weekNum) return w;
        return {
          ...w,
          days: w.days.map((d) =>
            d.date === date
              ? { ...d, keyDeliverables: [...d.keyDeliverables, text] }
              : d
          ),
        };
      })
    );
    setInlineDeliverableText("");
    setActiveInlineAddDay(null);
    setToastMessage("✓ Added execution target");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRemoveDeliverable = (weekNum: number, date: string, delivIdx: number) => {
    setRoadmapWeeks((prev) =>
      prev.map((w) => {
        if (w.weekNumber !== weekNum) return w;
        return {
          ...w,
          days: w.days.map((d) =>
            d.date === date
              ? { ...d, keyDeliverables: d.keyDeliverables.filter((_, i) => i !== delivIdx) }
              : d
          ),
        };
      })
    );
    setToastMessage("✓ Execution target removed");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetRoadmapDefaults = () => {
    setRoadmapWeeks(FOUR_WEEK_LAUNCH_ROADMAP);
    setToastMessage("✓ Roadmap reset to default launch plan");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Weekly Rhythm Handlers
  const openEditRhythmModal = (dayIdx: number) => {
    const rhythm = weeklyRhythms[dayIdx] || WEEKLY_RHYTHM_TEMPLATES[dayIdx];
    if (!rhythm) return;
    setEditingRhythmDayIdx(dayIdx);
    setFormRhythmDayName(rhythm.dayName);
    setFormRhythmMorningSlot(rhythm.morningSlot);
    setFormRhythmLateMorningSlot(rhythm.lateMorningSlot);
    setFormRhythmAfternoonSlot(rhythm.afternoonSlot);
    setFormRhythmTasks([...rhythm.tasks]);
    setNewRhythmTaskTitle("");
    setIsRhythmModalOpen(true);
  };

  const handleSaveRhythm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRhythmDayIdx === null) return;

    const updated: DayRhythm = {
      dayName: formRhythmDayName,
      dayIndex: editingRhythmDayIdx,
      morningSlot: formRhythmMorningSlot,
      lateMorningSlot: formRhythmLateMorningSlot,
      afternoonSlot: formRhythmAfternoonSlot,
      tasks: formRhythmTasks,
    };

    setWeeklyRhythms((prev) => ({
      ...prev,
      [editingRhythmDayIdx]: updated,
    }));

    setIsRhythmModalOpen(false);
    setToastMessage(`✓ Updated ${updated.dayName}'s operating rhythm!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetRhythmsDefaults = () => {
    setWeeklyRhythms(WEEKLY_RHYTHM_TEMPLATES);
    setToastMessage("✓ Weekly operating rhythm reset to default");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.contactPerson && t.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && !t.completed) ||
      (statusFilter === "COMPLETED" && t.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return {
    catalogProducts,
    tasks,
    setTasks,
    roadmapWeeks,
    setRoadmapWeeks,
    weeklyRhythms,
    setWeeklyRhythms,
    activeTab,
    setActiveTab,
    selectedWeekNumber,
    setSelectedWeekNumber,
    lastCycle,
    setLastCycle,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    showModal,
    setShowModal,
    editingTask,
    setEditingTask,
    deleteConfirmTask,
    setDeleteConfirmTask,
    toastMessage,
    setToastMessage,
    todayLabel,
    setTodayLabel,
    todayDayIdx,
    setTodayDayIdx,
    isRoadmapModalOpen,
    setIsRoadmapModalOpen,
    roadmapModalMode,
    setRoadmapModalMode,
    roadmapTargetWeek,
    setRoadmapTargetWeek,
    originalDayDate,
    setOriginalDayDate,
    formRoadmapDayTitle,
    setFormRoadmapDayTitle,
    formRoadmapDate,
    setFormRoadmapDate,
    formRoadmapMorningFocus,
    setFormRoadmapMorningFocus,
    formRoadmapAfternoonFocus,
    setFormRoadmapAfternoonFocus,
    formRoadmapDeliverables,
    setFormRoadmapDeliverables,
    newDeliverableInput,
    setNewDeliverableInput,
    deleteConfirmRoadmapDay,
    setDeleteConfirmRoadmapDay,
    activeInlineAddDay,
    setActiveInlineAddDay,
    inlineDeliverableText,
    setInlineDeliverableText,
    isRhythmModalOpen,
    setIsRhythmModalOpen,
    editingRhythmDayIdx,
    setEditingRhythmDayIdx,
    formRhythmDayName,
    setFormRhythmDayName,
    formRhythmMorningSlot,
    setFormRhythmMorningSlot,
    formRhythmLateMorningSlot,
    setFormRhythmLateMorningSlot,
    formRhythmAfternoonSlot,
    setFormRhythmAfternoonSlot,
    formRhythmTasks,
    setFormRhythmTasks,
    newRhythmTaskTitle,
    setNewRhythmTaskTitle,
    newRhythmTaskCategory,
    setNewRhythmTaskCategory,
    newRhythmTaskProduct,
    setNewRhythmTaskProduct,
    newRhythmTaskDue,
    setNewRhythmTaskDue,
    newRhythmTaskPriority,
    setNewRhythmTaskPriority,
    newRhythmTaskSlot,
    setNewRhythmTaskSlot,
    formTitle,
    setFormTitle,
    formCategory,
    setFormCategory,
    formProduct,
    setFormProduct,
    formPriority,
    setFormPriority,
    formDue,
    setFormDue,
    formContact,
    setFormContact,
    execute5AMReset,
    completedCount,
    pendingCount,
    toggleTask,
    openAddModal,
    openEditModal,
    handleSaveTask,
    handleDeleteTask,
    loadRoadmapDayIntoQueue,
    openAddRoadmapDayModal,
    openEditRoadmapDayModal,
    handleSaveRoadmapDay,
    handleDeleteRoadmapDay,
    handleAddDeliverableInline,
    handleRemoveDeliverable,
    handleResetRoadmapDefaults,
    openEditRhythmModal,
    handleSaveRhythm,
    handleResetRhythmsDefaults,
    filteredTasks,
  };
}

export type TasksModel = ReturnType<typeof useTasks>;
