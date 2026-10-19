"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  Search,
  Plus,
  StickyNote,
  Pin,
  Trash2,
  Edit2,
  X,
  FolderGit2,
  Tag,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { INITIAL_RANDOM_NOTES, RandomNote } from "@/data/notes-seed";
import { INITIAL_PROJECTS, ImplementationProjectItem } from "@/data/clients-projects-seed";

const STORAGE_KEY = "versaly_random_notes_list_v2";

export default function NotesPage() {
  const [notes, setNotes] = useState<RandomNote[]>(() => {
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
    return INITIAL_RANDOM_NOTES;
  });

  const [projects] = useState<ImplementationProjectItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("versaly_projects_list_v2");
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
    return INITIAL_PROJECTS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [projectFilter, setProjectFilter] = useState<string>("ALL");
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_RANDOM_NOTES[0]?.id || "";
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<RandomNote | null>(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<RandomNote | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState<RandomNote["category"]>("General");
  const [formColor, setFormColor] = useState<RandomNote["color"]>("indigo");
  const [formPinned, setFormPinned] = useState(false);
  const [formLinkedProjectId, setFormLinkedProjectId] = useState<string>("");
  const [formTags, setFormTags] = useState("");

  // Save to localStorage when notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  const togglePin = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        const matchesSearch =
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.linkedProjectName && n.linkedProjectName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = categoryFilter === "ALL" || n.category === categoryFilter;
        const matchesProj =
          projectFilter === "ALL" ||
          (projectFilter === "UNLINKED" && !n.linkedProjectId) ||
          n.linkedProjectId === projectFilter;

        return matchesSearch && matchesCat && matchesProj;
      })
      .sort((a, b) => {
        if (a.pinned === b.pinned) return 0;
        return a.pinned ? -1 : 1;
      });
  }, [notes, searchQuery, categoryFilter, projectFilter]);

  const openAddModal = () => {
    setEditingNote(null);
    setFormTitle("");
    setFormContent("");
    setFormCategory("General");
    setFormColor("indigo");
    setFormPinned(false);
    setFormLinkedProjectId("");
    setFormTags("");
    setIsModalOpen(true);
  };

  const openEditModal = (note: RandomNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormColor(note.color);
    setFormPinned(note.pinned);
    setFormLinkedProjectId(note.linkedProjectId || "");
    setFormTags(note.tags.join(", "));
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const linkedProj = projects.find((p) => p.id === formLinkedProjectId);
    const linkedProjectName = linkedProj ? `${linkedProj.clientName} (${linkedProj.productName})` : undefined;

    const todayDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (editingNote) {
      // Edit
      const updated: RandomNote = {
        ...editingNote,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        color: formColor,
        pinned: formPinned,
        linkedProjectId: formLinkedProjectId || undefined,
        linkedProjectName,
        tags: parsedTags,
        updatedAt: todayDate,
      };

      setNotes((prev) => prev.map((n) => (n.id === editingNote.id ? updated : n)));
    } else {
      // Create
      const newId = `note-${Date.now()}`;
      const newNote: RandomNote = {
        id: newId,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        color: formColor,
        pinned: formPinned,
        linkedProjectId: formLinkedProjectId || undefined,
        linkedProjectName,
        tags: parsedTags,
        createdAt: todayDate,
        updatedAt: todayDate,
      };

      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newId);
    }

    setIsModalOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== noteId);
      if (selectedNoteId === noteId && remaining.length > 0) {
        setSelectedNoteId(remaining[0].id);
      }
      return remaining;
    });
    setDeleteConfirmNote(null);
  };

  const colorStyles: Record<RandomNote["color"], { border: string; bg: string; dot: string }> = {
    indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", dot: "bg-indigo-400" },
    emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", dot: "bg-amber-400" },
    rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", dot: "bg-rose-400" },
    violet: { border: "border-violet-500/30", bg: "bg-violet-500/10", dot: "bg-violet-400" },
    slate: { border: "border-slate-700/60", bg: "bg-slate-800/40", dot: "bg-slate-400" },
  };

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        {/* Header Banner with Liquid Glass Effect */}
        <div className="liquid-glass liquid-glass-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Operational Scratchpad & Knowledge
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Random & Project-Linked Notes</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Executive Notes & Scratchpad
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Capture spontaneous ideas, meeting observations, technical insights, or connect notes directly to client implementation projects.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Note</span>
            </button>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-500/20">
              {notes.length} Notes
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["ALL", "General", "Idea", "Meeting", "Technical", "Finance"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Projects</option>
              <option value="UNLINKED">Standalone (Unlinked)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clientName} ({p.productName})
                </option>
              ))}
            </select>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, tags, ideas, projects..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 2-Column Split View: Note Cards on Left, Active Note Canvas on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes Grid List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {filteredNotes.length === 0 ? (
              <div className="liquid-glass p-12 text-center rounded-2xl border-slate-800 space-y-3">
                <StickyNote className="h-8 w-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No notes found</h3>
                <p className="text-xs text-slate-500">
                  No notes match your active filter. Click &ldquo;Create Note&rdquo; to jot down an idea or meeting debrief.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create First Note</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  const cStyle = colorStyles[note.color] || colorStyles.indigo;

                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`liquid-glass p-4 rounded-xl cursor-pointer transition flex flex-col justify-between group relative border ${
                        isSelected
                          ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                          : `${cStyle.border} hover:border-slate-700`
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header: Category, Linked Project, Pin */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${cStyle.dot}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                              {note.category}
                            </span>
                            {note.linkedProjectName && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[140px]">
                                {note.linkedProjectName}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => togglePin(note.id, e)}
                            className={`p-1 rounded transition ${
                              note.pinned ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                            }`}
                            title={note.pinned ? "Unpin Note" : "Pin Note to Top"}
                          >
                            <Pin className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>

                        {/* Title & Preview */}
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
                            {note.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      </div>

                      {/* Footer: Tags, Date, Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => openEditModal(note, e)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Note"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmNote(note);
                            }}
                            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition"
                            title="Delete Note"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Note Reader Canvas (1 col) */}
          <div className="liquid-glass rounded-2xl p-6 space-y-5">
            {selectedNote ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {selectedNote.category}
                      </span>
                      {selectedNote.pinned && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <Pin className="h-3 w-3 fill-current" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(selectedNote)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Edit Note"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmNote(selectedNote)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-snug">{selectedNote.title}</h2>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Created: {selectedNote.createdAt}</span>
                    <span>•</span>
                    <span>Updated: {selectedNote.updatedAt}</span>
                  </div>
                </div>

                {/* Linked Project Banner */}
                {selectedNote.linkedProjectId ? (
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-indigo-200">Linked to Project:</div>
                        <div className="text-[11px] text-slate-300">{selectedNote.linkedProjectName}</div>
                      </div>
                    </div>
                    <Link
                      href={`/projects#${selectedNote.linkedProjectId}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Standalone Note (Not tied to any project)</span>
                    <button
                      onClick={() => openEditModal(selectedNote)}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Connect to project
                    </button>
                  </div>
                )}

                {/* Note Content */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                  {selectedNote.content}
                </div>

                {/* Tags */}
                {selectedNote.tags.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="h-3 w-3 text-slate-500" />
                      <span>Tags</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Select a note from the left to view its complete content.
              </div>
            )}
          </div>
        </div>

        {/* Create / Edit Note Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <StickyNote className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-base text-white">
                    {editingNote ? "Edit Note" : "Create New Note"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Note Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M-Pesa STK Fallback Mechanism or Pricing Idea"
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
                      onChange={(e) => setFormCategory(e.target.value as RandomNote["category"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="Idea">Idea</option>
                      <option value="Meeting">Meeting Debrief</option>
                      <option value="Technical">Technical / Architecture</option>
                      <option value="Finance">Finance / Commercial</option>
                      <option value="Action Item">Action Item</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Color Accent</label>
                    <select
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value as RandomNote["color"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="indigo">Indigo</option>
                      <option value="emerald">Emerald</option>
                      <option value="amber">Amber</option>
                      <option value="rose">Rose</option>
                      <option value="violet">Violet</option>
                      <option value="slate">Slate</option>
                    </select>
                  </div>
                </div>

                {/* Connect to Project */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Connect to Implementation Project (Optional)
                  </label>
                  <select
                    value={formLinkedProjectId}
                    onChange={(e) => setFormLinkedProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Random / Standalone Note)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.clientName} — {p.name} ({p.productName})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Connecting to a project allows 1-click cross-navigation from the project workspace.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Note Content *</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Write detailed observations, meeting transcript notes, code snippets, or thoughts..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Payments, Hardware, Field Visit"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="pinned" className="text-xs text-slate-300 cursor-pointer">
                    Pin note to top of scratchpad
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25"
                  >
                    {editingNote ? "Save Changes" : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Note?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This will permanently remove <strong className="text-white">{deleteConfirmNote.title}</strong> from your scratchpad.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmNote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(deleteConfirmNote.id)}
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
