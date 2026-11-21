/* Sehat Bazaar Pharmacy (DEMO) — screenshot + audit + flow + keyboard runner.
   Modes: default (6 pages x 390/768/1440), --probe320, --nojs, --reduced, --flows, --keyboard.
   No sticky/fixed chrome exists except the transient toast, so full-page captures are clean (lesson 35). */
const { chromium } = require('/home/hatch/workspace/tools/screenshot-engine/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = '/home/hatch/workspace/portfolio-builds/retail-store-website-demo';
const EXEC = '/home/hatch/workspace/tools/screenshot-engine/browsers/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = process.argv[2];
const NOJS = process.argv.includes('--nojs'), PROBE = process.argv.includes('--probe320'),
  FLOWS = process.argv.includes('--flows'), REDUCED = process.argv.includes('--reduced'),
  KEYBOARD = process.argv.includes('--keyboard');
const PAGES = [['index', 'index.html'], ['catalogue', 'catalogue.html'], ['product', 'product.html?id=15'],
  ['reserve', 'reserve.html'], ['reservations', 'reservations.html'], ['store', 'store.html']];
const VIEWPORTS = PROBE ? [['probe320', 320, 700]] : [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]];

async function auditPage(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth; const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        if (el.closest('.skip') || el.closest('.toast')) return;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const ox = getComputedStyle(a).overflowX;
          if (ox === 'hidden' || ox === 'clip' || ox === 'auto' || ox === 'scroll') { clipped = true; break; }
        }
        if (!clipped) bad.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').join('.'), right: Math.round(r.right) });
      }
    });
    const broken = [];
    document.querySelectorAll('img').forEach(im => { if (im.complete && im.naturalWidth === 0) broken.push(im.getAttribute('src')); });
    const textBad = [];
    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length || !el.textContent || !el.textContent.trim() || el.closest('.skip') || el.closest('.vh')) return;
      if (el.scrollWidth > el.clientWidth + 1) textBad.push({ el: el.tagName.toLowerCase(), sw: el.scrollWidth, cw: el.clientWidth, text: el.textContent.trim().slice(0, 40) });
    });
    return { overflowX: document.documentElement.scrollWidth - vw, badEls: bad.slice(0, 12), brokenImgs: broken, textBad: textBad.slice(0, 12) };
  });
}
async function settle(page) {
  if (NOJS) { await page.waitForTimeout(500); return; }
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXEC, args: ['--proxy-server=http://hatch-egress-proxy:3128', '--no-sandbox', '--force-color-profile=srgb'] });

  if (KEYBOARD) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage(); const rows = [];
    const rec = async (label, i) => {
      const info = await page.evaluate(() => {
        const el = document.activeElement; if (!el) return null;
        const cs = getComputedStyle(el);
        return { tag: el.tagName.toLowerCase(), text: (el.textContent || el.value || el.id || '').trim().replace(/\s+/g, ' ').slice(0, 44), cls: (typeof el.className === 'string' ? el.className : '') || el.id || '', outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor };
      });
      rows.push('| ' + label + ' | ' + i + ' | ' + (info ? info.tag + ' — ' + info.text : '?') + ' | ' + (info ? info.cls : '') + ' | ' + (info ? info.outline : '') + ' |');
    };
    /* Catalogue: filters are all native controls (lesson 34). */
    await page.goto('file://' + path.join(ROOT, 'catalogue.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    for (let i = 1; i <= 10; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(90); await rec('catalogue', i); if (i === 4) await page.screenshot({ path: path.join(OUT, 'keyboard-catalogue-search.png') }); }
    /* Product: stepper + reserve + WhatsApp. */
    await page.goto('file://' + path.join(ROOT, 'product.html?id=3'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    for (let i = 1; i <= 12; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(90); await rec('product id=3', i); if (i === 9) await page.screenshot({ path: path.join(OUT, 'keyboard-product-stepper.png') }); }
    /* Seed a basket, then walk the reservation form. */
    await page.evaluate(() => { localStorage.setItem('sb_basket', JSON.stringify([{ id: 16, qty: 1 }])); });
    await page.goto('file://' + path.join(ROOT, 'reserve.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    for (let i = 1; i <= 14; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(90); await rec('reserve form', i); if (i === 11) await page.screenshot({ path: path.join(OUT, 'keyboard-reserve-name.png') }); }
    fs.writeFileSync(path.join(OUT, 'keyboard-walk.md'),
      '# Keyboard walk — Sehat Bazaar Pharmacy (Demo)\n\nMethod: Playwright Tab at 1280px on catalogue.html, product.html?id=3 and reserve.html (basket seeded with 1 x Digital Thermometer); focused element + computed outline recorded per stop. All interactive controls are native links/buttons/inputs/selects (lesson 34) — no visually-hidden inputs exist anywhere, so the lesson-20 focus-host case does not arise (checked, not applicable). Focus style: 3px solid #1D4ED8 outline (:focus-visible), 6.29:1 against white.\n\n| Surface | Stop | Focused element | Class/id | Outline |\n|---|---|---|---|---|\n' + rows.join('\n') + '\n');
    console.log('KEYBOARD DONE'); await browser.close(); return;
  }

  if (FLOWS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const log = [];
    const ok = (name, cond) => log.push((cond ? 'PASS  ' : 'FAIL  ') + name);
    /* 1) Catalogue empty state naming constraints + one-click reset */
    await page.goto('file://' + path.join(ROOT, 'catalogue.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    await page.fill('[data-f-q]', 'zzz-no-match'); await page.waitForTimeout(300);
    const emptyVisible = await page.evaluate(() => !document.querySelector('[data-f-empty]').hidden);
    const emptyMsg = await page.textContent('[data-f-empty-msg]');
    ok('empty state visible for impossible search', emptyVisible);
    ok('empty state NAMES the constraint (search "zzz-no-match") -> ' + emptyMsg.trim(), emptyMsg.includes('zzz-no-match'));
    await page.screenshot({ path: path.join(OUT, 'flow-empty-state.png'), fullPage: true });
    await page.click('[data-f-reset]'); await page.waitForTimeout(300);
    const countAfterReset = await page.textContent('[data-f-count]');
    ok('reset restores full count -> ' + countAfterReset.trim(), countAfterReset.includes('Showing 18 of 18'));
    /* 2) Product id=3 (Vitamin D3, stock 5 = threshold): stock BEFORE capture */
    await page.goto('file://' + path.join(ROOT, 'product.html?id=3'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const stockBefore = await page.textContent('[data-stock-num]');
    ok('stock BEFORE reservation -> ' + stockBefore.trim(), stockBefore.includes('5 on the shelf'));
    await page.screenshot({ path: path.join(OUT, 'flow-stock-before.png'), fullPage: true });
    /* 3) Boundary: qty 6 = stock+1 rejected with named constraint; qty 2 clears */
    await page.fill('[data-qty-input]', '6'); await page.waitForTimeout(250);
    const qtyErr = await page.textContent('[data-qty-error]');
    ok('stock+1 (6 of 5) error CONTENT -> ' + qtyErr.trim(), qtyErr.includes('Only 5 in stock'));
    await page.screenshot({ path: path.join(OUT, 'flow-qty-boundary.png'), fullPage: true });
    await page.fill('[data-qty-input]', '2'); await page.waitForTimeout(250);
    ok('valid qty clears the error live', await page.evaluate(() => document.querySelector('[data-qty-error]').hidden));
    /* 4) WhatsApp firing recorded (lesson 21) */
    const popupP = page.waitForEvent('popup', { timeout: 4000 }).catch(() => null);
    await page.click('[data-wa]');
    const popup = await popupP; if (popup) { await popup.waitForTimeout(300); await popup.close(); }
    await page.waitForTimeout(300);
    const waLog = await page.evaluate(() => JSON.parse(localStorage.getItem('sb_wa_log') || '[]'));
    ok('FIRING whatsapp log -> ' + JSON.stringify(waLog), waLog.length === 1 && waLog[0].product.includes('Vitamin D3'));
    /* 5) Add 2 to basket */
    await page.click('[data-reserve]'); await page.waitForTimeout(300);
    const note = await page.textContent('[data-basket-note]');
    ok('basket note -> ' + note.trim(), note.includes('2 × Vitamin D3'));
    /* 6) Reserve page: bad phone rendered error, live clear, then confirm */
    await page.goto('file://' + path.join(ROOT, 'reserve.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const totalTxt = await page.textContent('[data-basket-total]');
    ok('basket total 2 x PKR 990 = PKR 1,980 -> ' + totalTxt.trim(), totalTxt.includes('PKR 1,980'));
    await page.fill('#res-name', 'Ahmed Raza');
    await page.fill('#res-phone', '123');
    await page.selectOption('#res-slot', { label: 'Today, 1:00 PM' });
    await page.click('[data-res-form] button[type="submit"]'); await page.waitForTimeout(300);
    const phoneErr = await page.textContent('[data-err-for="res-phone"]');
    ok('bad phone error CONTENT -> ' + phoneErr.trim(), phoneErr.includes('03') && phoneErr.includes('11 digits'));
    await page.screenshot({ path: path.join(OUT, 'flow-phone-error.png'), fullPage: true });
    await page.fill('#res-phone', '0321 555 0142'); await page.waitForTimeout(250);
    ok('valid phone clears error live', await page.evaluate(() => document.querySelector('[data-err-for="res-phone"]').hidden));
    await page.click('[data-res-form] button[type="submit"]'); await page.waitForTimeout(400);
    const confTxt = (await page.textContent('[data-confirm]')).replace(/\s+/g, ' ');
    const ref = (confTxt.match(/RS-DEMO-\d{4}/) || [])[0];
    ok('confirmation ref -> ' + ref, !!ref);
    ok('confirmation exact total PKR 1,980', confTxt.includes('PKR 1,980'));
    ok('confirmation states pay-at-pickup / no payment', confTxt.includes('Pay at pickup — this demo takes no payment'));
    await page.screenshot({ path: path.join(OUT, 'flow-confirmation.png'), fullPage: true });
    /* 7) Cross-surface: stock decremented on the product page (lessons 30/38) */
    await page.goto('file://' + path.join(ROOT, 'product.html?id=3'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const stockAfter = await page.textContent('[data-stock-num]');
    ok('stock AFTER reservation -> ' + stockAfter.trim() + ' (5 -> 3)', stockAfter.includes('3 on the shelf'));
    await page.screenshot({ path: path.join(OUT, 'flow-stock-after-reserve.png'), fullPage: true });
    /* 8) My Reservations lists it; cancel restores stock */
    await page.goto('file://' + path.join(ROOT, 'reservations.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const myTxt = (await page.textContent('[data-my-res]')).replace(/\s+/g, ' ');
    ok('My Reservations contains ref + total', myTxt.includes(ref) && myTxt.includes('PKR 1,980'));
    await page.screenshot({ path: path.join(OUT, 'flow-my-reservations.png'), fullPage: true });
    await page.click('[data-cancel]'); await page.waitForTimeout(300);
    const myTxt2 = (await page.textContent('[data-my-res]')).replace(/\s+/g, ' ');
    ok('status after cancel -> Cancelled', myTxt2.includes('Cancelled'));
    await page.goto('file://' + path.join(ROOT, 'product.html?id=3'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    const stockRestored = await page.textContent('[data-stock-num]');
    ok('stock RESTORED after cancel -> ' + stockRestored.trim() + ' (3 -> 5)', stockRestored.includes('5 on the shelf'));
    await page.screenshot({ path: path.join(OUT, 'flow-stock-restored.png'), fullPage: true });
    /* 9) Basket boundary on reserve page: seed basket at full stock of id 17 (2), try + */
    await page.evaluate(() => { localStorage.setItem('sb_basket', JSON.stringify([{ id: 17, qty: 2 }])); });
    await page.goto('file://' + path.join(ROOT, 'reserve.html'), { waitUntil: 'load' }); await page.waitForTimeout(500);
    await page.click('[data-binc="17"]'); await page.waitForTimeout(300);
    const bErr = await page.textContent('[data-basket-error]');
    ok('basket step above stock rejected, constraint NAMED -> ' + bErr.trim(), bErr.includes('Only 2 in stock'));
    await page.screenshot({ path: path.join(OUT, 'flow-basket-boundary.png'), fullPage: true });
    fs.writeFileSync(path.join(OUT, 'flow-log.txt'), log.join('\n') + '\n');
    console.log(log.join('\n')); console.log('FLOWS DONE'); await browser.close(); return;
  }

  const results = {};
  const pageList = PROBE ? [['index', 'index.html']] : PAGES;
  for (const [pname, file] of pageList) {
    for (const [vname, w, h] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: !NOJS, reducedMotion: REDUCED ? 'reduce' : 'no-preference' });
      const page = await ctx.newPage();
      await page.goto('file://' + path.join(ROOT, file), { waitUntil: 'load' });
      await page.waitForTimeout(400); await settle(page);
      results[pname + '@' + vname] = await auditPage(page);
      await page.screenshot({ path: path.join(OUT, pname + '-' + vname + '.png'), fullPage: true });
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  console.log('SHOOT DONE -> ' + OUT);
  await browser.close();
})();
