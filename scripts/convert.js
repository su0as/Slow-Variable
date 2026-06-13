#!/usr/bin/env node
// scripts/convert.js — one-time migration of v2 JS data → v3 JSON
// Run: node scripts/convert.js
// Output: data/*.json

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const V2  = path.join(__dirname, '../../slow-variables-v2/data');
const OUT = path.join(__dirname, '../data');

function loadV2(file) {
  const src = fs.readFileSync(path.join(V2, file), 'utf8');
  const ctx = { window: {}, document: {} };
  try { vm.runInNewContext(src, ctx); } catch(e) { console.error(`parse ${file}: ${e.message}`); }
  return ctx;
}

const AS_OF = '2026-06-01';

// ── half-life defaults by layer / entity class ──────────────────────────────
const HL = {
  choke:3650, chip:365, min:1825, nrg:1825, data:730, fin:365, demo:1825,
  tree_foundational:1825, tree_contingent:730, tree_convergent:1825, tree_flag:180,
  human_C:365, human_P:180, human_W:90, human_M:60,
  window_closed:3650, window_open:365, window_forming:180, window_closing:90,
  constraint:365, scenario:365, method:3650
};

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

// ── 1. meta.json ─────────────────────────────────────────────────────────────
const mf = loadV2('manifest.js');
const M  = mf.MANIFEST || {};
const meta = {
  version: M.version || '3.0.0',
  last_updated: AS_OF,
  counts: M.counts || {},
  changelog: [
    { date: AS_OF, note: 'Phase 0: migrated v2 data to JSON entity registry' },
    ...(M.changelog || [])
  ]
};
fs.writeFileSync(path.join(OUT,'meta.json'), JSON.stringify(meta,null,2));
console.log('✓ meta.json');

// ── 2. method.json ───────────────────────────────────────────────────────────
const mv = loadV2('method.js');
const method = {
  id: 'method.root',
  type: 'method',
  title: 'Operating Method',
  as_of: AS_OF,
  half_life_days: HL.method,
  signals: [],
  links: [],
  era_labels: mv.CCOLS || [],
  hierarchy: (mv.HIER || []).map(([label,body,level]) => ({ label, body, level })),
  rules: mv.RULES || [],
  biases: mv.BIASCHK || [],
  sources: (mv.SOURCES || []).map(([label,note,url]) => ({ label, note, url }))
};
fs.writeFileSync(path.join(OUT,'method.json'), JSON.stringify(method,null,2));
console.log('✓ method.json');

// ── 3. constraints.json ──────────────────────────────────────────────────────
const cv = loadV2('constraints.js');
const dv = loadV2('demography.js');
const constraints = {
  rows: (cv.CONSTRAINTS || []).map((r,i) => ({
    id: `constraint.${slug(r[0])}`,
    type: 'constraint',
    title: r[0],
    lead_time: r[1],
    cost: r[2],
    bottleneck: r[3],
    signal: r[4],
    as_of: AS_OF,
    half_life_days: HL.constraint,
    signals: [],
    links: []
  })),
  demography: dv.DEMO || []
};
fs.writeFileSync(path.join(OUT,'constraints.json'), JSON.stringify(constraints,null,2));
console.log('✓ constraints.json');

// ── 4. scenarios.json ────────────────────────────────────────────────────────
const sv = loadV2('scenarios.js');
const scenarios = (sv.SCENARIOS || []).map(s => ({
  id: `scenario.${s.id}`,
  type: 'scenario',
  title: s.nm,
  body: s.d,
  layers: s.ly || [],
  trace: (s.trace || []).map(n => `atlas.${n}`),
  as_of: AS_OF,
  half_life_days: HL.scenario,
  signals: [],
  links: (s.trace || []).map(n => ({ to: `atlas.${n}`, rel: 'context' }))
}));
fs.writeFileSync(path.join(OUT,'scenarios.json'), JSON.stringify({ scenarios },null,2));
console.log('✓ scenarios.json');

// ── 5. atlas.json ────────────────────────────────────────────────────────────
const av  = loadV2('atlas-nodes.js');
const arv = loadV2('arcs.js');

