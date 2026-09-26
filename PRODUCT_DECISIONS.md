# Product decisions

This started as a faithful rebuild of higgsfield.ai. For the submission it
takes its own direction: a distinct visual identity, a real backend, and a
set of cuts made on purpose. This file records what changed and why.

---

## What we changed

### Visual identity: Obsidian, Electric Violet, Cyber Cyan

**The rule behind every colour below: the work is the only thing on screen
allowed to be colourful.** A creative tool's canvas is full of generated
images and video; the chrome's job is to frame them without competing or
tinting them. So the base is near-neutral, and colour is spent only where
it tells you something.

| Role | Token | Hex | Used for |
|---|---|---|---|
| Page | `hf-black` | `#09090B` | the room |
| Panel | `hf-surface` | `#101013` | rail, inspector, footer |
| Raised | `hf-surface-2` | `#16161A` | composers, cards |
| Control | `hf-surface-3` | `#1E1E23` | tiles, chips |
| Pressed | `hf-surface-4` | `#27272D` | active tab, slider track |
| Hairline | `hf-border` | `#303038` | every border |
| Text | `hf-text` | `#FFFFFF` | headings, values |
| Muted text | `hf-muted` | `#A8A8B3` | body copy |
| Dim text | `hf-dim` | `#8F8F9B` | labels, struck-out prices |
| **Brand / action** | `hf-accent` | `#8B5CF6` | Generate, Create, primary buttons, New and offer badges, the active rail marker |
| Brand text | `hf-accent-soft` | `#A78BFA` | violet text on dark |
| Hover | `hf-accent-hover` | `#9B73F7` | primary hover: lifts, not darkens (black text 6.2:1; the old `#7C3AED` was 3.7:1) |
| Disabled | `hf-accent-muted` | `#4C3A7A` | Generate while disabled |
| **State** | `hf-cyan` | `#06B6D4` | focus ring, selected and configured controls, progress, slider fills, node connections, a composer while you type in it |
| Danger | `hf-danger` | `#F43F5E` | destructive actions only — not part of the brand |

**Three roles, never mixed.** Violet means *do this*. Cyan means *this is
the current state* — selected, focused, configured, how far along. Obsidian
is everything else. A glance tells you whether something is an action or a
status, and neither ever appears as decoration.

**Measured contrast (WCAG):**

| On | White | Muted | Dim | Violet tint | Cyan |
|---|---|---|---|---|---|
| Page `#09090B` | 19.9 | 8.5 | 6.2 | 7.3 | 8.2 |
| Panel `#101013` | 19.0 | 8.1 | 5.9 | 7.0 | 7.8 |
| Control `#1E1E23` | 16.6 | 7.1 | 5.2 | 6.1 | 6.8 |
| Pressed `#27272D` | 14.9 | 6.3 | 4.7 | 5.5 | 6.1 |

Every text colour clears AA (4.5:1) on every surface it can sit on. Black
on a violet button is 5.0:1, black on cyan 8.7:1. Full-strength violet
`#8B5CF6` only reaches 4.5:1 as text, which is why text always uses the
`#A78BFA` tint and the full tone is kept for fills.

**Why violet and cyan, and not lime.** Lime is the reference's signature;
going back to it would undo the point of making this our own. Violet is
rare in natural footage — skin, foliage, sand and sunsets are warm or
green — so a violet button stays distinct next to most frames instead of
blending into them. Cyan is violet's cool neighbour: related enough to
feel like one system, distinct enough to read as a different signal.

**Reversed from the previous pass: violet-tinted surfaces.** Last round the
surfaces carried a violet cast (`#07060B` → `#231F30`) to make the room feel
lit by the screen. That works for an empty room and against a room full of
work: a coloured surround shifts how everything placed on it is perceived
(simultaneous contrast), nudging images toward the opposite hue — here,
yellow-green. Grading suites use neutral grey for exactly this reason. The
ramp is now near-neutral with a hair of cool, at the same lightness steps.

**Removed for consistency.** An audit found colours left over from the
reference and earlier passes, each doing a job the system already covers:

- **Lime `#D1FE17`** still filled the result video scrubber, both pricing
  credit sliders and the Canvas node connections. Sliders and progress are
  state, so they are now cyan with a white thumb; connections are cyan too.
- **Pink `#FF005B`, magenta and amber** carried discount badges, the Max
  plan, the pricing promo and the contest banners. Offers are actions, so
  they are now violet. Max is the brightest violet with a glow rather than a
  second hue. Destructive hovers moved to the new danger token.
- **Struck-out old prices** were pink, which pulled the eye to the price you
  *don't* pay. They are now dim; the real price stays white.
- **Green and blue tier badges** ("70% cheaper", Seedance access) now use
  cyan tints.
- **The full-bleed violet footer** — the reference's lime-footer signature,
  repainted — was the largest area of colour in the app. It now sits on
  Obsidian, with violet on one line of the wordmark.
- Names that described colours were renamed to meanings: the pricing badge
  tones `lime / pink / green` are now `feature / new / saving`, and the
  `lime` button variant is `primary`.

