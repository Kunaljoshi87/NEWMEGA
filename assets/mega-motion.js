/* MEGA motion layer */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  root.classList.add('mx-js');

  /* header shadow, progress bar, back-to-top */
  var bar = document.createElement('div'); bar.className = 'mx-progress'; document.body.appendChild(bar);
  var top = document.createElement('button'); top.className = 'mx-top'; top.type = 'button';
  top.setAttribute('aria-label', 'Back to top');
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
  var SEL = ['main section h2', 'main section .lede', 'main section .sub', '.facts dl > div', '.mega-card', '.mi-card', '.card', '.point',
    '.seo-link-card', '.editorial-card', '.shots figure', '.seq figure', 'details', '.tbl', '.codes', '.mx-flow', 'ol.steps li',
    '.me-gallery', '.mega-step', '.refs', '.loc', '.vsd .gallery figure', '.vsd h2', '.article p', '.article h2', '.article-shell h2',
    '.mega-section h2', 'footer .grid > div'].join(',');
  var items = [].slice.call(document.querySelectorAll(SEL)).filter(function (el) {
    return !el.closest('header') && !el.closest('.mx-r');
  });
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1);
    el.classList.add('mx-r');
    if (el.matches('.shots figure,.seq figure,.vsd .gallery figure')) el.classList.add('mx-z');
    if (el.matches('ol.steps li')) el.classList.add('mx-l');
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
  var counters = [].slice.call(document.querySelectorAll('.facts dt, [class*="stat"] b, [class*="stat"] strong, [class*="kpi"] b, .vsd .num b, .mx-count'))
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
