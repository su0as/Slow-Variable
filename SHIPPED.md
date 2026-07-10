# Shipped

## 2026-07-10 — EVERYTHING: accountable multi-trend intensity chart

Inspired by levels.io's Everything Chart, fixing its two flaws — unfalsifiable
vibes, and 24 overlapping lines nobody could read — while keeping what people
actually praised about it (one screen, no interaction needed to get the point).

**Phase A — curve derivation engine.** Optional `curve[{year,belief_0_100,
reality_0_100,band_0_100?}]` field documented on `windows.json`/`theses.json`;
none authored yet, so every curve is computed by new `evtg*` functions in
`js/engine.js` from fields that already exist: theses derive belief from
`crowd_awareness`/`awareness_trend`, reality from `trajectory.points`
normalized by distance-from-`kill_threshold` (polarity-safe — doesn't require
knowing per-thesis whether a higher raw metric is good or bad) where a
trajectory exists, else `reality = belief + consensus_delta_num`; windows
derive reality from `status`/`opened`/`expected_close` (ramp-plateau, decay
after close), belief as reality lagged ~2yr scaled 0.85, converging to
reality once a window closes (hindsight). Every curve is tagged
`derived:true`, distinct from an eventual authored one — and the render code
actually checks for an authored `curve[]` first before falling back to
derivation, not just in the schema docs.

