"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { INITIAL_CALENDAR_EVENTS, CalendarEvent } from "@/data/calendar-seed";

const STORAGE_KEY = "versaly_business_calendar_v2";

interface CalendarDay {
  dayNumber: number;
  dateStr: string;
  isCurrentMonth: boolean;
  label?: string;
}

// Generate the 35 calendar cells for October 2026 (starts on Thursday Oct 1, precedes Sun Sep 27)
const OCTOBER_2026_DAYS: CalendarDay[] = [
  // Week 1 (Sep 27 - Oct 3)
  { dayNumber: 27, dateStr: "2026-09-27", isCurrentMonth: false },
  { dayNumber: 28, dateStr: "2026-09-28", isCurrentMonth: false },
  { dayNumber: 29, dateStr: "2026-09-29", isCurrentMonth: false },
  { dayNumber: 30, dateStr: "2026-09-30", isCurrentMonth: false },
  { dayNumber: 1, dateStr: "2026-10-01", isCurrentMonth: true, label: "Oct 1" },
  { dayNumber: 2, dateStr: "2026-10-02", isCurrentMonth: true },
  { dayNumber: 3, dateStr: "2026-10-03", isCurrentMonth: true },
  // Week 2 (Oct 4 - Oct 10)
  { dayNumber: 4, dateStr: "2026-10-04", isCurrentMonth: true },
  { dayNumber: 5, dateStr: "2026-10-05", isCurrentMonth: true },
  { dayNumber: 6, dateStr: "2026-10-06", isCurrentMonth: true },
  { dayNumber: 7, dateStr: "2026-10-07", isCurrentMonth: true },
  { dayNumber: 8, dateStr: "2026-10-08", isCurrentMonth: true },
  { dayNumber: 9, dateStr: "2026-10-09", isCurrentMonth: true },
  { dayNumber: 10, dateStr: "2026-10-10", isCurrentMonth: true },
  // Week 3 (Oct 11 - Oct 17)
  { dayNumber: 11, dateStr: "2026-10-11", isCurrentMonth: true },
  { dayNumber: 12, dateStr: "2026-10-12", isCurrentMonth: true },
  { dayNumber: 13, dateStr: "2026-10-13", isCurrentMonth: true },
  { dayNumber: 14, dateStr: "2026-10-14", isCurrentMonth: true },
  { dayNumber: 15, dateStr: "2026-10-15", isCurrentMonth: true },
  { dayNumber: 16, dateStr: "2026-10-16", isCurrentMonth: true },
  { dayNumber: 17, dateStr: "2026-10-17", isCurrentMonth: true },
  // Week 4 (Oct 18 - Oct 24)
  { dayNumber: 18, dateStr: "2026-10-18", isCurrentMonth: true },
  { dayNumber: 19, dateStr: "2026-10-19", isCurrentMonth: true }, // Today
  { dayNumber: 20, dateStr: "2026-10-20", isCurrentMonth: true },
  { dayNumber: 21, dateStr: "2026-10-21", isCurrentMonth: true },
  { dayNumber: 22, dateStr: "2026-10-22", isCurrentMonth: true },
  { dayNumber: 23, dateStr: "2026-10-23", isCurrentMonth: true },
  { dayNumber: 24, dateStr: "2026-10-24", isCurrentMonth: true },
  // Week 5 (Oct 25 - Oct 31)
  { dayNumber: 25, dateStr: "2026-10-25", isCurrentMonth: true },
  { dayNumber: 26, dateStr: "2026-10-26", isCurrentMonth: true },
  { dayNumber: 27, dateStr: "2026-10-27", isCurrentMonth: true },
  { dayNumber: 28, dateStr: "2026-10-28", isCurrentMonth: true },
  { dayNumber: 29, dateStr: "2026-10-29", isCurrentMonth: true },
  { dayNumber: 30, dateStr: "2026-10-30", isCurrentMonth: true },
  { dayNumber: 31, dateStr: "2026-10-31", isCurrentMonth: true },
];

