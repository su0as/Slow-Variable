// js/ui.js — shared components: entity chip, staleness badge, dossier drawer, toast, Cmd+K palette

const UI = (function() {

  // ── Type → left-tick class ─────────────────────────────────────────────────
  const TICK = {
    choke:'t-choke', chip:'t-chip', min:'t-min', nrg:'t-nrg',
    data:'t-data', fin:'t-fin', demo:'t-demo',
    human:'t-human', treenode:'t-tree', window:'t-window',
    constraint:'t-constraint', thesis:'t-thesis',
    graveyard:'t-grave', scenario:'t-scenario'
  };

  // ── Entity chip ────────────────────────────────────────────────────────────
  function chip(id, opts) {
    const entity = Store.get(id);
    if (!entity) {
      return `<span class="e-chip e-chip--dead" title="unknown entity: ${id}">${id}</span>`;
    }
    const s   = Store.staleStatus(entity);
    const cls = [
      'e-chip',
      s === 'stale' ? 'e-chip--stale' : s === 'aging' ? 'e-chip--aging' : ''
    ].filter(Boolean).join(' ');
    const staleDot = s !== 'fresh'
      ? `<span class="e-stale-dot e-stale-dot--${s}" title="as of ${entity.as_of}"></span>`
      : '';
    const tick = TICK[entity.type] || 't-default';
    return `<span class="${cls}" data-id="${id}" tabindex="0" role="link" aria-label="Open ${entity.title}">` +
      `<span class="e-tick ${tick}"></span>` +
      `<span class="e-chip-label">${entity.title}</span>` +
      staleDot +
      `</span>`;
  }

  // ── Staleness banner ───────────────────────────────────────────────────────
  function stalenessBanner(entity) {
    const s = Store.staleStatus(entity);
    if (s === 'fresh') return '';
    const msg = s === 'stale'
      ? `LAST CONFIRMED ${entity.as_of} · PAST HALF-LIFE · VERIFY BEFORE TRUSTING`
      : `LAST CONFIRMED ${entity.as_of} · APPROACHING HALF-LIFE`;
    return `<div class="stale-banner stale-banner--${s}">${msg}</div>`;
  }

  // ── Dossier drawer ─────────────────────────────────────────────────────────
  function openDossier(id) {
    const entity = Store.get(id);
    if (!entity) { toast(`entity not found: ${id}`); return; }

    let el = document.getElementById('dossier');
    if (!el) {
      el = document.createElement('aside');
      el.id = 'dossier';
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('role', 'dialog');
      document.body.appendChild(el);
    }

    el.innerHTML = _dosHTML(entity);
    requestAnimationFrame(() => el.classList.add('dossier--open'));

    // update URL (preserve section path, set dossier param)
    const { path, params } = Router.current();
    Router.navigate(path, { ...params, open: id }, true);

    // events
    el.querySelector('.dos-close').addEventListener('click', closeDossier);
    el.querySelectorAll('.e-chip[data-id]').forEach(c => {
      c.addEventListener('click', () => openDossier(c.dataset.id));
      c.addEventListener('keydown', e => { if (e.key === 'Enter') openDossier(c.dataset.id); });
    });
    el.querySelector('[data-action="verify"]')?.addEventListener('click', () => {
      _markVerified(entity.id);
    });
    el.querySelector('[data-action="copy-link"]')?.addEventListener('click', () => {
      const url = location.origin + location.pathname + '#/' + Router.current().path + '?open=' + encodeURIComponent(id);
      navigator.clipboard.writeText(url).then(() => toast('LINK COPIED'));
    });
  }

  function closeDossier() {
    const el = document.getElementById('dossier');
    if (!el) return;
    el.classList.remove('dossier--open');
    const { path, params } = Router.current();
    const p = { ...params }; delete p.open;
    Router.navigate(path, p, true);
    setTimeout(() => { el.innerHTML = ''; }, 260);
  }

  function _dosHTML(entity) {
    const nbrs = Store.neighbors(entity.id);
    return `
<header class="dos-hdr">
  <span class="dos-type">${entity.type.toUpperCase()}</span>
  <span class="dos-id dim">${entity.id}</span>
  <button class="dos-close" aria-label="Close dossier">×</button>
</header>
<div class="dos-body">
  ${stalenessBanner(entity)}
  <h2 class="dos-title">${entity.title}</h2>
  <p class="dos-meta dim">as of ${entity.as_of || '—'} · cf: ${(entity.cf || '?').toUpperCase()} · hl: ${entity.half_life_days}d</p>
  <div class="dos-text">${_bodyHTML(entity)}</div>
  ${_connectionsHTML(nbrs)}
  <div class="dos-actions">
    <button class="btn-sm" data-action="verify">MARK VERIFIED</button>
    <button class="btn-sm" data-action="copy-link">COPY LINK</button>
  </div>
</div>`;
  }

  function _bodyHTML(entity) {
    const raw = entity.body || entity.mechanism || entity.statement || '';
    return raw.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  }

  function _connectionsHTML(nbrs) {
    const { out, in: ins } = nbrs;
    if (!out.length && !ins.length) return '';

    const REL = {
      enables:'ENABLES', requires:'REQUIRES', threatens:'THREATENS',
      gates:'GATES', capitalized_on:'CAPITALIZED ON', killed:'KILLED',
      bypasses:'BYPASSES', watches:'WATCHES', context:'CONTEXT'
    };

    const grouped = {};
    out.forEach(e => { (grouped[e.rel] = grouped[e.rel] || { out:[], in:[] }).out.push(e.to); });
    ins.forEach(e => { (grouped[e.rel] = grouped[e.rel] || { out:[], in:[] }).in.push(e.from); });

    let html = '<section class="dos-conns"><div class="sect-label">CONNECTIONS</div>';
    for (const [rel, edges] of Object.entries(grouped)) {
      const lbl = REL[rel] || rel.toUpperCase();
      if (edges.out.length) {
        html += `<div class="conn-row"><span class="conn-lbl">${lbl} →</span>`;
        html += edges.out.map(id => chip(id)).join('');
        html += '</div>';
      }
      if (edges.in.length) {
        html += `<div class="conn-row"><span class="conn-lbl">← ${lbl}</span>`;
        html += edges.in.map(id => chip(id)).join('');
        html += '</div>';
      }
    }
    html += '</section>';
    return html;
  }

  // ── Mark verified ──────────────────────────────────────────────────────────
  function _markVerified(id) {
    const today = new Date().toISOString().slice(0, 10);
    Store._overrides = Store._overrides || {};
    const ov = Store._overrides[id] || {};
    ov.as_of = today;
    ov.verified_dates = [...(ov.verified_dates || []), today];
    Store._overrides[id] = ov;
    try { localStorage.setItem('sv3-overrides', JSON.stringify(Store._overrides)); } catch(e) {}
    toast(`VERIFIED — ${id}`);
    openDossier(id);
  }

  // ── Cmd+K palette ──────────────────────────────────────────────────────────
  let _paletteOpen = false;

  const SECTION_CMDS = [
    { id:'cmd.atlas',    label:'ATLAS',     icon:'→', action: () => Router.navigate('atlas',{}) },
    { id:'cmd.tree',     label:'TREE',      icon:'→', action: () => Router.navigate('tree',{}) },
    { id:'cmd.humans',   label:'HUMANS',    icon:'→', action: () => Router.navigate('humans',{}) },
    { id:'cmd.trends',   label:'TRENDS',    icon:'→', action: () => Router.navigate('trends',{}) },
    { id:'cmd.constraints',label:'CONSTRAINTS',icon:'→',action:()=>Router.navigate('constraints',{})},
    { id:'cmd.forecasts',label:'FORECASTS', icon:'→', action: () => Router.navigate('forecasts',{}) },
    { id:'cmd.method',   label:'METHOD',    icon:'→', action: () => Router.navigate('method',{}) },
    { id:'cmd.patrol',   label:'PATROL',    icon:'⊕', action: () => Router.navigate('patrol',{}) },
    { id:'cmd.brief',    label:'BRIEF',     icon:'⊕', action: () => Router.navigate('brief',{}) },
    { id:'cmd.theses',   label:'THESES',    icon:'⊕', action: () => Router.navigate('theses',{}) },
    { id:'cmd.trace',    label:'TRACE',     icon:'⊕', action: openTraceMode },
    { id:'cmd.forecast', label:'ADD FORECAST',icon:'⊕',action:()=>{ Router.navigate('forecasts',{}); setTimeout(()=>document.getElementById('fc-add-btn')?.click(),100); } }
  ];

  function openPalette() {
    if (_paletteOpen) return;
    _paletteOpen = true;

    const overlay = document.createElement('div');
    overlay.id = 'palette-overlay';
    overlay.innerHTML = `
<div id="palette" role="dialog" aria-label="Command palette">
  <input id="palette-input" type="text" placeholder="Search entities or type a command…" autocomplete="off" spellcheck="false">
  <div id="palette-results"></div>
</div>`;
    document.body.appendChild(overlay);

    const input   = overlay.querySelector('#palette-input');
    const results = overlay.querySelector('#palette-results');
    let _sel = -1;
    let _items = [];

    function render(q) {
      _sel = -1;
      if (!q) {
        _items = SECTION_CMDS;
        results.innerHTML = `<div class="pal-group-lbl">SECTIONS &amp; COMMANDS</div>` +
          SECTION_CMDS.map((c,i) => `<div class="pal-item" data-idx="${i}">${c.icon} ${c.label}</div>`).join('');
        return;
      }
      const entityHits = Store.search(q);
      const cmdHits    = SECTION_CMDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
      _items = [...cmdHits, ...entityHits];

      let html = '';
      if (cmdHits.length) {
        html += `<div class="pal-group-lbl">COMMANDS</div>`;
        html += cmdHits.map((c,i) => `<div class="pal-item" data-idx="${i}">${c.icon} ${c.label}</div>`).join('');
      }
      const grouped = {};
      entityHits.forEach(e => { (grouped[e.type] = grouped[e.type] || []).push(e); });
      const offset = cmdHits.length;
      let idx = offset;
      for (const [type, items] of Object.entries(grouped)) {
        html += `<div class="pal-group-lbl">${type.toUpperCase()}</div>`;
        html += items.map(e => `<div class="pal-item" data-idx="${idx++}">${e.title}</div>`).join('');
      }
      results.innerHTML = html || '<div class="pal-empty">no results</div>';
    }

    function navigate() {
      const rows = results.querySelectorAll('.pal-item');
      rows.forEach((r,i) => r.classList.toggle('pal-item--sel', i === _sel));
    }

    function select(idx) {
      const item = _items[idx];
      if (!item) return;
      closePalette();
      if (item.action) item.action();
      else openDossier(item.id);
    }

    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      const rows = results.querySelectorAll('.pal-item').length;
      if (e.key === 'ArrowDown') { _sel = Math.min(_sel + 1, rows - 1); navigate(); e.preventDefault(); }
      if (e.key === 'ArrowUp')   { _sel = Math.max(_sel - 1, 0);        navigate(); e.preventDefault(); }
      if (e.key === 'Enter')  { select(_sel >= 0 ? _sel : 0); }
      if (e.key === 'Escape') { closePalette(); }
    });
    results.addEventListener('click', e => {
      const item = e.target.closest('.pal-item');
      if (item) select(+item.dataset.idx);
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });

    render('');
    input.focus();
  }

  function closePalette() {
    document.getElementById('palette-overlay')?.remove();
    _paletteOpen = false;
  }

  // ── Trace mode ─────────────────────────────────────────────────────────────
  let _tracePanel = null;

  function openTraceMode() {
    if (_tracePanel) return;
    _tracePanel = document.createElement('div');
    _tracePanel.id = 'trace-panel';
    _tracePanel.innerHTML = `
<div class="trace-hdr">
  <span class="sect-label">TRACE PATH</span>
  <button class="trace-close">×</button>
</div>
<div class="trace-pickers">
  <input id="trace-a" class="trace-input" placeholder="Entity A (id or name)">
  <span class="trace-arrow">→</span>
  <input id="trace-b" class="trace-input" placeholder="Entity B (id or name)">
  <button id="trace-run" class="btn-sm">TRACE</button>
</div>
<div id="trace-result"></div>`;
    document.body.appendChild(_tracePanel);

    _tracePanel.querySelector('.trace-close').addEventListener('click', () => {
      _tracePanel.remove(); _tracePanel = null;
    });

    function resolveId(val) {
      if (Store.get(val)) return val;
      const hits = Store.search(val);
      return hits[0]?.id || null;
    }

    _tracePanel.querySelector('#trace-run').addEventListener('click', () => {
      const a = resolveId(_tracePanel.querySelector('#trace-a').value.trim());
      const b = resolveId(_tracePanel.querySelector('#trace-b').value.trim());
      const res = document.getElementById('trace-result');
      if (!a || !b) { res.innerHTML = '<div class="trace-msg">enter valid entity ids or names</div>'; return; }
      const path = Store.trace(a, b);
      if (!path) {
        res.innerHTML = `<div class="trace-msg">No path within 6 hops. Either the connection doesn't exist or the graph is missing an edge — both are findings.</div>`;
        return;
      }
      res.innerHTML = `<div class="trace-path">${path.map((hop, i) => {
        const dirLabel = hop.dir && hop.rel ? `<span class="trace-edge">${hop.dir} ${hop.rel}</span>` : '';
        return (i > 0 ? dirLabel : '') + chip(hop.id);
      }).join('')}</div>`;
      res.querySelectorAll('.e-chip[data-id]').forEach(c => {
        c.addEventListener('click', () => openDossier(c.dataset.id));
      });
    });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  function toast(msg, dur) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--in'));
    setTimeout(() => {
      el.classList.remove('toast--in');
      setTimeout(() => el.remove(), 300);
    }, dur || 2500);
  }

  // ── Global keyboard handlers ───────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      _paletteOpen ? closePalette() : openPalette();
      return;
    }
    if (!inInput && e.key === '/') { e.preventDefault(); openPalette(); return; }
    if (e.key === 'Escape') {
      closeDossier();
      closePalette();
      return;
    }
    // Number keys 1-7: section shortcuts
    if (!inInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const sections = ['atlas','tree','humans','trends','constraints','forecasts','method'];
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < sections.length) Router.navigate(sections[idx], {});
    }
  });

  // Global chip click delegation (sections that don't handle it themselves)
  document.addEventListener('click', e => {
    const c = e.target.closest('.e-chip[data-id]');
    if (c && !e.defaultPrevented) openDossier(c.dataset.id);
  });

  return { chip, stalenessBanner, openDossier, closeDossier, openPalette, closePalette, openTraceMode, toast };
})();
