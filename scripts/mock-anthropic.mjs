/**
 * A tiny pretend Anthropic API, for testing the assistant without spending any
 * money. It speaks just enough of POST /v1/messages (with streaming) for the app
 * to talk to it, and records every request so tests can check exactly what the
 * app sent (for example, that staff never receive finance data).
 *
 * Point the app at it with:  ANTHROPIC_API_KEY=test  ANTHROPIC_BASE_URL=http://127.0.0.1:4010
 *
 * Behaviour is chosen by the last user message:
 *   contains REMIND   → answers and also calls suggest_action (Finance → Invoices)
 *   contains FAIL401  → answers 401 (as if the key were wrong)
 *   contains FAIL400  → answers 400 "credit balance is too low"
 *   contains FORMAT   → answers with a longer, formatted reply (bold, bullets, numbers) to check rendering
 *   anything else     → a short text answer
 */
import { createServer } from "node:http";

const sse = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;

export function startMockAnthropic(port) {
  const requests = [];

  const server = createServer((req, res) => {
    if (req.method !== "POST" || !req.url.startsWith("/v1/messages")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ type: "error", error: { type: "not_found_error", message: "not found" } }));
      return;
    }

    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      let body = {};
      try {
        body = JSON.parse(raw);
      } catch {
        /* leave empty */
      }
      requests.push({ url: req.url, headers: req.headers, body });

      const last = body.messages?.[body.messages.length - 1];
      const question = typeof last?.content === "string" ? last.content : JSON.stringify(last?.content ?? "");

      const fail = (status, errorType, message) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ type: "error", error: { type: errorType, message } }));
      };
      if (question.includes("FAIL401")) return fail(401, "authentication_error", "invalid x-api-key");
      if (question.includes("FAIL400")) return fail(400, "invalid_request_error", "Your credit balance is too low to access the Anthropic API.");

      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
      res.write(
        sse("message_start", {
          message: { id: "msg_mock", type: "message", role: "assistant", model: body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1500, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } },
        })
      );
      res.write(sse("content_block_start", { index: 0, content_block: { type: "text", text: "" } }));
      const pieces = question.includes("FORMAT")
        ? ["Here is where things stand. **KES 58,000** is overdue", " on `INV-2026-1004`.\n\n", "- **Zanzibar Traders**: KES 58,000, 4 days late\n- **Mombasa Laundry**: ", "KES 12,000, due Friday\n\n", "1. Chase Zanzibar today\n2. Send the draft invoice\n\n", "Cash is **tight** but positive."]
        : ["Mock answer: ", "you asked about ", "your business."];
      for (const piece of pieces) {
        res.write(sse("content_block_delta", { index: 0, delta: { type: "text_delta", text: piece } }));
      }
      res.write(sse("content_block_stop", { index: 0 }));

      let stop = "end_turn";
      if (question.includes("REMIND")) {
        stop = "tool_use";
        const input = JSON.stringify({ title: "Chase Zanzibar Traders E2E", why: "KES 58,000 is well past due.", page: "/finance/invoices", draft: "Hi, a gentle reminder about INV-E2E-1." });
        res.write(sse("content_block_start", { index: 1, content_block: { type: "tool_use", id: "toolu_mock", name: "suggest_action", input: {} } }));
        res.write(sse("content_block_delta", { index: 1, delta: { type: "input_json_delta", partial_json: input } }));
        res.write(sse("content_block_stop", { index: 1 }));
      }
      res.write(sse("message_delta", { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 24 } }));
      res.write(sse("message_stop", {}));
      res.end();
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve({ requests, close: () => new Promise((r) => server.close(r)) }));
  });
}

// Run directly to leave it running while you try the app by hand:  node scripts/mock-anthropic.mjs
if (process.argv[1]?.endsWith("mock-anthropic.mjs")) {
  const port = Number(process.env.PORT || 4010);
  await startMockAnthropic(port);
  console.log(`Pretend Anthropic API listening on http://127.0.0.1:${port}`);
}
