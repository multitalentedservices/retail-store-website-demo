/* Sehat Bazaar Pharmacy (DEMO) — Node test battery.
   Runs the SAME pure-logic module the site ships (js/logic.js) plus source
   assertions over the built files. Output: PASS/FAIL lines + totals. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const L = require(path.join(ROOT, 'js', 'logic.js'));
let pass = 0, fail = 0; const fails = [];
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; fails.push(name); console.log('FAIL  ' + name + (extra ? '  [' + extra + ']' : '')); }
}
function eq(name, a, b) { t(name, a === b, 'got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); }

/* ---------- data integrity ---------- */
eq('18 products', L.PRODUCTS.length, 18);
eq('5 categories', L.CATEGORIES.length, 5);
t('every product in a real category', L.PRODUCTS.every(p => L.CATEGORIES.some(c => c.id === p.cat)));
t('every category has >=3 products', L.CATEGORIES.every(c => L.PRODUCTS.filter(p => p.cat === c.id).length >= 3));
t('product ids unique', new Set(L.PRODUCTS.map(p => p.id)).size === 18);
t('all prices positive integers', L.PRODUCTS.every(p => Number.isInteger(p.price) && p.price > 0));
t('all stock counts integers >= 0', L.PRODUCTS.every(p => Number.isInteger(p.stock) && p.stock >= 0));
eq('4 featured products', L.PRODUCTS.filter(p => p.featured).length, 4);
eq('4 fictional reviews', L.REVIEWS.length, 4);

/* ---------- stock states + boundary in the data (lesson 41) ---------- */
eq('threshold is 5', L.LOW_STOCK_THRESHOLD, 5);
eq('stock 0 -> out', L.stockState(0).key, 'out');
eq('stock 1 -> low', L.stockState(1).key, 'low');
eq('stock 5 (== threshold) -> low', L.stockState(5).key, 'low');
eq('stock 6 (threshold+1) -> in', L.stockState(6).key, 'in');
const atThreshold = L.PRODUCTS.filter(p => p.stock === L.LOW_STOCK_THRESHOLD);
eq('exactly one product sits AT the threshold', atThreshold.length, 1);
eq('at-threshold product is Vitamin D3 (id 3)', atThreshold[0].id, 3);
eq('one product out of stock (Omega-3, id 4)', L.PRODUCTS.filter(p => p.stock === 0).map(p => p.id).join(','), '4');
t('low-stock label names the count', L.stockState(3).label.includes('3'));

/* ---------- quantity boundary pair (lesson 33) ---------- */
t('qty == stock passes (5 of 5)', L.qtyCheck(5, 5).ok);
t('qty == stock+1 rejected (6 of 5)', !L.qtyCheck(5, 6).ok);
t('rejection names the stock count', L.qtyCheck(5, 6).error.includes('Only 5 in stock'));
t('qty 0 rejected', !L.qtyCheck(5, 0).ok);
t('qty 1 of 1 passes', L.qtyCheck(1, 1).ok);
t('qty 2 of 1 rejected', !L.qtyCheck(1, 2).ok);

/* ---------- filter / sort exact counts ---------- */
const all = L.PRODUCTS;
eq('no filters -> 18', L.filterProducts(all, {}).length, 18);
eq('cat vitamins -> 4', L.filterProducts(all, { cat: 'vitamins' }).length, 4);
eq('cat personal -> 4', L.filterProducts(all, { cat: 'personal' }).length, 4);
eq('cat firstaid -> 3', L.filterProducts(all, { cat: 'firstaid' }).length, 3);
eq('cat baby -> 3', L.filterProducts(all, { cat: 'baby' }).length, 3);
eq('cat devices -> 4', L.filterProducts(all, { cat: 'devices' }).length, 4);
eq('in-stock only -> 17', L.filterProducts(all, { inStockOnly: true }).length, 17);
/* AMENDED inline: first draft expected 3 (name matches only); the search also
   matches the category name "Vitamins & Supplements", so Omega-3 (id 4) matches
   too — 4 is the correct count for the shipped search semantics. */
