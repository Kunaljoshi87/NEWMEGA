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
      mainImage.alt = 'Fotografía de proyecto de MEGA Engineering ' + (index + 1);
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
      root.querySelector('#me-photo-caption').textContent = 'Fotografía de proyecto de MEGA Engineering · ' + (index+1) + ' of ' + shots.length;
    });
  });
  const options = {
    ethanol: {title:'Etanol y destilería',desc:'Descubra plantas de proceso integradas y secciones tecnológicas individuales.',items:['Fermentación y destilación','Deshidratación con tamiz molecular','Evaporación y secado','Ingeniería de procesos y EPC']},
    cbg: {title:'Biogás y GNC renovable',desc:'Hable de materia prima, generación de biogás, purificación y alcance del proyecto de GNC renovable.',items:['Preparación de la materia orgánica','Digestión anaeróbica','Purificación del biogás','Compresión y almacenamiento de GNC renovable']},
    co2: {title:'Recuperación de CO₂',desc:'Revise opciones de recuperación, purificación y almacenamiento del gas de fermentación.',items:['Captación del gas de fermentación','Lavado y purificación del gas','Licuefacción','Almacenamiento y manipulación']},
    equipment: {title:'Equipos industriales',desc:'Encuentre equipos de proceso fabricados y paquetes modulares de ingeniería.',items:['Skids de proceso modulares','Intercambiadores de calor','Recipientes de proceso','Ingeniería de detalle']}
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
    const subject='Consulta de proyecto - '+get('technology');
    const message=[
      'Consulta desde el sitio web de MEGA Engineering', '',
      'Technology: '+get('technology'),
      'Contact: '+get('name'),
      'Email: '+get('email'),
      'Company: '+get('company'),
      'Country: '+get('country'),
      'Capacidad orientativa / requisito: '+get('capacity'),
      '', 'Project details:',get('details')
    ].join('\n');
    root.querySelector('#me-form-status').textContent='Su aplicación de correo se abrirá con los datos de la consulta. Revise y envíe el mensaje para completar su consulta.';
    window.location.href='mailto:sales@mega.tc?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  });
})();
