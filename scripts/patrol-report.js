#!/usr/bin/env node
// scripts/patrol-report.js — free, keyless patrol queue generator.
// Pure Node, zero dependencies, no network, no AI. Reads /data/*.json, replicates the
// exact staleness math the live app uses (js/engine.js isStale()/vintageAge() and
// js/store.js Store.staleStatus()/freshnessSummary()), and writes:
//   - PATROL.md          human-readable queue (kill-watch alerts, stale table, freshness line)
//   - patrol-queue.json  the same data, machine-readable, for an AI to consume directly
//
// Run: node scripts/patrol-report.js
// See AGENT_UPDATE.md for what happens with this queue next (a human pastes it to an
// AI chat session — there is no automated writer, this script only ever reads).

'use strict';

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');
const ROOT = path.join(__dirname, '..');

function loadJSON(file) {
  const p = path.join(DATA, file);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`patrol-report: could not read/parse ${file}: ${e.message}`);
    return {};
  }
}

const atlas       = loadJSON('atlas.json');
const tree        = loadJSON('tree.json');
const humans      = loadJSON('humans.json');
const windows     = loadJSON('windows.json');
const constraints = loadJSON('constraints.json');
const scenarios    = loadJSON('scenarios.json');
const graveyard   = loadJSON('graveyard.json');
const theses      = loadJSON('theses.json');
const method      = loadJSON('method.json');

// ── The exact registry set js/store.js registers via Store._reg() ──────────
// (models.json and forecasts.json are intentionally excluded — Store never
// registers them either, and neither has an as_of/dated-claim shape the
// staleness formula below is meaningful against.)
const REGISTRIES = [
  { key: 'atlas',       label: 'Atlas',       entities: atlas.nodes || [] },
  { key: 'tree',        label: 'Tree',        entities: tree.nodes || [] },
  { key: 'humans',      label: 'Humans',      entities: humans.people || [] },
  { key: 'windows',     label: 'Trends',      entities: windows.windows || [] },
  { key: 'constraints', label: 'Constraints', entities: constraints.rows || [] },
  { key: 'scenarios',   label: 'Scenarios',   entities: scenarios.scenarios || [] },
  { key: 'graveyard',   label: 'Graveyard',   entities: graveyard.graveyard || [] },
  { key: 'theses',      label: 'Theses',      entities: theses.theses || [] },
  { key: 'method',      label: 'Method',      entities: method && method.id ? [method] : [] },
];

// ── js/engine.js: vintageAge(v) + isStale(node) — replicated exactly ───────
// vintage is as_of.slice(0,7) ("YYYY-MM"), matching every compatibility shim in engine.js.
function vintageAge(vintage) {
  if (!vintage) return 999;
  const parts = vintage.split('-');
  const yr = +parts[0], mo = +parts[1];
  const now = new Date();
  return (now.getFullYear() - yr) * 12 + (now.getMonth() + 1 - mo);
}
function reviewAfterMonths(entity) {
  return entity.review_after_months || (entity.cf === 'hi' ? 6 : 3);
}
function isStaleInfo(entity) {
  const vintage = entity.as_of ? entity.as_of.slice(0, 7) : '';
  const ram = reviewAfterMonths(entity);
  const age = vintageAge(vintage);
  return { vintage, ram, age, stale: age > ram, monthsOverdue: age - ram };
}

// ── js/store.js: Store.staleStatus(entity) — replicated exactly ────────────
function staleStatus(entity) {
  const asOfStr = entity.as_of;
  if (!asOfStr) return 'unknown';
  const elapsed = (Date.now() - new Date(asOfStr).getTime()) / 86400000;
  const hl = entity.half_life_days || 365;
  if (elapsed < hl * 0.5) return 'fresh';
  if (elapsed < hl) return 'aging';
  return 'stale';
}

