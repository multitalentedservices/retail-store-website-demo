# SIGNOFF PACK (§0) — Queue #13 · Retail Store Website Demo
**For:** AICOS-112 §0 design sign-off recording (external act — pending; this pack is the build-side evidence).
**Build:** Sehat Bazaar Pharmacy (fictional) · client-facing owner BalanceBit Solutions · production MTS · Date: 2026-11-21.

## Design direction note
"Clean Local — Civic Blue register." A neighbourhood pharmacy catalogue that behaves like a well-run local shop shelf: search first, categories as picture tiles, dense-but-calm product cards where price + pack + live stock state are always visible, and one conversion path (reserve → pickup → pay at counter) explained in three steps on the home page. The design deliberately avoids the clinical register (no appointment language, no petrol-teal) and the gazette register (no newsprint, no masthead): this is retail — bright, priced, countable. The §0 screenshot test: prices, stock badges and "Reserve for pickup" buttons on a blue/white grid could not be mistaken for a clinic, directory, salon or any other predecessor industry.

## References actually used
| Reference | Opened | What was taken (pattern only) |
|---|---|---|
| Boots catalogue pattern via prateeksha.com pharmacy-design roundup | 2026-11-21 (search + fetch) | Category-led IA; one consistent card anatomy (photo/name/pack/price/action) |
| internetretailing.net — Boots web-effectiveness review | 2026-11-21 (search) | The negative lesson: inconsistency between category pages destroys trust → one card component on all surfaces |
| D.Watson Group (dwatsongroup.com/About) | 2026-11-21 (search) | Pakistani pharmacy category vocabulary + local-store trust framing; NOT its checkout/delivery model |
| Design Inspiration Library P1 PillPack / P2 Good Neighbor Pharmacy | library, researched 2026-11-21 | Benefit-led clarity; local store as hero (store-info strip on home) |

No branding, copy, product data or feature claims were copied from any reference.

## Palette / type token table (complete — the only colours in the build)
| Token | Hex | Role |
|---|---|---|
| --blue | #1D4ED8 | Primary: buttons, links, accents, focus outline |
| --blue-dark | #1E3A8A | Demo banner, hover, category labels, today-row text |
| --blue-soft | #DBEAFE | Current-nav fill, today-row fill, focus ring on fields |
| --ink | #17233B | Body text, headings, toast background |
| --muted | #44597A | Secondary text |
| --surface | #EEF2F7 | Cool-grey surface (map placeholder, chips) |
| --surface-2 | #F7F9FC | Alt section / filter panel ground |
| --line | #C9D4E3 | Borders/dividers |
| --ok / --ok-bg | #166534 / #DCFCE7 | SEMANTIC ONLY: in-stock badge, open chip |
| --warn / --warn-bg | #92400E / #FEF3C7 | SEMANTIC ONLY: low-stock badge, notice, review stars |
| --out / --out-bg | #991B1B / #FEE2E2 | SEMANTIC ONLY: out-of-stock badge, closed chip |
| --error | #B91C1C | SEMANTIC ONLY: form error text |

Type: Figtree (Google Fonts) 400/600/700/800, system fallbacks; base 17px; inputs 16px (no iOS zoom). Radius 14px cards / 10px controls. All 17 text pairings proven ≥4.5:1 (focus ≥3:1) from hex in the battery.

## Component system (one of each)
Buttons: `.btn` + primary (filled blue) / ghost (line border) / wa (blue outline) roles — identical on all 6 pages. Fields: one 52px-min-height, 2px-line-border system for text/tel/search/number/select + one native checkbox line. Cards: one product card (media 4:3, category eyebrow, name, pack, price+badge row, full-width action). Badges: one pill, three semantic states computed from the stock counter.
