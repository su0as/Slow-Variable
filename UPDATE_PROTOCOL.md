# Update Protocol

This is the contract for any session — AI or human — that updates the data in this
repo. The Method tab's "Update Protocol" section links here. Read it before touching
`/data/*.json`.

**This document is also read automatically.** `.github/workflows/patrol.yml` runs a
headless Claude session against it every Monday, working the top 5 most-overdue
entities plus a full kill_watch scan, and opens a PR with its findings — it never
pushes to main. If you're an AI session invoked *by* that workflow: everything below
applies to you exactly as it would to an interactive session. If you're a human
maintainer: expect a weekly `patrol: <date> — N entities re-verified` PR and review it
like any other PR, not as an auto-merge.

## The four hard rules

1. **Data updates never touch `/js` or `/css`.** All content lives in `/data/*.json`.
   The engine reads it generically; it never hardcodes a node, a person, or a claim. If
   you find yourself editing `js/engine.js` to add content rather than behavior, stop —
   that content belongs in a JSON file instead.
2. **Every claim you touch must be re-verified, not assumed.** If you're updating an
   entity's `as_of`, its `current_state`, or any figure inside it, you must have a source
   for the new value. If you can't verify a figure and are relying on training-data
   recall, say so: set `cf` to `"md"` (or `"lo"` for shaky recall) rather than leaving it
   at `"hi"` or guessing a number. Confidence tags are a promise about verification
   effort, not a vibe.
3. **After any data edit, run the validator and bump the manifest.** `node
   js/validate.js` must pass with 0 errors before you commit. Then bump `meta.json`:
   increment `version`, set `last_updated` to today, update the relevant `counts`, and
   append a `changelog` entry (`date`, `by`, `summary`).
4. **Check the Data Health panel before starting.** Click ⊙ in the header (or open
   `#health-panel` programmatically) — it lists every node past its `review_after_months`
   window. That list *is* the update queue for a maintenance session. Don't go looking
   for something to update; work the queue.

## Step-by-step for a maintenance session

1. Open the site, click ⊙ (Data Health). Note the stale-node list and any forecasts past
   deadline.
2. For each stale node: find its source registry file, verify the claim against a real
   source (web search, filing, official announcement). If confirmed, update the value and
   set `as_of` to today. If you cannot verify, downgrade `cf` and leave a note in
   `analyst_note`/`body` explaining what's unverified — do not silently leave a stale
   figure at high confidence.
3. For each forecast past its deadline (`fc-owed-banner` in the Forecasts tab, or the
   "Resolutions Owed" section of the Brief): resolve it (true/false/ambiguous) with a
   one-line postmortem note if false. If it originated from `data/forecasts.json` (the
   public track record), you cannot edit that row in the UI — instead, update
   `data/forecasts.json` directly and set its `outcome`.
