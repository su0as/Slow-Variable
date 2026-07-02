# Shipped — 2026-07-02

Six-phase simplification + entry-point pass, v2.1.0 → v2.2.0. Summary for whoever
reads this next (human or AI).

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
