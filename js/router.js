// js/router.js — hash-based routing
// Routes: #/atlas, #/tree?node=tree.cuda&year=2012, #/humans?bet=human.musk, etc.
// Exposes: Router.navigate(path, params, replace), Router.on(handler), Router.current()

const Router = (function() {
  const handlers = [];
  let _cur = null;

  function parse(hash) {
    const s = (hash || '').replace(/^#\/?/, '');
    const qi = s.indexOf('?');
    const path   = qi === -1 ? s : s.slice(0, qi);
    const qs     = qi === -1 ? '' : s.slice(qi + 1);
    const params = {};
    if (qs) qs.split('&').forEach(pair => {
      const eq = pair.indexOf('=');
      if (eq === -1) return;
      const k = decodeURIComponent(pair.slice(0, eq));
      const v = decodeURIComponent(pair.slice(eq + 1));
      params[k] = v;
    });
    return { path: path || 'atlas', params };
  }

  function stringify(path, params) {
    const pairs = Object.entries(params || {})
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return `#/${path}${pairs.length ? '?' + pairs.join('&') : ''}`;
  }

  function navigate(path, params, replace) {
    const hash = stringify(path, params || {});
    if (replace) history.replaceState(null, '', hash);
    else         history.pushState(null, '', hash);
    _dispatch();
  }

  function _dispatch() {
    const { path, params } = parse(location.hash);
    const key = path + '|' + JSON.stringify(params);
    if (_cur?.key === key) return;
    _cur = { path, params, key };
    handlers.forEach(h => h(path, params));
  }

  function on(handler) { handlers.push(handler); }

  function current() { return _cur || parse(location.hash); }

  window.addEventListener('popstate', _dispatch);

  // Defer initial dispatch until Store is ready
  Store.ready(() => setTimeout(_dispatch, 0));

  return { navigate, on, current, parse, stringify };
})();