**Depth without colour noise.** Glass (translucent obsidian + blur + a
white 6% top highlight) is only for things that float: dialogs, the
palette, popovers. Gradient borders mark the one focal surface of a screen
(the home composer, the studio prompt bar, onboarding's live prompt, the
profile's starting preset): violet light fading out at rest, turning cyan
while you type, with a second pixel of outline so the surface itself is a
2px focus indicator. The one ambient
glow is the violet light behind the home composer.

| | Reference | Ours |
|---|---|---|
| Radius | `rounded-xl` everywhere | a three-step scale: controls `12px`, media `18px`, panels `24px` |
| Type | One grotesque, uppercase display | **Bricolage Grotesque** headlines, **Instrument Sans** body, sentence case |

### Structure: three decisions

The visual pass left the reference's skeleton intact — its nav, its banner
home page, its two studio layouts. The third pass replaced all three. Each
direction was chosen from two or three drafted alternatives; the ones not
taken are noted, because the reasons matter as much as the choice.

#### Navigation: a side rail and ⌘K, instead of a 19-item top bar

**Before.** One top bar held models (Image, Video, Audio), studios (Cinema,
Marketing, Genjutsu), apps (ChatGPT Plugin, MCP), and pages (Supercomputer,
Academy…) side by side — 19 links plus Pricing, a second discount badge,
Log in and Sign up, under a separate promo bar. At 1440px it already
clipped ("3D J…"). Nothing in it said what kind of product this is.

**Now.** A 72px rail with five sections: **Create, Explore, Assets, Learn,
Pricing**. Create opens the whole catalog beside the rail, grouped by what
each thing is — Models, Studios, Apps — with a one-line description each,
so choosing no longer means already knowing the product names. Explore and
Pricing reveal their secondary pages (Community, Contests, Originals;
Enterprise) on hover or keyboard focus. The top bar keeps only search,
which opens the ⌘K palette, and the account. On phones the rail becomes a
five-tab bar at thumb height, and Create opens the catalog as a sheet.

**Cut.** The promo bar, the 19-link row, and the duplicate "54% OFF" badge.
One small promo survives, in the rail's foot, where it never covers work.

**Why.** The rail reads as a tool, not a website; it fits any width; and it
puts every destination one click from anywhere without a scroll-to-find
row. *Not taken:* a slim top bar with a mega menu (smallest change, but
still reads as a website), and a command-only header (fastest for experts,
but a first-time visitor cannot browse what exists).

#### Home: a composer first, instead of a banner grid

**Before.** Promo bar, then a featured card with four tiles, then a product
row, then a 15-card effects grid — a storefront where everything has equal
weight and there is nowhere to type.

**Now.** The first screen asks **"What do you want to make?"** above a large
prompt box with an Image / Video / Cinema switch and four starting points.
Enter opens the matching studio with the prompt already in it. Below, one
feed of community work; **Remix loads that prompt into the composer above**
instead of navigating away, so browsing and starting are the same motion.

**Cut.** The featured card and its tiles, the product row, and the
separate effects grid — effects are now a filter on the feed.

**Why.** You can type the moment the page loads, before deciding which
studio you need — the composer picks it for you. *Not taken:* a bento dashboard (a signed-out reviewer would
see mostly empty tiles) and a full-bleed video reel (strong mood, but heavy
and slower to browse).

#### Studio: one canvas + inspector, instead of two unrelated layouts

**Before.** Video, Edit, Audio and Motion Control used a 390px form on the
left with the preview on the right. Image, Cinema and Marketing had no form
and put everything into a bottom dock. The same job — write, configure,
generate, review — looked different depending on which studio you opened,
and on short screens the left form pushed Generate below the fold.

**Now.** Every studio is the same shell:

- **Canvas** in the middle: the idle guide, the developing frame, then the
  result.
- **Prompt bar** pinned beneath it with Generate always in view, and a
  strip of your recent generations under that.
- **Inspector** on the right, in the same order everywhere: **Model →
  Inputs → Look → Lens → Output**. Each section collapses, and the whole
  inspector hides to give the canvas the width. On phones it opens as a
  bottom sheet.

Both config styles (form fields and dock pills) are mapped onto those
sections by one pure function, `lib/workspace/inspector.ts`, so a new studio
is still just config. Studios with no prompt say so in the bar rather than
showing an empty box.

**Cut.** The left form, the dock/panel split and its `layout` flag, and the
"History / How it works" tabs, which switched nothing. The recent strip is
real history instead.

**Why.** One layout to learn, the work gets most of the screen, and Generate
never scrolls out of reach. *Not taken:* a floating command canvas (calmest,
but hides settings — hard to learn in a five-minute demo) and a three-pane
pro suite (powerful, but cramped on laptops and poor on phones).

### Details that carried over

- **Explore rails** clamp to a whole number of rows and taper into the page
  with a centred call to action, rather than cutting a card mid-frame.

### A studio, not a landing page

The second pass had one question: what should this feel like to sit in for
an hour? The answer we designed to is a **projection room** — the work is
the light source, and the chrome stays dark and quiet around it.

- **Type.** Every display heading was uppercase with wide tracking. It read
  as shouting and made long model names hard to scan. Headlines are now
  sentence case in Bricolage Grotesque with tight tracking; body copy is
  Instrument Sans. 39 headings and every tracked-out eyebrow were changed.
- **Neutral ground.** Surfaces are near-neutral obsidian so the work is
  never tinted — see *Visual identity* for why the earlier violet cast was
  reversed.
- **One radius per job.** Controls, media and panels each get one radius
  from a token, so nesting always steps outward and nothing looks
  accidentally mismatched.
- **Effects are rationed.** The gradient border marks only the focal surface
  of a screen (see *Visual identity*). Media cards lift to 1.02 on a spring
  with an inset violet edge drawn on `::after`; controls get a press-in scale
  instead. Glass is for things that float:
  dialogs, the palette, popovers.

### Generate is the signature moment

Everything else is restrained so this can be loud:

- The button is a lit gradient with a violet glow, and it presses in
  (`scale 0.98`) on click. While busy, a band of light sweeps across it.
- The waiting state became a **developing frame**: a 16:9 plate whose violet
  light rises with progress, a scanning band, and a frame counter — instead
  of a spinner beside a list.
- Results reveal with a short fade-and-rise rather than popping in. Dialogs
  and the command palette use the same reveal, so motion is one vocabulary.
- All of it switches off under `prefers-reduced-motion`.

### Cinema Studio parameters

- Five loose tiles are grouped into two labelled sections — **Look** (film
  setup, palette, lighting) and **Lens** (camera, references) — so they read
  as two decisions rather than five. Options open inline as a chip grid
  instead of a floating popover.
- **Mobile could not reach the parameters at all** in the reference: they
  were hidden below `sm`. They are now in the settings sheet, in 44px targets.
- References showed the cyan "configured" ring while empty, because any
  non-Auto value counted. Only real pickers can light up now.

---

## What we cut

- **Redundant banner clutter.** The reference stacks a promo bar, an in-page
  discount panel and a floating festival card on some screens. The promo bar
  is gone; one small offer sits in the rail, and Pricing keeps its own.
- **The storefront home and the 19-link nav** — see *Structure* above.
- **Multi-layer overlays.** Hover states used to stack a gradient, author
  chip, like count, prompt, badge row and button over one card. On touch
  those are always visible, so they must earn their space; the fade layer is
  non-interactive so it never swallows a tap.
- **Real auth and inference.** Sign-in is mock and every route stays public.
  Generation is simulated. Both were deliberate: the brief judges product,
  and a login wall in front of a demo costs the reviewer more than it shows.
- **Image rails do not play video.** GPT Image 2 and Soul 2.0 are image
  models, so their cards stay stills rather than implying otherwise.

---

## How UX improved

### Live database sync

Generations and favourites persist to **Firestore** through `app/api/*`.
Finishing a run writes locally first, so the library updates instantly,
then POSTs to the API. The result card shows where it actually landed —
*Synced to cloud*, *Saved · session* or *Saved on device* — instead of just
"done".

Firestore is reached through **`firebase-admin` with a service account**, not
the browser SDK. The browser SDK in an API route would have needed Firestore
security rules open to public writes. The service-account credentials are
server-only: no `NEXT_PUBLIC_` prefix, and `lib/firebase-admin.ts` imports
`server-only`, so pulling it into a client component fails the build.

With no credentials the same API serves an in-memory store behind the same
interface, so a fresh clone, CI and the test suite all run without secrets.

Synced items do not jump into the library under the user's cursor. They wait
behind a cyan "N synced" pill and merge on tap. Inserting them on arrival
measured **CLS 0.366**; this keeps it at zero.

### Sub-second navigation

The first cut of the video grid let every visible card stream. Measured on
the deployment, leaving the feed took **23.5 s** against **231 ms** for a
page without video: streaming video held the browser's per-host connections
open and starved navigation. At most four cards now stream, chosen in
reading order and released on scroll.

The cap was not enough once the home page gained a video feed. Measured on
the deployment after that release: **17.6 s** to leave the home page and
**9.0 s** to leave Explore, against **117 ms** from Pricing. Two fixes:

- Feed clips are **6-second silent loops** — 11.8 MB of clips became 2.2 MB,
  which also helps every phone on a metered connection.
- A press on anything that navigates (a link, a submit, Enter in a composer
  or the palette) **aborts every stream** until the navigation lands, so the
  next page gets the whole connection. If nothing navigates, playback
  resumes after three seconds.

Re-measured on the deployment: **0.2–1.0 s** from Home and **~0.9 s** from
Explore. A test now guards the home page as well as Explore.

### Faster studio controls

Cinema Studio parameters used to open a vertical list. They now open a
two-column chip grid — every option visible, one tap to choose — and a
configured tile carries a cyan ring. A single **Reset** control clears every
customised parameter instead of reopening each one.

### Accessible focus

One global `:focus-visible` rule draws a cyan ring on every keyboard-focused
control, so focus is never invisible because a component forgot its own
style. Dialogs trap focus and restore scroll; the command palette, menus and
listboxes use proper ARIA roles.

---

## Audit loop: independent review, fix, re-review

Four review agents audited the finished product in parallel, each owning
one area (backend and data integrity; UI state and overlays; accessibility,
motion and performance; test integrity and whether this document is true).
They were read-only and had to report verified findings with a concrete
failure scenario. Round 1 returned **41**. Each was checked against the code
before fixing. Round 2 re-audits the changed areas, and the loop repeats
until a round comes back clean.

**Round 1, fixed:**

- **Menus reopened by themselves.** A route-scoped menu remembered the page
  it was opened on, so leaving with it open and returning later reopened it.
  It now also forgets on any route change. The palette, JSON inspector and
  sign-in dialog, which live in layouts that outlive navigation, close on
  route change too.
- **Stacked dialogs.** ⌘K no longer opens over a form dialog, where one
  Escape closed both and lost what was typed. The palette now uses the
  shared dialog behaviour: Escape from anywhere inside, Tab contained, focus
  returned. Modals take a stable close callback, so a parent re-render no
  longer pulls focus back to them.
- **Favourites could lose data.** A failed load looked "ready and empty", so
  the next click deleted a saved favourite. A double-click raced the
  server's read-then-write toggle. A slow failure rolled back a newer
  success. Now: POST takes the desired state (idempotent); the legacy toggle
  runs in a Firestore transaction; each item settles on its own and only for
  its owner; buttons are disabled while their request is in flight; a failed
  load stays not-ready and retries. Document ids moved to a collision-free
  `f|owner|item` scheme (the old `owner__item` could collide across owners
  or hit Firestore's reserved `__…__` names), and old ids are still cleaned up.
- **Privacy and bounds.** `GET /api/favorites` without an owner returned
  everyone's favourites; owner is now required. `DELETE` validates `itemId`.
- **Deleting after signing in or out.** Records made signed out belong to
  the device. Deletes now offer both identities, and anything that cannot be
  deleted remotely is hidden instead of resurrected by the sync pill.
- **Blocked storage.** The "keep it in memory" fallback in the asset and
  auth stores re-read empty storage and discarded itself, so sign-in silently
  failed with site data blocked. They now switch to memory mode.
- **Prompts the server would reject** (over 2,000 characters, or only
  whitespace) could be typed and silently failed to sync. Every prompt field
  now enforces the API's limit, and the client trims as the server does.
- **Video and motion.** Feed videos honour the in-app Reduce motion setting
  and can be paused (WCAG 2.2.2), from the feed or Settings. On touch, a
  scroll swipe no longer freezes the feed: stream suspension waits for a real
  tap. Onboarding's springs honour the in-app setting, and smooth scrolling
  honours reduced motion.
- **Screen readers.** The contest countdown was a live region announcing
  every second. The onboarding prompt re-read itself on every keystroke and
  now announces tag changes only. Generate reads "Generate, 45 credits, was
  80" instead of "Generate 80 45". Fourteen filter and choice groups used tab
  roles with no tab panels; they are now labelled groups of pressed/unpressed
  buttons. "View all" hands focus to "Back to all models" instead of dropping
  it. The heart has one label, with `aria-pressed` carrying the state.
- **Contrast and layout on phones.** The struck price (2.6:1), the video
  duration (4.4:1 at best) and the empty-history hint (3.8:1) now pass AA.
  The video controls overflowed a 390 px screen, clipping Fullscreen. The
  44 px touch rule stretched every switch into a pill; switches now keep
  their shape and get the target from an invisible hit area, and their knobs
  move by transform instead of animating `left`.
- **Tests that could not fail, or cleaned up nothing.** Runs against
  production left permanent records in the live shared library; test
  browsers now act as tagged devices and a global teardown deletes what a run
  wrote. A persistence test accepted the failure state as a pass. The
  navigation-speed test's 10 s budget would have passed the 9 s regression it
  guards (now 4 s, synced on streaming rather than a sleep). Clicks could land
  before hydration; the shared fixture now waits for it on every navigation.
  Three comments claimed checks the tests did not make, and now the tests
  make them.
- **This document and the README** had drifted. The README still described
  the lime-accent skeleton. This file overclaimed axe coverage and "zero"
  layout shift, gave two different press scales, and still said favourites
  were missing. All corrected.

**Round 2, re-auditing round 1's own fixes.** Most held (8 of 9 backend,
12 of 15 UI). What had not, and what the fixes themselves broke:

- **Memory-mode regression.** The blocked-storage fix stopped reading from
  storage but only updated its cache on failure, so a later write that
  succeeded (sign-out after a quota error) never reached the screen. Writes
  now update the cache on both paths, and a success leaves memory mode.
- **Focus, again.** The palette's input used `autoFocus`, which React applies
  before effects run, so the dialog hook recorded the input as the opener and
  could never return focus. Disabling the heart while its request was in
  flight blurred it and dropped a keyboard user's place; it now uses
  `aria-disabled` and keeps focus. "View all" handed focus to a control
  hidden under the two sticky bars; it now scrolls first. "Back to all
  models" returns focus to the rail you came from.
- **A live region hiding in plain sight.** `<output>` is implicitly
  `role=status`, so removing `aria-live` changed nothing; it is now
  explicitly off.
- **Edge cases.** A save that landed after its generation was deleted
  resurrected it (the delete now completes when the save lands). Setting a
  favourite checked only the new id and could duplicate a legacy one. Legacy
  ids that Firestore reserves are skipped. The favourites loader cleared
  another owner's in-flight marker, and a late response could overwrite
  newer clicks. The 20 px billing switch got a 40 px hit area (now centred at
  44 px). The video toggle had the same double label-and-pressed pattern as
  the heart.
- **Deliberately kept:** frame-step buttons are hidden on phones. Touch users
  scrub; restoring them at 390 px clips Fullscreen again.

New tests pin each focus fix: the palette returns focus to its opener, the
heart keeps focus through a save, and "View all" lands on a visible control
whose Back returns to the rail.

**Not changed, on purpose:** preview deployments keep the in-memory
fallback (production refuses without a database). Ownership stays advisory
while sign-in is mocked. Generations made by earlier test runs before owners
existed have no owner, so the public API cannot delete them; they need a
one-off admin cleanup.

## Real Backend & Persistence Architecture

**Shape.** Next.js route handlers (`app/api/*`, Node runtime, never cached)
→ a repository (`lib/server/repository.ts`) → Firestore through
`firebase-admin` with a service account. The browser never talks to
Firestore: credentials are server-only env vars (no `NEXT_PUBLIC_`), and
`server-only` makes importing that module from client code a build error.

**Collections.**

| Collection | Document id | Fields |
|---|---|---|
| `generations` | Firestore auto id (20 chars) | `prompt`, `model`, `surface`, `kind` (`video`/`image`/`audio`), `src`, `poster` (nullable), `spec`, `owner` (nullable), `createdAt` (ISO) |
| `favorites` | `${owner}__${itemId}` (deterministic) | `itemId`, `title`, `owner`, `createdAt` |

The deterministic favourite id makes a toggle one read and one write with
no query, and makes duplicates impossible. Favourites are read with an
equality filter and sorted in memory, which avoids a composite index a fresh
project does not have.

**Endpoints.**

| Method & path | Success | Errors |
|---|---|---|
| `GET /api/generations?limit=1..100` | 200 `{ items, source }` | 500, 503 |
| `POST /api/generations` | 201 `{ item, source }`, with the real document id | 400 `invalid_body` / `invalid_field`, 500, 503 |
| `DELETE /api/generations/:id?owner=` | 204 | 400 `invalid_owner`, 403 `forbidden`, 404 `not_found`, 500, 503 |
| `GET /api/favorites?owner=` | 200 `{ items, source }` | 400, 500, 503 |
| `POST /api/favorites` (toggle) | 201 `{ item, removed: false }` / 200 `{ item, removed: true }` | 400, 500, 503 |
| `DELETE /api/favorites?owner=&itemId=` | 204, idempotent | 400, 500, 503 |
| `GET /api/health` | 200 `{ status: "ok", database: "firestore", durable: true, latencyMs }`; without credentials outside production, 200 `{ status: "ok", database: "memory", durable: false, missing }` | 503 `degraded` (production without a database, or Firestore unreachable) |

Success bodies are unchanged from the original contract; every error is
`{ error, code }`. Other methods get the framework's 405.

**What this audit changed, and why:**

- **No silent data loss in production.** Without credentials the API used
  to fall back to server memory everywhere, so a misconfigured live
  deployment would answer 201 and lose the record on the next cold start. On
  the Vercel production deployment (`VERCEL_ENV=production`) a missing
  credential now returns **503 `database_unconfigured`**, naming the
  missing variables but never their values. Local dev, CI and preview keep the
  memory store so they run without secrets, and say so with a startup
  warning.
- **`/api/health`** proves the database answers (a real Firestore
  round-trip with its latency), not just that variables are set.
- **Validation.** Bounded lengths on every field. `kind` and `surface` are
  checked against real values. `src` and `poster` must be this site's own
  `/media/` files, because the library is shared and an arbitrary URL would
  let anyone inject content into it. `?limit` is clamped to 100, since an
  unbounded read is an unbounded bill. Owner ids are a safe character set:
  the API accepted any owner before, and requiring a format would have broken
  its callers.
- **500s no longer leak internals.** Clients get a message and a reference
  id; the cause goes to the server log.
- **Real deletes, with ownership.** A generation records who made it
  (`user:<handle>` signed in, else a random `device:<uuid>`), and only that
  owner can delete it. Sign-in is mocked, so this is advisory rather than
  authentication; with real auth, the owner would come from a verified
  session instead of the request.
- **Favourites are now a feature, not just an endpoint.** Previously nothing
  in the UI wrote a favourite. The heart on every feed card now saves to
  Firestore, stays visible once saved, and shows on the Profile. It
  deliberately has no local copy, so a heart that survives a reload can only
  have come from the database. It updates optimistically and rolls back on
  failure.
- **Deletes persist.** Deleting in the library used to hide the card until
  the next reload. Now your own synced generation is deleted in the backend
  (and the toast says "Deleted everywhere"), a local-only one is removed from
  this device, and samples or other people's work are hidden for you, which
  also sticks.
- **Record identity.** Local and remote copies of one generation were
  matched on kind + prompt + day, which merged two same-prompt generations
  into one. A local generation now stores the Firestore id the POST returns,
  and the library matches on it.

**Proven by tests (`e2e/persistence.spec.ts`):** the generation and
favourite tests write through the UI, **wipe the browser's own storage and
hard-reload**, and assert the record comes back from the server (a
generation from the studio carries a real 20-character Firestore id). The
delete test confirms through the API that the record is gone after a
reload. Run against the live URL, the suite also asserts via
`/api/health` that the store is Firestore. A contract test covers each 400,
the 403/404 ownership paths, idempotent deletes, the page bound and 405.

## Final hardening pass

Audited by tools, not by re-reading my own code.

- **Accessibility: 0 axe violations** (WCAG 2.2 A/AA) across all 29 routes
  and 13 interactive states in the audit: open overlays, modals, sheets,
  results, compare mode, the HUD and onboarding steps. The permanent tests
  re-check every route and five key states (catalog, palette, result with
  compare, JSON inspector, onboarding builder). The audit found, and this pass
  fixed:
  - **Hover contrast.** Every primary button darkened to `#7C3AED` on
    hover, and black text on it is 3.7:1, which fails AA in the hovered state
    everywhere. Hover now lifts to `#9B73F7` (6.2:1). The token was renamed
    `accent-deep` → `accent-hover`, since a "deep" token holding a lighter
    colour would mislead.
  - **Palette ARIA (critical).** The listbox contained list items and
    nested lists. It is now listbox → labelled groups → options, with
    `aria-activedescendant` so screen readers announce the highlighted
    command, and the highlight scrolls into view.
  - **Contrast by opacity.** Past contests were faded with `opacity-80`,
    pulling their badges to 3.5:1. "Past" is now carried by the badge and a
    muted title.
  - **Keyboard scrolling.** The studio canvas and the JSON inspector scroll
    on their own and are now focusable, so keyboard users can reach content.
  These now run as permanent tests (`e2e/a11y.spec.ts`, one per route, plus
  overlay states and a hover-contrast check), auditing settled states:
  mid-animation text is partly transparent by design.
- **Dialog behaviour.** The phone settings sheet had no Escape handler, and
  neither phone sheet moved or contained focus. One shared hook now gives
  every sheet and flyout the same behaviour: focus in, Tab contained, Escape
  closes, focus returns to the opener. On phones the settings panel is a real
  modal dialog (`role="dialog"`, `aria-modal`); on desktop it stays a side
  region.
- **Resizing with an overlay open.** Widening the window with a phone sheet
  open left the page scroll-locked behind a dialog that was no longer
  visible. Overlays now close when the viewport leaves their breakpoint.
- **Dependencies.** `npm audit` reported two moderate advisories, both
  through one transitive `uuid` inside `firebase-admin`'s Storage client,
  which this app never loads. They are resolved with a scoped override to
  the patched `uuid@11.1.1`: **0 vulnerabilities**.
- **Cleanup.** knip reports no unused files or exports. A throwaway audit
  script that slipped into an earlier commit was removed, and `.*.tmp.*` is
  now ignored.

## Account pages and link integrity

Reported from the live site: the account menu's **Profile** went to Assets
and **Settings** went to Pricing, stand-ins from the original rebuild, and
footer links went nowhere or to the wrong place.

**Profile (`/profile`)** shows only real data: an editable display name
(saved with the account); counts of generations, videos and images saved on
this device; your onboarding preset with **Open this preset**, which lands in
the studio with it applied; recent generations; and your favourites, count
and list, read from the database. (The first version left favourites out
because nothing in the UI wrote them yet; the heart on feed cards now does.)

**Settings (`/settings`)** has controls that do something. Account: display
name, email, plan, sign out. Preferences: **Reduce motion**, now a
persisted, app-wide preference (the old palette toggle was lost on reload),
the HUD, and re-running onboarding. **Your data**: the site sets no cookies,
so instead of a "Cookie settings" link it lists every key it keeps in local
storage, with a two-step clear for saved generations. Signed out, both pages
explain themselves rather than redirecting: there is still no auth wall.

**Links.** Of the footer's 44 entries, about 25 were buttons that only
showed a toast, and some links were wrong ("Seedance 2.5" went to Explore).
The footer now lists only destinations this app serves, each with an
explicit href; models link to the studio where they are the default.
Company pages, legal pages and social accounts that do not exist here were
cut, not faked. A sweep found the same dead buttons elsewhere. The pricing
footnotes now open the FAQ answer they ask about, "See all" on the Originals
page (already the full collection) is gone, and so are Community's social
buttons. A test fails if any page renders a link-shaped button that goes
nowhere, and every footer link is checked to return 200.

**Found while testing: the account menu hid under Explore's filter bar.**
The top bar and Explore's sticky toolbar were both `z-40`, and the toolbar
came later in the DOM, so it painted over the dropdown. It was masked
during the page's entry animation, whose transform contained the toolbar,
and appeared once the page settled, which is exactly when a user opens the
menu. The top bar is now `z-45`, with the full layer scale documented where
it is set. The regression test waits for the page to settle and checks
what is actually under the pointer; run against the unfixed build, it
fails.

## Signature Technical Innovations

Three features built to show engineering, with one rule held throughout:
generation here is simulated, so **every number the UI calls live is
measured in the browser**, and anything derived from config says so.
Inventing GPU telemetry would be the one thing a technical reviewer would
catch immediately.

### 1. Node canvas with spring-driven cables

- **Physics.** Each connection is a cubic bezier from an output port to an
  input port. The endpoints are exact; the two control points chase their
  resting positions on a damped spring (stiffness 180, damping 17,
  semi-implicit Euler with dt clamped to 1/30 s), so a dragged node pulls
  its cable into a bow that settles like a real lead. Cables leave from
  whichever side faces their target.
- **Off the React path.** The engine is a plain class
  (`components/sections/useCables.ts`) that writes path data straight to the
  DOM from a `requestAnimationFrame` loop. The loop runs only while a spring
  is moving and stops itself at rest, so idle cost is zero. Pointer moves
  are coalesced to one state update per frame.
- **Live instrumentation.** The toolbar shows the cable engine's own
  per-frame main-thread cost and the frame rate, measured from rAF
  timestamps, with dropped frames counted. It is written to the DOM through
  a ref, so measuring does not itself cause renders.
- **Node badges.** Output nodes show their connected-input count and a
  credit estimate from the Video studio's published rate. The estimate is
  labelled "est." because it is arithmetic, not a measurement.
- **Dragging.** The whole node header is the handle (grab cursor, lift
  shadow while held), not just its 14 px grip — reported from the live
  site, where grabbing a card by its title did nothing. The grab offset is
  kept, so a node travels exactly with the pointer instead of jumping on
  pickup. The grip remains the keyboard handle for arrow-key moves.
- **Reduced motion:** springs snap to rest and the flowing dashes stop.

### 2. Cinematic media stage

- **Preview pass vs final render.** A draggable split (pointer, touch or
  arrow keys; it is a real `role="slider"`). The preview side is a canvas
  holding the current frame at 1/8 resolution, upscaled by the browser with
  `image-rendering: pixelated`. There is one video decode, and the canvas
  redraws on `requestVideoFrameCallback`, exactly once per presented frame,
  never on a timer. With a real draft asset this becomes a source swap; the
  interaction and rendering path stay the same. Works on image results too.
- **Frame-accurate scrubbing.** The frame rate is measured from presented
  frames (median `mediaTime` delta), not assumed. The timecode is
  `HH:MM:SS:FF`. Previous and next frame buttons (and `,` `.`) land inside
  the target frame, and the seek slider steps one frame at a time.
- **Hover previews and scene markers.** After the page is idle, a hidden
  second video samples 24 frames into a single JPEG sprite. Hovering the
  track shows the nearest frame and its timecode. The same pass compares
  each sample with the previous one by mean luminance difference at 16×9;
  outliers (mean + 1.5σ) become scene-change markers, and `[` `]` jump
  between them. On the result clip it finds 2.
- **Fits the screen.** At laptop heights a full-width 16:9 player put its
  own controls under the prompt bar, found by the tests for this feature.
  The player's width is now capped by the height available.

### 3. Command matrix and performance HUD

- **Context-aware ⌘K.** A studio registers itself with a small external
  store while mounted, so the global palette gains a Studio group: **Copy
  prompt**, **Inspect generation JSON** (a syntax-coloured view of exactly
  what is configured, with Copy JSON), and one-step **looks** (Noir, Golden
  hour, Neon) that set four Cinema parameters at once. Outside a studio the
  group does not appear.
- **HUD, Shift+D or ⌘K.** A terminal-style panel. **Measured:** frame rate,
  mean and worst frame time (rAF); long tasks; LCP; CLS; slowest
  interaction (Event Timing); `/api/*` latency from Resource Timing; the GPU
  the browser renders with (WebGL renderer string); JS heap and network
  where the browser exposes them; viewport and DPR. **Studio · config:** the
  active surface's model and output specs, labelled as configuration.
  Nothing runs while it is closed. Shift+D is ignored while typing, since it
  is a capital D, and whether the HUD is open is remembered per viewer.

**Measured performance** (headless Chromium, desktop): cable updates cost
**0.24–0.33 ms per frame** over a sustained drag at **60 fps**; video
playback with the comparison layer redrawing every frame held **60 fps**
with a worst frame of **17 ms**.

**Tests:** eleven (one added later for dragging by the header). They cover bezier geometry and settling, reduced
motion, badge arithmetic, frame stepping to the exact frame, the filmstrip
preview, the split by keyboard and pointer, looks, prompt copy via the real
clipboard, the JSON contents, the HUD shortcut's typing guard, and real
`/api` latency in the HUD.

## Interactive Onboarding Innovation

**The old onboarding asked about you; the new one has you make something.**
The three-step profile quiz (role, level, goal) collected answers that
changed nothing you could see. It is replaced by a sandbox at the same
route (`/welcome-quiz`, where first sign-up already sends people): four
steps, about a minute, ending inside a studio that is already set up.

1. **Medium, one click.** Cinematic Video, Social AI Reel, 3D Game Asset or
   Product Ad, as picture cards that name the studio each opens. Picking
   one advances immediately. The selected card glows Electric Violet, which
   is consistent with the palette rules: here a card *is* the action.
2. **Prompt builder.** A subject to start from (editable), then three tag
   groups: camera angle, style and motion. Each tag adds words to a
   **live prompt** that rebuilds as you tap, with tag words highlighted, and
   shows exactly which studio controls it will set (Camera 35mm, Lighting
   Neon Night…). Tags toggle, so tapping one again clears it. **Surprise
   me** picks a subject and a tag from each group.
3. **Test render.** A three-second render on a canvas, not a spinner. The
   medium's still develops from 32 px blocks to full resolution, the same
   preview-pass idea as the studio's compare view. It is graded by the chosen
   style and moves the way the camera and motion tags say (a drone pan, a
   push-in, handheld drift; hyper-lapse speeds the move, whip-pan snaps at
   the end). A frame counter reads `Rendering test frame 041/120…`, and a
   cyan edge brightens toward completion. It all runs from one
   `requestAnimationFrame` loop that writes through refs.
4. **Open Workspace with This Preset.** Opens the matching studio with the
   prompt typed in and the controls set, and a toast says what was carried
   over.

**How the preset travels.** In the URL, as `?prompt=…&set=Label:Value`, so
it is shareable, survives a reload, and needs no hidden state. It is also
saved to `hf.onboarding` for later personalisation. The studio reads `set`
through `presetFromUrl` and **validates every value** against what that
control can actually hold: an unknown lens or ratio in a hand-edited URL is
ignored rather than putting the UI into a state it cannot show. Tags map
onto real controls only where the target studio has them (Cinema Studio's
Camera and Look pickers); elsewhere they shape the prompt alone.

**Where each medium goes.** There is no `/studio` route. Each medium opens
the studio built for it: Cinematic Video and Social AI Reel open Cinema
Studio (16:9, or 9:16 with a music-video film setup for reels), 3D Game
Asset opens 3D Jutsu, and Product Ad opens Marketing Studio in Image mode.

**Motion.** Step changes use `motion` (Framer Motion), because
direction-aware exit and enter (forward slides left, Back slides right) is
the one thing CSS cannot do cleanly. It uses the app's spring (stiffness
300, damping 30) and `useReducedMotion`, which turns slides into an instant
swap. It is **scoped to this route**: measured, the onboarding-only JavaScript
is 55.5 KB gzipped, and `motion` is absent from every other route's bundles.
The rest of the app stays on the CSS system below.

