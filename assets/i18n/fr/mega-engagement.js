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
      mainImage.alt = 'Photo de projet MEGA Engineering ' + (index + 1);
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
      root.querySelector('#me-photo-caption').textContent = 'Photo de projet MEGA Engineering · ' + (index+1) + ' of ' + shots.length;
    });
  });
  const options = {
    ethanol: {title:'Éthanol et distillerie',desc:'Découvrez des usines de procédé intégrées et des sections technologiques individuelles.',items:['Fermentation et distillation','Déshydratation sur tamis moléculaire','Évaporation et séchage','Ingénierie des procédés et EPC']},
    cbg: {title:'Biogaz et biométhane',desc:'Parlez des intrants, de la production de biogaz, de l\'épuration et du périmètre de votre projet de biométhane.',items:['Préparation des intrants organiques','Digestion anaérobie','Épuration du biogaz','Compression et stockage du biométhane']},
    co2: {title:'Récupération du CO₂',desc:'Étudiez les options de récupération, de purification et de stockage du gaz de fermentation.',items:['Captage du gaz de fermentation','Lavage et purification du gaz','Liquéfaction','Stockage et manutention']},
    equipment: {title:'Équipements industriels',desc:'Trouvez des équipements de procédé fabriqués et des ensembles modulaires.',items:['Skids de procédé modulaires','Échangeurs de chaleur','Réservoirs de procédé','Ingénierie de détail']}
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
    const subject='Demande de projet - '+get('technology');
    const message=[
      'Demande depuis le site de MEGA Engineering', '',
      'Technology: '+get('technology'),
      'Contact: '+get('name'),
      'Email: '+get('email'),
      'Company: '+get('company'),
      'Country: '+get('country'),
      'Capacité indicative / besoin : '+get('capacity'),
      '', 'Project details:',get('details')
    ].join('\n');
    root.querySelector('#me-form-status').textContent='Votre messagerie va s\'ouvrir avec les détails de la demande. Relisez et envoyez le message pour finaliser votre demande.';
    window.location.href='mailto:sales@mega.tc?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  });
})();