eq('search "vitamin" -> 4 (3 names + Omega-3 via category name)', L.filterProducts(all, { q: 'vitamin' }).length, 4);
eq('search "baby" -> 3', L.filterProducts(all, { q: 'baby' }).length, 3);
eq('search "zzz" -> 0 (empty state)', L.filterProducts(all, { q: 'zzz' }).length, 0);
eq('cat vitamins + in-stock -> 3', L.filterProducts(all, { cat: 'vitamins', inStockOnly: true }).length, 3);
eq('search "vitamin" + cat personal -> 0', L.filterProducts(all, { q: 'vitamin', cat: 'personal' }).length, 0);
const byPriceAsc = L.filterProducts(all, { sort: 'price-asc' });
eq('price-asc first is Bandages PKR 180', byPriceAsc[0].id, 9);
eq('price-asc last is BP Monitor PKR 4250', byPriceAsc[byPriceAsc.length - 1].id, 15);
const byPriceDesc = L.filterProducts(all, { sort: 'price-desc' });
eq('price-desc first is BP Monitor', byPriceDesc[0].id, 15);
const byName = L.filterProducts(all, { sort: 'name-asc' });
eq('name-asc first is Adhesive Bandages', byName[0].id, 9);
t('price-asc is monotonic', byPriceAsc.every((p, i, a) => i === 0 || a[i - 1].price <= p.price));

/* ---------- totals arithmetic ---------- */
eq('formatPKR 4250', L.formatPKR(4250), 'PKR 4,250');
eq('formatPKR 850', L.formatPKR(850), 'PKR 850');
const flowItems = [{ product: L.productById(3), qty: 2 }, { product: L.productById(16), qty: 1 }];
eq('flow total 2x990 + 1x650 = 2630', L.basketTotal(flowItems), 2630);
eq('empty basket total 0', L.basketTotal([]), 0);
eq('single item total', L.basketTotal([{ product: L.productById(15), qty: 1 }]), 4250);

/* ---------- validation ---------- */
t('name "Ahmed Raza" ok', L.validateName('Ahmed Raza').ok);
t('name "Al" rejected (too short)', !L.validateName('Al').ok);
t('name blank rejected', !L.validateName('   ').ok);
t('name error names the rule', L.validateName('Al').error.includes('at least 3'));
t('phone 03215550142 ok', L.validatePhone('0321 555 0142').ok);
eq('phone normalised', L.validatePhone('0321 555 0142').value, '03215550142');
eq('phone intl', L.validatePhone('0321 555 0142').intl, '923215550142');
t('phone +92 form ok', L.validatePhone('+92 321 5550142').ok);
eq('phone +92 normalised to 03 form', L.validatePhone('+92 321 5550142').value, '03215550142');
t('phone "123" rejected', !L.validatePhone('123').ok);
t('phone error names 03 + 11 digits', L.validatePhone('123').error.includes('03') && L.validatePhone('123').error.includes('11 digits'));
t('landline 042 rejected', !L.validatePhone('04235781234').ok);
t('10-digit mobile rejected', !L.validatePhone('0321555014').ok);

/* ---------- ref format / determinism ---------- */
const items = [{ id: 3, qty: 2 }, { id: 16, qty: 1 }];
const ref1 = L.makeRef('Ahmed Raza', '923215550142', items);
const ref2 = L.makeRef('Ahmed Raza', '923215550142', items);
t('ref matches RS-DEMO-####', /^RS-DEMO-\d{4}$/.test(ref1), ref1);
eq('ref deterministic', ref1, ref2);
t('different basket -> different ref', L.makeRef('Ahmed Raza', '923215550142', [{ id: 3, qty: 1 }]) !== ref1);

/* ---------- stock decrement / restore round-trip (pure model of app flow) ---------- */
(function () {
  const stock = {}; L.PRODUCTS.forEach(p => { stock[p.id] = p.stock; });
  const before = stock[3];
  stock[3] -= 2; /* reserve 2 x Vitamin D3 */
  t('decrement: 5 -> 3 after reserving 2', stock[3] === before - 2 && stock[3] === 3);
  eq('state at 3 is low', L.stockState(stock[3]).key, 'low');
  stock[3] += 2; /* cancel restores */
  eq('restore round-trip returns to 5', stock[3], before);
})();