**Still honest.** The render is a styled preview of a stock still, and the
copy says so: "Graded and framed from your tags. Open the studio to
generate the real thing." Skip for now is always one tap away, and
onboarding still prompts only once per device.

**Tests (`e2e/onboarding.spec.ts`):** the full path from medium to studio,
checking the exact prompt and every control landed; reels opening vertical
and product ads opening Marketing Studio in Image mode; Surprise me and tag
clearing; URL presets validated rather than trusted; reduced motion. The
once-per-device test now completes the sandbox.

## Motion system

**CSS, not Framer Motion.** Every animation here runs as a CSS animation or
transition on `transform` and `opacity`, so the compositor runs it off the
main thread and it keeps going while React is busy. Framer Motion would add
tens of kilobytes of JavaScript and drive its springs from the main thread.
The one thing a library usually brings, real spring physics, is done here by
solving the spring numerically and sampling it into CSS `linear()` easing:

| Token | Spring | Behaviour |
|---|---|---|
| `--ease-spring` | stiffness 300, damping 30 (as specified) | ζ 0.87, 0.4% overshoot, settles in 460 ms |
| `--ease-lift` | stiffness 420, damping 24 | ζ 0.59, 10% overshoot, settles in 560 ms |

**What moves:**

- **Route entry:** each page fades and rises 10 px (`app/(shell)/template.tsx`,
  which re-mounts per navigation). It is filled `backwards`, not `both`: a
  finished animation leaving `transform` behind would make the page the
  containing block for fixed dialogs.
