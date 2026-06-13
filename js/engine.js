// js/engine.js — compatibility shims + v2 rendering engine
// Called as: Store.ready(initApp) from index.html

function initApp() {
"use strict";

// ── LAYERS + NAMES (engine config, hardcoded) ────────────────────────────
var LAYERS={
  choke:{nm:"Maritime chokepoints",c:"#f0a83f"},
  chip:{nm:"Semiconductors",c:"#54cfe0"},
  min:{nm:"Critical minerals",c:"#7fd394"},
  nrg:{nm:"Energy",c:"#ff7152"},
  data:{nm:"Data & cables",c:"#b3a0f2"},
  fin:{nm:"Finance rails",c:"#d8c186"}
};
var NAMES={CHN:"China",JPN:"Japan",KOR:"South Korea",TWN:"Taiwan",DEU:"Germany",ITA:"Italy",ESP:"Spain",PRT:"Portugal",GRC:"Greece",POL:"Poland",ROU:"Romania",HUN:"Hungary",CZE:"Czechia",RUS:"Russia",UKR:"Ukraine",BLR:"Belarus",THA:"Thailand",VNM:"Vietnam",CUB:"Cuba",IND:"India",IDN:"Indonesia",PAK:"Pakistan",BGD:"Bangladesh",PHL:"Philippines",MMR:"Myanmar",NPL:"Nepal",LKA:"Sri Lanka",KAZ:"Kazakhstan",UZB:"Uzbekistan",IRN:"Iran",IRQ:"Iraq",SAU:"Saudi Arabia",ARE:"UAE",TUR:"Türkiye",EGY:"Egypt",DZA:"Algeria",MAR:"Morocco",NGA:"Nigeria",ETH:"Ethiopia",COD:"DR Congo",TZA:"Tanzania",KEN:"Kenya",UGA:"Uganda",AGO:"Angola",MOZ:"Mozambique",SDN:"Sudan",NER:"Niger",MLI:"Mali",TCD:"Chad",GHA:"Ghana",CIV:"Côte d'Ivoire",CMR:"Cameroon",ZAF:"South Africa",USA:"United States",CAN:"Canada",MEX:"Mexico",GTM:"Guatemala",COL:"Colombia",VEN:"Venezuela",PER:"Peru",BRA:"Brazil",ARG:"Argentina",CHL:"Chile",GBR:"United Kingdom",FRA:"France",NLD:"Netherlands",BEL:"Belgium",SWE:"Sweden",NOR:"Norway",FIN:"Finland",DNK:"Denmark",CHE:"Switzerland",AUT:"Austria",IRL:"Ireland",AUS:"Australia",NZL:"New Zealand",ISR:"Israel",JOR:"Jordan",YEM:"Yemen",AFG:"Afghanistan",SYR:"Syria",KHM:"Cambodia",MYS:"Malaysia",SGP:"Singapore",MNG:"Mongolia",PRK:"North Korea"};

// ── COMPATIBILITY SHIMS (v3 JSON → v2 globals) ───────────────────────────

// Atlas node tiers (derived from v2 source data)
var TIER1=new Set(["hormuz","malacca","suez","taiwanstrait","asml","zeiss","tsmc","skhynix","tokyomat","nvda","bayanobo","kolwezi","morowali","catl","beijingec","ghawar","permian","raslaffan","crane","palisades","gevernova","ashburn","pjm","egyptcorridor","nyc","london"]);
var TIER3=new Set(["danish","cape","nsr","imec","arm","rapidus","centrus","hkcnh"]);

var ATLAS_NODES=(Store.raw.atlas.nodes||[]).map(function(n){
  var id=n.id.replace(/^atlas\./,"");
  return{id:id,nm:n.title,ly:n.type,t:TIER1.has(id)?1:TIER3.has(id)?3:2,
    lat:n.lat,lon:n.lon,wt:n.weight||"",wy:n.why_hard||"",ct:n.control||"",
    ld:n.lead||"",cs:n.consequence||"",sg:n.signal_desc||"",ao:n.analyst_note||"",
    cf:n.cf||"md",vintage:n.as_of?n.as_of.slice(0,7):"",
    review_after_months:n.review_after_months};
});

var ARCS=(Store.raw.atlas.arcs||[]).map(function(a){
  return[a.from.replace(/^atlas\./,""),a.to.replace(/^atlas\./,""),a.layer];
});

var TREE=(Store.raw.tree.nodes||[]).map(function(n){
  var id=n.id.replace(/^tree\./,"");
  var lks=n.links||[];
  return{id:id,lb:n.title,dt:n.date_label||"",era:n.era,row:n.row,
    mech:n.mechanism||"",d:n.body||"",fg:n.badge||"",live:n.live||false,
    requires:lks.filter(function(l){return l.rel==="requires";}).map(function(l){return l.to.replace(/^tree\./,"");}),
    xref:{
      atlas:lks.filter(function(l){return l.to.startsWith("atlas.");}).map(function(l){return l.to.replace(/^atlas\./,"");}),
      humans:lks.filter(function(l){return l.to.startsWith("human.");}).map(function(l){return l.to.replace(/^human\./,"");}),
      trends:lks.filter(function(l){return l.to.startsWith("window.");}).map(function(l){return l.to.replace(/^window\./,"");})
    },
    cf:n.cf||"md",vintage:n.as_of?n.as_of.slice(0,7):"",review_after_months:n.review_after_months};
});

var TREE_ERAS=Store.raw.tree.eras||[];

var TREE_CHILDREN={};
TREE.forEach(function(n){
  (n.requires||[]).forEach(function(pid){
    if(!TREE_CHILDREN[pid])TREE_CHILDREN[pid]=[];
    TREE_CHILDREN[pid].push(n.id);
  });
});

var HUMANS=(Store.raw.humans.people||[]).map(function(n){
  var id=n.id.replace(/^human\./,"");
  var lks=n.links||[];
  return{id:id,name:n.title,tier:n.tier,domain:n.domain,
    bets:n.bets||[],chain:n.chain||[],current_state:n.current_state,
    future_paths:n.future_paths||[],dead_bodies:n.dead_bodies||[],lessons:n.lessons||[],
    xref:{
      tree:lks.filter(function(l){return l.to.startsWith("tree.");}).map(function(l){return l.to.replace(/^tree\./,"");}),
      atlas:lks.filter(function(l){return l.to.startsWith("atlas.");}).map(function(l){return l.to.replace(/^atlas\./,"");}),
      trends:lks.filter(function(l){return l.to.startsWith("window.");}).map(function(l){return l.to.replace(/^window\./,"");})
    },
    cf:n.cf||"md",vintage:n.as_of?n.as_of.slice(0,7):"",review_after_months:n.review_after_months};
});

var TRENDS=(Store.raw.windows.windows||[]).map(function(n){
  var id=n.id.replace(/^window\./,"");
  var lks=n.links||[];
  return{id:id,name:n.title,class:n.class||"",status:n.status,
    opened:n.opened,expected_close:n.expected_close,mechanism:n.mechanism||"",
    effects:n.effects||[],decay_logic:n.decay_logic||"",
    entry_checklist:(n.entry_checklist||[]).map(function(e){return typeof e==="string"?e:(e.text||"");}),
    who_won:(n.who_won||[]).map(function(id){return id.replace(/^human\./,"");}),
    open_signal:n.open_signal||"",future_paths:n.future_paths||[],
    xref:{
      tree:lks.filter(function(l){return l.to.startsWith("tree.");}).map(function(l){return l.to.replace(/^tree\./,"");}),
      atlas:lks.filter(function(l){return l.to.startsWith("atlas.");}).map(function(l){return l.to.replace(/^atlas\./,"");})
    },
    cf:n.cf||"md",vintage:n.as_of?n.as_of.slice(0,7):"",review_after_months:n.review_after_months};
});

var CONSTRAINTS=(Store.raw.constraints.rows||[]).map(function(c){
  return[c.title,c.lead_time,c.cost,c.bottleneck,c.signal];
});

var SCENARIOS=(Store.raw.scenarios.scenarios||[]).map(function(s){
  return{id:s.id.replace(/^scenario\./,""),nm:s.title,d:s.body||"",
    ly:s.layers||[],
    trace:(s.trace||[]).map(function(id){return id.replace(/^atlas\./,"");})};
});

var DEMO=Store.raw.constraints.demography||{};

var method=Store.raw.method||{};
var HIER=(method.hierarchy||[]).map(function(h){return[h.label,h.body,h.level];});
var RULES=method.rules||[];
var BIASCHK=method.biases||[];
var SOURCES=(method.sources||[]).map(function(s){return[s.label,s.note,s.url];});

var meta=Store.raw.meta||{};
var MANIFEST={
  version:meta.version||"3.0.0",
  data_vintage:(meta.last_updated||"").slice(0,7),
  counts:meta.counts||{}
};

// ── ENGINE ───────────────────────────────────────────────────────────────
(function(){

var $=function(id){return document.getElementById(id)};
var motionOK=!window.matchMedia("(prefers-reduced-motion:reduce)").matches;
var NOW_MS=Date.now();
var NOW_YM=(function(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")})();

function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function confPill(cf){var t=cf==="hi"?"HIGH":cf==="md"?"MED":"LOW";return'<span class="conf '+cf+'">'+t+"</span>"}
function vintageAge(v){if(!v)return 999;var p=v.split("-"),yr=+p[0],mo=+p[1];var nd=new Date();return(nd.getFullYear()-yr)*12+(nd.getMonth()+1-mo)}
function isStale(node){var ram=node.review_after_months||(node.cf==="hi"?6:3);return vintageAge(node.vintage)>ram}

// Storage — localStorage, sv3 keys
var storage={
  getItem:function(k){try{return localStorage.getItem(k)}catch(e){return null}},
  setItem:function(k,v){try{localStorage.setItem(k,v)}catch(e){}},
  removeItem:function(k){try{localStorage.removeItem(k)}catch(e){}}
};

// Build lookup maps
var NMAP={};ATLAS_NODES.forEach(function(n){NMAP[n.id]=n});
var TREE_MAP={};TREE.forEach(function(n){TREE_MAP[n.id]=n});
var HUMAN_MAP={};HUMANS.forEach(function(h){HUMAN_MAP[h.id]=h});
var TREND_MAP={};TRENDS.forEach(function(t){TREND_MAP[t.id]=t});
var LCOLOR=function(ly){return LAYERS[ly]?LAYERS[ly].c:"#f0f0f0"};

// ── ID bridge (v2 unprefixed ↔ v3 Store prefixed) ──────────────────────
var REG_TO_PREFIX={atlas:"atlas.",tree:"tree.",human:"human.",trend:"window."};
function toStoreId(reg,id){return(REG_TO_PREFIX[reg]||reg+".")+id}
function fromStoreId(sid){
  var m=sid.match(/^(atlas|tree|human|window)\.(.+)$/);
  if(!m)return null;
  var rm={atlas:"atlas",tree:"tree",human:"human",window:"trend"};
  return{reg:rm[m[1]],id:m[2]};
}

$("vintage").textContent="data vintage · "+MANIFEST.data_vintage+" · v"+MANIFEST.version;

// Dossier history
var dossierHistory=[];
var dossierCurrent=null;

function openDossier(reg,id,pushHistory){
  if(pushHistory!==false&&dossierCurrent){dossierHistory.push(dossierCurrent);$("d-back").classList.add("show")}
  dossierCurrent={reg:reg,id:id};
  var d=$("dossier");d.classList.add("open");
  if(reg==="atlas")renderAtlasDossier(NMAP[id]);
  else if(reg==="tree")renderTreeDossier(TREE_MAP[id]);
  else if(reg==="human"){renderHumanDossier(HUMAN_MAP[id]);renderAnatomy(HUMAN_MAP[id])}
  else if(reg==="trend")renderTrendDossier(TREND_MAP[id]);
  else if(reg==="country")renderCountryDossier(id);
  if(reg!=="country")try{history.replaceState(null,"","#"+reg+":"+id)}catch(e){}
}

var ANATOMY_KEYS=[["stake","Stake totality"],["asymmetry","Asymmetry"],["consensus","Consensus delta"],["timing","Timing enabler"],["control","Control retention"],["survival","Survival mechanism"]];
var ANATOMY_DEFAULT=null;
function anatomyHTML(h){
  var scored=(h.bets||[]).filter(function(b){return b.anatomy});
  if(!scored.length)return'<div class="an-note">No scored bets for this record yet</div>';
  var html="";
  scored.forEach(function(b){
    var a=b.anatomy,comp=0;
    html+='<div class="an-bet-hd">'+b.yr+" · "+esc((b.thesis||"").slice(0,72))+"…</div>";
    ANATOMY_KEYS.forEach(function(k){
      var v=a[k[0]]||0;comp+=v;
      html+='<div class="an-row"><div class="an-k">'+k[1]+'</div><div class="an-track"><div class="an-fill" style="width:'+(v/5*100)+'%"></div></div><div class="an-v">'+v+"</div></div>";
    });
    html+='<div class="an-comp">Composite <b>'+comp+"/30</b></div>";
  });
  html+='<div class="an-ref">Reference: Musk 2002 (SpaceX+Tesla) = 28/30 — the maximal case. Scores are editorial judgments, not measurements.</div>';
  return html;
}
function renderAnatomy(h){
  var rail=$("bet-anatomy");if(!rail)return;
  if(ANATOMY_DEFAULT===null)ANATOMY_DEFAULT=rail.innerHTML;
  if(!h){rail.innerHTML=ANATOMY_DEFAULT;return}
  rail.innerHTML="<h4>Bet Anatomy — "+esc(h.name)+"</h4>"+anatomyHTML(h)+'<div class="an-note">stake × asymmetry × consensus × timing × control × survival</div>';
  var dbody=$("dbody");
  if(dbody&&!dbody.querySelector(".an-dossier")){
    var div=document.createElement("div");div.className="dsec an-dossier";
    div.innerHTML='<div class="k">BET ANATOMY (0–5 PER FACTOR)</div>'+anatomyHTML(h);
    dbody.appendChild(div);
  }
}
function closeDossier(){
  $("dossier").classList.remove("open");dossierCurrent=null;dossierHistory=[];$("d-back").classList.remove("show");
  if(treeSel){treeSel=null;applyTreeLighting()}
  sel=null;render();renderAnatomy(null);
  try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
}
$("dclose").onclick=closeDossier;
$("d-back").onclick=function(){
  if(dossierHistory.length){var prev=dossierHistory.pop();dossierCurrent=null;openDossier(prev.reg,prev.id,false);if(!dossierHistory.length)$("d-back").classList.remove("show")}
};
function setDHead(reg,color,name,meta){$("d-reg").textContent=reg;$("d-reg").style.color=color;$("d-nm").textContent=name;$("d-meta").innerHTML=meta}
function makeDSec(k,v){return'<div class="dsec"><div class="k">'+k+'</div><div class="v">'+v+"</div></div>"}
function chipList(items,reg,label){
  if(!items||!items.length)return"";
  var chips=items.map(function(id){
    var nm=id;
    if(reg==="atlas"&&NMAP[id])nm=NMAP[id].nm;
    else if(reg==="tree"&&TREE_MAP[id])nm=TREE_MAP[id].lb;
    else if(reg==="human"&&HUMAN_MAP[id])nm=HUMAN_MAP[id].name;
    else if(reg==="trend"&&TREND_MAP[id])nm=TREND_MAP[id].name;
    return'<span class="xchip" data-reg="'+reg+'" data-id="'+id+'" title="Open: '+esc(nm)+'">'+esc(nm)+"</span>";
  }).join("");
  return'<div class="dsec"><div class="k">'+label+'</div><div class="chip-list">'+chips+"</div></div>";
}

function renderAtlasDossier(n){
  if(!n)return;
  setDHead(LAYERS[n.ly]?LAYERS[n.ly].nm:"Atlas",LCOLOR(n.ly),n.nm,"TIER "+n.t+" · "+Math.abs(n.lat).toFixed(1)+"°"+(n.lat>=0?"N":"S")+" "+Math.abs(n.lon).toFixed(1)+"°"+(n.lon>=0?"E":"W")+" &nbsp;"+confPill(n.cf));
  var b="";
  [["WHAT",n.wt],["WHY IT BINDS",n.wy],["WHO CONTROLS",n.ct],["LEAD TIME TO REPLACE",n.ld],["CASCADE IF DISRUPTED",n.cs],["WATCH",n.sg],["OPERATOR NOTE",n.ao]].forEach(function(s){if(s[1]&&s[1]!=="—")b+=makeDSec(s[0],esc(s[1]))});
  var treeLinks=(TREE||[]).filter(function(t){return(t.xref&&t.xref.atlas||[]).includes(n.id)}).map(function(t){return t.id});
  if(treeLinks.length)b+=chipList(treeLinks,"tree","IN TECH TREE");
  if(n.vintage)b+=makeDSec("VINTAGE",n.vintage+(isStale(n)?' <span class="stale-badge" style="font-size:8px;color:var(--enr);letter-spacing:.1em">STALE</span>':""));
  var _sid="atlas."+n.id;$("dbody").innerHTML=staleBannerHTML(_sid)+b+renderConnections(_sid);attachChipNavigation();
}
function renderTreeDossier(n){
  if(!n)return;
  var col=n.fg==="flag"?"var(--alert)":n.fg==="contingent"?"var(--choke)":n.fg==="convergent"?"var(--chip)":"var(--txt)";
  setDHead("TECH TREE — ERA "+n.era,col,n.lb,n.dt+" &nbsp;"+confPill(n.cf)+(n.live?' <span class="conf md">LIVE</span>':""));
  var b=makeDSec("MECHANISM",esc(n.mech));b+=makeDSec("DETAIL",esc(n.d));
  if(n.requires&&n.requires.length)b+=chipList(n.requires,"tree","REQUIRES");
  var children=(TREE_CHILDREN[n.id]||[]);if(children.length)b+=chipList(children,"tree","UNLOCKS");
  if(n.xref){
    if(n.xref.atlas&&n.xref.atlas.length)b+=chipList(n.xref.atlas,"atlas","ENABLES (ATLAS)");
    if(n.xref.humans&&n.xref.humans.length)b+=chipList(n.xref.humans,"human","CAPITALIZED BY");
    if(n.xref.trends&&n.xref.trends.length)b+=chipList(n.xref.trends,"trend","TIMES (TRENDS)");
  }
  if(n.fg==="flag")b+=makeDSec("⚑ FLAG","This node carries a structural red-flag signal — elevated scrutiny warranted.");
  if(n.vintage)b+=makeDSec("VINTAGE",n.vintage+(isStale(n)?' <span style="font-size:8px;color:var(--enr)">STALE</span>':""));
  var _sid="tree."+n.id;$("dbody").innerHTML=staleBannerHTML(_sid)+b+renderConnections(_sid);attachChipNavigation();
}
function renderHumanDossier(h){
  if(!h)return;
  var tierColor={C:"var(--choke)",P:"var(--chip)",W:"var(--min)",M:"var(--net)"}[h.tier]||"var(--txt)";
  setDHead("BET ATLAS — TIER "+h.tier,tierColor,h.name,h.domain+" &nbsp;"+confPill(h.cf));
  var b="";
  if(h.chain&&h.chain.length){
    b+='<div class="dsec"><div class="k">CAUSE → EFFECT CHAIN</div><div class="chain-list">';
    h.chain.forEach(function(step,i){b+='<div class="chain-item"><div class="chain-num">'+(i+1)+'</div><div class="chain-text">'+esc(step)+"</div></div>"});
    b+="</div></div>";
  }
  if(h.current_state){var facts=h.current_state.facts||[];b+=makeDSec("CURRENT STATE ("+h.current_state.vintage+")",facts.map(function(f){return"• "+esc(f)}).join("<br>"))}
  if(h.future_paths&&h.future_paths.length){
    b+='<div class="dsec"><div class="k">FUTURE PATHS</div>';
    h.future_paths.forEach(function(fp){
      var pct=Math.round(fp.p*100);
      b+='<div class="prob-bar-wrap"><div class="prob-bar-label">'+esc(fp.path)+' <b style="color:var(--choke)">p='+pct+'%</b> by '+esc(fp.horizon)+'</div>';
      b+='<div class="prob-bar"><div class="prob-bar-fill" style="width:'+pct+'%"></div></div>';
      b+='<div class="prob-falsifier">Falsifier: '+esc(fp.falsifier)+"</div></div>";
    });
    b+="</div>";
  }
  if(h.dead_bodies&&h.dead_bodies.length){
    b+='<div class="dead-strip"><div class="dh">Dead bodies — same bet, different outcome</div>';
    h.dead_bodies.forEach(function(db){b+='<div class="dead-row"><b>'+esc(db.name)+"</b> — "+esc(db.why)+"</div>"});
    b+="</div>";
  }
  if(h.bets&&h.bets.length){
    b+='<div class="dsec"><div class="k">BETS</div>';
    h.bets.forEach(function(bet){
      b+='<div style="border:1px solid var(--line);padding:8px 10px;margin-bottom:6px;font-size:11px">';
      b+='<div style="color:var(--choke);font-size:10px;margin-bottom:4px">'+bet.yr+'</div>';
      b+='<div style="margin-bottom:3px;color:var(--dim);font-size:10px"><b style="color:var(--txt)">Thesis:</b> '+esc(bet.thesis||"")+'</div>';
      b+='<div style="margin-bottom:3px;color:var(--dim);font-size:10px"><b style="color:var(--txt)">Consensus delta:</b> '+esc(bet.consensus_delta||"")+'</div>';
      b+='<div style="margin-bottom:3px;color:var(--dim);font-size:10px"><b style="color:var(--txt)">Enabler:</b> '+esc(bet.enabler||"")+'</div>';
      b+='<div style="color:var(--min);font-size:10px"><b style="color:var(--txt)">Outcome:</b> '+esc(bet.outcome||"")+'</div></div>';
    });
    b+="</div>";
  }
  if(h.lessons&&h.lessons.length)b+=makeDSec("LESSONS",h.lessons.map(function(l){return"• "+esc(l)}).join("<br>"));
  if(h.xref){
    if(h.xref.tree&&h.xref.tree.length)b+=chipList(h.xref.tree,"tree","TREE NODES");
    if(h.xref.trends&&h.xref.trends.length)b+=chipList(h.xref.trends,"trend","TREND WINDOWS");
  }
  var _sid="human."+h.id;$("dbody").innerHTML=staleBannerHTML(_sid)+b+renderConnections(_sid);attachChipNavigation();
}
function renderTrendDossier(t){
  if(!t)return;
  var statusColor={closed:"var(--faint)",closing:"var(--enr)",open:"var(--min)",forming:"var(--dim)"}[t.status]||"var(--txt)";
  setDHead("TREND WINDOW — "+t.status.toUpperCase(),statusColor,t.name,t.class.toUpperCase().replace(/-/g," ")+" &nbsp;"+confPill(t.cf));
  var b=makeDSec("MECHANISM",esc(t.mechanism));
  if(t.effects&&t.effects.length)b+=makeDSec("EFFECTS",t.effects.map(function(e){return"• "+esc(e)}).join("<br>"));
  b+=makeDSec("DECAY LOGIC",esc(t.decay_logic));
  if(t.entry_checklist&&t.entry_checklist.length)b+=makeDSec("ENTRY CHECKLIST",t.entry_checklist.map(function(e){return"☐ "+esc(e)}).join("<br>"));
  if(t.open_signal)b+=makeDSec("LIVE OPEN SIGNAL",esc(t.open_signal));
  if(t.future_paths&&t.future_paths.length){
    b+='<div class="dsec"><div class="k">FUTURE PATHS</div>';
    t.future_paths.forEach(function(fp){
      var pct=Math.round(fp.p*100);
      b+='<div class="prob-bar-wrap"><div class="prob-bar-label">'+esc(fp.path)+' <b style="color:var(--choke)">p='+pct+'%</b> by '+esc(fp.horizon)+'</div>';
      b+='<div class="prob-bar"><div class="prob-bar-fill '+(t.status==="closing"?"closing":"")+'\" style="width:'+pct+'%"></div></div>';
      b+='<div class="prob-falsifier">Falsifier: '+esc(fp.falsifier)+"</div></div>";
    });
    b+="</div>";
  }
  if(t.who_won&&t.who_won.length)b+=chipList(t.who_won,"human","WINNERS");
  if(t.xref){
    if(t.xref.tree&&t.xref.tree.length)b+=chipList(t.xref.tree,"tree","TREE NODES (ENABLERS)");
    if(t.xref.atlas&&t.xref.atlas.length)b+=chipList(t.xref.atlas,"atlas","ATLAS NODES (CONSTRAINTS)");
  }
  var _sid="window."+t.id;$("dbody").innerHTML=staleBannerHTML(_sid)+b+renderConnections(_sid);attachChipNavigation();
}
function renderCountryDossier(iso){
  var p=DEMO[iso],nm=NAMES[iso]||iso;
  setDHead("Demography 2025→2050",p<0?"var(--enr)":"var(--min)",nm,iso+" &nbsp;"+confPill("md"));
  var verdict=p<=-20?"Severe contraction. Labor scarcity, fiscal strain, automation becomes existential.":p<0?"Shrinking workforce. Growth must come entirely from productivity.":p<20?"Roughly stable. Institutions decide everything.":p<50?"Expanding workforce. Demographic dividend available — IF jobs, education, capital arrive.":"Explosive growth. Labor supply and instability risk live here simultaneously.";
  var b='<div style="font-size:28px;font-weight:600;color:'+(p<0?"var(--enr)":"var(--min)")+';padding:14px 0 6px">'+(p>0?"+":"")+p+"%</div>";
  b+=makeDSec("WORKING-AGE (15–64) 2025→2050",verdict);
  b+=makeDSec("WHY THIS IS RELIABLE","2050's workers are already born. Fertility shifts only move the tail. UN WPP 2024 medium variant.");
  $("dbody").innerHTML=b;
}
function attachChipNavigation(){document.querySelectorAll(".xchip").forEach(function(el){el.onclick=function(){openDossier(el.dataset.reg,el.dataset.id,true)}})}

// Keyboard nav
var TAB_ORDER=["atlas","tree","humans","trends","constraints","forecasts","method","patrol"];
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){closeDossier();closePalette();closeHealth()}
  if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();togglePalette()}
  if(e.target.matches&&e.target.matches("input,textarea"))return;
  if(e.key==="/"){e.preventDefault();$("nsearch").focus()}
  var n=parseInt(e.key);
  if(n>=1&&n<=TAB_ORDER.length&&!e.ctrlKey&&!e.metaKey&&!e.altKey)switchTab(TAB_ORDER[n-1]);
});

// Tabs
function switchTab(v){
  document.querySelectorAll("#tabs .tab").forEach(function(t){t.classList.toggle("on",t.dataset.v===v)});
  document.querySelectorAll(".view").forEach(function(vw){vw.classList.toggle("on",vw.id==="v-"+v)});
  $("coords").style.display=v==="atlas"?"flex":"none";
  if(v==="atlas"){resize();kick()}
  if(v==="tree")buildTreeIfNeeded();
  if(v==="patrol")buildPatrol();
}
document.querySelectorAll("#tabs .tab").forEach(function(t){t.onclick=function(){switchTab(t.dataset.v)}});

// ── MAP ENGINE ────────────────────────────────────────────────────────────
var COUNTRIES=WORLD_RAW.map(function(e){
  var iso=e[0],rings=[],bb=[999,999,-999,-999];
  e[1].forEach(function(r){
    var f=new Float32Array(r.length);
    for(var i=0;i<r.length;i+=2){var lo=r[i]/10,la=r[i+1]/10;f[i]=lo;f[i+1]=la;if(lo<bb[0])bb[0]=lo;if(la<bb[1])bb[1]=la;if(lo>bb[2])bb[2]=lo;if(la>bb[3])bb[3]=la}
    rings.push(f);
  });
  return{iso:iso,rings:rings,bb:bb};
});
var cv=$("map"),ctx=cv.getContext("2d");
var W=0,H=0,DPR=1;
var cx=18,cy=24,z=3.6;
var ZMIN=1.1,ZMAX=64;
var LST={choke:1,chip:1,min:1,nrg:1,data:1,fin:1};
var demoOn=0,flowsOn=1;
var sel=null,hover=null,hits=[];
var pulse=null,pulseT0=0;
var TR={active:0,ids:[],t0:0};
var animReq=0;
function resize(){var r=$("map-wrap").getBoundingClientRect();W=Math.max(200,r.width);H=Math.max(200,r.height);DPR=Math.min(2,window.devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+"px";cv.style.height=H+"px";ctx.setTransform(DPR,0,0,DPR,0,0);render()}
function px(lon){return(lon-cx)*z+W/2}
function py(lat){return(cy-lat)*z+H/2}
function inv(x,y){return[cx+(x-W/2)/z,cy-(y-H/2)/z]}
function clampView(){z=Math.max(ZMIN,Math.min(ZMAX,z));if(cy>85)cy=85;if(cy<-85)cy=-85;if(cx>180)cx-=360;if(cx<-180)cx+=360}
function demoFill(p){if(p<0){var a=Math.min(.6,Math.abs(p)/100*1.15+.10);return"rgba(255,113,82,"+a.toFixed(3)+")"}var a2=Math.min(.55,p/130+.07);return"rgba(127,211,148,"+a2.toFixed(3)+")"}
function nodeR(n){return(n.t===1?5.6:n.t===2?4.3:3.3)*Math.max(.8,Math.min(1.5,Math.sqrt(z)/1.9))}
function render(){
  ctx.fillStyle="#000000";ctx.fillRect(0,0,W,H);
  var west=inv(0,0)[0],east=inv(W,0)[0];
  ctx.lineWidth=1;ctx.strokeStyle="rgba(30,30,30,.5)";ctx.beginPath();
  var lo0=Math.floor(west/15)*15;
  for(var lo=lo0;lo<=east;lo+=15){var X=px(lo);ctx.moveTo(X,0);ctx.lineTo(X,H)}
  for(var la=-75;la<=85;la+=15){var Y=py(la);if(Y<-2||Y>H+2)continue;ctx.moveTo(0,Y);ctx.lineTo(W,Y)}
  ctx.stroke();
  ctx.strokeStyle="rgba(30,30,30,.85)";ctx.beginPath();var Ye=py(0);if(Ye>0&&Ye<H){ctx.moveTo(0,Ye);ctx.lineTo(W,Ye)}ctx.stroke();
  var offs=[-360,0,360];ctx.lineJoin="round";
  for(var c=0;c<COUNTRIES.length;c++){
    var co=COUNTRIES[c],dv=demoOn?DEMO[co.iso]:undefined;
    for(var oi=0;oi<3;oi++){
      var off=offs[oi];if(co.bb[2]+off<west-2||co.bb[0]+off>east+2)continue;
      ctx.beginPath();
      for(var ri=0;ri<co.rings.length;ri++){var rr=co.rings[ri];ctx.moveTo(px(rr[0]+off),py(rr[1]));for(var i=2;i<rr.length;i+=2)ctx.lineTo(px(rr[i]+off),py(rr[i+1]));ctx.closePath()}
      ctx.fillStyle=(dv!==undefined)?demoFill(dv):"#080808";ctx.fill();
      ctx.strokeStyle="rgba(22,22,22,.9)";ctx.lineWidth=.7;ctx.stroke();
    }
  }
  var now=performance.now();
  if(flowsOn){ctx.lineWidth=1.1;for(var ai=0;ai<ARCS.length;ai++){var A=ARCS[ai];if(!LST[A[2]])continue;var na=NMAP[A[0]],nb=NMAP[A[1]];if(!na||!nb)continue;drawArc(na,nb,LCOLOR(A[2]),now)}}
  if(TR.active)drawTrace(now);
  hits=[];
  for(var ni=0;ni<ATLAS_NODES.length;ni++){
    var n=ATLAS_NODES[ni];if(!LST[n.ly])continue;
    for(var o2=0;o2<3;o2++){var X2=px(n.lon+offs[o2]),Y2=py(n.lat);if(X2<-30||X2>W+30||Y2<-30||Y2>H+30)continue;drawNode(n,X2,Y2,now);hits.push({x:X2,y:Y2,r:nodeR(n)+6,n:n})}
  }
  $("mapstatus").textContent="scale "+z.toFixed(1)+" · "+(demoOn?"demo on · ":"")+"drag pan · scroll zoom";
}
function drawArc(na,nb,col,now){
  var candidates=[nb.lon-360,nb.lon,nb.lon+360],bl=candidates[0];
  for(var i=1;i<3;i++)if(Math.abs(candidates[i]-na.lon)<Math.abs(bl-na.lon))bl=candidates[i];
  for(var off=-360;off<=360;off+=360){
    var x1=px(na.lon+off),y1=py(na.lat),x2=px(bl+off),y2=py(nb.lat);
    if((x1<-50&&x2<-50)||(x1>W+50&&x2>W+50))continue;
    var mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1,L=Math.sqrt(dx*dx+dy*dy)||1;
    var k=Math.min(60,L*.18),nx=-dy/L*k,ny=dx/L*k;
    ctx.strokeStyle=col;ctx.globalAlpha=.5;ctx.setLineDash([5,7]);
    ctx.lineDashOffset=motionOK?-(now*.018)%12:0;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx+nx,my+ny,x2,y2);ctx.stroke();
    ctx.setLineDash([]);ctx.globalAlpha=1;
  }
}
function drawNode(n,X,Y,now){
  var col=LCOLOR(n.ly),R=nodeR(n);
  ctx.save();ctx.shadowColor=col;ctx.shadowBlur=n.t===1?13:8;
  ctx.beginPath();ctx.arc(X,Y,R,0,7);ctx.fillStyle="rgba(0,0,0,.88)";ctx.fill();
  ctx.lineWidth=n.t===1?1.5:1.1;ctx.strokeStyle=col;ctx.stroke();ctx.shadowBlur=0;
  ctx.beginPath();ctx.arc(X,Y,Math.max(1.4,R*.42),0,7);ctx.fillStyle=col;ctx.fill();
  if(sel&&sel.id===n.id){ctx.beginPath();ctx.arc(X,Y,R+4.5,0,7);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha=.9;ctx.stroke();ctx.globalAlpha=1}
  if(pulse&&pulse.id===n.id){var t=(now-pulseT0)/1500;if(t<1&&motionOK){var pr=R+4+t*26;ctx.beginPath();ctx.arc(X,Y,pr,0,7);ctx.strokeStyle=col;ctx.globalAlpha=(1-t)*.8;ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=1}else pulse=null}
  ctx.restore();
  if(z>=6&&(n.t===1||z>=11)){ctx.font="9px ui-monospace,Menlo,Consolas,monospace";ctx.fillStyle="rgba(240,240,240,.88)";ctx.fillText(n.nm.split(" — ")[0].toUpperCase(),X+R+5,Y+3)}
}
function drawTrace(now){
  var el=now-TR.t0,step=650;ctx.save();
  for(var i=0;i<TR.ids.length-1;i++){
    var t0=i*step,prog=Math.min(1,Math.max(0,(el-t0)/step));if(prog<=0)break;
    var a=NMAP[TR.ids[i]],b=NMAP[TR.ids[i+1]];if(!a||!b)continue;
    var bl=b.lon;[b.lon-360,b.lon+360].forEach(function(c){if(Math.abs(c-a.lon)<Math.abs(bl-a.lon))bl=c});
    var x1=px(a.lon),y1=py(a.lat),x2=px(bl),y2=py(b.lat);
    var xe=x1+(x2-x1)*prog,ye=y1+(y2-y1)*prog;
    ctx.strokeStyle="#ff3b30";ctx.lineWidth=1.6;ctx.shadowColor="#ff3b30";ctx.shadowBlur=7;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(xe,ye);ctx.stroke();
  }
  for(var j=0;j<TR.ids.length;j++){
    var ts=j*step;if(el>=ts){var nn=NMAP[TR.ids[j]];if(!nn)continue;var XX=px(nn.lon),YY=py(nn.lat);var pt=Math.min(1,(el-ts)/1100);ctx.beginPath();ctx.arc(XX,YY,8+pt*16,0,7);ctx.strokeStyle="#ff3b30";ctx.globalAlpha=Math.max(.15,(1-pt))*.9;ctx.lineWidth=1.5;ctx.shadowBlur=0;ctx.stroke();ctx.globalAlpha=1}
  }
  ctx.restore();if(el>TR.ids.length*step+6000)TR.active=0;
}
function needAnim(){return $("v-atlas").classList.contains("on")&&((motionOK&&flowsOn)||TR.active||pulse)}
function tick(){animReq=0;if(!$("v-atlas").classList.contains("on"))return;render();if(needAnim())animReq=requestAnimationFrame(tick)}
function kick(){if(!animReq)animReq=requestAnimationFrame(tick)}

var drag=null;
cv.addEventListener("mousedown",function(e){drag={x:e.clientX,y:e.clientY,moved:0};cv.classList.add("dragging")});
window.addEventListener("mousemove",function(e){if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=1;cx-=dx/z;cy+=dy/z;drag.x=e.clientX;drag.y=e.clientY;clampView();render();return}});
window.addEventListener("mouseup",function(){if(drag){cv.classList.remove("dragging");setTimeout(function(){drag=null},0)}});
cv.addEventListener("mousemove",function(e){
  var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  var g=inv(mx,my),lo=g[0],la=g[1];while(lo>180)lo-=360;while(lo<-180)lo+=360;
  $("coords").innerHTML="<b>"+Math.abs(la).toFixed(2)+"°"+(la>=0?"N":"S")+"</b> <b>"+Math.abs(lo).toFixed(2)+"°"+(lo>=0?"E":"W")+"</b>";
  if(drag)return;
  var best=null,bd=1e9;
  for(var i=0;i<hits.length;i++){var h=hits[i],d=(h.x-mx)*(h.x-mx)+(h.y-my)*(h.y-my);if(d<h.r*h.r&&d<bd){bd=d;best=h}}
  hover=best?best.n:null;cv.style.cursor=best?"pointer":"grab";
  var tip=$("tip");
  if(best){tip.style.display="block";tip.querySelector(".tl").textContent=LAYERS[best.n.ly].nm;$("tip-nm").textContent=best.n.nm;var tx=mx+16,ty=my+14;if(tx+tip.offsetWidth>W-8)tx=mx-tip.offsetWidth-10;if(ty+tip.offsetHeight>H-8)ty=my-tip.offsetHeight-10;tip.style.left=tx+"px";tip.style.top=ty+"px"}
  else tip.style.display="none";
});
cv.addEventListener("mouseleave",function(){$("coords").textContent="—";$("tip").style.display="none"});
cv.addEventListener("click",function(e){
  if(drag&&drag.moved)return;
  if(hover){sel=hover;openDossier("atlas",hover.id);render();return}
  if(demoOn){var r=cv.getBoundingClientRect(),g=inv(e.clientX-r.left,e.clientY-r.top);var iso=hitCountry(g[0],g[1]);if(iso&&DEMO[iso]!==undefined){openDossier("country",iso);return}}
  if(TR.active){TR.active=0;render()}closeDossier();
});
cv.addEventListener("wheel",function(e){e.preventDefault();var r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;var g=inv(mx,my);var f=e.deltaY<0?1.16:1/1.16;z=Math.max(ZMIN,Math.min(ZMAX,z*f));cx=g[0]-(mx-W/2)/z;cy=g[1]+(my-H/2)/z;clampView();render()},{passive:false});
var tpts={};
cv.addEventListener("touchstart",function(e){for(var i=0;i<e.changedTouches.length;i++){var t=e.changedTouches[i];tpts[t.identifier]={x:t.clientX,y:t.clientY}}},{passive:true});
cv.addEventListener("touchmove",function(e){
  e.preventDefault();
  if(e.touches.length===1&&Object.keys(tpts).length>=1){var t=e.touches[0],p=tpts[t.identifier];if(!p)return;cx-=(t.clientX-p.x)/z;cy+=(t.clientY-p.y)/z;p.x=t.clientX;p.y=t.clientY;clampView();render()}
  else if(e.touches.length===2){var a=e.touches[0],b=e.touches[1],pa=tpts[a.identifier],pb=tpts[b.identifier];if(!pa||!pb)return;var d0=Math.hypot(pa.x-pb.x,pa.y-pb.y),d1=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(d0>0)z=Math.max(ZMIN,Math.min(ZMAX,z*(d1/d0)));pa.x=a.clientX;pa.y=a.clientY;pb.x=b.clientX;pb.y=b.clientY;clampView();render()}
},{passive:false});
cv.addEventListener("touchend",function(e){for(var i=0;i<e.changedTouches.length;i++)delete tpts[e.changedTouches[i].identifier]},{passive:true});

