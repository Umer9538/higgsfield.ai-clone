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
| Hover / pressed | `hf-accent-deep` | `#7C3AED` | primary hover |
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
palette, popovers. Gradient borders are only on the two composers: violet
light fading out at rest, turning cyan while you type, with a second pixel
of outline so the surface itself is a 2px focus indicator. The one ambient
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
  on a screen — the home composer and the studio prompt bar. Hover glows are a soft
  violet shadow under the card with a tinted edge, on media cards only;
  controls get a press-in scale instead. Glass is for things that float:
  dialogs, the palette, popovers.

### Generate is the signature moment

Everything else is restrained so this can be loud:

- The button is a lit gradient with a violet glow, and it presses in
  (`scale 0.97`) on click. While busy, a band of light sweeps across it.
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

**Tests:** ten new ones. They cover bezier geometry and settling, reduced
motion, badge arithmetic, frame stepping to the exact frame, the filmstrip
preview, the split by keyboard and pointer, looks, prompt copy via the real
clipboard, the JSON contents, the HUD shortcut's typing guard, and real
`/api` latency in the HUD.

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

89 Playwright tests run against both the local build and the live
deployment: route health, no console errors or failed requests, zero layout
shift, 44 px touch targets, no horizontal overflow at phone and tablet
widths, and the interactions above asserting the state actually changes.
