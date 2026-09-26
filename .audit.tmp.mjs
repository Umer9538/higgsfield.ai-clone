import { chromium } from "@playwright/test";
import fs from "node:fs";
const B = process.env.B || "https://clone-eosin-nine-83.vercel.app";
const OUT = process.argv[2];
const ROUTES = ["/", "/explore", "/pricing", "/assets", "/enterprise", "/canvas", "/academy", "/community", "/contests", "/plugins", "/originals", "/mcp", "/chatgpt-plugin", "/supercomputer", "/login", "/signup", "/welcome-quiz", "/ai/video", "/ai/image", "/ai/audio", "/ai/edit", "/ai/motion-control", "/ai/genjutsu", "/ai/effects", "/ai/cinema-studio", "/ai/marketing-studio", "/ai/3d-jutsu"];
const VPS = { desktop: [1440, 900], laptop: [1024, 768], tablet: [768, 1024], mobile: [390, 844], small: [375, 667] };
const b = await chromium.launch();
const findings = [];
for (const [vp, [w, h]] of Object.entries(VPS)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 160)));
  p.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 160)));
  p.on("response", (r) => r.status() >= 400 && errs.push(`HTTP ${r.status()} ${r.url().replace(B, "")}`));
  for (const route of ROUTES) {
    errs.length = 0;
    await p.goto(B + route, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(({ w, mobile }) => {
      const out = { overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, offRight: [], clipped: [], stretched: [], small: [] };
      const label = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}[${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)}]`;
      const visible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0; };
      // Elements poking past the right edge, not inside a horizontal scroller
      for (const el of document.querySelectorAll("body *")) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 && r.left < w) {
          let a = el.parentElement, scroller = false;
          while (a) { const o = getComputedStyle(a); if (/(auto|scroll|hidden|clip)/.test(o.overflowX)) { scroller = true; break; } a = a.parentElement; }
          if (!scroller) out.offRight.push(`${label(el)} right=${Math.round(r.right)}`);
        }
      }
      // Text cut off without an ellipsis on purpose
      for (const el of document.querySelectorAll("button, a, h1, h2, h3, p, span, label, [role=tab]")) {
        if (!visible(el) || el.children.length > 2) continue;
        const s = getComputedStyle(el);
        const truncates = s.textOverflow === "ellipsis" || /line-clamp/.test(el.className) || s.webkitLineClamp !== "none";
        if (!truncates && (s.overflow === "hidden" || s.overflowX === "hidden") && el.scrollWidth > el.clientWidth + 2 && el.textContent.trim().length > 0) out.clipped.push(`${label(el)} ${el.scrollWidth}>${el.clientWidth}`);
      }
      // Media drawn with a distorted aspect ratio
      for (const el of document.querySelectorAll("img, video")) {
        if (!visible(el)) continue;
        const s = getComputedStyle(el);
        const nw = el.naturalWidth || el.videoWidth, nh = el.naturalHeight || el.videoHeight;
        const r = el.getBoundingClientRect();
        if (nw && nh && s.objectFit === "fill") {
          const d = Math.abs(nw / nh - r.width / r.height) / (nw / nh);
          if (d > 0.04) out.stretched.push(`${el.tagName} ${el.currentSrc?.split("/").pop()?.slice(0, 40)} ${(d * 100).toFixed(0)}%`);
        }
      }
      if (mobile) for (const el of document.querySelectorAll("button, select, [role=tab], a[role=button]")) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.height < 44 && r.top < window.innerHeight * 3) out.small.push(`${label(el)} h=${Math.round(r.height)}`);
      }
      out.offRight = [...new Set(out.offRight)].slice(0, 6); out.clipped = [...new Set(out.clipped)].slice(0, 8); out.small = [...new Set(out.small)].slice(0, 8);
      return out;
    }, { w, mobile: w < 768 });
    const issues = { ...r, errors: [...new Set(errs)] };
    const bad = issues.overflowX > 0 || issues.offRight.length || issues.clipped.length || issues.stretched.length || issues.small.length || issues.errors.length;
    if (bad) findings.push({ vp, route, ...issues });
    if (["/", "/ai/video", "/ai/cinema-studio", "/pricing", "/explore", "/assets", "/canvas", "/enterprise"].includes(route) && (vp === "tablet" || vp === "small" || vp === "laptop"))
      await p.screenshot({ path: `${OUT}/${vp}${route.replace(/\//g, "_") || "_home"}.png` });
  }
  await ctx.close();
}
fs.writeFileSync(`${OUT}/findings.json`, JSON.stringify(findings, null, 1));
console.log(`routes x viewports with findings: ${findings.length}`);
await b.close();
