#!/usr/bin/env node
// scripts/generate-og.js — renders assets/og.png, a static 1200×630 OG/share card.
// Run: node scripts/generate-og.js
// Requires the "canvas" devDependency (npm install).

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const RED   = '#ff3b30';
const RUST  = '#c1440e';
const TXT   = '#f0f0f0';
const DIM   = '#888888';
const FAINT = '#484848';
const LINE  = '#1e1e1e';
const MONO  = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

// background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, W, H);

// faint grid, matching the atlas map's graticule aesthetic
ctx.strokeStyle = 'rgba(32,32,32,.6)';
ctx.lineWidth = 1;
ctx.beginPath();
for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
ctx.stroke();

// border
ctx.strokeStyle = LINE;
ctx.lineWidth = 2;
ctx.strokeRect(1, 1, W - 2, H - 2);

// kicker
ctx.fillStyle = RUST;
ctx.font = `600 20px ${MONO}`;
ctx.fillText('M A G N I T U D E', 80, 130);

// title
ctx.fillStyle = TXT;
ctx.font = `600 52px ${MONO}`;
ctx.fillText('Finds the order-of-', 80, 230);
ctx.fillText('magnitude gaps — value', 80, 296);
ctx.fillText('vs. capture, price vs. truth.', 80, 362);

// divider
ctx.strokeStyle = LINE;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(80, 430);
ctx.lineTo(1120, 430);
ctx.stroke();

// footer row: three model chips, echoing the provenance footer
const chips = ['INVERSION', 'MARGIN OF SAFETY', 'REFLEXIVITY', 'RED QUEEN'];
let cx = 80, cy = 470;
ctx.font = `10px ${MONO}`;
chips.forEach((c) => {
  const w = ctx.measureText(c).width + 24;
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx, cy, w, 26);
  ctx.fillStyle = FAINT;
  ctx.fillText(c, cx + 12, cy + 17);
  cx += w + 10;
});

ctx.fillStyle = DIM;
ctx.font = `13px ${MONO}`;
ctx.fillText('Value vs. capture. Consensus vs. reality. Every claim carries a kill condition.', 80, 540);

const out = path.join(__dirname, '..', 'assets', 'og.png');
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('Wrote', out);
