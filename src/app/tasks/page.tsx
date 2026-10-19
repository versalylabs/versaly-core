"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface DailyTask {
  id: string;
  category: "Outreach" | "Demos" | "Follow-up" | "Onboarding" | "Finance";
  title: string;
  product: string;
  due: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
  contactPerson?: string;
  phone?: string;
}

const STORAGE_KEY = "versaly_daily_tasks";

const INITIAL_TASKS: DailyTask[] = [
  {
    id: "t-1",
    category: "Outreach",
    title: "Walk-in garage visit: Apex Auto Clinic (Industrial Area)",
    product: "Vehisoft",
    due: "Today 10:30 AM",
    priority: "HIGH",
    completed: false,
    contactPerson: "Samuel Kamau",
    phone: "+254 721 345 678",
  },
  {
    id: "t-2",
    category: "Demos",
    title: "Live Melio RMS POS table-ordering walkthrough: Chef Dennis",
    product: "Melio RMS",
    due: "Today 2:00 PM",
    priority: "HIGH",
    completed: false,
    contactPerson: "Dennis Odhiambo",
    phone: "+254 711 902 345",
  },
  {
    id: "t-3",
    category: "Follow-up",
    title: "Send WhatsApp pickup alert demo video to Prime Clean Laundromat",
    product: "Versandry",
    due: "Today 4:00 PM",
    priority: "MEDIUM",
    completed: false,
    contactPerson: "Mama Jane",
    phone: "+254 733 890 123",
  },
  {
    id: "t-4",
    category: "Onboarding",
    title: "Follow up with Safari Auto Clinic for spare parts inventory spreadsheet",
    product: "Vehisoft",
    due: "Today 5:00 PM",
    priority: "HIGH",
    completed: false,
    contactPerson: "Dan Omondi",
    phone: "+254 722 100 200",
  },
  {
    id: "t-5",
    category: "Finance",
    title: "Reconcile M-Pesa setup fee payment for Skyline Outdoor Media",
    product: "Adversoft",
    due: "Today 5:30 PM",
    priority: "MEDIUM",
    completed: true,
    contactPerson: "Kevin Ndungu",
    phone: "+254 722 999 111",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_TASKS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<DailyTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<DailyTask["category"]>("Outreach");
  const [formProduct, setFormProduct] = useState("Vehisoft");
  const [formPriority, setFormPriority] = useState<DailyTask["priority"]>("HIGH");
  const [formDue, setFormDue] = useState("Today 3:00 PM");
  const [formContact, setFormContact] = useState("");

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

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
              <span className="text-xs text-amber-400">Daily Execution Queue</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Tasks & Daily Outreach Queue
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              High-urgency commercial actions across walk-ins, live software demos, follow-ups, and onboarding check-ins.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Action</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

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
            <div className="text-[11px] text-slate-500 mt-1">Walk-ins & phone calls</div>
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
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          task.completed ? "line-through text-slate-500" : "text-slate-100"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {task.product}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                      <span className="font-medium text-slate-300">{task.category}</span>
                      <span>•</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.due}
                      </span>
                      {task.contactPerson && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{task.contactPerson}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${priorityBadge}`}
                  >
                    {task.priority}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => openEditModal(task, e)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                    title="Edit Task"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmTask(task);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition opacity-90 sm:opacity-0 group-hover:opacity-100"
                    title="Delete Task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="font-bold text-slate-400">All clear! No tasks match this view.</div>
              <p>Enjoy the clean queue or click &ldquo;New Action&rdquo; to schedule outreach.</p>
            </div>
          )}
        </div>

        {/* Modal: Create or Edit Task */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-indigo-400" />
                  <span>{editingTask ? "Edit Action" : "Schedule Daily Action"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Action Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call Chef Dennis for POS feedback"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as DailyTask["category"])}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Outreach">Outreach (Cold/Walk-in)</option>
                      <option value="Demos">Demos (Live POS / POS)</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Finance">Finance (Invoicing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Product</label>
                    <select
                      value={formProduct}
                      onChange={(e) => setFormProduct(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Adversoft">Adversoft</option>
                      <option value="Vehisoft">Vehisoft</option>
                      <option value="Versandry">Versandry</option>
                      <option value="LipaTim">LipaTim</option>
                      <option value="Melio RMS">Melio RMS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as DailyTask["priority"])}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HIGH">High (Urgent)</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Due Timing</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Today 2:30 PM"
                      value={formDue}
                      onChange={(e) => setFormDue(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Person (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Dennis (+254 711 902 345)"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingTask ? "Save Changes" : "Add to Daily Queue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-500/30 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Daily Action?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will remove <strong className="text-white">{deleteConfirmTask.title}</strong> from your daily operational queue.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(deleteConfirmTask.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/25"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
