// js/store.js — entity registry, adjacency index, staleness engine, search
// Exposes: Store.get(id), Store.neighbors(id, rel?), Store.search(q), Store.staleStatus(entity)
// Store.ready(cb) — fires once all JSON is loaded

const Store = (function() {
  const entityMap = new Map();  // id → entity
  const fwdIndex  = new Map();  // id → [{to, rel}]
  const revIndex  = new Map();  // id → [{from, rel}]
  const searchIdx = [];         // [{id, type, title, aliases, snippet}]

  let _readyCbs = [];
  let _isReady  = false;
  let _raw      = null;
  let _overrides = {};

  function ready(cb) {
    if (_isReady) { cb(); return; }
    _readyCbs.push(cb);
  }
  function _fire() {
    _isReady = true;
    _readyCbs.forEach(cb => cb());
    _readyCbs = [];
  }

  // ── Entity access ──────────────────────────────────────────────────────────
  function get(id) {
    const entity = entityMap.get(id);
    if (!entity) return null;
    return _overrides[id] ? Object.assign({}, entity, _overrides[id]) : entity;
  }

  function all() { return [...entityMap.values()]; }

  // ── Adjacency ──────────────────────────────────────────────────────────────
  function neighbors(id, rel) {
    const outs = (fwdIndex.get(id) || []).filter(e => !rel || e.rel === rel);
    const ins  = (revIndex.get(id) || []).filter(e => !rel || e.rel === rel);
    return { out: outs, in: ins };
  }

  // BFS path between two ids (undirected); returns array of [{id, rel}] hops or null
  function trace(fromId, toId, maxHops) {
    const limit = maxHops || 6;
    if (fromId === toId) return [{ id: fromId, rel: null }];
    const visited = new Set([fromId]);
    // queue: [path array]
    let queue = [[{ id: fromId, rel: null }]];
    while (queue.length) {
      const path = queue.shift();
      const cur  = path[path.length - 1].id;
      if (path.length > limit + 1) break;
      const { out, in: ins } = neighbors(cur);
      const nexts = [
        ...out.map(e => ({ id: e.to,   rel: e.rel, dir: '→' })),
        ...ins.map(e => ({ id: e.from, rel: e.rel, dir: '←' }))
      ];
      for (const n of nexts) {
        if (visited.has(n.id)) continue;
        visited.add(n.id);
        const newPath = [...path, { id: n.id, rel: n.rel, dir: n.dir }];
        if (n.id === toId) return newPath;
        queue.push(newPath);
      }
    }
    return null;
  }

  // ── Staleness ──────────────────────────────────────────────────────────────
  function staleStatus(entity) {
    const e      = typeof entity === 'string' ? get(entity) : entity;
    if (!e) return 'unknown';
    const override = _overrides[e.id];
    const asOfStr  = (override && override.as_of) || e.as_of;
    if (!asOfStr) return 'unknown';
    const elapsed  = (Date.now() - new Date(asOfStr).getTime()) / 86400000;
    const hl       = e.half_life_days || 365;
    if (elapsed < hl * 0.5) return 'fresh';
    if (elapsed < hl)       return 'aging';
    return 'stale';
  }

  function freshnessSummary() {
    const counts = { fresh: 0, aging: 0, stale: 0, unknown: 0 };
    for (const e of entityMap.values()) counts[staleStatus(e)]++;
    return counts;
  }

  // ── Search (hand-rolled fuzzy: exact > prefix > contains > subsequence) ────
  function search(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();

    const score = item => {
      const t = item.title.toLowerCase();
      if (t === q) return 100;
      if (t.startsWith(q)) return 70;
      if (t.includes(q)) return 50;
      for (const a of item.aliases) {
        if (a.toLowerCase().includes(q)) return 40;
      }
      if (item.snippet.toLowerCase().includes(q)) return 20;
      // subsequence
      let qi = 0, ti = 0, bonus = 0;
      while (qi < q.length && ti < t.length) {
        if (t[ti] === q[qi]) {
          qi++;
          bonus += (t[ti - 1] === ' ' || ti === 0) ? 2 : 1; // word-boundary bonus
        }
        ti++;
      }
      if (qi === q.length) return Math.min(15, bonus);
      return 0;
    };

    return searchIdx
      .map(item => ({ ...item, _s: score(item) }))
      .filter(item => item._s > 0)
      .sort((a, b) => b._s - a._s)
      .slice(0, 24);
  }

  // ── Internal: register entity ──────────────────────────────────────────────
  function _reg(entity) {
    if (!entity?.id) return;
    entityMap.set(entity.id, entity);
    for (const link of (entity.links || [])) {
      if (!link.to || !link.rel) continue;
      if (!fwdIndex.has(entity.id)) fwdIndex.set(entity.id, []);
      fwdIndex.get(entity.id).push({ to: link.to, rel: link.rel });
      if (!revIndex.has(link.to))  revIndex.set(link.to,  []);
      revIndex.get(link.to).push({ from: entity.id, rel: link.rel });
    }
    searchIdx.push({
      id:      entity.id,
      type:    entity.type,
      title:   entity.title || entity.id,
      aliases: entity.aliases || [],
      snippet: (entity.body || entity.mechanism || entity.statement || '').slice(0, 200)
    });
  }

  // ── Bootstrap: fetch all JSON ──────────────────────────────────────────────
  async function _init() {
    try {
      _overrides = JSON.parse(localStorage.getItem('sv3-overrides') || '{}');
    } catch(e) {
      _overrides = {};
    }

    const files = [
      'atlas','tree','humans','windows','constraints',
      'scenarios','method','graveyard','theses','meta','models','forecasts','ledger','countries'
    ];
    const results = await Promise.all(
      files.map(f => fetch(`data/${f}.json`).then(r => r.json()).catch(() => ({})))
    );
    const [atlas, tree, humans, windows, constraints,
           scenarios, method, graveyard, theses, meta, models, forecasts, ledger, countries] = results;

    (atlas.nodes          || []).forEach(_reg);
    (tree.nodes           || []).forEach(_reg);
    (humans.people        || []).forEach(_reg);
    (windows.windows      || []).forEach(_reg);
    (constraints.rows     || []).forEach(_reg);
    (scenarios.scenarios  || []).forEach(_reg);
    (graveyard.graveyard  || []).forEach(_reg);
    (theses.theses        || []).forEach(_reg);
    (countries.countries  || []).forEach(_reg);
    if (method && method.id) _reg(method);

    _raw = { atlas, tree, humans, windows, constraints, scenarios, method, graveyard, theses, meta, models, forecasts, ledger, countries };

    _fire();
  }

  _init();

  return {
    get, all, neighbors, trace, staleStatus, freshnessSummary, search, ready,
    get raw()       { return _raw; },
    get _overrides(){ return _overrides; },
    set _overrides(v){ _overrides = v; }
  };
})();
