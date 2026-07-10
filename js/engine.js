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
  return{title:c.title,lead_time:c.lead_time,cost:c.cost,bottleneck:c.bottleneck,signal:c.signal,
    lead_min_yr:c.lead_min_yr||0,lead_max_yr:c.lead_max_yr||0,id:c.id||""};
});

var GRAVEYARD=(Store.raw.graveyard.graveyard||[]);
var THESES=(Store.raw.theses.theses||[]);

var SCENARIOS=(Store.raw.scenarios.scenarios||[]).map(function(s){
  return{id:s.id.replace(/^scenario\./,""),nm:s.title,d:s.body||"",
    ly:s.layers||[],
    trace:(s.trace||[]).map(function(id){return id.replace(/^atlas\./,"");})};
});

var DEMO=Store.raw.constraints.demography||{};

// Named CTRY_LIST, not COUNTRIES - the atlas map already has its own COUNTRIES
// var (WORLD_RAW-derived polygon centroids for the demography choropleth,
// see below) in this same scope; reusing the name silently clobbered it.
var CTRY_LIST=(Store.raw.countries&&Store.raw.countries.countries)||[];
var COUNTRY_MAP={};CTRY_LIST.forEach(function(c){COUNTRY_MAP[c.iso]=c});

var LEDGER_DOMAINS=(Store.raw.ledger&&Store.raw.ledger.domains)||[];

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

// ── ORRERY: procedural starfield, parallax on atlas pan ──────────────────
var starfieldPan=function(){}; // reassigned below once the canvas is set up
(function(){
  var cv=$("starfield");if(!cv)return;
  var sctx=cv.getContext("2d");
  var sW=0,sH=0,sDPR=1,stars=[];
  function sResize(){
    sW=window.innerWidth;sH=window.innerHeight;sDPR=Math.min(2,window.devicePixelRatio||1);
    cv.width=sW*sDPR;cv.height=sH*sDPR;cv.style.width=sW+"px";cv.style.height=sH+"px";
    sctx.setTransform(sDPR,0,0,sDPR,0,0);
    seedStars();
  }
  function seedStars(){
    var n=Math.min(420,Math.round((sW*sH)/9000));
    stars=[];
    for(var i=0;i<n;i++){
      var layer=Math.random()<0.65?1:(Math.random()<0.85?2:3);
      stars.push({x:Math.random()*sW,y:Math.random()*sH,r:Math.random()*1.15+.2,
        a:Math.random()*.45+.12,tw:Math.random()*Math.PI*2,layer:layer});
    }
  }
  var parX=0,parY=0;
  function sDraw(now){
    sctx.clearRect(0,0,sW,sH);
    for(var i=0;i<stars.length;i++){
      var s=stars[i];
      var shift=s.layer===1?.12:s.layer===2?.3:.55;
      var x=(s.x+parX*shift)%sW;if(x<0)x+=sW;
      var y=(s.y+parY*shift)%sH;if(y<0)y+=sH;
      var flick=motionOK?(Math.sin(now*.0006+s.tw)*.25+.75):1;
      sctx.beginPath();sctx.arc(x,y,s.r,0,7);
      sctx.fillStyle="rgba(240,240,245,"+(s.a*flick).toFixed(3)+")";
      sctx.fill();
    }
  }
  var sRaf=0;
  function sLoop(t){sDraw(t);if(motionOK)sRaf=requestAnimationFrame(sLoop)}
  // resizing a <canvas> (via .width/.height) always clears its bitmap — repaint
  // immediately after, or a reduced-motion session (no rAF loop) is left blank.
  window.addEventListener("resize",function(){sResize();sDraw(performance.now())});
  sResize();sDraw(0);
  if(motionOK)sRaf=requestAnimationFrame(sLoop);
  starfieldPan=function(dx,dy){parX-=dx*.02;parY-=dy*.02;if(!motionOK)sDraw(performance.now())};
})();
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
  var m=sid.match(/^(atlas|tree|human|window|country)\.(.+)$/);
  if(!m)return null;
  var rm={atlas:"atlas",tree:"tree",human:"human",window:"trend",country:"country"};
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
  else if(reg==="ledger")renderLedgerDossier(id);
  else if(reg==="country")renderCountryDossier(id);
  var invertBtn=$("invert-btn");if(invertBtn)invertBtn.style.display=(reg==="country")?"none":"";
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
// Generalizes the atlas/tree/human/window xchip pattern already inlined in
// buildThesisRegister's `supports` mapping, plus a constraint.* branch, for
// use anywhere a mixed-registry id list needs clickable chips (currently:
// the Countries dossier's links[]).
function xchipFor(sid){
  var info=fromStoreId(sid);
  if(info){
    var e2=Store.get(sid);var nm=e2?(e2.title||sid):sid;
    return'<span class="xchip" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc(nm)+"</span>";
  }
  if(sid.indexOf("constraint.")===0){
    var cid=sid.replace("constraint.","");
    var cm=CONSTRAINTS.filter(function(c){return c.id===sid||c.id===cid})[0];
    var cnm=cm?cm.title:cid.replace(/-/g," ");
    return'<span class="xchip" style="cursor:default;color:var(--faint)">'+esc(cnm)+"</span>";
  }
  return'<span class="xchip" style="cursor:default;color:var(--faint)">'+esc(sid)+"</span>";
}
function renderCountryDossier(iso){
  var p=DEMO[iso],nm=NAMES[iso]||iso;
  var rich=COUNTRY_MAP[iso];
  setDHead(rich?"Country":"Demography 2025→2050",p<0?"var(--enr)":"var(--min)",nm,iso+" &nbsp;"+confPill("md"));
  var verdict=p<=-20?"Severe contraction. Labor scarcity, fiscal strain, automation becomes existential.":p<0?"Shrinking workforce. Growth must come entirely from productivity.":p<20?"Roughly stable. Institutions decide everything.":p<50?"Expanding workforce. Demographic dividend available — IF jobs, education, capital arrive.":"Explosive growth. Labor supply and instability risk live here simultaneously.";
  var b='<div style="font-size:28px;font-weight:600;color:'+(p<0?"var(--enr)":"var(--min)")+';padding:14px 0 6px">'+(p>0?"+":"")+p+"%</div>";
  b+=makeDSec("WORKING-AGE (15–64) 2025→2050",verdict);
  b+=makeDSec("WHY THIS IS RELIABLE","2050's workers are already born. Fertility shifts only move the tail. UN WPP 2024 medium variant.");
  if(rich){
    var dyn=rich.dynamics;
    var TRAJ_WORD={rising:"RISING",declining:"DECLINING",flat:"FLAT"};
    var gaugesHtml=["energy","chips","fiscal","stability"].map(function(k){
      var v=dyn[k];if(!v)return"";
      return'<div class="ctry-gauge-row"><div class="ctry-gauge-lbl">'+k+'</div><div class="ctry-gauge-track"><div class="ctry-gauge-fill" style="width:'+v.score+'%"></div></div><div class="ctry-gauge-val">'+v.score+'</div></div>'
        +'<div style="font-size:10px;color:var(--dim);margin:2px 0 8px 64px">'+esc(v.note)+'</div>';
    }).join("");
    b+=makeDSec("DYNAMICS — "+(TRAJ_WORD[dyn.trajectory]||dyn.trajectory.toUpperCase()),gaugesHtml);
    if(rich.gov_focus&&rich.gov_focus.length){
      var DIR_ARROW={up:"↑",down:"↓",flat:"→"};
      var gfHtml=rich.gov_focus.map(function(g){
        return'<div style="margin-bottom:8px"><b style="color:var(--txt)">'+esc(g.vector)+'</b> <span style="color:var(--rust)">'+(DIR_ARROW[g.direction]||"")+" "+g.intensity_0_100+'/100</span><br><span style="font-size:11px;color:var(--dim)">'+esc(g.basis)+'</span></div>';
      }).join("");
      b+=makeDSec("GOV FOCUS",gfHtml);
    }
    if(rich.flows&&rich.flows.length){
      var flHtml=rich.flows.map(function(f){
        var toNm=NAMES[f.to_iso]||f.to_iso;
        return'<div style="margin-bottom:8px"><b style="color:var(--txt)">'+esc(f.type.toUpperCase())+'</b> — '+esc(f.direction||(iso+" → "+f.to_iso))+' <span style="color:var(--dim)">('+f.magnitude_0_100+'/100 toward '+esc(toNm)+')</span><br><span style="font-size:11px;color:var(--dim)">'+esc(f.basis)+'</span></div>';
      }).join("");
      b+=makeDSec("FLOWS",flHtml);
    }
    if(rich.links&&rich.links.length)b+=makeDSec("LINKED",rich.links.map(xchipFor).join(""));
    b+=makeDSec("SOURCING",rich.as_of+" — confidence: "+rich.confidence.toUpperCase()+". Scores above are an editorial synthesis with a stated basis per field, not measured statistics — treat as directional.");
  }
  $("dbody").innerHTML=b;
  if(rich)attachChipNavigation();
}
function attachChipNavigation(){document.querySelectorAll(".xchip").forEach(function(el){el.onclick=function(){openDossier(el.dataset.reg,el.dataset.id,true)}})}

// ── COUNTRIES (World → Countries lens) ────────────────────────────────────
var ctryState={lens:"dynamics",sort:"name",flowFilter:""};
var CTRY_TRAJ_ARROW={rising:"↑",declining:"↓",flat:"→"};
function ctrySorted(){
  var key=ctryState.sort;
  return CTRY_LIST.slice().sort(function(a,b){
    if(key==="name")return a.name.localeCompare(b.name);
    if(key==="demography")return(b.dynamics.demography.pct_change_2025_2050||0)-(a.dynamics.demography.pct_change_2025_2050||0);
    var av=(a.dynamics[key]&&a.dynamics[key].score)||0,bv=(b.dynamics[key]&&b.dynamics[key].score)||0;
    return bv-av;
  });
}
function renderCountriesDynamics(){
  var el=$("ctry-dynamics");if(!el)return;
  el.innerHTML=ctrySorted().map(function(c){
    var dyn=c.dynamics;
    var gauges=["energy","chips","fiscal","stability"].map(function(k){
      var v=dyn[k];if(!v)return"";
      return'<div class="ctry-gauge-row"><div class="ctry-gauge-lbl">'+k+'</div><div class="ctry-gauge-track"><div class="ctry-gauge-fill" style="width:'+v.score+'%"></div></div><div class="ctry-gauge-val">'+v.score+'</div></div>';
    }).join("");
    var demo=dyn.demography,pct=demo.pct_change_2025_2050;
    return'<div class="ctry-card" data-iso="'+c.iso+'">'
      +'<div class="ctry-card-hd"><div><div class="ctry-card-nm">'+esc(c.name)+'</div><div class="ctry-card-iso">'+c.iso+'</div></div>'
      +'<div class="ctry-card-traj '+dyn.trajectory+'" title="Trajectory: '+dyn.trajectory+'">'+(CTRY_TRAJ_ARROW[dyn.trajectory]||"→")+'</div></div>'
      +gauges
      +'<div class="ctry-card-demo"><b>DEMOGRAPHY</b> '+(pct>0?"+":"")+pct+'% working-age by 2050</div>'
      +'</div>';
  }).join("");
  el.querySelectorAll(".ctry-card").forEach(function(card){card.onclick=function(){openDossier("country",card.dataset.iso)}});
}
function renderCountriesGovFocus(){
  var el=$("ctry-govfocus");if(!el)return;
  var vecCount={};
  CTRY_LIST.forEach(function(c){(c.gov_focus||[]).forEach(function(g){vecCount[g.vector]=(vecCount[g.vector]||0)+1})});
  var vectors=Object.keys(vecCount).sort(function(a,b){return vecCount[b]-vecCount[a]});
  var DIR_ARROW={up:"↑",down:"↓",flat:"→"};
  var html='<table class="ctry-heat-table"><thead><tr><th class="ctry-heat-rowhd">COUNTRY</th>'
    +vectors.map(function(v){return"<th>"+esc(v)+"</th>"}).join("")+"</tr></thead><tbody>";
  CTRY_LIST.forEach(function(c){
    html+='<tr><td class="ctry-heat-rownm" data-iso="'+c.iso+'">'+esc(c.name)+"</td>";
    vectors.forEach(function(v){
      var g=(c.gov_focus||[]).filter(function(x){return x.vector===v})[0];
      if(!g){html+='<td class="ctry-heat-cell"><div class="ctry-heat-empty"></div></td>';return}
      var alpha=(g.intensity_0_100/100*.85+.1).toFixed(2);
      html+='<td class="ctry-heat-cell" title="'+esc(c.name+" — "+v+": "+g.intensity_0_100+"/100, "+g.direction+". "+g.basis)+'">'
        +'<div class="ctry-heat-fill" style="background:rgba(193,68,14,'+alpha+')">'+(DIR_ARROW[g.direction]||"")+"</div></td>";
    });
    html+="</tr>";
  });
  html+="</tbody></table>";
  el.innerHTML=html;
  el.querySelectorAll(".ctry-heat-rownm").forEach(function(td){td.onclick=function(){openDossier("country",td.dataset.iso)}});
}
// Lightweight equirectangular SVG projection (lon/lat linear, no pan/zoom) —
// deliberately not the atlas canvas's own px(lon)/py(lat), which are tied to
// that canvas's specific pan/zoom transform state and would need reverse-
// engineering to reuse from a different view. Twelve fixed points don't need
// a navigable map; this borrows the atlas's visual language (dashed animated
// arcs, motionOK-gated) rather than its rendering machinery.
var CTRY_FLOW_COLORS={chips:"#54cfe0",energy:"#ff7152",capital:"#d8c186",reserves:"#b3a0f2",talent:"#7fd394"};
function ctryFlowsSVG(){
  var W=1000,H=460,PAD=20;
  function xOf(lon){return PAD+(lon+180)/360*(W-PAD*2)}
  function yOf(lat){return PAD+(90-lat)/180*(H-PAD*2)}
  var svg='<svg id="ctry-flows-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">';
  var lon,lat;
  for(lon=-180;lon<=180;lon+=30)svg+='<line class="ctry-flow-grid" x1="'+xOf(lon)+'" y1="'+PAD+'" x2="'+xOf(lon)+'" y2="'+(H-PAD)+'"></line>';
  for(lat=-60;lat<=90;lat+=30)svg+='<line class="ctry-flow-grid" x1="'+PAD+'" y1="'+yOf(lat)+'" x2="'+(W-PAD)+'" y2="'+yOf(lat)+'"></line>';
  var byIso={};CTRY_LIST.forEach(function(c){byIso[c.iso]=c});
  CTRY_LIST.forEach(function(c){
    (c.flows||[]).forEach(function(f){
      if(ctryState.flowFilter&&f.type!==ctryState.flowFilter)return;
      var to=byIso[f.to_iso];if(!to)return;
      var x1=xOf(c.lon),y1=yOf(c.lat),x2=xOf(to.lon),y2=yOf(to.lat);
      var mx=(x1+x2)/2,my=(y1+y2)/2-30;
      var col=CTRY_FLOW_COLORS[f.type]||"#888888";
      var w=(.6+f.magnitude_0_100/100*2.4).toFixed(2);
      svg+='<path class="ctry-flow-arc'+(motionOK?" animated":"")+'" d="M'+x1+","+y1+" Q"+mx+","+my+" "+x2+","+y2+'" stroke="'+col+'" stroke-width="'+w+'"><title>'+esc(c.name+" → "+to.name+" ("+f.type+", "+f.magnitude_0_100+"/100): "+f.basis)+"</title></path>";
    });
  });
  CTRY_LIST.forEach(function(c){
    var dx=xOf(c.lon),dy=yOf(c.lat);
    // the <g> itself has no geometry to hit-test - a click landing in the gap
    // between the visible dot and its text label would otherwise miss both.
    // This invisible circle gives the whole marker a real, comfortable target.
    svg+='<g class="ctry-flow-dot" data-iso="'+c.iso+'"><circle class="ctry-flow-hit" cx="'+dx+'" cy="'+dy+'" r="11" fill="transparent"></circle>'
      +'<circle class="ctry-flow-mark" cx="'+dx+'" cy="'+dy+'" r="4" fill="var(--rust)"></circle>'
      +'<text class="ctry-flow-label" x="'+(dx+7)+'" y="'+(dy+3)+'">'+esc(c.iso)+"</text></g>";
  });
  svg+="</svg>";
  return svg;
}
function renderCountriesFlows(){
  var desktop=$("ctry-flows-desktop"),mobileNote=$("ctry-flows-mobile-note");
  if(!desktop||!mobileNote)return;
  // A spatial SVG map with 12 fixed points is still cramped and hard to read
  // at phone width - same reasoning as gating Atlas/Tree behind a desktop
  // notice, just scoped to this one lens rather than the whole view (Dynamics
  // and Gov Focus are plain grids/tables and work fine on mobile).
  if(isMobile()){desktop.style.display="none";mobileNote.style.display="block";return}
  desktop.style.display="";mobileNote.style.display="none";
  var el=$("ctry-flows-svg");if(!el)return;
  el.outerHTML=ctryFlowsSVG();
  var newSvg=document.getElementById("ctry-flows-svg");
  if(newSvg)newSvg.querySelectorAll(".ctry-flow-dot").forEach(function(g){g.onclick=function(){openDossier("country",g.dataset.iso)}});
}
var ctryBuilt=false;
function buildCountries(){renderCountriesDynamics();renderCountriesGovFocus();renderCountriesFlows();ctryBuilt=true}
(function(){
  var lensBtns=document.querySelectorAll("#ctry-lenses .ttool");if(!lensBtns.length)return;
  var panels={dynamics:$("ctry-dynamics"),govfocus:$("ctry-govfocus"),flows:$("ctry-flows")};
  var sortWrap=$("ctry-sort"),flowWrap=$("ctry-flow-filter");
  lensBtns.forEach(function(b){
    b.onclick=function(){
      ctryState.lens=b.dataset.lens;
      lensBtns.forEach(function(x){x.classList.toggle("on",x===b)});
      Object.keys(panels).forEach(function(k){if(panels[k])panels[k].style.display=k===ctryState.lens?"":"none"});
      if(sortWrap)sortWrap.style.display=ctryState.lens==="dynamics"?"flex":"none";
      if(flowWrap)flowWrap.style.display=(ctryState.lens==="flows"&&!isMobile())?"flex":"none";
      if(ctryState.lens==="flows")renderCountriesFlows();
    };
  });
  document.querySelectorAll("#ctry-sort .ttool").forEach(function(b){
    b.onclick=function(){
      ctryState.sort=b.dataset.sort;
      document.querySelectorAll("#ctry-sort .ttool").forEach(function(x){x.classList.toggle("on",x===b)});
      renderCountriesDynamics();
    };
  });
  document.querySelectorAll("#ctry-flow-filter .ttool").forEach(function(b){
    b.onclick=function(){
      ctryState.flowFilter=b.dataset.flow;
      document.querySelectorAll("#ctry-flow-filter .ttool").forEach(function(x){x.classList.toggle("on",x===b)});
      renderCountriesFlows();
    };
  });
})();

// ── IA: 5 top-level tabs, each fronting a set of existing full-page views ──
// Every existing .view element (v-atlas, v-tree, v-ledger, ...) keeps its own
// id and is toggled by the exact same ".view.on" mechanism as before - nothing
// about how a view renders or animates changed. This layer only decides WHICH
// child view is visible under which top-level tab, so every $("v-atlas")-style
// check scattered through this file (animation gates, resize handlers, etc.)
// keeps working untouched. switchTab(v) still accepts either a parent id
// (today/world/trends/thesis/lab) or a child id (atlas/tree/humans/...) -
// existing call sites that pass a child id directly need no changes.
var PARENT_CHILDREN={
  today:["today"],
  world:["atlas","countries","tree"],
  trends:["everything","trajectory","ledger","windows"],
  thesis:["thesis","humans","forecasts"],
  lab:["simulate","constraints","patrol","method"]
};
var CHILD_LABEL={
  atlas:"Atlas",tree:"Tree",countries:"Countries",
  everything:"Everything",trajectory:"Trajectory",ledger:"Ledger",windows:"Windows",
  thesis:"Thesis",humans:"Humans",forecasts:"Forecasts",
  simulate:"Simulate",constraints:"Constraints",patrol:"Patrol",method:"Method"
};
var CHILD_PARENT={};
Object.keys(PARENT_CHILDREN).forEach(function(p){PARENT_CHILDREN[p].forEach(function(c){CHILD_PARENT[c]=p})});
function parentOf(v){return CHILD_PARENT[v]||v}
var lastChildForParent={}; // remembers which child was last shown per parent
function renderSubnav(parent){
  var kids=PARENT_CHILDREN[parent]||[];
  var el=$("subnav");if(!el)return;
  if(kids.length<=1){el.style.display="none";el.innerHTML="";return}
  el.style.display="flex";
  var active=lastChildForParent[parent]||kids[0];
  el.innerHTML=kids.map(function(c){return'<button class="ttool'+(c===active?" on":"")+'" data-child="'+c+'">'+esc(CHILD_LABEL[c]||c)+"</button>"}).join("");
  el.querySelectorAll("button").forEach(function(b){b.onclick=function(){Router.navigate(b.dataset.child,{})}});
}
// Legacy hash routes redirect to a specific child (not just "whatever the
// parent's own default is") so old deep links keep landing exactly where they
// used to, even though the parent tab's own fresh-click default may differ
// (e.g. clicking the Trends TAB defaults to Everything, but the old #/trends
// link — which meant the kanban/timeline/matrix board — still lands on Windows).
var LEGACY_ROUTE_CHILD={trends:"windows",brief:"today"};

// Keyboard nav
var TAB_ORDER=["today","world","trends","thesis","lab"];
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){
    closeDossier();closePalette();closeHealth();
    var ko=$("kbd-overlay");if(ko&&ko.style.display!=="none")ko.style.display="none";
    var pm=$("postmortem-modal");if(pm&&pm.style.display!=="none")pm.style.display="none";
  }
  if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();togglePalette()}
  if(e.target.matches&&e.target.matches("input,textarea,select"))return;
  if(e.key==="/"){e.preventDefault();$("nsearch").focus()}
  if(e.key==="?"){var ko=$("kbd-overlay");if(ko)ko.style.display=(ko.style.display==="none"?"flex":"none")}
  if(e.key==="j"||e.key==="k"){navigateEntities(e.key==="j"?1:-1)}
  var n=parseInt(e.key);
  if(n>=1&&n<=TAB_ORDER.length&&!e.ctrlKey&&!e.metaKey&&!e.altKey)switchTab(TAB_ORDER[n-1]);
});

var _entityNavIndex=-1;
function navigateEntities(dir){
  var current=document.querySelector(".view.on");if(!current)return;
  var vid=current.id;
  var items=[];
  if(vid==="v-atlas")items=ATLAS_NODES.map(function(n){return{reg:"atlas",id:n.id}});
  else if(vid==="v-tree")items=TREE.map(function(n){return{reg:"tree",id:n.id}});
  else if(vid==="v-humans")items=HUMANS.map(function(h){return{reg:"human",id:h.id}});
  else if(vid==="v-windows")items=TRENDS.map(function(t){return{reg:"trend",id:t.id}});
  else if(vid==="v-ledger")items=ledgerCurrentLayerKeys();
  if(!items.length)return;
  _entityNavIndex=Math.max(0,Math.min(items.length-1,_entityNavIndex+dir));
  var item=items[_entityNavIndex];openDossier(item.reg,item.id,false);
}

// Tabs
var MOBILE_BREAKPOINT=700;
function isMobile(){return window.innerWidth<MOBILE_BREAKPOINT}
function showMobileDesktopOnly(v){
  var parent=parentOf(v);
  document.querySelectorAll("#tabs .tab").forEach(function(t){t.classList.toggle("on",t.dataset.v===parent)});
  document.querySelectorAll(".view").forEach(function(vw){vw.classList.toggle("on",vw.id==="v-mobile-blocked")});
  renderSubnav(parent);
  var isAtlas=v==="atlas";
  $("mb-title").textContent=isAtlas?"Atlas — Desktop Only":"Tech Tree — Desktop Only";
  $("mb-body").innerHTML="<p>"+(isAtlas
    ?"The constraint map is a pan-and-zoom canvas built for a mouse and a wide screen. Open this page on a laptop or desktop to explore it."
    :"The tech tree is a wide horizontal graph meant to be read node by node on a large screen. Open this page on a laptop or desktop to explore causal chains.")
    +"</p><p>Everything else works on mobile — switch to another view in the row above, or head back to Today.</p>";
}
function switchTab(v){
  if(v==="helm"&&!HELM_PILOT){switchTab("today");return} // no pilot.json loaded — route stays dead, not just hidden
  var child=(v==="helm")?"helm":(PARENT_CHILDREN[v]?(lastChildForParent[v]||PARENT_CHILDREN[v][0]):v);
  var parent=(v==="helm")?"helm":parentOf(child);
  if(isMobile()&&(child==="atlas"||child==="tree")){lastChildForParent[parent]=child;showMobileDesktopOnly(child);return}
  lastChildForParent[parent]=child;
  document.querySelectorAll("#tabs .tab").forEach(function(t){t.classList.toggle("on",t.dataset.v===parent)});
  document.querySelectorAll(".view").forEach(function(vw){vw.classList.toggle("on",vw.id==="v-"+child)});
  renderSubnav(parent);
  if(child==="atlas"){if(atlasMode==="orbital"){resizeOrbital();if(motionOK&&!orbRaf)orbRaf=requestAnimationFrame(orbTick)}else{resize();kick()}}
  if(child==="trajectory")buildTrajectory();
  if(child==="ledger")buildLedger();
  if(child==="everything")buildEverything();
  if(child==="simulate")buildSimulate();
  if(child==="tree")buildTreeIfNeeded();
  if(child==="countries")buildCountries();
  if(child==="patrol")buildPatrol();
  if(child==="thesis")buildThesisRegister();
  if(child==="today")buildToday(); // now also renders the merged-in Brief section
}
(function(){var b=$("mb-back-btn");if(b)b.onclick=function(){Router.navigate("today",{})}})();
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
  ctx.lineWidth=1;ctx.strokeStyle="rgba(32,32,32,.6)";ctx.beginPath();
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
      ctx.fillStyle=(dv!==undefined)?demoFill(dv):"#111111";ctx.fill();
      ctx.strokeStyle="rgba(55,55,55,1)";ctx.lineWidth=1;ctx.stroke();
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
window.addEventListener("mousemove",function(e){if(drag){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=1;cx-=dx/z;cy+=dy/z;drag.x=e.clientX;drag.y=e.clientY;clampView();render();starfieldPan(dx,dy);return}});
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