// ── helpers ──────────────────────────────────────────────────────────────
function titleOf(entity) {
  return entity.title || entity.statement || entity.name || entity.id || '(untitled)';
}
function signalOf(entity) {
  if (entity.signals && entity.signals.length) {
    const s = entity.signals[0];
    return { text: s.label || '(unlabeled signal)', url: s.url || null };
  }
  if (entity.signal_desc) return { text: entity.signal_desc, url: null };
  if (entity.signal)      return { text: entity.signal, url: null };
  if (entity.kill_watch && entity.kill_watch.signal) return { text: entity.kill_watch.signal, url: null };
  return { text: '—', url: null };
}
function mdEscape(s) {
  return String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();
}
function truncate(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function pct(p) {
  return Math.round((p || 0) * 100) + '%';
}

// ── build the flat entity list + staleness table ────────────────────────────
const allEntities = [];
REGISTRIES.forEach((reg) => {
  reg.entities.forEach((e) => allEntities.push({ e, reg }));
});

const staleRows = [];
allEntities.forEach(({ e, reg }) => {
  const info = isStaleInfo(e);
  if (!info.stale) return;
  const sig = signalOf(e);
  staleRows.push({
    id: e.id,
    registry: reg.key,
    registryLabel: reg.label,
    title: titleOf(e),
    vintage: info.vintage || null,
    reviewAfterMonths: info.ram,
    monthsOverdue: info.age === 999 ? null : info.monthsOverdue,
    ageUnknown: info.age === 999,
    cf: e.cf || null,
    signalToCheck: sig.text,
    signalUrl: sig.url,
  });
});
// unknown-vintage entities (age===999) sort first — they're the most overdue by definition
staleRows.sort((a, b) => {
  if (a.ageUnknown && !b.ageUnknown) return -1;
  if (b.ageUnknown && !a.ageUnknown) return 1;
  return (b.monthsOverdue || 0) - (a.monthsOverdue || 0);
});

// ── freshness summary (Store.freshnessSummary, same entity set) ────────────
const freshnessSummary = { fresh: 0, aging: 0, stale: 0, unknown: 0 };
allEntities.forEach(({ e }) => { freshnessSummary[staleStatus(e)]++; });

// ── kill-watch scan ──────────────────────────────────────────────────────
const KILL_WATCH_THRESHOLD = 0.8; // proximity >= 0.8 == within ~20% of triggering
const killWatchAlerts = [];
(theses.theses || []).forEach((th) => {
  const kw = th.kill_watch;
  if (!kw || kw.proximity == null) return;
  if (kw.proximity >= KILL_WATCH_THRESHOLD) {
    killWatchAlerts.push({
      thesisId: th.id,
      statement: th.statement,
      killCondition: th.kill_condition,
      signal: kw.signal,
      currentValue: kw.current_value,
      triggerValue: kw.trigger_value,
      proximity: kw.proximity,
      asOf: kw.as_of,
    });
  }
});
killWatchAlerts.sort((a, b) => b.proximity - a.proximity);

// ── generated-on stamp ───────────────────────────────────────────────────
const now = new Date();
const generatedOnISO = now.toISOString();
const generatedOnDate = generatedOnISO.slice(0, 10);

// ── write patrol-queue.json (machine-readable) ──────────────────────────────
const queueJSON = {
  generated_on: generatedOnISO,
  generated_on_date: generatedOnDate,
  kill_watch_threshold: KILL_WATCH_THRESHOLD,
  freshness_summary: freshnessSummary,
  total_entities_tracked: allEntities.length,
  kill_watch_alerts: killWatchAlerts,
  stale_entities: staleRows,
};
fs.writeFileSync(
  path.join(ROOT, 'patrol-queue.json'),
  JSON.stringify(queueJSON, null, 2) + '\n'
);

// ── write PATROL.md (human-readable) ────────────────────────────────────────
let md = '';
md += '# Patrol Queue\n\n';
md += `Generated ${generatedOnDate} by \`node scripts/patrol-report.js\` — pure Node, `
    + 'no network, no AI. This file is a read-only report; nothing here edits the data. '
    + 'See [AGENT_UPDATE.md](AGENT_UPDATE.md) for how to act on it.\n\n';

md += '## Kill-watch alerts\n\n';
if (!killWatchAlerts.length) {
  md += `None near trigger. (Threshold: proximity ≥ ${KILL_WATCH_THRESHOLD} — roughly within 20% of the kill condition firing.)\n\n`;
} else {
  killWatchAlerts.forEach((a) => {
    md += `### 🔴 ${mdEscape(a.thesisId)} — proximity ${pct(a.proximity)}\n\n`;
    md += `- **Statement:** ${mdEscape(a.statement)}\n`;
    md += `- **Kill condition:** ${mdEscape(a.killCondition)}\n`;
    md += `- **Signal:** ${mdEscape(a.signal)}\n`;
    md += `- **Current value:** ${mdEscape(a.currentValue)} → **Trigger:** ${mdEscape(a.triggerValue)}\n`;
    md += `- **kill_watch.as_of:** ${mdEscape(a.asOf)}\n\n`;
  });
}

md += '## Stale — needs re-verification\n\n';
if (!staleRows.length) {
  md += 'Nothing is past its review window. Clean bill of health.\n\n';
} else {
  md += `${staleRows.length} entities past their \`review_after_months\` window, ranked most-overdue first.\n\n`;
  md += '| Entity ID | Registry | Title | Months overdue | Signal to check | cf |\n';
  md += '|---|---|---|---|---|---|\n';
  staleRows.forEach((r) => {
    const overdue = r.ageUnknown ? 'no as_of' : `+${r.monthsOverdue}mo`;
    const sig = r.signalUrl ? `[${mdEscape(truncate(r.signalToCheck, 60))}](${r.signalUrl})` : mdEscape(truncate(r.signalToCheck, 70));
    md += `| \`${mdEscape(r.id)}\` | ${mdEscape(r.registryLabel)} | ${mdEscape(truncate(r.title, 80))} | ${overdue} | ${sig} | ${mdEscape(r.cf || '—')} |\n`;
  });
  md += '\n';
}

md += '## Freshness summary\n\n';
md += `Fresh: ${freshnessSummary.fresh} · Aging: ${freshnessSummary.aging} · `
    + `Stale: ${freshnessSummary.stale} · Unknown vintage: ${freshnessSummary.unknown} `
    + `(${allEntities.length} total tracked entities, half_life_days-based — see js/store.js Store.staleStatus)\n\n`;
md += `_Generated on ${generatedOnDate}._\n`;

fs.writeFileSync(path.join(ROOT, 'PATROL.md'), md);

// ── stdout summary + exit ───────────────────────────────────────────────────
console.log(`patrol: ${staleRows.length} stale, ${killWatchAlerts.length} kill-watch`);
process.exit(0);
