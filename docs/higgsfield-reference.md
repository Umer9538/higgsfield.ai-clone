# Higgsfield.ai — Reference Spec

Captured 2026-09-14 from live DOM + stylesheets (not from memory or a summary).

## 1. Their actual stack

| Layer | What they use | What we use |
|---|---|---|
| Framework | TanStack Start (SSR) | Next.js App Router |
| Styling | Tailwind v4 (`grid-cols-*`, `rounded-*` in DOM) | Tailwind v4 — same |
| Auth | Clerk (`clerk.browser.js` v6.25.10) | mocked auth boundary |
| Images | Cloudflare `/cdn-cgi/image/` resizing, WebP, srcset 384/640/1280/1920 | `next/image` |
| Fonts | `inter-latin-100-900.woff2`, `space-grotesk-latin-300-700.woff2` | `next/font` local |

## 2. Design tokens (measured, not guessed)

**Accent is lime `#d1fe17`** — 113 uses. (Secondary lime `#9de500`, muted `#829b19`.)

Surfaces, darkest→lightest: `#000` · `#0f1113` · `#131416` · `#131517` · `#1a1a1a` · `#1c1e20` · `#23262a` · `#292b2c` · `#424242`
Text: `#fff` primary · `#a8a8a8` / `#828282` secondary
Status/badges: `#ff005b` `#ed1572` `#ff6568` `#fb2c36` `#fabc00` `#ffd237` `#f69e00` `#9ce6f3`

Type: Inter (body) + Inter Display + Space Grotesk (display) + IBM Plex Mono (code/MCP)
Header height: `4rem` mobile, `5rem` at `md`
Breakpoints: stock Tailwind 40/48/64/80rem, plus custom 120rem + 158rem ultrawide
Radii in use: `lg`, `xl`, `2xl` dominate; custom `rounded-q`

## 3. Section order (verbatim, document order)

1. **Header** — logo `Higgsfield` · Explore · Image · Video · Audio · MCP · ChatGPT Plugin `New` · Genjutsu · Effects `New` · Cinema Studio · Marketing Studio · Supercomputer · 3D Jutsu `New` · Edit · Academy · Community · Contests · Plugins · Canvas · Originals · Pricing · Enterprise · **Login** · **Sign up**

2. **Hero — 5 autoplay video cards**, each with `Open <name>` CTA:
   - Higgsfield AI Motion Designer — "ChatGPT can now do motion design in After Effects."
   - Higgsfield Effects — "Viral video presets now in ChatGPT, with free generations"
   - Higgsfield Genjutsu — "One upload in. Endless new visions out."
   - GPT Image 2.5 Sunburst — "Sharper edits with more natural light and texture"
   - HIGGSFIELD × GPT-6 ASTRA — "Turn a single prompt into a playable 3D game. Story, mechanics, and every asset included"

3. **Promo banner** — "Sign up and get your **extra discount**" · bullets: "Get unlimited Nano Banana Pro", "Access to Seedance 2.5" · CTA "Get your discount"

4. **Product rail (6 tiles, badged)** — Seedance 2.5 `Top`/`Video` "The most advanced video model" · Nano Banana Pro `Image` "Generate high-quality visuals" · Higgsfield Genjutsu `New` "One video, many versions" · MCP & CLI "Turn Claude into a creative engine" · Cinema Studio 4.0 "Create cinematic scenes effortlessly" · Supercomputer "Agent powered by GPT-6 Astra"

5. **MCP band** — "Higgsfield MCP with GPT-6 ASTRA" (letters are individually wrapped spans → per-char animation). Sub: "Build games, motion graphics, and interactive 3D experiences with Higgsfield MCP". CTAs: "Install Higgsfield plugin" · "Explore use cases"

6. **Visual Effects** — "Big-budget visual effects, from explosions to surreal transformations." CTA "Start generating". Grid `grid-cols-2 md:grid-cols-3`, 15 presets each with hover `Recreate`: Floating fall, High flip, Burning man, Studio slide, Incline, Act natural, Eyes in, Street colossus, Melting, Wild ride, Cutout, World morphing, Smash and grab, Selfception, Lacewalker. Footer CTA "View all presets".

7. **Genjutsu feature** — eyebrow `New model` · "Reality Manipulation — transfer motion into new scenes, or swap details while everything else stays as filmed." CTAs "Start generating" · "Learn more"

8. **Seedance 2.5** — "The most advanced AI video model" · "View all of Seedance 2.5"

9. **Genjutsu detail** — "Take the motion and recast it with your characters, locations, and products, or swap specific elements while keeping the rest untouched."

10. **Community carousel** — "Explore the inside of every project" / "See all prompts, assets, and how each project was created". 8 items, all `by Higgsfield Studio`, `Public` badge, avatar `H`: "If you stop loving me, I'll die — I don't like dying, but for our love I'm ready to go that far", Cully Hill Boys, Red Flag, Kok Boru, Adiliada, ONEIRIC, ZEPHYR: Special, HELL GRIND. CTA "Explore community".

11. **Supercomputer band** — "One superagent for your entire creative stack" · "Try Supercomputer"

12. **Footer** — "© 2026 Higgsfield, Inc." / "All rights reserved." · Help center · Cookie Notice · Terms · Privacy

## 4. Media budget
6 `<video>` (hero cards + promo), 55 `<img>`. All hero video autoplays muted/looping — must respect `prefers-reduced-motion` (they ship 37 such rules).

## 5. Fidelity risks
- Assets are CDN-hosted and will hotlink-break → mirror locally into `public/`.
- Per-character animated "GPT-6 ASTRA" wordmark is a distinctive detail worth reproducing.
- The lime-on-near-black contrast is the signature; getting `#d1fe17` exact matters more than any layout detail.
