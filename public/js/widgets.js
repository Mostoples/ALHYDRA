/* ─────────────────────────────────────────
   widgets.js — Dashboard hero (greeting + live KPI chips)
   Reads from existing module getters only (no new data source).
   Bilingual via ALHYDRA.i18n; re-render-safe on language change.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.widgets = (() => {
  let clockTimer = null;
  const prevVals = {};

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    morning:   { en: 'Good morning', id: 'Selamat pagi' },
    afternoon: { en: 'Good afternoon', id: 'Selamat siang' },
    evening:   { en: 'Good evening', id: 'Selamat sore' },
    night:     { en: 'Good night', id: 'Selamat malam' },
    sub:       { en: 'Here is your live system snapshot.', id: 'Berikut ringkasan sistem Anda secara langsung.' },
    health:    { en: 'System Health', id: 'Kesehatan Sistem' },
    energy:    { en: 'Energy Balance', id: 'Keseimbangan Energi' },
    battery:   { en: 'Battery', id: 'Baterai' },
    cultures:  { en: 'Algae Cultures', id: 'Kultur Alga' },
    water:     { en: 'Water Level', id: 'Level Air' },
    na:        { en: 'n/a', id: 'n/a' },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  function greeting() {
    const h = new Date().getHours();
    if (h < 11) return L('morning');
    if (h < 15) return L('afternoon');
    if (h < 19) return L('evening');
    return L('night');
  }

  function num(id) { const el = document.getElementById('val-' + id); if (!el) return null; const n = parseFloat(el.textContent); return isNaN(n) ? null : n; }

  // Health score: prefer ml gauge if rendered, else compute from thresholds.
  function healthScore() {
    const g = document.getElementById('ai-health-score');
    if (g && g.textContent && g.textContent !== '—') { const n = parseFloat(g.textContent); if (!isNaN(n)) return Math.round(n); }
    const thr = window.ALHYDRA_THRESHOLDS || {};
    const checks = [];
    const within = (v, lo, hi) => { if (v == null) return null; if (v < lo || v > hi) return 0; return 1; };
    checks.push(within(num('ph'), thr.ph?.min ?? 6, thr.ph?.max ?? 9));
    checks.push(within(num('temp_water'), thr.temp_water?.min ?? 16, thr.temp_water?.max ?? 32));
    checks.push(within(num('temp_ambient'), thr.temp_ambient?.min ?? 18, thr.temp_ambient?.max ?? 35));
    checks.push(within(num('humidity'), thr.humidity?.min ?? 40, thr.humidity?.max ?? 90));
    const t = num('turbidity'); checks.push(t == null ? null : (t <= (thr.turbidity?.max ?? 50) ? 1 : 0));
    const wl = num('water_level'); checks.push(wl == null ? null : (wl >= 30 ? 1 : 0));
    const valid = checks.filter(c => c != null);
    if (!valid.length) return null;
    return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100);
  }

  function build() {
    const host = document.getElementById('dash-hero');
    if (!host) return;
    const name = (window.auth?.currentUser?.displayName || window.auth?.currentUser?.email?.split('@')[0] || 'Operator');
    host.innerHTML = `
      <div class="hero-top">
        <div>
          <div class="hero-greeting"><span class="hg-wave">👋</span> <span id="hero-greet">${greeting()}</span>, ${name}</div>
          <div class="hero-sub">${L('sub')}</div>
        </div>
        <div class="hero-clock">
          <div class="hc-time" id="hero-time">--:--:--</div>
          <div class="hc-date" id="hero-date"></div>
        </div>
      </div>
      <div class="hero-kpis" id="hero-kpis"></div>
      <svg class="hero-wave" viewBox="0 0 240 120" fill="none" aria-hidden="true">
        <path d="M0 80 Q40 50 80 70 T160 70 T240 60 V120 H0 Z" fill="currentColor"/>
        <path d="M0 95 Q40 70 80 85 T160 85 T240 80 V120 H0 Z" fill="currentColor" opacity="0.6"/>
      </svg>`;
    tick();
    refresh();
  }

  function tick() {
    const t = document.getElementById('hero-time');
    const d = document.getElementById('hero-date');
    if (!t) return;
    const now = new Date();
    t.textContent = now.toLocaleTimeString(lang() === 'id' ? 'id-ID' : 'en-US', { hour12: false });
    if (d) d.textContent = now.toLocaleDateString(lang() === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
    const gr = document.getElementById('hero-greet'); if (gr) gr.textContent = greeting();
  }

  function chip(key, view, color, icon, val, label) {
    const flash = (prevVals[key] !== undefined && prevVals[key] !== val) ? ' kpi-flash' : '';
    prevVals[key] = val;
    return `
      <div class="kpi-chip" style="--c:${color}" onclick="ALHYDRA.app.navigateTo('${view}')" title="${label}">
        <div class="kpi-ic"><i class="fa-solid ${icon}"></i></div>
        <div class="kpi-body">
          <div class="kpi-val${flash}">${val}</div>
          <div class="kpi-label">${label}</div>
        </div>
      </div>`;
  }

  function refresh() {
    const grid = document.getElementById('hero-kpis');
    if (!grid) return;
    const chips = [];

    const hs = healthScore();
    chips.push(chip('health', 'ai', '#10B981', 'fa-heart-pulse', hs == null ? L('na') : hs + '%', L('health')));

    const e = ALHYDRA.energy?.getState?.();
    if (e) {
      chips.push(chip('energy', 'energy', '#F59E0B', 'fa-bolt', (e.balanceW >= 0 ? '+' : '') + e.balanceW + ' W', L('energy')));
      chips.push(chip('battery', 'energy', '#3B82F6', 'fa-battery-three-quarters', e.soc + '%', L('battery')));
    } else {
      const g = num('current_gen'), c = num('current_cons');
      if (g != null && c != null) chips.push(chip('energy', 'energy', '#F59E0B', 'fa-bolt', Math.round((g - c) * 220) + ' W', L('energy')));
    }

    const b = ALHYDRA.algae?.getBiomassEstimate?.();
    if (b) chips.push(chip('cultures', 'algae', '#06B6D4', 'fa-bacterium', b.byCulture.length + (b.kg > 0 ? ` · ${b.kg.toFixed(1)}kg` : ''), L('cultures')));

    const wl = num('water_level');
    if (wl != null) chips.push(chip('water', 'dashboard', '#3B82F6', 'fa-gauge', Math.round(wl) + '%', L('water')));

    grid.innerHTML = chips.join('');
  }

  function init() {
    build();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(tick, 1000);
    window.addEventListener('alhydra:lang', build);
  }

  return { init, refresh, build };
})();
