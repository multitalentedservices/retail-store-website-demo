/* Sehat Bazaar Pharmacy (DEMO) — premium layer (2026-11-22).
   Index page only. Adds: the care-journey flow (route → review → reserve),
   the refill & regulars demo module, the Swiper category rail, and
   reveal-on-scroll. All facts come from SBLogic (the ONE data object);
   the stock counter (sb_stock) is never read or written here — journey and
   refill surfaces print no stock numbers, so the counter stays exact.
   Without JS, or with reduced motion, every block below is static and
   complete in the HTML/CSS alone. */
(function () {
  'use strict';
  var L = window.SBLogic;
  if (!L) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Static capture mode (?static=1 / data-static): reveals are never armed
     (everything at its natural visible state) and the category tiles stay
     the static grid. Journey + refill are functional and run unchanged. */
  var STATIC = /[?&]static=1(?:&|$)/.test(window.location.search) || document.documentElement.hasAttribute('data-static');
  if (STATIC) document.documentElement.setAttribute('data-static', '');
  document.documentElement.classList.add('px');

  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }

  /* ---------- reveal-on-scroll: once, staggered, can never strand content --
     Only elements BELOW the fold at load are armed (hidden); anything already
     on screen stays visible. A safety sweep force-reveals (snapped, no fade)
     any armed element the reader has already scrolled to or past, so a fast
     scroll — or a throttled observer — can never leave a blank block. */
  function initReveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!els.length) return;
    if (reduced || STATIC || !('IntersectionObserver' in window)) return; /* nothing armed: all visible */
    var vh = window.innerHeight;
    var armed = els.filter(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.95) { el.classList.add('armed'); return true; }
      return false;
    });
    if (!armed.length) return;
    function reveal(el, snap) {
      if (snap) el.classList.add('snap');
      el.classList.add('in');
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.transitionDelay = ((armed.indexOf(el) % 3) * 75) + 'ms';
        reveal(el, false);
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    armed.forEach(function (el) { io.observe(el); });
    function sweep() {
      armed.forEach(function (el) {
        if (!el.classList.contains('in') && el.getBoundingClientRect().top < window.innerHeight) {
          el.style.transitionDelay = '0ms';
          reveal(el, true);
          io.unobserve(el);
        }
      });
    }
    window.addEventListener('scroll', sweep, { passive: true });
    setInterval(sweep, 700);
    /* Failsafe: 1.6s after load, nothing stays hidden — elements the reader
       has not reached yet simply appear in their designed static state when
       reached (off-screen, so no visible pop), and no capture or fast
       scroll can ever record a blank block. */
    setTimeout(function () {
      armed.forEach(function (el) {
        if (!el.classList.contains('in')) { el.style.transitionDelay = '0ms'; reveal(el, true); io.unobserve(el); }
      });
    }, 1600);
  }

  /* ---------- Swiper category rail: the tiles grid is the static state ---- */
  function initRail() {
    var host = document.querySelector('[data-cat-tiles]');
    if (!host || !window.Swiper || !host.children.length) return;
    var tiles = Array.prototype.slice.call(host.children);
    var wrap = document.createElement('div');
    wrap.className = 'swiper-wrapper';
    tiles.forEach(function (tile) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.appendChild(tile);
      wrap.appendChild(slide);
    });
    host.appendChild(wrap);
    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'rail-btn rail-prev'; prev.setAttribute('aria-label', 'Previous categories'); prev.textContent = '‹';
    var next = document.createElement('button');
    next.type = 'button'; next.className = 'rail-btn rail-next'; next.setAttribute('aria-label', 'Next categories'); next.textContent = '›';
    var pag = document.createElement('div');
    pag.className = 'swiper-pagination';
    host.appendChild(prev); host.appendChild(next); host.appendChild(pag);
    host.classList.add('swiper', 'cat-rail');
    new window.Swiper(host, {
      slidesPerView: 'auto',
      spaceBetween: 16,
      keyboard: { enabled: true },
      navigation: { nextEl: next, prevEl: prev },
      pagination: { el: pag, clickable: true },
      a11y: { enabled: true }
    });
  }

  /* ---------- care journey: route → review → reserve ---------------------- */
  function initJourney() {
    var host = document.querySelector('[data-journey]');
    if (!host) return;
    var chips = Array.prototype.slice.call(host.querySelectorAll('[data-route]'));
    var steps = {
      1: host.querySelector('[data-jstep="1"]'),
      2: host.querySelector('[data-jstep="2"]'),
      3: host.querySelector('[data-jstep="3"]')
    };
    var review = host.querySelector('[data-journey-review]');
    var reviewNote = host.querySelector('[data-journey-review-note]');
    var reserveBtn = host.querySelector('[data-journey-reserve]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
        steps[1].classList.add('is-done'); steps[1].classList.remove('is-active');
        steps[2].classList.add('is-active'); steps[3].classList.remove('is-done');
        var route = chip.getAttribute('data-route');
        if (route === 'counter') {
          review.textContent = 'No shelf picked — that is fine. The counter is the route: call ' + L.STORE.phoneDisplay +
            ' or ask about any product on WhatsApp from its catalogue page, and the store page carries the hours and address.';
          reviewNote.textContent = L.STORE.prescriptionNote;
          reserveBtn.textContent = 'Visit the store page';
          reserveBtn.setAttribute('href', 'store.html');
          steps[2].classList.add('is-done'); steps[3].classList.add('is-active');
          return;
        }
        var items = L.filterProducts(L.PRODUCTS, { cat: route });
        var first = items.slice(0, 3).map(function (p) { return p.name + ' (' + L.formatPKR(p.price) + ')'; }).join(' · ');
        review.textContent = L.catName(route) + ' — ' + items.length + ' products on this shelf. First to look for: ' + first + '.';
        reviewNote.textContent = 'Full shelf, with the live stock badge on every product, is one click away in step 3.';
        reserveBtn.textContent = 'Browse & reserve — ' + L.catName(route);
        reserveBtn.setAttribute('href', 'catalogue.html?cat=' + route);
        steps[2].classList.add('is-done'); steps[3].classList.add('is-active');
      });
    });
  }

  /* ---------- refill & regulars demo module ------------------------------- */
  function initRefill() {
    var form = document.querySelector('[data-refill-form]');
    if (!form) return;
    var confirm = document.querySelector('[data-refill-confirm]');
    function fieldError(input, msg) {
      var err = form.querySelector('[data-err-for="' + input.id + '"]');
      if (err) { err.textContent = msg || ''; err.hidden = !msg; }
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    var nameEl = document.getElementById('rf-name'), phoneEl = document.getElementById('rf-phone'),
      prodEl = document.getElementById('rf-product'), cycleEl = document.getElementById('rf-cycle'),
      consentEl = document.getElementById('rf-consent');
    nameEl.addEventListener('input', function () { if (L.validateName(nameEl.value).ok) fieldError(nameEl, ''); });
    phoneEl.addEventListener('input', function () { if (L.validatePhone(phoneEl.value).ok) fieldError(phoneEl, ''); });
    [prodEl, cycleEl].forEach(function (el) { el.addEventListener('change', function () { if (el.value) fieldError(el, ''); }); });
    consentEl.addEventListener('change', function () { if (consentEl.checked) fieldError(consentEl, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nv = L.validateName(nameEl.value), pv = L.validatePhone(phoneEl.value);
      var ok = true;
      if (!fieldError(nameEl, nv.ok ? '' : nv.error)) ok = false;
      if (!fieldError(phoneEl, pv.ok ? '' : pv.error)) ok = false;
      if (!fieldError(prodEl, prodEl.value ? '' : 'Please choose the item you buy regularly.')) ok = false;
      if (!fieldError(cycleEl, cycleEl.value ? '' : 'Please choose a reminder rhythm.')) ok = false;
      if (!fieldError(consentEl, consentEl.checked ? '' : 'Please tick the box so we know you understand this demo list stays in this browser.')) ok = false;
      if (!ok) { var bad = form.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
      var product = L.productById(prodEl.value);
      var list = load('sb_refills', []);
      list.push({ name: nv.value, phone: pv.value, productId: product.id, cycle: cycleEl.value, at: L.STORE.demoClock.label });
      save('sb_refills', list);
      form.hidden = true;
      confirm.hidden = false;
      confirm.innerHTML = '<h2>Added to your regulars list — demo</h2>' +
        '<p>Thank you, ' + nv.value + '. Your regular item is <strong>' + product.name + '</strong> (' + product.pack + '), ' +
        'with a reminder rhythm of <strong>' + cycleEl.value.toLowerCase() + '</strong>.</p>' +
        '<p>In this demo the list lives only in this browser — nothing was sent anywhere and nothing will be supplied through this website. ' +
        'When the item runs low, reserve it from the <a href="catalogue.html?cat=' + product.cat + '">catalogue</a> and pay at pickup.</p>' +
        '<p class="fine">' + L.STORE.prescriptionNote + '</p>';
      confirm.setAttribute('tabindex', '-1'); confirm.focus();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveals(); if (!STATIC) initRail(); initJourney(); initRefill();
  });
})();
