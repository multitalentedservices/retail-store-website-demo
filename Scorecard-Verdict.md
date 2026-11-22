# VISUAL QUALITY SCORECARD — VERDICT
Build: Sehat Bazaar Pharmacy — Retail Store Website Demo (Queue #13) (client-facing owner: BalanceBit Solutions · production: MTS)
Build type / builder: Business Website Build (AICOS-105 pattern) · Preview URL: local file build (served preview pending — main agent)
Date of pass: 2026-11-21 · Scored by: AICOS-115 pattern · Pass #: 1

 1. Visual identity & originality   13 / 15   Evidence: Signoff-Pack.md filed (design direction, references actually used, full token table); desktop + phone captures read against it. Held 2 pts: AICOS-112 §0 sign-off RECORDING is an external act, not yet done.
 2. UI/UX & usability               14 / 15   Evidence: full flow run 19/19 (screenshots/flows/flow-log.txt) incl. error + empty states; the one conversion path (catalogue → product → basket → confirm) completed unaided in the rendered run. 1 pt margin held on judgement.
 3. Typography & composition        10 / 10   Evidence: Figtree pairing as specified in Signoff-Pack; hierarchy/spacing read in all 18 standard captures at 390/768/1440.
 4. Animation & interactions         9 / 10   Evidence: interaction inventory observed in captures + flows (filters, steppers, toasts, confirmation focus); Ken Burns hero disabled in the reduced-motion set (18 captures). 1 pt margin: a single restrained motion pattern by design.
 5. Responsive design                10 / 10   Evidence: 18 standard combos + 320px probe + nojs/reduced sets — 0 overflow / 0 leaf text-overflow / 0 broken images in every audit (screenshots/*/audit.json).
 6. Functionality                    15 / 15   Evidence: battery 141/141 (tests-output.log); rendered flow 19/19 with WhatsApp FIRING recorded in the local log (lesson 21), reservation RS-DEMO-5055 at PKR 1,980 exact, stock boundary pair in rendered content, cancel-restores-stock before/after captures.
 7. Performance                       6 / 10   Evidence: Performance-Pack.md — measured code 72,020 B, media 554,740 B / 7 photos (max 104,585 B). Held 4 pts: served-preview CWV (LCP/INP/CLS) is PENDING the main agent's GitHub Pages measurement; no numbers invented.
 8. Accessibility                     5 /  5   Evidence: 17 contrast assertions computed from hex in the battery (all ≥4.5:1, focus 6.29:1 ≥3:1); keyboard walk filed (screenshots/keyboard/keyboard-walk.md) — visible focus at every stop on catalogue filters, quantity stepper and reservation form; all controls native (lesson 34); primary targets ≥44px.
 9. SEO                               5 /  5   Evidence: unique title/meta per page (battery-asserted), semantic heading order, sitemap.xml + robots.txt, internal linking per IA, alt text on every image.
10. Security                          4 /  5   Evidence: no secrets/credentials in source (battery-asserted), zero live endpoints, no external embeds, demo data only in localStorage; no packages installed (nothing to vet). 1 pt held: a localStorage demo has no server-side spam/abuse surface to audit — the control is absence, recorded honestly.

TOTAL: 91 / 100   (target ≥ 90)

BLOCKING FAILURES (security / data integrity / functionality):
- None.

UNTESTED AREAS (score invalid without evidence):
- None build-side. Two EXTERNAL acts remain and are named, not scored around: (1) served-preview CWV measurement (Area 7, 4 pts held); (2) AICOS-112 §0 sign-off recording (Area 1, 2 pts held).

VERDICT:  [ ] APPROVE   [X] REJECT   [ ] REJECT — BLOCKED   [ ] REJECT — INCOMPLETE
Reasons: total 91 ≥ 90 with no blocking failure and no untested build-side area; the verdict stays REJECT under the owner's 100-bar standard until the two external acts above are recorded — the same position as Queues #11 and #12. No build defects outstanding.
Next step: [X] To AICOS-025 release gate (with external acts named)   [ ] Back to Gate 5   [ ] Back to Gate 2

## COMPONENT-CONSISTENCY PASS (done-gate — one line per page, read from rendered captures AFTER fixes + re-capture)
- **index (home)** — PASS. One button system (filled-blue primary on search + all 4 featured cards; ghost role unused here by design), category tiles one anatomy, stock badges one pill in three semantic states, open-chip identical in header/hero/store strip, spacing rhythm consistent section to section. Read from index-phone.png + index-desktop.png.
- **catalogue** — PASS. The same card component as home (verified side-by-side: eyebrow/name/pack/price+badge/full-width button); filter panel uses the one field system (search/select/checkbox all labelled, 52px); out-of-stock card (Omega-3) drops the button and prints the reason in the same slot — a state of the component, not a second component. Read from catalogue-phone.png + catalogue-desktop.png.
- **Coordinator fix (2026-11-21) — disabled-button state.** Defect found by the coordinator: the out-of-stock Omega-3 card printed "Out of stock — reserving is disabled for this item" but presented no reserve control in a visibly disabled state of the one button system (the only disabled rule in the CSS was a faint `opacity:.55`, and no disabled button was rendered) — a disabled control must read as disabled at a glance. Fix: (1) `css/style.css` — the `.btn[disabled]` / `.btn:disabled` state is now a solid state of the same system (same size/radius/height): muted grey ground `--disabled-bg:#E2E8F0`, muted text `--disabled-text:#44597A` (5.76:1 — readable, no opacity fade), `--line` border, `not-allowed` cursor, and hover explicitly cannot revive the active colours; (2) `js/app.js` — the out-of-stock card now renders the reason note PLUS a real `disabled` "Reserve for pickup" button in the same slot (superseding the "drops the button" wording above), and the out-of-stock product detail (id=4) now renders a real `disabled` "Add to pickup basket" button beside the still-active WhatsApp action. Basket/product steppers do not use disabled buttons (they validate at bounds with named errors) and are unchanged. Re-captured: all 18 standard combos via shoot.js (catalogue + product id=15 at 390/768/1440 included) plus product id=4 at 390/768/1440 and a catalogue 320px probe — every audit 0 overflow / 0 leaf text-overflow / 0 broken images. Computed-style proof on catalogue-phone: disabled button bg rgb(226,232,240), text rgb(68,89,122), cursor not-allowed, height 62px / radius 10px — identical geometry to the active button (bg rgb(29,78,216) #1D4ED8, unchanged). New catalogue-phone.png read by the fixer: the Omega-3 button now reads as disabled at a glance while all active buttons are unchanged. Battery re-run: 141 PASS / 0 FAIL (no assertions amended — the battery asserted no button styling). Score unchanged: 91/100.
- **product (detail, id=15 + flow id=3)** — PASS after fix. Stepper initially broke on phone (global field width beat the qty-input class — specificity, lesson 16); fixed, re-captured: label/−/input/+ now one row, input matches the field system, primary + WhatsApp-outline actions match catalogue button roles, error text in the one error colour. Read from product-phone.png (post-fix) + flows/flow-qty-boundary.png.
- **reserve** — PASS after fixes. Basket steppers reuse the product-page stepper anatomy; form fields identical to catalogue filters (labels above, errors below in --error, live clearing proven in flow); confirmation initially left the form visible ([hidden] defeated by display:grid — fixed globally, re-captured clean) and the stale PKR 0 total row now hides with the empty state. Read from reserve-phone.png + flows/flow-confirmation.png (post-fix).
- **reservations (My Reservations)** — PASS. Reservation cards reuse the badge pill for status (Reserved/Cancelled), totals in the same price treatment, cancel is the ghost button role used elsewhere; empty state matches the catalogue empty-state anatomy (dashed panel + link). Read from reservations-phone.png + flows/flow-my-reservations.png.
- **store** — PASS. Hours table one system (today row in blue-soft with blue-dark text, AA-proven), info cards identical to home's store strip cards, map placeholder honestly labelled in the muted surface treatment, review cards one anatomy with stars in the single semantic amber. Read from store-phone.png + store-desktop.png.

## Key evidence numbers
- Tests: 141 PASS / 0 FAIL (tests-output.log) — incl. 17 contrast assertions from hex, stock threshold boundary in the data, quantity boundary pair, ref determinism, banned-wording absence (expiry/FEFO + medical-claim list), link integrity, weight budgets. One assertion amended + disclosed inline (search "vitamin" 3→4).
- Flow run: 19/19 PASS (screenshots/flows/flow-log.txt) — empty state naming the constraint + reset; stock+1 rejected with named content; WhatsApp firing logged; bad-phone error content + live clear; confirmation **RS-DEMO-5055, PKR 1,980 exact**; stock 5 → 3 on reserve, 3 → 5 on cancel (before/after captures); basket stepper boundary named.
- Captures: 18 standard + 1 probe320 + 18 nojs + 18 reduced + 10 flow + 3 keyboard = 68 PNGs; every audit 0 overflow / 0 leaf text-overflow / 0 broken images / 0 hidden sections.
- Index captures (owner rule): screenshots/index-desktop.png = 1440×2575 · screenshots/index-phone.png = 390×5298 (full-page, measured).
- Video: none — photo + CSS motion (generation region-blocked 403, not attempted).

## Addendum — Round-2 Re-verification FIX RUN (2026-11-22)

Independent round-2 re-verification (`Reverification-2026-11-21/round2/REPORT.md`) found 2 visible
+ 1 minor defect on this site. All three FIXED, re-shot and read; battery **141 PASS / 0 FAIL**
unamended after fixes:

- **RS-1 (visible) — Product page content flush at left=0 on phone.** Root cause is the
  shorthand trap in its purest form: `<main class="wrap section">` and `.section{padding:2.4rem 0}`
  zeroed the wrap's inline padding, so the single-column phone layout lost the inset every
  other page kept. Fix: `.section` now uses `padding-block`. The same trap was found and
  fixed in the two other wrap-sharing containers on this site — `.hero-in` (hero content was
  also flush on phone) and `.footer-in` — both now `padding-block`. Proof: DOM insets at
  390px — product H1 / price / description / related heading all at left=20 (were 0); desktop
  unchanged (detail column 736, container 150); product-phone.png read by eye.
- **RS-2 (visible) — No mobile menu; nav wrapped to 3 rows, header 262px on every page.**
  Fix (round-1 Clinic pattern in Retail's own system): all 6 pages gain a `.nav-toggle`
  "Menu" button (9px-radius outline button matching the nav links) and `id="main-nav"`,
  wired in `js/app.js` paintChrome (aria-expanded, closes on link click and Escape); the
  header inset is restored (`.header-in` padding shorthand → `padding-block`), and at ≤768px
  logo + open-chip + Menu share one row while the nav collapses to a full-width stacked
  list. Restoring the inset narrowed the desktop row by 40px and wrapped the nav at 1440px,
  so header gaps and nav-link padding were tightened (gap .8rem, padding-inline .6rem) —
  desktop is back to exactly one 72px row. Proof: DOM geometry — closed header **122px at
  390 (was 262)**, 74px at 768, logo left=20 at ≤768, toggle opens all 5 links with 0
  overflow (`round2/fix2-retail-store/menu-open-phone.png`); re-shoot combos 0 problems.
- **RS-3 (minor) — 1px horizontal overflow on index@390 only.** Root cause found by
  animation-phase sampling: the hero photo's kenburns scale animation (14s alternate) is
  not clipped by any container, so its transformed box repeatedly crossed the right edge —
  sampled document overflow up to 5px across the cycle (round-2 caught 1px at its sampling
  moment). Fix (the round-1 RE-2 pattern): `.hero{overflow:hidden}` clips the animation at
  the section boundary; the hero-in padding-block fix above also returns the image cell to
  the container width. Proof: 6-second sampling across the full kenburns cycle — max
  overflow **0**, no offenders.

Score unchanged: **91/100 — REJECT (evidence bar only)** — served-preview CWV + AICOS-112 §0
sign-off still outstanding; defect repairs do not manufacture them.
Push of the changed text files (css/style.css, js/app.js, all 6 HTML pages,
Scorecard-Verdict.md, tests-output.log) is pending the GitHub connector's approval card —
see FIX-REPORT-ROUND2.md.

## Addendum — Premium Upgrade (2026-11-22, Ladder #13)

Premium layer added per Premium-Standard-and-Library-Plan §5 #13: the care-journey
layer (Hims/Capsule patterns, inside the standing no-medical-claims rule), Swiper
category rails, and trust design upgraded — with **no invented people, licences or
claims**. Existing battery **141 PASS / 0 FAIL, unamended**, before and after; original
flow suite **19/19** after; new `premium-checks.js` **38 PASS / 0 FAIL**.

What was added:
- **Care journey (new technique: route → review → reserve as one designed flow)** —
  home gains a 3-step journey module: step 1 routes by need ("what do you need?"
  chips, incl. a not-sure → counter route), step 2 reviews the chosen shelf from the
  ONE data object (product count + first names/prices — deliberately **no stock
  numbers**, so the logic-owned counter cannot drift), step 3 reserves via the
  existing catalogue flow. Proven end-to-end in premium-checks.
- **Refill & regulars module (demo, honestly labelled)** — register a regular item +
  reminder rhythm; validated by the site's own validators, stored only in this
  browser (`sb_refills`), confirmation summarises and routes to reserve-for-pickup.
  No medical claims; the prescription honesty line is carried inside the module.
- **Swiper category rail** — the category tiles become a Swiper 14.4.0 rail on the
  home page (keyboard enabled, pagination, designed nav buttons in the site's
  system); the plain tiles grid is the no-JS/static state.
- **Trust design** — store page gains "At the counter — our honesty lines, in
  writing": the prescription line, the pay-at-pickup line and the counter contact
  as designed elements. **Deviation, recorded:** §5's "named pharmacist block"
  could not be built as named — no pharmacist name and no licence number exist
  anywhere in this site's existing content, and P10 forbids inventing them. The
  block is built from the site's existing honesty lines only.
- Display hero type (clamp to 3.3rem), micro-interactions on the one button/card
  system, CSS View Transitions (0 KB), reveal-on-scroll with an anti-blank
  failsafe (first capture caught mid-transition blanks on the refill section;
  fixed by arm-below-fold + sweep + 1.6s force-reveal, re-shot and re-read).

P1–P10 evidence:
- **P1 PASS** — the main agent's Retail rule set (`a{color:var(--blue);
  text-decoration:none}` + designed hover underlines on section-head/footer/
  hero-meta) preserved **verbatim**; CSS additions are appended only.
  Premium-checks link audit: 0 offenders on all 6 pages × 390/1440.
- **P2 NOT APPLIED (by §5 design)** — Lenis is not assigned to Retail in the plan;
  native scroll + CSS smooth anchors retained. Not claimed as a pass.
- **P3 PARTIAL** — one signature moment: the journey flow sequence (stateful
  steps, 650ms reveals, 75ms stagger, fire-once). Delivered via platform CSS/IO
  per §4.1's platform-first rule; Retail carries no GSAP scene (§5 assigns the
  GSAP rungs to other sites). Recorded as partial, not dressed up as a GSAP pass.
- **P4 PASS** — hero statement at display scale for a utility register
  (clamp(2.1rem, 4.6vw, 3.3rem), lh 1.05, tracking −0.02em).
- **P5 PASS** — real shelf photography hero (Ken Burns retained); the rail is
  category navigation, not a generic hero slider.
- **P6 PASS** — two depth modules beyond forms (journey routing; refill/regulars
  with validation + persistence), on top of the proven reserve logic.
- **P7 PASS** — hover/focus-visible/active states across buttons, cards, chips,
  rail nav; View Transitions where supported, graceful without.
- **P8 PASS (JS, measured)** — plain pages **11,229 B gzip** (≤20 KB); index
  **58,752 B gzip** (≤90 KB) — logic + app + premium + Swiper 44,390 (totals as
  measured by premium-checks; per-file CLI weighing differs by a few bytes by
  method). Served-preview CWV remains the external pending item — not claimed.
- **P9 PASS** — reduced-motion honoured (reveals static-complete, Ken Burns off);
  chips/steppers are native buttons; Swiper keyboard mode on; the battery's 17
  contrast assertions unchanged and green.
- **P10 PASS** — DEMO labelling intact; refill module labelled demo at every
  surface; banned-wording assertions (expiry/FEFO + medical-claim list) green;
  the one §5 item that would have required invention was rebuilt from existing
  content instead (above).

Captures: all 18 standard combos + nojs (18) + reduced (18) + probe320 re-shot —
every audit **0 overflow / 0 text-overflow / 0 broken images**; index-desktop
1440×3988, index-phone 390×7232 staged fresh; `screenshots/signature-moment.png`
= the journey mid-flow (Baby & Mother Care route selected, review filled, reserve
CTA re-pointed), read by eye.

RE-SCORE: Area 2 UI/UX 14→15 (journey + refill depth on the one conversion path) ·
Area 4 Animation & interactions 9→10 (Swiper rail, journey state motion, reveals,
micro-interactions — no longer a single motion pattern). All other areas unchanged
(Area 1 still holds 2 pts for the external AICOS-112 §0 recording; Area 7 still
holds 4 pts for served-preview CWV).
**TOTAL: 91 → 93 / 100 — verdict stays REJECT under the owner's 100-bar** until the
two external acts are recorded. No build defects outstanding.