/* ---------- open/closed vs demo clock + boundaries (lesson 29) ---------- */
const clock = L.STORE.demoClock;
eq('demo clock is Sunday', clock.day, 0);
const nowState = L.openStateAt(clock.day, clock.minutes);
t('demo clock Sun 11:30 AM -> open', nowState.open);
t('open label names Sunday close 2:00 PM', nowState.label.includes('2:00 PM'));
t('Sun 8:59 AM (before open) -> closed', !L.openStateAt(0, 8 * 60 + 59).open);
t('Sun 9:00 AM (exactly open) -> open', L.openStateAt(0, 9 * 60).open);
t('Sun 1:59 PM -> open', L.openStateAt(0, 13 * 60 + 59).open);
t('Sun 2:00 PM (exactly close) -> closed', !L.openStateAt(0, 14 * 60).open);
t('Mon 9:59 PM -> open', L.openStateAt(1, 21 * 60 + 59).open);
t('Mon 10:00 PM (exactly close) -> closed', !L.openStateAt(1, 22 * 60).open);
eq('fmtTime 14:00', L.fmtTime(14 * 60), '2:00 PM');
eq('fmtTime 8:00', L.fmtTime(8 * 60), '8:00 AM');

/* ---------- WhatsApp link construction ---------- */
const wa = L.whatsappLink(L.productById(15));
t('wa link targets demo number', wa.startsWith('https://wa.me/923001234567?text='));
t('wa link prefilled with product name', decodeURIComponent(wa).includes('Digital Blood Pressure Monitor'));