// ── ORBITAL ATLAS (Phase B) — radial schematic: NOW at center, time-to-lock
// as radius, domain (atlas layer) as angle. A different lens on the same
// ATLAS_NODES data, not a new dataset.
var atlasMode="mercator";
var orbCv=$("orbital"),orbCtx=orbCv&&orbCv.getContext("2d");
var orbW=0,orbH=0,orbDPR=1,orbRotation=0,orbHits=[],orbHover=null,orbRaf=0,orbPositions=null;
var RING_YEARS=[2030,2035,2044,2050];
function nowYear(){return new Date().getFullYear()}
var ATLAS_RAW_MAP={};(Store.raw.atlas.nodes||[]).forEach(function(n){ATLAS_RAW_MAP[n.id]=n});
function orbTimeToLock(n){
  var raw=ATLAS_RAW_MAP["atlas."+n.id];
  if(raw&&raw.rent&&raw.rent.half_life_estimate_years)return nowYear()+raw.rent.half_life_estimate_years;
  var hl=raw?raw.half_life_days:365;
  var yrs=hl<=365?3:hl<=730?7:hl<=1825?16:26; // faster-changing entities → sooner lock; permanent geography (3650d) → far out
  return nowYear()+yrs;
}
function orbRadiusFor(year){
  var rMax=Math.min(orbW,orbH)/2-44,ny=nowYear();
  if(year<=ny)return 18;
  for(var i=0;i<RING_YEARS.length;i++){
    if(year<=RING_YEARS[i]){
      var prevYear=i===0?ny:RING_YEARS[i-1];
      var prevR=18+(rMax-18)*(i/RING_YEARS.length);
      var thisR=18+(rMax-18)*((i+1)/RING_YEARS.length);
      var span=RING_YEARS[i]-prevYear;
      var frac=span>0?(year-prevYear)/span:1;
      return prevR+(thisR-prevR)*frac;
    }
  }
  return rMax;
}
var LAYER_ANGLE={choke:0,chip:60,min:120,nrg:180,data:240,fin:300};
function buildOrbitalPositions(){
  var positions={};
  ATLAS_NODES.forEach(function(n){
    var lockYear=orbTimeToLock(n);
    var r=orbRadiusFor(lockYear);
    var baseAngle=(LAYER_ANGLE[n.ly]||0);
    var hash=0;for(var i=0;i<n.id.length;i++)hash=(hash*31+n.id.charCodeAt(i))>>>0;
    var jitter=(hash%50)/50*46-23;
    positions[n.id]={r:r,angle:(baseAngle+jitter)*Math.PI/180,lockYear:lockYear};
  });
  return positions;
}
function resizeOrbital(){
  if(!orbCv)return;
  var r=$("map-wrap").getBoundingClientRect();
  orbW=Math.max(200,r.width);orbH=Math.max(200,r.height);orbDPR=Math.min(2,window.devicePixelRatio||1);
  orbCv.width=orbW*orbDPR;orbCv.height=orbH*orbDPR;orbCv.style.width=orbW+"px";orbCv.style.height=orbH+"px";
  orbCtx.setTransform(orbDPR,0,0,orbDPR,0,0);
  orbPositions=buildOrbitalPositions();
  renderOrbital();
}
function renderOrbital(){
  if(!orbCv||!orbPositions)return;
  var cx=orbW/2,cy=orbH/2,rMax=Math.min(orbW,orbH)/2-44,ny=nowYear();
  orbCtx.fillStyle="#000000";orbCtx.fillRect(0,0,orbW,orbH);
  orbCtx.font="9px ui-monospace,Menlo,Consolas,monospace";
  RING_YEARS.forEach(function(yr,i){
    var rr=18+(rMax-18)*((i+1)/RING_YEARS.length);
    orbCtx.strokeStyle="rgba(193,68,14,.3)";orbCtx.lineWidth=1;
    orbCtx.beginPath();orbCtx.arc(cx,cy,rr,0,Math.PI*2);orbCtx.stroke();
    orbCtx.fillStyle="rgba(193,68,14,.8)";orbCtx.fillText(String(yr),cx+4,cy-rr-3);
  });
  Object.keys(LAYER_ANGLE).forEach(function(k){
    var a=(LAYER_ANGLE[k]-30)*Math.PI/180;
    orbCtx.strokeStyle="rgba(255,255,255,.05)";orbCtx.lineWidth=1;
    orbCtx.beginPath();orbCtx.moveTo(cx,cy);orbCtx.lineTo(cx+rMax*Math.cos(a),cy+rMax*Math.sin(a));orbCtx.stroke();
    var lblA=LAYER_ANGLE[k]*Math.PI/180;
    orbCtx.fillStyle="rgba(136,136,136,.6)";orbCtx.font="8px ui-monospace,Menlo,Consolas,monospace";
    orbCtx.fillText((LAYERS[k]?LAYERS[k].nm:k).toUpperCase(),cx+(rMax+8)*Math.cos(lblA)-((Math.cos(lblA)<0)?70:0),cy+(rMax+8)*Math.sin(lblA));
  });
  orbCtx.beginPath();orbCtx.arc(cx,cy,3,0,Math.PI*2);orbCtx.fillStyle="#ff3b30";orbCtx.fill();
  orbCtx.fillStyle="#ff3b30";orbCtx.font="9px ui-monospace,Menlo,Consolas,monospace";orbCtx.fillText("NOW · "+ny,cx+8,cy-8);
  orbHits=[];
  ATLAS_NODES.forEach(function(n){
    var p=orbPositions[n.id];if(!p)return;
    var a=p.angle+orbRotation;
    var x=cx+p.r*Math.cos(a),y=cy+p.r*Math.sin(a);
    var col=LCOLOR(n.ly);
    var lx=cx+(p.r+14)*Math.cos(a),ly=cy+(p.r+14)*Math.sin(a);
    orbCtx.strokeStyle="rgba(255,255,255,.14)";orbCtx.lineWidth=.6;
    orbCtx.beginPath();orbCtx.moveTo(x,y);orbCtx.lineTo(lx,ly);orbCtx.stroke();
    var rr2=n.t===1?4:2.6;
    orbCtx.beginPath();orbCtx.arc(x,y,rr2,0,Math.PI*2);orbCtx.fillStyle=col;orbCtx.fill();
    if(orbHover&&orbHover.id===n.id){orbCtx.beginPath();orbCtx.arc(x,y,rr2+3.5,0,Math.PI*2);orbCtx.strokeStyle=col;orbCtx.lineWidth=1;orbCtx.stroke()}
    if(n.t===1){
      var rightSide=Math.cos(a)<0;
      orbCtx.font="8px ui-monospace,Menlo,Consolas,monospace";orbCtx.fillStyle="rgba(230,230,230,.7)";
      orbCtx.textAlign=rightSide?"right":"left";
      orbCtx.fillText(n.nm.split(" — ")[0].toUpperCase(),lx+(rightSide?-4:4),ly+3);
      orbCtx.textAlign="left";
    }
    orbHits.push({x:x,y:y,r:9,n:n});
  });
}
function orbTick(){
  if(atlasMode!=="orbital"){orbRaf=0;return}
  orbRotation+=0.0006;
  renderOrbital();
  orbRaf=requestAnimationFrame(orbTick);
}
if(orbCv){
  orbCv.addEventListener("mousemove",function(e){
    var r=orbCv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    var best=null,bd=1e9;
    for(var i=0;i<orbHits.length;i++){var h=orbHits[i],d=(h.x-mx)*(h.x-mx)+(h.y-my)*(h.y-my);if(d<h.r*h.r&&d<bd){bd=d;best=h}}
    orbHover=best?best.n:null;orbCv.style.cursor=best?"pointer":"default";
    var tip=$("orbital-tip");
    if(best){
      var p=orbPositions[best.n.id];
      tip.style.display="block";tip.querySelector(".tl").textContent=(LAYERS[best.n.ly]?LAYERS[best.n.ly].nm:best.n.ly)+" · locks ~"+p.lockYear;
      tip.lastChild.textContent=best.n.nm;
      var tx=mx+16,ty=my+14;if(tx+180>orbW)tx=mx-190;
      tip.style.left=tx+"px";tip.style.top=ty+"px";
    }else tip.style.display="none";
    if(!motionOK)renderOrbital();
  });
  orbCv.addEventListener("click",function(){if(orbHover)openDossier("atlas",orbHover.id)});
  $("orbital-tip").innerHTML='<div class="tl"></div><div></div>';
}
function setAtlasMode(mode){
  atlasMode=mode;
  $("am-mercator").classList.toggle("on",mode==="mercator");
  $("am-orbital").classList.toggle("on",mode==="orbital");
  $("map").style.display=mode==="mercator"?"block":"none";
  if(orbCv)orbCv.style.display=mode==="orbital"?"block":"none";
  if(mode==="orbital"){
    resizeOrbital();
    if(orbRaf)cancelAnimationFrame(orbRaf);
    if(motionOK)orbRaf=requestAnimationFrame(orbTick);else renderOrbital();
  }else{
    resize();kick();
  }
}
(function(){var mb=$("am-mercator"),ob=$("am-orbital");if(mb)mb.onclick=function(){setAtlasMode("mercator")};if(ob)ob.onclick=function(){setAtlasMode("orbital")}})();

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

// Constraints table + order-book clock
function buildConstraints(){
  var tbody=$("constraints-tbody");
  tbody.innerHTML=CONSTRAINTS.map(function(c,i){
    return'<tr data-ci="'+i+'"><td class="mono-em">'+esc(c.title)+'</td><td>'+esc(c.lead_time)+'</td><td>'+esc(c.cost)+'</td><td>'+esc(c.bottleneck)+'</td><td>'+esc(c.signal)+'</td></tr>'
    +'<tr class="constraint-detail" id="cd-'+i+'"><td colspan="5"><div class="cd-body">'
    +'<div><div class="cd-sec">BINDING CONSTRAINT</div><div class="cd-val">'+esc(c.bottleneck)+'</div></div>'
    +'<div><div class="cd-sec">SIGNAL TO WATCH</div><div class="cd-val">'+esc(c.signal)+'</div></div>'
    +'<div><div class="cd-sec">LEAD TIME</div><div class="cd-val">'+esc(c.lead_time)+'</div></div>'
    +'</div></td></tr>';
  }).join("");
  tbody.querySelectorAll("tr[data-ci]").forEach(function(row){
    row.onclick=function(){
      var ci=row.dataset.ci;var detail=$("cd-"+ci);
      var isOpen=row.classList.contains("expanded");
      tbody.querySelectorAll("tr[data-ci]").forEach(function(r){r.classList.remove("expanded")});
      tbody.querySelectorAll(".constraint-detail").forEach(function(d){d.classList.remove("open")});
      if(!isOpen){row.classList.add("expanded");detail.classList.add("open")}
    };
  });
  buildClockRows();
}

function buildClockRows(){
  var CY_START=2026,CY_END=2044,CY_RANGE=CY_END-CY_START;
  function cPct(y){return Math.max(0,Math.min(100,(y-CY_START)/CY_RANGE*100))}
  var axisEl=$("clock-axis");if(!axisEl)return;
  var axHtml="";
  for(var y=CY_START;y<=CY_END;y+=2)axHtml+='<div class="clock-yr" style="left:'+cPct(y)+'%">'+y+"</div>";
  axisEl.innerHTML=axHtml;
  var rowsEl=$("clock-rows");if(!rowsEl)return;
  var targetY=parseInt(($("clock-target")||{value:2030}).value)||2030;
  var html="";
  CONSTRAINTS.forEach(function(c){
    var minY=CY_START+c.lead_min_yr,maxY=CY_START+c.lead_max_yr;
    var l=cPct(minY),w=Math.max(2,cPct(maxY)-l);
    var locked=c.lead_min_yr>(targetY-CY_START);
    html+='<div class="clock-row'+(locked?" locked":"")+'">';
    html+='<div class="clock-nm">'+esc(c.title)+'</div>';
    html+='<div class="clock-track">';
    html+='<div class="clock-bar" style="left:'+l+'%;width:'+w+'%">'+esc(c.lead_time)+'</div>';
    html+='</div></div>';
  });
  rowsEl.innerHTML=html;
  // target line overlay
  var targetPct=cPct(targetY);
  rowsEl.style.position="relative";
  var existing=rowsEl.querySelector(".clock-target-line");
  if(existing)existing.remove();
  var line=document.createElement("div");line.className="clock-target-line";
  line.style.left=targetPct+"%";rowsEl.appendChild(line);
  // locked message
  var locked=CONSTRAINTS.filter(function(c){return c.lead_min_yr>(targetY-CY_START)});
  var msg=$("clock-locked-msg");if(msg){
    msg.textContent=locked.length?locked.length+" systems ALREADY LOCKED for "+targetY+" commitment — capacity was due by "+(targetY-Math.round(locked.reduce(function(a,c){return a+c.lead_min_yr},0)/locked.length)):"All systems committable for "+targetY+" target";
    msg.style.color=locked.length?"var(--alert)":"var(--min)";
  }
}

(function(){
  var ct=$("clock-target");if(!ct)return;
  var lb=$("clock-target-lb");
  ct.addEventListener("input",function(){
    if(lb)lb.textContent="Target: "+ct.value;
    buildClockRows();
  });
})();

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
  wireSnipEdges();
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
$("tt-reset").onclick=function(){
  treeSel=null;treePathMode=false;snipMode=false;snippedEdges.clear();
  $("tt-full").classList.add("on");$("tt-path").classList.remove("on");$("tt-snip").classList.remove("on");
  clearPathToTarget();applyTreeLighting();closeDossier();
  var sb=$("snip-banner");if(sb)sb.classList.remove("active");
  var mc=$("mincut-info");if(mc){mc.classList.remove("active");mc.textContent=""}
};
$("tt-full").classList.add("on");

// ── Counterfactual Snip ──────────────────────────────────────────────────
var snipMode=false;var snippedEdges=new Set();
$("tt-snip").onclick=function(){
  snipMode=!snipMode;$("tt-snip").classList.toggle("on",snipMode);
  var sb=$("snip-banner");if(sb)sb.classList.toggle("active",snipMode);
};
(function(){var btn=$("tt-snip-clear");if(btn)btn.onclick=function(){snippedEdges.clear();applySnip()}})();
function applySnip(){
  if(!treeSVGEl)return;
  treeSVGEl.querySelectorAll(".tedge").forEach(function(el){
    var key=el.dataset.from+"|"+el.dataset.to;
    el.classList.toggle("snipped",snippedEdges.has(key));
  });
  var snipCount=$("snip-count");if(snipCount)snipCount.textContent=snippedEdges.size;
  // reachability: find all nodes reachable from era-0 roots ignoring snipped edges
  var roots=TREE.filter(function(n){return!n.requires||!n.requires.length||n.era===0}).map(function(n){return n.id});
  var reachable=new Set(roots);var queue=roots.slice();
  while(queue.length){var cur=queue.shift();(TREE_CHILDREN[cur]||[]).forEach(function(cid){if(reachable.has(cid))return;var key=cur+"|"+cid;if(snippedEdges.has(key))return;reachable.add(cid);queue.push(cid)})}
  treeSVGEl.querySelectorAll(".tnode").forEach(function(el){el.classList.toggle("snipped-unreachable",snippedEdges.size>0&&!reachable.has(el.dataset.id))});
  treeSVGEl.querySelectorAll(".tedge").forEach(function(el){el.classList.toggle("snipped-unreachable",snippedEdges.size>0&&!reachable.has(el.dataset.to))});
  var severed=TREE.length-reachable.size;
  var sb=$("snip-banner");if(sb&&snippedEdges.size>0){sb.innerHTML='SNIP MODE · '+snippedEdges.size+' edges cut → <b style="color:var(--txt)">'+severed+'</b> nodes severed &nbsp;<button class="btn" id="tt-snip-clear" style="font-size:8px;padding:2px 7px">CLEAR</button>';sb.querySelector("#tt-snip-clear").onclick=function(){snippedEdges.clear();applySnip()}}
}

// Add alt-click on edges after tree is built
function wireSnipEdges(){
  if(!treeSVGEl)return;
  treeSVGEl.querySelectorAll(".tedge").forEach(function(el){
    el.addEventListener("click",function(e){
      if(!snipMode)return;
      e.stopPropagation();
      var key=el.dataset.from+"|"+el.dataset.to;
      if(snippedEdges.has(key))snippedEdges.delete(key);else snippedEdges.add(key);
      applySnip();
    });
  });
}

// ── Minimum Cut ──────────────────────────────────────────────────────────
$("tt-mincut").onclick=function(){
  if(!treeSel){var mc=$("mincut-info");if(mc){mc.textContent="Select a node first, then click MIN CUT";mc.classList.add("active")}return}
  computeMinCut(treeSel);
};
function computeMinCut(targetId){
  // Find min vertex cut between era-0 roots and targetId using simple BFS-based approach
  // Node-splitting: each node v → v_in, v_out with capacity 1
  var roots=TREE.filter(function(n){return!n.requires||!n.requires.length||n.era===0}).map(function(n){return n.id});
  if(roots.includes(targetId)){showMinCutResult(targetId,[]);return}
  // Build flow graph with node splitting
  var nodes=TREE.map(function(n){return n.id});
  var inOf=function(id){return id+"__in"};var outOf=function(id){return id+"__out"};
  // Adjacency: out(u) → in(v) for each tree edge; in(u) → out(u) capacity 1
  function bfsPath(source,sink,cap){
    var parent={};parent[source]=null;var q=[source];
    while(q.length){var u=q.shift();if(u===sink)break;
      Object.keys(cap[u]||{}).forEach(function(v){if(!(v in parent)&&cap[u][v]>0){parent[v]=u;q.push(v)}})
    }
    if(!(sink in parent))return null;
    var path=[];var v=sink;while(v!==source){path.unshift([parent[v],v]);v=parent[v]}
    return path;
  }
  // Build capacity graph
  var cap={};function addEdge(u,v,c){if(!cap[u])cap[u]={};if(!cap[v])cap[v]={};cap[u][v]=(cap[u][v]||0)+c;if(cap[v][u]===undefined)cap[v][u]=0}
  nodes.forEach(function(id){
    if(roots.includes(id))addEdge(inOf(id),outOf(id),999);
    else if(id===targetId)addEdge(inOf(id),outOf(id),999);
    else addEdge(inOf(id),outOf(id),1);
  });
  TREE.forEach(function(n){(n.requires||[]).forEach(function(pid){addEdge(outOf(pid),inOf(n.id),999)})});
  // Add super-source → all roots
  roots.forEach(function(r){addEdge("__src",outOf(r),999)});
  // Max-flow (Ford-Fulkerson)
  var source="__src",sink=inOf(targetId);
  var path;while((path=bfsPath(source,sink,cap))){path.forEach(function(e){cap[e[0]][e[1]]--;cap[e[1]][e[0]]++})}
  // Find cut: nodes reachable from source in residual
  var reachable=new Set();var q2=[source];
  while(q2.length){var u=q2.shift();if(reachable.has(u))continue;reachable.add(u);Object.keys(cap[u]||{}).forEach(function(v){if(!reachable.has(v)&&cap[u][v]>0)q2.push(v)})}
  var cutNodes=nodes.filter(function(id){return reachable.has(outOf(id))&&!reachable.has(inOf(id))});
  showMinCutResult(targetId,cutNodes);
}
function showMinCutResult(targetId,cutNodes){
  if(!treeSVGEl)return;
  treeSVGEl.querySelectorAll(".tnode").forEach(function(el){
    el.classList.remove("mincut-member");
    if(cutNodes.includes(el.dataset.id))el.classList.add("mincut-member");
  });
  var mc=$("mincut-info");if(mc){
    var names=cutNodes.map(function(id){var n=TREE_MAP[id];return n?n.lb:id}).join(", ");
    mc.innerHTML='MIN CUT for <b>'+esc(TREE_MAP[targetId]?TREE_MAP[targetId].lb:targetId)+'</b>: '+esc(cutNodes.length)+' nodes — '+esc(names||"already a root");
    mc.classList.add("active");
  }
}
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
  // YOU row (pinned)
  rowsHtml+='<div class="tl-row" id="you-row" style="opacity:.6"><div class="tl-name" style="color:var(--dim)">YOU<span class="tier-badge" style="color:var(--faint)">ADD BET</span></div><div class="tl-bets" style="flex:1;position:relative;height:46px"><div id="you-add-btn" style="position:absolute;left:0;top:12px;font-size:9px;color:var(--faint);cursor:pointer;border:1px dashed var(--line);padding:3px 8px;letter-spacing:.08em">+ YOUR BET</div></div></div>';
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
  var youBtn=$("you-add-btn");if(youBtn)youBtn.onclick=openYouBetForm;
}

function openYouBetForm(){
  var existing=document.getElementById("you-bet-form");if(existing){existing.remove();return}
  var form=document.createElement("div");form.id="you-bet-form";
  form.style.cssText="position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--line2);padding:18px 20px;z-index:150;min-width:340px;font-size:11px";
  form.innerHTML='<div style="font-size:9px;letter-spacing:.15em;color:var(--faint);margin-bottom:12px">YOUR BET (scored on 0-5 anatomy axes)</div>'
    +'<input id="yb-thesis" type="text" placeholder="Thesis…" style="width:100%;box-sizing:border-box;background:#111;border:1px solid var(--line);color:var(--txt);padding:5px 8px;font-family:var(--mono);font-size:10px;margin-bottom:8px"><br>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">'
    +ANATOMY_KEYS.map(function(k){return'<label style="font-size:9px;color:var(--dim)">'+k[1]+' <input type="number" min="0" max="5" id="yb-'+k[0]+'" placeholder="0-5" style="width:50px;background:#111;border:1px solid var(--line);color:var(--txt);padding:3px 5px;font-family:var(--mono);font-size:9px"></label>'}).join("")
    +'</div><div style="display:flex;gap:8px"><button class="btn" id="yb-save">SAVE BET</button><button class="btn" onclick="document.getElementById(\'you-bet-form\').remove()">CANCEL</button></div>';
  document.body.appendChild(form);
  form.querySelector("#yb-save").onclick=function(){
    var thesis=form.querySelector("#yb-thesis").value.trim();if(!thesis)return;
    var anatomy={};ANATOMY_KEYS.forEach(function(k){anatomy[k[0]]=parseInt(form.querySelector("#yb-"+k[0]).value)||0});
    var you_bets=JSON.parse(storage.getItem("sv3-you-bets")||"[]");
    you_bets.push({thesis:thesis,anatomy:anatomy,yr:new Date().getFullYear(),added:NOW_YM});
    storage.setItem("sv3-you-bets",JSON.stringify(you_bets));form.remove();
  };
}

function buildHumansScatter(){
  var svgEl=$("scatter-svg");if(!svgEl)return;
  var W2=svgEl.clientWidth||800,H2=svgEl.clientHeight||500;
  var PADL=60,PADR=20,PADT=20,PADB=50;
  var plotW=W2-PADL-PADR,plotH=H2-PADT-PADB;
  var ns="http://www.w3.org/2000/svg";
  svgEl.innerHTML="";
  function mkEl(tag,attrs){var e=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k])});return e}
  // axes
  svgEl.appendChild(mkEl("line",{x1:PADL,y1:PADT,x2:PADL,y2:PADT+plotH,stroke:"#2c2c2c","stroke-width":"1"}));
  svgEl.appendChild(mkEl("line",{x1:PADL,y1:PADT+plotH,x2:PADL+plotW,y2:PADT+plotH,stroke:"#2c2c2c","stroke-width":"1"}));
  var xlbl=mkEl("text",{x:PADL+plotW/2,y:PADT+plotH+36,"text-anchor":"middle","class":"scatter-axis-label"});xlbl.textContent="CONSENSUS DELTA →";svgEl.appendChild(xlbl);
  var ylbl=mkEl("text",{x:PADL-40,y:PADT+plotH/2,"text-anchor":"middle","class":"scatter-axis-label",transform:"rotate(-90,"+(PADL-40)+","+(PADT+plotH/2)+")"});ylbl.textContent="ASYMMETRY →";svgEl.appendChild(ylbl);
  // grid lines
  for(var gi=1;gi<=5;gi++){var gx=PADL+gi*plotW/5,gy=PADT+gi*plotH/5;var gl1=mkEl("line",{x1:gx,y1:PADT,x2:gx,y2:PADT+plotH,stroke:"#1a1a1a","stroke-width":"1"});svgEl.appendChild(gl1);var gl2=mkEl("line",{x1:PADL,y1:gy,x2:PADL+plotW,y2:gy,stroke:"#1a1a1a","stroke-width":"1"});svgEl.appendChild(gl2)}
  // plot bets
  HUMANS.forEach(function(h){
    (h.bets||[]).forEach(function(bet){
      if(!bet.anatomy)return;
      var a=bet.anatomy;
      var cx2=PADL+(a.consensus||0)/5*plotW;
      var cy2=PADT+(1-a.asymmetry/5)*plotH;
      var r=4+(a.stake||2);
      var col={C:"rgba(255,59,48,.8)",P:"rgba(192,192,192,.7)",W:"rgba(127,211,148,.7)",M:"rgba(144,144,144,.5)"}[h.tier]||"#666";
      var outcome=bet.outcome||"open";
      var fillCol=outcome==="win"?col:outcome==="loss"?"rgba(80,80,80,.4)":col;
      var dot=mkEl("circle",{cx:cx2,cy:cy2,r:r,fill:fillCol,stroke:"#333","stroke-width":"1","class":"scatter-dot","data-hid":h.id});
      dot.addEventListener("mouseenter",function(){var t=mkEl("text",{x:cx2+r+4,y:cy2+4,fill:"var(--dim)",id:"sc-tip","font-size":"9",class:"scatter-label"});t.textContent=h.name+" — "+bet.yr;svgEl.appendChild(t)});
      dot.addEventListener("mouseleave",function(){var t=svgEl.querySelector("#sc-tip");if(t)t.remove()});
      dot.addEventListener("click",function(){openDossier("human",h.id)});
      svgEl.appendChild(dot);
    });
  });
  // graveyard (grey)
  GRAVEYARD.forEach(function(g){
    var cx2=PADL+Math.random()*plotW*0.4+plotW*0.1;
    var cy2=PADT+Math.random()*plotH*0.6+plotH*0.1;
    var dot=mkEl("circle",{cx:cx2,cy:cy2,r:5,fill:"rgba(40,40,40,.8)",stroke:"#333","stroke-width":"1","class":"scatter-dot","data-gid":g.id});
    var lbl=mkEl("text",{x:cx2+7,y:cy2+3,fill:"#2c2c2c","font-size":"8","class":"scatter-label"});lbl.textContent=g.title;svgEl.appendChild(dot);svgEl.appendChild(lbl);
  });
}

function buildGraveyard(){
  var el=$("graveyard-list");if(!el)return;
  el.innerHTML=GRAVEYARD.map(function(g){
    return'<div class="grave-card'+(g.draft?" draft":"")+'">'
      +'<div class="grave-tier">TIER D</div>'
      +'<div class="grave-title">'+esc(g.title)+'</div>'
      +'<div class="grave-cause">'+esc(g.cause_of_death||"—")+'</div>'
      +'<div class="grave-body">'+esc(g.body||"—")+'</div>'
      +'</div>';
  }).join("");
}

// Sub-tab switching for HUMANS
(function(){
  function showHumans(v){
    $("ht-living").classList.toggle("on",v==="living");
    $("ht-scatter").classList.toggle("on",v==="scatter");
    $("ht-graveyard").classList.toggle("on",v==="graveyard");
    $("humans-living").style.display=v==="living"?"flex":"none";
    $("humans-scatter").style.display=v==="scatter"?"block":"none";
    $("humans-graveyard").style.display=v==="graveyard"?"block":"none";
    if(v==="scatter")buildHumansScatter();
    if(v==="graveyard")buildGraveyard();
  }
  $("ht-living").onclick=function(){showHumans("living")};
  $("ht-scatter").onclick=function(){showHumans("scatter")};
  $("ht-graveyard").onclick=function(){showHumans("graveyard")};
})();

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
  sorted.forEach(function(t){
    var o=parseInt(t.opened)||nowYr;
    var closeRaw=t.expected_close||"";
    var fuzzy=/[±+?]/.test(closeRaw);
    var c=parseInt(closeRaw.replace(/[±+?]/g,""))||o+6;
    var l=gPct(o),w=Math.max(2,gPct(c)-l);
    var fuzzyClass=fuzzy?" fuzzy-end":"";
    html+='<div class="gantt-row"><div class="gantt-name" data-id="'+t.id+'">'+esc(t.name)+"</div>"
      +'<div class="gantt-track"><div class="gantt-now" style="left:'+gPct(nowYr)+'%"></div>'
      +'<div class="gantt-bar st-'+t.status+fuzzyClass+'" data-id="'+t.id+'" style="left:'+l+"%;width:"+w+'%">'+t.status+"</div></div></div>";
  });
  el.innerHTML=html;el.querySelectorAll("[data-id]").forEach(function(b){b.onclick=function(){openDossier("trend",b.dataset.id)}});
}
function buildWCMatrix(){
  var el=$("trends-matrix");if(!el)return;
  var CONS=CONSTRAINTS.filter(function(c){return c.lead_min_yr>0});
  var openWindows=TRENDS.filter(function(t){return t.status==="open"||t.status==="forming"||t.status==="closing"});
  var html='<table class="wc-matrix"><thead><tr><th>Window</th>';
  CONS.forEach(function(c){html+='<th><div class="wc-con-hd" title="'+esc(c.title)+'">'+esc(c.title)+"</div></th>"});
  html+="</tr></thead><tbody>";
  openWindows.forEach(function(t){
    html+='<tr><td class="wc-window-nm" data-id="'+t.id+'">'+esc(t.name)+'</td>';
    CONS.forEach(function(c){
      var gates=false;
      var links=(Store.get("window."+t.id)||{}).links||[];
      links.forEach(function(lk){if(lk.rel==="gates"&&lk.to===c.id)gates=true});
      if(!gates&&t.xref&&t.xref.atlas){var atl=t.xref.atlas||[];atl.forEach(function(aid){var an=NMAP[aid];if(an&&an.id===c.id.replace("constraint.",""))gates=true})}
      html+='<td class="'+(gates?"wc-cell-filled":"")+'">'+(gates?"×":"")+"</td>";
    });
    html+="</tr>";
  });
  html+="</tbody></table><div style='font-size:9px;color:var(--faint);margin-top:12px'>× = window gated by constraint · hover column headers to see constraint name · click window name to open dossier</div>";
  el.innerHTML=html;
  el.querySelectorAll(".wc-window-nm").forEach(function(td){td.onclick=function(){openDossier("trend",td.dataset.id)}});
}
function showTrendsView(v){
  $("tv-kanban").classList.toggle("on",v==="kanban");
  $("tv-gantt").classList.toggle("on",v==="gantt");
  $("tv-matrix").classList.toggle("on",v==="matrix");
  $("trends-kanban").style.display=v==="kanban"?"flex":"none";
  $("trends-gantt").style.display=v==="gantt"?"block":"none";
  $("trends-matrix").style.display=v==="matrix"?"block":"none";
  if(v==="gantt")buildGantt();
  if(v==="matrix")buildWCMatrix();
}
$("tv-kanban").onclick=function(){showTrendsView("kanban")};
$("tv-gantt").onclick=function(){showTrendsView("gantt")};
$("tv-matrix").onclick=function(){showTrendsView("matrix")};

