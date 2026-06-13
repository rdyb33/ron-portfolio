# Ron Bulischeck — Portfolio Landing Page

An awards-grade, single-page portfolio for Ron D. Bulischeck III — Process &amp; Automation
Engineer with a UI/UX sensibility. Built as a fully self-contained static site (no build step).

## Highlights

- **Interactive WebGL hero** (Three.js) — a live node-network constellation in Ron's
  orange/cyan palette, representing connected automation systems. Reacts to pointer movement,
  pauses when off-screen, and degrades gracefully (single static frame on reduced-motion, hidden
  if WebGL is unavailable).
- **GSAP + ScrollTrigger** — masked intro animation, word-by-word headline reveals,
  scroll-batched section reveals, animated metric counters, scrubbed image parallax, custom
  cursor, and an infinite skills marquee.
- **Real content** — pulled from the resume: experience, $3.6M / $1.6M / 6-FTE / $1M-yr metrics,
  capabilities, and a filterable gallery of 57 real project photos with a keyboard-navigable
  lightbox.
- **Fully responsive** — desktop / tablet / mobile layouts, full-screen mobile menu, no
  horizontal overflow. Honors `prefers-reduced-motion`.

## Run locally

```bash
# from this folder
python -m http.server 8098
# open http://localhost:8098
```

Any static file server works — there is no build step.

## Structure

```
index.html          # markup + content
css/styles.css      # full design system + responsive rules
js/hero.js          # Three.js node-network hero
js/main.js          # preloader, cursor, nav, GSAP reveals, gallery, lightbox
vendor/             # Three.js (r149), GSAP, ScrollTrigger (vendored locally, offline-safe)
assets/img/projects # automation / design / 3d-prints photos
favicon.svg
```

## Deploy to Cloudflare Pages (Git-connected)

This repo is a static site — **no build step**. In the Cloudflare dashboard:

1. **Workers &amp; Pages** → **Create** → **Pages** → **Connect to Git**, pick this repo.
2. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
3. **Save and Deploy.** Every push to the default branch auto-deploys.
4. **Custom domains** → add `bulischeck.com` (DNS auto-configures since it's on Cloudflare).

## Images

Project photos are optimized WebP (max 1920px, ~6 MB total, down from ~118 MB). Originals are
preserved in `../ron-portfolio/public/images`. To re-optimize after adding photos, re-run a
Pillow pass (max side 1920, quality 80) and reference the `.webp` files.

## Tech

Vanilla HTML/CSS/JS · Three.js · GSAP (ScrollTrigger) · Space Grotesk / Inter / JetBrains Mono.
