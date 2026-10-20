"use client";

import { useState, useMemo, useEffect } from "react";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import {
  MessageSquare,
  Mail,
  PhoneCall,
  MessageCircle,
  Search,
  Plus,
  Send,
  X,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  INITIAL_COMMUNICATIONS,
  INITIAL_COMM_TEMPLATES,
  CommunicationMessage,
  CommunicationTemplate,
} from "@/data/communications-seed";

const STORAGE_KEY = "versaly_communications_inbox_v2";

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<CommunicationMessage[]>(() => {
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
    return INITIAL_COMMUNICATIONS;
  });

  const [activeFolder, setActiveFolder] = useState<"ALL" | "WhatsApp" | "Email" | "Call" | "SMS" | "TEMPLATES">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string>(() => {
    return INITIAL_COMMUNICATIONS[0]?.id || "";
  });

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeChannel, setComposeChannel] = useState<CommunicationMessage["channel"]>("WhatsApp");
  const [composeOrgName, setComposeOrgName] = useState("");
  const [composeContactName, setComposeContactName] = useState("");
  const [composeRecipient, setComposeRecipient] = useState("+254 ");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const selectedMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedMessageId) || messages[0] || null;
  }, [messages, selectedMessageId]);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        msg.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFolder = activeFolder === "ALL" || msg.channel === activeFolder;

      return matchesSearch && matchesFolder;
    });
  }, [messages, searchQuery, activeFolder]);

  const handleApplyTemplate = (tpl: CommunicationTemplate) => {
    setComposeBody(tpl.body);
    if (tpl.subject) setComposeSubject(tpl.subject);
    setComposeChannel(tpl.channel);
    setIsComposeOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeOrgName.trim() || !composeBody.trim()) return;

    const newMsg: CommunicationMessage = {
      id: `comm-${Date.now()}`,
      channel: composeChannel,
      direction: "OUTBOUND",
      organizationId: `org-${Date.now()}`,
      organizationName: composeOrgName.trim(),
      contactName: composeContactName.trim() || "Contact",
      contactAddress: composeRecipient.trim(),
      subject: composeSubject.trim() || undefined,
      body: composeBody.trim(),
      timestamp: new Date().toISOString(),
      relativeTime: "Just now",
      status: "DELIVERED",
      tags: [composeChannel, "Outbound"],
    };

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
    setIsComposeOpen(false);

    // If WhatsApp, prompt to launch in WhatsApp Web/App
    if (composeChannel === "WhatsApp" && composeRecipient) {
      const cleanPhone = composeRecipient.replace(/[^0-9]/g, "");
      const encoded = encodeURIComponent(composeBody);
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    }

    setComposeOrgName("");
    setComposeContactName("");
    setComposeSubject("");
    setComposeBody("");
  };

  const getChannelBadge = (channel: CommunicationMessage["channel"]) => {
    switch (channel) {
      case "WhatsApp":
        return <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">WhatsApp</span>;
      case "Email":
        return <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded font-semibold">Email</span>;
      case "Call":
        return <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-semibold">Call Log</span>;
      case "SMS":
        return <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-semibold">SMS</span>;
      default:
        return <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">{channel}</span>;
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
                Omnichannel Communications Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-emerald-400">Unified WhatsApp, Email, & Call Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Communications &amp; Inbox
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Never lose context: view complete interaction history by client, dispatch standardized WhatsApp templates, and track response velocity across all communication touchpoints.
            </p>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Compose Message</span>
            </button>
          </div>
        </div>

        {/* Channel Navigation Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFolder("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                activeFolder === "ALL"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              All Messages ({messages.length})
            </button>
            <button
              onClick={() => setActiveFolder("WhatsApp")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeFolder === "WhatsApp"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveFolder("Email")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeFolder === "Email"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-sky-400" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setActiveFolder("Call")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeFolder === "Call"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5 text-indigo-400" />
              <span>Phone Calls</span>
            </button>
            <button
              onClick={() => setActiveFolder("TEMPLATES")}
              className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                activeFolder === "TEMPLATES"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-violet-400" />
              <span>Sales Templates ({INITIAL_COMM_TEMPLATES.length})</span>
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations, clients, or body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* View Mode: Templates or Master Split View */}
        {activeFolder === "TEMPLATES" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_COMM_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="liquid-glass p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{tpl.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {tpl.channel} • {tpl.product}
                    </span>
                  </div>
                  {tpl.subject && (
                    <div className="text-xs text-slate-300 font-medium mt-2">
                      Subject: {tpl.subject}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {tpl.body}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Use This Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation Master List (1 col) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 px-1 flex items-center justify-between">
                <span>Conversations ({filteredMessages.length})</span>
                <span className="text-[10px] text-slate-500">Ordered by activity</span>
              </div>

              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`liquid-glass p-4 rounded-xl cursor-pointer transition flex flex-col justify-between border ${
                        isSelected
                          ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10 bg-indigo-950/20"
                          : "border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white truncate max-w-[170px]">
                            {msg.organizationName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{msg.relativeTime}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {getChannelBadge(msg.channel)}
                          <span className="text-[11px] text-slate-300 font-medium truncate">{msg.contactName}</span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                          {msg.body}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono">{msg.contactAddress}</span>
                        <span className={msg.direction === "INBOUND" ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          {msg.direction === "INBOUND" ? "← Inbound" : "→ Outbound"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredMessages.length === 0 && (
                  <div className="p-8 text-center liquid-glass rounded-xl text-xs text-slate-500">
                    No communications found matching this view.
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Detail Canvas (2 cols) */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="liquid-glass rounded-2xl p-6 space-y-6 border border-slate-800/80">
                  {/* Thread Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-white">
                          {selectedMessage.organizationName}
                        </h2>
                        {getChannelBadge(selectedMessage.channel)}
                        <span className="text-xs text-emerald-400 font-mono">
                          {selectedMessage.contactAddress}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Contact: <strong className="text-slate-200">{selectedMessage.contactName}</strong> • Logged {selectedMessage.relativeTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedMessage.channel === "WhatsApp" && (
                        <button
                          onClick={() => {
                            const cleanPhone = selectedMessage.contactAddress.replace(/[^0-9]/g, "");
                            window.open(`https://wa.me/${cleanPhone}`, "_blank");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Open in WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Bubble Card */}
                  <div className="space-y-4">
                    {selectedMessage.subject && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                        <span className="text-slate-500">Subject: </span>
                        <span className="text-slate-200 font-semibold">{selectedMessage.subject}</span>
                      </div>
                    )}

                    <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                      selectedMessage.direction === "INBOUND"
                        ? "bg-slate-900/90 border-slate-700/80 text-slate-200"
                        : "bg-indigo-950/30 border-indigo-500/30 text-indigo-100"
                    }`}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span className="font-semibold text-white">
                          {selectedMessage.direction === "INBOUND" ? selectedMessage.contactName : "Versaly Core Ops"}
                        </span>
                        <span className="font-mono text-[10px]">{selectedMessage.relativeTime}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                    </div>
                  </div>

                  {/* Quick Reply Form */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Quick Reply via {selectedMessage.channel}</span>
                      <button
                        onClick={() => setActiveFolder("TEMPLATES")}
                        className="text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                      >
                        <span>Browse Pitch Templates</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.elements.namedItem("replyBody") as HTMLTextAreaElement).value;
                        if (!input.trim()) return;

                        const newReply: CommunicationMessage = {
                          id: `comm-${Date.now()}`,
                          channel: selectedMessage.channel,
                          direction: "OUTBOUND",
                          organizationId: selectedMessage.organizationId,
                          organizationName: selectedMessage.organizationName,
                          contactName: selectedMessage.contactName,
                          contactAddress: selectedMessage.contactAddress,
                          body: input.trim(),
                          timestamp: new Date().toISOString(),
                          relativeTime: "Just now",
                          status: "DELIVERED",
                          tags: [selectedMessage.channel, "Reply"],
                        };

                        setMessages((prev) => [newReply, ...prev]);
                        (e.target as HTMLFormElement).reset();

                        if (selectedMessage.channel === "WhatsApp") {
                          const cleanPhone = selectedMessage.contactAddress.replace(/[^0-9]/g, "");
                          const encoded = encodeURIComponent(input);
                          window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
                        }
                      }}
                      className="space-y-3"
                    >
                      <textarea
                        name="replyBody"
                        rows={3}
                        required
                        placeholder={`Type message to ${selectedMessage.contactName}...`}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Dispatches to {selectedMessage.contactAddress}
                        </span>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Dispatch Reply</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="liquid-glass rounded-2xl p-12 text-center text-xs text-slate-500">
                  Select a communication to view details and reply.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Compose New Communication */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="liquid-glass max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Compose Omnichannel Message</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Channel</label>
                    <select
                      value={composeChannel}
                      onChange={(e) => setComposeChannel(e.target.value as CommunicationMessage["channel"])}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Call">Phone Call Log</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organization / Client *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Auto Garage"
                      value={composeOrgName}
                      onChange={(e) => setComposeOrgName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. James Mwangi"
                      value={composeContactName}
                      onChange={(e) => setComposeContactName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {composeChannel === "Email" ? "Email Address" : "Phone Number"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={composeChannel === "Email" ? "name@client.co.ke" : "+254 722 000 000"}
                      value={composeRecipient}
                      onChange={(e) => setComposeRecipient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {composeChannel === "Email" && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Versaly Core — Operational Proposal"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type pitch, follow-up, or operational instruction..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send via {composeChannel}</span>
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
