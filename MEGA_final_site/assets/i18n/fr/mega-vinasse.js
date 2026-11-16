(function(){
const EQ={
  FT:{tag:"FT-1",name:"Cuve d'alimentation",desc:"Reçoit la vinasse concentrée de l'évaporateur à multiples effets et la stocke en tampon avant l'atomisation. Un agitateur monté en tête maintient les matières en suspension.",spec:[["Alimentation","Vinasse 38–40 % p/p"],["Source","Évaporateur à multiples effets"],["Niveau","LG-01 indicateur à flotteur et règle"]],s:["feed"],type:"Cuve agitée"},
  FP:{tag:"FP-01/02",name:"Pompes d'alimentation",desc:"Des pompes à vis envoient le concentré à débit constant vers l'atomiseur. Chaque pompe a un variateur et un filtre en ligne ; l'une fonctionne pendant que l'autre est en secours.",spec:[["Type","Vis (cavité progressive)"],["Entraînement","VFD"],["Config.","1 en service + 1 en secours"],["Alimente","Atomiseur RD-1"]],s:["feed"],type:"Pompe à vis avec variateur, 1S + 1R"},
  AT:{tag:"AD-1 / RD-1",name:"Distributeur d'air avec atomiseur rotatif",desc:"L'air chaud du GAC entre dans le distributeur d'air en toit de chambre et tourbillonne autour de l'atomiseur rotatif à grande vitesse, qui fragmente le concentré en un fin brouillard.",spec:[["Atomiseur","Disque rotatif"],["Air chaud","~250 °C depuis DL-01"],["Emplacement","Toit de chambre, au centre"]],s:["feed","hot"],type:"Atomiseur rotatif + distributeur d'air"},
  HAG:{tag:"HAG-01 / DL-01",name:"Générateur d'air chaud",desc:"Brûle de la bagasse séchée à l'air et fournit de l'air chaud à environ 250 °C. Voir la section du générateur d'air chaud pour le schéma complet.",spec:[["Combustible","Bagasse séchée à l'air ou biogaz"],["Air chaud","~250 °C"],["Fournit","AD-1 sur le toit de CH-1"]],s:["hot","air"],type:"À bagasse / biogaz, voir section 08"},
  DC:{tag:"CH-1",name:"Chambre de séchage par atomisation",desc:"Les gouttelettes atomisées rencontrent l'air chaud et sèchent en quelques secondes. La poudre tombe dans le cône et sort par le refroidisseur ; l'air et les fines partent vers les cyclones.",spec:[["MOC","AISI 304"],["Produit","Poudre de vinasse sèche, 5–7 % d'humidité"],["Accès","Porte, hublot et hublot éclairé"],["Sorties","Poudre (cône), air + fines (côté)"]],s:["feed","hot","powder","gas"],type:"Chambre d'atomisation AISI 304"},
  PC:{tag:"PC-1",name:"Refroidisseur de poudre",desc:"Reçoit la poudre du cône de la chambre et la refroidit avant la ligne de transport pneumatique vers le silo.",spec:[["Emplacement","Sortie du cône de la chambre"],["Product temp.","~30 °C"],["Évacuation","Ligne de transport vers CY-2"]],s:["powder"],type:"En sortie de chambre"},
  CY1:{tag:"CY-1",name:"Multi-cyclone",desc:"Des cyclones à haut rendement séparent les fines de l'air sortant de la chambre. Les fines collectées sont évacuées par des écluses rotatives vers la ligne de transport de poudre.",spec:[["Évacuation","RAV-1 / RAV-2"],["Gaz vers","ID-1 ventilateur d'extraction"]],s:["gas","powder"],type:"Haut rendement, évacuation par écluse rotative"},
  ID1:{tag:"ID-1",name:"Ventilateur d'extraction",desc:"Aspire l'air de séchage à travers la chambre et les cyclones, maintient le système en légère dépression et pousse les gaz vers le laveur. Piloté par variateur.",spec:[["Aspire depuis","Collecteur de sortie de CY-1"],["Rejette vers","SC-1 laveur"],["Entraînement","VFD"]],s:["gas"],type:"Tirage induit, avec variateur"},
  WS:{tag:"SC-1",name:"Laveur",desc:"Des pulvérisations d'eau captent les poussières restantes des gaz avant que le gaz propre ne sorte par la cheminée.",spec:[["Fluide","Eau recirculée"],["Make-up","Alimentation en eau"],["Sortie","Gaz propre vers l'atmosphère"]],s:["gas","water"],type:"Laveur humide"},
  SP:{tag:"SP-1/2",name:"Pompes du laveur",desc:"Recirculent l'eau de lavage de la cuve du laveur vers la rampe de pulvérisation. L'une fonctionne pendant que l'autre est en secours.",spec:[["Config.","1 en service + 1 en secours"],["Service","Pulvérisation du laveur"]],s:["water"],type:"Centrifuge, 1S + 1R"},
  CY2:{tag:"CY-2",name:"Cyclone de transport",desc:"Sépare la poudre de l'air de transport pneumatique en haut du silo. La poudre tombe par la RAV-4 dans le silo ; l'air continue vers le filtre à manches.",spec:[["Entrée","Poudre de PC-1 et CY-1"],["Poudre vers","SO-1 via RAV-4"],["Air vers","CBF-1"]],s:["powder","gas"],type:"Cyclone produit, RAV-4"},
  BF:{tag:"CBF-1",name:"Filtre à manches de transport",desc:"Dernier dépoussiéreur de l'air de transport. Des impulsions d'air instrument via électrovannes nettoient les manches en marche ; la poudre récupérée retourne au silo par la RAV-5.",spec:[["Nettoyage","Décolmatage pulsé, air instrument 7 kg/cm²"],["Vannes","SV-01 to SV-07"],["Évacuation","RAV-5 vers SO-1"],["Air vers","ID-2"]],s:["gas","powder","air"],type:"Décolmatage pulsé, RAV-5"},
  ID2:{tag:"ID-2",name:"Ventilateur d'extraction du transport",desc:"Aspire l'air de transport à travers le cyclone de transport et le filtre à manches, et rejette l'air filtré à l'évent.",spec:[["Aspire depuis","CBF-1"],["Évacue vers","Évent d'échappement"]],s:["gas"],type:"Tirage induit"},
  SO:{tag:"SO-1",name:"Silo",desc:"Stocke la poudre finie. La RAV-6 au cône alimente la couseuse pour l'ensachage.",spec:[["Stockage","Silo produit"],["Produit","95 % p/p de matières sèches"],["Sortie","RAV-6 vers ensachage"]],s:["powder"],type:"Silo produit, RAV-6"}
};
const ORDER=["FT","FP","AT","HAG","DC","PC","CY1","CY2","SO","BF","ID2","ID1","WS","SP"];
const WALK=[
  {ids:["FT","FP"],s:["feed"],t:"Le concentré de l'évaporateur, à 38–40 % p/p, est pompé de la cuve d'alimentation vers l'atomiseur."},
  {ids:["AT","HAG","DC"],s:["feed","hot"],t:"L'atomiseur rotatif pulvérise le concentré dans l'air chaud à environ 250 °C du GAC bagasse / biogaz. L'eau s'évapore dans la chambre."},
  {ids:["DC","CY1"],s:["gas"],t:"L'air humide chargé de fines sort de la chambre et traverse le multicyclone."},
  {ids:["DC","PC","CY1","CY2","SO"],s:["powder"],t:"La poudre du refroidisseur et des cyclones est transportée vers le cyclone de transport et tombe dans le silo produit."},
  {ids:["CY2","BF","ID2"],s:["gas","air"],t:"L'air de transport est filtré dans le filtre à manches à décolmatage pulsé avant d'être rejeté par l'ID-2."},
  {ids:["ID1","WS","SP"],s:["gas","water"],t:"Le ventilateur d'extraction envoie l'air de séchage à travers le laveur, et le gaz propre sort par la cheminée."},
  {ids:["SO"],s:["powder"],t:"La poudre sèche à 95 % p/p et environ 30 °C est ensachée sous le silo."}
];
const NEIGH={FT:["FP"],FP:["FT","AT"],AT:["FP","DC","HAG"],HAG:["AT","DC"],DC:["AT","HAG","CY1","PC"],PC:["DC","CY2"],CY1:["DC","ID1","CY2"],ID1:["CY1","WS"],WS:["ID1","SP"],SP:["WS"],CY2:["PC","CY1","SO","BF"],BF:["CY2","ID2","SO"],ID2:["BF"],SO:["CY2","BF"]};

const HEQ={
  BC:{tag:"BC-1",name:"Convoyeur de bagasse",desc:"Dose la bagasse séchée à l'air depuis le point d'alimentation du client par une goulotte jusqu'au projeteur du foyer. Son variateur suit le régulateur de température du foyer.",spec:[["Entraînement","VFD"],["Combustible","Bagasse séchée à l'air"]],s:["fuel","ctrl"],type:"VFD"},
  HAG:{tag:"HAG-01",name:"Foyer du générateur d'air chaud",desc:"Foyer à deux compartiments garni de réfractaire. Un projeteur pneumatique envoie la bagasse sur une grille pulsée dans le compartiment 1, des buses d'air secondaire complètent la combustion et le compartiment 2 achève de brûler les gaz à environ 850 °C.",spec:[["Grille","Pulsée"],["Alimentation en combustible","Projeteur pneumatique"],["Air secondaire","Buses d'air secondaire, des deux côtés"],["Furnace temp.","~850 °C"],["Sortie des gaz","570 °C"]],s:["fuel","comb","gas"],type:"Deux compartiments, grille pulsée"},
  HP:{tag:"Entraînement de grille",name:"Entraînement hydraulique de la grille",desc:"Une pompe à démarrage direct sur une cuve d'huile de 80 litres actionne la grille pulsée par des flexibles, faisant avancer combustible et cendres.",spec:[["Cuve d'huile","80 L"],["Démarreur","DOL"],["Instruments","Manomètre, thermomètre, niveau à glace"]],s:["fuel"],type:"Centrale hydraulique de 80 L"},
  AH:{tag:"AH-01",name:"Réchauffeur d'air",desc:"Les gaz chauds du foyer traversent le faisceau tubulaire et préchauffent l'air de combustion du CF-1. Les gaz sortent à environ 495 °C vers la dilution ; l'air de combustion retourne au foyer à environ 150 °C.",spec:[["Gaz entrée / sortie","570 °C / 495 °C"],["Air entrée / sortie","30 °C / 150 °C"]],s:["comb","gas"],type:"Tubulaire, gaz-air"},
  CF:{tag:"CF-1",name:"Ventilateur de combustion",desc:"Ventilateur de soufflage qui pousse l'air ambiant à travers le réchauffeur d'air vers le dessous de la grille et le projeteur pneumatique.",spec:[["Entrée d'air","Ambiant, 30 °C"],["Alimente","Air sous grille et projeteur pneumatique"]],s:["comb"],type:"Ventilateur de soufflage"},
  DMP:{tag:"Registre de dilution",name:"Registre de régulation de l'air de dilution",desc:"Admet de l'air atmosphérique dans la colonne de gaz chaud pour l'amener à la température de séchage. Un actionneur électrique positionne le registre selon le régulateur de température d'air chaud.",spec:[["Air","Atmosphérique, 30 °C"],["Entrée","Conduite d'air atmosphérique"],["Actionnement","Électrique"]],s:["dil","ctrl"],type:"Actionneur électrique"},
  DL:{tag:"DL-01",name:"Ventilateur de dilution",desc:"Aspire l'air chaud mélangé par la gaine d'air chaud et le livre au distributeur d'air (AD-1) en toit de chambre. Piloté par variateur.",spec:[["Air chaud","~250 °C"],["Alimente","AD-1 on CH-1"],["Entraînement","VFD"]],s:["gas","ctrl"],type:"VFD"},
  CTRL:{tag:"TIC-01 · TIC-02 · PIC-01",name:"Régulation du GAC",desc:"La température du foyer (TIC-01) règle la vitesse du convoyeur de bagasse. La température de l'air chaud vers le séchoir (TIC-02) positionne le registre de dilution et règle la vitesse du DL-01. Le PIC-01 surveille le tirage du foyer.",spec:[["TIC-01","Temp. du foyer → variateur BC-1"],["TIC-02","Temp. de l'air chaud → registre, variateur DL-01"],["PIC-01","Tirage du foyer"]],s:["ctrl"],type:"Boucles automate"}
};
const HORDER=["BC","HAG","HP","CF","AH","DMP","DL","CTRL"];
const HWALK=[
  {ids:["BC","HAG"],s:["fuel"],t:"Le BC-1 dose la bagasse séchée à l'air vers le projeteur pneumatique, qui la projette sur la grille pulsée."},
  {ids:["CF","AH","HAG"],s:["comb"],t:"Le CF-1 pousse l'air ambiant à travers le réchauffeur d'air. Il arrive à la grille et au projeteur préchauffé à environ 150 °C."},
  {ids:["HAG","HP"],s:["fuel","comb"],t:"La bagasse brûle à environ 850 °C. L'air secondaire achève la combustion et l'entraînement hydraulique fait pulser la grille pour évacuer les cendres."},
  {ids:["HAG","AH"],s:["gas"],t:"Les gaz chauds quittent le foyer à environ 570 °C et cèdent leur chaleur à l'air de combustion dans l'AH-01, pour sortir à environ 495 °C."},
  {ids:["DMP","AH"],s:["gas","dil"],t:"L'air atmosphérique entre par le registre de régulation et dilue les gaz jusqu'à la température de séchage."},
  {ids:["DL","CTRL","DMP","BC"],s:["gas","ctrl"],t:"Le DL-01 envoie de l'air chaud à environ 250 °C par la gaine vers le séchoir. Le TIC-02 maintient cette température ; le TIC-01 maintient celle du foyer."}
];
const HNEIGH={BC:["HAG","CTRL"],HAG:["BC","HP","AH","CF"],HP:["HAG"],AH:["HAG","CF","DMP"],CF:["AH"],DMP:["AH","DL","CTRL"],DL:["DMP","CTRL"],CTRL:["BC","DMP","DL"]};

function makePFD(root,EQ,WALK,NEIGH,def){
  const svg=root.querySelector('svg.pfd');
  const eqEls=[...svg.querySelectorAll('.eq')];
  const chips=[...root.querySelectorAll('.pfd-toolbar .chip')];
  const R=k=>root.querySelector('[data-r="'+k+'"]');
  let walkI=-1;
  function show(id){
    const d=EQ[id];
    eqEls.forEach(e=>e.classList.toggle('on',e.dataset.id===id));
    R('tag').textContent=d.tag;R('name').textContent=d.name;R('desc').textContent=d.desc;
    const dl=R('spec');dl.innerHTML='';
    d.spec.forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)});
  }
  function highlight(streams,ids){
    const any=(streams&&streams.length)||(ids&&ids.length);
    svg.classList.toggle('dim',!!any);
    svg.querySelectorAll('[data-s]').forEach(g=>{
      const on=streams&&streams.includes(g.dataset.s);
      g.querySelectorAll('.sv-line').forEach(l=>l.classList.toggle('hl',!!on));
    });
    const hop=svg.querySelector('.hop');if(hop)hop.classList.toggle('hl',!!(streams&&streams.includes('powder')));
    eqEls.forEach(e=>e.classList.toggle('hl',!!(ids&&ids.includes(e.dataset.id))));
  }
  const active=()=>chips.filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.dataset.stream);
  const eqFor=ss=>Object.keys(EQ).filter(k=>EQ[k].s.some(s=>ss.includes(s)));
  eqEls.forEach(e=>{
    const go=()=>{endWalk();const id=e.dataset.id;show(id);chips.forEach(c=>c.setAttribute('aria-pressed','false'));highlight(EQ[id].s,[id].concat(NEIGH[id]||[]))};
    e.addEventListener('click',go);
    e.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go()}});
  });
  chips.forEach(c=>c.addEventListener('click',()=>{
    endWalk();c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');
    const ss=active();eqEls.forEach(e=>e.classList.remove('on'));highlight(ss,eqFor(ss));
  }));
  const fb=R('flow');
  fb.addEventListener('click',()=>{const on=svg.classList.toggle('flowing');fb.textContent=on?'Mettre en pause':'Animer le flux';fb.setAttribute('aria-pressed',on)});
  const ob=R('origbtn'),op=R('origpane');
  if(ob&&op){
    ob.addEventListener('click',()=>{const o=op.hidden;op.hidden=!o;svg.style.display=o?'none':'';ob.textContent=o?'Schéma interactif':'Plan d\'origine';ob.setAttribute('aria-pressed',o)});
    const im=op.querySelector('img');im.addEventListener('click',()=>im.classList.toggle('zoom'));
  }
  const wb=R('walk'),wp=R('prev'),wn=R('next'),wc=R('ctr');
  function walk(i){
    walkI=i;const st=WALK[i];
    chips.forEach(c=>c.setAttribute('aria-pressed',st.s.includes(c.dataset.stream)?'true':'false'));
    highlight(st.s,st.ids);show(st.ids[0]);
    R('desc').textContent=st.t;R('tag').textContent='Step '+(i+1)+' of '+WALK.length;
    wb.textContent='Quitter le parcours';wp.hidden=false;wn.hidden=false;wp.disabled=i===0;wn.disabled=i===WALK.length-1;wc.textContent=(i+1)+' / '+WALK.length;
  }
  function endWalk(){if(walkI<0)return;walkI=-1;wb.textContent='Parcourir le procédé';wp.hidden=true;wn.hidden=true;wc.textContent=''}
  wb.addEventListener('click',()=>{if(walkI>=0){endWalk();chips.forEach(c=>c.setAttribute('aria-pressed','false'));highlight([],[]);show(def)}else walk(0)});
  wp.addEventListener('click',()=>walk(Math.max(0,walkI-1)));
  wn.addEventListener('click',()=>walk(Math.min(WALK.length-1,walkI+1)));
  show(def);
}
makePFD(document.getElementById('pfd'),EQ,WALK,NEIGH,'DC');
makePFD(document.getElementById('hag'),HEQ,HWALK,HNEIGH,'HAG');

