#!/usr/bin/env node
// js/validate.js — dev-only schema validator
// Run: node js/validate.js

const fs   = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '../data');
const VALID_RELS = new Set([
  'enables','requires','threatens','gates',
  'capitalized_on','killed','bypasses','watches','context'
]);

let errors = 0;
function err(msg)  { console.error(`  ✗ ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠ ${msg}`); }

function loadJSON(file) {
  const p = path.join(DATA, file);
  if (!fs.existsSync(p)) { err(`missing file: ${file}`); return null; }
  try { return JSON.parse(fs.readFileSync(p,'utf8')); }
  catch(e) { err(`parse error in ${file}: ${e.message}`); return null; }
}

const atlas       = loadJSON('atlas.json');
const tree        = loadJSON('tree.json');
const humans      = loadJSON('humans.json');
const windows     = loadJSON('windows.json');
const constraints = loadJSON('constraints.json');
const scenarios   = loadJSON('scenarios.json');
const graveyard   = loadJSON('graveyard.json');
const theses      = loadJSON('theses.json');
const method      = loadJSON('method.json');
const meta        = loadJSON('meta.json');

// ── collect all entity ids ──────────────────────────────────────────────────
const allIds = new Set();
function registerEntities(arr, label) {
  if (!arr) return;
  arr.forEach(e => {
    if (!e.id) { err(`[${label}] entity missing id: ${JSON.stringify(e).slice(0,60)}`); return; }
    if (allIds.has(e.id)) err(`duplicate id: ${e.id}`);
    allIds.add(e.id);
  });
}
registerEntities(atlas?.nodes,           'atlas');
registerEntities(tree?.nodes,            'tree');
registerEntities(humans?.people,         'humans');
registerEntities(windows?.windows,       'windows');
registerEntities(constraints?.rows,      'constraints');
registerEntities(scenarios?.scenarios,   'scenarios');
registerEntities(graveyard?.graveyard,   'graveyard');
registerEntities(theses?.theses,         'theses');
if (method?.id) allIds.add(method.id);
console.log(`\nRegistered ${allIds.size} entity IDs`);

// ── check links ─────────────────────────────────────────────────────────────
function checkLinks(entities, label) {
  if (!entities) return;
  entities.forEach(e => {
    (e.links || []).forEach(link => {
      if (!link.to)  { err(`${e.id}: link missing 'to'`);  return; }
      if (!link.rel) { err(`${e.id}: link missing 'rel'`); return; }
      if (!VALID_RELS.has(link.rel))
        err(`${e.id}: unknown rel '${link.rel}' — must be one of: ${[...VALID_RELS].join(', ')}`);
      if (!allIds.has(link.to)) {
        if (e.draft) warn(`${e.id}: link.to '${link.to}' not in entity registry (draft — ok for now)`);
        else err(`${e.id}: link.to '${link.to}' not in entity registry`);
      }
    });
  });
}
checkLinks(atlas?.nodes,           'atlas');
checkLinks(tree?.nodes,            'tree');
checkLinks(humans?.people,         'humans');
checkLinks(windows?.windows,       'windows');
checkLinks(constraints?.rows,      'constraints');
checkLinks(scenarios?.scenarios,   'scenarios');
checkLinks(graveyard?.graveyard,   'graveyard');
checkLinks(theses?.theses,         'theses');

// ── check thesis 'supports' refs ────────────────────────────────────────────
function checkSupports(entities) {
  if (!entities) return;
  entities.forEach(e => {
    (e.supports || []).forEach(sid => {
      if (allIds.has(sid)) return;
      if (e.draft) warn(`${e.id}: supports '${sid}' not in entity registry (draft — ok for now)`);
      else err(`${e.id}: supports '${sid}' not in entity registry`);
    });
  });
}
checkSupports(theses?.theses);

// ── check probabilities ──────────────────────────────────────────────────────
function checkProbs(entities, label) {
  if (!entities) return;
  entities.forEach(h => {
    (h.future_paths || []).forEach((fp, i) => {
      if (fp.p == null || fp.p < 0 || fp.p > 1)
        err(`${h.id}: future_path[${i}].p=${fp.p} must be 0–1`);
      if (!fp.falsifier)
        err(`${h.id}: future_path[${i}] missing falsifier`);
    });
  });
}
checkProbs(humans?.people,    'humans');
checkProbs(windows?.windows,  'windows');

// ── check dates ──────────────────────────────────────────────────────────────
function checkDates(entities, label) {
  if (!entities) return;
  entities.forEach(e => {
    if (e.as_of && isNaN(Date.parse(e.as_of)))
      err(`${e.id}: invalid as_of '${e.as_of}' — use YYYY-MM-DD`);
  });
}
checkDates(atlas?.nodes,    'atlas');
checkDates(tree?.nodes,     'tree');
checkDates(humans?.people,  'humans');
checkDates(windows?.windows,'windows');

// ── check required envelope fields ──────────────────────────────────────────
function checkEnvelope(entities, requiredFields) {
  if (!entities) return;
  entities.forEach(e => {
    requiredFields.forEach(f => {
      if (e[f] == null) err(`${e.id}: missing required field '${f}'`);
    });
    if (!e.half_life_days || e.half_life_days <= 0)
      err(`${e.id}: half_life_days must be > 0`);
  });
}
const ENV = ['id','type','title','as_of','half_life_days'];
checkEnvelope(atlas?.nodes,    ENV);
checkEnvelope(tree?.nodes,     ENV);
checkEnvelope(humans?.people,  ENV);
checkEnvelope(windows?.windows,ENV);

// ── check tree requires exist ────────────────────────────────────────────────
if (tree?.nodes) {
  tree.nodes.forEach(n => {
    (n.links || []).filter(l => l.rel === 'requires').forEach(l => {
      if (!allIds.has(l.to))
        err(`tree.${n.id.replace('tree.','')}: requires ${l.to} not found`);
    });
  });
}

// ── summary ──────────────────────────────────────────────────────────────────
console.log('');
if (errors === 0) {
  console.log('✓ Validator passed — 0 errors\n');
  process.exit(0);
} else {
  console.error(`✗ Validator found ${errors} error(s)\n`);
  process.exit(1);
}
