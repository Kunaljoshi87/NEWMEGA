(function(){
const EQ={
  FT:{tag:"FT-1",name:"Tanque de alimentación",desc:"Recibe la vinaza concentrada del evaporador de múltiple efecto y la mantiene como reserva antes de la atomización. Un agitador superior mantiene los sólidos en suspensión.",spec:[["Alimentación","Vinaza 38–40 % p/p"],["Origen","Evaporador de múltiple efecto"],["Nivel","LG-01 indicador de flotador y tablero"]],s:["feed"],type:"Tanque agitado"},
  FP:{tag:"FP-01/02",name:"Bombas de alimentación",desc:"Bombas de tornillo envían el concentrado a caudal constante al atomizador. Cada bomba tiene variador y filtro en línea; una trabaja mientras la otra queda en reserva.",spec:[["Tipo","Tornillo (cavidad progresiva)"],["Accionamiento","VFD"],["Config.","1 en servicio + 1 de reserva"],["Entrega a","Atomizador RD-1"]],s:["feed"],type:"Bomba de tornillo con variador, 1S + 1R"},
  AT:{tag:"AD-1 / RD-1",name:"Distribuidor de aire con atomizador rotativo",desc:"El aire caliente del GAC entra en el distribuidor de aire del techo de la cámara y gira alrededor del atomizador rotativo de alta velocidad, que rompe el concentrado en una fina pulverización.",spec:[["Atomizador","Disco rotativo"],["Aire caliente","~250 °C desde DL-01"],["Ubicación","Techo de la cámara, centro"]],s:["feed","hot"],type:"Atomizador rotativo + distribuidor de aire"},
  HAG:{tag:"HAG-01 / DL-01",name:"Generador de aire caliente",desc:"Quema bagazo seco de patio y suministra aire caliente a unos 250 °C. Vea la sección del generador de aire caliente para el flujo completo.",spec:[["Combustible","Bagazo seco de patio o biogás"],["Aire caliente","~250 °C"],["Entrega","AD-1 en el techo de CH-1"]],s:["hot","air"],type:"A bagazo / biogás, ver sección 08"},
  DC:{tag:"CH-1",name:"Cámara de secado por atomización",desc:"Las gotas atomizadas se encuentran con el aire caliente y se secan en segundos. El polvo cae al cono y sale por el enfriador de polvo; el aire y los finos van a los ciclones.",spec:[["MOC","AISI 304"],["Producto","Polvo de vinaza seco, 5–7 % de humedad"],["Acceso","Puerta, mirilla y visor con luz"],["Salidas","Polvo (cono), aire + finos (lateral)"]],s:["feed","hot","powder","gas"],type:"Cámara de atomización AISI 304"},
  PC:{tag:"PC-1",name:"Enfriador de polvo",desc:"Recibe el polvo del cono de la cámara y lo enfría antes de entrar en la línea de transporte neumático al silo.",spec:[["Ubicación","Salida del cono de la cámara"],["Product temp.","~30 °C"],["Descarga","Línea de transporte a CY-2"]],s:["powder"],type:"En la descarga de la cámara"},
  CY1:{tag:"CY-1",name:"Multi-cyclone",desc:"Ciclones de alta eficiencia separan los finos del aire de salida de la cámara. Los finos recogidos se descargan por válvulas rotativas a la línea de transporte de polvo.",spec:[["Descarga","RAV-1 / RAV-2"],["Gas a","ID-1 soplante de tiro inducido"]],s:["gas","powder"],type:"Alta eficiencia, descarga por válvula rotativa"},
  ID1:{tag:"ID-1",name:"Soplante de tiro inducido",desc:"Aspira el aire de secado a través de la cámara y los ciclones, mantiene el sistema en ligera depresión y envía los gases al lavador. Controlado por variador.",spec:[["Aspira desde","Colector de salida de CY-1"],["Descarga a","SC-1 lavador"],["Accionamiento","VFD"]],s:["gas"],type:"Tiro inducido, con variador"},
  WS:{tag:"SC-1",name:"Lavador",desc:"Las pulverizaciones de agua capturan el polvo restante del escape principal antes de que el gas limpio salga por la chimenea.",spec:[["Medio","Agua recirculada"],["Make-up","Suministro de agua"],["Salida","Gas limpio a la atmósfera"]],s:["gas","water"],type:"Lavador húmedo"},
  SP:{tag:"SP-1/2",name:"Bombas del lavador",desc:"Recirculan el agua de lavado del tanque del lavador al colector de pulverización. Una trabaja mientras la otra queda en reserva.",spec:[["Config.","1 en servicio + 1 de reserva"],["Servicio","Pulverización del lavador"]],s:["water"],type:"Centrífuga, 1S + 1R"},
  CY2:{tag:"CY-2",name:"Ciclón de transporte",desc:"Separa el polvo del aire de transporte neumático en la parte superior del silo. El polvo cae por la RAV-4 al silo; el aire sigue al filtro de mangas.",spec:[["Entrada","Polvo de PC-1 y CY-1"],["Polvo a","SO-1 vía RAV-4"],["Aire a","CBF-1"]],s:["powder","gas"],type:"Ciclón de producto, RAV-4"},
  BF:{tag:"CBF-1",name:"Filtro de mangas de transporte",desc:"Captador final de polvo del aire de transporte. Pulsos de aire de instrumentos por electroválvulas limpian las mangas en línea; el polvo recuperado vuelve al silo por la RAV-5.",spec:[["Limpieza","Pulse-jet, aire de instrumentos 7 kg/cm²"],["Válvulas","SV-01 to SV-07"],["Descarga","RAV-5 a SO-1"],["Aire a","ID-2"]],s:["gas","powder","air"],type:"Pulse-jet, RAV-5"},
  ID2:{tag:"ID-2",name:"Soplante de tiro inducido de transporte",desc:"Aspira el aire de transporte a través del ciclón de transporte y el filtro de mangas, y descarga el aire filtrado al venteo.",spec:[["Aspira desde","CBF-1"],["Descarga en","Venteo de escape"]],s:["gas"],type:"Tiro inducido"},
  SO:{tag:"SO-1",name:"Silo",desc:"Almacena el polvo terminado. La RAV-6 en el cono alimenta la cosedora para el ensacado.",spec:[["Almacenamiento","Silo de producto"],["Producto","95 % p/p de sólidos"],["Salida","RAV-6 a ensacado"]],s:["powder"],type:"Silo de producto, RAV-6"}
};
const ORDER=["FT","FP","AT","HAG","DC","PC","CY1","CY2","SO","BF","ID2","ID1","WS","SP"];
const WALK=[
  {ids:["FT","FP"],s:["feed"],t:"El concentrado del evaporador, al 38–40 % p/p, se bombea desde el tanque de alimentación al atomizador."},
  {ids:["AT","HAG","DC"],s:["feed","hot"],t:"El atomizador rotativo pulveriza el concentrado en aire caliente a unos 250 °C del GAC de bagazo / biogás. El agua se evapora dentro de la cámara."},
  {ids:["DC","CY1"],s:["gas"],t:"El aire húmedo con finos sale de la cámara y pasa por el multiciclón."},
  {ids:["DC","PC","CY1","CY2","SO"],s:["powder"],t:"El polvo del enfriador y de los ciclones se transporta al ciclón de transporte y cae al silo de producto."},
  {ids:["CY2","BF","ID2"],s:["gas","air"],t:"El aire de transporte se limpia en el filtro de mangas pulse-jet antes de que el ID-2 lo ventee."},
  {ids:["ID1","WS","SP"],s:["gas","water"],t:"El soplante de tiro inducido envía el aire de secado a través del lavador, y el gas limpio sale por la chimenea."},
  {ids:["SO"],s:["powder"],t:"El polvo seco al 95 % p/p y a unos 30 °C se ensaca desde la parte inferior del silo."}
];
const NEIGH={FT:["FP"],FP:["FT","AT"],AT:["FP","DC","HAG"],HAG:["AT","DC"],DC:["AT","HAG","CY1","PC"],PC:["DC","CY2"],CY1:["DC","ID1","CY2"],ID1:["CY1","WS"],WS:["ID1","SP"],SP:["WS"],CY2:["PC","CY1","SO","BF"],BF:["CY2","ID2","SO"],ID2:["BF"],SO:["CY2","BF"]};

const HEQ={
  BC:{tag:"BC-1",name:"Transportador de bagazo",desc:"Dosifica bagazo seco de patio desde el punto de alimentación del cliente por una tolva hasta el esparcidor del horno. Su variador sigue al controlador de temperatura del horno.",spec:[["Accionamiento","VFD"],["Combustible","Bagazo seco de patio"]],s:["fuel","ctrl"],type:"VFD"},
  HAG:{tag:"HAG-01",name:"Horno del generador de aire caliente",desc:"Horno revestido de refractario con dos compartimentos. Un esparcidor neumático lanza el bagazo sobre una parrilla pulsante en el compartimento 1, toberas de aire secundario completan la combustión y el compartimento 2 permite quemar el gas a unos 850 °C.",spec:[["Parrilla","Pulsante"],["Alimentación de combustible","Esparcidor neumático"],["Aire secundario","Toberas OFA, ambos lados"],["Furnace temp.","~850 °C"],["Salida de gas","570 °C"]],s:["fuel","comb","gas"],type:"Dos compartimentos, parrilla pulsante"},
  HP:{tag:"Accionamiento de la parrilla",name:"Accionamiento hidráulico de la parrilla",desc:"Una bomba con arranque directo en un tanque de aceite de 80 litros acciona la parrilla pulsante mediante mangueras, moviendo el combustible y la ceniza por la parrilla.",spec:[["Tanque de aceite","80 L"],["Arrancador","DOL"],["Instrumentos","Manómetro, termómetro, visor de nivel"]],s:["fuel"],type:"Grupo hidráulico de 80 L"},
  AH:{tag:"AH-01",name:"Calentador de aire",desc:"El gas caliente del horno pasa por el haz de tubos y precalienta el aire de combustión del CF-1. El gas sale a unos 495 °C hacia la dilución; el aire de combustión vuelve al horno a unos 150 °C.",spec:[["Gas entrada / salida","570 °C / 495 °C"],["Aire entrada / salida","30 °C / 150 °C"]],s:["comb","gas"],type:"Tubular, gas-aire"},
  CF:{tag:"CF-1",name:"Soplante de combustión",desc:"Ventilador de tiro forzado que impulsa el aire ambiente a través del calentador de aire hacia la parte inferior de la parrilla y el esparcidor neumático.",spec:[["Entrada de aire","Ambiente, 30 °C"],["Entrega a","Aire bajo parrilla y esparcidor neumático"]],s:["comb"],type:"Ventilador de tiro forzado"},
  DMP:{tag:"Compuerta de dilución",name:"Compuerta de control del aire de dilución",desc:"Admite aire atmosférico en la columna de gas caliente para bajarlo a la temperatura de secado. Un actuador eléctrico posiciona la compuerta según el controlador de temperatura del aire caliente.",spec:[["Air","Atmosférico, 30 °C"],["Entrada","Tubería de aire atmosférico"],["Accionamiento","Eléctrico"]],s:["dil","ctrl"],type:"Actuador eléctrico"},
  DL:{tag:"DL-01",name:"Soplante de dilución",desc:"Aspira el aire caliente mezclado por el conducto de aire caliente y lo entrega al distribuidor de aire (AD-1) del techo de la cámara. Controlado por variador.",spec:[["Aire caliente","~250 °C"],["Entrega a","AD-1 on CH-1"],["Accionamiento","VFD"]],s:["gas","ctrl"],type:"VFD"},
  CTRL:{tag:"TIC-01 · TIC-02 · PIC-01",name:"Controles del GAC",desc:"La temperatura del horno (TIC-01) fija la velocidad del transportador de bagazo. La temperatura del aire caliente al secador (TIC-02) posiciona la compuerta de dilución y fija la velocidad del DL-01. El PIC-01 vigila el tiro del horno.",spec:[["TIC-01","Temp. del horno → variador BC-1"],["TIC-02","Temp. del aire caliente → compuerta, variador DL-01"],["PIC-01","Tiro del horno"]],s:["ctrl"],type:"Lazos PLC"}
};
const HORDER=["BC","HAG","HP","CF","AH","DMP","DL","CTRL"];
const HWALK=[
  {ids:["BC","HAG"],s:["fuel"],t:"El BC-1 dosifica bagazo seco de patio al esparcidor neumático, que lo lanza sobre la parrilla pulsante."},
  {ids:["CF","AH","HAG"],s:["comb"],t:"El CF-1 impulsa aire ambiente a través del calentador de aire. Llega a la parrilla y al esparcidor precalentado a unos 150 °C."},
  {ids:["HAG","HP"],s:["fuel","comb"],t:"El bagazo arde a unos 850 °C. El aire secundario completa la combustión y el accionamiento hidráulico hace pulsar la parrilla para mover la ceniza."},
  {ids:["HAG","AH"],s:["gas"],t:"El gas caliente sale del horno a unos 570 °C y cede calor al aire de combustión en el AH-01, saliendo a unos 495 °C."},
  {ids:["DMP","AH"],s:["gas","dil"],t:"El aire atmosférico entra por la compuerta de control y diluye el gas hacia la temperatura de secado."},
  {ids:["DL","CTRL","DMP","BC"],s:["gas","ctrl"],t:"El DL-01 entrega aire caliente a unos 250 °C por el conducto al secador. El TIC-02 mantiene esa temperatura; el TIC-01 mantiene el horno."}
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
  fb.addEventListener('click',()=>{const on=svg.classList.toggle('flowing');fb.textContent=on?'Pausar flujo':'Animar flujo';fb.setAttribute('aria-pressed',on)});
  const ob=R('origbtn'),op=R('origpane');
  if(ob&&op){
    ob.addEventListener('click',()=>{const o=op.hidden;op.hidden=!o;svg.style.display=o?'none':'';ob.textContent=o?'Diagrama interactivo':'Plano original';ob.setAttribute('aria-pressed',o)});
    const im=op.querySelector('img');im.addEventListener('click',()=>im.classList.toggle('zoom'));
  }
  const wb=R('walk'),wp=R('prev'),wn=R('next'),wc=R('ctr');
  function walk(i){
    walkI=i;const st=WALK[i];
    chips.forEach(c=>c.setAttribute('aria-pressed',st.s.includes(c.dataset.stream)?'true':'false'));
    highlight(st.s,st.ids);show(st.ids[0]);
    R('desc').textContent=st.t;R('tag').textContent='Step '+(i+1)+' of '+WALK.length;
    wb.textContent='Salir del recorrido';wp.hidden=false;wn.hidden=false;wp.disabled=i===0;wn.disabled=i===WALK.length-1;wc.textContent=(i+1)+' / '+WALK.length;
  }
  function endWalk(){if(walkI<0)return;walkI=-1;wb.textContent='Recorrer el proceso';wp.hidden=true;wn.hidden=true;wc.textContent=''}
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
  RAW:{tag:"Entrada",name:"Vinaza bruta",desc:"Vinaza de la columna de destilación: ácida, con alta DQO y rica en potasio, sulfatos y cloruros. Todo esquema ZLD empieza aquí.",spec:[["Sólidos totales","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Ver propiedades de la vinaza"},
  CSTR:{tag:"Ruta 1 · Biogás · paso 1",name:"Biodigestor MEGA-CSTR",desc:"La vinaza bruta se digiere de forma anaeróbica en un reactor de tanque agitado continuo. La DQO baja en torno al 65 % y la materia orgánica se convierte en biogás rico en metano.",spec:[["Reducción de DQO / DBO","65 ± 3% / 85 ± 3%"],["Rendimiento de biogás","0.52 m³ per kg COD removed"],["Producción","Biogás + BMSW"]],link:"#biogas",lt:"Ir a MEGA-CSTR"},
  GAS:{tag:"Ruta 1 · Biogás · energía",name:"Uso del biogás",desc:"El biogás puede quemarse en el generador de aire caliente del secador, en un motor de gas para producir electricidad o en la caldera de la destilería.",spec:[["Metano","55–60%"],["Poder calorífico","4.200–4.500 kcal/Nm³"],["Usos","GAC · motor de gas · caldera · GNC renovable"]],link:"#biogas",lt:"Ir a MEGA-CSTR"},
  MEE:{tag:"Ruta 1 · Biogás · paso 2",name:"Desgasificador + evaporación de múltiple efecto",desc:"La vinaza biometanizada (BMSW) se desgasifica al vacío y luego se concentra en los evaporadores de múltiple efecto de MEGA sin espuma ni antiespumante.",spec:[["Alimentación","BMSW, pH 7,5–8,5"],["Modelos","MEGA-BMSW30 · 30i · 40"],["Producción","Concentrado a 30–35 Brix"]],link:"#bmsw",lt:"Ir a la evaporación de BMSW"},
  STRIP:{tag:"Ruta 1 · Biogás · agua",name:"Stripper de condensado + CPU",desc:"La columna de stripping fraccionado de MEGA elimina el nitrógeno amoniacal y los AGV del condensado de proceso. La unidad de pulido de condensado lo deja apto para reciclar.",spec:[["Condensado bruto","pH 8,0–9,2, DQO ≤ 4.000 ppm"],["Producción","Agua reciclada al proceso"]],link:"#bmsw",lt:"Ir a la evaporación de BMSW"},
  ATFD:{tag:"Ruta 1 · Biogás · opción A",name:"ATFD → melaza condensada soluble",desc:"Un secador de película fina agitada lleva el concentrado de BMSW hasta unos 80 Brix. El producto, melaza condensada soluble (MCS), se usa como aditivo para alimento de ganado.",spec:[["Producto","MCS, hasta ~80 Brix"],["Use","Aditivo para alimento de ganado"]],link:null},
  SD:{tag:"Ruta 1 · Biogás · opción B",name:"Evaporación + secador por atomización",desc:"Un evaporador de acabado y el secador por atomización llevan el concentrado a un polvo de flujo libre rico en potasa. El generador de aire caliente puede funcionar con bagazo o con el biogás del digestor.",spec:[["Producto","Polvo 95 % p/p"],["Humedad","5–7% w/w"],["Product temp.","~30 °C"]],link:"#process",lt:"Ir al secador por atomización"},
  EVAP:{tag:"Ruta 2 · Incineración · paso 1",name:"Evaporación de vinaza bruta",desc:"Los evaporadores de múltiple efecto concentran la vinaza bruta a 55–60 Brix para quemarla como combustible de caldera.",spec:[["Objetivo","55–60 Brix"]],link:"#incineration",lt:"Ir a la ruta de incineración"},
  BOIL:{tag:"Ruta 2 · Incineración · paso 2",name:"Caldera de incineración",desc:"El concentrado a 55–60 Brix se quema en la caldera de incineración para generar vapor, de modo que ningún líquido sale de la planta.",spec:[["Combustible","Concentrado de vinaza, 55–60 Brix"],["Watch-outs","Alto coste de capital y de mantenimiento"]],link:"#incineration",lt:"Ir a la ruta de incineración"},
  STEAM:{tag:"Ruta 2 · Incineración · salida",name:"Vapor",desc:"El vapor de la caldera de incineración abastece a la destilería y a la planta de evaporación.",spec:[["Use","Vapor para la destilería y el evaporador"]],link:"#incineration",lt:"Ir a la ruta de incineración"},
  CPU:{tag:"Ruta 2 · Incineración · agua",name:"Unidad de pulido de condensado",desc:"El condensado de proceso de la evaporación de vinaza bruta contiene compuestos orgánicos volátiles. La CPU lo pule para reciclar el agua al proceso en lugar de verterla.",spec:[["Alimentación","Condensado de proceso del evaporador"],["Producción","Agua reciclada al proceso"]],link:"#incineration",lt:"Ir a la ruta de incineración"}
};
const INC={
  RAW:{tag:"Alimentación",name:"Vinaza bruta",desc:"Vinaza directamente de la columna de destilación, sin tratamiento de biogás.",spec:[["Sólidos totales","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Ver propiedades de la vinaza"},
  MEE:{tag:"Evaporación",name:"Evaporador de múltiple efecto de vinaza bruta",desc:"Concentra la vinaza bruta a 55–60 Brix. Cada efecto se calienta con el vapor del anterior, para una alta economía de vapor, y cada evaporador tiene previsión de CIP.",spec:[["Objetivo","55–60 Brix"],["Calentamiento","Vapor"],["Productos","Concentrado + condensado de proceso"]],link:null},
  CONC:{tag:"Concentrado",name:"Concentrado a caldera",desc:"El concentrado a 55–60 Brix se almacena y se alimenta a la caldera de incineración como combustible.",spec:[["Concentración","55–60 Brix"]],link:null},
  BOIL:{tag:"Energía",name:"Caldera de incineración",desc:"Quema el concentrado de vinaza para generar vapor, de modo que ningún efluente líquido sale de la destilería.",spec:[["Combustible","Concentrado de vinaza"],["Watch-outs","Alto coste de capital y de mantenimiento"]],link:null},
  STEAM:{tag:"Producción",name:"Vapor",desc:"El vapor abastece a la destilería y calienta la planta de evaporación.",spec:[["Consumidores","Destilería · evaporador"]],link:null},
  CPU:{tag:"Agua",name:"Unidad de pulido de condensado (CPU)",desc:"El condensado de proceso de la evaporación de vinaza bruta contiene compuestos orgánicos volátiles y no puede verterse tal cual. La CPU lo pule para reutilizarlo en la planta. MEGA suministra la CPU junto con la planta de evaporación.",spec:[["Alimentación","Condensado de proceso del evaporador"],["Producción","Agua apta para reciclar al proceso"]],link:null},
  REUSE:{tag:"Producción",name:"Agua tratada",desc:"El condensado pulido vuelve al proceso, reduce la demanda de agua fresca y cierra el ciclo del agua.",spec:[["Use","Reciclaje de agua de proceso"]],link:null}
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
    {x:196,y:640,t:"Tanque de alimentación",d:"Tanque pulmón de vinaza bruta, con ajuste de pH. La vinaza puede enfriarse antes en un intercambiador para la digestión mesófila.",s:[["Límite de batería","Vinaza bruta a la entrada del tanque pulmón"]]},
    {x:65,y:770,t:"Bomba de alimentación",d:"Bombas centrífugas alimentan la vinaza al eje central del digestor a caudal controlado.",s:[["Tipo","Centrífuga"]]},
    {x:875,y:520,t:"Digestor MEGA-CSTR",d:"La alimentación y el lodo recirculado entran por el tambor central. Un agitador central superior impulsa el flujo hacia abajo y tres agitadores laterales mezclan radialmente. El líquido tratado sale por un vertedero con sello hidráulico.",s:[["Régimen","Mesófilo 36–40 °C o termófilo 50–55 °C"],["pH del reactor","7.0–7.5"],["Diámetro típico","35–36 m; más digestores por encima de 700–750 m³/día"]]},
    {x:580,y:470,t:"Desgasificador",d:"Elimina el gas disuelto del efluente del reactor para que la biomasa sedimente bien en el clarificador.",s:[]},
    {x:395,y:500,t:"Clarificador lamelar",d:"Placas inclinadas separan la biomasa. El lodo activo sedimenta y se recircula; el exceso se purga para deshidratarlo o compostarlo.",s:[["Construcción","Acero al carbono con revestimiento epoxi anticorrosivo"]]},
    {x:560,y:770,t:"Bomba de lodos",d:"Devuelve la biomasa activa del clarificador al digestor y purga el exceso de lodo.",s:[]},
    {x:270,y:770,t:"Bomba de trasiego de BMSW",d:"Envía la vinaza biometanizada clarificada al desgasificador y a la planta de evaporación.",s:[["Límite de batería","Descarga del efluente clarificado"]]},
    {x:1233,y:575,t:"Gasómetro",d:"Gasómetro flotante de acero al carbono que almacena biogás a baja presión y volumen variable.",s:[]},
    {x:1335,y:745,t:"Soplante de biogás",d:"Eleva la presión del biogás hacia la caldera, el generador de aire caliente o la purificación.",s:[["Límite de batería","Brida de descarga del soplante"]]},
    {x:1215,y:300,t:"Antorcha",d:"Quema de forma segura el biogás sobrante o fuera de especificación, con encendido automático y enclavamientos de seguridad.",s:[]},
    {x:1328,y:170,t:"Analizador y caudalímetro de biogás",d:"Mide la calidad y el caudal del biogás en la línea a los consumidores.",s:[["Metano","55–60%"],["H₂S","2.5–3.5%"]]}
  ]},
  bmsw:{w:1400,h:989,pts:[
    {x:240,y:420,t:"Precalentador",d:"Precalienta la alimentación de BMSW antes de entrar en el desgasificador.",s:[]},
    {x:147,y:335,t:"Desgasificador al vacío",d:"Al vacío, el CO₂, el H₂S y el amoníaco salen de la solución. Rompeespumas mecánicos evitan el arrastre. Sin inyección de vapor ni antiespumante.",s:[["Características","Cámara de vacío · rompeespumas · distribución optimizada"]]},
    {x:515,y:380,t:"FFE-1, primer efecto",d:"Evaporador de película descendente calentado con vapor de baja presión (o vapores alcohólicos en el modelo BMSW30i).",s:[["Calentamiento","Vapor de baja presión"]]},
    {x:950,y:380,t:"FFE-2 a FFE-5",d:"Cada efecto se calienta con el vapor del anterior, multiplicando la economía de vapor. Una calandria de reserva permite limpiar sin parar la planta.",s:[["Configuración","Película descendente, ± acabador de circulación forzada"]]},
    {x:870,y:470,t:"Separadores vapor–líquido",d:"VLS-1 a VLS-5 separan el vapor del licor que se concentra tras cada efecto.",s:[]},
    {x:1240,y:370,t:"Condensador de superficie",d:"Condensa el vapor del último efecto, con una bomba de vacío que mantiene la planta al vacío.",s:[["Refrigeración","Agua de refrigeración, ida / retorno"]]},
    {x:690,y:745,t:"Vinaza concentrada",d:"El concentrado sale del último efecto hacia el ATFD (MCS) o el secador por atomización (polvo).",s:[["Concentración","30–35 Brix"]]},
    {x:1270,y:785,t:"Tanque de condensado de proceso",d:"Recoge el condensado de proceso y lo envía a la columna de stripping.",s:[["Calidad bruta","pH 8,0–9,2, DQO ≤ 4.000 ppm, SDT ≤ 1.500 ppm"]]},
    {x:375,y:540,t:"Columna de stripping",d:"La columna de stripping fraccionado de MEGA, integrada térmicamente con el evaporador, elimina el nitrógeno amoniacal, los AGV y los gases disueltos del condensado.",s:[["Resultado","Menor carga en la CPU"]]},
    {x:460,y:765,t:"Tanque de condensado de vapor",d:"Recoge el condensado de vapor limpio para su retorno.",s:[]}
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
