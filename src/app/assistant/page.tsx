"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { AnswerText } from "@/components/assistant/answer-text";
import { KeywordAssistant } from "@/components/assistant/keyword-assistant";
import { SuggestionCard, type SuggestedAction } from "@/components/assistant/suggestion-card";
import { useCurrentUser } from "@/lib/current-user";
import { Sparkles, ShieldCheck, Send, Square, RotateCcw, KeyRound, Eye, EyeOff } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestions: SuggestedAction[];
  error?: string;
  streaming?: boolean;
  stopped?: boolean;
  cutShort?: boolean;
  meta?: { included: string[]; withheld: string[]; asOf: string };
}

interface Status {
  configured: boolean;
  model: string;
}

const AREA_NAME: Record<string, string> = { finance: "Finance", pipeline: "Sales and clients", projects: "Projects" };

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;

/** What the assistant is told about earlier turns: the text, plus the titles of anything it suggested. */
function toHistory(messages: ChatMessage[]) {
  return messages
    .map((m) => ({
      role: m.role,
      content: (m.text + (m.suggestions.length ? `\n\n[Suggested steps: ${m.suggestions.map((s) => s.title).join("; ")}]` : "")).trim(),
    }))
    .filter((m) => m.content)
    .slice(-20);
}

function promptsFor(permissions: string[]): string[] {
  const can = (p: string) => permissions.includes(p);
  const prompts: string[] = ["Give me a quick summary of where the business stands today."];
  if (can("finance:read")) {
    prompts.push("What's overdue, and who should I chase first?", "Will we run short of cash in the next 8 weeks?", "What is our recurring revenue and what could change it?");
  }
  if (can("crm:read")) prompts.push("Which deals should I push this week?", "Which clients are coming up for renewal?");
  if (can("projects:read")) prompts.push("Which projects are blocked, and what should I do about it?");
  return prompts.slice(0, 6);
}