const arcLinks = {};  // id → [{to, rel}]
(arv.ARCS || []).forEach(([from,to,layer]) => {
  if (!arcLinks[from]) arcLinks[from] = [];
  arcLinks[from].push({ to: `atlas.${to}`, rel: 'gates', layer });
});

const atlasNodes = (av.ATLAS_NODES || []).map(n => {
  const xrefs = n.xref || {};
  const links = [
    ...(arcLinks[n.id] || []),
    ...(xrefs.tree  || []).map(id => ({ to: `tree.${id}`,    rel: 'context' })),
    ...(xrefs.humans|| []).map(id => ({ to: `human.${id}`,   rel: 'context' })),
    ...(xrefs.trends|| []).map(id => ({ to: `window.${id}`,  rel: 'context' }))
  ];
  return {
    id:    `atlas.${n.id}`,
    type:  n.ly,
    title: n.nm,
    aliases: [],
    lat:   n.lat,
    lon:   n.lon,
    body:  [n.wt, n.wy, n.ct, n.ld, n.cs, n.ao].filter(Boolean).join('\n\n'),
    weight:      n.wt,
    why_hard:    n.wy,
    control:     n.ct,
    lead:        n.ld,
    consequence: n.cs,
    signal_desc: n.sg,
    analyst_note:n.ao,
    as_of:       n.vintage ? `${n.vintage}-01` : AS_OF,
    half_life_days: HL[n.ly] || 365,
    signals: [],
    links,
    cf:    n.cf || 'med',
    review_after_months: n.review_after_months || 12
  };
});

const arcs = (arv.ARCS || []).map(([from,to,layer]) => ({
  from: `atlas.${from}`, to: `atlas.${to}`, layer
}));

fs.writeFileSync(path.join(OUT,'atlas.json'), JSON.stringify({ nodes: atlasNodes, arcs },null,2));
console.log(`✓ atlas.json (${atlasNodes.length} nodes, ${arcs.length} arcs)`);

// ── 6. tree.json ─────────────────────────────────────────────────────────────
const tv = loadV2('tree.js');
const treeNodes = (tv.TREE || []).map(n => {
  const xrefs = n.xref || {};
  const links = [
    ...(n.requires || []).map(id  => ({ to: `tree.${id}`,    rel: 'requires' })),
    ...(xrefs.atlas || []).map(id => ({ to: `atlas.${id}`,   rel: 'context' })),
    ...(xrefs.humans|| []).map(id => ({ to: `human.${id}`,   rel: 'context' })),
    ...(xrefs.trends|| []).map(id => ({ to: `window.${id}`,  rel: 'context' }))
  ];
  return {
    id:    `tree.${n.id}`,
    type:  'treenode',
    title: n.lb,
    date_label: n.dt || '',
    era:   n.era,
    row:   n.row,
    badge: n.fg || '',
    live:  !!n.live,
    mechanism: n.mech || '',
    body:  n.d || '',
    as_of: n.vintage ? `${n.vintage}-01` : AS_OF,
    half_life_days: HL[`tree_${n.fg||'foundational'}`] || 1825,
    signals: [],
    links,
    cf:    n.cf || 'med',
    review_after_months: n.review_after_months || 12
  };
});
const treeEras = tv.TREE_ERAS || [];
fs.writeFileSync(path.join(OUT,'tree.json'), JSON.stringify({ eras: treeEras, nodes: treeNodes },null,2));
console.log(`✓ tree.json (${treeNodes.length} nodes)`);

