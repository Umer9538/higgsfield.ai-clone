# Product decisions

This started as a faithful rebuild of higgsfield.ai. For the submission it
takes its own direction: a distinct visual identity, a real backend, and a
set of cuts made on purpose. This file records what changed and why.

---

## What we changed

### Visual identity

| | Reference | Ours |
|---|---|---|
| Primary accent | Lime `#d1fe17` | **Electric Violet** `#8B5CF6` |
| Accent text on dark | Lime | Violet tint `#A78BFA` |
| State and focus | Lime | **Neon Cyan** `#06B6D4` |
| Radius | `rounded-xl` everywhere | a three-step scale: controls `12px`, media `18px`, panels `24px` |
| Floating chrome | Solid dark panels | Glass: translucent fill, backdrop blur, hairline highlight |
| Type | One grotesque, uppercase display | **Bricolage Grotesque** headlines, **Instrument Sans** body, sentence case |
| Surfaces | Neutral greys | Ink tinted a few degrees toward violet (`#07060b` → `#231f30`) |

Two colours with two jobs. **Violet is the brand** — primary buttons, badges,
the footer block. **Cyan is state** — what is selected, focused, configured
or live. Keeping them apart means a glance tells you whether something is a
call to action or a status, which one accent colour could not do.

**Contrast drove the split between violet and its tint.** `#8B5CF6` on the
surface colour only reaches about 4.5:1 — borderline for body text. The
`#A78BFA` tint clears 6.9:1, so text uses the tint and fills use the full
tone. Black text on a violet button sits at 5.0:1, above AA.

The token was renamed from `lime` to `accent` across 49 files. A class called
`text-hf-lime` rendering violet would be a trap for the next person.

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
- **Ink, not grey.** Surfaces carry a slight violet cast, so the accent
  belongs to the palette instead of sitting on top of it.
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
reading order and released on scroll. Remix navigation is back to about
**200 ms**.

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

## How it is verified

74 Playwright tests run against both the local build and the live
deployment: route health, no console errors or failed requests, zero layout
shift, 44 px touch targets, no horizontal overflow at phone and tablet
widths, and the interactions above asserting the state actually changes.