// ── METHOD ────────────────────────────────────────────────────────────────
function buildMethod(){
  $("method-hier").innerHTML=HIER.map(function(h){return'<div style="display:flex;gap:10px;margin-bottom:10px"><div style="color:var(--choke);flex:none;font-size:10px;min-width:22px">'+h[2]+'</div><div><div style="font-size:11px;color:var(--txt);margin-bottom:2px">'+esc(h[0])+'</div><div style="font-size:10px;color:var(--dim);line-height:1.6">'+esc(h[1])+"</div></div></div>"}).join("");
  $("method-rules").innerHTML=RULES.map(function(r,i){return'<div class="rule-row"><div class="rule-n">'+(i+1)+'</div><div>'+esc(r)+"</div></div>"}).join("");
  $("method-bias").innerHTML=BIASCHK.map(function(b){return'<div class="rule-row"><div class="rule-n">☐</div><div>'+esc(b)+"</div></div>"}).join("");
  $("method-sources").innerHTML=SOURCES.map(function(s){return"<tr><td class='mono-em'>"+esc(s[0])+"</td><td>"+esc(s[1])+"</td><td><code>"+esc(s[2])+"</code></td></tr>"}).join("");
}

// ── FORECASTS ─────────────────────────────────────────────────────────────
// forecasts = public (repo, data/forecasts.json — canonical, read-only) + private (localStorage, editable)
var forecasts=[];
function loadForecasts(){
  var priv=[];
  try{var raw=storage.getItem("sv3-forecasts");if(raw)priv=JSON.parse(raw)}catch(e){}
  var pub=((Store.raw.forecasts&&Store.raw.forecasts.forecasts)||[]).map(function(f){var c=Object.assign({},f);c.public=true;return c});
  var pubKeys={};pub.forEach(function(f){if(f.key)pubKeys[f.key]=1});
  forecasts=pub.concat(priv.filter(function(f){return !(f.key&&pubKeys[f.key])}));
}
function saveForecasts(){try{storage.setItem("sv3-forecasts",JSON.stringify(forecasts.filter(function(f){return !f.public})))}catch(e){}}

function calcBrier(fset){
  var resolved=(fset||forecasts).filter(function(f){return f.outcome!==null&&f.outcome!=="ambiguous"});
  if(!resolved.length)return null;
  var sum=resolved.reduce(function(acc,f){return acc+Math.pow(f.p-(f.outcome?1:0),2)},0);
  return(sum/resolved.length).toFixed(3);
}

function murphyDecomp(){
  // Murphy decomposition: Brier = Reliability - Resolution + Uncertainty
  var resolved=forecasts.filter(function(f){return f.outcome!==null&&f.outcome!=="ambiguous"});
  if(resolved.length<3)return null;
  var n=resolved.length;
  var meanBase=resolved.reduce(function(a,f){return a+(f.outcome?1:0)},0)/n;
  // bin into deciles
  var bins={};resolved.forEach(function(f){var b=Math.floor(f.p*10)/10;if(!bins[b])bins[b]=[];bins[b].push(f)});
  var reliability=0,resolution=0;
  Object.keys(bins).forEach(function(b){
    var g=bins[b],nk=g.length,ok=g.filter(function(f){return f.outcome}).length,fk=nk?ok/nk:0,pk=parseFloat(b)+0.05;
    reliability+=nk*Math.pow(pk-fk,2);
    resolution+=nk*Math.pow(fk-meanBase,2);
  });
  reliability/=n;resolution/=n;
  var uncertainty=meanBase*(1-meanBase);
  return{reliability:reliability.toFixed(3),resolution:resolution.toFixed(3),uncertainty:uncertainty.toFixed(3)};
}

function renderCalibrationChart(){
  var svgEl=$("calibration-svg");var msgEl=$("calibration-msg");if(!svgEl)return;
  var resolved=forecasts.filter(function(f){return f.outcome!==null&&f.outcome!=="ambiguous"});
  if(resolved.length<20){if(msgEl)msgEl.textContent="Calibration unreadable below n=20. Resolved: "+resolved.length+". Resolve more.";svgEl.style.display=resolved.length===0?"none":"block";if(!resolved.length)return}
  var W3=300,H3=200,PAD=30;var ns="http://www.w3.org/2000/svg";
  svgEl.innerHTML="";svgEl.style.display="block";
  function mkEl2(tag,attrs){var e=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k])});return e}
  // diagonal
  svgEl.appendChild(mkEl2("line",{x1:PAD,y1:H3-PAD,x2:W3-PAD,y2:PAD,"class":"cal-diagonal"}));
  // axis labels
  for(var ai=0;ai<=10;ai+=2){var av=ai/10;var ax=PAD+av*(W3-PAD*2),ay=H3-PAD-av*(H3-PAD*2);var at=mkEl2("text",{x:ax,y:H3-PAD+14,"text-anchor":"middle","font-size":"8",fill:"#484848"});at.textContent=av.toFixed(1);svgEl.appendChild(at);var aty=mkEl2("text",{x:PAD-8,y:H3-PAD-av*(H3-PAD*2)+3,"text-anchor":"end","font-size":"8",fill:"#484848"});aty.textContent=av.toFixed(1);svgEl.appendChild(aty)}
  // bins
  var bins={};for(var bi=0;bi<10;bi++)bins[bi/10]=[];
  resolved.forEach(function(f){var b=Math.floor(f.p*10)/10;if(!(b in bins))b=Math.round(b*10)/10;if(b in bins)bins[b].push(f)});
  Object.keys(bins).forEach(function(b){
    var g=bins[b];if(!g.length)return;
    var fk=g.filter(function(f){return f.outcome}).length/g.length;var pk=parseFloat(b)+0.05;
    var px2=PAD+pk*(W3-PAD*2),py2=H3-PAD-fk*(H3-PAD*2);
    var barH=(H3-PAD*2)*fk,barX=PAD+parseFloat(b)*(W3-PAD*2),barW=(W3-PAD*2)/10;
    svgEl.appendChild(mkEl2("rect",{x:barX,y:H3-PAD-barH,width:barW*.7,height:Math.max(1,barH),"class":"cal-bar"}));
    var dot=mkEl2("circle",{cx:px2,cy:py2,r:4,"class":"cal-dot"});
    dot.setAttribute("title","p="+b+" → realized="+fk.toFixed(2)+" (n="+g.length+")");
    svgEl.appendChild(dot);
  });
  if(msgEl)msgEl.textContent="n="+resolved.length+" resolved · Diagonal = perfect calibration · Dots above diagonal = overconfident";
}

var _pmIndex=-1;
function openPostmortem(i){
  _pmIndex=i;var f=forecasts[i];if(!f)return;
  var modal=$("postmortem-modal");var stmt=$("pm-stmt");
  if(stmt)stmt.textContent=f.stmt.slice(0,120);
  if(modal)modal.style.display="flex";
}
(function(){
  var btn=$("pm-submit");if(!btn)return;
  btn.onclick=function(){
    if(_pmIndex<0)return;
    var type=$("pm-type").value;var note=$("pm-note").value.trim();
    forecasts[_pmIndex].outcome=false;
    forecasts[_pmIndex].postmortem={type:type,note:note,date:new Date().toISOString().slice(0,10)};
    saveForecasts();renderForecasts();
    var modal=$("postmortem-modal");if(modal)modal.style.display="none";_pmIndex=-1;
    $("pm-note").value="";
  };
})();