4. If new structural content needs to be added (a new chokepoint, a new bet, a new
   window), follow the schema for that registry (see `README.md`'s schema table). New IDs
   are **append-only** — never renumber or reuse an existing id, since forecasts, links,
   and localStorage overrides may reference it.
5. Run `node js/validate.js`. Fix every error (warnings about dangling links on `draft:
   true` entities are acceptable; warnings on non-draft entities should be fixed).
6. Bump `meta.json` (`version`, `last_updated`, `counts`, `changelog` entry).
7. Commit.

## Per-registry field documentation

### `atlas.json` (nodes)
Required: `id`,`type`,`title`,`lat`,`lon`,`as_of`,`half_life_days`. Content fields:
`weight` (control tier note), `why_hard` (why this binds), `control` (who controls it),
`lead` (lead time to replace/bypass), `consequence` (cascade if disrupted), `signal_desc`
(what to watch), `analyst_note`. Optional `rent` object marks a chokepoint as a decaying
monopoly rent (per the Red Queen model): `{bypass_maturity: 0–1, bypass_candidate,
half_life_estimate_years, maturity_as_of, decay_note}`. Do **not** add `rent` to permanent
geography (straits, canals) — only to human-built/controlled monopolies that face real
bypass investment (fabs, single-supplier tooling, single-source minerals).

### `tree.json` (nodes)
Required envelope + `era` (integer, which era column), `row` (vertical position within
era), `mechanism` (one-line causal mechanism), `body` (fuller detail). `links[]` with
`rel: "requires"` define the DAG — a node's parents. `badge` is one of `"contingent"`,
`"convergent"`, `"flag"`, or omitted. `live: true` marks a still-actively-developing node
(pulses in the UI).

### `humans.json` (people)
Required envelope + `tier` (`C` = massive/legendary bet, `P` = pattern-teaching bet, `W` =
worth noting, `M` = mixed/complicated), `domain`, `bets[]`. Each bet:
`{yr, thesis, consensus_delta, enabler, outcome, anatomy?}`. `anatomy` (optional, 0–5 per
factor: `stake, asymmetry, consensus_delta, timing, control, survival`) is an **editorial
judgment**, not a measurement — label it as such if you add commentary. `dead_bodies[]`
is **mandatory** for every tier C/P entry — the validator does not currently enforce this
automatically, but do not add a winning bet without listing who made the same bet and
lost. `future_paths[]` entries require `{path, p, horizon, falsifier}` — a probability
without a falsifier is an opinion, not a forecast.

### `windows.json` (windows)
Required envelope + `class`, `status` (`closed`/`closing`/`open`/`forming`), `opened`,
`expected_close`, `mechanism`, `decay_logic`. `entry_checklist[]` items are
`{text, status, evidence}`. `future_paths[]` same contract as humans (`p` + `falsifier`
required). Optional `order_effects[]` (see scenarios below) and, for `forming` windows,
`tipping_condition` (plain-English description of the threshold) + `distance_to_tip`
(`pre`/`early`/`near`/`crossed`). **Authoring guard**: an `open` or `forming` window
should carry at least 3 `order_effects` hops before it's considered complete — a window
with fewer is thin evidence for its own thesis links.

### `constraints.json` (rows)
Required envelope + `lead_time` (human-readable), `lead_min_yr`/`lead_max_yr` (numeric,
used by the Order-Book Clock), `cost`, `bottleneck`, `signal`.

### `scenarios.json` (scenarios)
Required envelope + `layers[]` (atlas layer keys to highlight), `trace[]` (ordered atlas
node ids the map flies through). Optional `order_effects[]`: each hop is
`{order (1-indexed), text, entity (a Store id or null), confidence ("hi"/"md"/"lo")}`.
The deepest hop is where "the edge lives" — the non-obvious, still-mispriced
consequence — and should be the most interesting, least consensus claim in the chain.

### `graveyard.json` (graveyard)
Required envelope + `tier` (usually `D`), `cause_of_death`, `bets[]`, `dead_bodies[]`,
`lessons[]`. Entries marked `"draft": true` are pending author verification — do not
promote a draft to non-draft without checking the underlying facts.

### `theses.json` (theses)
Required envelope + `statement` (the technical claim), `confidence`, `kill_condition`
(the falsifiable observable that retires the thesis — mandatory, no thesis without one),
`plain` (one sentence, zero jargon — what a smart non-specialist would need to hear),
`supports[]` (ids this thesis rests on, drives the Thesis Spine view). Edge-meter fields:
`crowd_awareness` (0–1, how priced-in this is), `awareness_as_of`, `awareness_trend`
(`rising`/`flat`/`falling`), `consensus_delta_num` (0–1, how wrong the crowd is),
`edge_basis` (why this is still mispriced, one paragraph). `margin` object:
`{tightness: "wide"|"adequate"|"thin"|"none", buffer_note, breaks_at}`. `kill_watch`
object (optional but strongly preferred): `{signal, current_value, trigger_value, as_of,
proximity}` — `proximity` is an editorial 0–1 estimate of how close the signal is to
triggering the kill condition; mark `current_value` as `"unverified"` or `"unknown"`
honestly rather than inventing a number you haven't checked. A thesis with fewer than 3
entries in `links[]` gets an automatic "THIN EVIDENCE" badge in the UI — treat that as a
prompt to add supporting links, not just cosmetic noise.

### `forecasts.json` (forecasts) — the public track record
Same shape as a private forecast: `{key, stmt, p, dl, falsifier, resolver, criteria,
outcome, added}`. Entries here are rendered **read-only** in the UI (marked `public` at
load time) — to change one, edit this file directly, not through the Forecasts tab.
`key` should be unique and stable; use the `"public/<reg>/<id>/<index>"` convention so it
never collides with locally-seeded keys (`"human/..."`, `"trend/..."`). Never add an
entry with a fabricated resolved `outcome` — if you don't have a verified real-world
resolution for a claim, leave `outcome: null`. The maintenance prompt after any data
refresh: check the Forecasts tab's private "Export my forecasts as JSON" output for any
forecasts a user has resolved locally and worth promoting into this file, and merge them
in by hand.

### `models.json` (models)
Required: `id`,`name`,`discipline`,`one_line`,`source`,`powers[]` (feature/model ids this
model is cited by — controls where its `⊢ModelName` provenance tag appears). Do not add
a model here unless it's actually driving a rendered field/overlay/action somewhere in
the engine — this registry has no "glossary" mode.

### `meta.json`
`{version, last_updated, counts: {atlas, tree, humans, trends, constraints, scenarios},
changelog: [{date, by, summary}, ...]}`. Bump every session that touches data.
