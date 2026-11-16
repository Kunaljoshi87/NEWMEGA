/* MEGA site: mobile menu, reference bar animation, enquiry forms */
(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('mainnav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  var bars = document.getElementById('refbars');
  if (bars) {
    var done = function () { bars.classList.remove('pre'); };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { done(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(bars);
      setTimeout(done, 5000);
    } else { done(); }
  }

  // Lead forms: open the visitor's email app with the enquiry filled in, addressed to sales
  document.querySelectorAll('form.lead').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (email && email.value && !email.checkValidity()) { email.reportValidity(); return; }
      var lines = ['Запрос с сайта MEGA Engineering', ''];
      form.querySelectorAll('label').forEach(function (l) {
        var f = l.querySelector('input,select,textarea');
        if (!f) return;
        var name = (l.childNodes[0] && l.childNodes[0].textContent || '').trim();
        lines.push(name + ': ' + (f.value || '').trim());
      });
      lines.push('', 'Page: ' + location.href);
      var subject = form.getAttribute('data-subject') || 'Запрос с сайта';
      var href = 'mailto:sales@mega.tc?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var msg = form.querySelector('.formmsg');
      if (msg) msg.innerHTML = 'Откроется почтовая программа с этими данными. Нажмите «Отправить». Если она не открылась, напишите на <a href="' + href + '">sales@mega.tc</a>.';
      window.location.href = href;
    });
  });
})();