function renderForecasts(){
  var brier=calcBrier();$("brier-val").textContent=brier!==null?brier:"—";
  var pending=forecasts.filter(function(f){return f.outcome===null}).length;
  $("fc-counts").textContent=pending+" / "+(forecasts.length-pending);
  var mu=murphyDecomp();
  var relEl=$("brier-reliability"),resEl=$("brier-resolution");
  if(relEl)relEl.textContent=mu?mu.reliability:"—";
  if(resEl)resEl.textContent=mu?mu.resolution:"—";
  // public track record — canonical, committed to the repo
  var pubBanner=$("fc-public-banner");
  if(pubBanner){
    var pubSet=forecasts.filter(function(f){return f.public});
    var pubResolved=pubSet.filter(function(f){return f.outcome!==null&&f.outcome!=="ambiguous"});
    var pubBrier=calcBrier(pubSet);
    pubBanner.innerHTML='<div class="fc-public-lbl">PUBLIC TRACK RECORD</div>'
      +'<div class="fc-public-stats">'+pubSet.length+' public forecast'+(pubSet.length===1?"":"s")+' · '+pubResolved.length+' resolved · Brier '+(pubBrier!==null?pubBrier:"—")+'</div>'
      +'<div class="fc-public-note">Committed to <code>data/forecasts.json</code> — canonical, read-only here. Everything else on this page is your private, local scratchpad; use Export to promote it.</div>';
  }
  // owed inbox
  var owed=forecasts.filter(function(f){return f.outcome===null&&f.dl&&new Date(f.dl)<new Date()});
  var owedBanner=$("fc-owed-banner");
  if(owedBanner){
    if(owed.length){owedBanner.style.display="block";owedBanner.innerHTML="RESOLUTIONS OWED: "+owed.length+" forecast"+(owed.length>1?"s":"")+' past deadline <button class="btn" id="fc-owed-jump" style="margin-left:8px;font-size:9px">JUMP TO FIRST</button>'}
    else owedBanner.style.display="none";
  }
  setTimeout(function(){var btn=$("fc-owed-jump");if(btn)btn.onclick=function(){var el=$("fc-list").querySelector("[data-owed]");if(el)el.scrollIntoView({behavior:"smooth"})}},0);
  renderCalibrationChart();
  $("fc-list").innerHTML=forecasts.map(function(f,i){
    var isOwed=f.outcome===null&&f.dl&&new Date(f.dl)<new Date();
    var row='<div style="display:flex;gap:8px;margin-bottom:6px;align-items:baseline;font-size:11px"'+(isOwed?' data-owed="1" style="border-left:2px solid var(--alert);padding-left:6px"':'')+'>'+
      '<div style="color:var(--choke);min-width:22px;font-size:9px">'+(i+1)+'</div>'+
      '<div style="flex:1;color:var(--txt)">'+esc(f.stmt)+'</div>'+
      (f.public?'<span class="fc-public-tag">PUBLIC</span>':"")+
      (f.seeded?'<span class="fc-seed-tag">seeded</span>':"")+
      '<div style="color:var(--chip);min-width:36px">'+Math.round(f.p*100)+"%</div>"+
      '<div style="color:var(--faint);min-width:70px;font-size:9px">'+(isOwed?'<span style="color:var(--alert)">':'')+esc(f.dl||"")+(isOwed?'</span>':'')+' DUE</div>'+
      (f.public?
        '<span style="color:'+(f.outcome===null?"var(--faint)":f.outcome&&f.outcome!=="ambiguous"?"var(--ok)":f.outcome==="ambiguous"?"var(--faint)":"var(--alert)")+';font-size:9px">'+(f.outcome===null?"PENDING":f.outcome==="ambiguous"?"AMBIGUOUS":f.outcome?"TRUE":"FALSE")+"</span>"
      :f.outcome===null?
        '<button class="btn" data-i="'+i+'" data-o="1" style="padding:2px 6px;font-size:9px">✓</button>'+
        '<button class="btn danger" data-i="'+i+'" data-pm="1" style="padding:2px 6px;font-size:9px">✗</button>'+
        '<button class="btn" data-o="ambiguous" data-i="'+i+'" style="padding:2px 6px;font-size:9px;color:var(--faint)" title="Mark ambiguous — excluded from scoring">~</button>'
      :'<span style="color:'+(f.outcome&&f.outcome!=="ambiguous"?(f.outcome?"var(--ok)":"var(--alert)"):"var(--faint)")+';font-size:9px">'+(f.outcome==="ambiguous"?"AMBIGUOUS":f.outcome?"TRUE":"FALSE")+"</span>")+
      (f.public?"":'<button class="btn danger" data-del="'+i+'" style="padding:2px 5px;font-size:9px">×</button>')+'</div>';
    if(f.falsifier)row+='<div class="fc-falsifier"><b>FALSIFIER</b> '+esc(f.falsifier)+"</div>";
    if(f.resolver)row+='<div class="fc-resolver-note">Resolver: <a href="'+esc(f.resolver)+'" target="_blank" rel="noopener">'+esc(f.resolver.slice(0,60))+'</a></div>';
    if(f.criteria)row+='<div class="fc-criteria-note">Criteria: '+esc(f.criteria)+"</div>";
    if(f.postmortem)row+='<div class="fc-postmortem">'+esc(f.postmortem.type.toUpperCase())+" — "+esc(f.postmortem.note)+'</div>';
    return row;
  }).join("");
  $("fc-list").querySelectorAll("[data-i]").forEach(function(btn){btn.onclick=function(){
    var i=+btn.dataset.i;
    if(btn.dataset.pm){openPostmortem(i);return}
    var o=btn.dataset.o;
    if(o==="ambiguous"){forecasts[i].outcome="ambiguous";saveForecasts();renderForecasts();return}
    forecasts[i].outcome=(+o===1);saveForecasts();renderForecasts();
  }});
  $("fc-list").querySelectorAll("[data-del]").forEach(function(btn){btn.onclick=function(){forecasts.splice(+btn.dataset.del,1);saveForecasts();renderForecasts()}});
}
$("fc-add-btn").onclick=function(){
  var stmt=$("fc-stmt").value.trim();var p=parseFloat($("fc-p").value);var dl=$("fc-dl").value;
  var resolver=($("fc-resolver")||{value:""}).value.trim();
  var criteria=($("fc-criteria")||{value:""}).value.trim();
  if(!stmt||isNaN(p)||p<0||p>1)return;
  forecasts.push({stmt:stmt,p:p,dl:dl,resolver:resolver,criteria:criteria,outcome:null,added:NOW_YM});
  saveForecasts();renderForecasts();
  $("fc-stmt").value="";$("fc-p").value="";$("fc-dl").value="";
  if($("fc-resolver"))$("fc-resolver").value="";if($("fc-criteria"))$("fc-criteria").value="";
};
$("fc-seed-btn").onclick=function(){
  var existing={};forecasts.forEach(function(f){if(f.key)existing[f.key]=1});var added=0;
  function harvest(nodes,reg,nameOf){nodes.forEach(function(n){(n.future_paths||[]).forEach(function(fp,i){if(!fp.falsifier||/^N\/A/.test(fp.falsifier))return;var key=reg+"/"+n.id+"/"+i;if(existing[key])return;forecasts.push({stmt:"["+reg.toUpperCase()+" · "+nameOf(n)+"] "+fp.path,p:fp.p,dl:fp.horizon+"-12-31",falsifier:fp.falsifier,outcome:null,added:NOW_YM,seeded:true,key:key});existing[key]=1;added++})})}
  harvest(HUMANS,"human",function(n){return n.name});harvest(TRENDS,"trend",function(n){return n.name});
  saveForecasts();renderForecasts();$("fc-seed-btn").textContent=added?("⇪ Imported "+added):"⇪ Up to date";setTimeout(function(){$("fc-seed-btn").textContent="⇪ Import from registries"},2500);
};
(function(){
  var btn=$("fc-export-btn");if(!btn)return;
  btn.onclick=function(){
    var mine=forecasts.filter(function(f){return !f.public});
    var blob=new Blob([JSON.stringify({forecasts:mine},null,2)],{type:"application/json"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download="forecasts-export-"+NOW_YM+".json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url)},1000);
    btn.textContent="⇪ Exported "+mine.length;setTimeout(function(){btn.textContent="⇪ Export my forecasts as JSON"},2000);
  };
})();

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
    else if(r.id==="brief")switchTab("today");
    else if(r.id==="thesis")switchTab("thesis");
    else if(r.id==="kbd"){var ko=$("kbd-overlay");if(ko)ko.style.display="flex"}
    return;
  }
  if(r.reg!=="scenario")addRecentJump(r.reg,r.id,r.name);
  if(r.reg==="atlas"){switchTab("atlas");flyTo(NMAP[r.id])}
  else if(r.reg==="tree"){switchTab("tree");buildTreeIfNeeded();setTimeout(function(){selectTreeNode(r.id)},100)}
  else if(r.reg==="humans"||r.reg==="human"){switchTab("humans");openDossier("human",r.id)}
  else if(r.reg==="trends"||r.reg==="trend"){switchTab("windows");openDossier("trend",r.id)}
  else if(r.reg==="country"){switchTab("countries");openDossier("country",r.id)}
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
window.addEventListener("resize",function(){if($("v-atlas").classList.contains("on")){if(atlasMode==="orbital")resizeOrbital();else resize()}});
buildLegend();buildConstraints();buildScenarios();buildMethod();buildHumans();buildTrends();
loadForecasts();renderForecasts();checkOnboarding();
updateFreshnessMeter();buildPatrol();buildThesisRegister();buildGraveyard();buildToday();
// Atlas canvas + tree SVG are lazy-built on first visit (see switchTab's
// child==="atlas"/"tree" branches) rather than pre-warmed here — most
// sessions land on Today and never touch World, so eagerly paying the
// map/tree render cost on every load only slows the common case down.
// Wire freshness meter click → health panel
(function(){var fm=$("freshness-meter");if(fm)fm.onclick=openHealth})();

// ── ROUTER INTEGRATION ────────────────────────────────────────────────────
// Override tab clicks to go through Router so the URL updates. A parent tab
// (world/trends/thesis/lab) resolves to its last-shown (or default) child
// BEFORE hitting the router, so the route in the URL bar is always a concrete
// child id - that's what keeps a bare "#trends" hash unambiguous: it's never
// produced by a live tab click, so Router.on below can treat it purely as the
// pre-restructure legacy route (the old Trends/kanban board).
document.querySelectorAll("#tabs .tab").forEach(function(t){t.onclick=function(){
  var v=t.dataset.v;
  var child=(v==="helm")?"helm":(PARENT_CHILDREN[v]?(lastChildForParent[v]||PARENT_CHILDREN[v][0]):v);
  Router.navigate(child,{});_entityNavIndex=-1;
}});
Router.on(function(path,params){
  var sections=Object.keys(PARENT_CHILDREN).concat(Object.keys(CHILD_PARENT),["helm"]);
  if(Object.prototype.hasOwnProperty.call(LEGACY_ROUTE_CHILD,path))switchTab(LEGACY_ROUTE_CHILD[path]);
  else if(sections.indexOf(path)!==-1)switchTab(path);
  if(params&&params.open){
    var m=params.open.match(/^(atlas|tree|human|window)\.(.+)$/);
    if(m){var regMap={atlas:"atlas",tree:"tree",human:"human",window:"trend"};setTimeout(function(){openDossier(regMap[m[1]],m[2])},150)}
    else if(params.open.indexOf("thesis.")===0){setTimeout(function(){todayGoToThesis(params.open)},150)}
  }
});

// v2 hash format support: #atlas:id, #tree:id, #human:id, #trend:id
(function(){
  var m=location.hash.match(/^#(atlas|tree|human|trend):([a-z0-9_-]+)$/);
  if(!m)return;
  var reg=m[1],id=m[2];
  switchTab({atlas:"atlas",tree:"tree",human:"humans",trend:"windows"}[reg]);
  setTimeout(function(){if(reg==="tree"){buildTreeIfNeeded();selectTreeNode(id)}else openDossier(reg,id,false)},120);
})();

// ── THESIS REGISTER ───────────────────────────────────────────────────────
// ── TODAY (landing view) ──────────────────────────────────────────────────
function todayEdgeScore(th){
  var ca=th.crowd_awareness;
  if(ca===undefined||ca===null)return -1;
  var cd=th.consensus_delta_num!=null?th.consensus_delta_num:(th.confidence==="hi"?0.7:th.confidence==="med"?0.4:0.2);
  var s=Store.staleStatus(th.id||"");
  var fresh=s==="fresh"?1.0:s==="aging"?0.75:0.4;
  return cd*(1-ca)*fresh;
}
function todayGoToConstraint(cid){
  Router.navigate("constraints",{});switchTab("constraints");
  setTimeout(function(){
    var idx=CONSTRAINTS.findIndex(function(c){return c.id===cid});if(idx<0)return;
    var row=document.querySelector('#constraints-tbody tr[data-ci="'+idx+'"]');
    if(row){row.click();row.scrollIntoView({behavior:"smooth",block:"center"})}
  },80);
}
function todayGoToThesis(tid){
  Router.navigate("thesis",{});switchTab("thesis");
  setTimeout(function(){
    var idx=THESES.findIndex(function(t){return t.id===tid});if(idx<0)return;
    var card=document.querySelectorAll("#thesis-list .thesis-card")[idx];
    if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.add("today-highlight");setTimeout(function(){card.classList.remove("today-highlight")},2200)}
  },80);
}
function buildToday(){
  var cardsEl=$("today-cards");if(!cardsEl)return;

  // Card 1 — tightest binding constraint (largest excess of lead time over runway to default clock target)
  var CY_START=2026,todayTargetY=2030,runway=todayTargetY-CY_START;
  var tightest=null,tightestExcess=-999;
  CONSTRAINTS.forEach(function(c){var excess=c.lead_min_yr-runway;if(excess>tightestExcess){tightestExcess=excess;tightest=c}});
  var c1="";
  if(tightest)c1='<div class="today-card" data-act="constraint" data-cid="'+esc(tightest.id)+'">'
    +'<div class="today-card-lbl">TIGHTEST BINDING CONSTRAINT</div>'
    +'<div class="today-card-main">'+esc(tightest.title)+'</div>'
    +'<div class="today-card-sub">Lead time '+esc(tightest.lead_time)+' — '+(tightestExcess>0?tightestExcess.toFixed(1)+"yr past what a "+todayTargetY+" target allows":"within the "+todayTargetY+" target runway")+'.</div>'
    +'<div class="today-card-go">→ Constraints</div></div>';

  // Card 2 — thesis with highest edge score
  var bestTh=null,bestScore=-1;
  THESES.forEach(function(th){var sc=todayEdgeScore(th);if(sc>bestScore){bestScore=sc;bestTh=th}});
  var c2="";
  if(bestTh)c2='<div class="today-card" data-act="thesis" data-tid="'+esc(bestTh.id)+'">'
    +'<div class="today-card-lbl">HIGHEST-EDGE THESIS</div>'
    +'<div class="today-card-main">'+esc(bestTh.statement)+'</div>'
    +'<div class="today-card-sub">Edge score '+Math.round(bestScore*100)+'% — consensus_delta × unpriced × freshness.</div>'
    +'<div class="today-card-go">→ Thesis Register</div></div>';

  // Card 3 — kill condition closest to triggering
  var closestTh=null,closestProx=-1;
  THESES.forEach(function(th){var kw=th.kill_watch;if(!kw||kw.proximity==null)return;if(kw.proximity>closestProx){closestProx=kw.proximity;closestTh=th}});
  var c3="";
  if(closestTh){
    var kw=closestTh.kill_watch;
    c3='<div class="today-card" data-act="thesis" data-tid="'+esc(closestTh.id)+'">'
      +'<div class="today-card-lbl">CLOSEST TO A KILL CONDITION</div>'
      +'<div class="today-card-main">'+esc(closestTh.kill_condition)+'</div>'
      +'<div class="today-card-sub">'+esc(kw.signal)+' — now: '+esc(kw.current_value)+'</div>'
      +'<div class="today-card-go">→ '+esc(closestTh.statement.slice(0,54))+'…</div></div>';
  }else{
    c3='<div class="today-card"><div class="today-card-lbl">CLOSEST TO A KILL CONDITION</div><div class="today-card-sub">No kill_watch data yet.</div></div>';
  }

  cardsEl.innerHTML=c1+c2+c3;
  cardsEl.querySelectorAll(".today-card[data-act]").forEach(function(card){
    card.onclick=function(){
      if(card.dataset.act==="constraint")todayGoToConstraint(card.dataset.cid);
      else if(card.dataset.act==="thesis")todayGoToThesis(card.dataset.tid);
    };
  });

  // Spotlight — "if you only read one thing"
  var spotEl=$("today-spotlight");
  if(spotEl){
    if(bestTh){
      var soWhat=(bestTh.margin&&bestTh.margin.buffer_note)||bestTh.edge_basis||"";
      spotEl.innerHTML='<div class="today-spotlight-wrap">'
        +'<div class="today-spotlight-lbl">IF YOU ONLY READ ONE THING</div>'
        +'<div class="today-spotlight-plain">'+esc(bestTh.plain||bestTh.statement)+'</div>'
        +'<div class="today-spotlight-tech">'+esc(bestTh.statement)+'</div>'
        +(soWhat?'<div class="today-spotlight-sowhat">SO WHAT — '+esc(soWhat)+'</div>':"")
        +'<button class="btn" id="today-spotlight-go">→ FULL THESIS</button></div>';
      var goBtn=$("today-spotlight-go");if(goBtn)goBtn.onclick=function(){todayGoToThesis(bestTh.id)};
    }else spotEl.innerHTML="";
  }

  // Data health summary
  var healthEl=$("today-health");
  if(healthEl){
    var staleCt=0;
    [ATLAS_NODES,TREE,HUMANS,TRENDS].forEach(function(arr){arr.forEach(function(n){if(isStale(n))staleCt++})});
    healthEl.innerHTML='<div class="today-health-row">'
      +'<div class="today-health-stat"><span>Version</span><b>'+esc(MANIFEST.version)+'</b></div>'
      +'<div class="today-health-stat"><span>Data vintage</span><b>'+esc(MANIFEST.data_vintage)+'</b></div>'
      +'<div class="today-health-stat"><span>Stale nodes</span><b style="color:'+(staleCt?"var(--enr)":"var(--min)")+'">'+staleCt+'</b></div>'
      +'</div><button class="btn" id="today-health-open" style="margin-top:8px">OPEN DATA HEALTH →</button>';
    var hBtn=$("today-health-open");if(hBtn)hBtn.onclick=openHealth;
  }

  // Windows closing soonest
  var winEl=$("today-windows");
  if(winEl){
    var upcoming=TRENDS.filter(function(t){return t.status!=="closed"}).map(function(t){
      var yr=parseInt((t.expected_close||"").replace(/[^0-9]/g,"").slice(0,4))||9999;
      return{t:t,yr:yr};
    }).sort(function(a,b){return a.yr-b.yr}).slice(0,3);
    winEl.innerHTML=upcoming.map(function(u){
      return'<div class="today-window-row" data-tid="'+esc(u.t.id)+'">'
        +'<div class="today-window-nm">'+esc(u.t.name)+'</div>'
        +'<div class="today-window-close">closes '+esc(u.t.expected_close||"?")+' · '+esc(u.t.status.toUpperCase())+'</div></div>';
    }).join("");
    winEl.querySelectorAll(".today-window-row").forEach(function(row){row.onclick=function(){openDossier("trend",row.dataset.tid)}});
  }

  buildBrief(); // Brief merged into Today as "What Changed"
}

// ── TRAJECTORY (Phase B) ──────────────────────────────────────────────────
// NOW→2050 per thesis. Only theses carrying an explicit `trajectory` field
// are charted — everything else is listed honestly as "not charted" rather
// than faked. Derived from real fields already in theses.json (kill_threshold
// draws straight from kill_watch-scale numbers where the author supplied one).
var trajScrubYear=nowYear();
function trajSmootherstep(t){return t*t*t*(t*(t*6-15)+10)}
function trajInterp(p0,p1,t,useTipping){var tt=useTipping?trajSmootherstep(t):t;return p0.value+(p1.value-p0.value)*tt}
function buildTrajectorySVG(th){
  var traj=th.trajectory,pts=traj.points;
  var W3=900,H3=170,PADL=40,PADR=20,PADT=16,PADB=26;
  var minYear=Math.min(pts[0].year,nowYear()),maxYear=Math.max(2050,pts[pts.length-1].year);
  var vals=pts.map(function(p){return p.value});
  if(traj.kill_threshold!=null)vals.push(traj.kill_threshold);
  var vMin=Math.min.apply(0,vals),vMax=Math.max.apply(0,vals);
  var vPad=(vMax-vMin)*.18||Math.abs(vMax)*.2||1;vMin-=vPad;vMax+=vPad;
  function xOf(yr){return PADL+(yr-minYear)/(maxYear-minYear)*(W3-PADL-PADR)}
  function yOf(v){return PADT+(1-(v-vMin)/(vMax-vMin))*(H3-PADT-PADB)}

  var lastLockedIdx=0;pts.forEach(function(p,i){if(p.locked)lastLockedIdx=i});
  var svg='<svg class="traj-svg" viewBox="0 0 '+W3+' '+H3+'" preserveAspectRatio="xMidYMid meet">';

  // ring-year gridlines
  RING_YEARS.forEach(function(yr){
    if(yr<minYear||yr>maxYear)return;
    var x=xOf(yr);
    svg+='<line x1="'+x+'" y1="'+PADT+'" x2="'+x+'" y2="'+(H3-PADB)+'" stroke="rgba(193,68,14,.15)" stroke-width="1"></line>';
  });

  // uncertainty cone over the projected region
  var crosses=false;
  if(lastLockedIdx<pts.length-1){
    var upperPts=[],lowerPts=[];
    for(var i=lastLockedIdx;i<pts.length;i++){
      var p=pts[i],yrsOut=p.year-pts[lastLockedIdx].year,unc=Math.min(.4,yrsOut*.035);
      var hi=p.value*(1+unc),lo=p.value*(1-unc);
      upperPts.push([xOf(p.year),yOf(hi)]);lowerPts.push([xOf(p.year),yOf(lo)]);
      if(traj.kill_threshold!=null&&traj.kill_threshold>=Math.min(lo,hi)&&traj.kill_threshold<=Math.max(lo,hi))crosses=true;
    }
    var coneD="M"+upperPts.map(function(pp){return pp[0]+","+pp[1]}).join(" L");
    coneD+=" L"+lowerPts.slice().reverse().map(function(pp){return pp[0]+","+pp[1]}).join(" L")+" Z";
    svg+='<path class="traj-cone" d="'+coneD+'"></path>';
  }

  // kill_threshold line
  if(traj.kill_threshold!=null){
    var ty=yOf(traj.kill_threshold);
    svg+='<line class="traj-threshold-line" x1="'+PADL+'" y1="'+ty+'" x2="'+(W3-PADR)+'" y2="'+ty+'"></line>';
    svg+='<text class="traj-threshold-label" x="'+(W3-PADR-2)+'" y="'+(ty-3)+'" text-anchor="end">KILL THRESHOLD '+esc(traj.kill_threshold+" "+traj.unit)+'</text>';
    if(crosses)svg+='<text class="traj-cross-alert" x="'+PADL+'" y="'+(PADT+8)+'">⚠ CONE CROSSES KILL THRESHOLD</text>';
  }

  // line segments — solid between two locked points, dotted (tipping-curved if tagged) otherwise
  for(var si=0;si<pts.length-1;si++){
    var a=pts[si],b=pts[si+1],solid=a.locked&&b.locked,steps=solid?1:10;
    var d="M"+xOf(a.year)+","+yOf(a.value);
    for(var s=1;s<=steps;s++){
      var t=s/steps,yr=a.year+(b.year-a.year)*t,val=trajInterp(a,b,t,traj.tipping&&!solid);
      d+=" L"+xOf(yr)+","+yOf(val);
    }
    svg+='<path class="'+(solid?"traj-locked-line":"traj-proj-line")+'" d="'+d+'"></path>';
  }
  pts.forEach(function(p){
    svg+='<circle class="traj-dot'+(p.locked?"":" proj")+'" cx="'+xOf(p.year)+'" cy="'+yOf(p.value)+'" r="2.6"></circle>';
    svg+='<text class="traj-axis-label" x="'+xOf(p.year)+'" y="'+(H3-PADB+14)+'" text-anchor="middle">'+p.year+"</text>";
  });

  // milestone pins — dated tree events within this chart's forward window
  TREE.filter(function(n){var y=treeYearOf(n);return y>=nowYear()&&y<=maxYear}).slice(0,6).forEach(function(n){
    var x=xOf(treeYearOf(n));
    svg+='<path class="traj-pin" d="M'+x+','+(H3-PADB)+" l4,7 l-8,0 z\"><title>"+esc(n.lb)+'</title></path>';
  });

  // scrubber NOW line
  var scrubX=xOf(Math.max(minYear,Math.min(maxYear,trajScrubYear)));
  svg+='<line class="traj-now-line" x1="'+scrubX+'" y1="'+PADT+'" x2="'+scrubX+'" y2="'+(H3-PADB)+'"></line>';
  svg+='<text class="traj-now-label" x="'+scrubX+'" y="'+(PADT-3)+'" text-anchor="middle">'+(trajScrubYear<=nowYear()?"NOW":trajScrubYear)+'</text>';

  svg+="</svg>";
  return svg;
}
function buildTrajectory(){
  var el=$("traj-charts");if(!el)return;
  var withTraj=THESES.filter(function(t){return t.trajectory&&t.trajectory.points&&t.trajectory.points.length});
  var withoutTraj=THESES.filter(function(t){return!(t.trajectory&&t.trajectory.points&&t.trajectory.points.length)});
  el.innerHTML=withTraj.map(function(th){
    var traj=th.trajectory;
    return'<div class="traj-card" data-tid="'+th.id+'">'
      +'<div class="traj-card-hd"><div class="traj-card-title">'+esc(th.statement)+'</div>'
      +(traj.tipping?'<span class="traj-tipping-badge">TIPPING</span>':"")+"</div>"
      +'<div class="traj-card-metric">'+esc(traj.metric)+" · "+esc(traj.unit)+(traj.source?" · "+esc(traj.source):"")+"</div>"
      +buildTrajectorySVG(th)
      +"</div>";
  }).join("");
  el.querySelectorAll(".traj-card").forEach(function(card){
    card.style.cursor="pointer";
    card.addEventListener("click",function(){todayGoToThesis(card.dataset.tid)});
  });
  var noteEl=$("traj-empty-note");
  if(noteEl)noteEl.innerHTML=withoutTraj.length?("<b>Not charted (no trajectory field yet — left out honestly rather than faked):</b> "+withoutTraj.map(function(t){return esc(t.statement.slice(0,64))+"…"}).join(" · ")):"";
  var forksEl=$("traj-forks");
  if(forksEl){
    forksEl.innerHTML=SCENARIOS.map(function(sc){return'<div class="traj-fork" data-sc="'+sc.id+'"><b>'+esc(sc.nm)+"</b><br>"+esc((sc.d||"").slice(0,90))+"…</div>"}).join("");
    forksEl.querySelectorAll(".traj-fork").forEach(function(elx){elx.onclick=function(){var sc=SCENARIOS.find(function(s){return s.id===elx.dataset.sc});if(sc)runScenario(sc)}});
  }
}
(function(){
  var yrEl=$("traj-year");if(!yrEl)return;
  yrEl.addEventListener("input",function(){
    trajScrubYear=+yrEl.value;
    $("traj-year-lb").textContent=(trajScrubYear<=nowYear()?"NOW · ":"")+trajScrubYear;
    buildTrajectory();
  });
})();

// ── EVERYTHING — accountable multi-trend intensity chart ────────────────────
// Inspired by levels.io's Everything Chart, fixing its two flaws:
// (1) unfalsifiable vibes — every curve here traces to a real field
//     (crowd_awareness, awareness_trend, consensus_delta_num, trajectory.points,
//     window status/dates). data/windows.json and data/theses.json entries MAY
//     carry an authored curve:[{year,belief_0_100,reality_0_100,band_0_100}] —
//     none do yet, so every curve below is honestly computed, not measured, and
//     tagged derived:true. If an entry ever gets an authored curve[], render it
//     directly (derived:false) instead of deriving.
// (2) 24 illegible overlapping lines — defaults to ~6 curated "house" items,
//     offers Indexed and Small-Multiples modes, and dims non-hovered lines
//     (same class-toggle technique as the Tree tab's applyTreeLighting).
var EVTG_Y_START=1990,EVTG_Y_END=2035;
var EVTG_HOUSE=["thesis.power_binds","window.zirp-saas","window.ai-wrapper-window","window.agentic-vertical","window.memory-supercycle","window.robotics-embodiment"];
function evtgClamp(v){return Math.max(0,Math.min(100,v))}
function evtgValueAt(pts,key,year){
  if(!pts.length)return 0;
  if(year<=pts[0].year)return pts[0][key];
  if(year>=pts[pts.length-1].year)return pts[pts.length-1][key];
  for(var i=0;i<pts.length-1;i++){
    var a=pts[i],b=pts[i+1];
    if(year>=a.year&&year<=b.year){
      var t=(year-a.year)/(b.year-a.year);
      return a[key]+(b[key]-a[key])*t;
    }
  }
  return pts[pts.length-1][key];
}
function evtgBeliefFromAwareness(asOfYear,awareness0to100,trend,year){
  var slope=trend==="rising"?4:trend==="falling"?-4:0;
  return evtgClamp(awareness0to100+slope*(year-asOfYear));
}
// merge two independently-built {year,v} key-point arrays (belief, reality) onto
// the union of both arrays' years, sampling each curve at every year via
// evtgValueAt — this is what lets the SVG shade the gap between them cleanly
// even though each curve's own "natural" key years differ.
function evtgMergeCurves(realityKP,beliefKP){
  var years={};
  realityKP.forEach(function(p){years[p.year]=1});
  beliefKP.forEach(function(p){years[p.year]=1});
  var sorted=Object.keys(years).map(Number).sort(function(a,b){return a-b});
  return sorted.map(function(y){
    return{year:y,reality:evtgValueAt(realityKP,"v",y),belief:evtgValueAt(beliefKP,"v",y)};
  });
}
// polarity-safe normalization for an authored trajectory: whether a HIGHER raw
// metric value means the thesis is more or less true varies per thesis (more
// queue-years is bad for one, good for another) — but "distance from the
// kill_threshold" is always monotonic in the right direction (farther = safer),
// so it's the one generic transform that doesn't require per-thesis domain
// knowledge or risk an inverted, misleading curve.
function evtgRealityFromTrajectory(traj){
  var pts=traj.points,kt=traj.kill_threshold;
  var dists=pts.map(function(p){return kt!=null?Math.abs(p.value-kt):p.value});
  var dMin=Math.min.apply(0,dists),dMax=Math.max.apply(0,dists);
  var dRange=(dMax-dMin)||1;
  return pts.map(function(p,i){
    return{year:p.year,v:evtgClamp(((dists[i]-dMin)/dRange)*100),observed:!!p.locked};
  });
}
function evtgFindThresholdCrossYear(pts,threshold){
  if(threshold==null)return null;
  for(var i=0;i<pts.length-1;i++){
    var a=pts[i],b=pts[i+1];
    if((a.value-threshold)*(b.value-threshold)<=0&&a.value!==b.value){
      var t=(threshold-a.value)/(b.value-a.value);
      return Math.round(a.year+(b.year-a.year)*t);
    }
  }
  return null;
}
// authored curve[] takes priority over derivation — an entity that has actually
// been dated and sourced shouldn't be silently overwritten by a heuristic just
// because the derivation code runs unconditionally otherwise.
function evtgPointsFromAuthored(curve){
  return curve.map(function(p){return{year:p.year,reality:p.reality_0_100,belief:p.belief_0_100}});
}
function evtgThesisKillYear(th){
  if(th.trajectory&&th.trajectory.points&&th.trajectory.points.length>=2){
    var y=evtgFindThresholdCrossYear(th.trajectory.points,th.trajectory.kill_threshold);
    if(y!=null)return{killYear:y,killLabel:"KILL THRESHOLD"};
  }
  var prox=th.kill_watch&&th.kill_watch.proximity;
  if(prox!=null)return{killYear:Math.round(nowYear()+(1-prox)*15),killLabel:"EST. KILL (from kill_watch.proximity)"};
  return{killYear:null,killLabel:null};
}
function evtgThesisCurve(th){
  var kill=evtgThesisKillYear(th);
  var base={
    id:"thesis."+th.id.replace(/^thesis\./,""),kind:"thesis",dossierReg:"thesis",dossierId:th.id,
    name:th.plain||th.statement,status:th.confidence==="hi"?"high-confidence":th.confidence==="lo"?"low-confidence":"med-confidence",
    killYear:kill.killYear&&kill.killYear<=EVTG_Y_END&&kill.killYear>=EVTG_Y_START?kill.killYear:null,killLabel:kill.killLabel
  };
  if(th.curve&&th.curve.length>=2)return Object.assign({},base,{
    points:evtgPointsFromAuthored(th.curve),derived:false,
    sourceNote:"authored curve — dated and sourced directly in data/theses.json, not derived"
  });
  var awareness0to100=(th.crowd_awareness!=null?th.crowd_awareness:0.4)*100;
  var trend=th.awareness_trend||"flat";
  var asOfYear=parseInt((th.awareness_as_of||"2026-01-01").slice(0,4))||nowYear();
  var gap=(th.consensus_delta_num!=null?th.consensus_delta_num:0.4)*100;
  var hasTraj=th.trajectory&&th.trajectory.points&&th.trajectory.points.length>=2;
  var realityKP,sourceNote;
  var beliefKP=[
    {year:EVTG_Y_START,v:evtgBeliefFromAwareness(asOfYear,awareness0to100,trend,EVTG_Y_START)},
    {year:asOfYear,v:evtgClamp(awareness0to100)},
    {year:nowYear(),v:evtgBeliefFromAwareness(asOfYear,awareness0to100,trend,nowYear())},
    {year:EVTG_Y_END,v:evtgBeliefFromAwareness(asOfYear,awareness0to100,trend,EVTG_Y_END)}
  ];
  if(hasTraj){
    realityKP=evtgRealityFromTrajectory(th.trajectory);
    sourceNote="reality derived from trajectory.points ("+esc(th.trajectory.metric)+", "+esc(th.trajectory.source||"sourced")+"), normalized by distance from kill_threshold; belief derived from crowd_awareness/awareness_trend";
  }else{
    realityKP=beliefKP.map(function(p){return{year:p.year,v:evtgClamp(p.v+gap)}});
    sourceNote="reality derived as belief + consensus_delta_num ("+Math.round(gap)+"pt edge); belief derived from crowd_awareness/awareness_trend";
  }
  return Object.assign({},base,{points:evtgMergeCurves(realityKP,beliefKP),derived:true,sourceNote:sourceNote});
}
function evtgWindowKeyPoints(t){
  var opened=parseInt(t.opened)||nowYear()-6;
  var closeNum=parseInt((t.expected_close||"").replace(/[±+?]/g,""))||opened+8;
  var span=Math.max(4,closeNum-opened);
  var rampEnd=opened+span*0.35;
  var peak={forming:42,open:92,closing:88,closed:90}[t.status]||70;
  var pts=[];
  pts.push({year:Math.max(EVTG_Y_START,opened-2),v:2});
  pts.push({year:opened,v:t.status==="forming"?8:14});
  pts.push({year:rampEnd,v:peak});
  if(t.status==="closed"){
    pts.push({year:closeNum,v:peak-4});
    pts.push({year:Math.min(EVTG_Y_END,closeNum+Math.max(4,span*0.6)),v:18});
  }else if(t.status==="closing"){
    pts.push({year:closeNum,v:peak-20});
    pts.push({year:EVTG_Y_END,v:35});
  }else{
    pts.push({year:closeNum,v:peak});
    pts.push({year:EVTG_Y_END,v:Math.min(96,peak+4)});
  }
  return pts;
}
function evtgWindowCurve(t){
  var closeNum=parseInt((t.expected_close||"").replace(/[±+?]/g,""));
  var base={
    id:"window."+t.id,kind:"window",dossierReg:"trend",dossierId:t.id,
    name:t.name,status:t.status,
    killYear:closeNum&&closeNum<=EVTG_Y_END&&closeNum>=EVTG_Y_START?closeNum:null,killLabel:"WINDOW CLOSES (expected_close)"
  };
  // TRENDS is the flattened compat shim and doesn't carry an authored curve[]
  // through — read the raw registry entity for that.
  var raw=Store.get("window."+t.id);
  if(raw&&raw.curve&&raw.curve.length>=2)return Object.assign({},base,{
    points:evtgPointsFromAuthored(raw.curve),derived:false,
    sourceNote:"authored curve — dated and sourced directly in data/windows.json, not derived"
  });
  var realityKP=evtgWindowKeyPoints(t).map(function(p){return{year:p.year,v:p.v}});
  var lag=2;
  var beliefKP=realityKP.map(function(p){
    return{year:p.year,v:evtgClamp(evtgValueAt(realityKP,"v",p.year-lag)*0.85)};
  });
  // hindsight: a fully closed window is common knowledge by the time it's old
  // news — belief converges to reality at the chart's far end rather than
  // holding a permanent 15% gap forever.
  if(t.status==="closed")beliefKP[beliefKP.length-1].v=realityKP[realityKP.length-1].v;
  return Object.assign({},base,{
    points:evtgMergeCurves(realityKP,beliefKP),derived:true,
    sourceNote:"reality derived from status/opened/expected_close (ramp-plateau"+(t.status==="closed"?"-decay":"")+" shape); belief derived as reality lagged ~2yr, scaled 0.85 (\"the crowd catches on late\")"+(t.status==="closed"?", converging to reality once closed":"")
  });
}
function evtgAllCurves(){
  return EVTG_HOUSE.map(function(id){
    if(id.indexOf("thesis.")===0){
      var th=THESES.filter(function(x){return x.id===id})[0];
      return th?evtgThesisCurve(th):null;
    }
    var wid=id.replace(/^window\./,"");
    var t=TREND_MAP[wid];
    return t?evtgWindowCurve(t):null;
  }).filter(Boolean);
}
var EVTG_COLORS=["var(--evtg-c1)","var(--evtg-c2)","var(--evtg-c3)","var(--evtg-c4)","var(--evtg-c5)","var(--evtg-c6)"];
function evtgColorFor(id){var idx=EVTG_HOUSE.indexOf(id);return EVTG_COLORS[idx>=0?idx%EVTG_COLORS.length:0]}
// only the actual current year is "NOW" — a scrubbed-to-1998 or scrubbed-to-2032
// year is just that year, not "now", even though both sit on the observed/
// projected boundary the scrubber controls.
function evtgYearLabel(y){return y===nowYear()?"NOW":String(y)}
var evtgState={mode:"overlay",indexed:false,filter:null,hoverId:null,scrubYear:nowYear(),hidden:{}};
function evtgGapAt(curve,year){return evtgValueAt(curve.points,"reality",year)-evtgValueAt(curve.points,"belief",year)}
function evtgWidestGapId(curves){
  var best=null,bestGap=-1;
  curves.forEach(function(c){var g=Math.abs(evtgGapAt(c,evtgState.scrubYear));if(g>bestGap){bestGap=g;best=c.id}});
  return best;
}
function evtgDirectionAt(curve,year){return evtgValueAt(curve.points,"reality",year)-evtgValueAt(curve.points,"reality",year-5)}
// "Indexed": each curve rescaled to its own peak = 100 — a real analytical mode
// even though belief/reality are already 0-100 by construction, because it lets
// you compare growth SHAPE (a trend that's early-and-rising vs. one that's
// already-huge-and-flat) independent of where each currently sits in absolute terms.
function evtgIndexCurve(curve){
  var maxV=0;curve.points.forEach(function(p){maxV=Math.max(maxV,p.reality,p.belief)});
  if(maxV<=0)maxV=1;
  var scale=100/maxV;
  return Object.assign({},curve,{points:curve.points.map(function(p){return{year:p.year,reality:p.reality*scale,belief:p.belief*scale}})});
}
function evtgVisibleCurves(){
  var curves=evtgAllCurves().filter(function(c){return!evtgState.hidden[c.id]});
  if(evtgState.filter==="rising")curves=curves.filter(function(c){return evtgDirectionAt(c,evtgState.scrubYear)>1});
  if(evtgState.filter==="declining")curves=curves.filter(function(c){return evtgDirectionAt(c,evtgState.scrubYear)<-1});
  if(evtgState.indexed)curves=curves.map(evtgIndexCurve);
  return curves;
}
// the falsifier a curve's kill/close marker actually cites — real text already
// authored elsewhere (kill_condition for theses, decay_logic for windows), never
// invented here.
function evtgFalsifierText(c){
  if(c.kind==="thesis"){var th=THESES.filter(function(x){return x.id===c.dossierId})[0];return th?th.kill_condition:""}
  var t=TREND_MAP[c.dossierId];return t?t.decay_logic:"";
}
// "resolvable" per the spec: once a curve's falsifier/close year has passed, it's
// no longer a pending projection — it's a claim that either held or didn't. This
// doesn't invent a probability (that's the user's judgment, same as every other
// forecast in this tool) — it pre-fills the real, dated, falsifiable claim into
// the existing Forecasts tab form and hands off to the same Brier/calibration
// pipeline every other forecast in this tool feeds, rather than building a
// parallel scoring system just for this chart.
function evtgLogAsForecast(c){
  var falsifier=evtgFalsifierText(c);
  var stmt=c.name+" — "+(c.killLabel||"falsifier")+(c.killYear?" by "+c.killYear:"");
  $("fc-stmt").value=stmt.slice(0,200);
  $("fc-dl").value=c.killYear?c.killYear+"-01-01":"";
  $("fc-criteria").value=falsifier||"";
  $("fc-resolver").value="EVERYTHING chart — "+c.id;
  Router.navigate("forecasts",{});switchTab("forecasts");
  setTimeout(function(){var p=$("fc-p");if(p)p.focus()},150);
}
function evtgRenderLegend(allCurves){
  var el=$("evtg-legend");if(!el)return;
  var widestId=evtgWidestGapId(allCurves);
  el.innerHTML=allCurves.map(function(c){
    var col=evtgColorFor(c.id),gap=Math.round(Math.abs(evtgGapAt(c,evtgState.scrubYear)));
    var due=c.killYear!=null&&c.killYear<=nowYear();
    return'<span class="evtg-legend-item'+(evtgState.hidden[c.id]?" off":"")+'" data-cid="'+c.id+'" title="'+esc(c.name)+'">'
      +'<span class="evtg-legend-swatch" style="background:'+col+'"></span><span class="evtg-legend-nm">'+esc(c.name)+"</span>"
      +(c.id===widestId?'<span class="evtg-legend-edge" title="Widest belief↔reality gap of the visible set">EDGE</span>':"")
      +'<span class="evtg-legend-prov'+(c.derived?"":" authored")+'" title="'+esc(c.sourceNote||"")+'">'+(c.derived?"DERIVED":"AUTHORED")+"</span>"
      +'<span class="evtg-legend-gap">'+gap+'pt gap</span>'
      +(c.killYear!=null?'<button class="evtg-legend-log'+(due?" due":"")+'" data-cid="'+c.id+'" title="'+(due?"Falsifier year has passed — ":"")+'Log as a forecast (pre-fills the Forecasts tab; you supply p)">'+(due?"⇪ DUE":"⇪")+"</button>":"")
      +"</span>";
  }).join("");
  el.querySelectorAll(".evtg-legend-item").forEach(function(item){
    item.onclick=function(){evtgState.hidden[item.dataset.cid]=!evtgState.hidden[item.dataset.cid];evtgRender()};
    item.onmouseenter=function(){evtgState.hoverId=item.dataset.cid;evtgApplyHover()};
    item.onmouseleave=function(){evtgState.hoverId=null;evtgApplyHover()};
  });
  el.querySelectorAll(".evtg-legend-log").forEach(function(btn){
    btn.onclick=function(e){
      e.stopPropagation();
      var c=allCurves.filter(function(x){return x.id===btn.dataset.cid})[0];
      if(c)evtgLogAsForecast(c);
    };
  });
}
function evtgApplyHover(){
  var svgEl=document.getElementById("evtg-svg");
  if(svgEl)svgEl.querySelectorAll(".evtg-group").forEach(function(g){
    g.classList.toggle("evtg-dim",!!(evtgState.hoverId&&evtgState.hoverId!==g.dataset.cid));
  });
  var legendEl=$("evtg-legend");
  if(legendEl)legendEl.querySelectorAll(".evtg-legend-item").forEach(function(item){
    item.classList.toggle("evtg-dim",!!(evtgState.hoverId&&evtgState.hoverId!==item.dataset.cid));
  });
}
function evtgRenderOverlaySVG(curves){
  // curve identity lives in the real, flex-wrapped #evtg-legend (which can't
  // collide) rather than inline right-edge SVG text — that in-chart labeling
  // used to need de-collision math and still overlapped at >4 curves, so PADR
  // only needs to clear the kill-mark ✕ / NOW-line labels now, not name text.
  var W=1000,H=420,PADL=34,PADR=24,PADT=18,PADB=26;
  function xOf(yr){return PADL+(yr-EVTG_Y_START)/(EVTG_Y_END-EVTG_Y_START)*(W-PADL-PADR)}
  function yOf(v){return PADT+(1-v/100)*(H-PADT-PADB)}
  var scrubYear=evtgState.scrubYear;
  var svg='<svg id="evtg-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid meet">';
  for(var y=1990;y<=2035;y+=5){
    svg+='<line x1="'+xOf(y)+'" y1="'+PADT+'" x2="'+xOf(y)+'" y2="'+(H-PADB)+'" stroke="rgba(255,255,255,.05)"></line>';
    svg+='<text class="evtg-axis-label" x="'+xOf(y)+'" y="'+(H-PADB+13)+'" text-anchor="middle">'+y+"</text>";
  }
  [0,50,100].forEach(function(v){
    svg+='<line x1="'+PADL+'" y1="'+yOf(v)+'" x2="'+(W-PADR)+'" y2="'+yOf(v)+'" stroke="rgba(255,255,255,.03)"></line>';
    svg+='<text class="evtg-axis-label" x="'+(PADL-6)+'" y="'+(yOf(v)+3)+'" text-anchor="end">'+v+"</text>";
  });
  TREE.filter(function(n){var yr=treeYearOf(n);return yr>=EVTG_Y_START&&yr<=EVTG_Y_END}).forEach(function(n){
    var yr=treeYearOf(n);
    svg+='<circle class="evtg-milestone" cx="'+xOf(yr)+'" cy="'+(H-PADB+4)+'" r="1.6"><title>'+esc(n.lb)+" ("+yr+')</title></circle>';
  });
  curves.forEach(function(c){
    var col=evtgColorFor(c.id),pts=c.points;
    var dim=evtgState.hoverId&&evtgState.hoverId!==c.id;
    svg+='<g class="evtg-group'+(dim?" evtg-dim":"")+'" data-cid="'+c.id+'">';
    var topPath="M"+pts.map(function(p){return xOf(p.year)+","+yOf(p.reality)}).join(" L");
    var botPath=" L"+pts.slice().reverse().map(function(p){return xOf(p.year)+","+yOf(p.belief)}).join(" L")+" Z";
    svg+='<path class="evtg-area-gap" d="'+topPath+botPath+'" fill="'+col+'"></path>';
    var projPts=pts.filter(function(p){return p.year>=scrubYear});
    if(projPts.length>=2){
      var upper=[],lower=[];
      projPts.forEach(function(p){
        var unc=Math.min(25,(p.year-scrubYear)*2.2);
        upper.push(xOf(p.year)+","+yOf(evtgClamp(p.reality+unc)));
        lower.push(xOf(p.year)+","+yOf(evtgClamp(p.reality-unc)));
      });
      svg+='<path class="evtg-cone" d="M'+upper.join(" L")+" L"+lower.reverse().join(" L")+'Z" fill="'+col+'"></path>';
    }
    ["reality","belief"].forEach(function(key){
      var cls=key==="reality"?"evtg-line-reality":"evtg-line-belief";
      var solidPts=pts.filter(function(p){return p.year<=scrubYear});
      var crossPt={year:scrubYear,reality:evtgValueAt(pts,"reality",scrubYear),belief:evtgValueAt(pts,"belief",scrubYear)};
      if(!solidPts.length||solidPts[solidPts.length-1].year<scrubYear)solidPts.push(crossPt);
      var dashPts=[crossPt].concat(pts.filter(function(p){return p.year>scrubYear}));
      if(solidPts.length>=2)svg+='<path class="'+cls+'" d="M'+solidPts.map(function(p){return xOf(p.year)+","+yOf(p[key])}).join(" L")+'" stroke="'+col+'"></path>';
      if(dashPts.length>=2)svg+='<path class="'+cls+' evtg-line-proj" d="M'+dashPts.map(function(p){return xOf(p.year)+","+yOf(p[key])}).join(" L")+'" stroke="'+col+'"></path>';
    });
    pts.forEach(function(p){svg+='<circle class="evtg-dot" cx="'+xOf(p.year)+'" cy="'+yOf(p.reality)+'" fill="'+col+'"></circle>'});
    if(c.killYear!=null){
      var kx=xOf(c.killYear),ky=yOf(evtgClamp(evtgValueAt(pts,"reality",c.killYear)));
      svg+='<g class="evtg-kill-mark" stroke="'+col+'"><line x1="'+(kx-4)+'" y1="'+(ky-4)+'" x2="'+(kx+4)+'" y2="'+(ky+4)+'"></line>'
        +'<line x1="'+(kx-4)+'" y1="'+(ky+4)+'" x2="'+(kx+4)+'" y2="'+(ky-4)+'"></line><title>'+esc(c.killLabel)+" — "+c.killYear+"</title></g>";
    }
    svg+="</g>";
  });
  var scrubX=xOf(Math.max(EVTG_Y_START,Math.min(EVTG_Y_END,scrubYear)));
  svg+='<line class="evtg-now-line" x1="'+scrubX+'" y1="'+PADT+'" x2="'+scrubX+'" y2="'+(H-PADB)+'"></line>';
  svg+='<text class="evtg-now-label" x="'+scrubX+'" y="'+(PADT-4)+'" text-anchor="middle">'+evtgYearLabel(scrubYear)+"</text>";
  svg+="</svg>";
  return svg;
}
function evtgSparkSVG(c){
  var W=240,H=70,PAD=5;
  function xOf(yr){return PAD+(yr-EVTG_Y_START)/(EVTG_Y_END-EVTG_Y_START)*(W-PAD*2)}
  function yOf(v){return PAD+(1-v/100)*(H-PAD*2)}
  var pts=c.points,col=evtgColorFor(c.id),scrubYear=evtgState.scrubYear;
  var svg='<svg class="evtg-spark-svg" viewBox="0 0 '+W+' '+H+'">';
  var topPath="M"+pts.map(function(p){return xOf(p.year)+","+yOf(p.reality)}).join(" L");
  var botPath=" L"+pts.slice().reverse().map(function(p){return xOf(p.year)+","+yOf(p.belief)}).join(" L")+" Z";
  svg+='<path class="evtg-area-gap" d="'+topPath+botPath+'" fill="'+col+'"></path>';
  ["reality","belief"].forEach(function(key){
    var cls=key==="reality"?"evtg-line-reality":"evtg-line-belief";
    var solidPts=pts.filter(function(p){return p.year<=scrubYear});
    var dashPts=pts.filter(function(p){return p.year>=scrubYear});
    if(solidPts.length>=2)svg+='<path class="'+cls+'" d="M'+solidPts.map(function(p){return xOf(p.year)+","+yOf(p[key])}).join(" L")+'" stroke="'+col+'"></path>';
    if(dashPts.length>=2)svg+='<path class="'+cls+' evtg-line-proj" d="M'+dashPts.map(function(p){return xOf(p.year)+","+yOf(p[key])}).join(" L")+'" stroke="'+col+'"></path>';
  });
  svg+="</svg>";
  return svg;
}
// openDossier only has atlas/tree/human/trend/ledger/country branches — theses
// don't use the side-panel dossier at all, they switch to the Thesis tab and
// scroll/highlight the matching card (see todayGoToThesis). Branch here instead
// of silently leaving the dossier panel open with stale content for a reg it
// doesn't handle.
function evtgOpenCurve(c){
  if(!c)return;
  if(c.kind==="thesis")todayGoToThesis(c.dossierId);
  else openDossier(c.dossierReg,c.dossierId);
}
function evtgRenderSmallMultiples(curves){
  var el=$("evtg-small-grid");if(!el)return;
  el.innerHTML=curves.map(function(c){
    var gap=Math.round(Math.abs(evtgGapAt(c,evtgState.scrubYear)));
    var due=c.killYear!=null&&c.killYear<=nowYear();
    return'<div class="evtg-spark-card" data-cid="'+c.id+'"><div class="evtg-spark-hd"><div class="evtg-spark-name">'+esc(c.name.slice(0,44))+'</div><div class="evtg-spark-gap">gap '+gap+"</div></div>"+evtgSparkSVG(c)
      +(c.killYear!=null?'<button class="evtg-legend-log'+(due?" due":"")+'" data-cid="'+c.id+'" style="margin-top:6px" title="'+(due?"Falsifier year has passed — ":"")+'Log as a forecast">'+(due?"⇪ LOG (DUE)":"⇪ LOG AS FORECAST")+"</button>":"")
      +"</div>";
  }).join("");
  el.querySelectorAll(".evtg-spark-card").forEach(function(card){
    card.onclick=function(){var c=curves.filter(function(x){return x.id===card.dataset.cid})[0];evtgOpenCurve(c)};
  });
  el.querySelectorAll(".evtg-legend-log").forEach(function(btn){
    btn.onclick=function(e){
      e.stopPropagation();
      var c=curves.filter(function(x){return x.id===btn.dataset.cid})[0];
      if(c)evtgLogAsForecast(c);
    };
  });
}
function evtgRender(){
  var all=evtgAllCurves();
  evtgRenderLegend(all);
  var visible=evtgVisibleCurves();
  var wrapEl=$("evtg-chart-wrap"),gridEl=$("evtg-small-grid");
  if(evtgState.mode==="small"){
    if(wrapEl)wrapEl.style.display="none";
    if(gridEl)gridEl.style.display="grid";
    evtgRenderSmallMultiples(visible);
  }else{
    if(wrapEl)wrapEl.style.display="block";
    if(gridEl)gridEl.style.display="none";
    var svgEl=$("evtg-svg");
    if(svgEl)svgEl.outerHTML=evtgRenderOverlaySVG(visible);
    var newSvg=document.getElementById("evtg-svg");
    if(newSvg)newSvg.querySelectorAll(".evtg-group").forEach(function(g){
      g.onmouseenter=function(){evtgState.hoverId=g.dataset.cid;evtgApplyHover()};
      g.onmouseleave=function(){evtgState.hoverId=null;evtgApplyHover()};
      g.onclick=function(){var c=all.filter(function(x){return x.id===g.dataset.cid})[0];evtgOpenCurve(c)};
    });
  }
}
var evtgBuilt=false;
function buildEverything(){evtgRender();evtgBuilt=true}
(function(){
  var risingBtn=$("evtg-rising"),decliningBtn=$("evtg-declining"),indexedBtn=$("evtg-indexed"),
    smallBtn=$("evtg-small"),fsBtn=$("evtg-fullscreen"),yrEl=$("evtg-year"),yrLb=$("evtg-year-lb");
  if(!yrEl)return;
  // small-multiples is the default everywhere (overlaid spaghetti is opt-in)
  // but it's a default, not a lock — set once at init so a user who flips to
  // overlay keeps that choice across tab switches within the session, rather
  // than it snapping back every time they revisit the view.
  evtgState.mode="small";
  smallBtn.classList.toggle("on",evtgState.mode==="small");
  yrEl.value=evtgState.scrubYear;
  yrLb.textContent=evtgYearLabel(evtgState.scrubYear);
  yrEl.addEventListener("input",function(){
    evtgState.scrubYear=+yrEl.value;
    yrLb.textContent=evtgYearLabel(evtgState.scrubYear);
    if(evtgBuilt)evtgRender();
  });
  risingBtn.onclick=function(){
    evtgState.filter=evtgState.filter==="rising"?null:"rising";
    risingBtn.classList.toggle("on",evtgState.filter==="rising");
    decliningBtn.classList.remove("on");
    evtgRender();
  };
  decliningBtn.onclick=function(){
    evtgState.filter=evtgState.filter==="declining"?null:"declining";
    decliningBtn.classList.toggle("on",evtgState.filter==="declining");
    risingBtn.classList.remove("on");
    evtgRender();
  };
  indexedBtn.onclick=function(){
    evtgState.indexed=!evtgState.indexed;
    indexedBtn.classList.toggle("on",evtgState.indexed);
    evtgRender();
  };
  smallBtn.onclick=function(){
    evtgState.mode=evtgState.mode==="small"?"overlay":"small";
    smallBtn.classList.toggle("on",evtgState.mode==="small");
    evtgRender();
  };
  fsBtn.onclick=function(){
    var wrap=$("evtg-chart-wrap");
    if(document.fullscreenElement)document.exitFullscreen();
    else if(wrap&&wrap.requestFullscreen)wrap.requestFullscreen();
  };
})();

function buildThesisRegister(){
  var el=$("thesis-list");if(!el)return;
  el.innerHTML=THESES.map(function(th,i){
    var conf=th.confidence||th.conf||"med";
    var supports=(th.supports||[]).map(function(sid){
      var info=fromStoreId(sid);
      if(!info){
        // Try constraint lookup
        if(sid.startsWith("constraint.")){
          var cid=sid.replace("constraint.","");
          var cm=CONSTRAINTS.find(function(c){return c.id===sid||c.id===cid||c.title.toLowerCase().replace(/\s+/g,"-")===cid});
          var cnm=cm?cm.title:sid.replace("constraint.","").replace(/-/g," ");
          return'<span class="xchip" style="cursor:default;color:var(--faint)">'+esc(cnm)+"</span>";
        }
        var parts=sid.split(".");var prefix=parts[0];var rest=parts.slice(1).join(".");
        return'<span class="xchip" data-reg="'+prefix+'" data-id="'+rest+'">'+esc(sid)+"</span>";
      }
      var e2=Store.get(sid);var nm=e2?(e2.title||sid):sid;
      return'<span class="xchip" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc(nm)+"</span>";
    }).join("");
    var fcLinks=(th.forecast_ids||[]).map(function(fid){
      var fc=forecasts.find(function(f){return f.key===fid||f.id===fid});
      return fc?'<span class="fc-seed-tag">'+esc(fc.stmt.slice(0,40))+'…</span>':"";
    }).join("");
    var directCount=(th.links||[]).length;
    var thin=directCount<3;
    return'<div class="thesis-card'+(th.draft?" draft":"")+'">'
      +(thin?'<span class="thin-badge" title="'+directCount+' direct cross-registry link'+(directCount===1?"":"s")+' — strengthen before trusting the edge meter">THIN EVIDENCE</span>':"")
      +'<div class="thesis-num">'+(i+1)+'. THESIS</div>'
      +'<div class="thesis-stmt">'+esc(th.statement)+'</div>'
      +'<span class="thesis-conf '+conf+'">'+conf.toUpperCase()+'</span>'
      +'<div class="thesis-kill">'+esc(th.kill_condition)+'</div>'
      +(supports?'<div class="thesis-supports">'+supports+'</div>':"")
      +(fcLinks?'<div style="margin-top:8px">'+fcLinks+'</div>':"")
      +'</div>';
  }).join("");
  attachChipNavigation();
}

// ── SPINE VIEW ─────────────────────────────────────────────────────────────
function showThesisView(v){
  var lb=$("th-view-list"),sb=$("th-view-spine");
  if(lb)lb.classList.toggle("on",v==="list");
  if(sb)sb.classList.toggle("on",v==="spine");
  var listEl=$("thesis-list"),spineEl=$("thesis-spine-wrap");
  if(listEl)listEl.style.display=v==="list"?"block":"none";
  if(spineEl)spineEl.style.display=v==="spine"?"block":"none";
  if(v==="spine")buildThesisSpinePicker();
}
(function(){var lb=$("th-view-list"),sb=$("th-view-spine");if(lb)lb.onclick=function(){showThesisView("list")};if(sb)sb.onclick=function(){showThesisView("spine")}})();

function spineNeighborIds(id){
  var nb=Store.neighbors(id);
  return nb.out.map(function(e){return e.to}).concat(nb.in.map(function(e){return e.from}));
}
function spineLinked(aId,bId){
  var nb=Store.neighbors(aId);
  return nb.out.some(function(e){return e.to===bId})||nb.in.some(function(e){return e.from===bId});
}
function spineTypeOf(sid){
  if(sid.indexOf("constraint.")===0)return"constraint";
  if(sid.indexOf("atlas.")===0)return"atlas";
  if(sid.indexOf("tree.")===0)return"tree";
  if(sid.indexOf("human.")===0)return"human";
  if(sid.indexOf("window.")===0)return"window";
  return null;
}
function buildSpineData(th){
  var buckets={constraint:{},atlas:{},tree:{},human:{},window:{}};
  function add(sid){
    var t=spineTypeOf(sid);if(!t||sid===th.id||buckets[t][sid])return;
    var e=Store.get(sid);
    buckets[t][sid]={id:sid,title:e?(e.title||sid):sid};
  }
  var hop1=spineNeighborIds(th.id);
  hop1.forEach(add);
  var hop2=[];
  hop1.forEach(function(sid){spineNeighborIds(sid).forEach(function(x){hop2.push(x)})});
  hop2.forEach(add);
  var hop3=[];
  Object.keys(buckets.tree).forEach(function(sid){spineNeighborIds(sid).forEach(function(x){hop3.push(x)})});
  hop3.forEach(add);
  function toArr(bucket){return Object.keys(bucket).map(function(k){return bucket[k]}).slice(0,6)}
  return{constraint:toArr(buckets.constraint),atlas:toArr(buckets.atlas),tree:toArr(buckets.tree),human:toArr(buckets.human),window:toArr(buckets.window)};
}

var _spineSelTid=null;
function buildThesisSpinePicker(){
  var el=$("thesis-spine-picker");if(!el)return;
  if(!_spineSelTid&&THESES.length)_spineSelTid=THESES[0].id;
  el.innerHTML=THESES.map(function(th,i){
    var thin=(th.links||[]).length<3;
    return'<button class="spine-pick-btn'+(th.id===_spineSelTid?" on":"")+'" data-tid="'+esc(th.id)+'">'+(i+1)+". "+esc(th.statement.slice(0,44))+'…'+(thin?' <span class="thin-badge thin-badge-sm">THIN</span>':"")+'</button>';
  }).join("");
  el.querySelectorAll(".spine-pick-btn").forEach(function(btn){
    btn.onclick=function(){_spineSelTid=btn.dataset.tid;buildThesisSpinePicker();renderThesisSpineSVG(_spineSelTid)};
  });
  renderThesisSpineSVG(_spineSelTid);
}

var SPINE_COLS=[
  {key:"constraint",label:"CONSTRAINTS"},
  {key:"atlas",label:"ATLAS"},
  {key:"tree",label:"TREE"},
  {key:"human",label:"HUMANS"},
  {key:"window",label:"WINDOWS"}
];
function spineWrapText(text,x,y,maxW){
  var maxChars=Math.max(6,Math.floor(maxW/5.6));
  var t=text.length>maxChars?text.slice(0,maxChars-1)+"…":text;
  return'<text x="'+x+'" y="'+(y+4)+'" class="lb spine-node-text">'+esc(t)+"</text>";
}
function renderThesisSpineSVG(tid){
  var wrap=$("thesis-spine-svg-wrap");if(!wrap)return;
  var th=THESES.find(function(t){return t.id===tid});
  if(!th){wrap.innerHTML="";return}
  var data=buildSpineData(th);
  var directCount=(th.links||[]).length,thin=directCount<3;
  var cols=[{key:"root",label:"THESIS",items:[{id:th.id,title:th.statement.slice(0,58)+(th.statement.length>58?"…":""),root:true}]}]
    .concat(SPINE_COLS.map(function(c){return{key:c.key,label:c.label,items:data[c.key]||[]}}));

  var colW=190,nodeH=40,nodeGapY=12,padTop=42,padX=16;
  var maxRows=1;cols.forEach(function(c){maxRows=Math.max(maxRows,c.items.length||1)});
  var svgH=padTop+maxRows*(nodeH+nodeGapY)+16;
  var svgW=padX*2+cols.length*colW;

  var posMap={};
  var svg='<svg viewBox="0 0 '+svgW+' '+svgH+'" width="'+svgW+'" height="'+svgH+'" class="spine-svg">';
  cols.forEach(function(col,ci){
    var x=padX+ci*colW;
    svg+='<text x="'+(x+(colW-30)/2)+'" y="20" class="spine-col-lbl" text-anchor="middle">'+esc(col.label)+(col.items.length?" ("+col.items.length+")":"")+"</text>";
    var items=col.items.length?col.items:[{id:null,title:"— none via current links —",empty:true}];
    var totalH=items.length*(nodeH+nodeGapY)-nodeGapY;
    var startY=padTop+Math.max(0,(svgH-padTop-totalH)/2-8);
    var w=colW-30;
    items.forEach(function(item,ii){
      var y=startY+ii*(nodeH+nodeGapY);
      if(item.id)posMap[item.id]={x:x,y:y,w:w,h:nodeH,cx:x+w,cy:y+nodeH/2,cxL:x,cxR:x+w};
      var cls="tnode spine-node"+(item.root?" spine-root":"")+(item.empty?" spine-empty":"");
      svg+='<g class="'+cls+'"'+(item.id?' data-sid="'+esc(item.id)+'"':"")+'>';
      svg+='<rect class="bg" x="'+x+'" y="'+y+'" width="'+w+'" height="'+nodeH+'" rx="2"></rect>';
      svg+=spineWrapText(item.title,x+8,y+nodeH/2,w-16);
      svg+="</g>";
    });
  });
  // connectors — drawn for any real link between any two columns (not just adjacent), using Store.neighbors
  for(var ci=0;ci<cols.length;ci++){
    for(var cj=ci+1;cj<cols.length;cj++){
      var far=(cj-ci)>1;
      cols[ci].items.forEach(function(a){
        if(!a.id)return;
        cols[cj].items.forEach(function(b){
          if(!b.id||!spineLinked(a.id,b.id))return;
          var p1=posMap[a.id],p2=posMap[b.id];if(!p1||!p2)return;
          svg+='<path class="tedge spine-edge'+(far?" spine-edge-far":"")+'" d="M'+p1.cxR+','+p1.cy+" C"+(p1.cxR+30)+","+p1.cy+" "+(p2.cxL-30)+","+p2.cy+" "+p2.cxL+","+p2.cy+'"></path>';
        });
      });
    }
  }
  svg+="</svg>";
  wrap.innerHTML=(thin?'<div class="thin-evidence-banner">THIN EVIDENCE — this thesis has only '+directCount+" direct cross-registry link"+(directCount===1?"":"s")+". Strengthen before trusting the edge meter.</div>":"")+'<div class="spine-svg-scroll">'+svg+"</div>";
  wrap.querySelectorAll(".spine-node[data-sid]").forEach(function(g){
    g.addEventListener("click",function(){
      var sid=g.dataset.sid;var info=fromStoreId(sid);if(info)openDossier(info.reg,info.id);
    });
  });
}

// ── BRIEF DIGEST ──────────────────────────────────────────────────────────
// Round-robin index is read fresh from storage on every call (not hoisted as
// a module-level var) because buildBrief() now runs as part of buildToday(),
// which fires once eagerly during init - a module-level var assigned later
// in this same top-to-bottom script pass would still be undefined at that
// first call.
function buildBrief(){
  var el=$("brief-body");if(!el)return;
  var _briefThesisIdx=parseInt(storage.getItem("sv3-brief-thesis-idx")||"0")||0;
  var now=new Date();var lastSeen=storage.getItem("sv3-brief-last-seen")||"never";
  storage.setItem("sv3-brief-last-seen",now.toISOString().slice(0,10));
  var html="";
  // date header
  html+='<div style="font-size:9px;letter-spacing:.15em;color:var(--faint);margin-bottom:8px">'+now.toISOString().slice(0,10)+' · last viewed: '+lastSeen+'</div>';
  // resolutions owed
  var owed=forecasts.filter(function(f){return f.outcome===null&&f.dl&&new Date(f.dl)<new Date()});
  html+='<div class="brief-section"><h4>Resolutions Owed ('+owed.length+')</h4>';
  if(owed.length===0)html+='<div class="brief-item">All forecasts resolved or no deadlines passed ✓</div>';
  owed.slice(0,5).forEach(function(f){html+='<div class="brief-item urgent"><b>'+esc(f.stmt.slice(0,70))+'</b> — deadline '+esc(f.dl)+'</div>'});
  if(owed.length>5)html+='<div class="brief-item" style="color:var(--faint)">…and '+(owed.length-5)+' more</div>';
  html+="</div>";
  // patrol items due
  var patrolDue=[];
  Store.all().forEach(function(e){
    if(!e.signals||!e.signals.length)return;
    e.signals.forEach(function(sig){
      var ovr=Store._overrides||{};var lc=(ovr[e.id]&&ovr[e.id].signal_overrides&&ovr[e.id].signal_overrides[sig.label]&&ovr[e.id].signal_overrides[sig.label].last_checked)||sig.last_checked;
      var elapsed=(Date.now()-(lc?new Date(lc).getTime():0))/86400000;
      if(elapsed>sig.cadence_days)patrolDue.push({entity:e,sig:sig,overdue:Math.round(elapsed-sig.cadence_days)});
    });
  });
  patrolDue.sort(function(a,b){return b.overdue-a.overdue});
  html+='<div class="brief-section"><h4>Patrol Items Due ('+patrolDue.length+')</h4>';
  if(patrolDue.length===0)html+='<div class="brief-item">All signals current ✓</div>';
  patrolDue.slice(0,5).forEach(function(r){html+='<div class="brief-item"><b>'+esc(r.sig.label)+'</b> ('+esc(r.entity.title)+') — +'+r.overdue+'d overdue</div>'});
  if(patrolDue.length>5)html+='<div class="brief-item" style="color:var(--faint)">…and '+(patrolDue.length-5)+' more</div>';
  html+="</div>";
  // past half-life
  var staleEnts=Store.all().filter(function(e){return Store.staleStatus(e.id)==="stale"&&e.title});
  html+='<div class="brief-section"><h4>Past Half-Life ('+staleEnts.length+')</h4>';
  if(staleEnts.length===0)html+='<div class="brief-item">All entities within half-life ✓</div>';
  staleEnts.slice(0,5).forEach(function(e){html+='<div class="brief-item"><b>'+esc(e.title)+'</b> — '+esc(e.as_of||"unknown")+'</div>'});
  if(staleEnts.length>5)html+='<div class="brief-item" style="color:var(--faint)">…and '+(staleEnts.length-5)+' more</div>';
  html+="</div>";
  // windows entering final 12 months
  var nowYr=now.getFullYear();var urgent=TRENDS.filter(function(t){if(t.status==="closed")return false;var c=parseInt((t.expected_close||"").replace(/[±+?]/g,""));return c&&c-nowYr>=0&&c-nowYr<=1});
  html+='<div class="brief-section"><h4>Windows Closing Within 12 Months ('+urgent.length+')</h4>';
  if(!urgent.length)html+='<div class="brief-item">No windows in final year</div>';
  urgent.forEach(function(t){html+='<div class="brief-item urgent"><b>'+esc(t.name)+'</b> — closes '+esc(t.expected_close||"?")+'</div>'});
  html+="</div>";
  // thesis spotlight (round-robin)
  if(THESES.length){
    var th=THESES[_briefThesisIdx%THESES.length];
    _briefThesisIdx++;storage.setItem("sv3-brief-thesis-idx",String(_briefThesisIdx));
    html+='<div class="brief-section"><h4>Thesis Spotlight — Still Alive?</h4>'
      +'<div class="brief-thesis-spot">'
      +'<div class="bts-stmt">'+esc(th.statement)+'</div>'
      +'<div class="bts-kill">KILL: '+esc(th.kill_condition)+'</div>'
      +'</div></div>';
  }
  el.innerHTML=html;
  // COPY button
  var cpBtn=$("brief-copy-btn");if(cpBtn)cpBtn.onclick=function(){
    var md=["# BRIEF — "+now.toISOString().slice(0,10),"","## Resolutions Owed"];
    owed.forEach(function(f){md.push("- "+f.stmt+" (deadline "+f.dl+")")});
    md.push("","## Patrol Due");patrolDue.slice(0,5).forEach(function(r){md.push("- "+r.sig.label+" ("+r.entity.title+") +"+r.overdue+"d")});
    md.push("","## Past Half-Life");staleEnts.slice(0,5).forEach(function(e){md.push("- "+e.title)});
    if(THESES.length){var th2=THESES[(_briefThesisIdx-1)%THESES.length];md.push("","## Thesis Spotlight","",th2.statement,"","Kill: "+th2.kill_condition)}
    try{navigator.clipboard.writeText(md.join("\n")).then(function(){cpBtn.textContent="⎘ Copied!";setTimeout(function(){cpBtn.textContent="⎘ Copy as Markdown"},1500)})}catch(e){}
  };
}

// ── COPY LINK in dossier ──────────────────────────────────────────────────
(function(){
  var dbody=$("dbody");if(!dbody)return;
  var dhead=$("dhead");if(!dhead)return;
  var clBtn=document.createElement("button");clBtn.className="btn";clBtn.title="Copy link to this entity";
  clBtn.textContent="⎘";clBtn.style.cssText="font-size:11px;padding:3px 7px;color:var(--faint);margin-left:auto";
  clBtn.onclick=function(){
    if(!dossierCurrent)return;
    try{var url=location.origin+location.pathname+"#"+dossierCurrent.reg+":"+dossierCurrent.id;navigator.clipboard.writeText(url).then(function(){clBtn.textContent="⎘ Copied!";setTimeout(function(){clBtn.textContent="⎘"},1200)})}catch(e){}
  };
  dhead.insertBefore(clBtn,$("dclose"));
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
  {reg:"action",id:"health",name:"⊕ DATA HEALTH — Freshness report",sub:"Stale entity list"},
  {reg:"action",id:"brief",name:"⊕ BRIEF — Weekly digest",sub:"Resolutions owed + patrol + thesis spotlight"},
  {reg:"action",id:"thesis",name:"⊕ THESIS — Register of explicit claims",sub:"5 theses with kill conditions"},
  {reg:"action",id:"kbd",name:"⊕ KEYBOARD MAP — Shortcuts",sub:"j/k navigate, ? this overlay, 1-9 tabs"}
];
function searchAllv2(q){
  if(!q||!q.trim()){
    var recent=getRecentJumps().map(function(r){return{reg:r.reg,id:r.id,name:r.name,sub:"Recently visited"}});
    return ACTION_CMDS.concat(recent).slice(0,16);
  }
  var res=Store.search(q);
  var subDesc={atlas:"Atlas",tree:"Tree",human:"Person",window:"Trend",country:"Country"};
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

// ── PHASE 5: MODELS AS MECHANICS ─────────────────────────────────────────

var MODELS=(Store.raw.models&&Store.raw.models.models)||[];
var MODEL_MAP={};MODELS.forEach(function(m){MODEL_MAP[m.id]=m});

// ── §6 Provenance tag (superscript) ──────────────────────────────────────
function provenanceTag(modelId){
  var m=MODEL_MAP[modelId];if(!m)return"";
  return'<sup class="model-tag" data-mid="'+modelId+'" title="'+esc(m.name)+' — '+esc(m.one_line)+' ('+esc(m.source)+')">⊢'+esc(m.name)+'</sup>';
}
function buildProvenanceFooter(){
  var el=$("prov-chips");if(!el||!MODELS.length)return;
  el.innerHTML=MODELS.map(function(m){
    var feat=(m.powers||[]).join(", ");
    return'<span class="prov-chip" data-mid="'+m.id+'" title="'+esc(m.one_line)+' — '+esc(m.source)+'">'+esc(m.name)+'</span>';
  }).join("");
  el.querySelectorAll(".prov-chip").forEach(function(el){
    el.onmouseenter=function(e){
      var m=MODEL_MAP[el.dataset.mid];if(!m)return;
      var tip=$("model-tooltip");tip.style.display="block";
      tip.innerHTML='<div class="mt-name">'+esc(m.name)+'</div><div class="mt-disc">'+esc(m.discipline)+'</div><div class="mt-line">'+esc(m.one_line)+'</div><div class="mt-src">'+esc(m.source)+'</div>';
      var r=el.getBoundingClientRect();tip.style.left=r.left+"px";tip.style.bottom=(window.innerHeight-r.top+4)+"px";
    };
    el.onmouseleave=function(){$("model-tooltip").style.display="none"};
  });
}
(function(){
  var btn=$("models-btn"),pop=$("models-popover");if(!btn||!pop)return;
  function closeModelsPopover(){pop.classList.remove("open");btn.classList.remove("on")}
  btn.onclick=function(e){e.stopPropagation();var open=pop.classList.toggle("open");btn.classList.toggle("on",open)};
  document.addEventListener("click",function(e){if(pop.classList.contains("open")&&!pop.contains(e.target)&&e.target!==btn)closeModelsPopover()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeModelsPopover()});
})();

// ── §1 Second-order chains ────────────────────────────────────────────────
function orderEffectsHTML(order_effects){
  if(!order_effects||!order_effects.length)return"";
  var CONF_DOT={hi:'<span class="oe-conf hi" title="High confidence">●</span>',md:'<span class="oe-conf md" title="Medium confidence">●</span>',lo:'<span class="oe-conf lo" title="Low confidence">●</span>'};
  var html='<div class="dsec order-effects-wrap"><div class="k">SECOND-ORDER CHAIN'+provenanceTag("model.second_order")+'</div><div class="oe-cascade">';
  var maxOrder=0;order_effects.forEach(function(e){if(e.order>maxOrder)maxOrder=e.order});
  order_effects.forEach(function(e){
    var indent=(e.order-1)*16;
    var isEdge=(e.order>=3);
    var entityChip="";
    if(e.entity){var info=fromStoreId(e.entity);if(info)entityChip='<span class="xchip oe-chip" data-reg="'+info.reg+'" data-id="'+info.id+'">'+esc((Store.get(e.entity)||{}).title||e.entity)+"</span>"}
    html+='<div class="oe-hop'+(isEdge&&e.order===maxOrder?" edge-hop":"")+(e.order===1?" oe-first":"")+'" style="padding-left:'+indent+'px">';
    html+=(CONF_DOT[e.confidence]||CONF_DOT.md)+'<span class="oe-text">'+esc(e.text)+"</span>";
    if(entityChip)html+=" "+entityChip;
    if(isEdge&&e.order===maxOrder)html+='<span class="oe-edge-tag">← edge lives here</span>';
    html+="</div>";
  });
  html+="</div></div>";
  return html;
}

// ── §4 Red Queen decay bar ────────────────────────────────────────────────
function rentDecayHTML(rent){
  if(!rent)return"";
  var pct=Math.round((rent.bypass_maturity||0)*100);
  var dying=pct>=50;
  var col=pct>=50?"var(--alert)":pct>=25?"var(--enr)":"var(--min)";
  var html='<div class="dsec rent-wrap"><div class="k">RENT DECAY'+provenanceTag("model.red_queen")+'</div>';
  html+='<div class="rent-src">'+esc(rent.source)+"</div>";
  html+='<div class="rent-bypass-label">Bypass candidate: '+esc(rent.bypass_candidate)+"</div>";
  html+='<div class="rent-bar-track"><div class="rent-bar-fill" style="width:'+pct+'%;background:'+col+'"></div><div class="rent-bar-pct">'+pct+"% mature</div></div>";
  html+='<div class="rent-meta">Half-life est: '+esc(String(rent.half_life_estimate_years))+" yrs · as of "+esc(rent.maturity_as_of||"")+"</div>";
  html+='<div class="rent-note">'+esc(rent.decay_note)+"</div>";
  if(dying)html+='<div class="rent-dying-banner">RENT DYING — bypass approaching parity. Date-stamp and discount.</div>';
  html+="</div>";
  return html;
}

// ── §7 Margin of safety ───────────────────────────────────────────────────
function marginIndicatorHTML(margin,confidence){
  if(!margin||!margin.tightness)return"";
  var t=margin.tightness;
  var col={wide:"var(--min)",adequate:"var(--min)",thin:"var(--enr)",none:"var(--alert)"}[t]||"var(--faint)";
  var label={wide:"WIDE MARGIN",adequate:"ADEQUATE MARGIN",thin:"THIN MARGIN",none:"NO MARGIN"}[t]||t.toUpperCase();
  var html='<div class="dsec margin-wrap"><div class="k">MARGIN OF SAFETY'+provenanceTag("model.margin_of_safety")+'</div>';
  html+='<div class="margin-badge" style="color:'+col+'">'+label+"</div>";
  if(margin.buffer_note)html+='<div class="margin-note">'+esc(margin.buffer_note)+"</div>";
  if(margin.breaks_at)html+='<div class="margin-breaks">Breaks at: '+esc(margin.breaks_at)+"</div>";
  if((confidence==="hi"||confidence==="hi")&&(t==="thin"||t==="none"))
    html+='<div class="overconfident-banner">OVERCONFIDENT-THIN — high conviction, low buffer. The dangerous quadrant.</div>';
  html+="</div>";
  return html;
}

// ── §3 Edge meter ─────────────────────────────────────────────────────────
function edgeMeterHTML(entity){
  var ca=entity.crowd_awareness;
  if(ca===undefined||ca===null)return"";
  var cd=entity.consensus_delta_num||(entity.confidence==="hi"?0.7:entity.confidence==="med"?0.4:0.2);
  var s=Store.staleStatus(entity.id||"");
  var fresh=s==="fresh"?1.0:s==="aging"?0.75:0.4;
  var edge=cd*(1-ca)*fresh;
  var edgePct=Math.round(edge*100);
  var trend=entity.awareness_trend||"flat";
  var trendArrow={rising:"↑",flat:"→",falling:"↓"}[trend]||"→";
  var trendColor={rising:"var(--enr)",flat:"var(--dim)",falling:"var(--min)"}[trend]||"var(--dim)";
  var col=edgePct>40?"var(--min)":edgePct>20?"var(--enr)":"var(--faint)";
  var html='<div class="dsec edge-meter-wrap"><div class="k">EDGE METER'+provenanceTag("model.reflexivity")+'</div>';
  html+='<div class="edge-bar-track"><div class="edge-bar-fill" style="width:'+edgePct+'%;background:'+col+'"></div>';
  html+='<div class="edge-bar-val" style="color:'+col+'">'+edgePct+"% edge</div></div>";
  html+='<div class="edge-meta">consensus_delta='+Math.round(cd*100)+'% × unpriced='+(100-Math.round(ca*100))+'% × freshness='+Math.round(fresh*100)+'%</div>';
  if(entity.awareness_trend)html+='<div class="edge-trend" style="color:'+trendColor+'">Crowd awareness '+trendArrow+' (as of '+esc(entity.awareness_as_of||"?")+")</div>";
  if(entity.edge_basis)html+='<div class="edge-basis">'+esc(entity.edge_basis)+"</div>";
  if(ca>=0.7)html+='<div class="consensus-banner">CONSENSUS — thesis may be correct but edge is gone. Right ≠ profitable.</div>';
  html+="</div>";
  return html;
}

// ── §9 Critical mass tipping ──────────────────────────────────────────────
function tippingHTML(entity){
  if(!entity.tipping_condition)return"";
  var dist=entity.distance_to_tip||"early";
  var distMap={pre:5,early:25,near:70,crossed:100};
  var pct=distMap[dist]||25;
  var col=dist==="crossed"?"var(--min)":dist==="near"?"var(--enr)":dist==="early"?"var(--dim)":"var(--faint)";
  var html='<div class="dsec tipping-wrap"><div class="k">TIPPING CONDITION'+provenanceTag("model.critical_mass")+'</div>';
  html+='<div class="tipping-cond">'+esc(entity.tipping_condition)+"</div>";
  html+='<div class="tipping-bar-track"><div class="tipping-bar-fill" style="width:'+pct+'%;background:'+col+'"></div>';
  html+='<div class="tipping-dist" style="color:'+col+'">'+dist.toUpperCase()+"</div></div>";
  if(dist==="crossed")html+='<div class="tipping-crossed">THRESHOLD CROSSED — promote this window from FORMING to OPEN?</div>';
  html+="</div>";
  return html;
}

// ── §8 Circle of competence ───────────────────────────────────────────────
function circleStripHTML(circle){
  if(!circle||!circle.length)return"";
  var html='<div class="dsec circle-wrap"><div class="k">CIRCLE OF COMPETENCE'+provenanceTag("model.circle_of_competence")+'</div><div class="circle-list">';
  circle.forEach(function(item){
    var col={in:"var(--min)",edge:"var(--enr)",out:"var(--alert)"}[item.status]||"var(--faint)";
    var tag={in:"IN-CIRCLE",edge:"EDGE",out:"OUT-OF-CIRCLE → delegate/verify"}[item.status]||item.status.toUpperCase();
    html+='<div class="circle-row"><div class="circle-status" style="color:'+col+'">'+esc(tag)+"</div>";
    html+='<div class="circle-claim">'+esc(item.claim)+"</div>";
    if(item.note)html+='<div class="circle-note">'+esc(item.note)+"</div>";
    html+="</div>";
  });
  return html+"</div></div>";
}

// ── §5 Bias check ─────────────────────────────────────────────────────────
var BIAS_CHECKS=[
  {id:"bias.anchoring",name:"Anchoring",prompt:"Did I generate my own number before reading consensus?",auto_trigger:null,applies_to:["human","window","thesis","atlas"]},
  {id:"bias.confirmation",name:"Confirmation",prompt:"What would CHANGE my mind? Is it written down with a date?",auto_trigger:null,applies_to:["human","window","thesis"]},
  {id:"bias.sunk_cost",name:"Sunk Cost",prompt:"Would I enter this position today at this price?",auto_trigger:null,applies_to:["human","window"]},
  {id:"bias.narrative",name:"Narrative",prompt:"Am I holding a story or a mechanism? Can I draw the causal arrows?",auto_trigger:null,applies_to:["human","window","thesis"]},
  {id:"bias.recency",name:"Recency",prompt:"Is this a trend or a cycle? Where are we in the cycle?",auto_trigger:null,applies_to:["human","window","thesis","atlas"]},
  {id:"bias.survivorship",name:"Survivorship",prompt:"Am I studying winners only? Where are the dead bodies?",auto_trigger:"no_dead_bodies",applies_to:["human","window","thesis"]},
  {id:"bias.goodhart",name:"Goodhart/Gresham",prompt:"Has this watched quantity become a target? A gamed signal stops measuring reality.",auto_trigger:"single_signal",applies_to:["constraint","atlas","thesis"]},
  {id:"bias.regression",name:"Regression to Mean",prompt:"Is this an extreme? Extremes revert. Base rate says average follows.",auto_trigger:"high_anatomy_score",applies_to:["human","thesis","window"]}
];

function evaluateBiasAutoTriggers(reg,entity){
  var triggered=[];
  BIAS_CHECKS.forEach(function(bc){
    if(!bc.auto_trigger)return;
    if(bc.id==="bias.survivorship"){
      if(reg==="human"){
        var h=entity;
        var hasDeadBodies=(h.dead_bodies&&h.dead_bodies.length>0);
        if(!hasDeadBodies)triggered.push(bc.id);
      }
    }
    if(bc.id==="bias.goodhart"){
      var sigs=entity.signals||[];
      if(sigs.length===1)triggered.push(bc.id);
    }
    if(bc.id==="bias.regression"){
      if(reg==="human"){
        var bets=entity.bets||[];
        var scored=bets.filter(function(b){return b.anatomy});
        scored.forEach(function(b){
          var a=b.anatomy,comp=Object.values(a).reduce(function(s,v){return s+(v||0)},0);
          if(comp>=25)triggered.push(bc.id);
        });
      }
      if(reg==="thesis"){
        var txt=(entity.statement||"")+(entity.body||"");
        if(/\b(best|largest|first|record|unprecedented|only|biggest|greatest)\b/i.test(txt))triggered.push(bc.id);
      }
    }
  });
  return[...new Set(triggered)];
}

function autoFlagHTML(reg,entity){
  var triggered=evaluateBiasAutoTriggers(reg,entity);
  if(!triggered.length)return"";
  var html='<div class="auto-flags">';
  triggered.forEach(function(bid){
    var bc=BIAS_CHECKS.find(function(b){return b.id===bid});if(!bc)return;
    html+='<div class="auto-flag">⚠ '+esc(bc.name)+' — '+esc(bc.prompt)+"</div>";
  });
  return html+"</div>";
}

var _biasEntity=null,_biasReg=null;
function openBiasCheck(reg,entity){
  _biasReg=reg;_biasEntity=entity;
  var modal=$("bias-modal");if(!modal)return;
  var hdr=$("bias-header");if(hdr)hdr.textContent="BIAS CHECK — "+esc(entity.title||entity.name||entity.statement||"?").slice(0,60);
  var triggered=evaluateBiasAutoTriggers(reg,entity);
  var lsKey="sv3-bias-"+reg+"-"+(entity.id||"");
  var saved=JSON.parse(storage.getItem(lsKey)||"{}");
  var html="";
  BIAS_CHECKS.forEach(function(bc){
    var isAuto=triggered.includes(bc.id);
    var checked=saved[bc.id]||false;
    html+='<div class="bias-row'+(isAuto?" auto-triggered":"")+'">';
    html+='<input type="checkbox" class="bias-chk" data-bid="'+bc.id+'"'+(checked?" checked":"")+'>';
    html+='<div class="bias-row-body"><div class="bias-row-name">'+esc(bc.name)+(isAuto?' <span class="bias-auto-badge">AUTO</span>':"")+"</div>";
    html+='<div class="bias-row-prompt">'+esc(bc.prompt)+"</div></div></div>";
  });
  var listEl=$("bias-checks-list");if(listEl)listEl.innerHTML=html;
  var saveBtn=$("bias-save-btn");
  if(saveBtn)saveBtn.onclick=function(){
    var result={};modal.querySelectorAll(".bias-chk").forEach(function(cb){result[cb.dataset.bid]=cb.checked});
    storage.setItem(lsKey,JSON.stringify(result));modal.style.display="none";
  };
  modal.style.display="flex";
}

function getBiasStatus(reg,entityId){
  var lsKey="sv3-bias-"+reg+"-"+entityId;
  var saved=JSON.parse(storage.getItem(lsKey)||"null");
  if(!saved)return"not-run";
  var total=BIAS_CHECKS.length;var checked=Object.values(saved).filter(Boolean).length;
  return checked>=total?"complete":"partial";
}

function biasCheckBtnHTML(reg,entity){
  var status=getBiasStatus(reg,entity.id||"");
  var col=status==="complete"?"var(--min)":status==="partial"?"var(--enr)":"var(--faint)";
  var label=status==="not-run"?"BIAS CHECK: not run":status==="partial"?"BIAS CHECK: partial":"BIAS CHECK: ✓";
  return'<div class="bias-check-section"><button class="btn bias-open-btn" style="color:'+col+'" data-reg="'+esc(reg)+'" data-eid="'+esc(entity.id||"")+'">'+label+"</button></div>";
}

function attachBiasOpenBtns(){
  document.querySelectorAll(".bias-open-btn").forEach(function(btn){
    btn.onclick=function(){
      var reg=btn.dataset.reg;var eid=btn.dataset.eid;
      var entityMap={atlas:NMAP,tree:TREE_MAP,human:HUMAN_MAP,trend:TREND_MAP,thesis:null};
      var entity;
      if(reg==="thesis")entity=THESES.find(function(t){return t.id===eid||t.id===("thesis."+eid)});
      else{var m=entityMap[reg];if(m)entity=m[eid];}
      if(entity)openBiasCheck(reg,entity);
    };
  });
}

// ── §2 Inversion ──────────────────────────────────────────────────────────
var _invertMode=false;
function toggleInvert(){
  if(!dossierCurrent)return;
  if(dossierCurrent.reg==="country")return;
  _invertMode=!_invertMode;
  var btn=$("invert-btn");if(btn)btn.classList.toggle("on",_invertMode);
  if(_invertMode)renderInvertedDossier(dossierCurrent.reg,dossierCurrent.id);
  else openDossier(dossierCurrent.reg,dossierCurrent.id,false);
}
$("invert-btn").onclick=toggleInvert;

function renderInvertedDossier(reg,id){
  var b="";
  if(reg==="thesis"){
    var th=THESES.find(function(t){return t.id===id||t.id.replace("thesis.","")===id});
    if(!th)return;
    setDHead("THESIS — INVERTED","var(--alert)","What makes this FALSE?","INVERSION VIEW");
    b+='<div class="invert-header">KILL CONDITION</div>';
    b+='<div class="invert-kill">'+esc(th.kill_condition)+"</div>";
    b+=makeDSec("FALSIFICATION PROMPT","What would make me wrong about: "+esc(th.statement));
    var linked=forecasts.filter(function(f){return(th.forecast_ids||[]).includes(f.key||f.id)});
    if(linked.length){
      b+='<div class="dsec"><div class="k">LINKED FORECASTS — INVERTED (showing 1−p)</div>';
      linked.forEach(function(f){b+='<div style="font-size:11px;color:var(--enr);margin-bottom:4px">'+esc(f.stmt)+' <b>p='+(Math.round((1-f.p)*100))+'%</b> (inverted)</div>'});
      b+="</div>";
    }
    b+=autoFlagHTML("thesis",th);
    b+=edgeMeterHTML(th);
    b+=marginIndicatorHTML(th.margin,th.confidence);
  }else if(reg==="trend"){
    var t=TREND_MAP[id];if(!t)return;
    setDHead("TREND — INVERTED","var(--alert)","What kills this window?","INVERSION VIEW");
    b+='<div class="invert-header">DECAY LOGIC</div><div class="invert-kill">'+esc(t.decay_logic)+"</div>";
    b+=makeDSec("FALSIFICATION PROMPT","What would confirm this window is already dead?");
    var dying=forecasts.filter(function(f){return f.outcome===null&&(f.stmt.toLowerCase().includes(t.name.toLowerCase()))});
    if(dying.length){
      b+='<div class="dsec"><div class="k">RELATED FORECASTS — INVERTED</div>';
      dying.slice(0,3).forEach(function(f){b+='<div style="font-size:11px;color:var(--enr);margin-bottom:4px">'+esc(f.stmt)+' <b>p='+(Math.round((1-f.p)*100))+'%</b> (inverted)</div>'});
      b+="</div>";
    }
    if(t.future_paths&&t.future_paths.length){
      b+='<div class="dsec"><div class="k">PATHS THAT KILL IT</div>';
      t.future_paths.slice(0,3).forEach(function(fp){
        b+='<div style="font-size:11px;color:var(--enr);margin-bottom:4px">'+esc(fp.path)+' — Falsifier: '+esc(fp.falsifier)+"</div>";
      });
      b+="</div>";
    }
    b+=autoFlagHTML("trend",t);
    b+=edgeMeterHTML(t);
  }else if(reg==="human"){
    var h=HUMAN_MAP[id];if(!h)return;
    setDHead("HUMAN — INVERTED","var(--alert)",h.name,"INVERSION VIEW");
    b+=makeDSec("WHAT WOULD MAKE THIS BET FALSE?","What assumption in "+esc(h.name)+"'s bet pattern is most likely wrong?");
    if(h.dead_bodies&&h.dead_bodies.length){
      b+='<div class="dsec"><div class="k">THE DEAD BODIES (same bet, wrong outcome)</div>';
      h.dead_bodies.forEach(function(db){b+='<div class="dead-row invert-dead"><b>'+esc(db.name)+"</b> — "+esc(db.why)+"</div>"});
      b+="</div>";
    }
    b+=autoFlagHTML("human",h);
  }else if(reg==="ledger"){
    var info=LEDGER_LAYER_MAP[id];if(!info)return;
    var layer=info.layer;
    setDHead("LEDGER — INVERTED","var(--alert)","What breaks this moat?","INVERSION VIEW");
    b+='<div class="invert-header">DECAY NOTE</div><div class="invert-kill">'+esc(layer.moat.decay_note)+"</div>";
    b+=makeDSec("FALSIFICATION PROMPT","What would have to be true for "+esc(layer.name)+"'s "+esc(layer.moat.type==="none"?"lack of a moat":layer.moat.type)+" to flip — i.e. for capture to stop tracking (or start tracking) the value created here?");
    if(layer.migration&&layer.migration.length){
      var first=layer.migration[0],last=layer.migration[layer.migration.length-1];
      var dir=last.pool_share_0_100>=first.pool_share_0_100?"gaining":"losing";
      b+=makeDSec("MIGRATION CHECK",esc(layer.name)+" has been "+dir+" profit-pool share ("+first.year+": "+first.pool_share_0_100+"% → "+last.year+": "+last.pool_share_0_100+"%) — the inversion question is what specifically reverses that direction.");
    }
  }else if(reg==="atlas"){
    var n=NMAP[id];if(!n)return;
    setDHead("CHOKEPOINT — INVERTED","var(--alert)","What makes this stop binding?","INVERSION VIEW");
    b+='<div class="invert-header">CASCADE IF DISRUPTED</div><div class="invert-kill">'+esc(n.cs||"—")+"</div>";
    b+=makeDSec("FALSIFICATION PROMPT","What would have to happen for "+esc(n.nm)+" to stop binding — i.e. for a substitute to close the lead time to replace ("+esc(n.ld||"—")+") faster than expected?");
    var treeLinks=(TREE||[]).filter(function(t){return(t.xref&&t.xref.atlas||[]).includes(n.id)}).map(function(t){return t.id});
    if(treeLinks.length)b+=chipList(treeLinks,"tree","TREE PATHS THAT COULD BYPASS THIS");
    b+=autoFlagHTML("atlas",n);
  }else if(reg==="tree"){
    var tn=TREE_MAP[id];if(!tn)return;
    setDHead("TECH TREE — INVERTED","var(--alert)","What breaks this dependency?","INVERSION VIEW");
    b+='<div class="invert-header">MECHANISM</div><div class="invert-kill">'+esc(tn.mech)+"</div>";
    b+=makeDSec("FALSIFICATION PROMPT","What would have to fail for "+esc(tn.lb)+" to no longer hold — i.e. for one of its prerequisites to be removed, substituted, or delayed?");
    if(tn.requires&&tn.requires.length)b+=chipList(tn.requires,"tree","PREREQUISITES THAT COULD BE PULLED");
    var children=(TREE_CHILDREN[tn.id]||[]);
    if(children.length)b+=chipList(children,"tree","DOWNSTREAM NODES THAT WOULD BREAK");
    b+=autoFlagHTML("tree",tn);
  }
  $("dbody").innerHTML=b;
  attachChipNavigation();attachBiasOpenBtns();
}

// Override openDossier to reset invert mode
var _origOpenDossier=openDossier;
openDossier=function(reg,id,pushHistory){
  _invertMode=false;var btn=$("invert-btn");if(btn)btn.classList.remove("on");
  _origOpenDossier(reg,id,pushHistory);
};

// `i` key to toggle invert
document.addEventListener("keydown",function(e){
  if(e.target.matches&&e.target.matches("input,textarea,select"))return;
  if(e.key==="i"&&dossierCurrent)toggleInvert();
});

// ── Inject Phase 5 sections into existing dossier renderers ───────────────
// Patch renderAtlasDossier to add rent decay bar + bias check
var _origRenderAtlas=renderAtlasDossier;
renderAtlasDossier=function(n){
  _origRenderAtlas(n);
  if(!n)return;
  var extra="";
  var raw=Store.raw.atlas;
  var rawNode=(raw&&raw.nodes||[]).find(function(nd){return nd.id==="atlas."+n.id});
  if(rawNode&&rawNode.rent)extra+=rentDecayHTML(rawNode.rent);
  extra+=biasCheckBtnHTML("atlas",n);
  extra+=autoFlagHTML("atlas",n);
  if(extra){var dbody=$("dbody");if(dbody)dbody.innerHTML+=extra}
  attachBiasOpenBtns();
};

// Patch renderTreeDossier
var _origRenderTree=renderTreeDossier;
renderTreeDossier=function(n){
  _origRenderTree(n);
};

// Patch renderTrendDossier to add order_effects, tipping, edge meter, bias
var _origRenderTrend=renderTrendDossier;
renderTrendDossier=function(t){
  _origRenderTrend(t);
  if(!t)return;
  var raw=Store.raw.windows;
  var rawWin=(raw&&raw.windows||[]).find(function(w){return w.id==="window."+t.id});
  var extra="";
  if(rawWin){
    if(rawWin.order_effects&&rawWin.order_effects.length)extra+=orderEffectsHTML(rawWin.order_effects);
    if(rawWin.tipping_condition)extra+=tippingHTML(rawWin);
  }
  extra+=edgeMeterHTML(Object.assign({},t,rawWin||{}));
  extra+=biasCheckBtnHTML("trend",t);
  extra+=autoFlagHTML("trend",t);
  if(extra){var dbody=$("dbody");if(dbody)dbody.innerHTML+=extra}
  attachChipNavigation();attachBiasOpenBtns();
};

// Patch buildScenarios to show order_effects in scenario cards
var _origBuildScenarios=buildScenarios;
buildScenarios=function(){
  _origBuildScenarios();
  // Add order_effects expand to each scenario card
  var tbody=$("scenarios-wrap");if(!tbody)return;
  tbody.querySelectorAll(".card").forEach(function(card){
    var btn=card.querySelector("[data-sc]");if(!btn)return;
    var scId=btn.dataset.sc;
    var sc=SCENARIOS.find(function(s){return s.id===scId});
    if(!sc)return;
    var rawSc=(Store.raw.scenarios&&Store.raw.scenarios.scenarios||[]).find(function(s){return s.id==="scenario."+scId||s.id===scId});
    if(!rawSc||!rawSc.order_effects||!rawSc.order_effects.length)return;
    var oeDiv=document.createElement("div");oeDiv.className="sc-oe-preview";
    var html='<div class="sc-oe-toggle btn" style="font-size:9px;margin-top:6px;color:var(--dim)">▸ SECOND-ORDER CHAIN</div>';
    html+='<div class="sc-oe-body" style="display:none">'+orderEffectsHTML(rawSc.order_effects)+"</div>";
    oeDiv.innerHTML=html;
    var tog=oeDiv.querySelector(".sc-oe-toggle"),body=oeDiv.querySelector(".sc-oe-body");
    tog.onclick=function(){
      var v=body.style.display==="none";body.style.display=v?"block":"none";tog.textContent=(v?"▾":"▸")+" SECOND-ORDER CHAIN";
      if(v)setTimeout(function(){attachChipNavigation()},0);
    };
    card.appendChild(oeDiv);
  });
};

// Patch buildThesisRegister to add margin, edge, invert, bias per thesis
var _origBuildThesis=buildThesisRegister;
buildThesisRegister=function(){
  _origBuildThesis();
  var el=$("thesis-list");if(!el)return;
  el.querySelectorAll(".thesis-card").forEach(function(card,i){
    var th=THESES[i];if(!th)return;
    var extra="";
    extra+=edgeMeterHTML(th);
    extra+=marginIndicatorHTML(th.margin,th.confidence);
    extra+=autoFlagHTML("thesis",th);
    extra+=biasCheckBtnHTML("thesis",th);
    // INVERT button per card
    var invertBtn=document.createElement("button");invertBtn.className="btn thesis-invert-btn";
    invertBtn.title="Invert — what makes this false?";invertBtn.textContent="INVERT";
    invertBtn.onclick=function(){
      switchTab("thesis");
      var thId=th.id.replace("thesis.","");
      dossierCurrent={reg:"thesis",id:thId};
      _invertMode=true;
      var iBtn=$("invert-btn");if(iBtn)iBtn.classList.add("on");
      var dossier=$("dossier");if(dossier)dossier.classList.add("open");
      renderInvertedDossier("thesis",th.id);
    };
    // SHARE button per card
    var shareBtn=document.createElement("button");shareBtn.className="btn thesis-share-btn";
    shareBtn.title="Copy deep-link + shareable text";shareBtn.textContent="⎘ Share";
    shareBtn.onclick=function(){
      var text=shareThesisText(th);
      var reset=function(){setTimeout(function(){shareBtn.textContent="⎘ Share"},1500)};
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){shareBtn.textContent="⎘ Copied!";reset()},function(){shareBtn.textContent="⎘ Copy failed";reset()});
      }else{shareBtn.textContent="⎘ Copy unsupported";reset()}
    };
    var extraDiv=document.createElement("div");extraDiv.innerHTML=extra;
    card.appendChild(invertBtn);card.appendChild(shareBtn);card.appendChild(extraDiv);
  });
  attachBiasOpenBtns();
};