const WEEK_DAYS = [
  { name: "Sunday", isToday: false },
  { name: "Monday", isToday: true }, // Monday Oct 19 is active
  { name: "Tuesday", isToday: false },
  { name: "Wednesday", isToday: false },
  { name: "Thursday", isToday: false },
  { name: "Friday", isToday: false },
  { name: "Saturday", isToday: false },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
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
    return INITIAL_CALENDAR_EVENTS;
  });

  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-19");
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [showLinkCard, setShowLinkCard] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<CalendarEvent["type"]>("Demo");
  const [formDate, setFormDate] = useState("2026-10-19");
  const [formTime, setFormTime] = useState("10:00 AM");
  const [formDuration, setFormDuration] = useState("30 min");
  const [formEntityName, setFormEntityName] = useState("");
  const [formContactName, setFormContactName] = useState("");
  const [formLocation, setFormLocation] = useState("Google Meet / On-site");
  const [formBriefing, setFormBriefing] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  // Filter events based on top pill buttons
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedFilter === "All") return true;
      if (selectedFilter === "Interview" || selectedFilter === "Demo") {
        return ev.type === "Demo" || ev.type === "Meeting";
      }
      if (selectedFilter === "Task" || selectedFilter === "Milestone") {
        return ev.type === "Project" || ev.type === "Follow-up";
      }
      if (selectedFilter === "Time Off" || selectedFilter === "Payment") {
        return ev.type === "Payment" || ev.type === "Renewal" || ev.type === "Internal";
      }
      return true;
    });
  }, [events, selectedFilter]);

  // Events for the selected date or fallback upcoming events
  const selectedDayEvents = useMemo(() => {
    const onDate = filteredEvents.filter((ev) => ev.date === selectedDate);
    if (onDate.length > 0) return onDate;
    // Fallback: return upcoming events starting from today
    return filteredEvents.filter((ev) => ev.date >= "2026-10-19").slice(0, 4);
  }, [filteredEvents, selectedDate]);

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
    setSelectedDate(formDate);
    setToastMessage(`✓ Scheduled event "${formTitle}" on ${formDate}`);
    setTimeout(() => setToastMessage(null), 3500);

    setFormTitle("");
    setFormEntityName("");
    setFormContactName("");
    setFormBriefing("");
  };

  const handleToggleComplete = (eventId: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, status: ev.status === "COMPLETED" ? "SCHEDULED" : "COMPLETED" }
          : ev
      )
    );
  };

  // Helper to extract initials
  const getInitials = (name?: string) => {
    if (!name) return "EV";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner */}
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

        {/* Toast message */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

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
                  Deliver Xprinter XP-420B thermal printer &amp; test customer WhatsApp pickup alerts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Calendar Section (Screenshot 2 Layout) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left: 7-Column Month View Grid */}
          <div className="xl:col-span-8 liquid-glass p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              {/* Calendar Top Controls Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                {/* Month title & Chevrons */}
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
                    October 2026
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDate("2026-10-12")}
                      className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate("2026-10-26")}
                      className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Pills, Month View Selector & Today */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                    {["All", "Interview", "Task", "Time Off"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFilter(f)}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          selectedFilter === f
                            ? "bg-slate-800 text-white shadow-sm font-semibold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-medium">
                    Month ▾
                  </div>

                  <button
                    onClick={() => setSelectedDate("2026-10-19")}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Day Headers (Sun - Sat) */}
              <div className="grid grid-cols-7 border-b border-slate-800/80 text-center text-xs py-3 font-medium">
                {WEEK_DAYS.map((wd) => (
                  <div
                    key={wd.name}
                    className={`relative py-1 ${
                      wd.isToday ? "text-amber-400 font-bold" : "text-slate-400"
                    }`}
                  >
                    <span>{wd.name}</span>
                    {wd.isToday && (
                      <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-400 rounded-full" />
                    )}
                  </div>
                ))}
              </div>

              {/* 35-Day Grid */}
              <div className="grid grid-cols-7 border-b border-slate-800/60 divide-x divide-y divide-slate-800/50">
                {OCTOBER_2026_DAYS.map((day, idx) => {
                  const dayEvents = filteredEvents.filter((ev) => ev.date === day.dateStr);
                  const isSelected = selectedDate === day.dateStr;
                  const isToday = day.dateStr === "2026-10-19";

                  return (
                    <div
                      key={`${day.dateStr}-${idx}`}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`min-h-[85px] sm:min-h-[96px] p-1.5 sm:p-2 cursor-pointer transition relative flex flex-col justify-between group ${
                        !day.isCurrentMonth
                          ? "bg-slate-950/40 text-slate-600 border-slate-800/40 opacity-40 hover:opacity-70"
                          : isSelected
                          ? "bg-indigo-950/20 ring-1 ring-indigo-500/40"
                          : "hover:bg-slate-900/40"
                      }`}
                      style={
                        !day.isCurrentMonth
                          ? {
                              backgroundImage:
                                "repeating-linear-gradient(45deg, rgba(255,255,255,0.015), rgba(255,255,255,0.015) 10px, transparent 10px, transparent 20px)",
                            }
                          : undefined
                      }
                    >
                      {/* Day Number */}
                      <div className="flex items-center justify-between text-xs">
                        {isToday ? (
                          <span className="h-6 w-6 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                            19
                          </span>
                        ) : day.label ? (
                          <span className="font-semibold text-slate-300">{day.label}</span>
                        ) : (
                          <span className={day.isCurrentMonth ? "text-slate-400 group-hover:text-slate-200" : "text-slate-600"}>
                            {day.dayNumber}
                          </span>
                        )}
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 mt-1">
                        {dayEvents.map((ev) => {
                          const isSpecialDemo = ev.id === "cal-0" || ev.title.toLowerCase().includes("discovery demo");

                          return (
                            <div
                              key={ev.id}
                              title={`${ev.time} - ${ev.title} (${ev.entityName})`}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate transition ${
                                isSpecialDemo
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : ev.type === "Demo"
                                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                  : ev.type === "Project"
                                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                  : ev.type === "Payment" || ev.type === "Renewal"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Today: Monday Oct 19, 2026</span>
                <span>•</span>
                <span className="text-slate-400">Day 19 of 28 Launch Push</span>
              </div>
              <div className="font-mono text-slate-400">
                Selected: {selectedDate} ({filteredEvents.filter((e) => e.date === selectedDate).length} events)
              </div>
            </div>
          </div>

          {/* Right: Sidebar Panel (Link Your Calendar & Upcoming Event) */}
          <div className="xl:col-span-4 space-y-5">
            {/* Top Card: Link Your Calendar (matching Screenshot 2) */}
            {showLinkCard && (
              <div className="liquid-glass p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3 relative animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => setShowLinkCard(false)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>

                <div>
                  <h3 className="font-bold text-sm text-white">Link Your Calendar</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Sync interviews, tasks, and schedules by connecting your calendar.
                  </p>
                </div>

                {/* Calendar Provider Badges */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {/* Google Calendar (31) */}
                    <div
                      title="Google Calendar"
                      className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-600/30 cursor-pointer hover:scale-105 transition-transform"
                    >
                      31
                    </div>

                    {/* Outlook (O) */}
                    <div
                      title="Microsoft Outlook"
                      className="h-8 w-8 rounded-lg bg-[#0078D4] flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/30 cursor-pointer hover:scale-105 transition-transform"
                    >
                      O
                    </div>

                    {/* Cal.com (CAL) */}
                    <div
                      title="Cal.com"
                      className="h-8 w-8 rounded-lg bg-rose-600 flex items-center justify-center font-extrabold text-white text-[10px] shadow-md shadow-rose-600/30 cursor-pointer hover:scale-105 transition-transform"
                    >
                      CAL
                    </div>

                    {/* Add Other (+) */}
                    <div
                      title="Add iCal / Apple / Custom Calendar"
                      className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md shadow-amber-500/30 cursor-pointer hover:scale-105 transition-transform"
                    >
                      +
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setToastMessage("✓ Calendar sync connected with Google & Outlook credentials.");
                      setTimeout(() => setToastMessage(null), 3500);
                    }}
                    className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Connect</span>
                    <span className="text-indigo-400 font-bold">&gt;</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Card: Upcoming Event (matching Screenshot 2) */}
            <div className="liquid-glass p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white">Upcoming Event</h3>
                <p className="text-[11px] text-slate-400">
                  Scheduled client &amp; internal agenda for {selectedDate}
                </p>
              </div>

              {/* Event Cards Stack */}
              <div className="space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No scheduled events on this date.
                  </div>
                ) : (
                  selectedDayEvents.map((ev) => {
                    const initials = getInitials(ev.contactName || ev.entityName);
                    const isCompleted = ev.status === "COMPLETED";

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 border-l-4 ${
                          ev.type === "Demo"
                            ? "border-l-amber-500"
                            : ev.type === "Payment"
                            ? "border-l-emerald-500"
                            : "border-l-indigo-500"
                        } space-y-2.5 transition hover:border-slate-700`}
                      >
                        {/* Event Title & Checkbox */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-100 leading-snug">
                            {ev.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(ev.id)}
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-400 text-white"
                                : "border-slate-700 bg-slate-950 hover:border-slate-500"
                            }`}
                            title={isCompleted ? "Mark Incomplete" : "Mark Completed"}
                          >
                            {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>
                        </div>

                        {/* Contact Avatar Circle, Name & Time */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-[10px] shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200 text-xs">
                                {ev.contactName || ev.entityName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                {ev.entityName}
                              </div>
                            </div>
                          </div>

                          <span className="font-mono text-[11px] text-slate-400 font-semibold shrink-0">
                            {ev.time}
                          </span>
                        </div>

                        {/* Briefing notes */}
                        {ev.briefing && (
                          <p className="text-[11px] text-slate-400/90 leading-relaxed pt-1 border-t border-slate-800/60">
                            {ev.briefing}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Schedule Event */}
        {isNewEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Schedule New Calendar Event</h3>
                    <p className="text-[11px] text-slate-400">
                      Add demo, implementation milestone, or renewal to the business calendar.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discovery demo call / Vehisoft Parts Control"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Event Category *</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as CalendarEvent["type"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Demo">Demo</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Project">Project Milestone</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Payment">Payment</option>
                      <option value="Renewal">Renewal</option>
                      <option value="Internal">Internal Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Time *</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:30 AM"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 45 min"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization / Business *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Garage"
                      value={formEntityName}
                      onChange={(e) => setFormEntityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. James Mwangi"
                      value={formContactName}
                      onChange={(e) => setFormContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location / Channel</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Meet / On-site Industrial Area"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Executive Briefing &amp; Prep Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key objections to anticipate, materials to bring, or meeting objectives..."
                    value={formBriefing}
                    onChange={(e) => setFormBriefing(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                    <Plus className="h-3.5 w-3.5" />
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