**Phase B — the chart.** New Everything sub-view on the Trends toolbar. SVG
timeline 1990-2035, curated 6 house trends (`thesis.power_binds` plus 5
windows spanning closed/closing/open/forming). Per trend: a reality line and
a belief line, area-shaded gap between them (the widest labeled "EDGE"),
solid where observed and dashed with a widening uncertainty cone where
projected, milestone dots from dated tree events, an ✕ at each curve's
falsifier/close year. Hovering a line or legend chip dims every other curve
(same technique as the Tree tab's `applyTreeLighting`). Click opens the
underlying dossier. Palette: 6 hues reused from the Atlas layer legend
(already proven against this app's black surface), validated with the
dataviz skill's script — all 4 checks pass.

**Phase C — controls.** Only Rising / Only Declining (mutually exclusive,
by each curve's reality direction over the trailing 5 years), Indexed
(rescales each curve to its own peak = 100 — isolates growth shape from
absolute level, a real analytical mode even though the raw values are
already 0-100), Small Multiples (grid of per-trend sparklines — confirmed
this is what actually fixes the illegibility complaint; it's the mobile
default), Fullscreen. The year slider drives the same solid/dashed boundary
every curve shares, reusing the Tree rewind / Trajectory scrubber pattern.

**Phase D — accountability tie-in.** Each curve's falsifier/close year, once
passed, is flagged DUE in its legend chip; a "Log as forecast" button
pre-fills the existing Forecasts tab form (statement, deadline, resolution
criteria — all real, dated, sourced text, never an invented probability) and
hands off to the same Brier/calibration pipeline every other forecast in
this tool already feeds, rather than building a parallel scoring system.
Each legend chip is also tagged DERIVED or AUTHORED — the actual vibes-vs-
verified distinction — with a key explaining it's a separate channel from
the solid/dashed observed-vs-projected line style.

Four real bugs caught in preview testing, not just polish: (1)
`evtgApplyHover()` looked up a DOM id that got renamed away on render, so
hover-dim silently never fired; (2) click handlers assumed every curve opens
via the generic dossier panel, but theses use a different mechanism
(`todayGoToThesis`) that switches tabs instead — clicking the one thesis
curve left the dossier open showing stale content; (3) the right-edge label
de-collision pass didn't reserve space for the widest-gap curve's two-line
"EDGE" badge, so the next label could land on top of it; (4) the NOW-label
logic borrowed from the Trajectory tab's `<=nowYear()` shortcut, which is
correct there (that slider never goes below now) but wrong here (this
slider spans 1990-2035) — scrubbing to a past year showed "NOW · 2010".

## 2026-07-04 — MAGNITUDE: rebrand + LEDGER (value created vs. value captured)

**Phase A — Rebrand ORRERY → MAGNITUDE.** New wordmark "MAGNITUDE" + monogram "OM" in
the masthead, subtitle "Orders of Magnitude · Slow Variables", tagline "finds the
order-of-magnitude gaps — value vs. capture, consensus vs. reality, price vs. truth."
`<title>`, OG/Twitter meta, the OG card (`scripts/generate-og.js`, regenerated), a new
`assets/favicon.svg` (simple "OM" mark, rust-on-black), README, and `package.json`
all updated. Existing tab logic, data, and engine untouched — pure rename.

**Phase B — LEDGER data model.** New `data/ledger.json`: `domains[]` → `layers[]`, each
layer scoring `value_created` and `value_captured` (0-100, both with a `mechanism`/
`basis` string — never a bare number), a `moat{type,strength_0_100,decay_note}` drawn
from the 7 Powers taxonomy (scale/network economies, counter-positioning, switching
costs, branding, cornered resource, process power) or `"none"`, a `migration[]` profit-
pool-share trajectory (2020→2030), and `links[]` back to real existing atlas/tree/
human/constraint ids. Seeded one domain, `ai-compute`, across all 7 layers (power →
chips → memory-hbm → hyperscalers → foundation-models → applications → end-users) —
the house thesis: value creation peaks at foundation models but capture concentrates at
the physical infra floor, because that floor is gated by chokepoints this tool already
tracks (`atlas.tsmc`/`atlas.asml` as TIER1, `constraint.hbm-qualification`,
`constraint.heavy-gas-turbine-slot`), not because it does more of the valuable work.
Every `value_captured` without a real disclosed metric is honestly flagged
`confidence:"asserted"` rather than given an invented precise figure.
`js/validate.js` gained a ledger section: score-range checks, moat-taxonomy
enforcement, and link-resolution against the existing entity registry.

**Phase C — LEDGER view.** New Ledger tab (works on mobile, unlike Atlas/Tree). A
domain picker (currently a no-op with one domain, wired for when a second is seeded),
the domain's house thesis, and a migration scrubber (2020→2030, same slider-plus-label
pattern as the Tree rewind and Constraints clock sliders) that linearly interpolates
each layer's `pool_share_0_100` between its authored years rather than snapping. Each
layer renders as a diverging bar — `value_created` grows left from a center spine,
`value_captured` grows right — colored by the gap: capture>created is red "RENT",
created>capture is blue "LEAK", aligned (within ±8) is white "MOAT"; the spine carries
the moat-type chip. A money-flow SVG overlay animates particles top-to-bottom, each
one thinning as it "passes" higher-capture layers (reusing the atlas flow-arcs'
dash-offset animation technique and the same `prefers-reduced-motion` static-frame
gate as the starfield). Clicking a layer opens a dossier (mechanism, capture metric +
confidence badge — a distinct "ASSERTED" badge for scores with no disclosed metric,
not a misleading LOW — moat strength bar, migration trend, and cross-links grouped by
type: atlas chokepoints and tree nodes as clickable chips, constraints as inert badges
since no constraint dossier exists yet). The INVERT button, previously wired only for
thesis/trend/human dossiers, now also handles `ledger` (a real pre-existing gap for
atlas/tree dossiers was found in passing but left alone — out of scope here). Also
fixed: a second, separately-hardcoded tab list inside the Router handler (duplicating
`TAB_ORDER`) was missing every tab added after the original v2 build; `ledger` is now
in both, and this duplication is worth collapsing to one list later.

**Phase D — Models + HELM tie-in.** Six new `models.json` entries, each wired into a
real computed overlay per the "no Models tab" rule: Value Created vs Value Captured
(tagged on every Ledger dossier's VALUE CREATED section), 7 Powers (tagged on MOAT),
Value Migration (tagged on the migration scrubber and PROFIT-POOL MIGRATION section),
Smiling Curve (tagged on VALUE CAPTURED only for layers that are neither first nor last
in their domain — a real positional claim, not decoration), Picks and Shovels (tagged
on MOAT when `moat.type==="cornered resource"`), Aggregation Theory (tagged on MOAT
when `moat.type==="switching costs"`). HELM gained a new §7 Capture Blindspot: cross-
references `pilot.active_bets` against every ledger layer via word-overlap (not the
existing `helmSkillMatchesText`, which is phrase-substring matching built for short
skill tags — full-sentence bet text needed 2+ shared significant words instead, with a
small stoplist for generic AI-domain words like "model" that were producing coincidence
matches, and light suffix-stripping so "switching cost" matches a layer's own
`moat.type:"switching costs"`), flagging bets that land in a LEAK layer, and separately
surfacing layers marked `solo_accessible` (a new required `ledger.json` field — this
judgment about capital/team requirements belongs in data, not inferred at render time
from moat type alone, since "cornered resource" covers both a garage-buildable niche
and a $20B fab). Every rec cites the layer id and its `moat.decay_note` as the kill
condition. Known limitation, disclosed rather than hidden: the word-overlap match still
surfaces some coincidental hits (shared vocabulary, different referent) alongside the
genuine ones — the UI shows which words matched so a reader can judge for themselves,
same transparency principle as HELM's existing window-match section.

## 2026-07-02 (later still) — ORRERY: from static reference to runnable instrument

Four phases, one rebrand. Slow Variables becomes ORRERY — same data/engine separation,
same keyless patrol model, same vanilla-JS-no-build-step discipline, but four new ways
to actually *turn the thing* instead of just reading it.

**Phase A — Rebrand + NASA design layer.** Masthead, `<title>`, OG/Twitter tags, and
README all rebranded to "ORRERY — Slow Variables · rev 3" (existing tab logic
untouched). New CSS-only design layer: `--rust:#c1440e` alongside the existing red; a
procedural starfield canvas behind the whole app (body/header go transparent so it
shows through gutters, not a full opaque redesign), with parallax on Atlas-map pan and
a single static paint under `prefers-reduced-motion` rather than `display:none`
(matches how `.tnode.live`'s dot already handles reduced motion elsewhere in this
codebase); an engineering title block bottom-right (ORRERY / SLOW VARIABLES / REV 3 /
GEN `<meta.last_updated>`) with rust corner registration marks; a four-glyph
mission-status set (◉ live ✕ killed ⊙ watching ◈ confirmed) derived from real fields
(`kill_watch.proximity`, thesis confidence/margin, window status — never fabricated),
shown in a corner legend and inline on every thesis and trend card.

**Phase B — Orbital Atlas + Trajectory.** A MERCATOR/ORBITAL toggle on the Atlas view:
orbital mode is a radial schematic over the same `ATLAS_NODES` data — NOW at the
center, four labeled time-rings (2030/2035/2044/2050), nodes placed by time-to-lock
(radius, from `atlas.*.rent.half_life_estimate_years` where authored, else a bucket
from the node's own `half_life_days`) and domain (angle, six 60° sectors matching the
existing layer legend), slow auto-rotation gated by reduced-motion. New Trajectory tab:
one SVG chart per thesis carrying the new optional `trajectory` field — solid where
`locked`, dotted+smootherstep-curved otherwise, inside a cone of uncertainty that widens
3.5%/year past the last locked point, with `kill_watch`-scale dashed threshold lines and
a "CONE CROSSES KILL THRESHOLD" alert when applicable. 3 of 5 theses got a trajectory
(each grounded in data already in the repo — LBNL interconnection-queue series,
`atlas.nvda.rent`, an explicitly-labeled editorial S-curve for the one `tipping:true`
thesis); the other 2 are honestly left off the chart. Scenario forks and dated
tree-milestone pins round it out; the year slider scrubs a read-only NOW cursor, same
interaction pattern as the Tree tab's rewind slider.

**Phase C — Simulate.** `sign`/`lag_years`/`sign_basis` added to a curated set of real
tree/atlas links, closing three genuine feedback loops across the tree/atlas boundary:
capex↔reasoning (reinforcing), `atlas.nvda`↔export-controls (balancing — cites
`bypass_maturity` directly), PJM-queue↔nuclear-restart (balancing). Every other link
stays unsigned by default. New Simulate tab: the graph is induced from signed links
only (not a 176-node dump), DFS cycle detection labels each closed loop R or B from the
product of its signs, and a Perturb mode runs a deterministic 10-tick discrete
propagation (damped 0.65×/hop, delayed by `lag_years` — not an ODE solver) with a live
"Dominant Now" ranking by peak signal. Added Donella Meadows' 12 Leverage Points to
`models.json`; selecting a node shows its rank — #7 if reinforcing, #8 if balancing,
#12 if it has no detected loop yet.

**Phase D — HELM.** A private personal lens that renders *only* if a local, gitignored
`pilot.json` loads — on the public deploy the fetch always 404s, so the tab never
appears (schema documented in the committed `pilot.example.json`). Six sections, each
citing the exact node/window it derives from and carrying a falsifier: your position on
the bet-anatomy axes (reusing the Humans scatter's own coordinate system, editorial and
labeled as such); window matches (skill-to-window text overlap against open/forming
windows); a Meadows leverage-point ranking of your skills; concrete asymmetric bets with
a "why you specifically" line and a falsifier pulled from the window's own
`decay_logic`; an inversion check for where your `active_bets[]` share language with a
closing/closed window; and a personal clock plotting your matched windows against your
`horizon_years`. `AGENT_UPDATE.md` documents a separate, opt-in contract for an AI
session asked to refresh HELM directly against a human's real `pilot.json`.

### Verification

- `node js/validate.js` — 0 errors after every phase.
- Manual smoke pass per phase in a local server, desktop (1440×900) and mobile
  (390×812): Orbital toggle, Trajectory scrubber, Simulate perturb/leverage-rank (both
  the reinforcing-loop #7 and balancing-loop #8 branches individually clicked and
  verified — the first pass had them collapsed into a single case), and HELM tested
  with a real local `pilot.json` copied from the example, confirmed hidden again after
  deleting it.
- Two real bugs caught and fixed during verification, not left for later: `buildTrends`
  patched after its one eager init-time call already ran (glyphs never appeared without
  a forced re-render), and the starfield canvas going fully blank after any resize
  event under reduced motion (canvas bitmaps clear on `.width` assignment; the resize
  handler now repaints immediately instead of relying on a rAF loop that reduced motion
  intentionally never starts).

### Deliberately not done

- **Orbital node labels aren't collision-avoided.** With ~60 nodes crowded into six
  60° sectors, Tier-1 labels can overlap at some rotations. Accepted as a known
  limitation of a dense radial diagram rather than building a label-placement solver.
- **Simulate's graph layout is a fixed circle, not force-directed.** Fine for the
  curated ~8-node signed subgraph today; would need real layout work if the signed-edge
  set grows much larger.
- **HELM's text-matching is deliberately crude** (substring/shared-word overlap, not
  embeddings or fuzzy matching) so every match is easy to audit by eye — see
  `AGENT_UPDATE.md` §4 for where real judgment is supposed to take over.

## 2026-07-02 (later same day) — patrol pipeline reconfigured: keyless, two-part

Reverses a decision from earlier the same day (see the entry below). The first cut of
the patrol pipeline called `claude -p` with `ANTHROPIC_API_KEY` in CI, running weekly
and opening its own PRs. That put a paid API key in a public repo's CI for a job that
runs unattended — wrong tradeoff. Replaced it with two decoupled pieces:

- **`scripts/patrol-report.js`** (new) — pure Node, zero dependencies, no network, no
  AI. Replicates the live app's exact staleness math (`js/engine.js`
  `isStale()`/`vintageAge()`, `js/store.js` `Store.staleStatus()`/`freshnessSummary()`)
  across every registry that has an `as_of` (atlas, tree, humans, windows, constraints,
  scenarios, graveyard, theses, method — `models.json`/`forecasts.json` excluded, same
  as `Store._reg()` never registers them). Also scans every thesis `kill_watch` for
  `proximity >= 0.8`. Writes `PATROL.md` (human-readable queue) and `patrol-queue.json`
  (machine-readable, same data). `npm run patrol` runs it. Verified against both an
  empty queue and a synthetic stale/kill-watch entry (temporarily mutated, diffed back
  to zero, confirmed clean) to exercise both the empty-state and populated-table
  rendering paths.
- **`.github/workflows/patrol.yml`** (replaced entirely) — weekly cron +
  `workflow_dispatch`, runs `validate.js` then `patrol-report.js`, and commits the
  regenerated report straight to `main` (no secrets required — it's a deterministic
  report, not a data edit, so no PR gate is needed for it specifically). Separately,
  and guarded to never fail the run, it upserts a single pinned "🔴 Patrol: kill-watch
  active" issue when `kill_watch_alerts` is non-empty, and closes it when the queue is
  clean.
- **`AGENT_UPDATE.md`** (new) — the actual re-verification work moved here entirely:
  a self-contained contract a human pastes to *any* chat AI (Claude, ChatGPT, whatever),
  along with a copy-paste kickoff line, telling it to read `PATROL.md`, verify entries
  with its own web access, follow `UPDATE_PROTOCOL.md`'s rules (never invent a number,
  downgrade `cf` instead of guessing), validate, and open a PR. There is no automation
  that invokes this — it only runs when a human spends an actual AI session on it.

