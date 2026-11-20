(function(){
const EQ={
  FT:{tag:"FT-1",name:"Feed tank",desc:"Receives concentrated vinasse from the multiple effect evaporator and holds it as a buffer ahead of atomisation. A top-mounted agitator keeps solids in suspension.",spec:[["التغذية","Vinasse 38–40% w/w"],["Source","مبخّر متعدد المراحل"],["Level","LG-01 float & board indicator"]],s:["feed"],type:"Agitated tank"},
  FP:{tag:"FP-01/02",name:"Feed pumps",desc:"Screw pumps deliver concentrate at a steady rate to the atomiser. Each pump has a VFD and an inline strainer; one works while one stands by.",spec:[["Type","Screw (progressive cavity)"],["Drive","VFD"],["Config.","1 working + 1 standby"],["Delivers to","RD-1 atomiser"]],s:["feed"],type:"Screw pump with VFD, 1W + 1S"},
  AT:{tag:"AD-1 / RD-1",name:"Air distributor with rotary atomiser",desc:"Hot air from the HAG enters the air distributor on the chamber roof and swirls around the high-speed rotary atomiser, which breaks the concentrate into a fine spray.",spec:[["Atomiser","Rotary disc"],["Hot air","~250 °C from DL-01"],["Location","Chamber roof, centre"]],s:["feed","hot"],type:"Rotary atomiser + air distributor"},
  HAG:{tag:"HAG-01 / DL-01",name:"مولّد الهواء الساخن",desc:"Burns yard dry bagasse and supplies hot air at about 250 °C. See the hot air generator section for the full process flow.",spec:[["الوقود","Yard dry bagasse or biogas"],["Hot air","~250 °C"],["Delivers","AD-1 on CH-1 roof"]],s:["hot","air"],type:"Bagasse / biogas-fired, see section 08"},
  DC:{tag:"CH-1",name:"Spray drying chamber",desc:"Atomised droplets meet the hot air and dry in seconds. Powder falls to the cone and leaves through the powder cooler; air and fines leave to the cyclones.",spec:[["MOC","AISI 304"],["المنتج","Dry vinasse powder, 5–7% moisture"],["Access","Door, sight and light glass"],["Outlets","Powder (cone), air + fines (side)"]],s:["feed","hot","powder","gas"],type:"AISI 304 spray chamber"},
  PC:{tag:"PC-1",name:"Powder cooler",desc:"Takes powder from the chamber cone and cools it before it enters the pneumatic conveying line to the silo.",spec:[["Location","Chamber cone outlet"],["Product temp.","~30 °C"],["Discharge","Conveying line to CY-2"]],s:["powder"],type:"At chamber discharge"},
  CY1:{tag:"CY-1",name:"Multi-cyclone",desc:"High-efficiency cyclones strip fines from the chamber exhaust. Collected fines discharge through rotary valves into the powder conveying line.",spec:[["Discharge","RAV-1 / RAV-2"],["Gas to","مروحة السحب ID-1"]],s:["gas","powder"],type:"High-efficiency, rotary valve discharge"},
  ID1:{tag:"ID-1",name:"ID blower",desc:"Draws drying air through the chamber and cyclones, holding the system under slight suction, and pushes the exhaust into the scrubber. VFD-controlled.",spec:[["Draws from","CY-1 outlet header"],["Discharges to","جهاز الغسل SC-1"],["Drive","VFD"]],s:["gas"],type:"Induced draft, VFD"},
  WS:{tag:"SC-1",name:"Scrubber",desc:"Water sprays capture remaining dust from the main exhaust before the clean gas is released through the stack.",spec:[["Medium","Recirculated water"],["Make-up","Water supply"],["Outlet","Clean gas to atmosphere"]],s:["gas","water"],type:"Wet scrubber"},
  SP:{tag:"SP-1/2",name:"Scrubber pumps",desc:"Recirculate scrubbing water from the scrubber tank to the spray header. One works while one stands by.",spec:[["Config.","1 working + 1 standby"],["Duty","Scrubber spray"]],s:["water"],type:"Centrifugal, 1W + 1S"},
  CY2:{tag:"CY-2",name:"Conveying cyclone",desc:"Separates powder from the pneumatic conveying air at the top of the silo. Powder drops through RAV-4 into the silo; the air goes on to the bag filter.",spec:[["Inlet","Powder from PC-1 and CY-1"],["Powder to","SO-1 via RAV-4"],["Air to","CBF-1"]],s:["powder","gas"],type:"Product cyclone, RAV-4"},
  BF:{tag:"CBF-1",name:"Conveying bag filter",desc:"Final dust catcher on the conveying air. Instrument-air pulses through solenoid valves clean the bags online; recovered powder returns to the silo through RAV-5.",spec:[["Cleaning","Pulse jet, instrument air 7 kg/cm²"],["Valves","SV-01 to SV-07"],["Discharge","RAV-5 to SO-1"],["Air to","ID-2"]],s:["gas","powder","air"],type:"Pulse jet, RAV-5"},
  ID2:{tag:"ID-2",name:"Conveying ID blower",desc:"Pulls the conveying air through the conveying cyclone and bag filter, and discharges the filtered air to vent.",spec:[["Draws from","CBF-1"],["Discharges","Exhaust vent"]],s:["gas"],type:"Induced draft"},
  SO:{tag:"SO-1",name:"Silo",desc:"Stores the finished powder. RAV-6 at the cone feeds the stitching machine for bagging.",spec:[["Storage","Product silo"],["المنتج","95% w/w solids"],["Outlet","RAV-6 to bagging"]],s:["powder"],type:"Product silo, RAV-6"}
};
const ORDER=["FT","FP","AT","HAG","DC","PC","CY1","CY2","SO","BF","ID2","ID1","WS","SP"];
const WALK=[
  {ids:["FT","FP"],s:["feed"],t:"Concentrate from the evaporator, at 38–40% w/w, is pumped from the feed tank to the atomiser."},
  {ids:["AT","HAG","DC"],s:["feed","hot"],t:"The rotary atomiser sprays the concentrate into hot air at about 250 °C from the bagasse / biogas-fired HAG. Water flashes off inside the chamber."},
  {ids:["DC","CY1"],s:["gas"],t:"Moist air carrying fines leaves the chamber and passes through the multi-cyclone."},
  {ids:["DC","PC","CY1","CY2","SO"],s:["powder"],t:"Powder from the powder cooler and cyclones is conveyed to the conveying cyclone and drops into the product silo."},
  {ids:["CY2","BF","ID2"],s:["gas","air"],t:"Conveying air is cleaned in the pulse-jet bag filter before ID-2 vents it."},
  {ids:["ID1","WS","SP"],s:["gas","water"],t:"The ID blower sends the drying air through the scrubber, and clean gas leaves the stack."},
  {ids:["SO"],s:["powder"],t:"Dry powder at 95% w/w and about 30 °C is bagged from the bottom of the silo."}
];
const NEIGH={FT:["FP"],FP:["FT","AT"],AT:["FP","DC","HAG"],HAG:["AT","DC"],DC:["AT","HAG","CY1","PC"],PC:["DC","CY2"],CY1:["DC","ID1","CY2"],ID1:["CY1","WS"],WS:["ID1","SP"],SP:["WS"],CY2:["PC","CY1","SO","BF"],BF:["CY2","ID2","SO"],ID2:["BF"],SO:["CY2","BF"]};

const HEQ={
  BC:{tag:"BC-1",name:"Bagasse carrier",desc:"Meters yard dry bagasse from the client's feed point down a chute to the furnace spreader. Its VFD follows the furnace temperature controller.",spec:[["Drive","VFD"],["الوقود","باغاس جاف من الساحة"]],s:["fuel","ctrl"],type:"VFD"},
  HAG:{tag:"HAG-01",name:"Hot air generator furnace",desc:"Two-compartment refractory-lined furnace. A pneumatic spreader throws bagasse onto a pulsating grate in compartment 1, over-fire air nozzles complete combustion, and compartment 2 lets the gas burn out at about 850 °C.",spec:[["Grate","Pulsating"],["Fuel feed","Pneumatic spreader"],["Over-fire air","OFA nozzles, both sides"],["Furnace temp.","~850 °C"],["Gas outlet","570 °C"]],s:["fuel","comb","gas"],type:"Two-compartment, pulsating grate"},
  HP:{tag:"محرّك الشبكة",name:"المحرّك الهيدروليكي للشبكة",desc:"A DOL-started pump on an 80-litre oil tank drives the pulsating grate through hose connections, moving fuel and ash down the grate.",spec:[["Oil tank","80 L"],["Starter","DOL"],["Instruments","Pressure gauge, temperature gauge, level glass"]],s:["fuel"],type:"80 L hydraulic pack"},
  AH:{tag:"AH-01",name:"سخّان الهواء",desc:"Hot furnace gas passes through the tube bundle and preheats the combustion air from CF-1. Gas leaves at about 495 °C for dilution; combustion air returns to the furnace at about 150 °C.",spec:[["Gas in / out","570 °C / 495 °C"],["Air in / out","30 °C / 150 °C"]],s:["comb","gas"],type:"Tubular, gas-to-air"},
  CF:{tag:"CF-1",name:"Combustion blower",desc:"Forced-draft fan that pushes ambient air through the air heater and on to the grate underside and the pneumatic spreader.",spec:[["Air in","Ambient, 30 °C"],["Delivers to","Under-grate air and pneumatic spreader"]],s:["comb"],type:"Forced draft fan"},
  DMP:{tag:"Dilution damper",name:"مخمّد التحكم في هواء التخفيف",desc:"Admits atmospheric air into the hot gas riser to bring it down to drying temperature. An electric actuator positions the damper from the hot-air temperature controller.",spec:[["Air","Atmospheric, 30 °C"],["Inlet","Atmospheric air pipe"],["Actuation","Electric"]],s:["dil","ctrl"],type:"Electric actuator"},
  DL:{tag:"DL-01",name:"مروحة التخفيف",desc:"Draws the mixed hot air through the hot air duct and delivers it to the air distributor (AD-1) on the spray chamber roof. VFD-controlled.",spec:[["Hot air","~250 °C"],["Delivers to","AD-1 on CH-1"],["Drive","VFD"]],s:["gas","ctrl"],type:"VFD"},
  CTRL:{tag:"TIC-01 · TIC-02 · PIC-01",name:"HAG controls",desc:"Furnace temperature (TIC-01) sets the bagasse carrier speed. Hot-air temperature to the dryer (TIC-02) positions the dilution damper and sets DL-01 speed. PIC-01 watches furnace draft.",spec:[["TIC-01","Furnace temp. → BC-1 VFD"],["TIC-02","Hot air temp. → damper, DL-01 VFD"],["PIC-01","Furnace draft"]],s:["ctrl"],type:"PLC loops"}
};
const HORDER=["BC","HAG","HP","CF","AH","DMP","DL","CTRL"];
const HWALK=[
  {ids:["BC","HAG"],s:["fuel"],t:"BC-1 meters yard dry bagasse to the pneumatic spreader, which throws it onto the pulsating grate."},
  {ids:["CF","AH","HAG"],s:["comb"],t:"CF-1 pushes ambient air through the air heater. It reaches the grate and spreader preheated to about 150 °C."},
  {ids:["HAG","HP"],s:["fuel","comb"],t:"Bagasse burns at about 850 °C. Over-fire air completes burnout and the hydraulic drive pulses the grate to move ash."},
  {ids:["HAG","AH"],s:["gas"],t:"Hot gas leaves the furnace at about 570 °C and gives up heat to the combustion air in AH-01, leaving at about 495 °C."},
  {ids:["DMP","AH"],s:["gas","dil"],t:"Atmospheric air enters through the control damper and dilutes the gas toward drying temperature."},
  {ids:["DL","CTRL","DMP","BC"],s:["gas","ctrl"],t:"DL-01 delivers hot air at about 250 °C through the hot air duct to the dryer. TIC-02 holds that temperature; TIC-01 holds the furnace."}
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
  fb.addEventListener('click',()=>{const on=svg.classList.toggle('flowing');fb.textContent=on?'Pause flow':'Animate flow';fb.setAttribute('aria-pressed',on)});
  const ob=R('origbtn'),op=R('origpane');
  if(ob&&op){
    ob.addEventListener('click',()=>{const o=op.hidden;op.hidden=!o;svg.style.display=o?'none':'';ob.textContent=o?'Interactive diagram':'Original drawing';ob.setAttribute('aria-pressed',o)});
    const im=op.querySelector('img');im.addEventListener('click',()=>im.classList.toggle('zoom'));
  }
  const wb=R('walk'),wp=R('prev'),wn=R('next'),wc=R('ctr');
  function walk(i){
    walkI=i;const st=WALK[i];
    chips.forEach(c=>c.setAttribute('aria-pressed',st.s.includes(c.dataset.stream)?'true':'false'));
    highlight(st.s,st.ids);show(st.ids[0]);
    R('desc').textContent=st.t;R('tag').textContent='Step '+(i+1)+' of '+WALK.length;
    wb.textContent='Exit walkthrough';wp.hidden=false;wn.hidden=false;wp.disabled=i===0;wn.disabled=i===WALK.length-1;wc.textContent=(i+1)+' / '+WALK.length;
  }
  function endWalk(){if(walkI<0)return;walkI=-1;wb.textContent='Walk through process';wp.hidden=true;wn.hidden=true;wc.textContent=''}
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
  RAW:{tag:"Input",name:"الفيناس الخام",desc:"Spent wash from the distillation column: acidic, high in COD, and rich in potassium, sulphates and chlorides. Every ZLD scheme starts here.",spec:[["Total solids","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"See vinasse properties"},
  CSTR:{tag:"Route 1 · Biogas · step 1",name:"MEGA-CSTR biodigester",desc:"Raw vinasse is digested anaerobically in a continuous stirred tank reactor. COD falls by about 65% and the organics become methane-rich biogas.",spec:[["COD / BOD reduction","65 ± 3% / 85 ± 3%"],["Biogas yield","0.52 m³ per kg COD removed"],["الإنتاج","Biogas + BMSW"]],link:"#biogas",lt:"Go to MEGA-CSTR"},
  GAS:{tag:"Route 1 · Biogas · energy",name:"استخدام الغاز الحيوي",desc:"Biogas can be burned in the hot air generator for the spray dryer, in a gas engine to produce electricity, or in the distillery boiler.",spec:[["Methane","55–60%"],["القيمة الحرارية","4,200–4,500 كيلو كالوري/نيوتن م³"],["Uses","HAG · gas engine · boiler · CBG"]],link:"#biogas",lt:"Go to MEGA-CSTR"},
  MEE:{tag:"Route 1 · Biogas · step 2",name:"Degasser + multiple effect evaporation",desc:"Bio-methanated spent wash (BMSW) is degassed under vacuum, then concentrated in MEGA's multiple effect evaporators without foaming or antifoam.",spec:[["التغذية","BMSW, pH 7.5–8.5"],["Models","MEGA-BMSW30 · 30i · 40"],["الإنتاج","30–35 Brix concentrate"]],link:"#bmsw",lt:"Go to BMSW evaporation"},
  STRIP:{tag:"Route 1 · Biogas · water",name:"Condensate stripper + CPU",desc:"MEGA's fractional stripping column removes ammoniacal nitrogen and VFAs from the process condensate. The condensate polishing unit then makes it fit to recycle.",spec:[["Raw condensate","pH 8.0–9.2, COD ≤ 4,000 ppm"],["الإنتاج","Water recycled to process"]],link:"#bmsw",lt:"Go to BMSW evaporation"},
  ATFD:{tag:"Route 1 · Biogas · option A",name:"ATFD → condensed molasses soluble",desc:"An agitated thin film dryer takes the BMSW concentrate up to about 80 Brix. The product, condensed molasses soluble (CMS), is used as a cattle-feed additive.",spec:[["المنتج","CMS, up to ~80 Brix"],["Use","Cattle-feed additive"]],link:null},
  SD:{tag:"Route 1 · Biogas · option B",name:"Evaporation + spray dryer",desc:"A finishing evaporator and the spray dryer take the concentrate to a free-flowing, potash-rich powder. The hot air generator can fire on bagasse or on biogas from the digester.",spec:[["المنتج","مسحوق 95% وزناً"],["Moisture","5–7% w/w"],["Product temp.","~30 °C"]],link:"#process",lt:"Go to the spray dryer"},
  EVAP:{tag:"Route 2 · Incineration · step 1",name:"Raw vinasse evaporation",desc:"Multiple effect evaporators concentrate raw vinasse to 55–60 Brix so it can be fired as boiler fuel.",spec:[["الهدف","55–60 Brix"]],link:"#incineration",lt:"Go to incineration route"},
  BOIL:{tag:"Route 2 · Incineration · step 2",name:"غلاية الحرق",desc:"The 55–60 Brix concentrate is burned in the incineration boiler to raise steam, so no liquid leaves the plant.",spec:[["الوقود","Vinasse concentrate, 55–60 Brix"],["Watch-outs","High capital and maintenance cost"]],link:"#incineration",lt:"Go to incineration route"},
  STEAM:{tag:"Route 2 · Incineration · output",name:"البخار",desc:"Steam from the incineration boiler serves the distillery and the evaporation plant.",spec:[["Use","Distillery and evaporator steam"]],link:"#incineration",lt:"Go to incineration route"},
  CPU:{tag:"Route 2 · Incineration · water",name:"Condensate polishing unit",desc:"Process condensate from raw vinasse evaporation carries volatile organics. The CPU polishes it so the water is recycled to the process instead of discharged.",spec:[["التغذية","Evaporator process condensate"],["الإنتاج","Water recycled to process"]],link:"#incineration",lt:"Go to incineration route"}
};
const INC={
  RAW:{tag:"التغذية",name:"الفيناس الخام",desc:"Spent wash straight from the distillation column, without biogas treatment.",spec:[["Total solids","11–15% w/w"],["pH","3.5–4.5"],["COD","80,000–120,000 mg/L"]],link:"#vinasse",lt:"See vinasse properties"},
  MEE:{tag:"التبخير",name:"Raw vinasse multiple effect evaporator",desc:"Concentrates raw vinasse to 55–60 Brix. Each effect is heated by vapour from the one before, for high steam economy, and every evaporator has CIP provision.",spec:[["الهدف","55–60 Brix"],["التسخين","البخار"],["Outputs","Concentrate + process condensate"]],link:null},
  CONC:{tag:"المركّز",name:"Concentrate to boiler",desc:"The 55–60 Brix concentrate is held and fed to the incineration boiler as fuel.",spec:[["Concentration","55–60 Brix"]],link:null},
  BOIL:{tag:"الطاقة",name:"غلاية الحرق",desc:"Burns the vinasse concentrate to raise steam, so no liquid effluent leaves the distillery.",spec:[["الوقود","Vinasse concentrate"],["Watch-outs","High capital and maintenance cost"]],link:null},
  STEAM:{tag:"الإنتاج",name:"البخار",desc:"Steam serves the distillery and heats the evaporation plant.",spec:[["Users","Distillery · evaporator"]],link:null},
  CPU:{tag:"الماء",name:"Condensate polishing unit (CPU)",desc:"Process condensate from raw vinasse evaporation carries volatile organics and cannot be discharged as it is. The CPU polishes it so it can be reused in the plant. MEGA supplies the CPU together with the evaporation plant.",spec:[["التغذية","Evaporator process condensate"],["الإنتاج","Water fit to recycle to process"]],link:null},
  REUSE:{tag:"الإنتاج",name:"المياه المعالجة",desc:"Polished condensate returns to the process, cutting fresh water demand and closing the water loop.",spec:[["Use","Process water recycle"]],link:null}
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
    {x:196,y:640,t:"Feed tank",d:"Buffer tank for raw vinasse, with pH adjustment. Vinasse can be cooled in a heat exchanger first to suit mesophilic digestion.",s:[["Battery limit","Raw vinasse at buffer tank inlet"]]},
    {x:65,y:770,t:"Feed pump",d:"Centrifugal pumps feed vinasse into the central feed shaft of the digester at a controlled rate.",s:[["Type","Centrifugal"]]},
    {x:875,y:520,t:"هاضم MEGA-CSTR",d:"Feed and recirculated sludge enter through the central drum. A top central agitator drives flow downward and three lateral agitators mix radially. Treated liquid leaves over a water-sealed overflow weir.",s:[["Regime","ميزوفيلي 36–40 °م أو ثيرموفيلي 50–55 °م"],["pH المفاعل","7.0–7.5"],["Typical diameter","35–36 m; more digesters above 700–750 m³/day"]]},
    {x:580,y:470,t:"Degasser",d:"Strips dissolved gas from the reactor effluent so the biomass settles well in the clarifier.",s:[]},
    {x:395,y:500,t:"Lamella clarifier",d:"Inclined plates separate the biomass. Active sludge settles and is recirculated; excess sludge is purged for dewatering or composting.",s:[["الإنشاء","MS with anti-corrosive epoxy lining"]]},
    {x:560,y:770,t:"Sludge pump",d:"Returns active biomass from the clarifier to the digester and purges excess sludge.",s:[]},
    {x:270,y:770,t:"BMSW transfer pump",d:"Sends the clarified bio-methanated vinasse on to the degasser and evaporation plant.",s:[["Battery limit","Clarified effluent discharge"]]},
    {x:1233,y:575,t:"Gas holder",d:"Floating-type gas holder in carbon steel stores biogas at low pressure and variable volume.",s:[]},
    {x:1335,y:745,t:"Biogas blower",d:"Boosts biogas to the boiler, hot air generator or purification.",s:[["Battery limit","Blower discharge flange"]]},
    {x:1215,y:300,t:"Flare stack",d:"Burns excess or off-spec biogas safely, with auto ignition and safety interlocks.",s:[]},
    {x:1328,y:170,t:"Biogas analyser & flowmeter",d:"Measures biogas quality and flow on the line to the users.",s:[["Methane","55–60%"],["H₂S","2.5–3.5%"]]}
  ]},
  bmsw:{w:1400,h:989,pts:[
    {x:240,y:420,t:"High heater",d:"Preheats the incoming BMSW feed before it enters the degasser.",s:[]},
    {x:147,y:335,t:"Vacuum degasser",d:"Under vacuum, CO₂, H₂S and ammonia come out of solution. Mechanical foam breakers stop carryover. No steam sparging and no antifoam.",s:[["Features","Vacuum chamber · foam breakers · optimised distribution"]]},
    {x:515,y:380,t:"FFE-1, first effect",d:"Falling film evaporator heated with low-pressure steam (or alcohol vapours on the BMSW30i model).",s:[["التسخين","بخار منخفض الضغط"]]},
    {x:950,y:380,t:"FFE-2 to FFE-5",d:"Each effect is heated by vapour from the one before, multiplying the steam economy. A standby calandria allows cleaning without stopping the plant.",s:[["Configuration","Falling film, ± forced circulation finisher"]]},
    {x:870,y:470,t:"Vapour–liquid separators",d:"VLS-1 to VLS-5 separate vapour from the concentrating liquor after each effect.",s:[]},
    {x:1240,y:370,t:"مكثّف سطحي",d:"Condenses vapour from the last effect, with a vacuum pump holding the plant under vacuum.",s:[["Cooling","Cooling water supply / return"]]},
    {x:690,y:745,t:"Concentrated spent wash",d:"Concentrate leaves the last effect for the ATFD (CMS) or the spray dryer (powder).",s:[["Concentration","30–35 Brix"]]},
    {x:1270,y:785,t:"Process condensate tank",d:"Collects process condensate and feeds it to the stripper column.",s:[["Raw quality","pH 8.0–9.2, COD ≤ 4,000 ppm, TDS ≤ 1,500 ppm"]]},
    {x:375,y:540,t:"Stripper column",d:"MEGA's fractional stripping column, heat-integrated with the evaporator, removes ammoniacal nitrogen, VFAs and dissolved gases from the condensate.",s:[["Result","Lower load on the CPU"]]},
    {x:460,y:765,t:"Steam condensate tank",d:"Collects clean steam condensate for return.",s:[]}
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
