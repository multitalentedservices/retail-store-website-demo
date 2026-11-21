# BUILD NOTES — Queue #13 · Retail Store Website Demo (pharmacy-style)
**Build:** "Sehat Bazaar Pharmacy" — fictional pharmacy-style retail store, Main Bazaar Road, Gujranwala (fictional demo address). Client-facing owner: BalanceBit Solutions · production: MTS · DEMO labelling on every page.
**Brief mapping:** seeded README — Retail catalogue site, "Clean Local" design system, Business tier (Pricing v3). Integrations as demo data: catalogue pages, WhatsApp enquiry (firing recorded locally), Google Maps (honest static placeholder — see below), reviews (fictional, labelled demo).

## Design identity — "Clean Local: Civic Blue register"
- Bright white ground, **royal blue #1D4ED8** primary (a hue no predecessor used), deep civic blue #1E3A8A for the banner/headings accents, light cool-grey surfaces #EEF2F7 / #F7F9FC, ink #17233B, muted #44597A. Semantic colours ONLY for stock states + form errors (green/amber/red badge pairs, all AA-proven in the battery).
- Type: **Figtree** (humanist sans, not used by any predecessor) — one family, weights 400/600/700/800.
- Distinctness vs predecessors: Clinic (#5) was white/petrol with Libre Franklin + Atkinson and a clinical appointment register; this build is a **retail catalogue** register — dense-but-calm product cards, price-forward, blue (not petrol-teal), search-led hero with a photo panel. Directory (#11) was newsprint/teal gazette; no newsprint, no masthead here. Nothing is shared with either beyond the "Clean Local" family name from the brief.
- §0 screenshot test: a dense product grid with PKR prices, stock badges and "Reserve for pickup" buttons could not belong to a clinic, directory or salon — it reads as a shop shelf.

## References actually used (fresh research, 2026-11-21)
1. **Boots (UK) catalogue pattern** — via prateeksha.com's pharmacy-design roundup and internetretailing.net's Boots web-effectiveness review (both opened 2026-11-21). Taken: category-led navigation with a consistent card anatomy (photo, name, pack, price, one action) on every card, and the review's warning applied in reverse — Boots was criticised for *inconsistent* category/card behaviour, so this build uses ONE card component everywhere (home featured, catalogue, related). No Boots branding, copy or claims copied.
2. **D.Watson (Pakistan pharmacy chain)** — dwatsongroup.com About page + its public category shape (opened via search 2026-11-21). Taken: the local category vocabulary a Pakistani pharmacy customer expects (Medicines-adjacent retail split into Vitamins & Nutrition, Personal Care, First Aid, Baby, Devices) and the "authentic local store" trust framing. No D.Watson branding, products or claims copied; its delivery/checkout model was NOT copied — this demo is catalogue + pickup reservation only.
3. Design Inspiration Library entries P1 (PillPack — benefit-led clarity) and P2 (Good Neighbor Pharmacy — local store as hero, locator-led) informed the home page's store-info strip; patterns only.

## Honesty rules applied (binding for this build)
- **Maps:** store page carries a dashed panel labelled "Map placeholder — demo" explaining a live embed would sit there in production. NO external embed, NO fake map image (Queue #11 precedent). Battery asserts no maps embed URLs exist in source.
- **No medical claims:** all 18 products are fictional generic wellness / personal-care / first-aid / baby-care / device items with descriptive, non-therapeutic copy. Battery asserts absence of a banned-phrase list (cures / treats / heals / miracle / guaranteed relief…). The honest retail line — "Prescription medicines are dispensed in-store only against a valid prescription and are not sold through this demo website" — appears on home, catalogue, product and store pages.
- **Not a checkout:** payment is "Pay at pickup — this demo takes no payment", stated on home, reserve page and the confirmation.
- **Banned feature claim:** no expiry-alert / FEFO / expiry-tracking wording appears anywhere; the battery asserts its absence from all source.
- **Reviews:** 4 fictional reviews, each name suffixed "(demo)", section headed "Fictional reviews — demo data".

## Architecture
- `js/logic.js` — ONE pure-logic module + ONE data object (STORE: products, stock, hours, reviews, slots) shared by the site and the Node battery (lessons 13/46). Stock is a single counter persisted in localStorage (`sb_stock`), decremented on reservation, restored on cancel — exercised across product → reserve → reservations surfaces (lessons 30/38).
- Pages: index (search-led hero, category tiles, featured, how-it-works, store strip) · catalogue (search + category + in-stock toggle + 4 sorts, live counts, URL state in sync — lesson 28, constraint-naming empty state with one-click reset) · product.html?id= (dynamic detail, stock-bounded stepper, WhatsApp enquiry prefilled + firing recorded — lesson 21) · reserve (basket with stock-bounded steppers, name/PK-phone validation with named errors + live clearing — lessons 25/26, deterministic ref) · reservations (list + cancel-restores-stock) · store (hours vs printed fixed demo clock Sun 22 Nov 2026 11:30 AM — lesson 29; Sunday row highlighted; boundary in the data — product id 3 sits exactly AT the low-stock threshold of 5, lesson 41; Sunday closes 2:00 PM, battery proves 1:59 PM open / 2:00 PM closed).
- Media: 7 generated photos (hero interior + storefront + 1 per category, lesson 32), one consistent bright retail style, compressed under a hard ≤120 KB ceiling BEFORE referencing (lesson 39): total 554,740 B. **Video: none — photo + CSS motion** (Ken Burns hero, disabled under reduced motion; video generation region-blocked 403, not attempted).

## Fix-iterate cycles during QA (all caught by reading captures / flow evidence)
1. Screen-reader hero label positioned at left:-999px tripped the overflow audit → replaced with a clipped `.vh` class; audit excludes `.vh` leaves (disclosed in shoot.js).
2. 320px probe: tile name "Vitamins & Supplements" overflowed its half-width tile by 8px → smaller tile padding + name size at ≤420px; re-probed clean.
3. Quantity stepper wrecked on phone: the global `input{width:100%}` field rule beat `.qty-input` on specificity (lesson 16) → scoped `.qty-row .qty-input{width:84px}`; re-captured clean.
4. Confirmation left the form visible underneath: `.res-form{display:grid}` defeated the `hidden` attribute (lesson 44 class) → global `[hidden]{display:none !important}` + total row hidden on confirm; flow re-run 19/19.
5. Empty-basket reserve page still showed a "Basket total PKR 0" row → total row now hides with the empty state.

## Test battery amendment (disclosed)
- One assertion amended inline in tests.js: search "vitamin" expected 3 → corrected to 4, because the search also matches the category name "Vitamins & Supplements" (Omega-3 matches via its category). The shipped semantics are the correct ones; the first-draft expectation was wrong.

## Evidence index
- tests.js + tests-output.log — 141 PASS / 0 FAIL.
- screenshots/ — 18 standard combos + probe320 + nojs (18) + reduced (18), all audits clean; screenshots/flows/flow-log.txt — 19/19 PASS; screenshots/keyboard/keyboard-walk.md.
- Signoff-Pack.md (Area 1) · Performance-Pack.md (Area 7).
