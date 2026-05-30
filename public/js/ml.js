/* ─────────────────────────────────────────
   ml.js — ALHYDRA on-device Machine Learning
   · Forecasting   (least-squares linear trend)
   · Anomaly det.  (z-score outliers)
   · Health model  (multivariate linear regression, gradient descent)
   · XAI           (linear-SHAP additive feature attribution)
   Pure vanilla JS — no build tools, runs fully in the browser.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.ml = (() => {

  // Environmental features used by the health model + forecast.
  const FEATURES = [
    { key: 'ph',           name: 'pH',          unit: '',     lo: 6.5, hi: 8.5,  dec: 2, icon: 'fa-flask-vial',      color: '#10B981' },
    { key: 'light',        name: 'Light',       unit: ' lx',  lo: 500, hi: 5000, dec: 0, icon: 'fa-sun',             color: '#F59E0B' },
    { key: 'turbidity',    name: 'Turbidity',   unit: ' NTU', lo: 0,   hi: 20,   dec: 1, icon: 'fa-droplet',         color: '#06B6D4' },
    { key: 'temp_ambient', name: 'Air Temp',    unit: '°C',   lo: 22,  hi: 32,   dec: 1, icon: 'fa-temperature-half',color: '#EF4444' },
    { key: 'humidity',     name: 'Humidity',    unit: '%',    lo: 50,  hi: 80,   dec: 1, icon: 'fa-wind',            color: '#8B5CF6' },
    { key: 'temp_water',   name: 'Water Temp',  unit: '°C',   lo: 18,  hi: 28,   dec: 1, icon: 'fa-water',           color: '#06B6D4' },
  ];
  // Extra forecast-only tiles (energy).
  const ENERGY = [
    { key: 'current_gen',  name: 'Gen. Current',  unit: ' A', dec: 2, icon: 'fa-solar-panel', color: '#10B981' },
    { key: 'current_cons', name: 'Cons. Current', unit: ' A', dec: 2, icon: 'fa-bolt',        color: '#F59E0B' },
  ];

  let forecastChart = null;
  let model = null;          // { w, b, mean, std, r2 }
  let lastRows = [];         // chronological feature rows
  let dataSource = '—';

  // ── Math helpers ───────────────────────
  const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const std  = (a, m) => Math.sqrt(mean(a.map(x => (x - m) ** 2))) || 1;

  function goodness(v, lo, hi) {
    if (v == null || isNaN(v)) return 0.5;
    if (v >= lo && v <= hi) return 1;
    const range = (hi - lo) || 1;
    const dist = v < lo ? (lo - v) : (v - hi);
    return Math.max(0, 1 - dist / range);
  }

  // Health score (0–100) label for a reading.
  function healthScore(row) {
    const g = FEATURES.map(f => goodness(row[f.key], f.lo, f.hi));
    return mean(g) * 100;
  }

  // Least-squares slope/intercept for y over t = 0..n-1.
  function linTrend(ys) {
    const n = ys.length;
    if (n < 2) return { slope: 0, intercept: ys[0] || 0 };
    const tMean = (n - 1) / 2, yMean = mean(ys);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (i - tMean) * (ys[i] - yMean); den += (i - tMean) ** 2; }
    const slope = den ? num / den : 0;
    return { slope, intercept: yMean - slope * tMean };
  }

  // Multivariate linear regression via gradient descent (X already standardized).
  function trainLinReg(X, y, { lr = 0.1, epochs = 800 } = {}) {
    const n = X.length, d = X[0].length;
    let w = new Array(d).fill(0), b = 0;
    for (let e = 0; e < epochs; e++) {
      const gw = new Array(d).fill(0); let gb = 0;
      for (let i = 0; i < n; i++) {
        let pred = b;
        for (let j = 0; j < d; j++) pred += w[j] * X[i][j];
        const err = pred - y[i];
        gb += err;
        for (let j = 0; j < d; j++) gw[j] += err * X[i][j];
      }
      b -= lr * gb / n;
      for (let j = 0; j < d; j++) w[j] -= lr * gw[j] / n;
    }
    return { w, b };
  }

  // ── Data ───────────────────────────────
  async function loadHistory() {
    try {
      const snap = await window.db.collection('sensor_history')
        .orderBy('timestamp', 'desc').limit(200).get();
      const rows = [];
      snap.forEach(doc => {
        const d = doc.data();
        const row = {};
        let hasAny = false;
        [...FEATURES, ...ENERGY].forEach(f => {
          const v = parseFloat(d[f.key]);
          if (!isNaN(v)) { row[f.key] = v; hasAny = true; }
        });
        if (hasAny) rows.push(row);
      });
      rows.reverse(); // chronological
      if (rows.length >= 12) { dataSource = `Firestore (${rows.length} rows)`; return rows; }
    } catch (e) {
      console.warn('[ml] history load failed:', e);
    }
    dataSource = 'Synthetic (demo)';
    return synth(60);
  }

  // Plausible synthetic dataset with drift + occasional excursions.
  function synth(n) {
    const base = { ph: 7.2, light: 1800, turbidity: 12, temp_ambient: 28, humidity: 65, temp_water: 24, current_gen: 3.2, current_cons: 2.5 };
    const amp  = { ph: 0.4, light: 600, turbidity: 6, temp_ambient: 3, humidity: 10, temp_water: 2.5, current_gen: 1.2, current_cons: 0.8 };
    const rows = [];
    for (let i = 0; i < n; i++) {
      const row = {};
      [...FEATURES, ...ENERGY].forEach(f => {
        const wave = Math.sin((i / n) * Math.PI * 3 + base[f.key]);
        let v = base[f.key] + wave * amp[f.key] * 0.5 + (Math.random() - 0.5) * amp[f.key];
        if (i > n - 6 && (f.key === 'turbidity' || f.key === 'temp_water')) v += amp[f.key] * 2; // late excursion
        row[f.key] = Math.max(0, v);
      });
      rows.push(row);
    }
    return rows;
  }

  function currentReading() {
    // Prefer the latest live snapshot rendered on the dashboard if present.
    const live = {};
    let ok = false;
    [...FEATURES, ...ENERGY].forEach(f => {
      const el = document.getElementById('val-' + f.key);
      if (el) { const v = parseFloat(el.textContent); if (!isNaN(v)) { live[f.key] = v; ok = true; } }
    });
    if (ok && FEATURES.every(f => live[f.key] != null)) return live;
    return lastRows[lastRows.length - 1] || {};
  }

  // ── Train + predict ────────────────────
  function buildModel(rows) {
    const cols = FEATURES.map(f => rows.map(r => r[f.key] ?? f.lo));
    const m = cols.map(c => mean(c));
    const s = cols.map((c, i) => std(c, m[i]));
    const X = rows.map(r => FEATURES.map((f, i) => ((r[f.key] ?? m[i]) - m[i]) / s[i]));
    const y = rows.map(r => healthScore(r));

    const { w, b } = trainLinReg(X, y);

    // R²
    const yMean = mean(y);
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < y.length; i++) {
      let pred = b; for (let j = 0; j < w.length; j++) pred += w[j] * X[i][j];
      ssRes += (y[i] - pred) ** 2; ssTot += (y[i] - yMean) ** 2;
    }
    const r2 = ssTot ? Math.max(0, 1 - ssRes / ssTot) : 0;
    return { w, b, mean: m, std: s, r2 };
  }

  function explain(row) {
    const contribs = FEATURES.map((f, i) => {
      const z = (((row[f.key] ?? model.mean[i]) - model.mean[i]) / model.std[i]);
      return { f, contribution: model.w[i] * z, z, value: row[f.key] };
    });
    let pred = model.b + contribs.reduce((s, c) => s + c.contribution, 0);
    pred = Math.max(0, Math.min(100, pred));
    return { contribs, pred };
  }

  // ── Anomaly detection (z-score) ────────
  function detectAnomalies(rows, row) {
    const out = [];
    FEATURES.forEach((f, i) => {
      const col = rows.map(r => r[f.key]).filter(v => v != null && !isNaN(v));
      if (col.length < 4) return;
      const m = mean(col), sd = std(col, m);
      const v = row[f.key];
      if (v == null) return;
      const z = Math.abs((v - m) / sd);
      const outOfRange = v < f.lo || v > f.hi;
      if (z > 2 || outOfRange) {
        out.push({
          f, value: v, z,
          sev: (z > 3 || (outOfRange && z > 2)) ? 'high' : (z > 2 || outOfRange ? 'med' : 'low'),
          msg: outOfRange ? 'outside optimal range' : 'statistical outlier',
        });
      }
    });
    return out.sort((a, b) => b.z - a.z);
  }

  // ── Forecast ───────────────────────────
  function forecast() {
    return [...FEATURES, ...ENERGY].map(f => {
      const series = lastRows.map(r => r[f.key]).filter(v => v != null && !isNaN(v));
      const { slope, intercept } = linTrend(series);
      const next = slope * series.length + intercept;
      const cur = series[series.length - 1] ?? next;
      const sd = std(series, mean(series));
      const delta = next - cur;
      const dir = Math.abs(delta) < sd * 0.15 ? 'flat' : (delta > 0 ? 'up' : 'down');
      return { f, next: Math.max(0, next), cur, delta, dir };
    });
  }

  // ── Rendering ──────────────────────────
  function renderHealth(pred) {
    const el = document.getElementById('ai-health-score');
    if (el) el.textContent = Math.round(pred);
    const C = 2 * Math.PI * 62; // circumference
    const fill = document.getElementById('ai-gauge-fill');
    if (fill) {
      fill.setAttribute('stroke-dasharray', C.toFixed(1));
      fill.setAttribute('stroke-dashoffset', (C * (1 - pred / 100)).toFixed(1));
      fill.setAttribute('stroke', pred >= 75 ? '#10B981' : pred >= 50 ? '#F59E0B' : '#EF4444');
    }
    const status = document.getElementById('ai-health-status');
    const note   = document.getElementById('ai-health-note');
    let label, cls, txt;
    if (pred >= 75) { label = 'Optimal'; cls = 'good'; txt = 'All parameters are within healthy bounds. The cultivation environment is well balanced.'; }
    else if (pred >= 50) { label = 'Caution'; cls = 'warning'; txt = 'Some parameters are drifting from optimal. Review the feature attribution below to see the main drivers.'; }
    else { label = 'Critical'; cls = 'danger'; txt = 'Multiple parameters are out of range. Immediate corrective action is recommended.'; }
    if (status) { status.textContent = label; status.className = 'ai-health-status ' + cls; }
    if (note) note.textContent = txt;
  }

  function renderForecast(fc) {
    const grid = document.getElementById('ai-pred-grid');
    if (grid) {
      grid.innerHTML = fc.map(p => {
        const arrow = p.dir === 'up' ? 'fa-arrow-trend-up' : p.dir === 'down' ? 'fa-arrow-trend-down' : 'fa-arrows-left-right';
        const sign = p.delta >= 0 ? '+' : '';
        return `
          <div class="ai-pred">
            <div class="ai-pred-label"><i class="fa-solid ${p.f.icon}" style="color:${p.f.color}"></i> ${p.f.name}</div>
            <div class="ai-pred-val">${p.next.toFixed(p.f.dec)}${p.f.unit}</div>
            <div class="ai-pred-trend ${p.dir}"><i class="fa-solid ${arrow}"></i> ${sign}${p.delta.toFixed(p.f.dec)}${p.f.unit}</div>
          </div>`;
      }).join('');
    }
    renderForecastChart();
  }

  function renderForecastChart() {
    const canvas = document.getElementById('ai-forecast-chart');
    if (!canvas) return;
    // Health score timeline + 5-step projection.
    const hist = lastRows.map(r => healthScore(r));
    const tail = hist.slice(-24);
    const { slope, intercept } = linTrend(tail);
    const proj = [];
    for (let k = 1; k <= 5; k++) proj.push(Math.max(0, Math.min(100, slope * (tail.length - 1 + k) + intercept)));

    const labels = tail.map((_, i) => `t-${tail.length - i - 1}`).concat(['+1', '+2', '+3', '+4', '+5']);
    const histData = tail.concat(new Array(5).fill(null));
    const projData = new Array(tail.length - 1).fill(null).concat([tail[tail.length - 1]], proj);

    if (forecastChart) forecastChart.destroy();
    forecastChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Health (history)', data: histData, borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.12)', borderWidth: 2, pointRadius: 0, fill: true, tension: 0.35 },
          { label: 'Health (forecast)', data: projData, borderColor: '#8B5CF6', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: false, tension: 0.35 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } }, tooltip: { mode: 'index', intersect: false } },
        scales: { x: { display: false }, y: { min: 0, max: 100, ticks: { maxTicksLimit: 5, callback: v => v } } },
      },
    });
  }

  function renderAnomalies(anoms) {
    const list = document.getElementById('ai-anom-list');
    if (!list) return;
    if (!anoms.length) {
      list.innerHTML = `<div class="ai-anom sev-low"><span class="a-ic"><i class="fa-solid fa-circle-check" style="color:var(--green)"></i></span><span class="a-name">No anomalies detected</span><span class="a-detail">all z &lt; 2</span></div>`;
      return;
    }
    list.innerHTML = anoms.map(a => `
      <div class="ai-anom sev-${a.sev}">
        <span class="a-ic"><i class="fa-solid ${a.f.icon}" style="color:${a.f.color}"></i></span>
        <span class="a-name">${a.f.name} <span style="color:var(--text-muted);font-weight:400">— ${a.msg}</span></span>
        <span class="a-detail">${a.value.toFixed(a.f.dec)}${a.f.unit} · z=${a.z.toFixed(1)}</span>
      </div>`).join('');
  }

  function renderXAI(contribs, pred) {
    const sorted = [...contribs].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    const maxAbs = Math.max(...sorted.map(c => Math.abs(c.contribution)), 0.001);
    const bars = document.getElementById('ai-xai-bars');
    if (bars) {
      bars.innerHTML = sorted.map(c => {
        const pct = (Math.abs(c.contribution) / maxAbs) * 100;
        const pos = c.contribution >= 0;
        const sign = pos ? '+' : '';
        return `
          <div class="xm-bar-row">
            <span class="xm-bar-label"><i class="fa-solid ${c.f.icon}" style="color:${c.f.color}"></i> ${c.f.name}</span>
            <div class="xm-bar-track"><div class="xm-bar-fill ${pos ? 'pos' : 'neg'}" style="width:${pct.toFixed(0)}%"></div></div>
            <span class="xm-bar-val">${sign}${c.contribution.toFixed(1)}</span>
          </div>`;
      }).join('');
    }
    const setTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
    setTxt('ai-r2', model.r2.toFixed(3));
    setTxt('ai-rows', lastRows.length);
    setTxt('ai-source', dataSource);
    setTxt('ai-updated', new Date().toLocaleTimeString());
    // Human-readable formula with learned coefficients (standardized β).
    const formula = 'ŷ = ' + model.b.toFixed(0) + ' ' +
      FEATURES.map((f, i) => `${model.w[i] >= 0 ? '+' : '−'} ${Math.abs(model.w[i]).toFixed(1)}·${f.key}`).join(' ');
    setTxt('ai-xai-formula', formula);
  }

  function setStatus(text, busy) {
    const t = document.getElementById('ai-train-text');
    if (t) t.textContent = text;
    const dot = document.querySelector('#ai-train-status .ai-dot');
    if (dot) dot.style.background = busy ? 'var(--amber)' : 'var(--green)';
  }

  // ── Orchestration ──────────────────────
  let running = false;
  async function run() {
    if (running) return;
    running = true;
    setStatus('Training…', true);
    try {
      lastRows = await loadHistory();
      model = buildModel(lastRows);

      const cur = currentReading();
      const { contribs, pred } = explain(cur);

      renderHealth(pred);
      renderForecast(forecast());
      renderAnomalies(detectAnomalies(lastRows, cur));
      renderXAI(contribs, pred);

      setStatus(`Trained · R²=${model.r2.toFixed(2)}`, false);
    } catch (e) {
      console.error('[ml] run failed:', e);
      setStatus('Error — see console', false);
    } finally {
      running = false;
    }
  }

  let loaded = false;
  function onEnter() { if (!loaded) { loaded = true; run(); } }
  function retrain() { loaded = true; run(); }
  function init() { /* charts/data built lazily on first view */ }

  return { init, onEnter, retrain };
})();
