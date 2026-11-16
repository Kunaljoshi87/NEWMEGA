/* MEGA homepage features, no external libraries; photos are never modified. */
(function () {
  'use strict';
  const root = document.getElementById('mega-engagement');
  if (!root) return;
  const shots = [
    '/NEWMEGA/assets/design-image-01.jpg',
    '/NEWMEGA/assets/design-image-02.jpg',
    '/NEWMEGA/assets/design-image-03.jpg',
    '/NEWMEGA/assets/design-image-04.jpg',
    '/NEWMEGA/assets/design-image-05.jpg',
    '/NEWMEGA/assets/design-image-06.jpg'
  ];
  const mainImage = root.querySelector('#me-featured-image');
  const thumbs = [...root.querySelectorAll('.me-thumb')];
  thumbs.forEach((button,index) => {
    button.addEventListener('click', () => {
      if (!shots[index]) return;
      mainImage.src = shots[index];
      mainImage.alt = 'Фото проекта MEGA Engineering ' + (index + 1);
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
      root.querySelector('#me-photo-caption').textContent = 'Фото проекта MEGA Engineering · ' + (index+1) + ' of ' + shots.length;
    });
  });
  const options = {
    ethanol: {title:'Этанол и спиртовые заводы',desc:'Комплексные технологические установки и отдельные технологические участки.',items:['Брожение и дистилляция','Обезвоживание на молекулярных ситах','Выпаривание и сушка','Технологический инжиниринг и EPC']},
    cbg: {title:'Биогаз и биометан',desc:'Обсудите сырьё, выработку биогаза, очистку и объём проекта по биометану.',items:['Подготовка органического сырья','Анаэробное сбраживание','Очистка биогаза','Компримирование и хранение биометана']},
    co2: {title:'Рекуперация CO₂',desc:'Варианты рекуперации, очистки и хранения газа брожения.',items:['Сбор газа брожения','Промывка и очистка газа','Сжижение','Хранение и обращение']},
    equipment: {title:'Промышленное оборудование',desc:'Изготовленное технологическое оборудование и модульные инженерные комплекты.',items:['Модульные технологические скиды','Теплообменники','Технологические ёмкости','Детальное проектирование']}
  };
  function choose(key) {
    const item = options[key]; if (!item) return;
    root.querySelector('#me-technology-title').textContent=item.title;
    root.querySelector('#me-technology-desc').textContent=item.desc;
    root.querySelector('#me-technology-list').replaceChildren(...item.items.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
    root.querySelector('#me-technology-hidden').value=item.title;
    root.querySelectorAll('.me-tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.technology===key)));
    root.querySelector('#me-technology-info').setAttribute('aria-label',item.title+' capabilities');
  }
  root.querySelectorAll('.me-tab').forEach(t=>t.addEventListener('click',()=>choose(t.dataset.technology)));
  choose('ethanol');
  const form=root.querySelector('#me-enquiry-form');
  form.addEventListener('submit',function(e){
    e.preventDefault(); if (!form.reportValidity()) return;
    const get=(name)=>form.elements[name].value.trim();
    const subject='Запрос по проекту - '+get('technology');
    const message=[
      'Запрос с сайта MEGA Engineering', '',
      'Technology: '+get('technology'),
      'Contact: '+get('name'),
      'Email: '+get('email'),
      'Company: '+get('company'),
      'Country: '+get('country'),
      'Ориентировочная мощность / требования: '+get('capacity'),
      '', 'Project details:',get('details')
    ].join('\n');
    root.querySelector('#me-form-status').textContent='Откроется почтовая программа с данными запроса. Проверьте и отправьте письмо, чтобы завершить запрос.';
    window.location.href='mailto:sales@mega.tc?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  });
})();
