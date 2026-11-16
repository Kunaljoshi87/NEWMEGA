(function(){
const EQ={
  FT:{tag:"FT-1",name:"Tanque de alimentação",desc:"Recebe a vinhaça concentrada do evaporador de múltiplo efeito e a mantém como estoque antes da atomização. Um agitador no topo mantém os sólidos em suspensão.",spec:[["Alimentação","Vinhaça 38–40% m/m"],["Origem","Evaporador de múltiplo efeito"],["Nível","LG-01 indicador de boia e régua"]],s:["feed"],type:"Tanque agitado"},
  FP:{tag:"FP-01/02",name:"Bombas de alimentação",desc:"Bombas de parafuso enviam o concentrado a vazão constante ao atomizador. Cada bomba tem inversor e filtro em linha; uma opera enquanto a outra fica em reserva.",spec:[["Tipo","Parafuso (cavidade progressiva)"],["Acionamento","VFD"],["Config.","1 em operação + 1 reserva"],["Entrega para","Atomizador RD-1"]],s:["feed"],type:"Bomba de parafuso com inversor, 1O + 1R"},
  AT:{tag:"AD-1 / RD-1",name:"Distribuidor de ar com atomizador rotativo",desc:"O ar quente do GAQ entra no distribuidor de ar no teto da câmara e gira em torno do atomizador rotativo de alta velocidade, que quebra o concentrado em uma névoa fina.",spec:[["Atomizador","Disco rotativo"],["Ar quente","~250 °C a partir do DL-01"],["Localização","Teto da câmara, centro"]],s:["feed","hot"],type:"Atomizador rotativo + distribuidor de ar"},
  HAG:{tag:"HAG-01 / DL-01",name:"Gerador de ar quente",desc:"Queima bagaço seco ao ar e fornece ar quente a cerca de 250 °C. Veja a seção do gerador de ar quente para o fluxo completo.",spec:[["Combustível","Bagaço seco ao ar ou biogás"],["Ar quente","~250 °C"],["Entrega","AD-1 no teto do CH-1"]],s:["hot","air"],type:"A bagaço / biogás, ver seção 08"},
  DC:{tag:"CH-1",name:"Câmara de secagem por atomização",desc:"As gotículas atomizadas encontram o ar quente e secam em segundos. O pó cai no cone e sai pelo resfriador de pó; o ar e os finos seguem para os ciclones.",spec:[["MOC","AISI 304"],["Produto","Pó de vinhaça seco, 5–7% de umidade"],["Acesso","Porta, visor e visor iluminado"],["Saídas","Pó (cone), ar + finos (lateral)"]],s:["feed","hot","powder","gas"],type:"Câmara de atomização AISI 304"},
  PC:{tag:"PC-1",name:"Resfriador de pó",desc:"Recebe o pó do cone da câmara e o resfria antes de entrar na linha de transporte pneumático para o silo.",spec:[["Localização","Saída do cone da câmara"],["Product temp.","~30 °C"],["Descarga","Linha de transporte para o CY-2"]],s:["powder"],type:"Na descarga da câmara"},
  CY1:{tag:"CY-1",name:"Multi-cyclone",desc:"Ciclones de alta eficiência separam os finos do ar de saída da câmara. Os finos coletados são descarregados por válvulas rotativas na linha de transporte de pó.",spec:[["Descarga","RAV-1 / RAV-2"],["Gás para","ID-1 exaustor"]],s:["gas","powder"],type:"Alta eficiência, descarga por válvula rotativa"},
  ID1:{tag:"ID-1",name:"Exaustor",desc:"Aspira o ar de secagem pela câmara e pelos ciclones, mantém o sistema em leve depressão e envia os gases ao lavador. Controlado por inversor.",spec:[["Aspira de","Coletor de saída do CY-1"],["Descarrega para","SC-1 lavador"],["Acionamento","VFD"]],s:["gas"],type:"Tiragem induzida, com inversor"},
  WS:{tag:"SC-1",name:"Lavador",desc:"Sprays de água capturam a poeira restante da exaustão principal antes que o gás limpo saia pela chaminé.",spec:[["Meio","Água recirculada"],["Make-up","Abastecimento de água"],["Saída","Gás limpo para a atmosfera"]],s:["gas","water"],type:"Lavador úmido"},
  SP:{tag:"SP-1/2",name:"Bombas do lavador",desc:"Recirculam a água de lavagem do tanque do lavador para o coletor de spray. Uma opera enquanto a outra fica em reserva.",spec:[["Config.","1 em operação + 1 reserva"],["Serviço","Spray do lavador"]],s:["water"],type:"Centrífuga, 1O + 1R"},
  CY2:{tag:"CY-2",name:"Ciclone de transporte",desc:"Separa o pó do ar de transporte pneumático no topo do silo. O pó cai pela RAV-4 no silo; o ar segue para o filtro de mangas.",spec:[["Entrada","Pó do PC-1 e do CY-1"],["Pó para","SO-1 via RAV-4"],["Ar para","CBF-1"]],s:["powder","gas"],type:"Ciclone de produto, RAV-4"},
  BF:{tag:"CBF-1",name:"Filtro de mangas de transporte",desc:"Coletor final de pó do ar de transporte. Pulsos de ar de instrumentos por solenoides limpam as mangas em operação; o pó recuperado volta ao silo pela RAV-5.",spec:[["Limpeza","Pulse-jet, ar de instrumentos 7 kg/cm²"],["Válvulas","SV-01 to SV-07"],["Descarga","RAV-5 para SO-1"],["Ar para","ID-2"]],s:["gas","powder","air"],type:"Pulse-jet, RAV-5"},
  ID2:{tag:"ID-2",name:"Exaustor de transporte",desc:"Puxa o ar de transporte pelo ciclone de transporte e pelo filtro de mangas e descarrega o ar filtrado no respiro.",spec:[["Aspira de","CBF-1"],["Descarrega em","Respiro de exaustão"]],s:["gas"],type:"Tiragem induzida"},
  SO:{tag:"SO-1",name:"Silo",desc:"Armazena o pó acabado. A RAV-6 no cone alimenta a costuradeira para o ensaque.",spec:[["Armazenamento","Silo de produto"],["Produto","95% m/m de sólidos"],["Saída","RAV-6 para ensaque"]],s:["powder"],type:"Silo de produto, RAV-6"}
};
const ORDER=["FT","FP","AT","HAG","DC","PC","CY1","CY2","SO","BF","ID2","ID1","WS","SP"];
const WALK=[
  {ids:["FT","FP"],s:["feed"],t:"O concentrado do evaporador, a 38–40% m/m, é bombeado do tanque de alimentação para o atomizador."},
  {ids:["AT","HAG","DC"],s:["feed","hot"],t:"O atomizador rotativo pulveriza o concentrado no ar quente a cerca de 250 °C do GAQ a bagaço / biogás. A água evapora dentro da câmara."},
  {ids:["DC","CY1"],s:["gas"],t:"O ar úmido com finos sai da câmara e passa pelo multiciclone."},
  {ids:["DC","PC","CY1","CY2","SO"],s:["powder"],t:"O pó do resfriador e dos ciclones é transportado ao ciclone de transporte e cai no silo de produto."},
  {ids:["CY2","BF","ID2"],s:["gas","air"],t:"O ar de transporte é limpo no filtro de mangas pulse-jet antes de o ID-2 liberá-lo."},
  {ids:["ID1","WS","SP"],s:["gas","water"],t:"O exaustor envia o ar de secagem pelo lavador, e o gás limpo sai pela chaminé."},
  {ids:["SO"],s:["powder"],t:"O pó seco a 95% m/m e cerca de 30 °C é ensacado na base do silo."}
];
const NEIGH={FT:["FP"],FP:["FT","AT"],AT:["FP","DC","HAG"],HAG:["AT","DC"],DC:["AT","HAG","CY1","PC"],PC:["DC","CY2"],CY1:["DC","ID1","CY2"],ID1:["CY1","WS"],WS:["ID1","SP"],SP:["WS"],CY2:["PC","CY1","SO","BF"],BF:["CY2","ID2","SO"],ID2:["BF"],SO:["CY2","BF"]};

const HEQ={
  BC:{tag:"BC-1",name:"Transportador de bagaço",desc:"Dosa bagaço seco ao ar do ponto de alimentação do cliente por uma calha até o espalhador da fornalha. Seu inversor segue o controlador de temperatura da fornalha.",spec:[["Acionamento","VFD"],["Combustível","Bagaço seco ao ar"]],s:["fuel","ctrl"],type:"VFD"},
  HAG:{tag:"HAG-01",name:"Fornalha do gerador de ar quente",desc:"Fornalha de dois compartimentos com revestimento refratário. Um espalhador pneumático lança o bagaço sobre uma grelha pulsante no compartimento 1, bicos de ar secundário completam a combustão e o compartimento 2 queima os gases a cerca de 850 °C.",spec:[["Grelha","Pulsante"],["Alimentação de combustível","Espalhador pneumático"],["Ar secundário","Bicos de ar secundário, ambos os lados"],["Furnace temp.","~850 °C"],["Saída de gás","570 °C"]],s:["fuel","comb","gas"],type:"Dois compartimentos, grelha pulsante"},
  HP:{tag:"Acionamento da grelha",name:"Acionamento hidráulico da grelha",desc:"Uma bomba de partida direta em um tanque de óleo de 80 litros aciona a grelha pulsante por mangueiras, movendo combustível e cinzas pela grelha.",spec:[["Tanque de óleo","80 L"],["Partida","DOL"],["Instrumentos","Manômetro, termômetro, visor de nível"]],s:["fuel"],type:"Unidade hidráulica de 80 L"},
  AH:{tag:"AH-01",name:"Aquecedor de ar",desc:"O gás quente da fornalha passa pelo feixe tubular e pré-aquece o ar de combustão do CF-1. O gás sai a cerca de 495 °C para a diluição; o ar de combustão volta à fornalha a cerca de 150 °C.",spec:[["Gás entrada / saída","570 °C / 495 °C"],["Ar entrada / saída","30 °C / 150 °C"]],s:["comb","gas"],type:"Tubular, gás-ar"},
  CF:{tag:"CF-1",name:"Soprador de combustão",desc:"Ventilador de tiragem forçada que empurra o ar ambiente pelo aquecedor de ar até a parte inferior da grelha e o espalhador pneumático.",spec:[["Entrada de ar","Ambiente, 30 °C"],["Entrega para","Ar sob a grelha e espalhador pneumático"]],s:["comb"],type:"Ventilador de tiragem forçada"},
  DMP:{tag:"Damper de diluição",name:"Damper de controle do ar de diluição",desc:"Admite ar atmosférico na coluna de gás quente para levá-lo à temperatura de secagem. Um atuador elétrico posiciona o damper conforme o controlador de temperatura do ar quente.",spec:[["Air","Atmosférico, 30 °C"],["Entrada","Tubulação de ar atmosférico"],["Acionamento","Elétrico"]],s:["dil","ctrl"],type:"Atuador elétrico"},
  DL:{tag:"DL-01",name:"Soprador de diluição",desc:"Puxa o ar quente misturado pelo duto de ar quente e o entrega ao distribuidor de ar (AD-1) no teto da câmara. Controlado por inversor.",spec:[["Ar quente","~250 °C"],["Entrega para","AD-1 on CH-1"],["Acionamento","VFD"]],s:["gas","ctrl"],type:"VFD"},
  CTRL:{tag:"TIC-01 · TIC-02 · PIC-01",name:"Controles do GAQ",desc:"A temperatura da fornalha (TIC-01) define a velocidade do transportador de bagaço. A temperatura do ar quente para o secador (TIC-02) posiciona o damper de diluição e define a velocidade do DL-01. O PIC-01 monitora a tiragem da fornalha.",spec:[["TIC-01","Temp. da fornalha → inversor BC-1"],["TIC-02","Temp. do ar quente → damper, inversor DL-01"],["PIC-01","Tiragem da fornalha"]],s:["ctrl"],type:"Malhas de CLP"}
};
const HORDER=["BC","HAG","HP","CF","AH","DMP","DL","CTRL"];
const HWALK=[
  {ids:["BC","HAG"],s:["fuel"],t:"O BC-1 dosa bagaço seco ao ar para o espalhador pneumático, que o lança sobre a grelha pulsante."},
  {ids:["CF","AH","HAG"],s:["comb"],t:"O CF-1 empurra ar ambiente pelo aquecedor de ar. Ele chega à grelha e ao espalhador pré-aquecido a cerca de 150 °C."},
  {ids:["HAG","HP"],s:["fuel","comb"],t:"O bagaço queima a cerca de 850 °C. O ar secundário completa a combustão e o acionamento hidráulico pulsa a grelha para mover as cinzas."},
  {ids:["HAG","AH"],s:["gas"],t:"O gás quente sai da fornalha a cerca de 570 °C e cede calor ao ar de combustão no AH-01, saindo a cerca de 495 °C."},
  {ids:["DMP","AH"],s:["gas","dil"],t:"O ar atmosférico entra pelo damper de controle e dilui o gás até a temperatura de secagem."},
  {ids:["DL","CTRL","DMP","BC"],s:["gas","ctrl"],t:"O DL-01 entrega ar quente a cerca de 250 °C pelo duto até o secador. O TIC-02 mantém essa temperatura; o TIC-01 mantém a da fornalha."}
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
  fb.addEventListener('click',()=>{const on=svg.classList.toggle('flowing');fb.textContent=on?'Pausar fluxo':'Animar fluxo';fb.setAttribute('aria-pressed',on)});
  const ob=R('origbtn'),op=R('origpane');
  if(ob&&op){
    ob.addEventListener('click',()=>{const o=op.hidden;op.hidden=!o;svg.style.display=o?'none':'';ob.textContent=o?'Diagrama interativo':'Desenho original';ob.setAttribute('aria-pressed',o)});
    const im=op.querySelector('img');im.addEventListener('click',()=>im.classList.toggle('zoom'));
  }
  const wb=R('walk'),wp=R('prev'),wn=R('next'),wc=R('ctr');
  function walk(i){
    walkI=i;const st=WALK[i];
    chips.forEach(c=>c.setAttribute('aria-pressed',st.s.includes(c.dataset.stream)?'true':'false'));
    highlight(st.s,st.ids);show(st.ids[0]);
    R('desc').textContent=st.t;R('tag').textContent='Step '+(i+1)+' of '+WALK.length;
    wb.textContent='Sair do percurso';wp.hidden=false;wn.hidden=false;wp.disabled=i===0;wn.disabled=i===WALK.length-1;wc.textContent=(i+1)+' / '+WALK.length;
  }
  function endWalk(){if(walkI<0)return;walkI=-1;wb.textContent='Percorrer o processo';wp.hidden=true;wn.hidden=true;wc.textContent=''}
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
  RAW:{tag:"Entrada",name:"Vinhaça bruta",desc:"Vinhaça da coluna de destilação: ácida, com alta DQO e rica em potássio, sulfatos e cloretos. Todo esquema ZLD começa aqui.",spec:[["Sólidos totais","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Ver propriedades da vinhaça"},
  CSTR:{tag:"Rota 1 · Biogás · etapa 1",name:"Biodigestor MEGA-CSTR",desc:"A vinhaça bruta é digerida de forma anaeróbia em um reator de tanque agitado contínuo. A DQO cai cerca de 65% e a matéria orgânica vira biogás rico em metano.",spec:[["Redução de DQO / DBO","65 ± 3% / 85 ± 3%"],["Rendimento de biogás","0.52 m³ per kg COD removed"],["Produção","Biogás + BMSW"]],link:"#biogas",lt:"Ir para o MEGA-CSTR"},
  GAS:{tag:"Rota 1 · Biogás · energia",name:"Uso do biogás",desc:"O biogás pode ser queimado no gerador de ar quente do secador, em um motor a gás para gerar eletricidade ou na caldeira da destilaria.",spec:[["Metano","55–60%"],["Poder calorífico","4.200–4.500 kcal/Nm³"],["Usos","GAQ · motor a gás · caldeira · biometano"]],link:"#biogas",lt:"Ir para o MEGA-CSTR"},
  MEE:{tag:"Rota 1 · Biogás · etapa 2",name:"Desgaseificador + evaporação de múltiplo efeito",desc:"A vinhaça biometanizada (BMSW) é desgaseificada a vácuo e depois concentrada nos evaporadores de múltiplo efeito da MEGA sem espuma nem antiespumante.",spec:[["Alimentação","BMSW, pH 7,5–8,5"],["Modelos","MEGA-BMSW30 · 30i · 40"],["Produção","Concentrado a 30–35 Brix"]],link:"#bmsw",lt:"Ir para a evaporação de BMSW"},
  STRIP:{tag:"Rota 1 · Biogás · água",name:"Stripper de condensado + CPU",desc:"A coluna de stripping fracionado da MEGA remove o nitrogênio amoniacal e os AGV do condensado de processo. A unidade de polimento o deixa apto para reciclar.",spec:[["Condensado bruto","pH 8,0–9,2, DQO ≤ 4.000 ppm"],["Produção","Água reciclada para o processo"]],link:"#bmsw",lt:"Ir para a evaporação de BMSW"},
  ATFD:{tag:"Rota 1 · Biogás · opção A",name:"ATFD → melaço condensado solúvel",desc:"Um secador de filme fino agitado leva o concentrado de BMSW a cerca de 80 Brix. O produto, melaço condensado solúvel (MCS), é usado como aditivo para ração animal.",spec:[["Produto","MCS, até ~80 Brix"],["Use","Aditivo para ração animal"]],link:null},
  SD:{tag:"Rota 1 · Biogás · opção B",name:"Evaporação + secador por atomização",desc:"Um evaporador de acabamento e o secador por atomização levam o concentrado a um pó de fluxo livre rico em potássio. O gerador de ar quente pode queimar bagaço ou o biogás do digestor.",spec:[["Produto","Pó a 95% m/m"],["Umidade","5–7% w/w"],["Product temp.","~30 °C"]],link:"#process",lt:"Ir para o secador por atomização"},
  EVAP:{tag:"Rota 2 · Incineração · etapa 1",name:"Evaporação de vinhaça bruta",desc:"Evaporadores de múltiplo efeito concentram a vinhaça bruta a 55–60 Brix para que seja queimada como combustível de caldeira.",spec:[["Meta","55–60 Brix"]],link:"#incineration",lt:"Ir para a rota de incineração"},
  BOIL:{tag:"Rota 2 · Incineração · etapa 2",name:"Caldeira de incineração",desc:"O concentrado a 55–60 Brix é queimado na caldeira de incineração para gerar vapor, de modo que nenhum líquido sai da planta.",spec:[["Combustível","Concentrado de vinhaça, 55–60 Brix"],["Watch-outs","Alto custo de capital e de manutenção"]],link:"#incineration",lt:"Ir para a rota de incineração"},
  STEAM:{tag:"Rota 2 · Incineração · saída",name:"Vapor",desc:"O vapor da caldeira de incineração atende a destilaria e a planta de evaporação.",spec:[["Use","Vapor para a destilaria e o evaporador"]],link:"#incineration",lt:"Ir para a rota de incineração"},
  CPU:{tag:"Rota 2 · Incineração · água",name:"Unidade de polimento de condensado",desc:"O condensado de processo da evaporação de vinhaça bruta contém compostos orgânicos voláteis. A CPU o polia para que a água seja reciclada ao processo em vez de descartada.",spec:[["Alimentação","Condensado de processo do evaporador"],["Produção","Água reciclada para o processo"]],link:"#incineration",lt:"Ir para a rota de incineração"}
};
const INC={
  RAW:{tag:"Alimentação",name:"Vinhaça bruta",desc:"Vinhaça direto da coluna de destilação, sem tratamento por biogás.",spec:[["Sólidos totais","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"Ver propriedades da vinhaça"},
  MEE:{tag:"Evaporação",name:"Evaporador de múltiplo efeito de vinhaça bruta",desc:"Concentra a vinhaça bruta a 55–60 Brix. Cada efeito é aquecido pelo vapor do anterior, para alta economia de vapor, e todo evaporador tem previsão de CIP.",spec:[["Meta","55–60 Brix"],["Aquecimento","Vapor"],["Produtos","Concentrado + condensado de processo"]],link:null},
  CONC:{tag:"Concentrado",name:"Concentrado para a caldeira",desc:"O concentrado a 55–60 Brix é armazenado e alimentado à caldeira de incineração como combustível.",spec:[["Concentração","55–60 Brix"]],link:null},
  BOIL:{tag:"Energia",name:"Caldeira de incineração",desc:"Queima o concentrado de vinhaça para gerar vapor, de modo que nenhum efluente líquido sai da destilaria.",spec:[["Combustível","Concentrado de vinhaça"],["Watch-outs","Alto custo de capital e de manutenção"]],link:null},
  STEAM:{tag:"Produção",name:"Vapor",desc:"O vapor atende a destilaria e aquece a planta de evaporação.",spec:[["Consumidores","Destilaria · evaporador"]],link:null},
  CPU:{tag:"Água",name:"Unidade de polimento de condensado (CPU)",desc:"O condensado de processo da evaporação de vinhaça bruta contém compostos orgânicos voláteis e não pode ser descartado como está. A CPU o polia para reúso na planta. A MEGA fornece a CPU junto com a planta de evaporação.",spec:[["Alimentação","Condensado de processo do evaporador"],["Produção","Água apta para reciclar no processo"]],link:null},
  REUSE:{tag:"Produção",name:"Água tratada",desc:"O condensado polido volta ao processo, reduz a demanda de água nova e fecha o ciclo da água.",spec:[["Use","Reciclagem de água de processo"]],link:null}
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
    {x:196,y:640,t:"Tanque de alimentação",d:"Tanque pulmão de vinhaça bruta, com ajuste de pH. A vinhaça pode ser resfriada antes em um trocador para a digestão mesofílica.",s:[["Limite de bateria","Vinhaça bruta na entrada do tanque pulmão"]]},
    {x:65,y:770,t:"Bomba de alimentação",d:"Bombas centrífugas alimentam a vinhaça no eixo central do digestor com vazão controlada.",s:[["Tipo","Centrífuga"]]},
    {x:875,y:520,t:"Digestor MEGA-CSTR",d:"A alimentação e o lodo recirculado entram pelo tambor central. Um agitador central superior impulsiona o fluxo para baixo e três agitadores laterais misturam radialmente. O líquido tratado sai por um vertedouro com selo hidráulico.",s:[["Regime","Mesofílico 36–40 °C ou termofílico 50–55 °C"],["pH do reator","7.0–7.5"],["Diâmetro típico","35–36 m; mais digestores acima de 700–750 m³/dia"]]},
    {x:580,y:470,t:"Desgaseificador",d:"Remove o gás dissolvido do efluente do reator para que a biomassa sedimente bem no clarificador.",s:[]},
    {x:395,y:500,t:"Clarificador lamelar",d:"Placas inclinadas separam a biomassa. O lodo ativo sedimenta e é recirculado; o excesso é purgado para desaguamento ou compostagem.",s:[["Construção","Aço carbono com revestimento epóxi anticorrosivo"]]},
    {x:560,y:770,t:"Bomba de lodo",d:"Retorna a biomassa ativa do clarificador ao digestor e purga o excesso de lodo.",s:[]},
    {x:270,y:770,t:"Bomba de transferência de BMSW",d:"Envia a vinhaça biometanizada clarificada ao desgaseificador e à planta de evaporação.",s:[["Limite de bateria","Descarga do efluente clarificado"]]},
    {x:1233,y:575,t:"Gasômetro",d:"Gasômetro flutuante de aço carbono que armazena biogás a baixa pressão e volume variável.",s:[]},
    {x:1335,y:745,t:"Soprador de biogás",d:"Eleva a pressão do biogás para a caldeira, o gerador de ar quente ou a purificação.",s:[["Limite de bateria","Flange de descarga do soprador"]]},
    {x:1215,y:300,t:"Flare",d:"Queima com segurança o biogás excedente ou fora de especificação, com ignição automática e intertravamentos de segurança.",s:[]},
    {x:1328,y:170,t:"Analisador e medidor de vazão de biogás",d:"Mede a qualidade e a vazão do biogás na linha para os consumidores.",s:[["Metano","55–60%"],["H₂S","2.5–3.5%"]]}
  ]},
  bmsw:{w:1400,h:989,pts:[
    {x:240,y:420,t:"Pré-aquecedor",d:"Pré-aquece a alimentação de BMSW antes de entrar no desgaseificador.",s:[]},
    {x:147,y:335,t:"Desgaseificador a vácuo",d:"A vácuo, o CO₂, o H₂S e a amônia saem da solução. Quebra-espumas mecânicos evitam o arraste. Sem injeção de vapor e sem antiespumante.",s:[["Características","Câmara de vácuo · quebra-espumas · distribuição otimizada"]]},
    {x:515,y:380,t:"FFE-1, primeiro efeito",d:"Evaporador de filme descendente aquecido com vapor de baixa pressão (ou vapores alcoólicos no modelo BMSW30i).",s:[["Aquecimento","Vapor de baixa pressão"]]},
    {x:950,y:380,t:"FFE-2 a FFE-5",d:"Cada efeito é aquecido pelo vapor do anterior, multiplicando a economia de vapor. Uma calandra reserva permite limpar sem parar a planta.",s:[["Configuração","Filme descendente, ± finalizador de circulação forçada"]]},
    {x:870,y:470,t:"Separadores vapor–líquido",d:"VLS-1 a VLS-5 separam o vapor do licor em concentração após cada efeito.",s:[]},
    {x:1240,y:370,t:"Condensador de superfície",d:"Condensa o vapor do último efeito, com uma bomba de vácuo mantendo a planta sob vácuo.",s:[["Resfriamento","Água de resfriamento, ida / retorno"]]},
    {x:690,y:745,t:"Vinhaça concentrada",d:"O concentrado sai do último efeito para o ATFD (MCS) ou o secador por atomização (pó).",s:[["Concentração","30–35 Brix"]]},
    {x:1270,y:785,t:"Tanque de condensado de processo",d:"Coleta o condensado de processo e o envia à coluna de stripping.",s:[["Qualidade bruta","pH 8,0–9,2, DQO ≤ 4.000 ppm, SDT ≤ 1.500 ppm"]]},
    {x:375,y:540,t:"Coluna de stripping",d:"A coluna de stripping fracionado da MEGA, integrada termicamente ao evaporador, remove o nitrogênio amoniacal, os AGV e os gases dissolvidos do condensado.",s:[["Resultado","Menor carga na CPU"]]},
    {x:460,y:765,t:"Tanque de condensado de vapor",d:"Coleta o condensado de vapor limpo para retorno.",s:[]}
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
