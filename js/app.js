/* Sehat Bazaar Pharmacy (DEMO) — DOM layer. All facts come from SBLogic;
   this file only renders them and owns localStorage state:
   sb_stock (the one inventory counter, decremented/restored),
   sb_basket, sb_reservations, sb_wa_log (integration firing record). */
(function () {
  'use strict';
  var L = window.SBLogic;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  /* ---- the one stock counter (lessons 38/46) ---- */
  function stockMap() {
    var m = load('sb_stock', null);
    if (!m) { m = {}; L.PRODUCTS.forEach(function (p) { m[p.id] = p.stock; }); save('sb_stock', m); }
    return m;
  }
  function liveProducts() {
    var m = stockMap();
    return L.PRODUCTS.map(function (p) { var c = {}; for (var k in p) c[k] = p[k]; c.stock = (m[p.id] != null ? m[p.id] : p.stock); return c; });
  }
  function liveProduct(id) { var all = liveProducts(); for (var i = 0; i < all.length; i++) if (all[i].id === Number(id)) return all[i]; return null; }
  function setStock(id, n) { var m = stockMap(); m[id] = n; save('sb_stock', m); }

  /* ---- basket ---- */
  function basket() { return load('sb_basket', []); }
  function basketCount() { return basket().reduce(function (a, i) { return a + i.qty; }, 0); }
  function addToBasket(id, qty) {
    var p = liveProduct(id); if (!p) return { ok: false, error: 'Product not found.' };
    var b = basket(); var cur = 0;
    b.forEach(function (i) { if (i.id === p.id) cur = i.qty; });
    var chk = L.qtyCheck(p.stock, cur + qty);
    if (!chk.ok) return { ok: false, error: chk.error };
    var found = false;
    b = b.map(function (i) { if (i.id === p.id) { found = true; return { id: i.id, qty: i.qty + qty }; } return i; });
    if (!found) b.push({ id: p.id, qty: qty });
    save('sb_basket', b); paintBasketCount();
    return { ok: true };
  }
  function setBasketQty(id, qty) {
    var p = liveProduct(id); if (!p) return { ok: false, error: 'Product not found.' };
    var chk = L.qtyCheck(p.stock, qty);
    if (!chk.ok) return chk;
    save('sb_basket', basket().map(function (i) { return i.id === p.id ? { id: i.id, qty: qty } : i; }));
    paintBasketCount(); return { ok: true };
  }
  function removeFromBasket(id) { save('sb_basket', basket().filter(function (i) { return i.id !== Number(id); })); paintBasketCount(); }
  function paintBasketCount() { $$('[data-basket-count]').forEach(function (el) { el.textContent = String(basketCount()); }); }

  /* ---- WhatsApp firing record (lesson 21) ---- */
  function recordWhatsApp(productName) {
    var log = load('sb_wa_log', []);
    log.push({ product: productName, at: L.STORE.demoClock.label, channel: 'whatsapp' });
    save('sb_wa_log', log);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-wa]') : null;
    if (a) recordWhatsApp(a.getAttribute('data-wa'));
  });

  /* ---- shared chrome: open state + basket count ---- */
  function paintChrome() {
    var st = L.openStateAt(L.STORE.demoClock.day, L.STORE.demoClock.minutes);
    $$('[data-open-state]').forEach(function (el) {
      el.textContent = st.label;
      el.classList.toggle('is-open', st.open);
      el.classList.toggle('is-closed', !st.open);
    });
    paintBasketCount();
  }

  function stockBadge(p) {
    var s = L.stockState(p.stock);
    return '<span class="badge badge-' + s.key + '">' + s.label + '</span>';
  }
  function cardHTML(p) {
    var out = p.stock <= 0;
    return '<article class="card">' +
      '<a class="card-media" href="product.html?id=' + p.id + '"><img src="' + L.categoryImage(p.cat) + '" alt="' + L.catName(p.cat) + ' products on a shelf" loading="lazy"></a>' +
      '<div class="card-body">' +
      '<p class="card-cat">' + L.catName(p.cat) + '</p>' +
      '<h3 class="card-name"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
      '<p class="card-pack">' + p.pack + '</p>' +
      '<p class="card-row"><span class="price">' + L.formatPKR(p.price) + '</span>' + stockBadge(p) + '</p>' +
      (out
        ? '<p class="card-note">Out of stock — reserving is disabled for this item.</p>' +
          '<button class="btn btn-primary btn-block" type="button" disabled aria-disabled="true">Reserve for pickup</button>'
        : '<button class="btn btn-primary btn-block" type="button" data-add="' + p.id + '">Reserve for pickup</button>') +
      '</div></article>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-add]') : null;
    if (!b) return;
    var r = addToBasket(Number(b.getAttribute('data-add')), 1);
    var note = document.createElement('p');
    note.className = 'toast'; note.setAttribute('role', 'status');
    note.textContent = r.ok ? 'Added to your pickup basket. Basket total items: ' + basketCount() + '.' : r.error;
    document.body.appendChild(note);
    setTimeout(function () { note.remove(); }, 3200);
  });

  /* ================= HOME ================= */
  function initHome() {
    var grid = $('[data-featured]'); if (!grid) return;
    var live = liveProducts();
    grid.innerHTML = live.filter(function (p) { return p.featured; }).map(cardHTML).join('');
    var tiles = $('[data-cat-tiles]');
    if (tiles) {
      tiles.innerHTML = L.CATEGORIES.map(function (c) {
        var n = live.filter(function (p) { return p.cat === c.id; }).length;
        return '<a class="tile" href="catalogue.html?cat=' + c.id + '"><img src="' + c.img + '" alt="' + c.name + '" loading="lazy">' +
          '<span class="tile-body"><span class="tile-name">' + c.name + '</span><span class="tile-count">' + n + ' products</span></span></a>';
      }).join('');
    }
    var form = $('[data-hero-search]');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('[data-hero-q]', form).value.trim();
      window.location.href = 'catalogue.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ================= CATALOGUE ================= */
  function initCatalogue() {
    var grid = $('[data-cat-grid]'); if (!grid) return;
    var qEl = $('[data-f-q]'), catEl = $('[data-f-cat]'), stockEl = $('[data-f-stock]'), sortEl = $('[data-f-sort]');
    var countEl = $('[data-f-count]'), emptyEl = $('[data-f-empty]'), emptyMsg = $('[data-f-empty-msg]');
    function readURL() {
      var u = new URLSearchParams(window.location.search);
      return { q: u.get('q') || '', cat: u.get('cat') || 'all', inStockOnly: u.get('stock') === '1', sort: u.get('sort') || 'name-asc' };
    }
    function state() { return { q: qEl.value, cat: catEl.value, inStockOnly: stockEl.checked, sort: sortEl.value }; }
    function writeURL(s) {
      var u = new URLSearchParams();
      if (s.q.trim()) u.set('q', s.q.trim());
      if (s.cat !== 'all') u.set('cat', s.cat);
      if (s.inStockOnly) u.set('stock', '1');
      if (s.sort !== 'name-asc') u.set('sort', s.sort);
      history.replaceState(null, '', window.location.pathname + (u.toString() ? '?' + u.toString() : ''));
    }
    function render() {
      var s = state(); writeURL(s);
      var live = liveProducts();
      var res = L.filterProducts(live, s);
      countEl.textContent = 'Showing ' + res.length + ' of ' + live.length + ' products';
      grid.innerHTML = res.map(cardHTML).join('');
      grid.hidden = res.length === 0; emptyEl.hidden = res.length !== 0;
      if (res.length === 0) {
        var bits = [];
        if (s.q.trim()) bits.push('search "' + s.q.trim() + '"');
        if (s.cat !== 'all') bits.push('category "' + L.catName(s.cat) + '"');
        if (s.inStockOnly) bits.push('in-stock only');
        emptyMsg.textContent = 'No products match ' + (bits.length ? bits.join(' + ') : 'these filters') + '. Clear a filter or reset to see the full catalogue.';
      }
    }
    var init = readURL();
    qEl.value = init.q; catEl.value = init.cat; stockEl.checked = init.inStockOnly; sortEl.value = init.sort;
    [qEl, catEl, stockEl, sortEl].forEach(function (el) {
      el.addEventListener('input', render); el.addEventListener('change', render);
    });
    $('[data-f-reset]').addEventListener('click', function () {
      qEl.value = ''; catEl.value = 'all'; stockEl.checked = false; sortEl.value = 'name-asc'; render(); qEl.focus();
    });
    render();
  }

  /* ================= PRODUCT DETAIL ================= */
  function initProduct() {
    var host = $('[data-product]'); if (!host) return;
    var id = new URLSearchParams(window.location.search).get('id');
    var p = liveProduct(id);
    if (!p) { host.innerHTML = '<h1>Product not found</h1><p>This demo catalogue has no product with that reference. <a href="catalogue.html">Back to the catalogue</a>.</p>'; return; }
    document.title = p.name + ' — Sehat Bazaar Pharmacy (Demo)';
    var s = L.stockState(p.stock);
    var out = p.stock <= 0;
    host.innerHTML =
      '<p class="crumb"><a href="catalogue.html">Catalogue</a> · ' + L.catName(p.cat) + '</p>' +
      '<div class="detail-grid">' +
      '<div class="detail-media"><img src="' + L.categoryImage(p.cat) + '" alt="' + L.catName(p.cat) + ' products on a shelf"></div>' +
      '<div class="detail-body">' +
      '<h1>' + p.name + '</h1>' +
      '<p class="detail-pack">' + p.pack + ' · ' + L.catName(p.cat) + '</p>' +
      '<p class="detail-price">' + L.formatPKR(p.price) + '</p>' +
      '<p>' + stockBadge(p) + (out ? '' : ' <span class="stock-num" data-stock-num>' + p.stock + ' on the shelf</span>') + '</p>' +
      '<p class="detail-desc">' + p.desc + '</p>' +
      (out
        ? '<p class="notice">Out of stock — the reserve button is disabled because this item cannot be reserved right now. Please ask in store or on WhatsApp about the next delivery.</p>'
        : '<div class="qty-row"><label for="qty">Quantity</label>' +
          '<button class="btn btn-ghost qty-btn" type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
          '<input class="qty-input" id="qty" data-qty-input type="number" min="1" max="' + p.stock + '" value="1" inputmode="numeric">' +
          '<button class="btn btn-ghost qty-btn" type="button" data-qty="1" aria-label="Increase quantity">+</button></div>' +
          '<p class="field-error" data-qty-error role="alert" hidden></p>' +
          '<div class="detail-actions"><button class="btn btn-primary" type="button" data-reserve>Add to pickup basket</button>' +
          '<a class="btn btn-wa" data-wa="' + p.name + '" href="' + L.whatsappLink(p) + '" target="_blank" rel="noopener">Ask on WhatsApp</a></div>' +
          '<p class="fine" data-basket-note role="status"></p>') +
      (out ? '<div class="detail-actions"><button class="btn btn-primary" type="button" disabled aria-disabled="true">Add to pickup basket</button><a class="btn btn-wa" data-wa="' + p.name + '" href="' + L.whatsappLink(p) + '" target="_blank" rel="noopener">Ask on WhatsApp</a></div>' : '') +
      '<p class="fine">' + L.STORE.prescriptionNote + '</p>' +
      '</div></div>';
    var rel = $('[data-related]');
    if (rel) {
      var others = liveProducts().filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).slice(0, 3);
      rel.innerHTML = others.map(cardHTML).join('');
      $('[data-related-wrap]').hidden = others.length === 0;
    }
    if (out) return;
    var input = $('[data-qty-input]'), err = $('[data-qty-error]'), note = $('[data-basket-note]');
    function checkQty(showErr) {
      var v = parseInt(input.value, 10);
      var chk = L.qtyCheck(p.stock, isNaN(v) ? 0 : v);
      if (!chk.ok && showErr) { err.textContent = chk.error; err.hidden = false; }
      if (chk.ok) { err.hidden = true; err.textContent = ''; }
      return chk.ok ? v : null;
    }
    input.addEventListener('input', function () { checkQty(true); });
    $$('[data-qty]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = (parseInt(input.value, 10) || 1) + Number(b.getAttribute('data-qty'));
        input.value = String(Math.max(1, v));
        checkQty(true); input.focus();
      });
    });
    $('[data-reserve]').addEventListener('click', function () {
      var v = checkQty(true); if (v === null) { input.focus(); return; }
      var r = addToBasket(p.id, v);
      if (!r.ok) { err.textContent = r.error; err.hidden = false; return; }
      note.textContent = v + ' × ' + p.name + ' added to your pickup basket (' + basketCount() + ' items total). Continue to Reserve for pickup to confirm.';
    });
  }

  /* ================= RESERVE ================= */
  function initReserve() {
    var host = $('[data-reserve-page]'); if (!host) return;
    var listEl = $('[data-basket-list]'), totalEl = $('[data-basket-total]'), emptyEl = $('[data-basket-empty]');
    var form = $('[data-res-form]'), confirmEl = $('[data-confirm]');
    function renderBasket() {
      var b = basket();
      var items = b.map(function (i) { return { product: liveProduct(i.id), qty: i.qty }; }).filter(function (x) { return x.product; });
      emptyEl.hidden = items.length !== 0;
      form.hidden = items.length === 0;
      var tr0 = $('[data-total-row]'); if (tr0) tr0.hidden = items.length === 0;
      listEl.innerHTML = items.map(function (x) {
        return '<li class="basket-row"><div class="basket-info"><strong>' + x.product.name + '</strong>' +
          '<span>' + x.product.pack + ' · ' + L.formatPKR(x.product.price) + ' each · ' + x.product.stock + ' in stock</span></div>' +
          '<div class="qty-row qty-row-sm"><button class="btn btn-ghost qty-btn" type="button" data-bdec="' + x.product.id + '" aria-label="Decrease quantity">−</button>' +
          '<span class="qty-val" data-bqty="' + x.product.id + '">' + x.qty + '</span>' +
          '<button class="btn btn-ghost qty-btn" type="button" data-binc="' + x.product.id + '" aria-label="Increase quantity">+</button></div>' +
          '<span class="basket-line">' + L.formatPKR(x.product.price * x.qty) + '</span>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-bremove="' + x.product.id + '">Remove</button></li>';
      }).join('');
      totalEl.textContent = L.formatPKR(L.basketTotal(items));
      var errEl = $('[data-basket-error]');
      if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
    }
    listEl.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-binc],[data-bdec],[data-bremove]') : null;
      if (!t) return;
      var errEl = $('[data-basket-error]');
      if (t.hasAttribute('data-bremove')) { removeFromBasket(t.getAttribute('data-bremove')); renderBasket(); return; }
      var id = Number(t.getAttribute('data-binc') || t.getAttribute('data-bdec'));
      var cur = 0; basket().forEach(function (i) { if (i.id === id) cur = i.qty; });
      var next = cur + (t.hasAttribute('data-binc') ? 1 : -1);
      if (next < 1) { removeFromBasket(id); renderBasket(); return; }
      var r = setBasketQty(id, next);
      renderBasket();
      if (!r.ok && errEl) { errEl.textContent = r.error; errEl.hidden = false; }
    });
    /* validation with named errors + live clearing (lessons 25/26) */
    function fieldError(input, msg) {
      var err = document.querySelector('[data-err-for="' + input.id + '"]');
      if (err) { err.textContent = msg || ''; err.hidden = !msg; }
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    var nameEl = $('#res-name'), phoneEl = $('#res-phone'), slotEl = $('#res-slot');
    nameEl.addEventListener('input', function () { var v = L.validateName(nameEl.value); if (v.ok) fieldError(nameEl, ''); });
    phoneEl.addEventListener('input', function () { var v = L.validatePhone(phoneEl.value); if (v.ok) fieldError(phoneEl, ''); });
    slotEl.addEventListener('change', function () { if (slotEl.value) fieldError(slotEl, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nv = L.validateName(nameEl.value), pv = L.validatePhone(phoneEl.value);
      var ok = true;
      if (!fieldError(nameEl, nv.ok ? '' : nv.error)) ok = false;
      if (!fieldError(phoneEl, pv.ok ? '' : pv.error)) ok = false;
      if (!slotEl.value) { fieldError(slotEl, 'Please choose a pickup time from the list.'); ok = false; }
      if (!ok) { (document.querySelector('[aria-invalid="true"]') || nameEl).focus(); return; }
      var items = basket().map(function (i) { var p = liveProduct(i.id); return { id: p.id, name: p.name, qty: i.qty, price: p.price }; });
      /* re-check every line against the live counter before decrementing */
      for (var i = 0; i < items.length; i++) {
        var chk = L.qtyCheck(liveProduct(items[i].id).stock, items[i].qty);
        if (!chk.ok) { var be = $('[data-basket-error]'); be.textContent = items[i].name + ': ' + chk.error; be.hidden = false; return; }
      }
      var total = L.basketTotal(items.map(function (i) { return { product: { price: i.price }, qty: i.qty }; }));
      var ref = L.makeRef(nv.value, pv.intl, items);
      items.forEach(function (i) { setStock(i.id, liveProduct(i.id).stock - i.qty); });
      var all = load('sb_reservations', []);
      all.push({ ref: ref, name: nv.value, phone: pv.value, slot: slotEl.value, items: items, total: total, status: 'Reserved' });
      save('sb_reservations', all);
      save('sb_basket', []); paintBasketCount();
      form.hidden = true; listEl.innerHTML = ''; totalEl.textContent = L.formatPKR(0);
      var tr = $('[data-total-row]'); if (tr) tr.hidden = true;
      confirmEl.hidden = false;
      confirmEl.innerHTML = '<h2>Reservation confirmed — ' + ref + '</h2>' +
        '<p>Thank you, ' + nv.value + '. We will keep these items aside for pickup: <strong>' + slotEl.value + '</strong>.</p>' +
        '<ul>' + items.map(function (i) { return '<li>' + i.qty + ' × ' + i.name + ' — ' + L.formatPKR(i.price * i.qty) + '</li>'; }).join('') + '</ul>' +
        '<p class="confirm-total">Total to pay at pickup: <strong>' + L.formatPKR(total) + '</strong></p>' +
        '<p>' + L.STORE.payNote + '</p>' +
        '<p>See or cancel this reservation any time on <a href="reservations.html">My Reservations</a>. Stock on the product pages has already been updated.</p>';
      confirmEl.setAttribute('tabindex', '-1'); confirmEl.focus();
      window.scrollTo(0, 0);
    });
    renderBasket();
  }

  /* ================= MY RESERVATIONS ================= */
  function initReservations() {
    var host = $('[data-my-res]'); if (!host) return;
    function render() {
      var all = load('sb_reservations', []);
      var empty = $('[data-my-empty]');
      empty.hidden = all.length !== 0;
      host.innerHTML = all.map(function (r, idx) {
        return '<article class="res-card"><div class="res-head"><h3>' + r.ref + '</h3><span class="badge ' + (r.status === 'Cancelled' ? 'badge-out' : 'badge-in') + '">' + r.status + '</span></div>' +
          '<p>' + r.name + ' · ' + r.phone + ' · Pickup: ' + r.slot + '</p>' +
          '<ul>' + r.items.map(function (i) { return '<li>' + i.qty + ' × ' + i.name + ' — ' + L.formatPKR(i.price * i.qty) + '</li>'; }).join('') + '</ul>' +
          '<p class="confirm-total">Total: ' + L.formatPKR(r.total) + ' — pay at pickup.</p>' +
          (r.status === 'Reserved' ? '<button class="btn btn-ghost" type="button" data-cancel="' + idx + '">Cancel reservation &amp; release stock</button>' : '<p class="fine">Cancelled — the reserved stock was returned to the shelf counts.</p>') +
          '</article>';
      }).join('');
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-cancel]') : null;
      if (!b) return;
      var all = load('sb_reservations', []);
      var r = all[Number(b.getAttribute('data-cancel'))];
      if (!r || r.status !== 'Reserved') return;
      r.items.forEach(function (i) { setStock(i.id, liveProduct(i.id).stock + i.qty); });
      r.status = 'Cancelled';
      save('sb_reservations', all);
      render();
    });
    render();
  }

  /* ================= STORE PAGE ================= */
  function initStore() {
    var tbl = $('[data-hours]'); if (!tbl) return;
    var order = [1, 2, 3, 4, 5, 6, 0]; /* Monday first, Sunday last */
    tbl.innerHTML = order.map(function (d) {
      var h = L.STORE.hours[d];
      var today = d === L.STORE.demoClock.day;
      return '<tr' + (today ? ' class="today"' : '') + '><th scope="row">' + L.STORE.dayNames[d] + (today ? ' (today, demo clock)' : '') + '</th><td>' +
        (h ? L.fmtTime(h[0]) + ' – ' + L.fmtTime(h[1]) : 'Closed') + '</td></tr>';
    }).join('');
    var rev = $('[data-reviews]');
    if (rev) rev.innerHTML = L.REVIEWS.map(function (r) {
      return '<article class="review"><p class="stars" aria-label="' + r.stars + ' out of 5 stars">' + '★★★★★'.slice(0, r.stars) + '</p>' +
        '<p>' + r.text + '</p><p class="review-name">' + r.name + '</p></article>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    paintChrome(); initHome(); initCatalogue(); initProduct(); initReserve(); initReservations(); initStore();
  });
})();