`README.md`, `UPDATE_PROTOCOL.md`, `CLAUDE.md`, and the Method tab's in-app "Update
Protocol" prose (`index.html`) all updated to describe the free-report / on-demand-AI
split and to make explicit that no AI API key exists anywhere in this repo or its CI.

## 2026-07-02 — six-phase simplification + entry-point pass, v2.1.0 → v2.2.0

Summary for whoever reads this next (human or AI).

## What changed

**Phase 1 — Today.** New default landing tab. Three auto-computed cards (tightest
binding constraint vs. the 2030 clock target, highest-edge thesis, kill condition
closest to triggering), a plain-English spotlight for the single most mispriced claim,
a data-health summary, and the next 3 windows closing soonest. Every card deep-links.
Added `kill_watch` and `plain` fields to all 5 theses. Header tabs regrouped into
Understand / Act / Maintain (visual only — no tab removed). Onboarding cut to 3 steps.

**Phase 2 — Spine.** List/Spine toggle in the Thesis tab. Spine mode renders one
thesis at a time as a horizontal SVG ribbon — THESIS → CONSTRAINTS → ATLAS → TREE →
HUMANS → WINDOWS — built by a 3-hop BFS over `Store.neighbors()`/`links`, reusing the
Tech Tree's `.tnode`/`.tedge` styling. Connectors are drawn only where a real link
exists; empty categories say so honestly rather than padding with unrelated nodes.
Theses with fewer than 3 direct cross-registry links get a THIN EVIDENCE badge, in
both list and spine views.

