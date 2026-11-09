# Patrol Queue

Generated 2026-11-09 by `node scripts/patrol-report.js` — pure Node, no network, no AI. This file is a read-only report; nothing here edits the data. See [AGENT_UPDATE.md](AGENT_UPDATE.md) for how to act on it.

## Kill-watch alerts

None near trigger. (Threshold: proximity ≥ 0.8 — roughly within 20% of the kill condition firing.)

## Stale — needs re-verification

62 entities past their `review_after_months` window, ranked most-overdue first.

| Entity ID | Registry | Title | Months overdue | Signal to check | cf |
|---|---|---|---|---|---|
| `tree.spacex-ipo` | Tree | SpaceX IPO | +4mo | — | hi |
| `tree.chatgpt` | Tree | ChatGPT | +2mo | — | hi |
| `tree.race` | Tree | Capability race | +2mo | — | hi |
| `tree.export` | Tree | US export controls | +2mo | [BIS Entity List updates + chip rule revisions](https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list) | hi |
| `tree.china` | Tree | China counters | +2mo | — | hi |
| `tree.capex` | Tree | Hyperscaler capex flood | +2mo | [Big-4 hyperscaler quarterly capex filings](https://www.sec.gov/cgi-bin/browse-edgar) | hi |
| `tree.bottleneck` | Tree | Bottleneck cascade | +2mo | — | hi |
| `tree.power` | Tree | Power becomes binding | +2mo | — | hi |
| `tree.nuke` | Tree | Nuclear repricing | +2mo | — | hi |
| `tree.loops` | Tree | Vendor financing loops | +2mo | — | md |
| `tree.gap` | Tree | The revenue gap | +2mo | — | md |
| `tree.openw` | Tree | DeepSeek shock | +2mo | — | hi |
| `tree.deflate` | Tree | Token price deflation | +2mo | — | hi |
| `tree.labor` | Tree | Labor transmission (early) | +2mo | — | md |
| `tree.anthropic-ramp` | Tree | Anthropic ramp | +2mo | — | hi |
| `tree.agentic-shift` | Tree | Agentic shift | +2mo | [SWE-bench Verified + real-world deployment evidence](https://www.swebench.com) | md |
| `tree.acquihire-wave` | Tree | Acqui-hire wave | +2mo | — | md |
| `tree.memory-supercycle` | Tree | Memory supercycle | +2mo | — | hi |
| `tree.wrapper-window` | Tree | Wrapper window | +2mo | — | hi |
| `tree.spacex-xai-merger` | Tree | SpaceX + xAI merger | +2mo | — | hi |
| `tree.orbital-compute` | Tree | Orbital compute | +2mo | — | lo |
| `tree.reasoning` | Tree | Reasoning models | +2mo | [AIME / GPQA benchmark leaderboard](https://paperswithcode.com/sota/math-word-problems-on-aime-2024) | hi |
| `tree.sovereign-ai` | Tree | Sovereign AI | +2mo | — | md |
| `tree.robotics-fm` | Tree | Robotics foundation models | +2mo | — | md |
| `tree.stablecoin-rails` | Tree | Stablecoin rails | +2mo | — | md |
| `window.sovereign-ai` | Trends | Sovereign AI Buildouts | +2mo | — | md |
| `window.stablecoin-rails` | Trends | Stablecoin Payment Rails | +2mo | — | md |
| `constraint.leading-edge-fab` | Constraints | Leading-edge fab | +2mo | TSMC AZ / Rapidus milestones | — |
| `constraint.euv-tool-order-run` | Constraints | EUV tool (order→run) | +2mo | ASML bookings by region | — |
| `constraint.hbm-qualification` | Constraints | HBM qualification | +2mo | NVDA qual announcements | — |
| `constraint.heavy-gas-turbine-slot` | Constraints | Heavy gas turbine slot | +2mo | GEV / Siemens Energy backlog | — |
| `constraint.large-power-transformer` | Constraints | Large power transformer | +2mo | DOE supply-chain reports | — |
| `constraint.grid-interconnection-us` | Constraints | Grid interconnection (US) | +2mo | LBNL Queued Up annual | — |
| `constraint.hv-transmission-line` | Constraints | HV transmission line | +2mo | FERC 1920 implementation | — |
| `constraint.nuclear-restart` | Constraints | Nuclear restart | +2mo | NRC dockets: Palisades, Duane Arnold | — |
| `constraint.new-western-reactor` | Constraints | New western reactor | +2mo | Vogtle post-mortems; next AP1000 order? | — |
| `constraint.copper-mine-discovery-ore` | Constraints | Copper mine (discovery→ore) | +2mo | TC/RC charges; major-miner M&A | — |
| `constraint.ree-separation-plant` | Constraints | REE separation plant | +2mo | MP 10X; Lynas Texas | — |
| `constraint.lng-train-fid-cargo` | Constraints | LNG train (FID→cargo) | +2mo | FIDs; Henry Hub–TTF/JKM spread | — |
| `constraint.shipyard-slot-lng-box` | Constraints | Shipyard slot (LNG/box) | +2mo | Clarksons orderbook | — |
| `constraint.demographic-cohort` | Constraints | Demographic cohort | +2mo | UN WPP revisions (fertility only) | — |
| `scenario.sc1` | Scenarios | Hormuz closure | +2mo | — | — |
| `scenario.sc2` | Scenarios | Taiwan blockade | +2mo | — | — |
| `scenario.sc3` | Scenarios | China REE/magnet embargo | +2mo | — | — |
| `scenario.sc4` | Scenarios | US power crunch deepens | +2mo | — | — |
| `scenario.sc5` | Scenarios | Cable sabotage wave | +2mo | — | — |
| `grave.nortel` | Graveyard | Nortel Networks | +2mo | — | — |
| `grave.lucent` | Graveyard | Lucent Technologies | +2mo | — | — |
| `grave.worldcom` | Graveyard | WorldCom | +2mo | — | — |
| `grave.webvan` | Graveyard | Webvan | +2mo | — | — |
| `grave.iridium` | Graveyard | Iridium (original) | +2mo | — | — |
| `grave.solyndra` | Graveyard | Solyndra | +2mo | — | — |
| `grave.katerra` | Graveyard | Katerra | +2mo | — | — |
| `grave.ftx` | Graveyard | FTX | +2mo | — | — |
| `grave.theranos` | Graveyard | Theranos | +2mo | — | — |
| `grave.wework` | Graveyard | WeWork (Son bet) | +2mo | — | — |
| `thesis.power_binds` | Theses | AI datacenter power constraints bind through at least 2029 regardless of capita… | +2mo | Grid interconnection median queue time (US, constraint.grid-interconn… | — |
| `thesis.chokepoint_bypass_decay` | Theses | Every chokepoint rent decays over 5–15 years as bypass investments arrive; date… | +2mo | Count of major chokepoint bypasses abandoned mid-construction despite… | — |
| `thesis.demography_determinism` | Theses | 2044 workforce is already born; demographic forecasts (labor supply, consumptio… | +2mo | Largest 10yr fertility-rate reversal, any tracked country | — |
| `thesis.sovereign_ai_price_insensitive` | Theses | Sovereign AI compute buildouts (Gulf, EU, Southeast Asia) represent price-insen… | +2mo | Sovereign AI program budget commitments (UAE/Saudi/EU) vs. prior-year… | — |
| `thesis.capability_window_closure` | Theses | The AI wrapper / commodity-API window closes by 2027 as model providers capture… | +2mo | Largest pure wrapper-layer company: ARR and gross-margin trend | — |
| `method.root` | Method | Operating Method | +2mo | — | — |

## Freshness summary

Fresh: 156 · Aging: 14 · Stale: 6 · Unknown vintage: 0 (176 total tracked entities, half_life_days-based — see js/store.js Store.staleStatus)

_Generated on 2026-11-09._
