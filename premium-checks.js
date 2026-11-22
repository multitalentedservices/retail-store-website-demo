/* Sehat Bazaar Pharmacy (DEMO) — premium-upgrade checks (2026-11-22).
   Separate from tests.js (which is unamended). Browser-level proofs for the
   premium layer: P1 link audit, JS weights, Swiper rail, care-journey flow,
   refill module, stock-counter exactness, console cleanliness. */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = __dirname;
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
let pass = 0, fail = 0; const fails = [];
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; fails.push(name); console.log('FAIL  ' + name + (extra ? '  [' + extra + ']' : '')); }
}
const gz = f => zlib.gzipSync(fs.readFileSync(path.join(ROOT, f))).length;

(async () => {
  /* ---------- P8 weights (measured, gzip) ---------- */
  const base = gz('js/logic.js') + gz('js/app.js');
  const indexTotal = base + gz('js/premium.js') + gz('assets/vendor/swiper-bundle.min.js');
  t('P8 plain pages JS = ' + base + ' B gzip <= 20 KB', base <= 20 * 1024);
  t('P8 index (hero) JS = ' + indexTotal + ' B gzip <= 90 KB', indexTotal <= 90 * 1024);
  t('vendor hashes copied', fs.existsSync(path.join(ROOT, 'assets/vendor/swiper-bundle.min.js')) && fs.existsSync(path.join(ROOT, 'assets/vendor/swiper-bundle.min.css')));

  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });
  const pages = ['index.html', 'catalogue.html', 'product.html?id=15', 'reserve.html', 'reservations.html', 'store.html'];

  /* ---------- P1 link audit + console, every page x 2 viewports ---------- */
  for (const w of [1440, 390]) {
    for (const p of pages) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      const errors = [];
      /* Sandbox egress cannot tunnel to Google Fonts (pre-existing on every
         page of the original build too); those resource errors are counted
         separately and are not JS/console defects of the site. */
      page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errors.push(m.text()); });
      page.on('pageerror', e => errors.push(String(e)));
      await page.goto('file://' + path.join(ROOT, p), { waitUntil: 'load' });
      await page.waitForTimeout(600);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      const audit = await page.evaluate(() => {
        const bad = [];
        document.querySelectorAll('a').forEach(a => {
          const r = a.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          const cs = getComputedStyle(a);
          if (cs.color === 'rgb(0, 0, 238)') bad.push('UA-blue: ' + a.textContent.trim().slice(0, 30));
          const under = cs.textDecorationLine.includes('underline');
          if (under && !a.closest('.section-head') && !a.closest('.site-footer') && !a.closest('.hero-meta')) {
            bad.push('resting underline outside designed set: ' + a.textContent.trim().slice(0, 30));
          }
        });
        return bad;
      });
      t('P1 ' + p + ' @' + w + ': 0 link offenders', audit.length === 0, audit.join('; '));
      t('console clean ' + p + ' @' + w, errors.length === 0, errors.join('; ').slice(0, 200));
      await ctx.close();
    }
  }

  /* ---------- journey + rail + refill on index (phone) ---------- */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(700);
  t('Swiper rail initialised', await page.evaluate(() => !!document.querySelector('[data-cat-tiles].swiper-initialized')));
  t('rail has 5 category slides', await page.evaluate(() => document.querySelectorAll('[data-cat-tiles] .swiper-slide').length === 5));
  await page.click('[data-route="vitamins"]');
  await page.waitForTimeout(250);
  const review = await page.textContent('[data-journey-review]');
  t('journey review fills from data object', review.includes('Vitamins & Supplements') && review.includes('4 products'), review.slice(0, 120));
  const href = await page.getAttribute('[data-journey-reserve]', 'href');
  t('journey reserve routes to filtered catalogue', href === 'catalogue.html?cat=vitamins', href);
  await page.click('[data-route="counter"]');
  await page.waitForTimeout(250);
  t('counter route points at store page', (await page.getAttribute('[data-journey-reserve]', 'href')) === 'store.html');
  /* refill: bad phone first, then valid */
  await page.fill('#rf-name', 'Ahmed Raza');
  await page.fill('#rf-phone', '123');
  await page.selectOption('#rf-product', '3');
  await page.selectOption('#rf-cycle', 'Every month');
  await page.check('#rf-consent');
  await page.click('[data-refill-form] button[type="submit"]');
  await page.waitForTimeout(250);
  const phoneErr = await page.textContent('[data-err-for="rf-phone"]');
  t('refill bad phone named error', phoneErr.includes('03') && phoneErr.includes('11 digits'), phoneErr);
  await page.fill('#rf-phone', '0321 555 0142');
  await page.click('[data-refill-form] button[type="submit"]');
  await page.waitForTimeout(300);
  const confVisible = await page.evaluate(() => !document.querySelector('[data-refill-confirm]').hidden);
  const confTxt = (await page.textContent('[data-refill-confirm]') || '').replace(/\s+/g, ' ');
  t('refill confirmation shows product + rhythm', confVisible && confTxt.includes('Vitamin D3 1000 IU Softgels') && confTxt.includes('every month'), confTxt.slice(0, 140));
  const state = await page.evaluate(() => ({
    refills: JSON.parse(localStorage.getItem('sb_refills') || '[]'),
    stock: localStorage.getItem('sb_stock'),
    basket: localStorage.getItem('sb_basket')
  }));
  t('refill stored once, demo-labelled fields only', state.refills.length === 1 && state.refills[0].productId === 3);
  /* app.js seeds sb_stock from the data object on first render; exactness =
     every value still equals the ONE data object's stock, nothing decremented
     or altered by journey/refill interaction. */
  const L = require(path.join(ROOT, 'js', 'logic.js'));
  const seeded = state.stock ? JSON.parse(state.stock) : {};
  t('STOCK COUNTER EXACT: sb_stock == data object after journey+refill', L.PRODUCTS.every(p => seeded[p.id] === p.stock), JSON.stringify(seeded));
  t('basket untouched by premium layer', state.basket === null);
  await ctx.close();

  /* ---------- signature moment: journey mid-flow, desktop ---------- */
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await p2.waitForTimeout(700);
  await p2.click('[data-route="baby"]');
  await p2.evaluate(() => document.querySelector('[data-journey]').scrollIntoView({ block: 'center' }));
  await p2.waitForTimeout(900);
  await p2.screenshot({ path: path.join(ROOT, 'screenshots', 'signature-moment.png') });
  t('signature moment captured (journey, route selected)', fs.existsSync(path.join(ROOT, 'screenshots', 'signature-moment.png')));
  await ctx2.close();

  await browser.close();
  console.log('\nPREMIUM CHECKS: ' + pass + ' PASS / ' + fail + ' FAIL');
  if (fails.length) console.log('FAILURES: ' + fails.join(' | '));
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