**Phase 3 — Public forecasts.** `data/forecasts.json` — a committed, public forecast
log seeded with 6 real, dated, falsifiable claims already in `windows.json`
(`future_paths`), all still genuinely unresolved. Merges at load with the private
localStorage forecast list; public rows are read-only in the UI (status only, no
resolve/delete). A "PUBLIC TRACK RECORD" banner shows the public-only Brier/resolved
count. "Export my forecasts as JSON" turns the update protocol into: resolve locally →
export → paste into the repo file → commit.

**Phase 4 — Mobile.** Below 700px: header stacks into three rows, each tab group its
own horizontally-scrollable strip of 40px buttons. Atlas and Tree are gated behind a
"Desktop Only" notice (no attempt made to get the canvas map or SVG tree tree working
on a phone). Trends kanban switches from 4 side-scrolling columns to one stacked
column. Today/Thesis/Brief already worked in single-column scrollviews; bumped font
sizes and tap targets to close. Tested at 390×812.

**Phase 5 — Docs.** `README.md` (principles, architecture, full schema reference
table), `UPDATE_PROTOCOL.md` (the file Method already referenced but didn't exist —
step-by-step maintenance contract + per-registry field docs), `CLAUDE.md` (condensed
hard rules + file map for a fresh session), `package.json` + `.github/workflows/
validate.yml` (CI runs the validator on every push/PR).

