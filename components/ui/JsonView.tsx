/**
 * Read-only, syntax-coloured JSON. Tokenised with one regex over the
 * formatted string, so there is no dependency and no HTML injection: every
 * token is rendered as a text node.
 */
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi;

export function JsonView({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const [whole, string, colon, literal, number] = match;
    const tone = string
      ? colon
        ? "text-hf-accent-soft"
        : "text-white"
      : literal
        ? "text-hf-dim"
        : number
          ? "text-hf-cyan"
          : "";
    parts.push(
      <span key={index} className={tone}>
        {string ?? whole}
      </span>,
    );
    if (colon) parts.push(colon);
    last = index + whole.length;
  }
  parts.push(text.slice(last));

  return (
    <pre
      data-json-view
      className="max-h-[55dvh] overflow-auto rounded-xl border border-hf-border bg-hf-black p-4 font-mono text-[12px] leading-relaxed text-hf-muted"
    >
      {parts}
    </pre>
  );
}
