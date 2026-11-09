import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdownLite } from "@/lib/markdown-lite";

describe("parseInline", () => {
  it("finds bold and code and leaves the rest as text", () => {
    expect(parseInline("Owe **KES 58,000** on `INV-1` today")).toEqual([
      { kind: "text", text: "Owe " },
      { kind: "bold", text: "KES 58,000" },
      { kind: "text", text: " on " },
      { kind: "code", text: "INV-1" },
      { kind: "text", text: " today" },
    ]);
  });
  it("keeps an unfinished span as text while an answer is still streaming", () => {
    expect(parseInline("Total is **KES 58")).toEqual([{ kind: "text", text: "Total is **KES 58" }]);
  });
});

describe("parseMarkdownLite", () => {
  it("groups bullets and numbers into lists and keeps paragraphs apart", () => {
    const blocks = parseMarkdownLite("Two things:\n\n- one\n- **two**\n\n1. first\n2. second\n\nDone.");
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "bullets", "numbers", "paragraph"]);
    const bullets = blocks[1];
    expect(bullets.kind === "bullets" && bullets.items).toHaveLength(2);
    const numbers = blocks[2];
    expect(numbers.kind === "numbers" && numbers.items).toHaveLength(2);
  });
  it("turns headings into bold lines instead of big markup", () => {
    expect(parseMarkdownLite("## Cash")).toEqual([{ kind: "paragraph", inline: [{ kind: "bold", text: "Cash" }] }]);
  });
  it("never produces HTML: markup stays as plain text", () => {
    const [block] = parseMarkdownLite('<img src=x onerror="alert(1)">');
    expect(block).toEqual({ kind: "paragraph", inline: [{ kind: "text", text: '<img src=x onerror="alert(1)">' }] });
  });
  it("handles Windows line endings and empty input", () => {
    expect(parseMarkdownLite("a\r\n\r\nb")).toHaveLength(2);
    expect(parseMarkdownLite("")).toEqual([]);
  });
});