- **Staggered grids:** Explore, the home feed, Assets and Community rise in
  sequence, 45 ms apart, capped at 12 so long grids don't make you wait.
- **Media cards:** lift to 1.02 on the lift spring, with a violet edge glow.
  The glow is pre-rendered on `::after` and faded in; it used to animate
  `border-color` and `box-shadow`, which repaint every frame. There is no
  lift on touch screens, where hover would stick. The video Play overlay now
  fades and settles instead of popping, and leaves the accessibility tree
  while hidden.
- **Generate:** presses to 0.98. While working, a gradient light breathes
  behind the label under the existing sweep.
- **Create catalog and phone sheets:** slide in on the specified spring.
- **Loading:** a glass shimmer holds each feed card and the result player
  until the still has loaded. The media then fades in and the shimmer
  unmounts, so no infinite animation keeps running under loaded content.
- **Generation progress:** the frame counter reads `Frame 051 / 120`, and an
  ambient cyan edge brightens with the square of progress, quiet early and
  gathering near completion. The progress bar now grows by `scaleX`; it used
  to animate `width`, which relaid out every tick.

**Rules, enforced by tests (`e2e/motion.spec.ts`):** a test inspects
`document.getAnimations()` across Explore, a live generation and the Create
flyout, and fails if any keyframe animation touches a property other than
`transform` or `opacity`. Others check the stagger delays, the 1.02 hover
settle, the 0.98 press, the pulse, the brightening glow, spring easing on
sheets, and the shimmer being removed. The one deliberate exception is
short colour fades on hover and state changes (`transition-colors`): a
single repaint of one small element, not continuous motion. The canvas's
flowing cable dashes animate `stroke-dashoffset`, which has no compositor
equivalent.