// ── 7. windows.json ──────────────────────────────────────────────────────────
const trv = loadV2('trends.js');
const windows = (trv.TRENDS || []).map(w => {
  const xrefs = w.xref || {};
  const links = [
    ...(xrefs.tree  || []).map(id => ({ to: `tree.${id}`,    rel: 'context' })),
    ...(xrefs.atlas || []).map(id => ({ to: `atlas.${id}`,   rel: 'context' })),
    ...(xrefs.humans|| []).map(id => ({ to: `human.${id}`,   rel: 'context' }))
  ];
  return {
    id:      `window.${w.id}`,
    type:    'window',
    title:   w.name,
    class:   w.class,
    status:  w.status,
    opened:  w.opened,
    expected_close: w.expected_close,
    mechanism:   w.mechanism,
    effects:     w.effects || [],
    decay_logic: w.decay_logic,
    entry_checklist: (w.entry_checklist || []).map(t => ({ text: t, status: 'unknown', evidence: '' })),
    who_won:     w.who_won || [],
    who_died:    w.who_died || [],
    exemplars:   w.exemplars || [],
    open_signal: w.open_signal || '',
    future_paths: (w.future_paths || []).map(p => ({
      path:      p.path,
      p:         p.p,
      horizon:   p.horizon,
      falsifier: p.falsifier || ''
    })),
    body: w.mechanism,
    as_of: w.vintage ? `${w.vintage}-01` : AS_OF,
    half_life_days: HL[`window_${w.status}`] || 365,
    signals: [],
    links,
    cf:    w.cf || 'med',
    review_after_months: w.review_after_months || 12
  };
});
fs.writeFileSync(path.join(OUT,'windows.json'), JSON.stringify({ windows },null,2));
console.log(`✓ windows.json (${windows.length} windows)`);

// ── 8. humans.json ───────────────────────────────────────────────────────────
const hv = loadV2('humans.js');
const people = (hv.HUMANS || []).map(h => {
  const links = [
    ...(h.xref?.tree  || []).map(id => ({ to: `tree.${id}`,   rel: 'context' })),
    ...(h.xref?.atlas || []).map(id => ({ to: `atlas.${id}`,  rel: 'context' })),
    ...(h.xref?.trends|| []).map(id => ({ to: `window.${id}`, rel: 'context' }))
  ];
  return {
    id:     `human.${h.id}`,
    type:   'human',
    title:  h.name,
    aliases:[h.name.split(' ').slice(-1)[0]],  // last name
    tier:    h.tier,
    domain:  h.domain,
    bets:   (h.bets || []).map(b => ({
      yr:         b.yr,
      stake:      b.stake,
      consensus_delta: b.consensus_delta,
      enabler:    b.enabler,
      thesis:     b.thesis,
      outcome:    b.outcome,
      survival_mechanism: b.survival_mechanism,
      anatomy:    b.anatomy || null
    })),
    chain:         h.chain || [],
    current_state: h.current_state || null,
    future_paths:  (h.future_paths || []).map(p => ({
      path:      p.path,
      p:         p.p,
      horizon:   p.horizon,
      falsifier: p.falsifier || ''
    })),
    dead_bodies:   h.dead_bodies || [],
    lessons:       h.lessons || [],
    body: (h.chain || []).join('\n') || h.domain,
    as_of: h.vintage ? `${h.vintage}-01` : AS_OF,
    half_life_days: HL[`human_${h.tier}`] || 180,
    signals: [],
    links,
    cf:    h.cf || 'med',
    review_after_months: h.review_after_months || 6
  };
});
fs.writeFileSync(path.join(OUT,'humans.json'), JSON.stringify({ people },null,2));
console.log(`✓ humans.json (${people.length} people)`);

