/* MEGA motion layer */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('mx-js');

  /* phone menu for the older page templates (their menus have no toggle) */
  [].forEach.call(document.querySelectorAll('header.header, header.mega-head'), function (h) {
    var nav = h.querySelector('nav.nav, nav.mega-nav'); if (!nav || h.querySelector('.mx-menu-btn')) return;
    if (!nav.id) nav.id = 'mx-nav-' + Math.random().toString(36).slice(2, 7);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'mx-menu-btn';
    b.setAttribute('aria-controls', nav.id); b.setAttribute('aria-expanded', 'false'); b.textContent = 'Menú';
    nav.parentNode.insertBefore(b, nav);
    b.addEventListener('click', function () { var o = h.classList.toggle('mx-open'); b.setAttribute('aria-expanded', String(o)); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { h.classList.remove('mx-open'); b.setAttribute('aria-expanded', 'false'); } });
  });

  /* site header: dropdowns, phone menu, current page */
  var hdr = document.querySelector('.mx-header');
  if (hdr) {
    if (document.querySelector('.mx-hero')) root.classList.add('mx-home');
    var burger = hdr.querySelector('.mx-burger');
    var setH = function () { root.style.setProperty('--mx-hh', hdr.getBoundingClientRect().height + 'px'); };
    setH(); addEventListener('resize', setH);
    if (burger) burger.addEventListener('click', function () {
      setH(); var o = root.classList.toggle('mx-navopen'); burger.setAttribute('aria-expanded', String(o));
    });
    [].forEach.call(hdr.querySelectorAll('.mx-sub'), function (b) {
      b.addEventListener('click', function () {
        var li = b.parentNode, o = li.classList.toggle('mx-open'); b.setAttribute('aria-expanded', String(o));
      });
    });
    hdr.addEventListener('click', function (e) {
      if (e.target.closest('.mx-drop a, .mx-menu > li > a.mx-link')) { root.classList.remove('mx-navopen'); if (burger) burger.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { root.classList.remove('mx-navopen'); [].forEach.call(hdr.querySelectorAll('.mx-open'), function (li) { li.classList.remove('mx-open'); }); }
    });
    var here = location.pathname.replace(/\/(es|fr|pt|ru)\//, '/');
    [].forEach.call(hdr.querySelectorAll('a.mx-link'), function (a) {
      var p = a.pathname.replace(/\/(es|fr|pt|ru)\//, '/');
      if (p === here || (p.length > 9 && here.indexOf(p) === 0)) a.setAttribute('aria-current', 'page');
    });
    [].forEach.call(hdr.querySelectorAll('.mx-drop a'), function (a) {
      var p = a.pathname.replace(/\/(es|fr|pt|ru)\//, '/');
      if (p === here && !a.hash) { var top = a.closest('.mx-item').querySelector('a.mx-link'); top.setAttribute('aria-current', 'page'); }
    });
  }
  var hv = document.querySelector('.mx-hero-video');
  if (hv && reduce) { hv.removeAttribute('autoplay'); try { hv.pause(); } catch (e) {} }

  /* header shadow, progress bar, back-to-top */
  var bar = document.createElement('div'); bar.className = 'mx-progress'; document.body.appendChild(bar);
  var top = document.createElement('button'); top.className = 'mx-top'; top.type = 'button';
  top.setAttribute('aria-label', 'Volver arriba');
  top.textContent = '↑'; document.body.appendChild(top);
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    root.classList.toggle('mx-scrolled', y > 10);
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    top.classList.toggle('on', y > 700);
    fillSteps();
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* scroll reveal */
  var SEL = ['main section:not(.mx-hero) h2', 'main section .lede', 'main section .sub', '.facts dl > div', '.mega-card', '.mi-card', '.card', '.point',
    '.seo-link-card', '.editorial-card', '.shots figure', '.seq figure', 'details', '.tbl', '.codes', '.mx-flow', 'ol.steps li',
    '.me-gallery', '.mega-step', '.refs', '.loc', '.vsd .gallery figure', '.vsd h2', '.article p', '.article h2', '.article-shell h2',
    '.mega-section h2', 'footer .grid > div'].join(',');
  var items = [].slice.call(document.querySelectorAll(SEL)).filter(function (el) {
    return !el.closest('header') && !el.closest('.mx-r') && !el.closest('.mx-contact');
  });
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1);
    el.classList.add('mx-r');
    if (el.matches('.shots figure,.seq figure,.vsd .gallery figure')) el.classList.add('mx-z');
    el.style.setProperty('--mx-d', Math.min(i, 6) * 0.08 + 's');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('mx-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('mx-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('mx-in'); else io.observe(el);
    });
  }

  /* counting numbers */
  var NUM = /^(\D{0,3}?)(\d{1,3}(?:[,\s]\d{3})+|\d+(?:\.\d+)?)(.*)$/;
  var counters = [].slice.call(document.querySelectorAll('.facts dt, .mx-facts dt, [class*="stat"] b, [class*="stat"] strong, [class*="kpi"] b, .vsd .num b, .mx-count'))
    .filter(function (el) { return el.children.length === 0 && NUM.test(el.textContent.trim()) && !/[–±-]/.test(el.textContent); });
  function run(el) {
    var m = el.textContent.trim().match(NUM), raw = m[2], sep = (raw.match(/[,\s]/) || [''])[0];
    var dec = (raw.split('.')[1] || '').length, target = parseFloat(raw.replace(/[,\s]/g, ''));
    var start = (target >= 1900 && target <= 2100 && !dec) ? target - 30 : 0, t0 = null, dur = 1600;
    function fmt(v) {
      var s = dec ? v.toFixed(dec) : String(Math.round(v));
      if (sep && !dec) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      return m[1] + s + m[3];
    }
    function step(ts) {
      if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(start + (target - start) * e);
      if (k < 1) requestAnimationFrame(step); else el.textContent = m[0];
    }
    el.textContent = fmt(start); requestAnimationFrame(step);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* vertical step lists: progress line follows scroll */
  var lists = [].slice.call(document.querySelectorAll('ol.steps'));
  function fillSteps() {
    lists.forEach(function (ol) {
      var lis = ol.children, mid = innerHeight * 0.6;
      for (var i = 0; i < lis.length; i++) {
        var r = lis[i].getBoundingClientRect(), f = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
        lis[i].style.setProperty('--mx-fill', (f * 100).toFixed(0) + '%');
      }
    });
  }

  /* homepage process overview: travelling highlight across the steps */
  var steps = document.getElementById('mi-steps');
  if (steps && !reduce) {
    var k = 0;
    setInterval(function () {
      var s = steps.querySelectorAll('.mi-step'); if (!s.length) return;
      s.forEach(function (x) { x.classList.remove('mx-live'); });
      s[k % s.length].classList.add('mx-live'); k++;
    }, 1400);
  }
  /* SVG flow graphics: keep translated labels inside their boxes */
  [].forEach.call(document.querySelectorAll('.mx-flow .node'), function (g) {
    var rect = g.querySelector('rect'); if (!rect) return;
    var max = parseFloat(rect.getAttribute('width')) - 10;
    [].forEach.call(g.querySelectorAll('text'), function (t) {
      try {
        if (t.getComputedTextLength() > max) t.style.fontSize = (t.classList.contains('sub') ? 9.5 : 11.5) + 'px';
        if (t.getComputedTextLength() > max) { t.setAttribute('textLength', max); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
      } catch (e) {}
    });
  });
  /* project slider: buttons, dots, swipe, autoplay (paused on hover/focus or reduced motion) */
  [].forEach.call(document.querySelectorAll('.mx-slider'), function (sl) {
    var track = sl.querySelector('.mx-track'), slides = track ? track.children : [], n = slides.length;
    if (!n) return;
    var dots = sl.querySelector('.mx-dots'), idx = 0, timer = null, label = 'Ir al proyecto ';
    var go = function (i) {
      idx = (i + n) % n; track.style.transform = 'translateX(' + (-100 * idx) + '%)';
      for (var k = 0; k < n; k++) {
        slides[k].setAttribute('aria-hidden', String(k !== idx));
        var a = slides[k].querySelector('a'); if (a) a.tabIndex = k === idx ? 0 : -1;
        if (dots && dots.children[k]) dots.children[k].setAttribute('aria-current', String(k === idx));
      }
    };
    if (dots) for (var d = 0; d < n; d++) (function (d) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', label + (d + 1));
      b.addEventListener('click', function () { go(d); restart(); }); dots.appendChild(b);
    })(d);
    var prev = sl.querySelector('.mx-sl-prev'), next = sl.querySelector('.mx-sl-next');
    if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () { if (!timer) timer = setInterval(function () { go(idx + 1); }, 4000); };
    var restart = function () { stop(); start(); };
    sl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(idx - 1); restart(); } else if (e.key === 'ArrowRight') { go(idx + 1); restart(); }
    });
    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); start();
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    go(0); start();
  });
  /* trust strip: keep one line; if it is wider than the screen, scroll it like a ticker */
  var trust = document.querySelector('.mx-trust');
  if (trust) {
    var fit = function () {
      if (trust.classList.contains('mx-tick')) return;
      if (trust.scrollWidth <= trust.clientWidth + 2) return;
      var row = document.createElement('div'); row.className = 'mx-tick-row';
      while (trust.firstChild) row.appendChild(trust.firstChild);
      var copy = row.cloneNode(true); copy.setAttribute('aria-hidden', 'true');
      trust.appendChild(row); trust.appendChild(copy); trust.classList.add('mx-tick');
    };
    fit(); addEventListener('resize', fit);
  }
  /* WhatsApp chat button (number in one place) */
  var WA_NUMBER = '917276011520';
  if (!document.querySelector('.mx-wa')) {
    var wa = document.createElement('a'); wa.className = 'mx-wa';
    wa.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Hola, MEGA Engineering. Me gustaría hablar de mi proyecto con su equipo.');
    wa.target = '_blank'; wa.rel = 'noopener'; wa.setAttribute('aria-label', 'Escríbanos por WhatsApp');
    wa.innerHTML = '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.3 10.3 0 0 1-1.7-5.7C5.1 9.9 10 5.1 16 5.1s10.9 4.8 10.9 10.7S22 26.4 16 26.4zm6-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>';
    document.body.appendChild(wa);
  }
  onScroll();
})();