**Phase 6 — Shareable.** "⎘ Share" button on every thesis card — copies a deep-link
plus a plain-text block (statement, kill condition, live edge %, as-of date) formatted
for pasting into X. OG/Twitter Card meta tags in `index.html`; `scripts/generate-og.js`
(new `canvas` devDependency) renders a static 1200×630 dark card matching the site's
aesthetic, committed as `assets/og.png`.

## Verification

- `node js/validate.js` — 0 errors, both before and after every phase.
- Manual smoke pass in a local server across all 11 tabs, desktop (1440×900) and mobile
  (390×812): no console errors, Today/Thesis/Spine/Forecasts/Trends/Brief all screenshot-
  verified, Atlas/Tree confirmed unaffected on desktop and correctly gated on mobile.
- Share button's clipboard payload and deep-link round-trip verified directly (clicked →
  captured the `clipboard.writeText` call → navigated to the resulting hash → confirmed
  the right card scrolls into view and flashes).

## Deliberately not done

- **No real historical forecast resolutions.** `data/forecasts.json`'s 6 seed entries are
  all `outcome: null` — genuinely pending, not fabricated wins to make the credibility
  banner look good on day one. The track record has to be earned from here.
- **No attempt to make the Atlas map or Tech Tree work on mobile.** They're desktop-only
  by design (pan/zoom canvas, wide horizontal graph); the notice says so plainly instead
  of shipping a degraded experience.
- **No screenshots committed to README.md** — placeholders only (`<!-- screenshot: ... -->`
  comments); actual PNG capture wasn't available through this session's tooling for
  arbitrary UI states the way it was for the OG card (which is a from-scratch canvas
  render, not a page capture).
- **OG domain is a best guess** (`slow-variable.vercel.app`) — update `index.html`'s
  `og:url`/`og:image`/`twitter:image` once the actual production Vercel domain is
  confirmed.
- **No new npm runtime dependencies** — `canvas` is a devDependency used only by the
  one-off `scripts/generate-og.js`; the site itself still ships with zero build step and
  zero runtime dependencies.