// ── 9. graveyard.json (scaffold) ─────────────────────────────────────────────
const GRAVEYARD_DRAFTS = [
  { id:'grave.nortel',   title:'Nortel Networks',    cause:'timing too early / narrative collapse', draft:true },
  { id:'grave.lucent',   title:'Lucent Technologies', cause:'fraud-hubris',                         draft:true },
  { id:'grave.worldcom', title:'WorldCom',            cause:'fraud-hubris',                         draft:true },
  { id:'grave.webvan',   title:'Webvan',              cause:'timing too early',                     draft:true },
  { id:'grave.iridium',  title:'Iridium (original)',  cause:'no survival mechanism',                draft:true },
  { id:'grave.solyndra', title:'Solyndra',            cause:'control lost / consensus was right',   draft:true },
  { id:'grave.katerra',  title:'Katerra',             cause:'no survival mechanism',                draft:true },
  { id:'grave.ftx',      title:'FTX',                 cause:'fraud-hubris',                         draft:true },
  { id:'grave.theranos', title:'Theranos',             cause:'fraud-hubris',                         draft:true },
  { id:'grave.wework',   title:'WeWork (Son bet)',     cause:'timing too early / control lost',      draft:true }
];
const graveyard = GRAVEYARD_DRAFTS.map(g => ({
  id:   g.id,
  type: 'graveyard',
  tier: 'D',
  title: g.title,
  body: 'DRAFT — author to verify and expand',
  cause_of_death: g.cause,
  bets: [],
  dead_bodies: [],
  lessons: [],
  as_of: AS_OF,
  half_life_days: 3650,
  signals: [],
  links: [],
  draft: true
}));
fs.writeFileSync(path.join(OUT,'graveyard.json'), JSON.stringify({ graveyard },null,2));
console.log(`✓ graveyard.json (${graveyard.length} scaffolds, all DRAFT)`);

// ── 10. theses.json (scaffold) ───────────────────────────────────────────────
const theses = [
  {
    id: 'thesis.power_binds',
    type: 'thesis',
    statement: 'AI datacenter power constraints bind through at least 2029 regardless of capital committed.',
    confidence: 'hi',
    kill_condition: 'Turbine/transformer lead times halve OR interconnection median < 2yr OR datacenter demand growth < 10%/yr.',
    supports: ['constraint.heavy-gas-turbine-slot','constraint.hv-transmission-line','atlas.ashburn','window.energy-grid'],
    forecast_ids: [],
    draft: true
  },
  {
    id: 'thesis.chokepoint_bypass_decay',
    type: 'thesis',
    statement: 'Every chokepoint rent decays over 5–15 years as bypass investments arrive; date-stamp all concentration bets.',
    confidence: 'hi',
    kill_condition: 'A major chokepoint bypass is abandoned despite strong economic incentive (no case in 50yr record).',
    supports: ['atlas.hormuz','atlas.malacca','atlas.suez'],
    forecast_ids: [],
    draft: true
  },
  {
    id: 'thesis.demography_determinism',
    type: 'thesis',
    statement: '2044 workforce is already born; demographic forecasts (labor supply, consumption, debt capacity) have ~zero uncertainty at 20yr horizon.',
    confidence: 'hi',
    kill_condition: 'A country achieves a 50%+ fertility reversal within 10yr (no precedent).',
    supports: ['constraint.demographic-cohort'],
    forecast_ids: [],
    draft: true
  },
  {
    id: 'thesis.sovereign_ai_price_insensitive',
    type: 'thesis',
    statement: 'Sovereign AI compute buildouts (Gulf, EU, Southeast Asia) represent price-insensitive demand that floors GPU/fab utilization regardless of US hyperscaler capex cycle.',
    confidence: 'med',
    kill_condition: 'Sovereign AI programs cut budgets >50% or no sovereign model reaches commercial deployment by 2028.',
    supports: ['window.sovereign-ai','atlas.uae-ai-cluster'],
    forecast_ids: [],
    draft: true
  },
  {
    id: 'thesis.capability_window_closure',
    type: 'thesis',
    statement: 'The AI wrapper / commodity-API window closes by 2027 as model providers capture the margin and distribution commoditizes.',
    confidence: 'med',
    kill_condition: 'A wrapper-layer company reaches $1B ARR without model-provider margin compression by 2027.',
    supports: ['window.ai-wrapper-window'],
    forecast_ids: [],
    draft: true
  }
].map(t => ({
  ...t,
  body: t.statement,
  as_of: AS_OF,
  half_life_days: 365,
  signals: [],
  links: t.supports.map(id => ({ to: id, rel: 'enables' }))
}));
fs.writeFileSync(path.join(OUT,'theses.json'), JSON.stringify({ theses },null,2));
console.log(`✓ theses.json (${theses.length} drafts)`);

console.log('\nAll done. Run node js/validate.js to check integrity.');