// ── Share text + deep-link for a thesis ───────────────────────────────────
function shareThesisText(th){
  var score=todayEdgeScore(th);
  var edgePct=score>=0?Math.round(score*100)+"%":"—";
  var link=location.origin+location.pathname+"#/thesis?open="+encodeURIComponent(th.id);
  return"[THESIS] "+th.statement+"\n\nKILL CONDITION: "+th.kill_condition+"\nEDGE: "+edgePct+" (consensus_delta × unpriced × freshness)\nAs of "+(th.as_of||"—")+" · Slow Variables\n\n"+link;
}

// Patch renderHumanDossier to add circle, bias, auto-flags
var _origRenderHuman=renderHumanDossier;
renderHumanDossier=function(h){
  _origRenderHuman(h);
  if(!h)return;
  var rawH=(Store.raw.humans&&Store.raw.humans.people||[]).find(function(p){return p.id==="human."+h.id||p.id===h.id});
  var extra="";
  if(rawH&&rawH.circle)extra+=circleStripHTML(rawH.circle);
  extra+=autoFlagHTML("human",h);
  extra+=biasCheckBtnHTML("human",h);
  if(extra){var dbody=$("dbody");if(dbody)dbody.innerHTML+=extra}
  attachBiasOpenBtns();
};

// ── §10 Scale check (P2) ──────────────────────────────────────────────────
function scaleCheckHTML(entity){
  if(!entity||!entity.scale_break)return"";
  return'<div class="dsec scale-check-wrap"><div class="k">SCALE CHECK'+provenanceTag("model.scale")+'</div><div class="scale-q">What breaks at 10×?</div><div class="scale-note">'+esc(entity.scale_break)+"</div></div>";
}