function hitCountry(lon,lat){
  for(var c=0;c<COUNTRIES.length;c++){
    var co=COUNTRIES[c],L=lon;
    if(L<co.bb[0]||L>co.bb[2]){if(lon+360>=co.bb[0]&&lon+360<=co.bb[2])L=lon+360;else if(lon-360>=co.bb[0]&&lon-360<=co.bb[2])L=lon-360;else continue}
    if(lat<co.bb[1]||lat>co.bb[3])continue;
    var inside=false;
    for(var ri=0;ri<co.rings.length;ri++){var rr=co.rings[ri],n=rr.length/2,j=n-1;for(var i=0;i<n;i++){var xi=rr[i*2],yi=rr[i*2+1],xj=rr[j*2],yj=rr[j*2+1];if(((yi>lat)!==(yj>lat))&&(L<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;j=i}}
    if(inside)return co.iso;
  }return null;
}

$("mz-in").onclick=function(){z=Math.min(ZMAX,z*1.3);clampView();render();kick()};
$("mz-out").onclick=function(){z=Math.max(ZMIN,z/1.3);clampView();render();kick()};
$("mz-fit").onclick=function(){cx=18;cy=24;z=3.6;clampView();render();kick()};

function buildLegend(){
  var h="";
  Object.keys(LAYERS).forEach(function(k){var ct=ATLAS_NODES.filter(function(n){return n.ly===k}).length;h+='<div class="lyrow" data-ly="'+k+'" title="Toggle '+LAYERS[k].nm+'"><span class="sw" style="background:'+LAYERS[k].c+';color:'+LAYERS[k].c+'"></span><span class="nm">'+LAYERS[k].nm+'</span><span class="ct">'+ct+"</span></div>"});
  h+='<div class="lyrow" data-ly="__flows" title="Toggle flow arcs"><span class="sw" style="background:#888888;color:#888888"></span><span class="nm">Flow arcs</span><span class="ct">'+ARCS.length+"</span></div>";
  h+='<div class="lyrow off" data-ly="__demo" title="Toggle demography shading"><span class="sw" style="background:linear-gradient(90deg,#ff6b55,#c0c0c0);color:#c0c0c0"></span><span class="nm">Demography 2025→2050</span></div>';
  $("lyrows").innerHTML=h;
  document.querySelectorAll(".lyrow").forEach(function(row){row.onclick=function(){var k=row.dataset.ly;if(k==="__flows"){flowsOn=!flowsOn;row.classList.toggle("off",!flowsOn)}else if(k==="__demo"){demoOn=!demoOn;row.classList.toggle("off",!demoOn)}else{LST[k]=!LST[k];row.classList.toggle("off",!LST[k]);if(sel&&sel.ly===k&&!LST[k])closeDossier()}TR.active=0;render();kick()}});
  $("lgmin").onclick=function(){var b=$("lgbody"),vis=b.style.display!=="none";b.style.display=vis?"none":"block";$("lgmin").textContent=vis?"+":"−"};
}
$("nsearch").addEventListener("input",function(){
  var q=this.value.trim().toLowerCase(),sr=$("sres");if(!q){sr.innerHTML="";return}
  var m=ATLAS_NODES.filter(function(n){return n.nm.toLowerCase().includes(q)||n.id.includes(q)}).slice(0,8);
  sr.innerHTML=m.map(function(n){return'<div class="sr" data-id="'+n.id+'"><span style="color:'+LCOLOR(n.ly)+'">●</span> '+esc(n.nm)+"</div>"}).join("");
  sr.querySelectorAll(".sr").forEach(function(d){d.onclick=function(){flyTo(NMAP[d.dataset.id]);sr.innerHTML="";$("nsearch").value=""}});
});
function flyTo(n){
  if(!LST[n.ly]){LST[n.ly]=1;var row=document.querySelector('.lyrow[data-ly="'+n.ly+'"]');if(row)row.classList.remove("off")}
  cx=n.lon;cy=n.lat;z=Math.max(z,7);clampView();pulse=n;pulseT0=performance.now();sel=n;openDossier("atlas",n.id);kick();
}

// Scenarios
function buildScenarios(){
  var tbody=$("scenarios-wrap");
  tbody.innerHTML=SCENARIOS.map(function(sc){return'<div class="card"><div class="chd"><span class="t">'+esc(sc.nm)+'</span><button class="btn" data-sc="'+sc.id+'" title="Trace on map">▶ trace</button></div><div class="cbd">'+esc(sc.d)+"</div></div>"}).join("");
  tbody.querySelectorAll("[data-sc]").forEach(function(btn){btn.onclick=function(){var sc=SCENARIOS.find(function(s){return s.id===btn.dataset.sc});if(sc)runScenario(sc)}});
}
function runScenario(sc){
  switchTab("atlas");
  sc.ly.forEach(function(k){LST[k]=1;var row=document.querySelector('.lyrow[data-ly="'+k+'"]');if(row)row.classList.remove("off")});
  var lons=[],lats=[];sc.trace.forEach(function(id){var n=NMAP[id];if(n){lons.push(n.lon);lats.push(n.lat)}});
  if(!lons.length)return;
  var mn=Math.min.apply(0,lons),mx=Math.max.apply(0,lons);cx=(mn+mx)/2;
  var mla=Math.min.apply(0,lats),mxa=Math.max.apply(0,lats);cy=(mla+mxa)/2;
  z=Math.max(1.4,Math.min(7,Math.min(W/(Math.max(20,mx-mn)*1.5),H/(Math.max(12,mxa-mla)*1.9))));
  clampView();TR={active:1,ids:sc.trace,t0:performance.now()};closeDossier();kick();
}

// Constraints table
function buildConstraints(){$("constraints-tbody").innerHTML=CONSTRAINTS.map(function(c){return"<tr><td class='mono-em'>"+esc(c[0])+"</td><td>"+esc(c[1])+"</td><td>"+esc(c[2])+"</td><td>"+esc(c[3])+"</td><td>"+esc(c[4])+"</td></tr>"}).join("")}

// ── TECH TREE ─────────────────────────────────────────────────────────────
var treeSel=null,treePathMode=false,treeXrefOn=false,treeBuilt=false,treeSVGEl=null;
var treeScale=1,treeOffX=0,treeOffY=0;
var COLW=268,NW=200,NH=70,ROWH=96,PADX=14,PADY=52;
var TREE_W=0,TREE_H=0;
function treeX(era){return era*COLW+PADX}
function treeY(row){return PADY+row*ROWH}
function buildTreeIfNeeded(){if(treeBuilt)return;buildTreeSVG();treeBuilt=true}
function buildTreeSVG(){
  var maxEra=0,maxRow=0;TREE.forEach(function(n){if(n.era>maxEra)maxEra=n.era;if(n.row>maxRow)maxRow=n.row});
  TREE_W=(maxEra+1)*COLW+PADX*2;TREE_H=PADY+(maxRow+2)*ROWH;
  var ns="http://www.w3.org/2000/svg";var svg=document.createElementNS(ns,"svg");
  svg.setAttribute("width",TREE_W);svg.setAttribute("height",TREE_H);svg.style.display="block";svg.style.overflow="visible";treeSVGEl=svg;
  var defs=document.createElementNS(ns,"defs");
  function makeMarker(id,color){var m=document.createElementNS(ns,"marker");m.setAttribute("id",id);m.setAttribute("viewBox","0 0 8 8");m.setAttribute("refX","7");m.setAttribute("refY","4");m.setAttribute("markerWidth","5");m.setAttribute("markerHeight","5");m.setAttribute("orient","auto");var p=document.createElementNS(ns,"path");p.setAttribute("d","M0 0 L8 4 L0 8 z");p.setAttribute("fill",color);m.appendChild(p);return m}
  defs.appendChild(makeMarker("arr-default","#2c2c2c"));defs.appendChild(makeMarker("arr-cause","#e8e8e8"));defs.appendChild(makeMarker("arr-effect","#ff3b30"));svg.appendChild(defs);
  for(var era=0;era<=maxEra;era++){
    var x=treeX(era);var rect=document.createElementNS(ns,"rect");rect.setAttribute("x",x-4);rect.setAttribute("y",0);rect.setAttribute("width",COLW-2);rect.setAttribute("height",TREE_H);rect.setAttribute("fill",era%2===0?"rgba(8,17,19,.0)":"rgba(13,27,30,.5)");svg.appendChild(rect);
    var hd=document.createElementNS(ns,"text");hd.setAttribute("x",x);hd.setAttribute("y",20);hd.setAttribute("fill","#484848");hd.setAttribute("font-family","ui-monospace,Menlo,Consolas,monospace");hd.setAttribute("font-size","8");hd.setAttribute("letter-spacing","1.5");hd.textContent=(TREE_ERAS[era]||"ERA "+era).toUpperCase();svg.appendChild(hd);
  }
  var pos={};TREE.forEach(function(n){pos[n.id]={x:treeX(n.era),y:treeY(n.row)}});
  var edgeGroup=document.createElementNS(ns,"g");edgeGroup.setAttribute("id","tree-edges");svg.appendChild(edgeGroup);
  TREE.forEach(function(n){(n.requires||[]).forEach(function(pid){var a=pos[pid],b=pos[n.id];if(!a||!b)return;var x1=a.x+NW,y1=a.y+NH/2,x2=b.x,y2=b.y+NH/2;var p=document.createElementNS(ns,"path");var cp1x=x1+50,cp2x=x2-50;p.setAttribute("d","M"+x1+" "+y1+" C"+cp1x+" "+y1+","+cp2x+" "+y2+","+x2+" "+y2);p.setAttribute("class","tedge");p.setAttribute("data-from",pid);p.setAttribute("data-to",n.id);p.setAttribute("marker-end","url(#arr-default)");edgeGroup.appendChild(p)})});
  var nodeGroup=document.createElementNS(ns,"g");nodeGroup.setAttribute("id","tree-nodes");svg.appendChild(nodeGroup);
  TREE.forEach(function(n){
    var x=pos[n.id].x,y=pos[n.id].y;var g=document.createElementNS(ns,"g");
    g.setAttribute("class","tnode"+(n.fg?" "+n.fg:"")+(n.live?" live":""));g.setAttribute("data-id",n.id);g.setAttribute("transform","translate("+x+","+y+")");g.setAttribute("role","button");g.setAttribute("aria-label",n.lb);
    var bg=document.createElementNS(ns,"rect");bg.setAttribute("class","bg");bg.setAttribute("width",NW);bg.setAttribute("height",NH);bg.setAttribute("rx","2");g.appendChild(bg);
    if(n.fg){var badge=document.createElementNS(ns,"text");badge.setAttribute("class","fg-badge");badge.setAttribute("x",NW-5);badge.setAttribute("y",13);badge.setAttribute("text-anchor","end");badge.textContent=n.fg.toUpperCase();g.appendChild(badge)}
    if(n.live){var dot=document.createElementNS(ns,"circle");dot.setAttribute("class","live-dot");dot.setAttribute("cx",NW-8);dot.setAttribute("cy",NH-10);dot.setAttribute("r","3");g.appendChild(dot)}
    var lbl=document.createElementNS(ns,"text");lbl.setAttribute("class","lb");lbl.setAttribute("x",8);lbl.setAttribute("y",22);lbl.textContent=n.lb.length>24?n.lb.slice(0,23)+"…":n.lb;g.appendChild(lbl);
    var dt=document.createElementNS(ns,"text");dt.setAttribute("class","dt");dt.setAttribute("x",8);dt.setAttribute("y",36);dt.textContent=n.dt;g.appendChild(dt);
    var mech=document.createElementNS(ns,"text");mech.setAttribute("class","mech");mech.setAttribute("x",8);mech.setAttribute("y",52);var mechText=n.mech||"";mech.textContent=mechText.length>34?mechText.slice(0,33)+"…":mechText;g.appendChild(mech);
    g.addEventListener("click",function(e){e.stopPropagation();selectTreeNode(n.id)});
    g.addEventListener("mouseenter",function(){showTreeTip(n,x,y)});
    g.addEventListener("mouseleave",function(){$("tip").style.display="none"});
    nodeGroup.appendChild(g);
  });
  var wrap=$("tree-svg-wrap");wrap.innerHTML="";wrap.appendChild(svg);wrap.style.width=TREE_W+"px";wrap.style.height=TREE_H+"px";
  buildTreeMinimap();
}
function showTreeTip(n,x,y){var tip=$("tip");tip.style.display="block";tip.querySelector(".tl").textContent="ERA "+n.era+" · "+(n.fg||"foundational");$("tip-nm").textContent=n.lb+" — "+n.mech;var wrap=$("tree-scroll").getBoundingClientRect();tip.style.left=Math.min(wrap.width-200,x+NW+8)+"px";tip.style.top=(y+20)+"px"}
function selectTreeNode(id){if(treeSel===id&&!treePathMode){clearTreeSelection();return}treeSel=id;applyTreeLighting();openDossier("tree",id,false);if(treePathMode)applyPathToTarget();else $("path-hint").style.display="none"}
function clearTreeSelection(){treeSel=null;applyTreeLighting();closeDossier()}
function getAncestors(id){var visited=new Set(),queue=[id];while(queue.length){var curr=queue.shift();var n=TREE_MAP[curr];if(!n)continue;(n.requires||[]).forEach(function(pid){if(!visited.has(pid)){visited.add(pid);queue.push(pid)}});}return visited}
function getDescendants(id){var visited=new Set(),queue=[id];while(queue.length){var curr=queue.shift();(TREE_CHILDREN[curr]||[]).forEach(function(cid){if(!visited.has(cid)){visited.add(cid);queue.push(cid)}});}return visited}
function applyTreeLighting(){
  if(!treeSVGEl)return;
  var ancestors=treeSel?getAncestors(treeSel):new Set();var descendants=treeSel?getDescendants(treeSel):new Set();
  treeSVGEl.querySelectorAll(".tnode").forEach(function(el){var nid=el.dataset.id;el.classList.remove("sel","lit-cause","lit-effect","dimmed");if(!treeSel)return;if(nid===treeSel)el.classList.add("sel");else if(ancestors.has(nid))el.classList.add("lit-cause");else if(descendants.has(nid))el.classList.add("lit-effect");else el.classList.add("dimmed")});
  treeSVGEl.querySelectorAll(".tedge").forEach(function(el){el.classList.remove("lit-cause","lit-effect","dimmed");if(!treeSel){el.setAttribute("marker-end","url(#arr-default)");return}var from=el.dataset.from,to=el.dataset.to;if(from===treeSel&&descendants.has(to)||descendants.has(to)&&(from===treeSel||descendants.has(from))){el.classList.add("lit-effect");el.setAttribute("marker-end","url(#arr-effect)")}else if(ancestors.has(from)&&(to===treeSel||ancestors.has(to))){el.classList.add("lit-cause");el.setAttribute("marker-end","url(#arr-cause)")}else{el.classList.add("dimmed");el.setAttribute("marker-end","url(#arr-default)")}});
  updateTreeMinimap();
}
function applyPathToTarget(){if(!treeSel||!treeSVGEl)return;var ancestors=getAncestors(treeSel);$("path-hint").style.display="block";treeSVGEl.querySelectorAll(".tnode").forEach(function(el){el.style.display=(el.dataset.id===treeSel||ancestors.has(el.dataset.id))?"":"none"});treeSVGEl.querySelectorAll(".tedge").forEach(function(el){var from=el.dataset.from,to=el.dataset.to;el.style.display=((ancestors.has(from)||from===treeSel)&&(ancestors.has(to)||to===treeSel))?"":"none"})}
function clearPathToTarget(){if(!treeSVGEl)return;treeSVGEl.querySelectorAll(".tnode,.tedge").forEach(function(el){el.style.display=""});$("path-hint").style.display="none"}
$("tt-full").onclick=function(){treePathMode=false;$("tt-full").classList.add("on");$("tt-path").classList.remove("on");clearPathToTarget();applyTreeLighting()};
$("tt-path").onclick=function(){treePathMode=true;$("tt-path").classList.add("on");$("tt-full").classList.remove("on");if(treeSel)applyPathToTarget();else $("path-hint").style.display="block"};
$("tt-xref").onclick=function(){treeXrefOn=!treeXrefOn;$("tt-xref").classList.toggle("on",treeXrefOn)};
$("tt-reset").onclick=function(){treeSel=null;treePathMode=false;$("tt-full").classList.add("on");$("tt-path").classList.remove("on");clearPathToTarget();applyTreeLighting();closeDossier()};
$("tt-full").classList.add("on");
function treeYearOf(n){var m=(n.dt||"").match(/\d{4}/);return m?parseInt(m[0]):2026}
function applyRewind(y){if(!treeSVGEl)return;var max=+$("tt-year").max;var lb=$("tt-year-lb");if(y>=max){lb.textContent="FULL TIMELINE";lb.classList.remove("rewound")}else{lb.textContent="VISIBLE AS OF "+y;lb.classList.add("rewound")}treeSVGEl.querySelectorAll(".tnode").forEach(function(el){var n=TREE_MAP[el.dataset.id];el.classList.toggle("t-future",!!n&&treeYearOf(n)>y)});treeSVGEl.querySelectorAll(".tedge").forEach(function(el){var a=TREE_MAP[el.dataset.from],b=TREE_MAP[el.dataset.to];el.classList.toggle("t-future",(a&&treeYearOf(a)>y)||(b&&treeYearOf(b)>y))})}
$("tt-year").addEventListener("input",function(){buildTreeIfNeeded();applyRewind(+this.value)});
$("tz-in").onclick=function(){$("tree-scroll").style.transform="scale("+(treeScale=Math.min(2,treeScale+.1))+")"};
$("tz-out").onclick=function(){$("tree-scroll").style.transform="scale("+(treeScale=Math.max(.3,treeScale-.1))+")"};
$("tz-fit").onclick=function(){treeScale=1;var scroll=$("tree-scroll");scroll.style.transform="";scroll.scrollLeft=0;scroll.scrollTop=0};
$("tree-scroll").addEventListener("wheel",function(e){if(e.ctrlKey||e.metaKey){e.preventDefault();treeScale=Math.max(.3,Math.min(2,treeScale*(e.deltaY<0?1.1:0.9)));$("tree-svg-wrap").style.transform="scale("+treeScale+")";$("tree-svg-wrap").style.transformOrigin="0 0"}},{passive:false});
var minimapCtx=null;
function buildTreeMinimap(){var mm=$("tree-minimap");if(!mm)return;minimapCtx=mm.getContext("2d");mm.width=160;mm.height=90;updateTreeMinimap();mm.addEventListener("click",function(e){var r=mm.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;var sx=(mx/160)*TREE_W,sy=(my/90)*TREE_H;var scroll=$("tree-scroll");scroll.scrollLeft=sx-scroll.clientWidth/2;scroll.scrollTop=sy-scroll.clientHeight/2})}
function updateTreeMinimap(){if(!minimapCtx||!TREE_W)return;var mm=minimapCtx,mw=160,mh=90;mm.fillStyle="#000000";mm.fillRect(0,0,mw,mh);var sx=mw/TREE_W,sy=mh/TREE_H;TREE.forEach(function(n){var x=(treeX(n.era))*sx,y=(treeY(n.row))*sy,w=NW*sx,h=NH*sy,c="#2c2c2c";if(treeSel){var el=treeSVGEl&&treeSVGEl.querySelector('.tnode[data-id="'+n.id+'"]');if(el){if(el.classList.contains("sel"))c="#ff3b30";else if(el.classList.contains("lit-cause"))c="#e8e8e8";else if(el.classList.contains("lit-effect"))c="#ff3b30";else if(el.classList.contains("dimmed"))c="#1c1c1c"}}mm.fillStyle=c;mm.fillRect(x,y,Math.max(w,2),Math.max(h,1))});var scroll=$("tree-scroll"),vx=scroll.scrollLeft*sx,vy=scroll.scrollTop*sy,vw=scroll.clientWidth*sx,vh=scroll.clientHeight*sy;mm.strokeStyle="rgba(255,59,48,.7)";mm.lineWidth=1;mm.strokeRect(vx,vy,vw,vh)}
$("tree-scroll")&&$("tree-scroll").addEventListener("scroll",updateTreeMinimap);

// ── HUMANS ────────────────────────────────────────────────────────────────
function buildHumans(){
  var TL_START=1970,TL_END=2030,TL_RANGE=TL_END-TL_START;var wrap=$("humans-timeline-inner");
  var yearHtml='<div style="position:relative;height:36px;margin-left:0">';
  for(var y=TL_START;y<=TL_END;y+=5){var pct=((y-TL_START)/TL_RANGE*100);yearHtml+='<div class="tl-year" style="left:'+pct+'%">'+y+"</div>"}
  yearHtml+='<div style="position:absolute;left:0;right:0;top:24px;height:1px;background:var(--line)"></div></div>';
  var rowsHtml="";
  HUMANS.forEach(function(h){
    var tierColor={C:"var(--choke)",P:"var(--chip)",W:"var(--min)",M:"var(--net)"}[h.tier]||"var(--dim)";
    rowsHtml+='<div class="tl-row" data-id="'+h.id+'">';
    rowsHtml+='<div class="tl-name" data-id="'+h.id+'" title="Open dossier: '+esc(h.name)+'" style="color:'+tierColor+'">'+esc(h.name)+'<span class="tier-badge" style="color:'+tierColor+'">TIER '+h.tier+"</span></div>";
    rowsHtml+='<div class="tl-bets" style="flex:1;position:relative;height:46px">';
    (h.bets||[]).forEach(function(bet){
      var startPct=Math.max(0,Math.min(100,((bet.yr-TL_START)/TL_RANGE*100)));var endPct=Math.min(100,(((bet.yr+5)-TL_START)/TL_RANGE*100));var wPct=endPct-startPct;
      rowsHtml+='<div class="tl-bet tier-'+h.tier+'" data-hid="'+h.id+'" style="left:'+startPct+'%;width:'+Math.max(wPct,1.5)+'%;height:30px;top:8px" title="'+esc(bet.yr+": "+(bet.thesis||""))+'"><div class="bet-yr">'+bet.yr+"</div></div>";
    });
    rowsHtml+="</div></div>";
  });
  wrap.innerHTML=yearHtml+rowsHtml;
  wrap.querySelectorAll(".tl-name,.tl-bet").forEach(function(el){el.onclick=function(){openDossier("human",el.dataset.id||el.dataset.hid)}});
}

// ── TRENDS ────────────────────────────────────────────────────────────────
function buildTrends(){
  var cols={closed:[],closing:[],open:[],forming:[]};TRENDS.forEach(function(t){if(cols[t.status])cols[t.status].push(t)});
  Object.keys(cols).forEach(function(status){
    var cardEl=$("kc-"+status+"-cards"),ctEl=$("kc-"+status+"-ct");
    ctEl.textContent=cols[status].length+" windows";
    cardEl.innerHTML=cols[status].map(function(t){
      var now=new Date().getFullYear();var opened=parseInt(t.opened)||now;var close=parseInt((t.expected_close||"").replace(/[±+]/g,""))||now+5;
      var pct=Math.min(100,Math.max(0,((now-opened)/(close-opened))*100));var pinned=t.id==="meta-leverage-shift";
      return'<div class="trend-card'+(pinned?" pinned":"")+'" data-id="'+t.id+'">'
        +'<div class="tc-top"><div class="tc-name">'+esc(t.name)+'</div><div class="tc-class '+t.class+'">'+t.class.toUpperCase().replace(/-/g," ")+"</div></div>"
        +'<div class="tc-mech">'+esc((t.mechanism||"").slice(0,80))+"…</div>"
        +'<div class="tc-dates"><span>'+(t.opened||"?")+'</span><div class="tc-decay-bar"><div class="tc-decay-fill'+(status==="closing"?" closing":"")+'" style="width:'+pct+'%"></div></div><span>'+(t.expected_close||"?")+"</span></div>"
        +(t.who_won&&t.who_won.length?'<div class="tc-winners">'+t.who_won.map(function(wid){var h=HUMAN_MAP[wid];return'<span class="winner-chip" data-hid="'+wid+'">'+(h?h.name:wid)+"</span>"}).join("")+"</div>":"")
        +"</div>";
    }).join("");
    cardEl.querySelectorAll(".trend-card").forEach(function(el){el.onclick=function(e){if(e.target.classList.contains("winner-chip"))return;openDossier("trend",el.dataset.id)}});
    cardEl.querySelectorAll(".winner-chip").forEach(function(el){el.onclick=function(e){e.stopPropagation();openDossier("human",el.dataset.hid)}});
  });
}
var G_START=2007,G_END=2034,G_RANGE=G_END-G_START;
function gPct(y){return Math.max(0,Math.min(100,(y-G_START)/G_RANGE*100))}
function buildGantt(){
  var el=$("trends-gantt");var html='<div class="gantt-axis">';
  for(var y=2008;y<=G_END;y+=4)html+='<div class="gantt-yr" style="left:'+gPct(y)+'%">'+y+"</div>";
  html+="</div>";
  var order={open:0,closing:1,forming:2,closed:3};var sorted=TRENDS.slice().sort(function(a,b){return(order[a.status]-order[b.status])||((parseInt(a.opened)||0)-(parseInt(b.opened)||0))});
  var nowYr=new Date().getFullYear();
  sorted.forEach(function(t){var o=parseInt(t.opened)||nowYr;var c=parseInt((t.expected_close||"").replace(/[±+]/g,""))||o+6;var l=gPct(o),w=Math.max(2,gPct(c)-l);html+='<div class="gantt-row"><div class="gantt-name" data-id="'+t.id+'">'+esc(t.name)+"</div><div class=\"gantt-track\"><div class=\"gantt-now\" style=\"left:"+gPct(nowYr)+"%\"></div><div class=\"gantt-bar st-"+t.status+'" data-id="'+t.id+'" style="left:'+l+"%;width:"+w+'%">'+t.status+"</div></div></div>"});
  el.innerHTML=html;el.querySelectorAll("[data-id]").forEach(function(b){b.onclick=function(){openDossier("trend",b.dataset.id)}});
}
$("tv-kanban").onclick=function(){$("tv-kanban").classList.add("on");$("tv-gantt").classList.remove("on");$("trends-kanban").style.display="flex";$("trends-gantt").style.display="none"};
$("tv-gantt").onclick=function(){$("tv-gantt").classList.add("on");$("tv-kanban").classList.remove("on");$("trends-kanban").style.display="none";$("trends-gantt").style.display="block";buildGantt()};

// ── METHOD ────────────────────────────────────────────────────────────────
function buildMethod(){
  $("method-hier").innerHTML=HIER.map(function(h){return'<div style="display:flex;gap:10px;margin-bottom:10px"><div style="color:var(--choke);flex:none;font-size:10px;min-width:22px">'+h[2]+'</div><div><div style="font-size:11px;color:var(--txt);margin-bottom:2px">'+esc(h[0])+'</div><div style="font-size:10px;color:var(--dim);line-height:1.6">'+esc(h[1])+"</div></div></div>"}).join("");
  $("method-rules").innerHTML=RULES.map(function(r,i){return'<div class="rule-row"><div class="rule-n">'+(i+1)+'</div><div>'+esc(r)+"</div></div>"}).join("");
  $("method-bias").innerHTML=BIASCHK.map(function(b){return'<div class="rule-row"><div class="rule-n">☐</div><div>'+esc(b)+"</div></div>"}).join("");
  $("method-sources").innerHTML=SOURCES.map(function(s){return"<tr><td class='mono-em'>"+esc(s[0])+"</td><td>"+esc(s[1])+"</td><td><code>"+esc(s[2])+"</code></td></tr>"}).join("");
}

// ── FORECASTS ─────────────────────────────────────────────────────────────
var forecasts=[];
function loadForecasts(){try{var raw=storage.getItem("sv3-forecasts");if(raw)forecasts=JSON.parse(raw)}catch(e){}}
function saveForecasts(){try{storage.setItem("sv3-forecasts",JSON.stringify(forecasts))}catch(e){}}
function calcBrier(){var resolved=forecasts.filter(function(f){return f.outcome!==null});if(!resolved.length)return null;var sum=resolved.reduce(function(acc,f){return acc+Math.pow(f.p-(f.outcome?1:0),2)},0);return(sum/resolved.length).toFixed(3)}
function renderForecasts(){
  var brier=calcBrier();$("brier-val").textContent=brier!==null?brier:"—";
  var pending=forecasts.filter(function(f){return f.outcome===null}).length;$("fc-counts").textContent=pending+" / "+(forecasts.length-pending);
  $("fc-list").innerHTML=forecasts.map(function(f,i){
    var row='<div style="display:flex;gap:8px;margin-bottom:6px;align-items:baseline;font-size:11px"><div style="color:var(--choke);min-width:22px;font-size:9px">'+(i+1)+'</div><div style="flex:1;color:var(--txt)">'+esc(f.stmt)+'</div>'+(f.seeded?'<span class="fc-seed-tag">seeded</span>':"")+'<div style="color:var(--chip);min-width:36px">'+Math.round(f.p*100)+"%</div>"+'<div style="color:var(--faint);min-width:70px;font-size:9px">'+esc(f.dl||"")+'</div>'+(f.outcome===null?'<button class="btn" data-i="'+i+'" data-o="1" style="padding:2px 6px;font-size:9px">✓</button><button class="btn danger" data-i="'+i+'" data-o="0" style="padding:2px 6px;font-size:9px">✗</button>':'<span style="color:'+(f.outcome?"var(--ok)":"var(--alert)")+';font-size:9px">'+(f.outcome?"TRUE":"FALSE")+"</span>")+'<button class="btn danger" data-del="'+i+'" style="padding:2px 5px;font-size:9px">×</button></div>';
    if(f.falsifier)row+='<div class="fc-falsifier"><b>FALSIFIER</b> '+esc(f.falsifier)+"</div>";
    return row;
  }).join("");
  $("fc-list").querySelectorAll("[data-i]").forEach(function(btn){btn.onclick=function(){forecasts[+btn.dataset.i].outcome=+btn.dataset.o===1;saveForecasts();renderForecasts()}});
  $("fc-list").querySelectorAll("[data-del]").forEach(function(btn){btn.onclick=function(){forecasts.splice(+btn.dataset.del,1);saveForecasts();renderForecasts()}});
}
$("fc-add-btn").onclick=function(){var stmt=$("fc-stmt").value.trim();var p=parseFloat($("fc-p").value);var dl=$("fc-dl").value;if(!stmt||isNaN(p)||p<0||p>1)return;forecasts.push({stmt:stmt,p:p,dl:dl,outcome:null,added:NOW_YM});saveForecasts();renderForecasts();$("fc-stmt").value="";$("fc-p").value="";$("fc-dl").value=""};
$("fc-seed-btn").onclick=function(){
  var existing={};forecasts.forEach(function(f){if(f.key)existing[f.key]=1});var added=0;
  function harvest(nodes,reg,nameOf){nodes.forEach(function(n){(n.future_paths||[]).forEach(function(fp,i){if(!fp.falsifier||/^N\/A/.test(fp.falsifier))return;var key=reg+"/"+n.id+"/"+i;if(existing[key])return;forecasts.push({stmt:"["+reg.toUpperCase()+" · "+nameOf(n)+"] "+fp.path,p:fp.p,dl:fp.horizon+"-12-31",falsifier:fp.falsifier,outcome:null,added:NOW_YM,seeded:true,key:key});existing[key]=1;added++})})}
  harvest(HUMANS,"human",function(n){return n.name});harvest(TRENDS,"trend",function(n){return n.name});
  saveForecasts();renderForecasts();$("fc-seed-btn").textContent=added?("⇪ Imported "+added):"⇪ Up to date";setTimeout(function(){$("fc-seed-btn").textContent="⇪ Import from registries"},2500);
};

// ── COMMAND PALETTE ───────────────────────────────────────────────────────
var paletteOpen=false,paletteSel=0,paletteResults=[];
function togglePalette(){paletteOpen?closePalette():openPalette()}
function openPalette(){paletteOpen=true;$("palette-overlay").classList.add("open");$("palette-input").value="";paletteResults=[];renderPalette(searchAllv2(""));setTimeout(function(){$("palette-input").focus()},50)}
function closePalette(){paletteOpen=false;$("palette-overlay").classList.remove("open")}
$("search-btn").onclick=openPalette;
$("palette-overlay").onclick=function(e){if(e.target===$("palette-overlay"))closePalette()};
function searchAll(q){
  if(!q)return[];var qq=q.toLowerCase();var results=[];
  ATLAS_NODES.forEach(function(n){if(n.nm.toLowerCase().includes(qq)||n.id.includes(qq)||(n.ao&&n.ao.toLowerCase().includes(qq)))results.push({reg:"atlas",id:n.id,name:n.nm,sub:LAYERS[n.ly]?LAYERS[n.ly].nm:n.ly})});
  TREE.forEach(function(n){if(n.lb.toLowerCase().includes(qq)||n.id.includes(qq)||(n.mech&&n.mech.toLowerCase().includes(qq)))results.push({reg:"tree",id:n.id,name:n.lb,sub:"Era "+n.era+" · "+n.dt})});
  HUMANS.forEach(function(h){if(h.name.toLowerCase().includes(qq)||h.id.includes(qq)||(h.domain&&h.domain.toLowerCase().includes(qq)))results.push({reg:"humans",id:h.id,name:h.name,sub:"Tier "+h.tier+" · "+h.domain})});
  TRENDS.forEach(function(t){if(t.name.toLowerCase().includes(qq)||t.id.includes(qq)||(t.mechanism&&t.mechanism.toLowerCase().includes(qq)))results.push({reg:"trends",id:t.id,name:t.name,sub:t.status.toUpperCase()+" · "+t.class})});
  SCENARIOS.forEach(function(s){if(s.nm.toLowerCase().includes(qq)||s.id.includes(qq))results.push({reg:"scenario",id:s.id,name:s.nm,sub:"Scenario trace"})});
  return results.slice(0,16);
}
function renderPalette(results){
  paletteResults=results;paletteSel=0;
  $("palette-results").innerHTML=results.map(function(r,i){return'<div class="pr-item'+(i===0?" focused":"")+'" data-i="'+i+'"><div class="pr-badge '+r.reg+'">'+r.reg.toUpperCase()+"</div><div><div class=\"pr-name\">"+esc(r.name)+'</div><div class="pr-sub">'+esc(r.sub||"")+"</div></div></div>"}).join("")+(results.length===0&&$("palette-input").value?'<div style="padding:12px 16px;color:var(--faint);font-size:11px">No results</div>':"");
  $("palette-results").querySelectorAll(".pr-item").forEach(function(el){el.onclick=function(){selectPaletteItem(+el.dataset.i)}});
}
function selectPaletteItem(i){
  var r=paletteResults[i];if(!r)return;closePalette();
  if(r.reg==="action"){
    if(r.id==="patrol")switchTab("patrol");
    else if(r.id==="trace"){var tp=$("trace-panel");if(tp)tp.classList.add("open");setTimeout(function(){var a=$("trace-a");if(a)a.focus()},60)}
    else if(r.id==="health")openHealth();
    return;
  }
  if(r.reg!=="scenario")addRecentJump(r.reg,r.id,r.name);
  if(r.reg==="atlas"){switchTab("atlas");flyTo(NMAP[r.id])}
  else if(r.reg==="tree"){switchTab("tree");buildTreeIfNeeded();setTimeout(function(){selectTreeNode(r.id)},100)}
  else if(r.reg==="humans"||r.reg==="human"){switchTab("humans");openDossier("human",r.id)}
  else if(r.reg==="trends"||r.reg==="trend"){switchTab("trends");openDossier("trend",r.id)}
  else if(r.reg==="scenario"){var sc=SCENARIOS.find(function(s){return s.id===r.id});if(sc)runScenario(sc)}
}
$("palette-input").addEventListener("input",function(){renderPalette(searchAllv2(this.value.trim()))});
$("palette-input").addEventListener("keydown",function(e){if(e.key==="ArrowDown"){paletteSel=Math.min(paletteResults.length-1,paletteSel+1);highlightPalette()}else if(e.key==="ArrowUp"){paletteSel=Math.max(0,paletteSel-1);highlightPalette()}else if(e.key==="Enter"){e.preventDefault();selectPaletteItem(paletteSel)}else if(e.key==="Escape"){closePalette()}});
function highlightPalette(){$("palette-results").querySelectorAll(".pr-item").forEach(function(el,i){el.classList.toggle("focused",i===paletteSel)})}

// ── DATA HEALTH PANEL ─────────────────────────────────────────────────────
function openHealth(){$("health-panel").classList.add("open");buildHealthPanel()}
function closeHealth(){$("health-panel").classList.remove("open")}
$("health-btn").onclick=function(){$("health-panel").classList.contains("open")?closeHealth():openHealth()};
$("health-close").onclick=closeHealth;
function buildHealthPanel(){
  var stale=[],expired=[];
  function checkNodes(nodes,reg){nodes.forEach(function(n){if(isStale(n))stale.push({reg:reg,id:n.id,name:n.lb||n.name||n.nm||n.id,vintage:n.vintage});if(n.expires){var ep=new Date(n.expires+"-01");if(ep<new Date())expired.push({reg:reg,id:n.id,name:n.lb||n.name||n.nm||n.id,expires:n.expires})}})}
  checkNodes(ATLAS_NODES,"atlas");checkNodes(TREE,"tree");checkNodes(HUMANS,"humans");checkNodes(TRENDS,"trends");
  var hasStale=stale.length>0;$("health-btn").classList.toggle("has-stale",hasStale);
  var html='<div class="hp-section"><h4>Manifest</h4>';
  html+='<div class="hp-stat"><span>Version</span><b>'+esc(MANIFEST.version)+"</b></div>";
  html+='<div class="hp-stat"><span>Data vintage</span><b>'+esc(MANIFEST.data_vintage)+"</b></div>";
  Object.keys(MANIFEST.counts).forEach(function(k){html+='<div class="hp-stat"><span>'+k+'</span><b>'+MANIFEST.counts[k]+"</b></div>"});
  html+="</div>";
  html+='<div class="hp-section"><h4>Stale nodes ('+stale.length+')</h4>';
  if(!stale.length)html+='<div class="hp-item" style="color:var(--min)">All nodes within review window ✓</div>';
  stale.slice(0,20).forEach(function(s){html+='<div class="hp-item"><b>'+esc(s.name||s.id)+'</b><span class="stale-badge">STALE</span><br><span style="font-size:9px">'+esc(s.reg)+" · vintage "+esc(s.vintage||"unknown")+"</span></div>"});
  html+="</div>";
  if(expired.length){html+='<div class="hp-section"><h4>Expired nodes</h4>';expired.forEach(function(e){html+='<div class="hp-item"><b>'+esc(e.name)+'</b><br><span style="font-size:9px">expired '+esc(e.expires)+"</span></div>"});html+="</div>"}
  var resolvable=forecasts.filter(function(f){return f.outcome===null&&f.dl&&new Date(f.dl)<new Date()});
  if(resolvable.length){html+='<div class="hp-section"><h4>Forecasts past deadline ('+resolvable.length+')</h4>';resolvable.forEach(function(f){html+='<div class="hp-item"><b>'+esc(f.stmt.slice(0,50))+'</b><br><span style="font-size:9px">deadline: '+esc(f.dl)+"</span></div>"});html+="</div>"}
  html+='<div class="hp-section"><h4>Maintenance prompts</h4><div style="font-size:10px;color:var(--dim);line-height:1.6">Paste into a new AI session:<br><div style="margin:6px 0;padding:5px 8px;background:#111111;border:1px solid var(--line);font-size:9px">Refresh stale: open Data Health, re-verify every stale node, update vintages, bump meta.json version.</div></div></div>';
  $("health-body").innerHTML=html;
}

// ── ONBOARDING ────────────────────────────────────────────────────────────
function checkOnboarding(){var seen=storage.getItem("sv3-onboard-seen");if(!seen)$("onboard").style.display="flex";else $("onboard").style.display="none"}
$("onboard-dismiss").onclick=function(){storage.setItem("sv3-onboard-seen","1");$("onboard").style.display="none"};

// ── INIT ──────────────────────────────────────────────────────────────────
window.addEventListener("resize",function(){if($("v-atlas").classList.contains("on"))resize()});
buildLegend();buildConstraints();buildScenarios();buildMethod();buildHumans();buildTrends();
loadForecasts();renderForecasts();checkOnboarding();
updateFreshnessMeter();buildPatrol();
requestAnimationFrame(function(){resize();kick()});
setTimeout(buildTreeIfNeeded,500);
// Wire freshness meter click → health panel
(function(){var fm=$("freshness-meter");if(fm)fm.onclick=openHealth})();

// ── ROUTER INTEGRATION ────────────────────────────────────────────────────
// Override tab clicks to go through Router so the URL updates
document.querySelectorAll("#tabs .tab").forEach(function(t){t.onclick=function(){Router.navigate(t.dataset.v,{})}});
Router.on(function(path,params){
  var sections=["atlas","tree","humans","trends","constraints","forecasts","method","patrol"];
  if(sections.indexOf(path)!==-1)switchTab(path);
  if(params&&params.open){
    var m=params.open.match(/^(atlas|tree|human|window)\.(.+)$/);
    if(m){var regMap={atlas:"atlas",tree:"tree",human:"human",window:"trend"};setTimeout(function(){openDossier(regMap[m[1]],m[2])},150)}
  }
});

// v2 hash format support: #atlas:id, #tree:id, #human:id, #trend:id
(function(){
  var m=location.hash.match(/^#(atlas|tree|human|trend):([a-z0-9_-]+)$/);
  if(!m)return;
  var reg=m[1],id=m[2];
  switchTab({atlas:"atlas",tree:"tree",human:"humans",trend:"trends"}[reg]);
  setTimeout(function(){if(reg==="tree"){buildTreeIfNeeded();selectTreeNode(id)}else openDossier(reg,id,false)},120);
})();

// ── PHASE 1: STALENESS BANNERS · CONNECTIONS · PATROL · TRACE · CMD-K V2 ──

// ── Staleness banner ──────────────────────────────────────────────────────
function staleBannerHTML(storeId){
  var s=Store.staleStatus(storeId);
  if(s==="fresh"||s==="unknown")return"";
  var e=Store.get(storeId)||{};
  var asOf=(e.as_of||"").slice(0,7)||"?";
  var cls=s==="stale"?"stale":"aging";
  var msg=s==="stale"?"PAST HALF-LIFE · VERIFY BEFORE TRUSTING":"APPROACHING HALF-LIFE · REVIEW SOON";
  return'<div class="stale-banner '+cls+'">LAST CONFIRMED '+asOf+' · '+msg+'<button class="mark-verified-btn" onclick="markVerified(\''+storeId+'\')">MARK VERIFIED</button></div>';
}
function markVerified(storeId){
  var ovr=JSON.parse(storage.getItem("sv3-overrides")||"{}");
  ovr[storeId]=Object.assign({},ovr[storeId]||{},{as_of:new Date().toISOString().slice(0,10)});
  Store._overrides=ovr;
  storage.setItem("sv3-overrides",JSON.stringify(ovr));
  if(dossierCurrent)openDossier(dossierCurrent.reg,dossierCurrent.id,false);
  updateFreshnessMeter();
}
window.markVerified=markVerified;

// ── Connections panel ─────────────────────────────────────────────────────
function renderConnections(storeId){
  var nb=Store.neighbors(storeId);
  if(!nb.out.length&&!nb.in.length)return"";
  var byRel={};
  nb.out.forEach(function(e){if(!byRel[e.rel])byRel[e.rel]={out:[],in:[]};byRel[e.rel].out.push(e.to)});
  nb.in.forEach(function(e){if(!byRel[e.rel])byRel[e.rel]={out:[],in:[]};byRel[e.rel].in.push(e.from)});
  var html='<div class="dsec connections-panel"><div class="k">CONNECTIONS</div><div class="connections-body">';
  Object.keys(byRel).forEach(function(rel){
    var grp=byRel[rel];var relLabel=rel.replace(/_/g," ");
    if(grp.out.length){
      html+='<div class="edge-group"><div class="edge-rel edge-out">'+esc(relLabel.toUpperCase())+' →</div><div class="chip-list">';
      grp.out.forEach(function(sid){var info=fromStoreId(sid);if(!info)return;var e2=Store.get(sid);var nm=e2?(e2.title||sid):sid;html+='<span class="xchip" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc(nm)+"</span>"});
      html+="</div></div>";
    }
    if(grp.in.length){
      html+='<div class="edge-group"><div class="edge-rel edge-in">← '+esc(relLabel.toUpperCase())+'</div><div class="chip-list">';
      grp.in.forEach(function(sid){var info=fromStoreId(sid);if(!info)return;var e2=Store.get(sid);var nm=e2?(e2.title||sid):sid;html+='<span class="xchip" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc(nm)+"</span>"});
      html+="</div></div>";
    }
  });
  return html+"</div></div>";
}

// ── Freshness meter ───────────────────────────────────────────────────────
function updateFreshnessMeter(){
  var s=Store.freshnessSummary();
  var total=s.fresh+s.aging+s.stale;if(!total)return;
  var freshPct=Math.round(s.fresh/total*100);
  var el=$("freshness-meter");
  if(el){el.textContent=freshPct+"%F · "+s.stale+"S";el.className="freshness-meter"+(s.stale>10?" has-issues":"")}
}

// ── Signal Patrol ─────────────────────────────────────────────────────────
function getSignalOverride(entityId,sigLabel){
  var ovr=Store._overrides||{};
  if(ovr[entityId]&&ovr[entityId].signal_overrides&&ovr[entityId].signal_overrides[sigLabel])return ovr[entityId].signal_overrides[sigLabel].last_checked;
  return null;
}
function getSignalExtraLogs(entityId,sigLabel){
  var ovr=Store._overrides||{};
  if(ovr[entityId]&&ovr[entityId].signal_logs&&ovr[entityId].signal_logs[sigLabel])return ovr[entityId].signal_logs[sigLabel];
  return null;
}

function buildPatrol(){
  var rows=[];var today=Date.now();
  Store.all().forEach(function(e){
    if(!e.signals||!e.signals.length)return;
    var info=fromStoreId(e.id);if(!info)return;
    e.signals.forEach(function(sig){
      var lc=getSignalOverride(e.id,sig.label)||sig.last_checked;
      var lastMs=lc?new Date(lc).getTime():0;
      var elapsed=(today-lastMs)/86400000;
      var overdue=Math.round(elapsed-sig.cadence_days);
      rows.push({entity:e,info:info,sig:sig,elapsed:Math.round(elapsed),overdue:overdue,lc:lc,extraLogs:getSignalExtraLogs(e.id,sig.label)});
    });
  });
  rows.sort(function(a,b){return b.overdue-a.overdue});

  var dueCount=rows.filter(function(r){return r.overdue>0}).length;
  var badge=$("patrol-badge");if(badge)badge.textContent=dueCount>0?"PATROL: "+dueCount+" DUE":"";
  var tab=document.querySelector('.tab[data-v="patrol"]');if(tab)tab.classList.toggle("has-badge",dueCount>0);

  var container=$("patrol-table");if(!container)return;
  if(!rows.length){container.innerHTML='<div style="padding:40px;color:var(--faint);font-size:11px">No signals seeded in data/*.json.</div>';return}

  var html='<table class="patrol-tbl"><thead><tr><th>SIGNAL</th><th>ENTITY</th><th>CADENCE</th><th>LAST CHECKED</th><th>STATUS</th><th></th></tr></thead><tbody>';
  rows.forEach(function(r){
    var od=r.overdue;
    var cls=od>r.sig.cadence_days*2?"patrol-critical":od>0?"patrol-overdue":od>-7?"patrol-due":"patrol-ok";
    var statusTxt=od>r.sig.cadence_days*2?"CRITICAL +"+od+"d":od>0?"OVERDUE +"+od+"d":od>-7?"DUE SOON":"OK";
    var latestLog=r.sig.log&&r.sig.log.length?r.sig.log[r.sig.log.length-1]:null;
    if(r.extraLogs&&r.extraLogs.length)latestLog=r.extraLogs[r.extraLogs.length-1];
    var logTxt=latestLog?'<div class="patrol-log-latest">'+esc(latestLog.date)+": "+esc((latestLog.note||"").slice(0,80))+"</div>":"";
    var sigUrl=r.sig.url?'<a href="'+esc(r.sig.url)+'" target="_blank" rel="noopener noreferrer" class="patrol-signal-link">'+esc(r.sig.label)+"</a>":esc(r.sig.label);
    html+='<tr class="patrol-row '+cls+'">';
    html+='<td class="patrol-signal">'+sigUrl+"</td>";
    html+='<td><span class="xchip" data-reg="'+r.info.reg+'" data-id="'+r.info.id+'">'+esc(r.entity.title)+"</span></td>";
    html+='<td class="patrol-num">'+r.sig.cadence_days+"d</td>";
    html+='<td class="patrol-num">'+esc(r.lc||"—")+"</td>";
    html+='<td><span class="patrol-status '+cls+'">'+statusTxt+"</span></td>";
    html+='<td class="patrol-log-cell">'+logTxt+'<button class="patrol-log-btn btn" data-sid="'+esc(r.entity.id)+'" data-sig="'+esc(r.sig.label)+'">LOG CHECK</button></td>';
    html+="</tr>";
  });
  html+="</tbody></table>";
  container.innerHTML=html;
  attachChipNavigation();
  container.querySelectorAll(".patrol-log-btn").forEach(function(btn){btn.onclick=function(){showLogForm(btn,btn.dataset.sid,btn.dataset.sig)}});
}

function showLogForm(btn,storeId,sigLabel){
  var existing=btn.parentNode.querySelector(".patrol-log-form");if(existing){existing.remove();return}
  var form=document.createElement("div");form.className="patrol-log-form";
  form.innerHTML='<input class="patrol-log-input" type="text" placeholder="What did you find?…"><button class="patrol-log-submit btn">LOG</button>';
  btn.parentNode.insertBefore(form,btn.nextSibling);
  var inp=form.querySelector(".patrol-log-input");inp.focus();
  form.querySelector(".patrol-log-submit").onclick=function(){var note=inp.value.trim();if(!note)return;logSignalCheck(storeId,sigLabel,note);buildPatrol()};
  inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();var note=inp.value.trim();if(note){logSignalCheck(storeId,sigLabel,note);buildPatrol()}}if(e.key==="Escape")form.remove()});
}

function logSignalCheck(storeId,sigLabel,note){
  var ovr=JSON.parse(storage.getItem("sv3-overrides")||"{}");
  if(!ovr[storeId])ovr[storeId]={};
  if(!ovr[storeId].signal_logs)ovr[storeId].signal_logs={};
  if(!ovr[storeId].signal_overrides)ovr[storeId].signal_overrides={};
  var today=new Date().toISOString().slice(0,10);
  if(!ovr[storeId].signal_logs[sigLabel])ovr[storeId].signal_logs[sigLabel]=[];
  ovr[storeId].signal_logs[sigLabel].push({date:today,note:note});
  ovr[storeId].signal_overrides[sigLabel]={last_checked:today};
  Store._overrides=ovr;storage.setItem("sv3-overrides",JSON.stringify(ovr));
}

// ── Improved Cmd+K: Store.search + action commands + recent jumps ─────────
function getRecentJumps(){try{return JSON.parse(storage.getItem("sv3-recent")||"[]")}catch(e){return[]}}
function addRecentJump(reg,id,name){
  var r=getRecentJumps().filter(function(x){return!(x.reg===reg&&x.id===id)});
  r.unshift({reg:reg,id:id,name:name,ts:Date.now()});
  storage.setItem("sv3-recent",JSON.stringify(r.slice(0,10)));
}
var ACTION_CMDS=[
  {reg:"action",id:"patrol",name:"⊕ PATROL — Signal check queue",sub:"View overdue signals"},
  {reg:"action",id:"trace",name:"⊕ TRACE — Path between two nodes",sub:"BFS path up to 6 hops"},
  {reg:"action",id:"health",name:"⊕ DATA HEALTH — Freshness report",sub:"Stale entity list"}
];
function searchAllv2(q){
  if(!q||!q.trim()){
    var recent=getRecentJumps().map(function(r){return{reg:r.reg,id:r.id,name:r.name,sub:"Recently visited"}});
    return ACTION_CMDS.concat(recent).slice(0,16);
  }
  var res=Store.search(q);
  var subDesc={atlas:"Atlas",tree:"Tree",human:"Person",window:"Trend"};
  return res.map(function(r){var info=fromStoreId(r.id);if(!info)return null;return{reg:info.reg,id:info.id,name:r.title,sub:(subDesc[r.type]||r.type)+" · "+r.snippet.slice(0,60)}}).filter(Boolean).slice(0,16);
}

// ── Trace Panel ───────────────────────────────────────────────────────────
function buildTraceSuggest(inputEl,resultEl,onSelect){
  if(!inputEl||!resultEl)return;
  inputEl.addEventListener("input",function(){
    var q=inputEl.value.trim();if(!q){resultEl.innerHTML="";return}
    var res=Store.search(q).slice(0,8);
    resultEl.innerHTML=res.map(function(r){var info=fromStoreId(r.id);if(!info)return"";return'<div class="trace-sug-item" data-sid="'+esc(r.id)+'" data-nm="'+esc(r.title)+'">'+esc(r.title)+"</div>"}).join("");
    resultEl.querySelectorAll(".trace-sug-item").forEach(function(el){el.onclick=function(){inputEl.value=el.dataset.nm;inputEl.dataset.sid=el.dataset.sid;resultEl.innerHTML="";if(onSelect)onSelect(el.dataset.sid)}});
  });
  inputEl.addEventListener("blur",function(){setTimeout(function(){resultEl.innerHTML=""},200)});
}

function runTrace(){
  var inA=$("trace-a"),inB=$("trace-b"),res=$("trace-result");if(!inA||!inB||!res)return;
  var a=inA.dataset.sid||toStoreId("atlas",inA.value.trim());
  var b=inB.dataset.sid||toStoreId("atlas",inB.value.trim());
  if(!Store.get(a)||!Store.get(b)){res.innerHTML='<span style="color:var(--faint);font-size:11px">Entity not found — select from the dropdown</span>';return}
  var path=Store.trace(a,b,6);
  if(!path){res.innerHTML='<span style="color:var(--faint);font-size:11px">No path within 6 hops</span>';return}
  var html=path.map(function(hop,i){
    var e=Store.get(hop.id);var nm=e?(e.title||hop.id):hop.id;
    var info=fromStoreId(hop.id);
    var chip=info?'<span class="xchip trace-hop" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc(nm)+"</span>":'<span class="trace-hop-plain">'+esc(nm)+"</span>";
    var edge=i>0&&hop.rel?'<span class="trace-edge">'+(hop.dir||"→")+" "+esc(hop.rel)+" </span>":"";
    return edge+chip;
  }).join("");
  res.innerHTML=html;attachChipNavigation();
}

(function(){
  var tp=$("trace-panel");if(!tp)return;
  var go=$("trace-go");if(go)go.onclick=runTrace;
  var cls=$("trace-close-btn");if(cls)cls.onclick=function(){tp.classList.remove("open")};
  buildTraceSuggest($("trace-a"),$("trace-suggest-a"),null);
  buildTraceSuggest($("trace-b"),$("trace-suggest-b"),null);
  [$("trace-a"),$("trace-b")].forEach(function(inp){if(inp)inp.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();runTrace()}})});
})();

})(); // end engine IIFE
} // end initApp
