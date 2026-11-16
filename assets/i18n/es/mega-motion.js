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
  onScroll();
})();