// ── SIMULATE (Phase C) — causal loop diagram + perturb ──────────────────────
// The graph is induced from signed links only: any tree/atlas node that is
// either end of a link carrying `sign` gets pulled in, then every link (signed
// or not) between two nodes already in that set is drawn — signed edges solid
// (colored by sign), unsigned edges dashed "unverified". No full 176-node dump.
var SIM_RAW_MAP={};
(Store.raw.tree.nodes||[]).forEach(function(n){SIM_RAW_MAP[n.id]=n});
(Store.raw.atlas.nodes||[]).forEach(function(n){SIM_RAW_MAP[n.id]=n});
function simTitleOf(id){var n=SIM_RAW_MAP[id];return n?n.title:id}
function simRegOf(id){return id.indexOf("tree.")===0?"tree":id.indexOf("atlas.")===0?"atlas":"other"}

var simNodeIds=[],simEdges=[];
function buildSimGraph(){
  var nodeSet={};
  Object.keys(SIM_RAW_MAP).forEach(function(id){
    var n=SIM_RAW_MAP[id];
    (n.links||[]).forEach(function(l){if(l.sign!=null){nodeSet[id]=1;nodeSet[l.to]=1}});
  });
  simNodeIds=Object.keys(nodeSet);
  simEdges=[];
  simNodeIds.forEach(function(id){
    var n=SIM_RAW_MAP[id];if(!n)return;
    (n.links||[]).forEach(function(l){
      if(!nodeSet[l.to])return;
      simEdges.push({from:id,to:l.to,sign:l.sign!=null?l.sign:null,lag:l.lag_years||0,basis:l.sign_basis||""});
    });
  });
}
buildSimGraph();

