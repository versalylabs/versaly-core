"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  DailyTask,
  DayRhythm,
  RoadmapDay,
  RoadmapWeek,
  WEEKLY_RHYTHM_TEMPLATES,
  FOUR_WEEK_LAUNCH_ROADMAP,
  get5AMCycleKey,
  getRhythmTasksForDate,
} from "@/data/tasks-data";
import { useProductsCatalog } from "@/lib/products-store";

const STORAGE_KEY = "versaly_daily_tasks";
const CYCLE_KEY = "versaly_last_5am_cycle";
const ROADMAP_STORAGE_KEY = "versaly_launch_roadmap_weeks";
const RHYTHM_STORAGE_KEY = "versaly_weekly_rhythms";

export default function TasksPage() {
  const { products: catalogProducts } = useProductsCatalog();
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
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
        const stored = localStorage.getItem(ROADMAP_STORAGE_KEY);
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
      localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmapWeeks));
    } catch {
      // ignore
    }
  }, [roadmapWeeks]);

  // 2. Weekly Operating Rhythm State
  const [weeklyRhythms, setWeeklyRhythms] = useState<Record<number, DayRhythm>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(RHYTHM_STORAGE_KEY);
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
      localStorage.setItem(RHYTHM_STORAGE_KEY, JSON.stringify(weeklyRhythms));
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
  const [todayLabel, setTodayLabel] = useState<string>("Oct 19, 2026");
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent("versaly_tasks_updated"));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Execute 5:00 AM Reset & Reload
  const execute5AMReset = useCallback((forceManual: boolean = false) => {
    const currentCycle = get5AMCycleKey(new Date());
    const storedCycle = typeof window !== "undefined" ? localStorage.getItem(CYCLE_KEY) : null;

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
        localStorage.setItem(CYCLE_KEY, currentCycle);
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
      const storedCycle = localStorage.getItem(CYCLE_KEY);
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

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Operating Rhythm
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">5:00 AM Automated Daily Reset Active</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Tasks &amp; Daily Outreach Queue
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              High-urgency commercial actions across cold calling sprints, remote diagnostic audits, live software demos, follow-ups, and onboarding check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => execute5AMReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 shadow-sm transition"
              title="Uncheck completed items and reload today's weekly rhythm tasks"
            >
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
              <span>5:00 AM Reset Now</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Action</span>
            </button>
          </div>
        </div>

        {/* 5:00 AM Reset Automation Info Card */}
        <div className="liquid-glass p-3.5 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span>Automated 5:00 AM Daily Reset Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Active (Cycle: {lastCycle || "Current"})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every morning at 5:00 AM, the queue unchecks all completed actions and automatically reloads the day&apos;s scheduled rhythm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">
              Today: {todayLabel}
            </span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Action View Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab("DAILY")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "DAILY"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Daily Active Queue ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("WEEKLY_RHYTHM")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "WEEKLY_RHYTHM"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Weekly Operating Rhythm (Mon–Sun)</span>
          </button>

          <button
            onClick={() => setActiveTab("FOUR_WEEKS")}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap border flex items-center gap-1.5 ${
              activeTab === "FOUR_WEEKS"
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>4-Week Launch Roadmap (Oct 19 – Nov 14)</span>
          </button>
        </div>

        {/* Tab 1: Daily Active Queue */}
        {activeTab === "DAILY" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Action Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Pending Today</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
                  {pendingCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Due before 6:00 PM</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Completed Today</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                  {completedCount}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Logged into activity audit</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Outreach Actions</div>
                <div className="text-2xl font-extrabold text-indigo-300 mt-1 font-mono">
                  {tasks.filter((t) => t.category === "Outreach").length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Phone calls &amp; WhatsApp</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Daily Completion Rate</div>
                <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                  {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Operating rhythm target: 85%</div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1 overflow-x-auto">
                {["ALL", "PENDING", "COMPLETED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      statusFilter === status
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {status === "ALL" ? "All Tasks" : status === "PENDING" ? "To Do" : "Completed"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search action or client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Demos">Demos</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Content">Content</option>
                  <option value="Review">Review</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2.5">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 liquid-glass rounded-2xl p-8 border border-slate-800">
                  No tasks matching the selected filter. Click &quot;5:00 AM Reset Now&quot; to reload today&apos;s rhythm.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const priorityBadge =
                    task.priority === "HIGH"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : task.priority === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20";

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 cursor-pointer group ${
                        task.completed
                          ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="mt-1 sm:mt-0 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-semibold ${
                                task.completed
                                  ? "line-through text-slate-500"
                                  : "text-slate-100 group-hover:text-indigo-300"
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${priorityBadge}`}
                            >
                              {task.priority}
                            </span>
                            {task.timeSlot && (
                              <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.2 rounded border border-slate-800 font-mono">
                                {task.timeSlot}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            <span className="font-medium text-indigo-400">{task.product}</span>
                            <span>•</span>
                            <span className="text-slate-500">{task.category}</span>
                            {task.due && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span>{task.due}</span>
                                </span>
                              </>
                            )}
                            {task.contactPerson && (
                              <>
                                <span>•</span>
                                <span className="text-slate-300 font-medium">
                                  Contact: {task.contactPerson}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(task, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Edit action"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmTask(task);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Delete action"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Weekly Operating Rhythm (Mon-Sun) */}
        {activeTab === "WEEKLY_RHYTHM" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="liquid-glass p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">
                    Versaly Weekly Operating Rhythm (from Week 2)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Structured commercial routine balancing morning high-volume cold outreach (calls, WhatsApp, email), late-morning follow-ups, and afternoon product demos, technical setups, and support. Auto-reloads each morning at 5:00 AM.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetRhythmsDefaults}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Default Rhythm</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                const rhythm = weeklyRhythms[dayIdx] || WEEKLY_RHYTHM_TEMPLATES[dayIdx];
                const isToday = todayDayIdx === dayIdx;

                return (
                  <div
                    key={dayIdx}
                    className={`liquid-glass p-5 rounded-2xl border flex flex-col justify-between transition ${
                      isToday
                        ? "border-amber-500/50 ring-1 ring-amber-500/30"
                        : "border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{rhythm.dayName}</h4>
                          {isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            {rhythm.tasks.length} tasks
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditRhythmModal(dayIdx)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition"
                            title={`Edit ${rhythm.dayName} rhythm & recurring tasks`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mt-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">
                            Morning (8:00–10:00)
                          </span>
                          <span className="text-slate-300">{rhythm.morningSlot}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                            Late Morning (10:00–13:00)
                          </span>
                          <span className="text-slate-300">{rhythm.lateMorningSlot}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                            Afternoon (14:00–18:00)
                          </span>
                          <span className="text-slate-300">{rhythm.afternoonSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Auto-loads at 5:00 AM</span>
                      <button
                        onClick={() => {
                          const newTasks: DailyTask[] = rhythm.tasks.map((t, idx) => ({
                            id: `rhythm-manual-${dayIdx}-${idx}-${Date.now()}`,
                            title: t.title,
                            category: t.category,
                            product: t.product,
                            due: `Today ${t.due}`,
                            priority: t.priority,
                            completed: false,
                            timeSlot: t.timeSlot,
                          }));
                          setTasks(newTasks);
                          setActiveTab("DAILY");
                          setToastMessage(`✓ Loaded ${rhythm.dayName}'s rhythm tasks into active queue!`);
                          setTimeout(() => setToastMessage(null), 3500);
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Load Day&apos;s Rhythm</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: 4-Week Launch Roadmap (Oct 19 – Nov 14) */}
        {activeTab === "FOUR_WEEKS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Week Selector Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roadmapWeeks.map((w) => (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekNumber(w.weekNumber)}
                  className={`p-4 rounded-xl text-left border transition ${
                    selectedWeekNumber === w.weekNumber
                      ? "liquid-glass border-indigo-500/50 ring-1 ring-indigo-500/40 shadow-lg"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Week {w.weekNumber}
                  </div>
                  <div className="font-bold text-xs text-white mt-0.5 truncate">{w.theme}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{w.dateRange}</div>
                </button>
              ))}
            </div>

            {/* Selected Week Detail Card */}
            {(() => {
              const currentWeek =
                roadmapWeeks.find((w) => w.weekNumber === selectedWeekNumber) ||
                roadmapWeeks[0];

              return (
                <div className="liquid-glass p-6 rounded-2xl border border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Launch Roadmap • Week {currentWeek.weekNumber}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 font-mono">{currentWeek.dateRange}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{currentWeek.theme}</h3>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Week {currentWeek.weekNumber} Targets
                        </span>
                        <span className="text-emerald-400 font-semibold">{currentWeek.targetsSummary}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openAddRoadmapDayModal(currentWeek.weekNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Day Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetRoadmapDefaults}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-xs flex items-center gap-1"
                        title="Reset Roadmap to Default Plan"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Days in Selected Week */}
                  <div className="space-y-4">
                    {currentWeek.days.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                        No day cards in this week. Click &quot;Add Day Card&quot; above to create one.
                      </div>
                    ) : (
                      currentWeek.days.map((day) => (
                        <div
                          key={day.date}
                          className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3 hover:border-slate-700 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/60">
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                              <span>{day.dayTitle}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => loadRoadmapDayIntoQueue(day.dayTitle, day.keyDeliverables)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition shrink-0"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Load Into Daily Queue</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditRoadmapDayModal(currentWeek.weekNumber, day)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                                title="Edit Day Card"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmRoadmapDay({
                                    weekNumber: currentWeek.weekNumber,
                                    date: day.date,
                                    dayTitle: day.dayTitle,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition"
                                title="Delete Day Card"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                Morning Focus
                              </span>
                              <p className="text-slate-300 leading-relaxed">
                                {day.morningFocus || "No morning focus specified"}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                                Afternoon Focus
                              </span>
                              <p className="text-slate-300 leading-relaxed">
                                {day.afternoonFocus || "No afternoon focus specified"}
                              </p>
                            </div>
                          </div>

                          {/* Deliverables checklist */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Key Deliverables &amp; Execution Targets ({day.keyDeliverables.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveInlineAddDay(activeInlineAddDay === day.date ? null : day.date);
                                  setInlineDeliverableText("");
                                }}
                                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Target</span>
                              </button>
                            </div>

                            {activeInlineAddDay === day.date && (
                              <div className="mb-2 p-2 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={inlineDeliverableText}
                                  onChange={(e) => setInlineDeliverableText(e.target.value)}
                                  placeholder="Enter new execution target..."
                                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddDeliverableInline(currentWeek.weekNumber, day.date);
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddDeliverableInline(currentWeek.weekNumber, day.date)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveInlineAddDay(null)}
                                  className="p-1 text-slate-400 hover:text-slate-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {day.keyDeliverables.map((item, dIdx) => (
                                <div
                                  key={`${item}-${dIdx}`}
                                  className="flex items-center justify-between gap-2 text-slate-300 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 group/item hover:border-slate-700 transition"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                    <span className="truncate">{item}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDeliverable(currentWeek.weekNumber, day.date, dIdx)}
                                    className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                                    title="Remove target"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Modal: New / Edit Action */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {editingTask ? "Edit Outreach Action" : "Schedule New Action"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Add to active queue with priority and due time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Adversoft calls to billboard operators"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as DailyTask["category"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Outreach">Outreach</option>
                      <option value="Demos">Demos</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Content">Content</option>
                      <option value="Review">Review</option>
                      <option value="Finance">Finance</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {catalogProducts.map((p) => (
                        <option key={p.slug} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Multi-product">Multi-product</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as DailyTask["priority"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HIGH">High (Urgent)</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Due Timing</label>
                    <input
                      type="text"
                      placeholder="e.g. Today 11:30 AM"
                      value={formDue}
                      onChange={(e) => setFormDue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. James Mwangi (Apex Auto)"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{editingTask ? "Save Changes" : "Schedule Action"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deleteConfirmTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-sm w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Action?</h3>
                  <p className="text-xs text-slate-400">
                    Remove &quot;{deleteConfirmTask.title}&quot; from the daily queue?
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTask(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25 text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add / Edit Roadmap Day Card */}
        {isRoadmapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {roadmapModalMode === "ADD" ? "Add New Roadmap Day Card" : "Edit Roadmap Day Card"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Week {roadmapTargetWeek} Launch Push Roadmap
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRoadmapModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRoadmapDay} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Day Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Monday 19 Oct — Set up the machine"
                      value={formRoadmapDayTitle}
                      onChange={(e) => setFormRoadmapDayTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date (YYYY-MM-DD) *</label>
                    <input
                      type="date"
                      required
                      value={formRoadmapDate}
                      onChange={(e) => setFormRoadmapDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider text-[10px] mr-1">Morning Focus</span>
                    (8:00–12:00)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key priorities and high-volume outreach actions for the morning..."
                    value={formRoadmapMorningFocus}
                    onChange={(e) => setFormRoadmapMorningFocus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mr-1">Afternoon Focus</span>
                    (13:00–18:00)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Afternoon product demos, technical setups, client onboarding, support..."
                    value={formRoadmapAfternoonFocus}
                    onChange={(e) => setFormRoadmapAfternoonFocus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Key Deliverables &amp; Execution Targets ({formRoadmapDeliverables.length})
                  </label>

                  {/* List of deliverables with delete */}
                  <div className="space-y-1.5 max-h-40 overflow-y-auto mb-2 pr-1">
                    {formRoadmapDeliverables.length === 0 ? (
                      <div className="p-3 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                        No deliverables added yet. Add one below.
                      </div>
                    ) : (
                      formRoadmapDeliverables.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormRoadmapDeliverables((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                            title="Remove deliverable"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add deliverable input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 20 billboard operator calls completed"
                      value={newDeliverableInput}
                      onChange={(e) => setNewDeliverableInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newDeliverableInput.trim()) {
                            setFormRoadmapDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                            setNewDeliverableInput("");
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newDeliverableInput.trim()) {
                          setFormRoadmapDeliverables((prev) => [...prev, newDeliverableInput.trim()]);
                          setNewDeliverableInput("");
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Target</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRoadmapModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{roadmapModalMode === "ADD" ? "Create Day Card" : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Roadmap Day Card Confirmation */}
        {deleteConfirmRoadmapDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-sm w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Roadmap Day Card?</h3>
                  <p className="text-xs text-slate-400">
                    Remove &quot;{deleteConfirmRoadmapDay.dayTitle}&quot; from Week {deleteConfirmRoadmapDay.weekNumber}?
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmRoadmapDay(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRoadmapDay(deleteConfirmRoadmapDay.weekNumber, deleteConfirmRoadmapDay.date)}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md shadow-rose-600/25 text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Card</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Weekly Operating Rhythm */}
        {isRhythmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Edit {formRhythmDayName} Operating Rhythm
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Customize timeslots and 5:00 AM recurring tasks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRhythmModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRhythm} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Morning Slot (8:00–10:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmMorningSlot}
                    onChange={(e) => setFormRhythmMorningSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Late Morning Slot (10:00–13:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmLateMorningSlot}
                    onChange={(e) => setFormRhythmLateMorningSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Afternoon Slot (14:00–18:00) Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={formRhythmAfternoonSlot}
                    onChange={(e) => setFormRhythmAfternoonSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    5:00 AM Auto-Reload Tasks ({formRhythmTasks.length})
                  </label>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2 pr-1">
                    {formRhythmTasks.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormRhythmTasks((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                          title="Remove task"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Add New 5 AM Task
                    </span>
                    <input
                      type="text"
                      placeholder="Task description..."
                      value={newRhythmTaskTitle}
                      onChange={(e) => setNewRhythmTaskTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newRhythmTaskSlot}
                        onChange={(e) =>
                          setNewRhythmTaskSlot(
                            e.target.value as "Morning (8:00–10:00)" | "Late morning (10:00–13:00)" | "Afternoon (14:00–18:00)"
                          )
                        }
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        <option value="Morning (8:00–10:00)">Morning (8:00–10:00)</option>
                        <option value="Late morning (10:00–13:00)">Late morning (10:00–13:00)</option>
                        <option value="Afternoon (14:00–18:00)">Afternoon (14:00–18:00)</option>
                      </select>
                      <select
                        value={newRhythmTaskProduct}
                        onChange={(e) => setNewRhythmTaskProduct(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        {catalogProducts.map((p) => (
                          <option key={p.slug} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                        <option value="Multi-product">Multi-product</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={newRhythmTaskCategory}
                        onChange={(e) => setNewRhythmTaskCategory(e.target.value as DailyTask["category"])}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      >
                        <option value="Outreach">Outreach</option>
                        <option value="Demos">Demos</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Content">Content</option>
                        <option value="Review">Review</option>
                        <option value="Finance">Finance</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <select
                        value={newRhythmTaskPriority}
                        onChange={(e) => setNewRhythmTaskPriority(e.target.value as DailyTask["priority"])}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Due (e.g. 10:00 AM)"
                        value={newRhythmTaskDue}
                        onChange={(e) => setNewRhythmTaskDue(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRhythmTaskTitle.trim()) return;
                        setFormRhythmTasks((prev) => [
                          ...prev,
                          {
                            title: newRhythmTaskTitle.trim(),
                            category: newRhythmTaskCategory,
                            product: newRhythmTaskProduct,
                            due: newRhythmTaskDue,
                            priority: newRhythmTaskPriority,
                            timeSlot: newRhythmTaskSlot,
                          },
                        ]);
                        setNewRhythmTaskTitle("");
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Rhythm</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRhythmModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Save Rhythm</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
