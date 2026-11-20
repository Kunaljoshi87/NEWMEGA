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
      mainImage.alt = 'MEGA Engineering project photograph ' + (index + 1);
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
      root.querySelector('#me-photo-caption').textContent = 'MEGA Engineering project photograph · ' + (index+1) + ' of ' + shots.length;
    });
  });
  const options = {
    ethanol: {title:'الإيثانول ومعامل التقطير',desc:'استكشف محطات المعالجة المتكاملة وأقسام التقنية المنفردة.',items:['التخمير والتقطير','التجفيف بالمناخل الجزيئية','التبخير والتجفيف','هندسة العمليات وEPC']},
    cbg: {title:'الغاز الحيوي والغاز الحيوي المضغوط',desc:'Discuss feedstock, biogas generation, purification and CBG project scope.',items:['Organic feedstock preparation','الهضم اللاهوائي','Biogas purification','CBG compression and storage']},
    co2: {title:'استرجاع CO₂',desc:'Review recovery, purification and storage options for fermentation gas.',items:['Fermentation gas collection','Gas washing and purification','التسييل','Storage and handling']},
    equipment: {title:'Industrial Equipment',desc:'Find fabricated process equipment and modular engineered packages.',items:['وحدات المعالجة المعيارية','Heat exchangers','Process vessels','الهندسة التفصيلية']}
  };
  function choose(key) {
    const item = options[key]; if (!item) return;
    root.querySelector('#me-technology-title').textContent=item.title;
    root.querySelector('#me-technology-desc').textContent=item.desc;
    root.querySelector('#me-technology-list').replaceChildren(...item.items.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
    const hid=root.querySelector('#me-technology-hidden'); if(hid) hid.value=item.title;
    root.querySelectorAll('.me-tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.technology===key)));
    root.querySelector('#me-technology-info').setAttribute('aria-label',item.title+' capabilities');
  }
  root.querySelectorAll('.me-tab').forEach(t=>t.addEventListener('click',()=>choose(t.dataset.technology)));
  choose('ethanol');
  const form=root.querySelector('#me-enquiry-form');
  if(form) form.addEventListener('submit',function(e){
    e.preventDefault(); if (!form.reportValidity()) return;
    const get=(name)=>form.elements[name].value.trim();
    const subject='Project enquiry - '+get('technology');
    const message=[
      'MEGA Engineering website enquiry', '',
      'Technology: '+get('technology'),
      'Contact: '+get('name'),
      'Email: '+get('email'),
      'Company: '+get('company'),
      'Country: '+get('country'),
      'Indicative capacity / requirement: '+get('capacity'),
      '', 'Project details:',get('details')
    ].join('\n');
    root.querySelector('#me-form-status').textContent='Your email application will open with the enquiry details. Review and send the message to complete your enquiry.';
    window.location.href='mailto:sales@mega.tc?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  });
})();