// DFS cycle detection over the signed-edge subgraph only — small curated
// graph, so brute-force is fine (capped at 5 hops, dedup by node-set key).
function findSimLoops(){
  var signedAdj={};
  simEdges.forEach(function(e){if(e.sign!=null)(signedAdj[e.from]=signedAdj[e.from]||[]).push(e)});
  var loops=[],seen={};
  simNodeIds.forEach(function(start){
    (function dfs(node,path,signProduct){
      (signedAdj[node]||[]).forEach(function(e){
        if(e.to===start&&path.length>=2){
          var key=path.slice().sort().join("|");
          if(!seen[key]){seen[key]=1;loops.push({path:path.concat([start]),sign:signProduct*e.sign})}
          return;
        }
        if(path.indexOf(e.to)!==-1)return;
        if(path.length>=5)return;
        dfs(e.to,path.concat([e.to]),signProduct*e.sign);
      });
    })(start,[start],1);
  });
  return loops;
}
var simLoops=findSimLoops();

var simPos={};
function layoutSim(w,h){
  var cx=w/2,cy=h/2,r=Math.min(w,h)/2-70;
  simNodeIds.forEach(function(id,i){
    var a=(i/simNodeIds.length)*Math.PI*2-Math.PI/2;
    simPos[id]={x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};
  });
}

var simSelected=null,simValues={};
var SIM_NW=150,SIM_NH=34;
function renderSim(){
  var wrap=$("sim-graph-wrap"),svg=$("sim-svg");if(!wrap||!svg)return;
  var w=Math.max(600,wrap.clientWidth),h=Math.max(500,wrap.clientHeight);
  layoutSim(w,h);
  var ns="http://www.w3.org/2000/svg";
  svg.setAttribute("width",w);svg.setAttribute("height",h);svg.setAttribute("viewBox","0 0 "+w+" "+h);
  svg.innerHTML="";
  var defs=document.createElementNS(ns,"defs");
  function marker(id,color){var m=document.createElementNS(ns,"marker");m.setAttribute("id",id);m.setAttribute("viewBox","0 0 8 8");m.setAttribute("refX","7");m.setAttribute("refY","4");m.setAttribute("markerWidth","5");m.setAttribute("markerHeight","5");m.setAttribute("orient","auto");var p=document.createElementNS(ns,"path");p.setAttribute("d","M0 0 L8 4 L0 8 z");p.setAttribute("fill",color);m.appendChild(p);return m}
  defs.appendChild(marker("sim-arr-pos","#ff6b55"));defs.appendChild(marker("sim-arr-neg","#c0c0c0"));defs.appendChild(marker("sim-arr-un","#484848"));
  svg.appendChild(defs);

  simEdges.forEach(function(e){
    var a=simPos[e.from],b=simPos[e.to];if(!a||!b)return;
    var dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/dist,uy=dy/dist;
    var x1=a.x+ux*(SIM_NW/2+4),y1=a.y+uy*(SIM_NH/2+4);
    var x2=b.x-ux*(SIM_NW/2+10),y2=b.y-uy*(SIM_NH/2+10);
    var mx=(x1+x2)/2,my=(y1+y2)/2,nx=-uy*22,ny=ux*22;
    var cls=e.sign==null?"unsigned":e.sign>0?"sign-pos":"sign-neg";
    var mk=e.sign==null?"sim-arr-un":e.sign>0?"sim-arr-pos":"sim-arr-neg";
    var p=document.createElementNS(ns,"path");
    p.setAttribute("d","M"+x1+","+y1+" Q"+(mx+nx)+","+(my+ny)+" "+x2+","+y2);
    p.setAttribute("class","sim-edge "+cls);p.setAttribute("marker-end","url(#"+mk+")");
    svg.appendChild(p);
    if(e.sign!=null){
      var lt=document.createElementNS(ns,"text");lt.setAttribute("x",mx+nx);lt.setAttribute("y",my+ny-4);
      lt.setAttribute("class","sim-edge-label");lt.setAttribute("text-anchor","middle");
      lt.textContent=(e.sign>0?"+":"−")+(e.lag?" ·"+e.lag+"y":"");
      svg.appendChild(lt);
    }
  });

  simNodeIds.forEach(function(id){
    var p=simPos[id];if(!p)return;
    var g=document.createElementNS(ns,"g");
    g.setAttribute("class","sim-node"+(simSelected===id?" selected":""));
    g.setAttribute("transform","translate("+(p.x-SIM_NW/2)+","+(p.y-SIM_NH/2)+")");
    var bg=document.createElementNS(ns,"rect");bg.setAttribute("class","bg");bg.setAttribute("width",SIM_NW);bg.setAttribute("height",SIM_NH);bg.setAttribute("rx","2");g.appendChild(bg);
    var reg=document.createElementNS(ns,"text");reg.setAttribute("class","reg");reg.setAttribute("x",6);reg.setAttribute("y",11);reg.textContent=simRegOf(id).toUpperCase();g.appendChild(reg);
    var lbl=document.createElementNS(ns,"text");lbl.setAttribute("class","lb");lbl.setAttribute("x",6);lbl.setAttribute("y",25);
    var title=simTitleOf(id);lbl.textContent=title.length>20?title.slice(0,19)+"…":title;g.appendChild(lbl);
    var val=simValues[id]||0;
    if(Math.abs(val)>0.02){
      var pr=Math.min(18,4+Math.abs(val)*10);
      var pulse=document.createElementNS(ns,"circle");pulse.setAttribute("class","sim-pulse");
      pulse.setAttribute("cx",SIM_NW-10);pulse.setAttribute("cy",SIM_NH/2);pulse.setAttribute("r",pr);
      pulse.setAttribute("opacity",Math.min(.9,Math.abs(val)*.6+.2));
      pulse.setAttribute("fill",val>0?"#ff6b55":"#c0c0c0");
      g.insertBefore(pulse,bg.nextSibling);
    }
    g.addEventListener("click",function(){selectSimNode(id)});
    svg.appendChild(g);
  });
}
function selectSimNode(id){
  simSelected=id;
  $("sim-perturb-plus").disabled=false;$("sim-perturb-minus").disabled=false;
  renderSim();renderSimLeverage(id);
}
function renderSimLoopsList(){
  var el=$("sim-loops-list");if(!el)return;
  if(!simLoops.length){el.innerHTML="No closed signed loops in the curated set yet.";return}
  el.innerHTML=simLoops.map(function(lp,i){
    var tag=lp.sign>0?"R":"B";
    var names=lp.path.map(function(id){return simTitleOf(id).split(" — ")[0]}).join(" → ");
    return'<div class="sim-loop-row"><span class="sim-loop-tag '+tag+'">'+tag+(i+1)+'</span><span class="sim-loop-nodes">'+esc(names)+"</span></div>";
  }).join("");
}

// Discrete time-step propagation — not an ODE solver. Each tick, in-flight
// signals arrive (delayed by their edge's lag_years), then every node
// carrying signal re-emits along its own signed edges, damped 0.65× per hop
// so a reinforcing loop still settles instead of diverging.
var DAMPING=0.65,MAX_TICKS=10;
function cloneVals(v){var c={};Object.keys(v).forEach(function(k){c[k]=v[k]});return c}
function runPerturb(dir){
  if(!simSelected)return;
  simValues={};simValues[simSelected]=dir;
  var signedAdj={};simEdges.forEach(function(e){if(e.sign!=null)(signedAdj[e.from]=signedAdj[e.from]||[]).push(e)});
  var pending=[],history=[cloneVals(simValues)];
  Object.keys(simValues).forEach(function(nid){
    (signedAdj[nid]||[]).forEach(function(e){pending.push({node:e.to,val:simValues[nid]*e.sign*DAMPING,tick:Math.max(1,e.lag)})});
  });
  for(var t=1;t<=MAX_TICKS;t++){
    var arriving=pending.filter(function(p){return p.tick===t});
    pending=pending.filter(function(p){return p.tick!==t});
    var next=cloneVals(simValues);
    arriving.forEach(function(p){next[p.node]=(next[p.node]||0)+p.val});
    simValues=next;
    Object.keys(simValues).forEach(function(nid){
      var v=simValues[nid];if(Math.abs(v)<0.03)return;
      (signedAdj[nid]||[]).forEach(function(e){pending.push({node:e.to,val:v*e.sign*DAMPING,tick:t+Math.max(1,e.lag)})});
    });
    history.push(cloneVals(simValues));
  }
  var loopPeak={};
  simLoops.forEach(function(lp,i){
    var peak=0;history.forEach(function(snap){lp.path.forEach(function(nid){peak=Math.max(peak,Math.abs(snap[nid]||0))})});
    loopPeak[i]=peak;
  });
  renderSimDominant(loopPeak);
  renderSim();
}
function renderSimDominant(loopPeak){
  var el=$("sim-dominant");if(!el)return;
  if(!simLoops.length){el.textContent="No closed signed loops to compare.";return}
  var ranked=simLoops.map(function(lp,i){return{lp:lp,i:i,peak:loopPeak[i]||0}}).sort(function(a,b){return b.peak-a.peak});
  el.innerHTML=ranked.map(function(r){
    var tag=r.lp.sign>0?"R":"B";
    return'<div class="sim-dominant-row"><span class="sim-loop-tag '+tag+'">'+tag+(r.i+1)+"</span>peak |signal| "+r.peak.toFixed(2)+"</div>";
  }).join("");
}
function renderSimLeverage(id){
  var hd=$("sim-leverage-hd"),el=$("sim-leverage");if(!hd||!el)return;
  var model=MODEL_MAP["model.leverage_points"];
  if(!model||!model.ranked_list){hd.style.display="none";el.innerHTML="";return}
  hd.style.display="block";
  // Meadows distinguishes #7 (gain around a REINFORCING loop) from #8
  // (strength of a BALANCING loop) — don't collapse the two.
  var memberLoops=simLoops.filter(function(lp){return lp.path.indexOf(id)!==-1});
  var inReinforcing=memberLoops.some(function(lp){return lp.sign>0});
  var inBalancing=memberLoops.some(function(lp){return lp.sign<0});
  var rankNum=inReinforcing?7:inBalancing?8:12;
  var rank=model.ranked_list.filter(function(r){return r.rank===rankNum})[0];
  var note=inReinforcing
    ?"This node sits inside a detected reinforcing (R) loop — Meadows ranks reinforcing-loop gain above tweaking a parameter, but a strong balancing loop elsewhere can still cap it."
    :inBalancing
    ?"This node sits inside a detected balancing (B) loop — Meadows ranks the strength of a correcting loop above tweaking a parameter."
    :"This node has no detected signed loop through it yet — treat any nudge here as parameter-level (weak) leverage until a loop is authored.";
  el.innerHTML='<div class="sim-leverage-row"><span class="sim-leverage-rank">#'+rank.rank+'</span><span>'+esc(rank.point)+"</span></div>"
    +'<div style="margin-top:6px;color:var(--faint);font-size:9px">'+note+"</div>";
}
(function(){
  var pp=$("sim-perturb-plus"),pm=$("sim-perturb-minus"),rs=$("sim-reset");
  if(pp)pp.onclick=function(){runPerturb(1)};
  if(pm)pm.onclick=function(){runPerturb(-1)};
  if(rs)rs.onclick=function(){
    simValues={};simSelected=null;
    if(pp)pp.disabled=true;if(pm)pm.disabled=true;
    var hd=$("sim-leverage-hd");if(hd)hd.style.display="none";
    var lv=$("sim-leverage");if(lv)lv.innerHTML="";
    var dm=$("sim-dominant");if(dm)dm.innerHTML="Run a perturbation to see which loop currently dominates.";
    renderSim();
  };
})();
var simBuilt=false;
function buildSimulate(){renderSim();renderSimLoopsList();simBuilt=true}
window.addEventListener("resize",function(){if($("v-simulate").classList.contains("on"))renderSim()});

// ── LEDGER — value created vs. value captured ────────────────────────────
var LEDGER_LAYER_MAP={};
LEDGER_DOMAINS.forEach(function(dom){
  var did=dom.id.replace(/^domain\./,"");
  (dom.layers||[]).forEach(function(layer){
    LEDGER_LAYER_MAP[did+"::"+layer.id]={domain:dom,did:did,layer:layer};
  });
});
var ledgerYears=(function(){
  var ys={};LEDGER_DOMAINS.forEach(function(dom){(dom.layers||[]).forEach(function(l){(l.migration||[]).forEach(function(m){ys[m.year]=1})})});
  var arr=Object.keys(ys).map(Number).sort(function(a,b){return a-b});
  return arr.length?arr:[2026];
})();
var ledgerState={did:LEDGER_DOMAINS.length?LEDGER_DOMAINS[0].id.replace(/^domain\./,""):null,year:ledgerYears[Math.floor(ledgerYears.length/2)]||2026};
var ledgerBuilt=false,ledgerRaf=0;
function ledgerCurrentDomain(){var d=LEDGER_DOMAINS.filter(function(d){return d.id.replace(/^domain\./,"")===ledgerState.did})[0];return d||LEDGER_DOMAINS[0]}
function ledgerCurrentLayerKeys(){var dom=ledgerCurrentDomain();if(!dom)return[];var did=dom.id.replace(/^domain\./,"");return(dom.layers||[]).map(function(l){return{reg:"ledger",id:did+"::"+l.id}})}
function ledgerGap(layer){return(layer.value_captured.score_0_100||0)-(layer.value_created.score_0_100||0)}
function ledgerGapClass(layer){var g=ledgerGap(layer);return g>8?"rent":g<-8?"leak":"moat"}
function ledgerGapLabel(cls){return cls==="rent"?"RENT":cls==="leak"?"LEAK":"MOAT"}
// migration[] only has a handful of authored years — interpolate linearly between
// the two nearest instead of snapping, so the scrubber reads as continuous. Never
// extrapolate past the authored range; clamp to the first/last point instead.
function ledgerPoolShareAt(layer,year){
  var pts=(layer.migration||[]).slice().sort(function(a,b){return a.year-b.year});
  if(!pts.length)return 0;
  if(year<=pts[0].year)return pts[0].pool_share_0_100;
  if(year>=pts[pts.length-1].year)return pts[pts.length-1].pool_share_0_100;
  for(var i=0;i<pts.length-1;i++){
    var a=pts[i],b=pts[i+1];
    if(year>=a.year&&year<=b.year){
      var t=(year-a.year)/(b.year-a.year);
      return a.pool_share_0_100+(b.pool_share_0_100-a.pool_share_0_100)*t;
    }
  }
  return pts[pts.length-1].pool_share_0_100;
}
function ledgerLinkChipsHTML(links){
  if(!links||!links.length)return"";
  var groups={atlas:[],tree:[],human:[],other:[]};
  links.forEach(function(id){
    var info=fromStoreId(id);
    if(info)groups[info.reg].push(info.id);
    else groups.other.push(id.replace(/^constraint\./,""));
  });
  var html="";
  if(groups.atlas.length)html+=chipList(groups.atlas,"atlas","ATLAS CHOKEPOINTS");
  if(groups.tree.length)html+=chipList(groups.tree,"tree","TREE NODES");
  if(groups.human.length)html+=chipList(groups.human,"human","PEOPLE");
  if(groups.other.length){
    var c=CONSTRAINTS.filter(function(c){return groups.other.indexOf((c.id||"").replace(/^constraint\./,""))!==-1});
    html+='<div class="dsec"><div class="k">CONSTRAINTS</div><div class="chip-list">'
      +c.map(function(c){return'<span class="ledger-constraint-badge" title="'+esc(c.lead_time||"")+'">'+esc(c.title)+"</span>"}).join("")
      +"</div></div>";
  }
  return html;
}
function buildLedgerDomainPicker(){
  var el=$("ledger-domain-picker");if(!el)return;
  if(LEDGER_DOMAINS.length<2){el.innerHTML="";return}
  el.innerHTML=LEDGER_DOMAINS.map(function(dom){
    var did=dom.id.replace(/^domain\./,"");
    return'<button class="ttool'+(did===ledgerState.did?" on":"")+'" data-did="'+did+'">'+esc(dom.title)+"</button>";
  }).join("");
  el.querySelectorAll("button").forEach(function(btn){
    btn.onclick=function(){ledgerState.did=btn.dataset.did;buildLedgerAll()};
  });
}
function buildLedgerThesis(dom){
  var el=$("ledger-thesis");if(!el||!dom)return;
  el.innerHTML="<p>"+esc(dom.thesis||"")+provenanceTag("model.value_created_captured")+"</p>";
}
function buildLedgerForecast(dom){
  var el=$("ledger-forecast");if(!el)return;
  var f=dom&&dom.migration_forecast;
  if(!f){el.innerHTML="";return}
  el.innerHTML="<b>Next migration:</b> "+esc(f.statement)+' <span class="lf-kill"><b>Kill condition:</b> '+esc(f.kill_condition)+"</span>"+provenanceTag("model.value_migration");
}
function buildLedgerStack(dom){
  var el=$("ledger-stack");if(!el||!dom)return;
  var did=dom.id.replace(/^domain\./,"");
  var layers=(dom.layers||[]).slice().sort(function(a,b){return a.order-b.order});
  el.innerHTML=layers.map(function(layer){
    var cls=ledgerGapClass(layer);
    var cScore=layer.value_created.score_0_100,kScore=layer.value_captured.score_0_100;
    var fillCls=cls; // "rent" | "leak" | "moat" — drives the bar's gap color
    var moatTag=layer.moat.type==="none"?"NO MOAT":esc(layer.moat.type.toUpperCase());
    return'<div class="ledger-layer-row" data-key="'+did+"::"+layer.id+'">'
      +'<div class="ledger-layer-hd"><div class="ledger-layer-name">'+esc(layer.name)+'</div>'
      +'<div class="ledger-layer-gap-badge '+cls+'">'+ledgerGapLabel(cls)+"</div></div>"
      +'<div class="ledger-bar-track">'
        +'<div class="ledger-bar-half created"><div class="ledger-bar-fill created-fill '+fillCls+'" style="width:'+cScore+'%"></div></div>'
        +'<div class="ledger-spine"><div class="ledger-spine-chips"><span class="ledger-moat-chip">'+moatTag+"</span></div></div>"
        +'<div class="ledger-bar-half captured"><div class="ledger-bar-fill captured-fill '+fillCls+'" style="width:'+kScore+'%"></div></div>'
      +"</div>"
      +'<div class="ledger-layer-scores"><span>CREATED '+cScore+'</span><span>CAPTURED '+kScore+"</span></div>"
      +'<div class="ledger-layer-pool">pool share '+ledgerState.year+": "+Math.round(ledgerPoolShareAt(layer,ledgerState.year))+"%</div>"
    +"</div>";
  }).join("");
  el.querySelectorAll(".ledger-layer-row").forEach(function(row){
    row.onclick=function(){openDossier("ledger",row.dataset.key)};
  });
}
function needLedgerAnim(){return $("v-ledger").classList.contains("on")&&motionOK}
var ledgerParticles=null;
function ledgerFlowResize(){
  var svg=$("ledger-flow-svg"),wrap=$("ledger-stack-wrap");if(!svg||!wrap)return;
  var r=wrap.getBoundingClientRect();
  svg.setAttribute("width",r.width);svg.setAttribute("height",r.height);
  svg.setAttribute("viewBox","0 0 "+r.width+" "+r.height);
}
function ledgerFlowTick(now){
  ledgerRaf=0;
  var svg=$("ledger-flow-svg");if(!svg||!needLedgerAnim()){return}
  var wrap=$("ledger-stack-wrap"),wrapR=wrap.getBoundingClientRect();
  var rows=$("ledger-stack").querySelectorAll(".ledger-layer-row");
  if(!rows.length){ledgerRaf=requestAnimationFrame(ledgerFlowTick);return}
  var top=rows[0].getBoundingClientRect().top-wrapR.top;
  var bottom=rows[rows.length-1].getBoundingClientRect().bottom-wrapR.top;
  var height=Math.max(1,bottom-top);
  if(!ledgerParticles){
    ledgerParticles=[];
    for(var i=0;i<16;i++)ledgerParticles.push({x:20+Math.random()*(wrapR.width-40),t0:Math.random()*4000,speed:2600+Math.random()*1400});
  }
  var svgHtml="";
  ledgerParticles.forEach(function(p){
    var el=(now-p.t0)%p.speed/p.speed; // 0..1 progress top→bottom
    var y=top+el*height;
    // thin proportionally to how much value has been "captured" (retained) by
    // layers already passed — a particle that has crossed high-capture layers
    // has less left to give downstream, visualizing pooling vs. thinning.
    var passedFrac=0,rowCount=rows.length;
    for(var i=0;i<rowCount;i++){
      var rr=rows[i].getBoundingClientRect();
      var rowTop=rr.top-wrapR.top,rowBottom=rr.bottom-wrapR.top;
      if(y>rowBottom){
        var key=rows[i].dataset.key,info=LEDGER_LAYER_MAP[key];
        if(info)passedFrac+=(info.layer.value_captured.score_0_100||0)/100/rowCount;
      }
    }
    var remaining=Math.max(0.15,1-passedFrac);
    var r2=1.6*remaining+0.4;
    svgHtml+='<circle class="ledger-flow-particle" cx="'+p.x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r2.toFixed(2)+'" opacity="'+(0.6*remaining+0.1).toFixed(2)+'"></circle>';
  });
  svg.innerHTML=svgHtml;
  ledgerRaf=requestAnimationFrame(ledgerFlowTick);
}
function ledgerFlowStaticFrame(){
  // prefers-reduced-motion: one static paint instead of a running rAF loop,
  // same pattern as the starfield canvas and the atlas flow-arcs.
  var svg=$("ledger-flow-svg");if(!svg)return;
  ledgerFlowResize();
  svg.innerHTML='<rect x="0" y="0" width="100%" height="100%" fill="none"></rect>';
}
function ledgerKickFlow(){
  ledgerFlowResize();ledgerParticles=null;
  if(motionOK){if(!ledgerRaf)ledgerRaf=requestAnimationFrame(ledgerFlowTick)}
  else ledgerFlowStaticFrame();
}
(function(){var yr=$("ledger-year");if(!yr)return;
  yr.min=ledgerYears[0];yr.max=ledgerYears[ledgerYears.length-1];yr.value=ledgerState.year;
  var lb=$("ledger-year-lb");if(lb)lb.textContent=ledgerState.year;
  yr.addEventListener("input",function(){
    ledgerState.year=+yr.value;if(lb)lb.textContent=ledgerState.year;
    var dom=ledgerCurrentDomain();if(dom)buildLedgerStack(dom);
  });
})();
window.addEventListener("resize",function(){if($("v-ledger").classList.contains("on"))ledgerFlowResize()});
function buildLedgerAll(){
  var dom=ledgerCurrentDomain();
  buildLedgerDomainPicker();
  buildLedgerThesis(dom);
  buildLedgerForecast(dom);
  buildLedgerStack(dom);
  ledgerKickFlow();
}
function buildLedger(){
  if(!LEDGER_DOMAINS.length){var el=$("ledger-stack");if(el)el.innerHTML='<div class="helm-empty">No ledger domains seeded yet.</div>';return}
  buildLedgerAll();
  ledgerBuilt=true;
}
function ledgerScoreBarHTML(label,score,note){
  return'<div class="ledger-dsec-scorebar-wrap"><div style="display:flex;justify-content:space-between;font-size:9px;color:var(--dim)"><span>'+esc(label)+'</span><span>'+score+'/100</span></div>'
    +'<div class="ledger-dsec-scorebar"><div class="ledger-dsec-scorefill" style="width:'+score+'%;background:var(--rust)"></div></div>'
    +(note?'<div class="v" style="margin-top:2px">'+esc(note)+"</div>":"")+"</div>";
}
function renderLedgerDossier(key){
  var info=LEDGER_LAYER_MAP[key];if(!info)return;
  var layer=info.layer,dom=info.domain;
  var cls=ledgerGapClass(layer);
  setDHead("LEDGER — "+esc(dom.title),cls==="rent"?"var(--choke)":cls==="leak"?"var(--leak)":"var(--min)",
    layer.name,ledgerGapLabel(cls)+" &nbsp;"+confPill(dom.cf||"md"));
  var b="";
  b+='<div class="dsec"><div class="k">VALUE CREATED'+provenanceTag("model.value_created_captured")+'</div>'
    +ledgerScoreBarHTML("value created",layer.value_created.score_0_100,layer.value_created.mechanism)
    +'<div class="v" style="color:var(--dim);font-size:10px">'+esc(layer.value_created.basis)+"</div></div>";
  // Smiling Curve: margin sits highest at the two ends of a chain and lowest in
  // the middle — tag only applies to layers that are neither the first nor the
  // last in their domain, i.e. it's a real positional claim, not decoration.
  var orders=(dom.layers||[]).map(function(l){return l.order});
  var isMiddle=layer.order>Math.min.apply(null,orders)&&layer.order<Math.max.apply(null,orders);
  var vcConf=layer.value_captured.confidence;
  var vcConfBadge=vcConf==="asserted"?'<span class="conf lo" title="No disclosed metric backs this score — an editorial judgment call, not a measurement">ASSERTED</span>':confPill(vcConf);
  b+='<div class="dsec"><div class="k">VALUE CAPTURED'+(isMiddle?provenanceTag("model.smiling_curve"):"")+'</div>'
    +ledgerScoreBarHTML("value captured",layer.value_captured.score_0_100,layer.value_captured.metric||"")
    +'<div class="v" style="color:var(--dim);font-size:10px">'+esc(layer.value_captured.basis)+" "+vcConfBadge+"</div></div>";
  // Picks and Shovels / Aggregation Theory are moat-mechanism-specific, not
  // generic decoration: cornered resource = selling the tool everyone needs
  // regardless of who wins downstream; switching costs = owning a relationship
  // (a qualification, a platform) that's costly for the other side to leave.
  var moatTagExtra=layer.moat.type==="cornered resource"?provenanceTag("model.picks_and_shovels")
    :layer.moat.type==="switching costs"?provenanceTag("model.aggregation_theory"):"";
  b+='<div class="dsec"><div class="k">MOAT'+provenanceTag("model.seven_powers")+moatTagExtra+'</div>'
    +'<div class="v"><b style="color:var(--txt)">'+esc(layer.moat.type==="none"?"None":layer.moat.type)+'</b> · strength '+layer.moat.strength_0_100+"/100</div>"
    +'<div class="ledger-dsec-scorebar"><div class="ledger-dsec-scorefill" style="width:'+layer.moat.strength_0_100+'%;background:var(--min)"></div></div>'
    +'<div class="v" style="color:var(--dim);font-size:10px">'+esc(layer.moat.decay_note)+provenanceTag("model.red_queen")+"</div></div>";
  if(layer.migration&&layer.migration.length){
    b+='<div class="dsec"><div class="k">PROFIT-POOL MIGRATION'+provenanceTag("model.value_migration")+'</div><div class="v">'
      +layer.migration.map(function(m){return m.year+": "+m.pool_share_0_100+"%"}).join(" → ")
      +"</div></div>";
  }
  b+=ledgerLinkChipsHTML(layer.links);
  $("dbody").innerHTML=b;
  attachChipNavigation();
}

