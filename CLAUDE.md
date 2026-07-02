# CLAUDE.md

Condensed rules for a Claude Code session working in this repo. For the full data
maintenance contract, read `UPDATE_PROTOCOL.md`. For architecture and schema, read
`README.md`.

## Hard rules

- **Data updates never touch `/js` or `/css`.** All content is in `/data/*.json`. The
  engine (`js/engine.js`) reads it generically — it must never hardcode an entity, a
  claim, or a figure. If a task is "add X" and X is content (a person, a node, a
  thesis), the change is a JSON edit, not an engine edit.
- **No "Models" tab, section, or glossary.** Every mental model must manifest as a field,
  a computed overlay, or an action on a specific entity (see `models.json` + the
  `provenanceTag()` / `⊢ModelName` mechanism in `js/engine.js`). If you're tempted to add
  a standalone models page, don't — find where the model should be doing visible work
  instead.
- **Falsifiability is schema-enforced.** Theses require `kill_condition`. `future_paths`
  entries require `p` and `falsifier`. Tier C/P humans require `dead_bodies`. Don't add
  content that violates this even if the validator doesn't currently catch it — see
  `js/validate.js` for what it does check, and treat gaps as bugs to flag, not loopholes.
- **Never guess a figure.** If you can't verify a number, downgrade `cf` to `"md"`/`"lo"`
  and say so in the relevant `body`/`analyst_note`/`edge_basis` field instead of writing a
  confident-sounding fabrication.
- **IDs are append-only.** Never renumber or reuse an id — other entities, forecasts, and
  user localStorage overrides may reference it by string.
- **Run `node js/validate.js` before every commit that touches `/data`.** It must pass
  with 0 errors.
- **Bump `data/meta.json`** (`version`, `last_updated`, `counts`, `changelog`) on every
  data-content commit.

## File map

```
index.html            shell: header, all view containers, modals — no content, just structure
css/main.css            all styles; media query for mobile lives at the bottom (max-width:700px)
js/world.js              raw world-map polygon data — do not hand-edit
js/store.js               fetches data/*.json, builds Store.get/neighbors/trace/search/staleStatus
js/router.js               hash routing (#/atlas, #/thesis, etc.) — default path is "today"
js/engine.js                all rendering logic, wrapped in an IIFE inside initApp().
                             Patched functions follow the pattern:
                               var _origFoo = foo;
                               foo = function(...) { _origFoo(...); /* additions */ };
                             This is how later features (bias checks, provenance tags,
                             the Spine view) layer onto earlier dossier renderers without
                             rewriting them — follow the same pattern for new additions.
js/validate.js               schema + link + probability + envelope validator (run before commit)
data/*.json                   all content — see README.md's schema table
UPDATE_PROTOCOL.md              the data-maintenance contract
scripts/                        one-off node scripts (e.g. OG image generation)
.github/workflows/validate.yml   CI: runs js/validate.js on every push/PR
```

## Working in `js/engine.js`

- It's one large IIFE (`(function(){ ... })()` inside `initApp()`), not modules. Every
  function is a `var`-hoisted function declaration in that scope — order of definition
  mostly doesn't matter, but keep new code near the feature it extends for readability.
- The established way to extend an existing render function (dossier renderers,
  `buildThesisRegister`, `buildScenarios`) without touching its body is the `_origFoo`
  patch pattern already used throughout the file — grep for `_orig` to see examples.
- Global helpers you'll want: `$(id)` (getElementById), `esc(s)` (HTML-escape),
  `Store.get/neighbors/trace/search/staleStatus`, `openDossier(reg,id)`,
  `Router.navigate(path,params)`.
- `THESES`, `HUMANS`, `TREE`, `TRENDS`, `ATLAS_NODES`, `CONSTRAINTS`, `SCENARIOS`,
  `GRAVEYARD` are the flattened/normalized arrays derived from `Store.raw.*` at the top
  of `initApp()` — prefer these over re-reading `Store.raw` inside render functions.

## Preview / testing

There's a dev server config at `.claude/launch.json` (one level up, at the `Magnitude`
project root) pointing `npx serve` at this directory on port 5173. Use the Preview tool
to start it, screenshot views, and click through flows — this is a UI-heavy static site,
so changes should be visually verified, not just validated for JSON correctness.
