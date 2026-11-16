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
      mainImage.alt = 'Foto de projeto da MEGA Engineering ' + (index + 1);
      thumbs.forEach((b,i) => b.setAttribute('aria-pressed',String(i===index)));
      root.querySelector('#me-photo-caption').textContent = 'Foto de projeto da MEGA Engineering · ' + (index+1) + ' of ' + shots.length;
    });
  });
  const options = {
    ethanol: {title:'Etanol e destilaria',desc:'Conheça plantas de processo integradas e seções tecnológicas individuais.',items:['Fermentação e destilação','Desidratação com peneira molecular','Evaporação e secagem','Engenharia de processos e EPC']},
    cbg: {title:'Biogás e biometano',desc:'Fale sobre matéria-prima, geração de biogás, purificação e escopo do projeto de biometano.',items:['Preparação da matéria orgânica','Digestão anaeróbia','Purificação do biogás','Compressão e armazenamento de biometano']},
    co2: {title:'Recuperação de CO₂',desc:'Avalie opções de recuperação, purificação e armazenamento do gás da fermentação.',items:['Captação do gás da fermentação','Lavagem e purificação do gás','Liquefação','Armazenamento e manuseio']},
    equipment: {title:'Equipamentos industriais',desc:'Encontre equipamentos de processo fabricados e pacotes modulares de engenharia.',items:['Skids de processo modulares','Trocadores de calor','Vasos de processo','Engenharia de detalhamento']}
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
    const subject='Consulta de projeto - '+get('technology');
    const message=[
      'Consulta pelo site da MEGA Engineering', '',
      'Technology: '+get('technology'),
      'Contact: '+get('name'),
      'Email: '+get('email'),
      'Company: '+get('company'),
      'Country: '+get('country'),
      'Capacidade indicativa / requisito: '+get('capacity'),
      '', 'Project details:',get('details')
    ].join('\n');
    root.querySelector('#me-form-status').textContent='Seu aplicativo de e-mail será aberto com os dados da consulta. Revise e envie a mensagem para concluir sua consulta.';
    window.location.href='mailto:sales@mega.tc?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message);
  });
})();