// ── HELM (Phase D) — private personal lens ───────────────────────────────
// Renders only if pilot.json fetches successfully. It is gitignored and
// never deployed, so on the public site this fetch always 404s and every
// function below simply never runs — no tab, no DOM content, no data.
// Every derivation is an explicit, labeled heuristic over pilot.json +
// data already public elsewhere in the app; nothing here is invented.
var HELM_PILOT=null;
// pilot.skills[] entries range from terse tags ("robotics") to annotated,
// parenthetical phrases ("robotics (incoming — NTU MSc, Aug 2026)"). A raw
// substring match against short window mechanism text defeats the latter
// even when the underlying skill is a real, relevant match — so break each
// skill into its component tokens (base phrase + parenthetical parts, split
// on / , & "and") before matching. Only used for match detection; the
// original skill string is still what's shown to the user.
function helmSkillTokens(skill){
  var paren=[];
  var base=String(skill).replace(/\(([^)]*)\)/g,function(_,inner){paren.push(inner);return " "});
  var tokens=[];
  [base].concat(paren).forEach(function(part){
    part.split(/[\/,&]|\band\b/i).forEach(function(t){
      t=t.replace(/^[\s—-]+|[\s—-]+$/g,"").toLowerCase();
      if(t.length>=4)tokens.push(t);
    });
  });
  return tokens;
}
function helmSkillMatchesText(skill,text){
  // word-boundary, not indexOf: a plain substring check matches "rest" inside
  // "interest"/"restart" — false positives that would misrepresent the match
  // as a real skill hit when it's an accident of spelling.
  return helmSkillTokens(skill).some(function(tok){
    return new RegExp("\\b"+tok.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b").test(text);
  });
}
function helmWindowMatches(pilot){
  var skills=pilot.skills||[];
  var candidates=TRENDS.filter(function(t){return t.status==="open"||t.status==="forming"});
  var matches=[];
  candidates.forEach(function(t){
    var text=(t.name+" "+t.mechanism+" "+t.class).toLowerCase();
    var hitSkills=skills.filter(function(s){return helmSkillMatchesText(s,text)});
    if(hitSkills.length)matches.push({window:t,skills:hitSkills});
  });
  return matches;
}
function helmDeriveAnatomy(pilot){
  var riskText=(pilot.risk||"").toLowerCase();
  var asymmetry=riskText.indexOf("high")!==-1?4.5:riskText.indexOf("moderate")!==-1?3:riskText.indexOf("low")!==-1?1.5:2.5;
  if((pilot.capital_band||"").toLowerCase().indexOf("small")!==-1)asymmetry=Math.min(5,asymmetry+0.5);
  var forming=TRENDS.filter(function(t){return t.status==="forming"});
  var skills=pilot.skills||[];
  var hits=0;
  forming.forEach(function(t){var text=(t.name+" "+t.mechanism).toLowerCase();skills.forEach(function(s){if(helmSkillMatchesText(s,text))hits++})});
  var consensus=Math.min(5,1+hits*1.2);
  var stake=(pilot.mobility||"").toLowerCase().indexOf("high")!==-1?4:2.5;
  return{asymmetry:asymmetry,consensus:consensus,stake:stake};
}
function buildHelmAnatomy(pilot){
  var el=$("helm-anatomy");if(!el)return;
  var a=helmDeriveAnatomy(pilot);
  var W2=560,H2=320,PADL=50,PADR=20,PADT=16,PADB=40,plotW=W2-PADL-PADR,plotH=H2-PADT-PADB;
  var svg='<svg viewBox="0 0 '+W2+' '+H2+'" style="width:100%;height:auto;max-width:560px">';
  svg+='<line x1="'+PADL+'" y1="'+PADT+'" x2="'+PADL+'" y2="'+(PADT+plotH)+'" stroke="#2c2c2c"></line>';
  svg+='<line x1="'+PADL+'" y1="'+(PADT+plotH)+'" x2="'+(PADL+plotW)+'" y2="'+(PADT+plotH)+'" stroke="#2c2c2c"></line>';
  svg+='<text x="'+(PADL+plotW/2)+'" y="'+(PADT+plotH+30)+'" text-anchor="middle" class="scatter-axis-label">CONSENSUS DELTA →</text>';
  svg+='<text x="12" y="'+(PADT+plotH/2)+'" text-anchor="middle" class="scatter-axis-label" transform="rotate(-90,12,'+(PADT+plotH/2)+')">ASYMMETRY →</text>';
  HUMANS.forEach(function(h){
    (h.bets||[]).forEach(function(bet){
      if(!bet.anatomy)return;
      var cx=PADL+(bet.anatomy.consensus||0)/5*plotW,cy=PADT+(1-(bet.anatomy.asymmetry||0)/5)*plotH;
      svg+='<circle cx="'+cx+'" cy="'+cy+'" r="3" fill="rgba(120,120,120,.28)"></circle>';
    });
  });
  var px=PADL+a.consensus/5*plotW,py=PADT+(1-a.asymmetry/5)*plotH;
  svg+='<circle cx="'+px+'" cy="'+py+'" r="'+(4+a.stake)+'" fill="var(--rust)" stroke="#fff" stroke-width="1"></circle>';
  svg+='<text x="'+(px+12)+'" y="'+(py+4)+'" fill="var(--rust)" font-size="9">YOU</text>';
  svg+="</svg>";
  el.innerHTML=svg+'<div class="helm-scatter-note">Editorial estimate derived from pilot.json (risk tolerance, capital_band, skill overlap with forming windows) — not a measurement, same status as every human bet-anatomy score in this tool. Gray dots are the 19 tracked humans\' real scored bets, for calibration.</div>';
}
function buildHelmWindows(pilot){
  var el=$("helm-windows");if(!el)return;
  var matches=helmWindowMatches(pilot);
  if(!matches.length){el.innerHTML='<div class="helm-empty">No skill-to-window text match against open/forming windows. Add more specific skills[] to pilot.json — or this is honestly a fallow moment, not every pass has to surface one.</div>';return}
  el.innerHTML=matches.map(function(m){
    var t=m.window;
    return'<div class="helm-window-card" data-id="'+t.id+'"><div class="helm-window-hd"><div class="helm-window-title">'+esc(t.name)+'</div><div class="helm-window-status">'+esc(t.status.toUpperCase())+' · closes '+esc(t.expected_close||"?")+'</div></div>'
      +'<div class="helm-window-reason"><b>Why it matches:</b> your skill'+(m.skills.length>1?"s":"")+' ('+esc(m.skills.join(", "))+') appear'+(m.skills.length>1?"":"s")+' directly in this window\'s mechanism. <b>Source:</b> window.'+esc(t.id)+"</div></div>";
  }).join("");
  el.querySelectorAll(".helm-window-card").forEach(function(card){card.onclick=function(){openDossier("trend",card.dataset.id)}});
}
function buildHelmLeverage(pilot){
  var el=$("helm-leverage");if(!el)return;
  var model=MODEL_MAP["model.leverage_points"];
  if(!model||!model.ranked_list){el.innerHTML='<div class="helm-empty">model.leverage_points not found.</div>';return}
  var skillCounts={};
  TRENDS.filter(function(t){return t.status==="open"||t.status==="forming"}).forEach(function(t){
    var text=(t.name+" "+t.mechanism).toLowerCase();
    (pilot.skills||[]).forEach(function(s){if(helmSkillMatchesText(s,text))skillCounts[s]=(skillCounts[s]||0)+1});
  });
  var rows=(pilot.skills||[]).map(function(s){
    var count=skillCounts[s]||0;
    var rankNum=count===0?null:count===1?5:count<=2?9:12;
    return{skill:s,count:count,rankNum:rankNum};
  }).filter(function(r){return r.rankNum});
  if(!rows.length){el.innerHTML='<div class="helm-empty">No skills map to any open/forming window yet — nothing to rank.</div>';return}
  rows.sort(function(a,b){return a.rankNum-b.rankNum});
  el.innerHTML=rows.map(function(r){
    var pt=model.ranked_list.filter(function(x){return x.rank===r.rankNum})[0];
    return'<div class="helm-leverage-row"><span class="helm-leverage-rank">#'+r.rankNum+'</span><span><b style="color:var(--txt)">'+esc(r.skill)+'</b> — '+esc(pt.point)+" ("+r.count+" window match"+(r.count===1?"":"es")+")</span></div>";
  }).join("");
}
function buildHelmBets(pilot){
  var el=$("helm-bets");if(!el)return;
  var matches=helmWindowMatches(pilot).slice(0,4);
  if(!matches.length){el.innerHTML='<div class="helm-empty">No concrete bet surfaced this pass — an honest null result, not a bug.</div>';return}
  el.innerHTML=matches.map(function(m){
    var t=m.window;
    var asym=t.status==="forming"?"high (early, thin — most of the payoff is still unpriced)":"moderate (window open, some payoff already priced in)";
    return'<div class="helm-bet-card"><div class="helm-bet-title">'+esc(t.name)+'</div>'
      +'<div class="helm-bet-row"><b>Asymmetry:</b> '+asym+"</div>"
      +'<div class="helm-bet-row helm-bet-why"><b style="color:inherit">Why you specifically:</b> '+esc(m.skills.join(", "))+" from your skills[] is exactly the mechanism this window runs on, and location_next ("+esc(pilot.location_next||"unspecified")+") doesn't rule it out.</div>"
      +'<div class="helm-bet-row helm-bet-kill"><b style="color:inherit">Falsifier:</b> '+esc(t.decay_logic||"no decay_logic authored yet — treat as unverified until it is")+"</div>"
      +'<div class="helm-bet-row"><b>Source:</b> window.'+esc(t.id)+"</div></div>";
  }).join("");
}
function buildHelmInversion(pilot){
  var el=$("helm-inversion");if(!el)return;
  var bets=(pilot.active_bets||[]).map(function(b){return b.toLowerCase()});
  var closing=TRENDS.filter(function(t){return t.status==="closing"||t.status==="closed"});
  var conflicts=[];
  bets.forEach(function(bet){
    var betWords=bet.split(/\W+/).filter(function(w){return w.length>=5});
    closing.forEach(function(t){
      var text=(t.name+" "+t.mechanism+" "+t.decay_logic).toLowerCase();
      var hit=betWords.filter(function(w){return text.indexOf(w)!==-1})[0];
      if(hit)conflicts.push({bet:bet,window:t,word:hit});
    });
  });
  if(!conflicts.length){el.innerHTML='<div class="helm-empty">No detected overlap between active_bets[] and a closing/closed window — either genuinely clean, or your bets are described too vaguely to cross-reference. Both are worth knowing.</div>';return}
  el.innerHTML=conflicts.map(function(c){
    return'<div class="helm-inversion-row"><b>'+esc(c.bet)+'</b> shares language ("'+esc(c.word)+'") with <b>'+esc(c.window.name)+"</b>, which is "+c.window.status.toUpperCase()+". "+esc(c.window.decay_logic||"")+" — if this bet depends on that window staying open, that's the thing to re-underwrite first.</div>";
  }).join("");
}
function buildHelmClock(pilot){
  var el=$("helm-clock");if(!el)return;
  var matches=helmWindowMatches(pilot);
  var ny=nowYear(),endY=ny+(pilot.horizon_years||10);
  var W3=900,H3=90,PADL=30,PADR=20,PADT=16,PADB=26;
  function xOf(yr){return PADL+(yr-ny)/(endY-ny)*(W3-PADL-PADR)}
  if(!matches.length){el.innerHTML='<div class="helm-empty">No window matches to plot on your personal clock yet.</div>';return}
  var svg='<svg id="helm-clock-svg" viewBox="0 0 '+W3+' '+H3+'">';
  svg+='<line x1="'+PADL+'" y1="'+(H3-PADB)+'" x2="'+(W3-PADR)+'" y2="'+(H3-PADB)+'" stroke="#2c2c2c"></line>';
  svg+='<text x="'+xOf(ny)+'" y="'+(H3-PADB+14)+'" font-size="8" fill="var(--faint)" text-anchor="middle">NOW·'+ny+"</text>";
  svg+='<text x="'+xOf(endY)+'" y="'+(H3-PADB+14)+'" font-size="8" fill="var(--faint)" text-anchor="middle">'+endY+" (horizon)</text>";
  matches.forEach(function(m,i){
    var closeY=parseInt((m.window.expected_close||"").replace(/[^0-9]/g,"").slice(0,4))||endY;
    if(closeY>endY)closeY=endY;
    var x=xOf(closeY);
    svg+='<circle cx="'+x+'" cy="'+(H3-PADB)+'" r="4" fill="var(--rust)"></circle>';
    svg+='<text x="'+x+'" y="'+(H3-PADB-8-(i%3)*11)+'" font-size="8" fill="var(--rust)" text-anchor="middle">'+esc(m.window.name.slice(0,22))+"</text>";
  });
  svg+="</svg>";
  el.innerHTML=svg;
}
// pilot.json isn't a registry with a validator behind it — it's one person's file,
// hand-written or agent-generated, and schemas drift (flat strings vs. nested
// objects, risk vs. risk_tolerance, capital_band vs. capital.financial). Normalize
// defensively rather than crash or silently misread; never invent a value that
// wasn't there.
function helmNormalize(raw){
  var p=Object.assign({},raw);
  if(p.risk==null&&raw.risk_tolerance!=null)p.risk=raw.risk_tolerance;
  if(p.capital_band==null&&raw.capital){
    var c=raw.capital;
    p.capital_band=[c.financial,c.human?("human capital "+c.human):null].filter(Boolean).join(", ");
  }
  if(p.location_now&&typeof p.location_now==="object"){
    var lnow=p.location_now;p.location_now=[lnow.city,lnow.country].filter(Boolean).join(", ");
  }
  if(p.location_next&&typeof p.location_next==="object"){
    var lnext=p.location_next;
    p.location_next=[lnext.city,lnext.anchor].filter(Boolean).join(" — ")+(lnext.starts?(" (starts "+lnext.starts+")"):"");
  }
  // active_bets: keep the rich objects (they carry an authored kill_condition,
  // better than any heuristic) but also produce flat strings for the inversion
  // text-overlap check, which only understands strings.
  p._activeBetObjs=(raw.active_bets||[]).filter(function(b){return b&&typeof b==="object"});
  p.active_bets=(raw.active_bets||[]).map(function(b){
    if(typeof b==="string")return b;
    return[b.name,b.thesis,b.kill_condition].filter(Boolean).join(" — ");
  });
  p.hard_constraints=(raw.hard_constraints||[]).map(function(hc){
    if(typeof hc==="string")return hc;
    return[hc.constraint,hc.note].filter(Boolean).join(" — ");
  });
  p.skills=(raw.skills||[]).map(function(s){return typeof s==="string"?s:String(s)});
  return p;
}
function helmAllLedgerLayers(){
  var out=[];
  LEDGER_DOMAINS.forEach(function(dom){
    var did=dom.id.replace(/^domain\./,"");
    (dom.layers||[]).forEach(function(layer){out.push({dom:dom,did:did,layer:layer})});
  });
  return out;
}
function helmLedgerLayerText(layer){
  return(layer.name+" "+(layer.value_created.mechanism||"")+" "+(layer.value_captured.metric||"")
    +" "+(layer.moat.type||"")+" "+(layer.moat.decay_note||"")).toLowerCase();
}
var HELM_STOPWORDS=["that","with","from","this","have","been","were","into","doesn","the","and","for",
  "real","most","more","than","when","what","where","which","while","your","their","them","then","also",
  "just","only","some","such","even","much","many","less","near","over","under","upon","being","would",
  "could","should","about","after","before","between","through","without","within","still","does",
  // generic AI-domain words: nearly every bet and every layer mentions these,
  // so on their own they're noise, not a real thematic match.
  "model","models","data","system","systems","using","based","technology"];
// crude suffix-stripping, not real stemming — enough to unify "switching cost"
// (bet) with "switching costs" (a layer's moat.type) without needing a stemmer
// dependency; wrong on some words, but only used for match detection, never display.
function helmStem(w){
  if(w.length>5&&w.slice(-3)==="ies")return w.slice(0,-3)+"y";
  if(w.length>5&&w.slice(-2)==="es")return w.slice(0,-2);
  if(w.length>4&&w.slice(-1)==="s")return w.slice(0,-1);
  return w;
}
function helmWordTokens(text){
  return String(text).toLowerCase().split(/[^a-z0-9]+/)
    .filter(function(w){return w.length>=4&&HELM_STOPWORDS.indexOf(w)===-1})
    .map(helmStem);
}
// Bet text is full sentences, not short skill tags, so this needs a different
// match than helmSkillMatchesText's phrase-substring approach (which correctly
// requires whole-token matches for tag-like skills, but a 100-char sentence
// almost never appears verbatim elsewhere). Word-overlap instead — and require
// 2+ shared significant words so a single generic word doesn't fire a false match.
function helmBetMatchesLayer(betText,layerText){
  var betTokens={};helmWordTokens(betText).forEach(function(t){betTokens[t]=1});
  var shared=[],seen={};
  helmWordTokens(layerText).forEach(function(t){if(betTokens[t]&&!seen[t]){seen[t]=1;shared.push(t)}});
  return shared.length>=2?shared:null;
}
// Cross pilot.active_bets against ledger.json: (1) flag bets whose text overlaps
// a LEAK layer — a value-creation play sitting where this tool already shows
// capture structurally lagging creation; (2) surface layers marked
// solo_accessible with a moat type a solo/small team could plausibly hold
// (switching costs / cornered resource / process power — never "none", and
// never a layer that needs fab-scale capital regardless of its moat type).
function buildHelmCapture(pilot){
  var el=$("helm-capture");if(!el)return;
  var allLayers=helmAllLedgerLayers();
  if(!allLayers.length){el.innerHTML='<div class="helm-empty">No ledger domains seeded yet — nothing to cross-reference.</div>';return}
  var betTexts=(pilot._activeBetObjs&&pilot._activeBetObjs.length)
    ?pilot._activeBetObjs.map(function(b){return{name:b.name||b.id||"bet",text:[b.name,b.thesis,b.kill_condition].filter(Boolean).join(" — ")}})
    :(pilot.active_bets||[]).map(function(s){return{name:(s.split(" — ")[0])||s,text:s}});
  var leakHits=[];
  betTexts.forEach(function(bet){
    allLayers.forEach(function(rec){
      if(ledgerGapClass(rec.layer)!=="leak")return;
      var overlap=helmBetMatchesLayer(bet.text,helmLedgerLayerText(rec.layer));
      if(overlap)leakHits.push({bet:bet,rec:rec,overlap:overlap});
    });
  });
  var soloMoatTypes=["switching costs","cornered resource","process power"];
  var soloLayers=allLayers.filter(function(rec){
    return rec.layer.solo_accessible&&rec.layer.solo_accessible.value&&soloMoatTypes.indexOf(rec.layer.moat.type)!==-1;
  });
  var html='<div class="helm-capture-sub">Your bets sitting in leaking layers'+provenanceTag("model.value_created_captured")+'</div>';
  if(!leakHits.length){
    html+='<div class="helm-empty">No text overlap between active_bets[] and any leaking ledger layer this pass — an honest null result, not a bug.</div>';
  }else{
    html+=leakHits.map(function(h){
      var l=h.rec.layer;
      return'<div class="helm-bet-card"><div class="helm-bet-title">'+esc(h.bet.name)+" → "+esc(l.name)+'</div>'
        +'<div class="helm-bet-row"><b>Gap:</b> value created '+l.value_created.score_0_100+'/100 vs. captured '+l.value_captured.score_0_100+"/100 — LEAK</div>"
        +'<div class="helm-bet-row helm-bet-why"><b style="color:inherit">Why this is a blindspot:</b> shares language ('+esc(h.overlap.join(", "))+") with "+esc(l.name)+", a layer where this tool already tracks value creation outrunning capture."+"</div>"
        +'<div class="helm-bet-row helm-bet-kill"><b style="color:inherit">Kill condition:</b> '+esc(l.moat.decay_note)+"</div>"
        +'<div class="helm-bet-row"><b>Source:</b> ledger.'+esc(h.rec.did)+"."+esc(l.id)+"</div></div>";
    }).join("");
  }
  html+='<div class="helm-capture-sub" style="margin-top:16px">Layers where a solo technical operator can actually hold a moat'+provenanceTag("model.seven_powers")+'</div>';
  if(!soloLayers.length){
    html+='<div class="helm-empty">No layer in the tracked ledger domains is both solo-accessible and moat-bearing this pass.</div>';
  }else{
    html+=soloLayers.map(function(rec){
      var l=rec.layer;
      return'<div class="helm-window-card" data-key="'+esc(rec.did)+"::"+esc(l.id)+'"><div class="helm-window-hd"><div class="helm-window-title">'+esc(l.name)+'</div><div class="helm-window-status">'+esc(l.moat.type.toUpperCase())+" · strength "+l.moat.strength_0_100+"/100</div></div>"
        +'<div class="helm-window-reason">'+esc(l.solo_accessible.note)+"</div>"
        +'<div class="helm-window-reason"><b>Kill condition:</b> '+esc(l.moat.decay_note)+"</div>"
        +'<div class="helm-window-reason"><b>Source:</b> ledger.'+esc(rec.did)+"."+esc(l.id)+"</div></div>";
    }).join("");
  }
  el.innerHTML=html;
  el.querySelectorAll(".helm-window-card[data-key]").forEach(function(card){
    card.onclick=function(){switchTab("ledger");setTimeout(function(){openDossier("ledger",card.dataset.key)},60)};
  });
}
// Matches free-text location_now/location_next against the 12 curated
// countries.json nations by name/ISO — pilot.json's location fields are
// prose ("Bangalore, India" / "open to relocation — US, UAE, Singapore
// preferred"), not structured codes, so this is a substring match, not an
// exact lookup.
// Colloquial short forms that don't reduce to the formal name or ISO-3 code
// by substring alone ("UAE" isn't in "united arab emirates" or "are";
// "saudi" isn't in "saudi arabia" the other direction). Kept short and
// conservative - no single-word aliases like "US" or "america" that would
// false-positive against ordinary prose.
var CTRY_ALIASES={ARE:["uae"],SAU:["saudi"]};
function helmCountryMatches(text){
  if(!text)return[];
  var lower=String(text).toLowerCase();
  return CTRY_LIST.filter(function(c){
    if(lower.indexOf(c.name.toLowerCase())!==-1||lower.indexOf(c.iso.toLowerCase())!==-1)return true;
    return(CTRY_ALIASES[c.iso]||[]).some(function(a){return lower.indexOf(a)!==-1});
  });
}
function helmStandCard(c,role){
  var dyn=c.dynamics;
  var arrow={rising:"↑",declining:"↓",flat:"→"}[dyn.trajectory]||"→";
  var scored=["energy","chips","fiscal","stability"].map(function(k){return{k:k,v:dyn[k]&&dyn[k].score,note:dyn[k]&&dyn[k].note}}).filter(function(x){return x.v!=null});
  scored.sort(function(a,b){return a.v-b.v});
  var weakest=scored[0];
  var flow=(c.flows||[])[0];
  var html='<div class="helm-window-card" data-iso="'+c.iso+'"><div class="helm-window-hd"><div class="helm-window-title">'+esc(c.name)+" "+arrow+'</div><div class="helm-window-status">'+role.toUpperCase()+" · trajectory "+dyn.trajectory.toUpperCase()+"</div></div>";
  if(weakest)html+='<div class="helm-window-reason"><b>Weakest dynamic:</b> '+weakest.k.toUpperCase()+" ("+weakest.v+"/100) — "+esc(weakest.note)+"</div>";
  if(flow)html+='<div class="helm-window-reason"><b>Capital flow:</b> '+esc(flow.type.toUpperCase())+" → "+esc(NAMES[flow.to_iso]||flow.to_iso)+" ("+flow.magnitude_0_100+"/100) — "+esc(flow.basis)+"</div>";
  html+='<div class="helm-window-reason"><b>Kill condition:</b> if '+esc(c.name)+"'s trajectory flips to DECLINING, or "+(weakest?weakest.k+" drops materially below "+weakest.v+"/100":"any dynamic craters")+", the case for standing here weakens — recheck this card.</div>";
  html+='<div class="helm-window-reason"><b>Source:</b> country.'+c.iso+" · confidence: "+esc((c.confidence||"asserted").toUpperCase())+"</div></div>";
  return html;
}
function buildHelmStand(pilot){
  var el=$("helm-stand");if(!el)return;
  var nowMatches=helmCountryMatches(pilot.location_now);
  var nextMatches=helmCountryMatches(pilot.location_next);
  if(!nowMatches.length&&!nextMatches.length){
    el.innerHTML='<div class="helm-empty">Neither location_now ("'+esc(pilot.location_now||"unset")+'") nor location_next ("'+esc(pilot.location_next||"unset")+'") names one of the 12 curated countries.json nations — nothing to cross-reference this pass. That\'s an honest null result, not a bug: add a matching country name to either field to populate this section.</div>';
    return;
  }
  var html="";
  if(nowMatches.length){
    html+='<div class="helm-capture-sub">Where you are now</div>';
    html+=nowMatches.map(function(c){return helmStandCard(c,"now")}).join("");
  }
  if(nextMatches.length){
    html+='<div class="helm-capture-sub" style="margin-top:16px">Where you might go</div>';
    html+=nextMatches.map(function(c){return helmStandCard(c,"next")}).join("");
  }
  el.innerHTML=html;
  el.querySelectorAll(".helm-window-card[data-iso]").forEach(function(card){
    card.onclick=function(){switchTab("countries");setTimeout(function(){openDossier("country",card.dataset.iso)},60)};
  });
}
function buildHelm(rawPilot){
  var pilot=helmNormalize(rawPilot);
  var hd=document.querySelector("#v-helm h2.sec");
  if(hd&&(rawPilot.callsign||rawPilot.name))hd.textContent="Helm — "+(rawPilot.callsign||rawPilot.name);
  buildHelmAnatomy(pilot);buildHelmWindows(pilot);buildHelmLeverage(pilot);
  buildHelmBets(pilot);buildHelmInversion(pilot);buildHelmClock(pilot);buildHelmCapture(pilot);
  buildHelmStand(pilot);
}
fetch("pilot.json").then(function(r){
  if(!r.ok)throw new Error("no pilot.json");
  return r.json();
}).then(function(data){
  HELM_PILOT=data;
  var btn=$("helm-tab-btn");if(btn)btn.style.display="";
  buildHelm(HELM_PILOT);
}).catch(function(){/* no pilot.json — HELM stays hidden, by design */});

// ── Init Phase 5 ─────────────────────────────────────────────────────────
buildProvenanceFooter();

// Wire model-tag tooltip globally
document.addEventListener("mouseover",function(e){
  var tag=e.target.closest(".model-tag");if(!tag)return;
  var m=MODEL_MAP[tag.dataset.mid];if(!m)return;
  var tip=$("model-tooltip");tip.style.display="block";
  tip.innerHTML='<div class="mt-name">'+esc(m.name)+'</div><div class="mt-disc">'+esc(m.discipline)+'</div><div class="mt-line">'+esc(m.one_line)+'</div><div class="mt-src">— '+esc(m.source)+"</div>";
  var r=tag.getBoundingClientRect();tip.style.left=Math.min(r.left,window.innerWidth-220)+"px";tip.style.top=(r.bottom+4)+"px";
});
document.addEventListener("mouseout",function(e){
  if(e.target.closest(".model-tag"))$("model-tooltip").style.display="none";
});

// ── ORRERY: mission-status glyphs ────────────────────────────────────────
// ◉ live · ✕ killed · ⊙ watching · ◈ confirmed — derived from real fields, never fabricated.
function missionGlyph(kind,entity){
  if(kind==="thesis"){
    var kw=entity.kill_watch;
    if(kw&&kw.proximity!=null&&kw.proximity>=0.8)return{g:"✕",label:"KILLED — kill_watch near trigger",cls:"mg-killed"};
    if(entity.confidence==="hi"&&entity.margin&&(entity.margin.tightness==="wide"||entity.margin.tightness==="adequate"))return{g:"◈",label:"CONFIRMED — high confidence, adequate margin",cls:"mg-confirmed"};
    if(kw)return{g:"⊙",label:"WATCHING — kill_watch active",cls:"mg-watching"};
    return{g:"◉",label:"LIVE",cls:"mg-live"};
  }
  if(kind==="window"){
    if(entity.status==="closed")return{g:"✕",label:"CLOSED",cls:"mg-killed"};
    if(entity.status==="open")return{g:"◉",label:"OPEN",cls:"mg-live"};
    if(entity.status==="closing"||entity.status==="forming")return{g:"⊙",label:"WATCHING — "+entity.status.toUpperCase(),cls:"mg-watching"};
    return{g:"◈",label:"—",cls:"mg-confirmed"};
  }
  return{g:"⊙",label:"",cls:"mg-watching"};
}
function missionGlyphHTML(kind,entity){
  var m=missionGlyph(kind,entity);
  return'<span class="mg '+m.cls+' mg-inline" title="'+esc(m.label)+'">'+m.g+"</span>";
}

// Title block GEN stamp
(function(){var el=$("tb-gen");if(el)el.textContent="GEN "+(meta.last_updated||"—")})();

// Thesis cards: prepend a mission glyph to each card
(function(){
  var _origBuildThesisGlyph=buildThesisRegister;
  buildThesisRegister=function(){
    _origBuildThesisGlyph();
    var el=$("thesis-list");if(!el)return;
    el.querySelectorAll(".thesis-card").forEach(function(card,i){
      var th=THESES[i];if(!th||card.querySelector(".mg-inline"))return;
      var numEl=card.querySelector(".thesis-num");
      if(numEl)numEl.insertAdjacentHTML("afterbegin",missionGlyphHTML("thesis",th));
    });
  };
})();

// Trend/window kanban cards: prepend a mission glyph to each card.
// buildTrends() only runs once, eagerly, at init — before this patch exists —
// so re-render immediately after patching or the glyphs never appear.
(function(){
  var _origBuildTrendsGlyph=buildTrends;
  buildTrends=function(){
    _origBuildTrendsGlyph();
    document.querySelectorAll(".trend-card[data-id]").forEach(function(card){
      var t=TREND_MAP[card.dataset.id];if(!t)return;
      var nameEl=card.querySelector(".tc-name");
      if(nameEl&&!nameEl.querySelector(".mg-inline"))nameEl.insertAdjacentHTML("afterbegin",missionGlyphHTML("window",t));
    });
  };
  buildTrends();
})();

})(); // end engine IIFE
} // end initApp
