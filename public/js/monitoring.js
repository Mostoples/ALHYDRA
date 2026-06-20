/* ─────────────────────────────────────────
   monitoring.js — Real-time Chart.js graphs
   8 sensor channels, grouped in 3 tabs.
───────────────────────────────────────── */
'use strict';

ALHYDRA.monitoring = (() => {
  const MAX_POINTS = 40;
  const charts = {};
  let paused = false;

  // ── Chart definitions ──────────────────
  const CHART_DEFS = [
    { id: 'chart-ph',           key: 'ph',           color: '#10B981', label: 'pH',             unit: '' },
    { id: 'chart-turbidity',    key: 'turbidity',    color: '#06B6D4', label: 'Turbidity',      unit: ' NTU' },
    { id: 'chart-light',        key: 'light',        color: '#F59E0B', label: 'Light Intensity',unit: ' lx' },
    { id: 'chart-temp_ambient', key: 'temp_ambient', color: '#EF4444', label: 'Ambient Temp.',  unit: '°C' },
    { id: 'chart-humidity',     key: 'humidity',     color: '#8B5CF6', label: 'Humidity',       unit: '%' },
    { id: 'chart-temp_water',   key: 'temp_water',   color: '#06B6D4', label: 'Water Temp.',    unit: '°C' },
    { id: 'chart-current_gen',  key: 'current_gen',  color: '#10B981', label: 'Gen Current',    unit: ' A' },
    { id: 'chart-current_cons', key: 'current_cons', color: '#EF4444', label: 'Cons. Current',  unit: ' A' },
  ];

  // ── Build a single Chart.js instance ──
  function buildChart(def) {
    const canvas = document.getElementById(def.id);
    if (!canvas) return;
    // Avoid "Canvas is already in use" if init() runs again (e.g. token refresh)
    if (charts[def.key]) { charts[def.key].destroy(); delete charts[def.key]; }
    const existing = Chart.getChart?.(canvas);
    if (existing) existing.destroy();
    charts[def.key] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: def.label,
          data: [],
          borderColor: def.color,
          backgroundColor: def.color + '18',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}${def.unit}`
            }
          }
        },
        scales: {
          x: {
            display: true,
            ticks: { maxTicksLimit: 6, color: '#4A5568', maxRotation: 0 },
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94A3B8', maxTicksLimit: 5, callback: v => v + def.unit }
          }
        }
      }
    });
  }

  // ── Energy overlay chart (gen + cons) ─
  function buildEnergyChart() {
    const canvas = document.getElementById('chart-energy');
    if (!canvas) return;
    // Avoid "Canvas is already in use" if init() runs again (e.g. token refresh)
    if (charts['energy']) { charts['energy'].destroy(); delete charts['energy']; }
    const existing = Chart.getChart?.(canvas);
    if (existing) existing.destroy();
    charts['energy'] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Generated (W)', data: [],
            borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)',
            borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4
          },
          {
            label: 'Consumed (W)', data: [],
            borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)',
            borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: true, labels: { color: '#94A3B8', boxWidth: 12, font: { size: 11 } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            display: true,
            ticks: { maxTicksLimit: 6, color: '#4A5568', maxRotation: 0 },
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94A3B8', maxTicksLimit: 5, callback: v => v + 'W' }
          }
        }
      }
    });
  }

  // ── Push new data to charts ────────────
  function pushData(data) {
    if (paused) return;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const voltage = parseFloat(data.voltage || 220);

    CHART_DEFS.forEach(def => {
      const chart = charts[def.key];
      if (!chart) return;
      const val = parseFloat(data[def.key]);
      if (isNaN(val)) return;

      chart.data.labels.push(now);
      chart.data.datasets[0].data.push(val);

      if (chart.data.labels.length > MAX_POINTS) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      chart.update('none');

      // Update live value badge
      const liveEl = document.getElementById('live-' + def.key);
      if (liveEl) {
        const cfg = CHART_DEFS.find(d => d.key === def.key);
        liveEl.textContent = val.toFixed(def.key === 'light' ? 0 : 2) + (cfg?.unit || '');
      }
    });

    // Energy overlay chart
    const ec = charts['energy'];
    if (ec) {
      const wGen  = (parseFloat(data.current_gen  || 0) * voltage).toFixed(0);
      const wCons = (parseFloat(data.current_cons || 0) * voltage).toFixed(0);
      ec.data.labels.push(now);
      ec.data.datasets[0].data.push(parseFloat(wGen));
      ec.data.datasets[1].data.push(parseFloat(wCons));
      if (ec.data.labels.length > MAX_POINTS) {
        ec.data.labels.shift();
        ec.data.datasets[0].data.shift();
        ec.data.datasets[1].data.shift();
      }
      ec.update('none');
    }
  }

  // ── Tab switching (monitoring page) ───
  function initTabs() {
    document.querySelectorAll('#view-monitoring .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#view-monitoring .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#view-monitoring .tab-panel').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) { panel.classList.remove('hidden'); panel.classList.add('active'); }
      });
    });
  }

  function pause()  { paused = true;  }
  function resume() { paused = false; }

  function init() {
    CHART_DEFS.forEach(buildChart);
    buildEnergyChart();
    initTabs();
  }

  return { init, pushData, pause, resume };
})();
