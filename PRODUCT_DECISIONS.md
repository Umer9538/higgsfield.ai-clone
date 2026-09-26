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
| Card radius | `rounded-xl` | one step rounder — `rounded-2xl` / `rounded-3xl` |
| Floating chrome | Solid dark panels | Glass: translucent fill, backdrop blur, hairline highlight |

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

### Layout hierarchy

- **Hero**: the reference runs five equal cards in a row, so nothing leads.
  Ours is an asymmetric split — one editorial lead panel with four supporting
  tiles — so there is a clear first thing to look at.
- **Explore rails** clamp to a whole number of rows and taper into the page
  with a centred call to action, rather than cutting a card mid-frame.

---

## What we cut

- **Redundant banner clutter.** The reference stacks a promo bar, an in-page
  discount panel and a floating festival card on some screens. We keep one
  promo surface per page.
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

61 Playwright tests run against both the local build and the live
deployment: route health, no console errors or failed requests, zero layout
shift, 44 px touch targets, no horizontal overflow at phone and tablet
widths, and the interactions above asserting the state actually changes.
