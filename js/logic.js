/* Sehat Bazaar Pharmacy (DEMO) — pure logic module.
   ONE data object (STORE) owns every fact the site renders: products, stock,
   hours, reviews, pickup slots. The same module powers the site (browser)
   and the Node test battery — drift is impossible by construction (lesson 46).
   No DOM, no storage, no network in this file. */
(function (global) {
  'use strict';

  var LOW_STOCK_THRESHOLD = 5; /* stock <= 5 (and > 0) renders "Low stock" */

  var STORE = {
    name: 'Sehat Bazaar Pharmacy',
    tagline: 'Your neighbourhood pharmacy catalogue — reserve online, pay at pickup.',
    address: 'Shop 4, Main Bazaar Road, Gujranwala, Punjab (fictional demo address)',
    phoneDisplay: '+92 300 123 4567',
    phoneIntl: '923001234567',
    /* Fixed printed demo clock: Sunday 22 November 2026, 11:30 AM PKT (lesson 29). */
    demoClock: { label: 'Sunday 22 Nov 2026, 11:30 AM PKT', day: 0, minutes: 11 * 60 + 30 },
    /* hours[day] = [openMinutes, closeMinutes] or null when closed. Day 0 = Sunday. */
    hours: [
      [9 * 60, 14 * 60],   /* Sunday    9:00 AM – 2:00 PM */
      [8 * 60, 22 * 60],   /* Monday    8:00 AM – 10:00 PM */
      [8 * 60, 22 * 60],   /* Tuesday */
      [8 * 60, 22 * 60],   /* Wednesday */
      [8 * 60, 22 * 60],   /* Thursday */
      [8 * 60, 22 * 60],   /* Friday */
      [8 * 60, 22 * 60]    /* Saturday */
    ],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    pickupSlots: [
      'Today, 1:00 PM', 'Today, 4:00 PM', 'Today, 7:00 PM',
      'Tomorrow, 10:00 AM', 'Tomorrow, 1:00 PM'
    ],
    prescriptionNote: 'Prescription medicines are dispensed in-store only against a valid prescription and are not sold through this demo website.',
    payNote: 'Pay at pickup — this demo takes no payment.'
  };

  var CATEGORIES = [
    { id: 'vitamins', name: 'Vitamins & Supplements', img: 'assets/cat-vitamins.jpg', blurb: 'Everyday vitamins and food supplements.' },
    { id: 'personal', name: 'Personal Care', img: 'assets/cat-personal.jpg', blurb: 'Skin, hair and daily hygiene essentials.' },
    { id: 'firstaid', name: 'First Aid', img: 'assets/cat-firstaid.jpg', blurb: 'Bandages, dressings and home first-aid basics.' },
    { id: 'baby', name: 'Baby & Mother Care', img: 'assets/cat-baby.jpg', blurb: 'Diapers, wipes and gentle baby care.' },
    { id: 'devices', name: 'Health Devices', img: 'assets/cat-devices.jpg', blurb: 'Home health-monitoring devices.' }
  ];

  /* stock is the ONE inventory counter (lessons 38/46). Product 3 sits exactly
     AT the low-stock threshold (lesson 41: boundary in the data). */
  var PRODUCTS = [
    { id: 1,  name: 'Daily Multivitamin Tablets',      cat: 'vitamins', pack: '30 tablets',   price: 850,  stock: 24, featured: true,  desc: 'A once-a-day multivitamin tablet with a balanced mix of everyday vitamins and minerals for adults.' },
    { id: 2,  name: 'Vitamin C 500 mg Chewable Tablets', cat: 'vitamins', pack: '20 tablets', price: 620,  stock: 12, featured: false, desc: 'Chewable orange-flavour vitamin C tablets, 500 mg each. A food supplement — not a medicine.' },
    { id: 3,  name: 'Vitamin D3 1000 IU Softgels',     cat: 'vitamins', pack: '30 softgels',  price: 990,  stock: 5,  featured: true,  desc: 'Vitamin D3 softgel capsules, 1000 IU each, for daily supplementation as part of a balanced diet.' },
    { id: 4,  name: 'Omega-3 Fish Oil Capsules',       cat: 'vitamins', pack: '60 capsules',  price: 1450, stock: 0,  featured: false, desc: 'Fish oil capsules providing omega-3 fatty acids (EPA and DHA) as a daily food supplement.' },
    { id: 5,  name: 'Gentle Moisturising Lotion',      cat: 'personal', pack: '200 ml bottle', price: 540, stock: 18, featured: false, desc: 'Fragrance-light daily moisturising lotion for dry skin, for face and body use.' },
    { id: 6,  name: 'Herbal Shampoo — Aloe & Amla',    cat: 'personal', pack: '340 ml bottle', price: 475, stock: 9,  featured: false, desc: 'Mild everyday shampoo with aloe and amla extracts for all hair types.' },
    { id: 7,  name: 'Fluoride Toothpaste — Fresh Mint', cat: 'personal', pack: '150 g tube',   price: 260, stock: 32, featured: false, desc: 'Fluoride toothpaste for daily brushing, fresh mint flavour.' },
    { id: 8,  name: 'Antibacterial Hand Wash',         cat: 'personal', pack: '250 ml pump',   price: 320, stock: 3,  featured: false, desc: 'Liquid hand wash for everyday hand hygiene at home.' },
    { id: 9,  name: 'Adhesive Bandages — Assorted',    cat: 'firstaid', pack: 'Box of 40',     price: 180, stock: 45, featured: false, desc: 'Assorted sterile adhesive bandages for minor cuts and grazes at home.' },
    { id: 10, name: 'Antiseptic Liquid',               cat: 'firstaid', pack: '250 ml bottle', price: 350, stock: 14, featured: false, desc: 'First-aid antiseptic liquid for cleaning minor wounds and for general household hygiene use.' },
    { id: 11, name: 'Elastic Crepe Bandage',           cat: 'firstaid', pack: '7.5 cm × 4.5 m', price: 210, stock: 7,  featured: false, desc: 'Stretch crepe bandage for supporting and securing dressings.' },
    { id: 12, name: 'Baby Diapers — Size 3',           cat: 'baby',     pack: 'Pack of 36',    price: 1850, stock: 11, featured: true, desc: 'Absorbent baby diapers, size 3 (6–11 kg), with a soft breathable liner.' },
    { id: 13, name: 'Baby Wipes — Fragrance-Free',     cat: 'baby',     pack: 'Pack of 72',    price: 420, stock: 20, featured: false, desc: 'Thick, fragrance-free baby wipes for gentle everyday cleaning.' },
    { id: 14, name: 'Gentle Baby Wash',                cat: 'baby',     pack: '200 ml bottle', price: 560, stock: 6,  featured: false, desc: 'Mild, tear-free baby wash for bath time, suitable for newborn skin.' },
    { id: 15, name: 'Digital Blood Pressure Monitor',  cat: 'devices',  pack: '1 unit + cuff', price: 4250, stock: 4, featured: true,  desc: 'Automatic upper-arm blood pressure monitor with a large display and memory for home readings.' },
    { id: 16, name: 'Digital Thermometer',             cat: 'devices',  pack: '1 unit',        price: 650, stock: 27, featured: false, desc: 'Fast-read digital thermometer with beeper alert and last-reading memory.' },
    { id: 17, name: 'Fingertip Pulse Oximeter',        cat: 'devices',  pack: '1 unit',        price: 2950, stock: 2, featured: false, desc: 'Fingertip pulse oximeter showing oxygen saturation and pulse rate on an OLED display.' },
    { id: 18, name: 'Digital Weighing Scale',          cat: 'devices',  pack: '1 unit',        price: 3400, stock: 8, featured: false, desc: 'Tempered-glass digital bathroom scale, up to 180 kg, with auto on/off.' }
  ];

  var REVIEWS = [
    { name: 'Ayesha K. (demo)', stars: 5, text: 'Reserved baby diapers in the morning and picked them up the same afternoon. The counter staff had the bag ready.' },
    { name: 'Bilal R. (demo)', stars: 5, text: 'The catalogue shows real stock counts, so I did not waste a trip. Prices matched the shelf when I paid at pickup.' },
    { name: 'Fatima S. (demo)', stars: 4, text: 'Easy WhatsApp enquiry about a BP monitor — they replied with the exact model on the shelf. Friendly local store.' },
    { name: 'Usman T. (demo)', stars: 5, text: 'Our family has used this pharmacy for years. The reserve-for-pickup option makes the evening rush much easier.' }
  ];

  function catName(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].name;
    return id;
  }
  function productById(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === Number(id)) return PRODUCTS[i];
    return null;
  }
  function categoryImage(catId) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === catId) return CATEGORIES[i].img;
    return CATEGORIES[0].img;
  }

  /* Stock state is computed from the counter only. */
  function stockState(stock) {
    if (stock <= 0) return { key: 'out', label: 'Out of stock' };
    if (stock <= LOW_STOCK_THRESHOLD) return { key: 'low', label: 'Low stock — only ' + stock + ' left' };
    return { key: 'in', label: 'In stock' };
  }

  /* Boundary pair (lesson 33): qty == stock passes; stock + 1 is rejected. */
  function qtyCheck(stock, qty) {
    if (!Number.isInteger(qty) || qty < 1) return { ok: false, error: 'Quantity must be at least 1.' };
    if (qty > stock) return { ok: false, error: 'Only ' + stock + ' in stock — quantity ' + qty + ' is more than the shelf holds.' };
    return { ok: true };
  }

  function filterProducts(list, opts) {
    opts = opts || {};
    var q = (opts.q || '').trim().toLowerCase();
    var out = list.filter(function (p) {
      if (opts.cat && opts.cat !== 'all' && p.cat !== opts.cat) return false;
      if (opts.inStockOnly && p.stock <= 0) return false;
      if (q && (p.name + ' ' + catName(p.cat) + ' ' + p.pack).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var sort = opts.sort || 'name-asc';
    out = out.slice();
    if (sort === 'price-asc') out.sort(function (a, b) { return a.price - b.price || a.id - b.id; });
    else if (sort === 'price-desc') out.sort(function (a, b) { return b.price - a.price || a.id - b.id; });
    else if (sort === 'name-desc') out.sort(function (a, b) { return b.name.localeCompare(a.name); });
    else out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return out;
  }

  function basketTotal(items) { /* items: [{product, qty}] */
    var total = 0;
    items.forEach(function (it) { total += it.product.price * it.qty; });
    return total;
  }

  function formatPKR(n) { return 'PKR ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function validateName(name) {
    var v = (name || '').trim();
    if (v.length < 3) return { ok: false, error: 'Please enter your full name (at least 3 characters).' };
    if (!/[A-Za-z]/.test(v)) return { ok: false, error: 'Your name must contain letters.' };
    return { ok: true, value: v };
  }

  /* Pakistani mobile: 03XXXXXXXXX (11 digits) or +92 3XXXXXXXXX. */
  function validatePhone(raw) {
    var d = String(raw || '').replace(/[\s\-()]/g, '');
    if (d.indexOf('+92') === 0) d = '0' + d.slice(3);
    else if (d.indexOf('92') === 0 && d.length === 12) d = '0' + d.slice(2);
    if (!/^03\d{9}$/.test(d)) return { ok: false, error: 'Enter a valid Pakistani mobile number: 03 followed by 9 more digits (11 digits total).' };
    return { ok: true, value: d, intl: '92' + d.slice(1) };
  }

  /* Deterministic-style reservation reference from the reservation contents. */
  function makeRef(name, phoneIntl, items) {
    var s = name + '|' + phoneIntl + '|' + items.map(function (i) { return i.id + 'x' + i.qty; }).join(',');
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h * 31) + s.charCodeAt(i)) >>> 0; }
    return 'RS-DEMO-' + (1000 + (h % 9000));
  }

  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  /* Open/closed vs a {day, minutes} instant. Boundary: exactly at close = closed;
     exactly at open = open. */
  function openStateAt(day, minutes) {
    var h = STORE.hours[day];
    if (!h) return { open: false, label: 'Closed today' };
    if (minutes >= h[0] && minutes < h[1]) {
      return { open: true, label: 'Open now — closes ' + fmtTime(h[1]) };
    }
    if (minutes < h[0]) return { open: false, label: 'Closed — opens today at ' + fmtTime(h[0]) };
    return { open: false, label: 'Closed — opens ' + STORE.dayNames[(day + 1) % 7] + ' at ' + fmtTime(STORE.hours[(day + 1) % 7][0]) };
  }

  function whatsappLink(product) {
    var text = 'Assalam-o-Alaikum, I have a question about "' + product.name + '" (' + product.pack + ', ' +
      formatPKR(product.price) + ') listed on the Sehat Bazaar Pharmacy demo catalogue.';
    return 'https://wa.me/' + STORE.phoneIntl + '?text=' + encodeURIComponent(text);
  }

  var api = {
    STORE: STORE, CATEGORIES: CATEGORIES, PRODUCTS: PRODUCTS, REVIEWS: REVIEWS,
    LOW_STOCK_THRESHOLD: LOW_STOCK_THRESHOLD,
    catName: catName, productById: productById, categoryImage: categoryImage,
    stockState: stockState, qtyCheck: qtyCheck, filterProducts: filterProducts,
    basketTotal: basketTotal, formatPKR: formatPKR,
    validateName: validateName, validatePhone: validatePhone,
    makeRef: makeRef, fmtTime: fmtTime, openStateAt: openStateAt, whatsappLink: whatsappLink
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.SBLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