// equipment tables
function fillTable(id,E,order){const tb=document.getElementById(id);order.forEach(k=>{const d=E[k];const tr=document.createElement('tr');tr.innerHTML='<td class="tag"></td><td></td><td></td>';tr.children[0].textContent=d.tag;tr.children[1].textContent=d.name;tr.children[2].textContent=d.type;tb.append(tr)})}
fillTable('eqTable',EQ,ORDER);
fillTable('hagTable',HEQ,HORDER.filter(k=>k!=='CTRL'));


// ===== node maps (ZLD routes, incineration)
const ROUTES={
  RAW:{tag:"Entrée",name:"Vinasse brute",desc:"Vinasse issue de la colonne de distillation : acide, à forte DCO et riche en potassium, sulfates et chlorures. Tout schéma ZLD commence ici.",spec:[["Matières sèches totales","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Voir les propriétés de la vinasse"},
  CSTR:{tag:"Filière 1 · Biogaz · étape 1",name:"Biodigesteur MEGA-CSTR",desc:"La vinasse brute est digérée en anaérobiose dans un réacteur à cuve agitée continue. La DCO baisse d'environ 65 % et la matière organique devient un biogaz riche en méthane.",spec:[["Réduction DCO / DBO","65 ± 3% / 85 ± 3%"],["Rendement en biogaz","0.52 m³ per kg COD removed"],["Production","Biogaz + BMSW"]],link:"#biogas",lt:"Aller au MEGA-CSTR"},
  GAS:{tag:"Filière 1 · Biogaz · énergie",name:"Utilisation du biogaz",desc:"Le biogaz peut être brûlé dans le générateur d'air chaud du séchoir, dans un moteur à gaz pour produire de l'électricité ou dans la chaudière de la distillerie.",spec:[["Méthane","55–60%"],["Pouvoir calorifique","4 200–4 500 kcal/Nm³"],["Utilisations","GAC · moteur à gaz · chaudière · biométhane"]],link:"#biogas",lt:"Aller au MEGA-CSTR"},
  MEE:{tag:"Filière 1 · Biogaz · étape 2",name:"Dégazeur + évaporation à multiples effets",desc:"La vinasse biométhanisée (BMSW) est dégazée sous vide, puis concentrée dans les évaporateurs à multiples effets de MEGA sans moussage ni antimousse.",spec:[["Alimentation","BMSW, pH 7,5–8,5"],["Modèles","MEGA-BMSW30 · 30i · 40"],["Production","Concentré à 30–35 Brix"]],link:"#bmsw",lt:"Aller à l'évaporation de BMSW"},
  STRIP:{tag:"Filière 1 · Biogaz · eau",name:"Stripeur de condensat + CPU",desc:"La colonne de stripage fractionné de MEGA élimine l'azote ammoniacal et les AGV du condensat de procédé. L'unité de polissage le rend ensuite apte au recyclage.",spec:[["Condensat brut","pH 8,0–9,2, DCO ≤ 4 000 ppm"],["Production","Eau recyclée vers le procédé"]],link:"#bmsw",lt:"Aller à l'évaporation de BMSW"},
  ATFD:{tag:"Filière 1 · Biogaz · option A",name:"ATFD → mélasse condensée soluble",desc:"Un sécheur à couche mince agitée porte le concentré de BMSW à environ 80 Brix. Le produit, la mélasse condensée soluble (MCS), sert d'additif pour l'alimentation du bétail.",spec:[["Produit","MCS, jusqu'à ~80 Brix"],["Use","Additif pour l'alimentation du bétail"]],link:null},
  SD:{tag:"Filière 1 · Biogaz · option B",name:"Évaporation + séchoir par atomisation",desc:"Un évaporateur de finition et le séchoir par atomisation transforment le concentré en poudre fluide riche en potasse. Le générateur d'air chaud peut fonctionner à la bagasse ou au biogaz du digesteur.",spec:[["Produit","Poudre à 95 % p/p"],["Humidité","5–7% w/w"],["Product temp.","~30 °C"]],link:"#process",lt:"Aller au séchoir par atomisation"},
  EVAP:{tag:"Filière 2 · Incinération · étape 1",name:"Évaporation de vinasse brute",desc:"Des évaporateurs à multiples effets concentrent la vinasse brute à 55–60 Brix pour qu'elle serve de combustible de chaudière.",spec:[["Objectif","55–60 Brix"]],link:"#incineration",lt:"Aller à la filière incinération"},
  BOIL:{tag:"Filière 2 · Incinération · étape 2",name:"Chaudière d'incinération",desc:"Le concentré à 55–60 Brix est brûlé dans la chaudière d'incinération pour produire de la vapeur : aucun liquide ne quitte l'usine.",spec:[["Combustible","Concentré de vinasse, 55–60 Brix"],["Watch-outs","Investissement et maintenance élevés"]],link:"#incineration",lt:"Aller à la filière incinération"},
  STEAM:{tag:"Filière 2 · Incinération · production",name:"Vapeur",desc:"La vapeur de la chaudière d'incinération alimente la distillerie et l'unité d'évaporation.",spec:[["Use","Vapeur pour la distillerie et l'évaporateur"]],link:"#incineration",lt:"Aller à la filière incinération"},
  CPU:{tag:"Filière 2 · Incinération · eau",name:"Unité de polissage des condensats",desc:"Le condensat de procédé issu de l'évaporation de vinasse brute contient des composés organiques volatils. La CPU le polit pour recycler l'eau vers le procédé au lieu de la rejeter.",spec:[["Alimentation","Condensat de procédé de l'évaporateur"],["Production","Eau recyclée vers le procédé"]],link:"#incineration",lt:"Aller à la filière incinération"}
};
const INC={
  RAW:{tag:"Alimentation",name:"Vinasse brute",desc:"Vinasse sortant directement de la colonne de distillation, sans traitement biogaz.",spec:[["Matières sèches totales","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Voir les propriétés de la vinasse"},
  MEE:{tag:"Évaporation",name:"Évaporateur à multiples effets de vinasse brute",desc:"Concentre la vinasse brute à 55–60 Brix. Chaque effet est chauffé par la vapeur du précédent, pour une forte économie de vapeur, et chaque évaporateur dispose d'une prévision de NEP.",spec:[["Objectif","55–60 Brix"],["Chauffage","Vapeur"],["Produits","Concentré + condensat de procédé"]],link:null},
  CONC:{tag:"Concentré",name:"Concentré vers la chaudière",desc:"Le concentré à 55–60 Brix est stocké puis envoyé à la chaudière d'incinération comme combustible.",spec:[["Concentration","55–60 Brix"]],link:null},
  BOIL:{tag:"Énergie",name:"Chaudière d'incinération",desc:"Brûle le concentré de vinasse pour produire de la vapeur : aucun effluent liquide ne quitte la distillerie.",spec:[["Combustible","Concentré de vinasse"],["Watch-outs","Investissement et maintenance élevés"]],link:null},
  STEAM:{tag:"Production",name:"Vapeur",desc:"La vapeur alimente la distillerie et chauffe l'unité d'évaporation.",spec:[["Utilisateurs","Distillerie · évaporateur"]],link:null},
  CPU:{tag:"Eau",name:"Unité de polissage des condensats (CPU)",desc:"Le condensat de procédé issu de l'évaporation de vinasse brute contient des composés organiques volatils et ne peut pas être rejeté tel quel. La CPU le polit pour qu'il soit réutilisé dans l'usine. MEGA fournit la CPU avec l'unité d'évaporation.",spec:[["Alimentation","Condensat de procédé de l'évaporateur"],["Production","Eau apte au recyclage vers le procédé"]],link:null},
  REUSE:{tag:"Production",name:"Eau traitée",desc:"Le condensat poli retourne au procédé, réduit les besoins en eau neuve et boucle le cycle de l'eau.",spec:[["Use","Recyclage de l'eau de procédé"]],link:null}
};
function makeMap(root,DATA,def,routeDef){
  const svg=root.querySelector('svg.rmap');
  const nodes=[...svg.querySelectorAll('.rn')],chips=[...root.querySelectorAll('[data-route]')];
  const R=k=>root.querySelector('.pfd-side [data-r="'+k+'"]');
  function show(k){
    const d=DATA[k];nodes.forEach(n=>n.classList.toggle('on',n.dataset.k===k));
    R('tag').textContent=d.tag;R('name').textContent=d.name;R('desc').textContent=d.desc;
    const dl=R('spec');dl.innerHTML='';d.spec.forEach(([a,b])=>{const dt=document.createElement('dt');dt.textContent=a;const dd=document.createElement('dd');dd.textContent=b;dl.append(dt,dd)});
    const l=R('link');if(d.link){l.hidden=false;l.href=d.link;l.textContent=d.lt}else l.hidden=true;
  }
  function filter(r){svg.querySelectorAll('.rn,.rl').forEach(el=>{const rs=(el.dataset.r||'all').split(' ');el.classList.toggle('dimmed',r!=='all'&&!rs.includes(r)&&!rs.includes('all'))})}
  nodes.forEach(n=>{const go=()=>show(n.dataset.k);n.addEventListener('click',go);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
  chips.forEach(c=>c.addEventListener('click',()=>{
    chips.forEach(x=>x.setAttribute('aria-pressed',x===c?'true':'false'));
    filter(c.dataset.route);show(routeDef[c.dataset.route]||def);
  }));
  show(def);
}
makeMap(document.getElementById('routemap'),ROUTES,'SD',{all:'RAW',bio:'SD',inc:'CPU'});
makeMap(document.getElementById('incmap'),INC,'CPU',{all:'MEE',liq:'BOIL',wat:'CPU',stm:'STEAM'});

// ===== image hotspots
const HS={
  cstr:{w:1400,h:990,pts:[
    {x:196,y:640,t:"Cuve d'alimentation",d:"Bâche tampon pour la vinasse brute, avec ajustement du pH. La vinasse peut d'abord être refroidie dans un échangeur pour une digestion mésophile.",s:[["Limite de fourniture","Vinasse brute à l'entrée de la bâche tampon"]]},
    {x:65,y:770,t:"Pompe d'alimentation",d:"Des pompes centrifuges alimentent la vinasse dans le fût central du digesteur à débit contrôlé.",s:[["Type","Centrifuge"]]},
    {x:875,y:520,t:"Digesteur MEGA-CSTR",d:"L'alimentation et les boues recirculées entrent par le tambour central. Un agitateur central supérieur pousse le flux vers le bas et trois agitateurs latéraux mélangent radialement. Le liquide traité sort par un déversoir à garde hydraulique.",s:[["Régime","Mésophile 36–40 °C ou thermophile 50–55 °C"],["pH du réacteur","7.0–7.5"],["Diamètre type","35–36 m ; plusieurs digesteurs au-delà de 700–750 m³/jour"]]},
    {x:580,y:470,t:"Dégazeur",d:"Élimine le gaz dissous de l'effluent du réacteur pour que la biomasse décante bien dans le décanteur.",s:[]},
    {x:395,y:500,t:"Décanteur lamellaire",d:"Des plaques inclinées séparent la biomasse. Les boues actives décantent et sont recirculées ; l'excès est purgé pour déshydratation ou compostage.",s:[["Construction","Acier au carbone avec revêtement époxy anticorrosion"]]},
    {x:560,y:770,t:"Pompe à boues",d:"Renvoie la biomasse active du décanteur au digesteur et purge l'excès de boues.",s:[]},
    {x:270,y:770,t:"Pompe de transfert de BMSW",d:"Envoie la vinasse biométhanisée clarifiée vers le dégazeur et l'unité d'évaporation.",s:[["Limite de fourniture","Sortie de l'effluent clarifié"]]},
    {x:1233,y:575,t:"Gazomètre",d:"Gazomètre flottant en acier au carbone qui stocke le biogaz à basse pression et volume variable.",s:[]},
    {x:1335,y:745,t:"Surpresseur de biogaz",d:"Augmente la pression du biogaz vers la chaudière, le générateur d'air chaud ou l'épuration.",s:[["Limite de fourniture","Bride de refoulement du surpresseur"]]},
    {x:1215,y:300,t:"Torchère",d:"Brûle en sécurité le biogaz excédentaire ou hors spécifications, avec allumage automatique et verrouillages de sécurité.",s:[]},
    {x:1328,y:170,t:"Analyseur et débitmètre de biogaz",d:"Mesure la qualité et le débit du biogaz sur la ligne vers les utilisateurs.",s:[["Méthane","55–60%"],["H₂S","2.5–3.5%"]]}
  ]},
  bmsw:{w:1400,h:989,pts:[
    {x:240,y:420,t:"Préchauffeur",d:"Préchauffe la BMSW entrante avant le dégazeur.",s:[]},
    {x:147,y:335,t:"Dégazeur sous vide",d:"Sous vide, le CO₂, le H₂S et l'ammoniac sortent de la solution. Des brise-mousse mécaniques évitent l'entraînement. Sans injection de vapeur ni antimousse.",s:[["Caractéristiques","Chambre sous vide · brise-mousse · distribution optimisée"]]},
    {x:515,y:380,t:"FFE-1, premier effet",d:"Évaporateur à film tombant chauffé à la vapeur BP (ou aux vapeurs d'alcool sur le modèle BMSW30i).",s:[["Chauffage","Vapeur BP"]]},
    {x:950,y:380,t:"FFE-2 à FFE-5",d:"Chaque effet est chauffé par la vapeur du précédent, ce qui multiplie l'économie de vapeur. Une calandre de secours permet le nettoyage sans arrêter l'unité.",s:[["Configuration","Film tombant, ± finisseur à circulation forcée"]]},
    {x:870,y:470,t:"Séparateurs vapeur–liquide",d:"Les VLS-1 à VLS-5 séparent la vapeur de la liqueur en concentration après chaque effet.",s:[]},
    {x:1240,y:370,t:"Condenseur à surface",d:"Condense la vapeur du dernier effet, avec une pompe à vide qui maintient l'unité sous vide.",s:[["Refroidissement","Eau de refroidissement, aller / retour"]]},
    {x:690,y:745,t:"Vinasse concentrée",d:"Le concentré sort du dernier effet vers l'ATFD (MCS) ou le séchoir par atomisation (poudre).",s:[["Concentration","30–35 Brix"]]},
    {x:1270,y:785,t:"Bâche à condensat de procédé",d:"Recueille le condensat de procédé et l'envoie à la colonne de stripage.",s:[["Qualité brute","pH 8,0–9,2, DCO ≤ 4 000 ppm, MDT ≤ 1 500 ppm"]]},
    {x:375,y:540,t:"Colonne de stripage",d:"La colonne de stripage fractionné de MEGA, intégrée thermiquement à l'évaporateur, élimine l'azote ammoniacal, les AGV et les gaz dissous du condensat.",s:[["Résultat","Charge réduite sur la CPU"]]},
    {x:460,y:765,t:"Bâche à condensats vapeur",d:"Recueille le condensat vapeur propre pour son retour.",s:[]}
  ]}
};
document.querySelectorAll('.hs-root').forEach(root=>{
  const set=HS[root.dataset.set],wrap=root.querySelector('.hs-wrap');
  const R=k=>root.querySelector('[data-r="'+k+'"]');const btns=[];
  function show(i){const p=set.pts[i];btns.forEach((b,j)=>b.classList.toggle('on',j===i));R('name').textContent=p.t;R('desc').textContent=p.d;
    const dl=R('spec');dl.innerHTML='';p.s.forEach(([a,b])=>{const dt=document.createElement('dt');dt.textContent=a;const dd=document.createElement('dd');dd.textContent=b;dl.append(dt,dd)})}
  set.pts.forEach((p,i)=>{const b=document.createElement('button');b.className='hs';b.type='button';b.textContent=i+1;b.setAttribute('aria-label',p.t);
    b.style.left=(p.x/set.w*100)+'%';b.style.top=(p.y/set.h*100)+'%';b.addEventListener('click',()=>show(i));wrap.append(b);btns.push(b)});
  show(0);
});

// calculator
const $=id=>document.getElementById(id);
const fmt=(n,d=1)=>n.toLocaleString('en-IN',{minimumFractionDigits:d,maximumFractionDigits:d});
function calc(){
  const F=+$('cF').value,x0=+$('cX0').value/100;let x1=+$('cX1').value/100;const x2=+$('cX2').value/100;
  if(x1<=x0){x1=x0+0.02}
  $('oF').textContent=F+' TPD';$('oX0').textContent=+$('cX0').value+'% w/w';$('oX1').textContent=+$('cX1').value+'% w/w';$('oX2').textContent=Math.round(x2*100)+'% w/w';
  const S=F*x0,C=S/x1,P=S/x2,E1=F-C,E2=C-P;
  $('kS').textContent=fmt(S);$('kC').textContent=fmt(C);$('kP').textContent=fmt(P);
  $('kE1').textContent=fmt(E1*1000/24,0);$('kE2').textContent=fmt(E2*1000/24,0);
  $('kSt').textContent=fmt(E1,0);
  const b=[[ 'b1',E1],['b2',E2],['b3',P]];
  b.forEach(([id,v])=>{const el=$(id);el.style.flexGrow=Math.max(v,0.0001);el.textContent=Math.round(v/F*100)+'%'});
}
['cF','cX0','cX1','cX2'].forEach(id=>$(id).addEventListener('input',calc));
$('cReset').addEventListener('click',()=>{$('cF').value=500;$('cX0').value=6;$('cX1').value=40;$('cX2').value=95;calc()});
calc();
})();
