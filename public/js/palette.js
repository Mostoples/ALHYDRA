/* ─────────────────────────────────────────
   palette.js — Global command palette (Ctrl/⌘-K),
   keyboard shortcuts (? overlay, g-d/g-m… nav),
   and favorites (star views/encyclopedia entries).
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.palette = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    ph: { en: 'Search views, actions, encyclopedia…', id: 'Cari halaman, aksi, ensiklopedia…' },
    noRes: { en: 'No results', id: 'Tidak ada hasil' },
    views: { en: 'Views', id: 'Halaman' },
    actions: { en: 'Actions', id: 'Aksi' },
    enc: { en: 'Encyclopedia', id: 'Ensiklopedia' },
    favs: { en: 'Favorites', id: 'Favorit' },
    scTitle: { en: 'Keyboard shortcuts', id: 'Pintasan keyboard' },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  const VIEW_LIST = [
    ['dashboard', 'fa-gauge-high'], ['monitoring', 'fa-chart-line'], ['control', 'fa-sliders'],
    ['algae', 'fa-bacterium'], ['analytics', 'fa-chart-bar'], ['energy', 'fa-bolt'],
    ['impact', 'fa-earth-asia'], ['ai', 'fa-brain'], ['ops', 'fa-list-check'], ['alerts', 'fa-bell'],
    ['encyclopedia', 'fa-book-open'], ['profile', 'fa-user'], ['settings', 'fa-gear'], ['about', 'fa-circle-info'],
  ];
  const ACTIONS = [
    { id: 'demo', icon: 'fa-flask', label: { en: 'Toggle Demo Mode', id: 'Alihkan Mode Demo' }, run: () => ALHYDRA.dashboard?.toggleSimulate?.() },
    { id: 'theme', icon: 'fa-moon', label: { en: 'Toggle dark / light', id: 'Ganti gelap / terang' }, run: () => document.getElementById('theme-toggle')?.click() },
    { id: 'lang', icon: 'fa-language', label: { en: 'Switch language', id: 'Ganti bahasa' }, run: () => ALHYDRA.i18n?.toggle?.() },
    { id: 'tour', icon: 'fa-route', label: { en: 'Take the app tour', id: 'Ikuti tur aplikasi' }, run: () => ALHYDRA.onboarding?.startTour?.() },
    { id: 'help', icon: 'fa-circle-question', label: { en: 'Open Quick Help', id: 'Buka Bantuan Cepat' }, run: () => ALHYDRA.help?.open?.() },
    { id: 'chat', icon: 'fa-robot', label: { en: 'Open AI assistant', id: 'Buka asisten AI' }, run: () => ALHYDRA.chat?.togglePanel?.() },
    { id: 'report', icon: 'fa-file-pdf', label: { en: 'Print system report', id: 'Cetak laporan sistem' }, run: () => ALHYDRA.report?.print?.() },
    { id: 'exportJson', icon: 'fa-file-arrow-down', label: { en: 'Export my data (JSON)', id: 'Ekspor data (JSON)' }, run: () => ALHYDRA.account?.exportJson?.() },
    { id: 'feedback', icon: 'fa-comment-dots', label: { en: 'Send feedback', id: 'Kirim masukan' }, run: () => ALHYDRA.help?.sendFeedback?.() },
  ];

  let open = false, idx = 0, results = [];

  function favs() { try { return JSON.parse(localStorage.getItem('alhydra_favs')) || []; } catch (e) { return []; } }
  function setFavs(a) { try { localStorage.setItem('alhydra_favs', JSON.stringify(a.slice(0, 30))); } catch (e) {} }
  function isFav(key) { return favs().some(f => f.key === key); }
  function toggleFav(key, label, view) {
    let a = favs();
    if (a.some(f => f.key === key)) a = a.filter(f => f.key !== key);
    else a.unshift({ key, label, view });
    setFavs(a);
    ALHYDRA.app.toast(isFav(key) ? (lang() === 'id' ? 'Ditambah ke favorit' : 'Added to favorites') : (lang() === 'id' ? 'Dihapus dari favorit' : 'Removed from favorites'), 'info', 1200);
    document.dispatchEvent(new CustomEvent('alhydra:favs'));
  }

  function ensure() {
    let m = document.getElementById('cmdk');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'cmdk';
    m.innerHTML = `<div class="cmdk-box">
      <div class="cmdk-input-row"><i class="fa-solid fa-magnifying-glass"></i><input id="cmdk-input" type="text" placeholder="${L('ph')}" /><kbd>ESC</kbd></div>
      <div id="cmdk-results" class="cmdk-results"></div>
    </div>`;
    m.addEventListener('click', e => { if (e.target === m) hide(); });
    document.body.appendChild(m);
    return m;
  }

  function buildIndex() {
    const items = [];
    const labels = { dashboard: 'Dashboard', monitoring: 'Monitoring', control: 'Control Panel', algae: 'Microalgae', analytics: 'Analytics', energy: 'Energy Optimization', impact: 'Environmental Impact', ai: 'AI Insights', ops: 'Operations', alerts: 'Alert Center', encyclopedia: 'Encyclopedia', profile: 'My Profile', settings: 'Settings', about: 'About' };
    favs().forEach(f => items.push({ type: 'fav', icon: 'fa-star', label: f.label, run: () => ALHYDRA.app.navigateTo(f.view) }));
    VIEW_LIST.forEach(([v, ic]) => items.push({ type: 'view', icon: ic, label: labels[v] || v, run: () => ALHYDRA.app.navigateTo(v) }));
    if (ALHYDRA.audit?.isAdmin?.()) items.push({ type: 'view', icon: 'fa-shield-halved', label: 'Admin Console', run: () => ALHYDRA.app.navigateTo('admin') });
    ACTIONS.forEach(a => items.push({ type: 'action', icon: a.icon, label: a.label[lang()] || a.label.en, run: a.run }));
    return items;
  }

  function show() {
    open = true; idx = 0;
    ensure().classList.add('open');
    const inp = document.getElementById('cmdk-input');
    if (inp) { inp.value = ''; inp.focus(); }
    update('');
  }
  function hide() { open = false; document.getElementById('cmdk')?.classList.remove('open'); }

  function update(q) {
    q = (q || '').toLowerCase().trim();
    const all = buildIndex();
    results = q ? all.filter(i => i.label.toLowerCase().includes(q)) : all;
    idx = 0;
    renderResults();
  }
  function renderResults() {
    const host = document.getElementById('cmdk-results');
    if (!host) return;
    if (!results.length) { host.innerHTML = `<div class="cmdk-empty">${L('noRes')}</div>`; return; }
    host.innerHTML = results.map((r, i) => `
      <button class="cmdk-item ${i === idx ? 'sel' : ''}" data-i="${i}" onclick="ALHYDRA.palette.runIdx(${i})">
        <i class="fa-solid ${r.icon}"></i> <span>${r.label}</span> <em>${r.type}</em>
      </button>`).join('');
  }
  function runIdx(i) { const r = results[i]; if (!r) return; hide(); setTimeout(() => r.run(), 60); }

  function init() {
    document.addEventListener('keydown', e => {
      // Cmd/Ctrl-K → palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open ? hide() : show(); return; }
      if (open) {
        if (e.key === 'Escape') { hide(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, results.length - 1); renderResults(); scrollSel(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); renderResults(); scrollSel(); }
        else if (e.key === 'Enter') { e.preventDefault(); runIdx(idx); }
        return;
      }
      // Don't fire shortcuts while typing
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      // ? → shortcuts overlay
      if (e.key === '?') { e.preventDefault(); toggleShortcuts(); return; }
      // g then letter → navigation
      if (e.key === 'g') { _g = true; setTimeout(() => _g = false, 800); return; }
      if (_g) {
        const map = { d: 'dashboard', m: 'monitoring', a: 'analytics', e: 'energy', i: 'impact', o: 'ops', k: 'encyclopedia', p: 'profile', s: 'settings' };
        if (map[e.key]) { ALHYDRA.app.navigateTo(map[e.key]); _g = false; }
      }
    });
    const onInput = () => { const inp = document.getElementById('cmdk-input'); if (inp) update(inp.value); };
    document.addEventListener('input', e => { if (e.target.id === 'cmdk-input') onInput(); });
    window.addEventListener('alhydra:lang', () => { if (open) update(document.getElementById('cmdk-input')?.value || ''); });
  }
  let _g = false;
  function scrollSel() { document.querySelector('.cmdk-item.sel')?.scrollIntoView({ block: 'nearest' }); }

  // ── Shortcuts overlay ──
  function toggleShortcuts() {
    let m = document.getElementById('sc-overlay');
    if (m && m.classList.contains('open')) { m.classList.remove('open'); return; }
    if (!m) { m = document.createElement('div'); m.id = 'sc-overlay'; m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }); document.body.appendChild(m); }
    const rows = [
      ['Ctrl / ⌘ + K', lang() === 'id' ? 'Buka command palette' : 'Open command palette'],
      ['?', lang() === 'id' ? 'Tampilkan pintasan ini' : 'Show this help'],
      ['g lalu d', lang() === 'id' ? 'Ke Dashboard' : 'Go to Dashboard'],
      ['g lalu m', lang() === 'id' ? 'Ke Monitoring' : 'Go to Monitoring'],
      ['g lalu a', lang() === 'id' ? 'Ke Analytics' : 'Go to Analytics'],
      ['g lalu o', lang() === 'id' ? 'Ke Operations' : 'Go to Operations'],
      ['g lalu k', lang() === 'id' ? 'Ke Ensiklopedia' : 'Go to Encyclopedia'],
      ['g lalu p', lang() === 'id' ? 'Ke Profil' : 'Go to Profile'],
      ['Esc', lang() === 'id' ? 'Tutup dialog' : 'Close dialogs'],
    ];
    m.innerHTML = `<div class="sc-box"><h3><i class="fa-solid fa-keyboard"></i> ${L('scTitle')}</h3>
      <div class="sc-list">${rows.map(([k, d]) => `<div class="sc-row"><kbd>${k}</kbd><span>${d}</span></div>`).join('')}</div>
      <button class="btn-secondary sm" onclick="document.getElementById('sc-overlay').classList.remove('open')">Esc</button></div>`;
    m.classList.add('open');
  }

  return { init, show, hide, runIdx, toggleFav, isFav, toggleShortcuts };
})();
