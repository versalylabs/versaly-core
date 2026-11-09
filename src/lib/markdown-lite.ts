/**
 * A tiny, safe formatter for the assistant's answers: paragraphs, bullet and
 * numbered lists, **bold** and `code`. It produces plain data (never HTML) so
 * nothing the model writes can inject markup into the page.
 */

export type Inline = { kind: "text" | "bold" | "code"; text: string };
export type Block =
  | { kind: "paragraph"; inline: Inline[] }
  | { kind: "bullets"; items: Inline[][] }
  | { kind: "numbers"; items: Inline[][] };

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  // A complete **bold** or `code` span; an unfinished one (while streaming) stays as text
  const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ kind: "text", text: text.slice(last, at) });
    const token = match[0];
    out.push(token.startsWith("**") ? { kind: "bold", text: token.slice(2, -2) } : { kind: "code", text: token.slice(1, -1) });
    last = at + token.length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

const BULLET = /^\s*(?:[-*•])\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function parseMarkdownLite(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", inline: parseInline(paragraph.join("\n")) });
    paragraph = [];
  };

  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    const bullet = BULLET.exec(line);
    const number = bullet ? null : NUMBER.exec(line);
    if (bullet || number) {
      flushParagraph();
      const kind = bullet ? "bullets" : "numbers";
      const item = parseInline((bullet ?? number)![1]);
      const prev = blocks[blocks.length - 1];
      if (prev && prev.kind === kind) prev.items.push(item);
      else blocks.push({ kind, items: [item] });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({ kind: "paragraph", inline: [{ kind: "bold", text: heading[1].replace(/\*\*/g, "") }] });
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  return blocks;
}
