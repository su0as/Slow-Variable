# Patrol Queue

Generated 2026-10-05 by `node scripts/patrol-report.js` — pure Node, no network, no AI. This file is a read-only report; nothing here edits the data. See [AGENT_UPDATE.md](AGENT_UPDATE.md) for how to act on it.

## Kill-watch alerts

None near trigger. (Threshold: proximity ≥ 0.8 — roughly within 20% of the kill condition firing.)

## Stale — needs re-verification

62 entities past their `review_after_months` window, ranked most-overdue first.

| Entity ID | Registry | Title | Months overdue | Signal to check | cf |
|---|---|---|---|---|---|
| `tree.spacex-ipo` | Tree | SpaceX IPO | +3mo | — | hi |
| `tree.chatgpt` | Tree | ChatGPT | +1mo | — | hi |
| `tree.race` | Tree | Capability race | +1mo | — | hi |
| `tree.export` | Tree | US export controls | +1mo | [BIS Entity List updates + chip rule revisions](https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list) | hi |
| `tree.china` | Tree | China counters | +1mo | — | hi |
| `tree.capex` | Tree | Hyperscaler capex flood | +1mo | [Big-4 hyperscaler quarterly capex filings](https://www.sec.gov/cgi-bin/browse-edgar) | hi |
| `tree.bottleneck` | Tree | Bottleneck cascade | +1mo | — | hi |
| `tree.power` | Tree | Power becomes binding | +1mo | — | hi |
| `tree.nuke` | Tree | Nuclear repricing | +1mo | — | hi |
| `tree.loops` | Tree | Vendor financing loops | +1mo | — | md |
| `tree.gap` | Tree | The revenue gap | +1mo | — | md |
| `tree.openw` | Tree | DeepSeek shock | +1mo | — | hi |
| `tree.deflate` | Tree | Token price deflation | +1mo | — | hi |
| `tree.labor` | Tree | Labor transmission (early) | +1mo | — | md |
| `tree.anthropic-ramp` | Tree | Anthropic ramp | +1mo | — | hi |
| `tree.agentic-shift` | Tree | Agentic shift | +1mo | [SWE-bench Verified + real-world deployment evidence](https://www.swebench.com) | md |
| `tree.acquihire-wave` | Tree | Acqui-hire wave | +1mo | — | md |
| `tree.memory-supercycle` | Tree | Memory supercycle | +1mo | — | hi |
| `tree.wrapper-window` | Tree | Wrapper window | +1mo | — | hi |
| `tree.spacex-xai-merger` | Tree | SpaceX + xAI merger | +1mo | — | hi |
| `tree.orbital-compute` | Tree | Orbital compute | +1mo | — | lo |
| `tree.reasoning` | Tree | Reasoning models | +1mo | [AIME / GPQA benchmark leaderboard](https://paperswithcode.com/sota/math-word-problems-on-aime-2024) | hi |
| `tree.sovereign-ai` | Tree | Sovereign AI | +1mo | — | md |
| `tree.robotics-fm` | Tree | Robotics foundation models | +1mo | — | md |
| `tree.stablecoin-rails` | Tree | Stablecoin rails | +1mo | — | md |
| `window.sovereign-ai` | Trends | Sovereign AI Buildouts | +1mo | — | md |
| `window.stablecoin-rails` | Trends | Stablecoin Payment Rails | +1mo | — | md |
| `constraint.leading-edge-fab` | Constraints | Leading-edge fab | +1mo | TSMC AZ / Rapidus milestones | — |
| `constraint.euv-tool-order-run` | Constraints | EUV tool (order→run) | +1mo | ASML bookings by region | — |
| `constraint.hbm-qualification` | Constraints | HBM qualification | +1mo | NVDA qual announcements | — |
| `constraint.heavy-gas-turbine-slot` | Constraints | Heavy gas turbine slot | +1mo | GEV / Siemens Energy backlog | — |
| `constraint.large-power-transformer` | Constraints | Large power transformer | +1mo | DOE supply-chain reports | — |
| `constraint.grid-interconnection-us` | Constraints | Grid interconnection (US) | +1mo | LBNL Queued Up annual | — |
| `constraint.hv-transmission-line` | Constraints | HV transmission line | +1mo | FERC 1920 implementation | — |
| `constraint.nuclear-restart` | Constraints | Nuclear restart | +1mo | NRC dockets: Palisades, Duane Arnold | — |
| `constraint.new-western-reactor` | Constraints | New western reactor | +1mo | Vogtle post-mortems; next AP1000 order? | — |
| `constraint.copper-mine-discovery-ore` | Constraints | Copper mine (discovery→ore) | +1mo | TC/RC charges; major-miner M&A | — |
| `constraint.ree-separation-plant` | Constraints | REE separation plant | +1mo | MP 10X; Lynas Texas | — |
| `constraint.lng-train-fid-cargo` | Constraints | LNG train (FID→cargo) | +1mo | FIDs; Henry Hub–TTF/JKM spread | — |
| `constraint.shipyard-slot-lng-box` | Constraints | Shipyard slot (LNG/box) | +1mo | Clarksons orderbook | — |
| `constraint.demographic-cohort` | Constraints | Demographic cohort | +1mo | UN WPP revisions (fertility only) | — |
| `scenario.sc1` | Scenarios | Hormuz closure | +1mo | — | — |
| `scenario.sc2` | Scenarios | Taiwan blockade | +1mo | — | — |
| `scenario.sc3` | Scenarios | China REE/magnet embargo | +1mo | — | — |
| `scenario.sc4` | Scenarios | US power crunch deepens | +1mo | — | — |
| `scenario.sc5` | Scenarios | Cable sabotage wave | +1mo | — | — |
| `grave.nortel` | Graveyard | Nortel Networks | +1mo | — | — |
| `grave.lucent` | Graveyard | Lucent Technologies | +1mo | — | — |
| `grave.worldcom` | Graveyard | WorldCom | +1mo | — | — |
| `grave.webvan` | Graveyard | Webvan | +1mo | — | — |
| `grave.iridium` | Graveyard | Iridium (original) | +1mo | — | — |
| `grave.solyndra` | Graveyard | Solyndra | +1mo | — | — |
| `grave.katerra` | Graveyard | Katerra | +1mo | — | — |
| `grave.ftx` | Graveyard | FTX | +1mo | — | — |
| `grave.theranos` | Graveyard | Theranos | +1mo | — | — |
| `grave.wework` | Graveyard | WeWork (Son bet) | +1mo | — | — |
| `thesis.power_binds` | Theses | AI datacenter power constraints bind through at least 2029 regardless of capita… | +1mo | Grid interconnection median queue time (US, constraint.grid-interconn… | — |
| `thesis.chokepoint_bypass_decay` | Theses | Every chokepoint rent decays over 5–15 years as bypass investments arrive; date… | +1mo | Count of major chokepoint bypasses abandoned mid-construction despite… | — |
| `thesis.demography_determinism` | Theses | 2044 workforce is already born; demographic forecasts (labor supply, consumptio… | +1mo | Largest 10yr fertility-rate reversal, any tracked country | — |
| `thesis.sovereign_ai_price_insensitive` | Theses | Sovereign AI compute buildouts (Gulf, EU, Southeast Asia) represent price-insen… | +1mo | Sovereign AI program budget commitments (UAE/Saudi/EU) vs. prior-year… | — |
| `thesis.capability_window_closure` | Theses | The AI wrapper / commodity-API window closes by 2027 as model providers capture… | +1mo | Largest pure wrapper-layer company: ARR and gross-margin trend | — |
| `method.root` | Method | Operating Method | +1mo | — | — |

## Freshness summary

Fresh: 156 · Aging: 14 · Stale: 6 · Unknown vintage: 0 (176 total tracked entities, half_life_days-based — see js/store.js Store.staleStatus)

_Generated on 2026-10-05._
