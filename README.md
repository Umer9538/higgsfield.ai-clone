# higgsfield.ai — rebuild

A rebuild of [higgsfield.ai](https://higgsfield.ai), an AI-native creative suite.

**Live:** https://clone-eosin-nine-83.vercel.app

## Status

Deployment skeleton is live. Product UI is in progress.

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript, strict |
| Styling | Tailwind v4 — same major as the real site |
| Fonts | Inter + Space Grotesk, self-hosted via `next/font` |
| Auth | None. The live link opens for anyone, signed out. |
| Hosting | Vercel |

## Repo layout

| Path | What |
|---|---|
| `app/` | Next.js App Router |
| `docs/higgsfield-reference.md` | Reference spec. Part 1 measured from the live stylesheets, Part 2 from the recon screenshots |
| `recon/` | 52 screenshots of the real product, 13 flows, taken signed in |
| `.agent-logs/` | Verbatim prompt + response record for every session |
| `CAPTURE-TEST.md` | Proof the capture hooks fire automatically |

## Design tokens

Measured from the live stylesheets rather than eyeballed. The accent is lime
`#d1fe17` — it carries the site's identity and appears on exactly four things:
the active nav item, the `GENERAL` preset label, the Generate button, and
toggle-on states.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npx tsc --noEmit
npx eslint .
```