export default function AssistantPage() {
  const user = useCurrentUser();
  const [status, setStatus] = useState<Status | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/assistant", { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && json?.data) setStatus({ configured: Boolean(json.data.configured), model: String(json.data.model || "") });
        else setStatusFailed(true);
      })
      .catch(() => {
        if (!cancelled) setStatusFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const patch = (id: string, change: (m: ChatMessage) => ChatMessage) => setMessages((prev) => prev.map((m) => (m.id === id ? change(m) : m)));

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || busy) return;

    const history = toHistory(messages);
    const userMsg: ChatMessage = { id: nextId("u"), role: "user", text: question, suggestions: [] };
    const replyId = nextId("a");
    setMessages((prev) => [...prev, userMsg, { id: replyId, role: "assistant", text: "", suggestions: [], streaming: true }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: question }] }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => null);
        const message =
          res.status === 401 ? "Your session has expired. Sign in again to keep going." : json?.error?.message || "The assistant couldn't answer just now. Try again in a moment.";
        patch(replyId, (m) => ({ ...m, streaming: false, error: message }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line);
          } catch {
            continue;
          }
          if (event.type === "meta") {
            patch(replyId, (m) => ({ ...m, meta: { included: event.included as string[], withheld: event.withheld as string[], asOf: String(event.asOf) } }));
          } else if (event.type === "text") {
            patch(replyId, (m) => ({ ...m, text: m.text + String(event.text) }));
          } else if (event.type === "suggestion") {
            patch(replyId, (m) => ({ ...m, suggestions: [...m.suggestions, event.suggestion as SuggestedAction] }));
          } else if (event.type === "error") {
            patch(replyId, (m) => ({ ...m, error: String(event.message) }));
          } else if (event.type === "done") {
            patch(replyId, (m) => ({ ...m, cutShort: event.stopReason === "max_tokens" }));
          }
        }
      }
      patch(replyId, (m) => ({ ...m, streaming: false }));
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      patch(replyId, (m) => ({
        ...m,
        streaming: false,
        stopped: aborted,
        error: aborted ? undefined : "The connection dropped before the answer finished. Check your internet and try again.",
      }));
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
  };

  const permissions = user?.permissions ?? [];

  return (
    <WorkspaceLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Ask Versaly</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3 w-3" />
              Read-only · sees only what your role can see
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            Business assistant
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Ask anything about your cash, invoices, deals, clients and projects. It answers from your live workspace, suggests next steps, and never changes anything itself.
          </p>
        </div>

        {!status && !statusFailed && <div className="text-xs text-slate-500 px-1">Checking the assistant…</div>}

        {statusFailed && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-200">
            Couldn&apos;t reach the assistant service. Check your connection and reload the page.
          </div>
        )}

        {/* No Anthropic key yet: explain, and keep the keyword lookup working */}
        {status && !status.configured && user && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <KeyRound className="h-4 w-4 text-indigo-300" />
                Switch on the AI assistant
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Free-form questions need an Anthropic API key. Create one at console.anthropic.com, then run{" "}
                <code className="px-1 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-indigo-200">npm run ai:setup</code> in the project folder (the key goes straight to
                Vercel and is never shown or saved), and redeploy. Until then you can use the simple lookup below.
              </p>
            </div>
            <KeywordAssistant role={user.role} />
          </div>
        )}

        {/* The assistant */}
        {status?.configured && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Try asking</div>
                <div className="flex flex-wrap gap-2">
                  {promptsFor(permissions).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void send(prompt)}
                      className="text-xs px-3 py-2 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-indigo-500/40 text-left transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-indigo-600/80 text-sm text-white whitespace-pre-wrap">{m.text}</div>
                    </div>
                  ) : (
                    <div key={m.id} className="space-y-2.5">
                      <div className="p-4 rounded-2xl rounded-bl-md bg-slate-900/80 border border-slate-800/90 shadow-lg space-y-3">
                        {m.text ? <AnswerText text={m.text} /> : m.streaming ? <div className="text-xs text-slate-400 animate-pulse">Looking through your workspace…</div> : null}
                        {m.streaming && m.text && <span className="inline-block h-3 w-1.5 bg-indigo-400 animate-pulse align-middle" />}
                        {m.cutShort && <p className="text-xs text-amber-300">The answer was cut short. Ask me to continue.</p>}
                        {m.stopped && <p className="text-xs text-slate-500">Stopped.</p>}
                        {m.error && <p className="text-xs text-rose-300">{m.error}</p>}
                        {m.error && /session has expired/i.test(m.error) && (
                          <Link href="/login" className="text-xs text-indigo-300 underline">
                            Go to sign in
                          </Link>
                        )}
                      </div>
                      {m.suggestions.map((s, i) => (
                        <SuggestionCard key={`${m.id}-${i}`} suggestion={s} />
                      ))}
                      {m.meta && !m.streaming && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Looked at {m.meta.included.length ? m.meta.included.map((a) => AREA_NAME[a] ?? a).join(", ") : "no business data"} as of {m.meta.asOf}
                          </span>
                          {m.meta.withheld.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-300/80">
                              <EyeOff className="h-3 w-3" />
                              Not available for your role: {m.meta.withheld.map((a) => AREA_NAME[a] ?? a).join(", ")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
                <div ref={endRef} className="scroll-mb-52" />
              </div>
            )}

            {/* Ask box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="sticky bottom-3"
            >
              <div className="relative rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl focus-within:border-indigo-500 transition">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={2}
                  maxLength={4000}
                  placeholder="Ask about cash, overdue invoices, deals, projects…"
                  className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <div className="absolute bottom-2 left-3 right-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={reset}
                    disabled={!messages.length && !input}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 disabled:opacity-30 transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    New chat
                  </button>
                  {busy ? (
                    <button
                      type="button"
                      onClick={() => abortRef.current?.abort()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition flex items-center gap-1.5"
                    >
                      <Square className="h-3 w-3" />
                      Stop
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1.5"
                    >
                      Ask
                      <Send className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5 px-1">
                Answers come from your saved workspace data and can be wrong. Check important figures before you act. Questions are recorded in the audit log.
              </p>
            </form>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
