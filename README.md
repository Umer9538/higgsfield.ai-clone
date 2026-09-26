# higgsfield.ai — rebuilt, and rethought

A rebuild of [higgsfield.ai](https://higgsfield.ai), an AI-native creative suite, used as a
reference rather than a blueprint: its own visual identity, a restructured navigation, home and
studio, a real Firestore backend, and a set of deliberate cuts.

**Live:** https://clone-eosin-nine-83.vercel.app · open to anyone, no sign-in required.

**Start with [`PRODUCT_DECISIONS.md`](PRODUCT_DECISIONS.md)**: what changed from the reference,
what was cut, and why, with the measurements behind each decision.

## What is here

- **Navigation:** a five-section side rail (Create, Explore, Assets, Learn, Pricing) with a
  catalog of every model, studio and app behind Create; ⌘K palette; tab bar on phones.
- **Home:** a composer first ("What do you want to make?") that opens the right studio with the
  prompt filled in, above one community feed whose Remix loads into it.
- **Studios:** one canvas + prompt bar + inspector layout for every generator, driven by config
  (`lib/workspace/surfaces/*`); generation is simulated, persistence is real.
- **Onboarding:** a prompt sandbox that ends inside a studio with the preset applied.
- **Signature pieces:** spring-driven node cables, a frame-accurate player with scene markers and a
  preview-vs-final comparison, a context-aware ⌘K, and a performance HUD (Shift + D) that shows
  only measured numbers.

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router), React 19.2 |
| Language | TypeScript, strict |
| Styling | Tailwind v4; Obsidian / Electric Violet / Cyber Cyan tokens in `app/globals.css` |
| Type | Bricolage Grotesque + Instrument Sans via `next/font` |
| Backend | Route handlers in `app/api/*` → `firebase-admin` → Firestore |
| Motion | CSS on transform/opacity with springs sampled into `linear()`; `motion` only on onboarding |
| Tests | Playwright + axe-core |
| Hosting | Vercel; pushes to `main` deploy production |

## Backend

| Endpoint | |
|---|---|
| `GET/POST /api/generations` | list (bounded to 100) / create, with validation |
| `DELETE /api/generations/:id?owner=` | owner-checked delete |
| `GET/POST/DELETE /api/favorites` | per-owner favourites; POST takes an idempotent `favorite` flag |
| `GET /api/health` | which store is live, with a real Firestore round trip |

Credentials are server-only. Copy `.env.example` to `.env.local` and set `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` (a service account). Without them the API uses
an in-memory store and says so, which is fine for local work; the production deployment refuses
with 503 instead of silently losing writes. Schema and endpoint details: *Real Backend &
Persistence Architecture* in `PRODUCT_DECISIONS.md`.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # types
npx eslint .         # lint
npm run build
npx playwright test  # builds on :3100 and runs the suite
```

## Tests

153 Playwright tests across nine files: critical user paths, responsive layouts and touch
targets, accessibility (axe on every route and key overlay states, focus behaviour), motion rules
(every keyframe animation must be transform/opacity only), the API contract, and persistence
round trips that wipe the browser's storage, hard-reload and expect the record back from the
server.

Point the same suite at a deployment with `BASE_URL=https://… npx playwright test`; there it also
asserts the store is Firestore. Test browsers act as tagged devices, and a global teardown deletes
what a run wrote to the shared library.

## Repo layout

| Path | What |
|---|---|
| `app/` | Routes: `(shell)/` pages share the rail and top bar; `api/` handlers |
| `components/` | UI by area: `layout`, `workspace` (studios), `explore`, `onboarding`, `account`, `ui` |
| `lib/` | Config and logic: `workspace/surfaces`, `server` (repository, validation), `nav`, stores |
| `e2e/` | Playwright specs, fixtures and teardown |
| `docs/higgsfield-reference.md` | Notes on the reference product |
| `recon/` | Screenshots of the reference product, by flow |
| `public/media/` | Stock stills and clips served locally for the demo |
| `.agent-logs/` | Verbatim prompt and response record for every session ([`CAPTURE-TEST.md`](CAPTURE-TEST.md)) |
