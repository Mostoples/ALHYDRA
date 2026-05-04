/* ─────────────────────────────────────────
   analytics.js — Historical data view
   Date range picker + Chart.js charts
───────────────────────────────────────── */
'use strict';

ALHYDRA.analytics = (() => {
  let charts = {};
  let initialized = false;

  // ── Init charts (once) ─────────────────
  function initCharts() {
    if (initialized) return;
    initialized = true;

    const mkLine = (id, datasets, yUnit = '') => {
      const canvas = document.getElementById(id);
      if (!canvas) return null;
      return new Chart(canvas, {
        type: 'line',
        data: { labels: [], datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 600 },
          plugins: {
            legend: { display: datasets.length > 1, labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: {
              display: true,
              ticks: { maxTicksLimit: 8, color: '#4A5568', maxRotation: 30, minRotation: 0, font: { size: 10 } },
              grid: { display: false }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#94A3B8', maxTicksLimit: 5, callback: v => v + yUnit }
            }
          }
        }
      });
    };

    charts.ph = mkLine('an-chart-ph', [{
      label: 'pH', data: [],
      borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)',
      borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4
    }]);

    charts.turbidity = mkLine('an-chart-turbidity', [{
      label: 'Turbidity (NTU)', data: [],
      borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.08)',
      borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4
    }], ' NTU');

    charts.temp = mkLine('an-chart-temp', [
      {
        label: 'Ambient (°C)', data: [],
        borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 2, pointRadius: 2, fill: false, tension: 0.4
      },
      {
        label: 'Water (°C)', data: [],
        borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.08)',
        borderWidth: 2, pointRadius: 2, fill: false, tension: 0.4
      }
    ], '°C');

    charts.energy = mkLine('an-chart-energy', [
      {
        label: 'Generated (W)', data: [],
        borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4
      },
      {
        label: 'Consumed (W)', data: [],
        borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.08)',
        borderWidth: 2, pointRadius: 2, fill: true, tension: 0.4
      }
    ], ' W');
  }

  // ── Set default date range (last 1h) ──
  function setDefaultDates() {
    const now    = new Date();
    const before = new Date(now.getTime() - 60*60*1000);
    document.getElementById('an-date-to').value   = toInputDate(now);
    document.getElementById('an-date-from').value = toInputDate(before);
  }

  function toInputDate(d) {
    // datetime-local format: YYYY-MM-DD
    return d.toISOString().slice(0, 10);
  }

  // ── Quick range shortcuts ──────────────
  function quickRange(hours) {
    document.querySelectorAll('.qr-btn').forEach(b => b.classList.remove('active'));
    event?.target?.classList.add('active');
    const now    = new Date();
    const before = new Date(now.getTime() - hours*60*60*1000);
    document.getElementById('an-date-to').value   = toInputDate(now);
    document.getElementById('an-date-from').value = toInputDate(before);
    load();
  }

  // ── Load data from Firestore ───────────
  async function load() {
    const fromStr = document.getElementById('an-date-from').value;
    const toStr   = document.getElementById('an-date-to').value;
    if (!fromStr || !toStr) {
      ALHYDRA.app.toast('Please select date range', 'warning');
      return;
    }

    const fromDate = new Date(fromStr + 'T00:00:00');
    const toDate   = new Date(toStr   + 'T23:59:59');

    if (fromDate > toDate) {
      ALHYDRA.app.toast('Start date must be before end date', 'warning');
      return;
    }

    ALHYDRA.app.toast('Loading data…', 'info', 1500);

    try {
      const snap = await window.db.collection('sensor_history')
        .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(fromDate))
        .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(toDate))
        .orderBy('timestamp', 'asc')
        .limit(500)
        .get();

      const docs = [];
      snap.forEach(d => docs.push(d.data()));

      if (!docs.length) {
        showEmpty(true);
        return;
      }
      showEmpty(false);
      renderCharts(docs);
    } catch(e) {
      console.error('Analytics load error:', e);
      ALHYDRA.app.toast('Failed to load data: ' + e.message, 'error');
    }
  }

  // ── Render charts with loaded data ─────
  function renderCharts(docs) {
    const fmt = ts => {
      if (!ts) return '';
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const voltage = 220;
    const labels    = docs.map(d => fmt(d.timestamp));
    const phVals    = docs.map(d => parseFloat(d.ph         || 0));
    const turbVals  = docs.map(d => parseFloat(d.turbidity  || 0));
    const tAmbVals  = docs.map(d => parseFloat(d.temp_ambient || 0));
    const tWatVals  = docs.map(d => parseFloat(d.temp_water  || 0));
    const wGenVals  = docs.map(d => parseFloat((d.current_gen  || 0) * voltage));
    const wConsVals = docs.map(d => parseFloat((d.current_cons || 0) * voltage));

    const setChart = (chart, newLabels, ...dataArrays) => {
      if (!chart) return;
      chart.data.labels = newLabels;
      dataArrays.forEach((arr, i) => { chart.data.datasets[i].data = arr; });
      chart.update();
    };

    setChart(charts.ph,        labels, phVals);
    setChart(charts.turbidity, labels, turbVals);
    setChart(charts.temp,      labels, tAmbVals, tWatVals);
    setChart(charts.energy,    labels, wGenVals,  wConsVals);

    // Summary stats
    const avg = arr => (arr.reduce((a,b) => a+b, 0) / arr.length).toFixed(2);
    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setEl('stat-avg-ph',    avg(phVals)   + ' pH');
    setEl('stat-avg-temp',  avg(tAmbVals) + ' °C');
    setEl('stat-avg-wtemp', avg(tWatVals) + ' °C');
    setEl('stat-avg-turb',  avg(turbVals) + ' NTU');
    setEl('stat-count',     docs.length   + ' readings');
  }

  function showEmpty(show) {
    const empty = document.getElementById('analytics-empty');
    const charts = document.getElementById('analytics-charts');
    const stats  = document.getElementById('analytics-stats');
    if (empty)  empty.classList.toggle('hidden', !show);
    if (charts) charts.classList.toggle('hidden', show);
    if (stats)  stats.classList.toggle('hidden', show);
  }

  function onEnter() {
    initCharts();
  }

  function init() {
    setDefaultDates();
  }

  return { init, onEnter, load, quickRange };
})();