**Reduced motion.** One global rule sets animation and transition durations
to near zero, and now also zeroes `animation-delay`, without which staggered
items would sit invisible for their delay. A test checks it.

**Measured** (headless Chromium, HUD frame meter): Explore holds **60 fps**
through the staggered entry with video blocked, and **CLS stays 0.003**.
With its four clips streaming it runs at 30 fps both on this branch and on
the pre-change production build, so that is headless software video
decoding, not the motion. Geometry tests now wait for entry motion to
settle before measuring (`e2e/helpers.ts`).

## QA audit of the live site

A scripted browser audit of the production deployment, measuring rather
than eyeballing: every route at 1440, 1024, 768, 390 and 375 px wide (135
page loads), then the interactive flows at desktop and phone sizes.

**Clean across all 135 loads:** no horizontal overflow, no element past the
right edge, no image or video drawn at a distorted aspect ratio, no touch
target under 44 px on phones, no console errors or failed requests. Every
one of the first 25 keyboard tab stops on Home shows a visible focus
indicator. Explore and Assets have working empty states. A generation posts
to the real API (201) and reports "Synced to cloud"; with the API forced to
fail it degrades to "Saved on device".

**Found and fixed:**

| # | Defect | Where | Fix |
|---|---|---|---|
| 1 | Create catalog stayed open after following a rail link, covering the new page | rail, desktop | Menus now remember the route they were opened on and are only open there, so any navigation closes them by construction — rail links, catalog links, the palette, the back button. Rail links also close it directly, for a click on the page you are already on |
| 2 | Menus could stack: the palette opened on top of the catalog | all overlays | Opening any menu, sheet or palette closes the others |
| 3 | The page scrolled behind the studio settings sheet, the palette and the catalog | phone + desktop | One counted scroll lock shared by every overlay, so nested overlays unlock only when the last closes; scrollbar width is padded back so nothing shifts |
| 4 | Toasts sat on top of the phone tab bar, and would cover the pinned Generate | phones | Toasts appear under the top bar on phones, bottom-centre on desktop |
| 5 | The palette's focus ring was clipped by its rounded top edge | palette | The palette's single field always holds focus while open, so it no longer draws a ring; the open palette is the cue |
| 6 | A feed clip opened on a second of black, so its card blinked on every 6-second loop | Home, Explore | Re-cut from the original, starting after the fade-in |
| 7 | On a 375×667 phone the pinned prompt bar and history strip took ~250 px, covering the page subtitle | studio, phones | History strip hidden on phones (Assets is one tap away) and the bar's top padding halved |
| 8 | The fourth starting-point chip wrapped onto its own row, half under the tab bar | Home, phones | Chips form one swipeable row on phones |

Checked and not a defect: three dark feed clips (average brightness 9–25
of 255) are dark footage, matching their posters.

Each fix has a test, and the new tests were first run against the
unfixed deployment to confirm they fail there — the catalog test found the
open dialog, the lock tests found the page scrolling, the toast test found
it 276 px too low.

## How it is verified

153 Playwright tests run against both the local build and the live
deployment: route health, no console errors or failed requests, layout shift
under 0.1 on every route (measured 0.003), 44 px touch targets, no horizontal overflow at phone and tablet
widths, and the interactions above asserting the state actually changes.
