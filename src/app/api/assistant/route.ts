import Anthropic from "@anthropic-ai/sdk";
import { apiError, apiSuccess } from "@/lib/api-response";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { auditUserId, requirePermission } from "@/lib/team-auth";
import { isoDay } from "@/lib/money";
import { loadWorkspaceDataFromDb } from "@/lib/workspace-data-server";
import { buildAssistantContext, clean } from "@/lib/assistant-context";
import {
  assistantConfigured,
  assistantModel,
  buildParams,
  chatRequestSchema,
  dailyLimit,
  normalizeMessages,
  streamAssistantReply,
  type AssistantEvent,
} from "@/lib/assistant-chat";

/**
 *   GET  → is the assistant switched on (is an Anthropic key set)?
 *   POST → ask a question; the answer streams back as newline-delimited JSON events.
 *
 * Read-only: the assistant sees only what the signed-in person's role may read,
 * and can only suggest actions. Every question is written to the audit log.
 */

export async function GET() {
  const auth = await requirePermission("ai:query");
  if (auth.error) return auth.error;
  return apiSuccess({ configured: assistantConfigured(), model: assistantModel() });
}

export async function POST(req: Request) {
  const auth = await requirePermission("ai:query");
  if (auth.error) return auth.error;
  const user = auth.user;

  // Per person, so one runaway tab can't burn through the budget
  const limit = checkRateLimit(`assistant:${user.id}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return apiError(`You're asking quickly. Try again in ${limit.retryAfterSeconds} seconds.`, "RATE_LIMITED", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Send a JSON body with your messages.", "VALIDATION_ERROR", 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || "That request isn't valid.", "VALIDATION_ERROR", 400);
  }
  const messages = normalizeMessages(parsed.data.messages);
  if (!messages.length) return apiError("Ask a question to start.", "VALIDATION_ERROR", 400);

  if (!assistantConfigured()) {
    return apiError("The AI assistant isn't switched on yet. The owner needs to add an Anthropic API key (npm run ai:setup).", "AI_NOT_CONFIGURED", 503);
  }

  // Across everyone, per day (counted from the audit log so it holds across server instances)
  try {
    const asked = await db.auditLog.count({ where: { action: "ASSISTANT_ASKED", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
    if (asked >= dailyLimit()) {
      return apiError("The assistant has reached today's question limit. It resets within 24 hours, or the owner can raise ASSISTANT_DAILY_LIMIT.", "AI_DAILY_LIMIT", 429);
    }
  } catch (error) {
    logger.error("Assistant limit check failed", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }

  // Read the workspace for THIS role only: areas they can't read are never even loaded
  let loaded;
  try {
    loaded = await loadWorkspaceDataFromDb({ role: user.role });
  } catch (error) {
    logger.error("Assistant could not load the workspace", {}, error);
    return apiError("Database unavailable", "DB_UNAVAILABLE", 503);
  }

  const todayIso = isoDay(new Date());
  const context = buildAssistantContext(loaded.data, user.role, todayIso);
  const model = assistantModel();
  const params = buildParams({
    model,
    messages,
    context: context.text,
    todayIso,
    userName: user.name,
    role: user.role,
    businessName: loaded.businessName,
  });

  const question = messages[messages.length - 1].content;
  const abort = new AbortController();
  const client = new Anthropic({ maxRetries: 1, timeout: 5 * 60 * 1000 });
  const encoder = new TextEncoder();
  const ip = clientIp(req.headers);
  const userAgent = req.headers.get("user-agent");

  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AssistantEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          /* the browser went away */
        }
      };

      send({ type: "meta", model, included: context.included, withheld: context.withheld, asOf: todayIso });

      let outcome: Record<string, unknown> = { result: "ok" };
      for await (const event of streamAssistantReply((p) => client.beta.messages.stream(p, { signal: abort.signal }), params, user.role)) {
        send(event);
        if (event.type === "done") outcome = { result: "ok", stopReason: event.stopReason, tokens: event.usage };
        if (event.type === "error") outcome = { result: "error", code: event.code };
      }

      await logAuditEvent({
        userId: auditUserId(user),
        action: "ASSISTANT_ASKED",
        entityType: "Assistant",
        metadata: { question: clean(question, 200), turns: messages.length, model, areas: context.included, withheld: context.withheld, ...outcome },
        ipAddress: ip,
        userAgent,
      });

      try {
        controller.close();
      } catch {
        /* already closed */
      }
    },
    cancel() {
      // The person closed the tab or pressed Stop: stop paying for the answer
      abort.abort();
    },
  });

  return new Response(body$, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" },
  });
}
