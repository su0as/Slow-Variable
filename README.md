# MAGNITUDE — Slow Variables · rev 3

MAGNITUDE finds the order-of-magnitude gaps: value vs. capture, consensus vs. reality,
price vs. truth. It maps the slow-moving structural variables — chokepoints, lead times,
demography, chip supply chains, energy buildouts — that determine what's *actually*
possible over the next 5–20 years, cross-links them to the tech tree that grew out of
them, the high-agency people who bet on them early, the market windows they opened, and
the value chains where the money created diverges from the money captured, and forces
every claim in the system to carry a kill condition. It is a single static HTML/CSS/JS
site with no build step and no backend; all content lives in versioned JSON and is
meant to be read, verified, and edited by a future AI session as much as by a human.
The name: most mispricings aren't small — they're off by an order of magnitude, and the
tool exists to find *which* order and *where*.

<!-- screenshot: assets/screenshots/today.png -->
<!-- screenshot: assets/screenshots/thesis-spine.png -->
<!-- screenshot: assets/screenshots/atlas-map.png -->

## Three design principles

1. **Models as mechanics, not a glossary.** There is no "Models" tab. Every mental model
   (inversion, margin of safety, circle of competence, reflexivity, second-order effects,
   Red Queen decay, critical mass, Goodhart's law, survivorship bias, scale laws) shows up
   as a *field*, a *computed overlay*, or an *action* directly inside a dossier — an edge
   meter, a rent-decay bar, an INVERT button, an auto-triggered bias flag. If a model
   isn't doing visible work on a specific entity, it doesn't belong in the data.
2. **Falsifiability as schema, not prose.** A thesis without a `kill_condition` doesn't
   validate. A future path without a `falsifier` doesn't validate. A winning bet without
   `dead_bodies` (people who made the same bet and lost) doesn't validate. The schema
   itself enforces the epistemic discipline — see `js/validate.js`.
3. **AI-maintained.** This repo assumes its primary maintainer across time is a sequence
   of AI sessions, not one person. `UPDATE_PROTOCOL.md` and `CLAUDE.md` exist so that a
   fresh session with no memory of this one can pick up the data-maintenance work safely:
   verify before writing, downgrade confidence instead of guessing, run the validator,
   bump the version.

## How to run

No build step. Two ways to view it:

- **Directly**: open `index.html` in a browser. (Some browsers block `fetch()` on
  `file://` — if the data doesn't load, use the local server instead.)
- **Local server**: `npx serve -p 5173 --no-clipboard .` then visit `http://localhost:5173`.

Validate the data after any edit:

```
node js/validate.js
```

Deployment is a static host (Vercel) pointed at this directory — pushing to the tracked
branch is the entire deploy step.

## Architecture: engine vs. data

The engine (`js/*.js`, `css/main.css`, `index.html`) is generic — it renders whatever is
in `/data/*.json` and never hardcodes content. **Data updates never touch `/js`.** If a
future session needs to add a chip fab, a new human bet, a new trend window, or a new
kill condition, the change is a JSON edit, full stop.

```
index.html          shell + all view containers, loaded once
js/world.js          raw world-map polygon data (do not hand-edit)
js/store.js           fetches every data/*.json, builds the entity graph (Store.get,
                       Store.neighbors, Store.trace, Store.search, Store.staleStatus)
js/router.js          hash-based routing (#/atlas, #/tree?node=..., etc.)
js/engine.js           all rendering: map canvas + orbital schematic, tech tree SVG,
                       trajectory charts, causal-loop simulator, dossiers, Thesis
                       Register + Spine view, Today, Forecasts, Brief, Patrol, Method,
                       Helm (only if pilot.json loads)
js/validate.js         schema + cross-reference validator, run before every commit
scripts/patrol-report.js  free, keyless staleness queue generator — see Patrol below
data/*.json             all content — see schema reference below
data/ledger.json          value created vs. value captured, per domain→layers (Ledger tab)
pilot.example.json       HELM's schema reference — copy to pilot.json (gitignored) to use it
```

Every entity (atlas node, tree node, human, window, constraint, scenario, graveyard
entry, thesis) shares an envelope: `id`, `type`, `title`, `as_of`, `half_life_days`,
`signals[]`, `links[]`, plus a `cf` confidence tag (`hi`/`md`/`lo`) and, on most
registries, `review_after_months`. `links[]` is the cross-registry graph — `{to, rel}`
pairs with `rel` drawn from a fixed vocabulary (`enables`, `requires`, `threatens`,
`gates`, `capitalized_on`, `killed`, `bypasses`, `watches`, `context`). Everything the UI
draws as a connection — chip lists, the Thesis Spine ribbon, cause/effect chains in the
Tech Tree — comes from this graph, not from hand-written HTML.

A `links[]` entry can optionally carry `sign` (`1` or `-1`) and `lag_years` (number),
each requiring a one-line `sign_basis`. These power the Simulate tab's causal loop
diagram — an unsigned link renders dashed ("unverified") there; only sign the edges you
can actually justify. A thesis can optionally carry a `trajectory` field
(`{metric, unit, points:[{year,value,locked}], tipping, kill_threshold?, source?}`) that
the Trajectory tab charts NOW→2050 — theses without one are honestly left off that
chart instead of backfilled with an invented curve.

A window or thesis can optionally carry a `curve` field
(`[{year,belief_0_100,reality_0_100,band_0_100?}]`) for the Trends tab's Everything
chart — belief tracks perceived/crowd intensity, reality tracks the underlying
mechanism's actual intensity, and the gap between them is "the edge." No entity has
one authored yet, so every curve currently shown is computed by `js/engine.js`'s
`evtg*` functions from fields that already exist (`crowd_awareness`/`awareness_trend`/
`consensus_delta_num` for theses, `trajectory.points` normalized by distance from
`kill_threshold` where present, `status`/`opened`/`expected_close` for windows) and
tagged `derived:true` — visually distinct from an authored curve, never presented as
measured. Same discipline as `trajectory`: an entity without enough signal to derive
a defensible curve just doesn't appear on the chart.

### The views

Today · Thesis (with a Spine causal-ribbon toggle) · Atlas (with an Orbital radial-
schematic toggle) · Tree · Trajectory · Ledger (value created vs. value captured, with
a migration scrubber) · Humans · Trends (Kanban/Timeline/Matrix/Everything — a multi-
trend belief-vs-reality intensity chart) · Constraints · Forecasts · Simulate · Method ·
Patrol · Brief — plus Helm, which only exists if you have a local `pilot.json`. Atlas
and Tree are desktop-only (canvas pan/zoom); everything else, including Ledger, works
on mobile.

## Data schema reference

| File | Top-level key | What it holds | Notable fields |
|---|---|---|---|
| `atlas.json` | `nodes[]`, `arcs[]` | Physical/geopolitical chokepoints and control points on the world map | `lat`,`lon`,`weight`,`why_hard`,`control`,`lead`,`consequence`,`signal_desc`,`analyst_note`; optional `rent{bypass_maturity, bypass_candidate, half_life_estimate_years, decay_note}` |
| `tree.json` | `nodes[]`, `eras[]` | The tech tree — Factorio-style requires/unlocks graph | `era`,`row`,`date_label`,`mechanism`,`body`,`badge`,`live` |
| `humans.json` | `people[]` | High-agency individuals and their bets | `tier`(C/P/W/M),`domain`,`bets[]`(each with optional `anatomy{stake,asymmetry,consensus_delta,timing,control,survival}` 0–5),`chain[]`,`current_state`,`future_paths[]`,`dead_bodies[]`(mandatory for tier C/P),`lessons[]`; optional `circle[]` for circle-of-competence |
| `windows.json` | `windows[]` | Market/opportunity windows (open/closing/closed/forming) | `class`,`status`,`opened`,`expected_close`,`mechanism`,`effects[]`,`decay_logic`,`entry_checklist[]`,`who_won[]`,`who_died[]`,`future_paths[]`; optional `order_effects[]`, `tipping_condition`, `distance_to_tip`, `curve[{year,belief_0_100,reality_0_100,band_0_100?}]` (Everything chart — see below) |
| `constraints.json` | `rows[]` | Physical lead-time bottlenecks (fabs, turbines, transmission, mines) | `lead_time`,`lead_min_yr`,`lead_max_yr`,`cost`,`bottleneck`,`signal` |
| `scenarios.json` | `scenarios[]` | Tracer scenarios for the Atlas map | `layers[]`,`trace[]` (node ids to fly to), `order_effects[]` (second-order causal chains, each hop with `order`,`text`,`entity`,`confidence`) |
| `graveyard.json` | `graveyard[]` | Failed bets/companies — the survivorship-bias correction | `tier`(usually D),`cause_of_death`,`bets[]`,`dead_bodies[]`,`lessons[]` |
| `theses.json` | `theses[]` | The explicit, falsifiable claims the whole tool commits to | `statement`,`confidence`,`kill_condition`,`plain`(one-sentence, no jargon),`supports[]`,`crowd_awareness`,`consensus_delta_num`,`edge_basis`,`margin{tightness,buffer_note,breaks_at}`,`kill_watch{signal,current_value,trigger_value,as_of,proximity}`; optional `trajectory{...}` (Trajectory tab), `curve[{year,belief_0_100,reality_0_100,band_0_100?}]` (Everything chart — see below) |
| `method.json` | single object | Predictability hierarchy, operating rules, bias checklist, primary sources | `hierarchy[]`,`rules[]`,`biases[]`,`sources[]` |
| `models.json` | `models[]` | The mental-model registry powering provenance tags (`⊢ModelName`) | `discipline`,`one_line`,`source`,`powers[]` (which UI features cite this model) |
| `ledger.json` | `domains[]` | Value created vs. value captured across a value chain, per domain→`layers[]` | `value_created{score_0_100,mechanism,basis}`,`value_captured{score_0_100,metric,basis,confidence}`,`moat{type (7 Powers or "none"),strength_0_100,decay_note}`,`solo_accessible{value,note}` (fed to HELM's Capture Blindspot),`migration[{year,pool_share_0_100}]`,`links[]` (atlas/tree/human/constraint ids) |
| `forecasts.json` | `forecasts[]` | The **public, committed** forecast track record | `stmt`,`p`,`dl`,`falsifier`,`resolver`,`criteria`,`outcome`,`key`; merged in-app with a private localStorage set (see Forecasts tab) |
| `meta.json` | single object | Version, data vintage, per-registry counts, changelog | bump on every data change |

## Update protocol (summary)

Full contract is in [`UPDATE_PROTOCOL.md`](UPDATE_PROTOCOL.md). Short version: check the
Data Health panel (⊙ in the header) first — it's the queue of what's overdue. Verify
before writing; if you can't verify, downgrade `cf` to `"md"` rather than guess. Data
edits go in `/data/*.json` only. Run `node js/validate.js` before committing. Bump
`meta.json`'s `version` and add a `changelog` entry.

### Patrol: free report + on-demand AI update

Staleness detection and the actual fix are two separate, deliberately decoupled steps —
**no AI API key exists anywhere in this repo or its CI.**

1. **Free, keyless, automatic.** `.github/workflows/patrol.yml` runs weekly (plain
   `node scripts/patrol-report.js`, zero dependencies, no network calls) and commits
   two generated files straight to main: [`PATROL.md`](PATROL.md) (human-readable) and
   `patrol-queue.json` (machine-readable). It replicates the exact staleness math the
   live app uses (`isStale()`/`vintageAge()` in `js/engine.js`, `Store.staleStatus()` in
   `js/store.js`) and flags any thesis `kill_watch` at or past 0.8 proximity. It reads
   dates; it never decides what's true, and it never edits `/data`.
2. **Paid, on-demand, human-triggered.** Re-verifying a claim requires judgment and web
   access, which costs money and shouldn't run unattended on a schedule. Instead: a
   human pastes the repo (or `PATROL.md` + `AGENT_UPDATE.md`) into any chat AI —
   Claude, ChatGPT, whatever — and that AI session *is* the compute. See
   [`AGENT_UPDATE.md`](AGENT_UPDATE.md) for the exact contract, including a copy-paste
   kickoff line.

## What this deliberately does not do

- No backend, no database, no user accounts — the private layer (forecasts you add,
  overrides you mark verified) lives in `localStorage` only.
- No attempt to make the Atlas map or Tech Tree usable on a phone — see the mobile
  "Desktop Only" notice on those two tabs.
- No fabricated historical forecast resolutions — `data/forecasts.json` only contains
  claims that are honestly still pending as of its vintage.
- No AI API key anywhere in this repo or its CI, ever — the weekly patrol workflow is
  plain, dependency-free Node. Re-verification requires judgment and web access, so it
  only happens when a human spends an actual AI chat session on it — see
  `AGENT_UPDATE.md`.
- No personal data in this repo, ever — `pilot.json` (HELM's input) is gitignored and
  never deployed. The public site literally cannot render HELM; the fetch 404s and the
  tab never appears. `pilot.example.json` is a fictional worked example, not anyone's
  real coordinates.
