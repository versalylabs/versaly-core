import { parseMarkdownLite, type Inline } from "@/lib/markdown-lite";

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.kind === "bold" ? (
          <strong key={i} className="font-semibold text-white">
            {p.text}
          </strong>
        ) : p.kind === "code" ? (
          <code key={i} className="px-1 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-[0.85em] text-indigo-200">
            {p.text}
          </code>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

/** Renders the assistant's answer: paragraphs, lists, bold and code, with no raw HTML. */
export function AnswerText({ text }: { text: string }) {
  const blocks = parseMarkdownLite(text);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-slate-200">
      {blocks.map((b, i) =>
        b.kind === "paragraph" ? (
          <p key={i} className="whitespace-pre-line">
            <Inlines parts={b.inline} />
          </p>
        ) : b.kind === "bullets" ? (
          <ul key={i} className="list-disc pl-5 space-y-1 marker:text-slate-500">
            {b.items.map((item, j) => (
              <li key={j}>
                <Inlines parts={item} />
              </li>
            ))}
          </ul>
        ) : (
          <ol key={i} className="list-decimal pl-5 space-y-1 marker:text-slate-500">
            {b.items.map((item, j) => (
              <li key={j}>
                <Inlines parts={item} />
              </li>
            ))}
          </ol>
        )
      )}
    </div>
  );
}
