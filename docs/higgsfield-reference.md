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

---

# Part 2 — App surfaces, from recon/ screenshots

Captured 2026-09-14 from 57 screenshots across 13 flows, taken signed in. Part 1 above was
scraped from the **logged-out** homepage, so this both extends and corrects it.

## 6. Corrections to Part 1

| Part 1 said | Screenshots show |
|---|---|
| Nav ends `Login` / `Sign up` | Signed in it ends: search, `Pricing` + pink `54% OFF` badge, `Enterprise`, `Assets`, bell, avatar ring |
| `Effects New` | `Effects Free` and `Genjutsu Free`. `New` is on `ChatGPT Plugin` and `3D Jutsu` |
| Product rail = "6-column" | 3 columns × 2 rows, not a single rail |
| Promo = "Sign up and get your extra discount" | Signed-in variant: "UNLIMITED NANO BANANA PRO / WITH PERSONAL 54% OFF", sub "7-day unlimited Nano Banana Pro, Nano Banana 2 and Kling 3.0", CTA "Get with 54% OFF" + live countdown "Discount expires in 2h 42m 48s" |
| (not captured) | **Top promo bar** above the header: lime→yellow gradient, `Offer expires in 02 h 42 m 49 s` pill, "Nano Banana Pro & 2 UNLIMITED on Max. Kling 3.0 Unlimited. Personal 54% OFF", dark "Get Unlimited with 54% OFF" button, dismiss ✕ |

Confirmed correct from Part 1: the lime `#d1fe17` accent, the dark surface ramp, the six
product tiles and their exact strings, and the hero card copy.

## 7. Nav mega-menu (hover on Image / Video / Audio)

Full-width dark panel, two columns:

- **Features** — rounded-square icon tile + title + one-line description
- **Models** — same, with `TOP` (pink) or `NEW` (lime) badge on the icon tile

Video → Features: Create Video, Cinema Studio, Faceless Studio, 3D Jutsu `NEW`, Shorts
Studio, Higgsfield Explainer, Canvas, Mixed Media, Edit Video, Higgsfield Reframe, Click to
Ad, Change Color Palette.
Video → Models: Seedance 2.5 `TOP`, Higgsfield Genjutsu `NEW`, Gemini Omni Flash 1.1, Kling
3.0, Kling Motion Control, FLUX.3 Video, MiniMax H3, Wan 3.0, Grok Imagine 1.5, Kling 3.0
Omni Edit, Sora 2, Google Veo 3.1, HappyHorse…

Image → Features: Create Image, Cinematic Cameras `TOP`, Canvas, Soul Moodboard, Soul ID
Character, AI Influencer, Photodump, Relight, Inpaint, Image Upscale, Face Swap, Character Swap.
Image → Models: Higgsfield Soul 2.0 `TOP`, Higgsfield Soul Cinema, GPT Image 2.5 Sunburst
`NEW`, GPT Image 2.5 Flare `NEW`, GPT Image 2 `TOP`, Seedream 5.0 Pro, Nano Banana 2 Lite,
Nano Banana Pro `TOP`, Recraft V4 Styles `NEW`, Recraft V4.1, Grok Imagine 2.0 `NEW`, FLUX.2,
Z-Image…

## 8. The generate workspace — THE critical path

Two-pane: fixed left control panel (~390px) + flexible right content. This is the screen the
rebuild lives or dies on.

**Left panel, top to bottom**
1. Tabs — `Create Video` · `Edit Video` · `Motion Control` (active = white text + underline)
2. Preset card — 16:9 thumbnail, `Change` pill top-right, `GENERAL` in **lime**, model name under it
3. Segmented control — `References` / `Extend Video`
4. Dropzone — circular icon buttons (image / video / audio), "Add references", "Image, Video or Audio"
5. Prompt textarea — greyed placeholder, chips below: `@ Elements`, `🔊 On`
6. `Model` row — value + chevron, e.g. "Seedance 2.5"
7. Setting pills — `5s` · `16:9` · `1080p`
8. `Bitrate` row — value `High` in lime + chevron
9. **Generate** — full-width lime button, black text, cost `✦ 80 45` (80 struck through)

**Right pane**
- Tabs `History` / `How it works`
- Display headline, uppercase, tight: "MAKE VIDEOS IN ONE CLICK"
- Sub: "250+ presets for camera control, framing, and high-quality VFX - or use the general preset for manual control."
- Three step cards: `ADD IMAGE` / `CHOOSE PRESET` / `GET VIDEO`, each with a caption
- Footer strip: "Don't know where to start?" / "Go to the Academy and start your journey"

**Tab variants**
- *Edit Video* — segmented `Prompt` / `Draw`; "Add a video to edit, Up to 30s"; "Add elements or references, Up to 50 image or audio"; right pane becomes a preset carousel ("RELIGHT & ATMOSPHERE") with ‹ › arrows and circular thumbnails
- *Extend Video* — adds a `Direction` select (`Sequel`)
- *Motion Control* — two upload tiles ("Add motion to copy" 3–30s, "Add your character"); `Model` Kling 3.0 Motion Control; `Quality` 720p; `Scene control mode` **toggle switch** (lime-green when on) with `Video`/`Image` segmented beneath; `Advanced settings` accordion; right pane "RECREATE ANY [MOTION] WITH YOUR IMAGE" with bracket-highlighted lime word, plus "Start by copying motion from library" 5-up vertical video grid

## 9. Onboarding

Split screen. Left half full-bleed looping video. Right half centred on near-black:
5 progress dashes at top (first lime), heading "What do you want / to achieve with Higgsfield?"
(second line grey), then a 2-column grid of 6 selectable cards, each icon top-left +
radio circle top-right + label bottom-left:
High-converting marketing · Create avatars & product visuals · Just exploring ·
Automate workflows with Supercomputer & MCP/CLI · Cinematic visuals & AI films ·
Viral content & UGC videos.
Footer: "We'll tailor features and AI tools to your goals".

## 10. Build implications

- The **left control panel is the reusable core** — Video, Image, Audio, Edit and Motion
  Control are all the same shell with a different field set. Build it once, drive it from config.
- Display headings are uppercase Space Grotesk; body is Inter. Confirms Part 1's font finding.
- Lime is load-bearing on exactly four things: active nav item, `GENERAL` preset label,
  the Generate button, and toggle-on states. Using it anywhere else will look wrong.
- Cost display uses a struck-through original next to the discounted price — a small detail
  that reads as authentic.