/* ---------- contrast assertions from hex (lesson 23) ---------- */
function lum(hex) {
  const c = hex.replace('#', '');
  const f = i => { const v = parseInt(c.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
const pairs = [
  ['ink #17233B on white', '#17233B', '#FFFFFF', 4.5],
  ['muted #44597A on white', '#44597A', '#FFFFFF', 4.5],
  ['muted #44597A on surface-2 #F7F9FC', '#44597A', '#F7F9FC', 4.5],
  ['blue #1D4ED8 on white (links/buttons text)', '#1D4ED8', '#FFFFFF', 4.5],
  ['white on blue #1D4ED8 (primary btn)', '#FFFFFF', '#1D4ED8', 4.5],
  ['white on blue-dark #1E3A8A (banner)', '#FFFFFF', '#1E3A8A', 4.5],
  ['blue-dark #1E3A8A on white (card cat)', '#1E3A8A', '#FFFFFF', 4.5],
  ['blue-dark on blue-soft #DBEAFE (nav current / today row)', '#1E3A8A', '#DBEAFE', 4.5],
  ['ok #166534 on ok-bg #DCFCE7 (in-stock badge)', '#166534', '#DCFCE7', 4.5],
  ['warn #92400E on warn-bg #FEF3C7 (low-stock badge / notice)', '#92400E', '#FEF3C7', 4.5],
  ['out #991B1B on out-bg #FEE2E2 (out badge / closed chip)', '#991B1B', '#FEE2E2', 4.5],
  ['error #B91C1C on white (field errors)', '#B91C1C', '#FFFFFF', 4.5],
  ['error #B91C1C on surface-2 #F7F9FC', '#B91C1C', '#F7F9FC', 4.5],
  ['ink on surface #EEF2F7 (map placeholder)', '#17233B', '#EEF2F7', 4.5],
  ['muted on surface #EEF2F7', '#44597A', '#EEF2F7', 4.5],
  ['white on ink #17233B (toast)', '#FFFFFF', '#17233B', 4.5],
  ['focus outline blue #1D4ED8 vs white >= 3:1', '#1D4ED8', '#FFFFFF', 3.0]
];
pairs.forEach(([name, fg, bg, bar]) => {
  const r = ratio(fg, bg);
  t('contrast ' + name + ' = ' + r.toFixed(2) + ':1', r >= bar, r.toFixed(2));
});

/* ---------- source assertions over built files ---------- */
const pages = ['index.html', 'catalogue.html', 'product.html', 'reserve.html', 'reservations.html', 'store.html'];
const src = {};
pages.forEach(p => { src[p] = fs.readFileSync(path.join(ROOT, p), 'utf8'); });
const appJs = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const logicJs = fs.readFileSync(path.join(ROOT, 'js', 'logic.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const everything = pages.map(p => src[p]).join('\n') + appJs + logicJs + css;

pages.forEach(p => {
  t(p + ' carries DEMO labelling', src[p].includes('DEMO'));
  t(p + ' has unique title', /<title>[^<]*Sehat Bazaar/.test(src[p]) || /<title>[^<]*— Sehat Bazaar/.test(src[p]));
  t(p + ' loads logic.js + app.js', src[p].includes('js/logic.js') && src[p].includes('js/app.js'));
});
t('all page titles unique', new Set(pages.map(p => (src[p].match(/<title>([^<]*)<\/title>/) || [])[1])).size === 6);
t('prescription honesty line present in logic data', logicJs.includes('dispensed in-store only against a valid prescription'));
t('pay-at-pickup line present', logicJs.includes('Pay at pickup — this demo takes no payment'));
t('store page labels the map a static placeholder', src['store.html'].includes('Map placeholder — demo'));
t('NO external map embeds anywhere', !/google\.com\/maps|maps\.googleapis|openstreetmap\.org\/export/.test(everything));
t('NO expiry / FEFO wording anywhere (banned claim)', !/expiry|FEFO/i.test(everything));
const bannedMedical = ['cures', 'cure ', 'treats ', 'treatment for', 'heals', 'guaranteed relief', 'miracle'];
bannedMedical.forEach(w => t('no medical-claim wording "' + w.trim() + '"', !everything.toLowerCase().includes(w)));
t('no lorem ipsum', !/lorem/i.test(everything));
t('no live analytics endpoints', !/googletagmanager|google-analytics\.com|connect\.facebook/.test(everything));
t('no external scripts besides Google Fonts CSS', !/<script[^>]+src="http/.test(pages.map(p => src[p]).join('')));

/* link integrity: every local href/src target exists */
const missing = [];
pages.forEach(p => {
  const refs = src[p].match(/(?:href|src)="([^"#]+)"/g) || [];
  refs.forEach(r => {
    const target = r.replace(/^(?:href|src)="/, '').replace(/"$/, '').split('?')[0];
    if (/^https?:|^tel:|^mailto:/.test(target)) return;
    if (!fs.existsSync(path.join(ROOT, target))) missing.push(p + ' -> ' + target);
  });
});
t('link integrity: all local targets exist', missing.length === 0, missing.join('; '));

/* ---------- weight budgets ---------- */
let codeBytes = 0;
pages.forEach(p => { codeBytes += fs.statSync(path.join(ROOT, p)).size; });
codeBytes += fs.statSync(path.join(ROOT, 'css', 'style.css')).size + fs.statSync(path.join(ROOT, 'js', 'app.js')).size + fs.statSync(path.join(ROOT, 'js', 'logic.js')).size;
t('code weight < 400 KB (' + codeBytes + ' B)', codeBytes < 400 * 1024);
const imgs = fs.readdirSync(path.join(ROOT, 'assets')).filter(f => /\.jpe?g$/.test(f));
let mediaBytes = 0;
imgs.forEach(f => { const s = fs.statSync(path.join(ROOT, 'assets', f)).size; mediaBytes += s; t('image ' + f + ' <= 120 KB (' + s + ' B)', s <= 120 * 1024); });
t('media total <= 1.6 MB (' + mediaBytes + ' B)', mediaBytes <= 1.6 * 1024 * 1024);
eq('7 photos on disk', imgs.length, 7);
t('every product category has an image file', L.CATEGORIES.every(c => fs.existsSync(path.join(ROOT, c.img))));

console.log('\nTOTAL: ' + pass + ' PASS / ' + fail + ' FAIL');
if (fails.length) console.log('FAILURES: ' + fails.join(' | '));
process.exit(fail ? 1 : 0);
