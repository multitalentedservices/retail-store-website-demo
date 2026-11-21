# PERFORMANCE PACK — Queue #13 · Retail Store Website Demo
**Measured on disk, 2026-11-21. No estimates. Served Core Web Vitals: PENDING** — to be measured by the main agent on the served GitHub Pages preview; no CWV numbers are claimed or invented here.

## Code weight (HTML+CSS+JS, all pages)
| File | Bytes |
|---|---|
| index.html | 6,001 |
| catalogue.html | 4,371 |
| product.html | 2,630 |
| reserve.html | 4,640 |
| reservations.html | 2,872 |
| store.html | 5,151 |
| css/style.css | ~12,500 |
| js/logic.js | 12,734 |
| js/app.js | ~21,300 |
| **Total code** | **72,020 B** (budget < 400 KB — 18% of budget) |

(Per-file figures as written; the battery re-measures the total on every run and fails above 400 KB.)

## Media weight (per-image, hard ceiling ≤120 KB enforced before referencing — lesson 39)
| Image | Bytes | Role |
|---|---|---|
| assets/hero.jpg | 102,202 | Home hero (pharmacy interior) |
| assets/storefront.jpg | 104,585 | Store page |
| assets/cat-vitamins.jpg | 79,371 | Category family — Vitamins & Supplements |
| assets/cat-personal.jpg | 63,791 | Category family — Personal Care |
| assets/cat-firstaid.jpg | 73,017 | Category family — First Aid |
| assets/cat-baby.jpg | 61,180 | Category family — Baby & Mother Care |
| assets/cat-devices.jpg | 70,594 | Category family — Health Devices |
| **Total media** | **554,740 B** (budget ≤ 1.6 MB — 34%) |

## Discipline choices
- Zero frameworks, zero CDN libraries; the only external request besides same-origin files is Google Fonts CSS (Figtree) with preconnect + display=swap.
- One CSS file, two JS files; the logic module is shared with the test battery (no duplicate data payload).
- Per-category visual system (lesson 32): 5 photos cover all 18 product cards; card images `loading="lazy"`, hero `fetchpriority="high"`.
- No sticky/fixed chrome except the transient basket toast (auto-dismisses) — full-page captures carry no stitch artefacts (lesson 35).
- Motion: one Ken Burns hero animation, disabled under `prefers-reduced-motion` (reduced-motion capture set filed).
- Video: none — photo + CSS motion (generation region-blocked 403, not attempted).

## Served CWV
PENDING — external measurement on the main agent's GitHub Pages preview (LCP / INP / CLS). Area 7 of the scorecard is held at partial points for exactly this reason.
