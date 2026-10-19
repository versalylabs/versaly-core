"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { INITIAL_CALENDAR_EVENTS, CalendarEvent } from "@/data/calendar-seed";

const STORAGE_KEY = "versaly_business_calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
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
    return INITIAL_CALENDAR_EVENTS;
  });

  const [activeTab, setActiveTab] = useState<"AGENDA" | "TODAY" | "WEEK">("AGENDA");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(true);

  // New Event Form State
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<CalendarEvent["type"]>("Demo");
  const [formDate, setFormDate] = useState("2026-10-20");
  const [formTime, setFormTime] = useState("10:00 AM");
  const [formDuration, setFormDuration] = useState("30 min");
  const [formEntityName, setFormEntityName] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formLocation, setFormLocation] = useState("On-site / Phone");
  const [formBriefing, setFormBriefing] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesType = selectedType === "ALL" || ev.type === selectedType;
      const matchesTab =
        activeTab === "AGENDA"
          ? true
          : activeTab === "TODAY"
          ? ev.date === "2026-10-19"
          : true;

      return matchesType && matchesTab;
    });
  }, [events, selectedType, activeTab]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formEntityName.trim()) return;

    const newEv: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      date: formDate,
      time: formTime,
      duration: formDuration,
      entityName: formEntityName.trim(),
      contactName: formContactName.trim() || undefined,
      location: formLocation.trim() || "Virtual / Phone",
      status: "SCHEDULED",
      priority: "HIGH",
      briefing: formBriefing.trim() || "Standard client engagement.",
    };

    setEvents((prev) => [newEv, ...prev]);
    setIsNewEventModalOpen(false);
    setFormTitle("");
    setFormEntityName("");
    setFormContactName("");
    setFormBriefing("");
  };

  const getTypeBadge = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "Demo":
        return <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-semibold">Live Demo</span>;
      case "Project":
        return <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-semibold">Milestone</span>;
      case "Payment":
        return <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">Payment Due</span>;
      case "Renewal":
        return <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded font-semibold">SaaS Renewal</span>;
      case "Internal":
        return <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.2 rounded font-semibold">Internal Review</span>;
      default:
        return <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">{type}</span>;
    }
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Business Calendar &amp; Schedule
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Demos, Milestones &amp; Renewals</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Executive Calendar
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Synchronized commercial and operational agenda: client walk-ins, software demonstrations, hardware handovers, contract renewals, and leadership reviews.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* AI Briefing Card: "Prepare Me for Today" */}
        {briefingOpen && (
          <div className="liquid-glass p-5 rounded-2xl border border-indigo-500/30 text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">
                  Executive Briefing: Today, Monday October 19
                </span>
              </div>
              <button
                onClick={() => setBriefingOpen(false)}
                className="text-slate-400 hover:text-white"
                title="Dismiss Briefing"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">10:30 AM (Done)</div>
                <div className="font-semibold text-slate-200 mt-0.5">Apex Auto Garage</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Walk-in parts leak demo delivered to James Mwangi. Next: send setup quote.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">12:00 PM (Done)</div>
                <div className="font-semibold text-slate-200 mt-0.5">Safari Auto Clinic</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Parts CSV normalized with Dan Omondi. Database import scheduled.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="text-[10px] text-indigo-400 uppercase font-bold">02:00 PM (Upcoming)</div>
                <div className="font-semibold text-white mt-0.5">Urban Plate Bistro</div>
                <p className="text-[11px] text-indigo-200 mt-1">
                  Live demo with Chef Dennis: test split M-Pesa bill on rugged tablet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <div className="text-[10px] text-amber-400 uppercase font-bold">04:30 PM (Hardware)</div>
                <div className="font-semibold text-amber-200 mt-0.5">Express Wash Laundry</div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Deliver Xprinter XP-420B thermal printer & test customer WhatsApp pickup alerts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Filters & Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab("AGENDA")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === "AGENDA"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All Agenda ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("TODAY")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === "TODAY"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              Today&apos;s Focus
            </button>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="Demo">Demos</option>
              <option value="Project">Project Milestones</option>
              <option value="Payment">Payments</option>
              <option value="Renewal">Renewals</option>
              <option value="Follow-up">Follow-ups</option>
              <option value="Internal">Internal Reviews</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">October 2026</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">Launch Push Q4</span>
          </div>
        </div>

        {/* Events Agenda List */}
        <div className="space-y-3">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`liquid-glass p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                ev.status === "COMPLETED"
                  ? "border-slate-800/60 opacity-80"
                  : "border-slate-800/90 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Date / Time Badge */}
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shrink-0 text-center font-mono">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {new Date(ev.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {new Date(ev.date).getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors">
                      {ev.title}
                    </span>
                    {getTypeBadge(ev.type)}
                    {ev.status === "COMPLETED" && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-slate-300">{ev.entityName}</span>
                    {ev.contactName && (
                      <>
                        <span>•</span>
                        <span>{ev.contactName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-indigo-400">
                      <Clock className="h-3 w-3" />
                      <span>{ev.time} ({ev.duration})</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>{ev.location}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">
                    &ldquo;{ev.briefing}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {ev.status !== "COMPLETED" && (
                  <button
                    onClick={() => {
                      setEvents((prev) =>
                        prev.map((e) => (e.id === ev.id ? { ...e, status: "COMPLETED" } : e))
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Mark Done</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="p-12 text-center liquid-glass rounded-2xl text-xs text-slate-500">
              No calendar events found for this filter.
            </div>
          )}
        </div>

        {/* Modal: Schedule Event */}
        {isNewEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Schedule Business Event</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. On-site Vehisoft Workshop Walkthrough"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Event Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as CalendarEvent["type"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Demo">Demo</option>
                      <option value="Project">Project Milestone</option>
                      <option value="Payment">Payment Due</option>
                      <option value="Renewal">SaaS Renewal</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Internal">Internal Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 30 min"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization / Client *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Garage"
                      value={formEntityName}
                      onChange={(e) => setFormEntityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. James Mwangi"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. On-site (Industrial Area) or Google Meet"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Briefing / Preparation Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key objections, talking points, hardware checklist..."
                    value={formBriefing}
                    onChange={(e) => setFormBriefing(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewEventModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save to Calendar</span>
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
