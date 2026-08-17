# Patrol Queue

Generated 2026-08-17 by `node scripts/patrol-report.js` — pure Node, no network, no AI. This file is a read-only report; nothing here edits the data. See [AGENT_UPDATE.md](AGENT_UPDATE.md) for how to act on it.

## Kill-watch alerts

None near trigger. (Threshold: proximity ≥ 0.8 — roughly within 20% of the kill condition firing.)

## Stale — needs re-verification

1 entities past their `review_after_months` window, ranked most-overdue first.

| Entity ID | Registry | Title | Months overdue | Signal to check | cf |
|---|---|---|---|---|---|
| `tree.spacex-ipo` | Tree | SpaceX IPO | +1mo | — | hi |

## Freshness summary

Fresh: 170 · Aging: 6 · Stale: 0 · Unknown vintage: 0 (176 total tracked entities, half_life_days-based — see js/store.js Store.staleStatus)

_Generated on 2026-08-17._
