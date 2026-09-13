const TOKENS = [
  { name: "lime", value: "#d1fe17" },
  { name: "surface", value: "#0f1113" },
  { name: "surface-3", value: "#1c1e20" },
  { name: "border", value: "#292b2c" },
  { name: "muted", value: "#a8a8a8" },
];

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-hf-border bg-hf-surface p-6 sm:p-8">
        <p className="font-mono text-xs tracking-widest text-hf-lime uppercase">
          Deploy check
        </p>

        <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          Skeleton is live
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-hf-muted">
          Next.js, TypeScript and Tailwind v4 are deployed and serving publicly.
          Design tokens and fonts are wired. Product UI comes next.
        </p>

        <ul className="mt-6 space-y-2 text-sm">
          {[
            "Public link, no auth",
            "Inter + Space Grotesk loaded",
            "Tokens from the live stylesheets",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-hf-muted">
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-hf-lime"
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-1.5">
          {TOKENS.map((token) => (
            <span
              key={token.name}
              title={token.value}
              className="size-7 rounded-md border border-hf-border"
              style={{ backgroundColor: token.value }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
