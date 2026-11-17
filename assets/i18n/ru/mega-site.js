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

  // Lead forms: send the enquiry straight to sales@mega.tc (FormSubmit); email app as fallback
  var msgFail = 'Не удалось отправить форму. Откроется ваша почтовая программа с этими данными — нажмите «Отправить». Также можно написать нам:';
  var msgSending = 'Отправляем запрос…';
  var msgOk = 'Спасибо! Ваш запрос отправлен. Мы скоро ответим.';
  document.querySelectorAll('form.lead').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {}, lines = ['Запрос с сайта MEGA Engineering', ''];
      form.querySelectorAll('label').forEach(function (l) {
        var f = l.querySelector('input,select,textarea');
        if (!f) return;
        var name = (l.childNodes[0] && l.childNodes[0].textContent || '').trim();
        data[f.name || name] = (f.value || '').trim();
        lines.push(name + ': ' + (f.value || '').trim());
      });
      lines.push('', 'Page: ' + location.href);
      var subject = form.getAttribute('data-subject') || 'Запрос с сайта';
      var href = 'mailto:sales@mega.tc?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      var msg = form.querySelector('.formmsg'), btn = form.querySelector('button[type="submit"]');
      var say = function (h) { if (msg) msg.innerHTML = h; };
      var fallback = function () {
        say(msgFail + ' <a href="' + href + '">sales@mega.tc</a>');
        window.location.href = href;
      };
      if (!window.fetch) { fallback(); return; }
      data._subject = 'MEGA website: ' + subject; data._template = 'table'; data._captcha = 'false'; data.page = location.href;
      if (data.email) data._replyto = data.email;
      if (btn) btn.disabled = true;
      say(msgSending);
      fetch('https://formsubmit.co/ajax/sales@mega.tc', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (j) {
        if (j && (j.success === true || j.success === 'true')) { form.reset(); say(msgOk); }
        else fallback();
      }).catch(fallback).then(function () { if (btn) btn.disabled = false; });
    });
  });
})();
