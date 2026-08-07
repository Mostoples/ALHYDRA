/* ─────────────────────────────────────────
   dashboard.js — Real-time sensor cards +
   energy mini-chart + device quick controls

   Data source: Firebase Realtime Database, pushed in by
   device.js via renderData(). No Firestore sensor polling.
───────────────────────────────────────── */
'use strict';

ALHYDRA.dashboard = (() => {
  let energyChart = null;
  let simInterval = null;
  let simActive   = false;

  // Rolling buffer for energy chart (last 30 readings)
  const energyLabels = [];
  const energyGenData = [];
  const energyConsData = [];
  const MAX_POINTS = 30;

  // ── Sensor config ──────────────────────
  const SENSORS = {
    ph:           { unit: '',    decimals: 2, min: 0,  max: 14,    label: 'pH' },
    light:        { unit: ' lx', decimals: 0, min: 0,  max: 10000, label: 'lux' },
    turbidity:    { unit: ' NTU',decimals: 1, min: 0,  max: 100,   label: 'NTU' },
    temp_ambient: { unit: '°C',  decimals: 1, min: 0,  max: 50,    label: '°C' },
    humidity:     { unit: '%',   decimals: 1, min: 0,  max: 100,   label: '%' },
    temp_water:   { unit: '°C',  decimals: 1, min: 0,  max: 50,    label: '°C' },
    water_level:  { unit: '%',   decimals: 0, min: 0,  max: 100,   label: '%' },
    current_gen:  { unit: ' A',  decimals: 2, min: 0,  max: 20,    label: 'A' },
    current_cons: { unit: ' A',  decimals: 2, min: 0,  max: 20,    label: 'A' },
    battery_soc:  { unit: '%',   decimals: 0, min: 0,  max: 100,   label: '%' },
  };

  // Keys that are rendered by updateEnergy(), not by the generic card loop
  const ENERGY_KEYS = ['current_gen', 'current_cons', 'battery_soc'];

  // Alert throttling — see updateCard()
  const prevStatus = {}, lastAlertAt = {};
  const ALERT_COOLDOWN = 5 * 60 * 1000;

  // Chart-append throttling — see updateEnergy()
  let lastChartPush = 0;
  const CHART_INTERVAL = 2000;

  // ── Status logic ───────────────────────
  function getStatus(key, val) {
    const thr = window.ALHYDRA_THRESHOLDS;
    switch(key) {
      case 'ph':
        if (val < thr.ph.min || val > thr.ph.max) return 'danger';
        if (val < 6.5 || val > 8.5) return 'warning';
        return 'good';
      case 'light':
        if (val < thr.light.min) return 'warning';
        if (val > thr.light.max) return 'danger';
        return 'good';
      case 'turbidity':
        if (val > thr.turbidity.max) return 'danger';
        if (val > 30) return 'warning';
        return 'good';
      case 'temp_ambient':
        if (val < thr.temp_ambient.min || val > thr.temp_ambient.max) return 'danger';
        if (val > 30) return 'warning';
        return 'good';
      case 'humidity':
        if (val < thr.humidity.min || val > thr.humidity.max) return 'warning';
        return 'good';
      case 'temp_water':
        if (val < thr.temp_water.min || val > thr.temp_water.max) return 'danger';
        if (val > 28) return 'warning';
        return 'good';
      case 'water_level':
        if (val < 15) return 'danger';
        if (val < (thr.water_level?.min ?? 30)) return 'warning';
        return 'good';
      case 'battery_soc':
        if (val < 15) return 'danger';
        if (val < 35) return 'warning';
        return 'good';
      default:
        return 'good';
    }
  }

  // ── Update a single sensor card ────────
  function updateCard(key, val) {
    const cfg = SENSORS[key];
    if (!cfg || val === undefined || val === null) return;

    const num    = parseFloat(val);
    const valEl  = document.getElementById('val-' + key);
    const barEl  = document.getElementById('bar-' + key);
    const dotEl  = document.getElementById('status-' + key);
    const lblEl  = document.getElementById('bar-' + key + '-label');

    if (valEl) valEl.textContent = num.toFixed(cfg.decimals) + cfg.unit;

    const pct = Math.min(100, Math.max(0, ((num - cfg.min) / (cfg.max - cfg.min)) * 100));
    if (barEl)  barEl.style.width = pct.toFixed(1) + '%';
    if (lblEl)  lblEl.textContent = Math.round(pct) + '%';

    const status = getStatus(key, num);
    if (dotEl) { dotEl.className = 'sc-status-dot ' + status; }

    // Alert on entering danger. RTDB pushes several times per second, so a
    // stuck out-of-range reading must not refill the notification list —
    // notify on the transition, then at most once every ALERT_COOLDOWN.
    if (status === 'danger') {
      const last = lastAlertAt[key] || 0;
      if (prevStatus[key] !== 'danger' || Date.now() - last > ALERT_COOLDOWN) {
        lastAlertAt[key] = Date.now();
        ALHYDRA.app.addNotification(
          `⚠ ${key.toUpperCase()} Alert`,
          `Value ${num.toFixed(cfg.decimals)}${cfg.unit} is out of safe range`,
          'danger'
        );
      }
    }
    prevStatus[key] = status;
  }

  // ── Update energy cards ────────────────
  // The device publishes power (W) directly under energy/. Only fall back to
  // I × V when a firmware build reports current without power.
  function updateEnergy(data) {
    const voltage = parseFloat(data.voltage || 220);
    const gen  = parseFloat(data.current_gen  || 0);
    const cons = parseFloat(data.current_cons || 0);
    const wGen  = (data.power_gen  !== undefined ? parseFloat(data.power_gen)  : gen  * voltage).toFixed(1);
    const wCons = (data.power_cons !== undefined ? parseFloat(data.power_cons) : cons * voltage).toFixed(1);
    const wBal  = parseFloat(wGen) - parseFloat(wCons);

    const setEl = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };

    setEl('val-current_gen',  gen.toFixed(2) + ' A');
    setEl('val-power_gen',    wGen + ' W');
    setEl('val-current_cons', cons.toFixed(2) + ' A');
    setEl('val-power_cons',   wCons + ' W');
    setEl('eb-gen',   wGen  + ' W');
    setEl('eb-cons',  wCons + ' W');

    // Battery (RTDB energy/battery_soc + battery_capacity_wh)
    if (data.battery_soc !== undefined) {
      const soc = parseFloat(data.battery_soc);
      updateCard('battery_soc', soc);
      const capEl = document.getElementById('range-battery_soc');
      if (capEl && data.battery_capacity_wh !== undefined) {
        const cap = parseFloat(data.battery_capacity_wh);
        capEl.textContent = `${cap} Wh · tersisa ≈ ${(cap * soc / 100).toFixed(0)} Wh`;
      }
    }

    const balEl = document.getElementById('eb-balance');
    if (balEl) {
      balEl.textContent = (wBal >= 0 ? '+' : '') + wBal.toFixed(0) + ' W';
      balEl.style.color = wBal >= 0 ? 'var(--green)' : 'var(--red)';
    }

    // Push to energy chart buffer — throttled, since RTDB fires a render for
    // every branch that changes and would otherwise stack duplicate points.
    if (Date.now() - lastChartPush < CHART_INTERVAL) return;
    lastChartPush = Date.now();
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    energyLabels.push(now);
    energyGenData.push(parseFloat(wGen));
    energyConsData.push(parseFloat(wCons));
    if (energyLabels.length > MAX_POINTS) {
      energyLabels.shift(); energyGenData.shift(); energyConsData.shift();
    }
    if (energyChart) {
      energyChart.data.labels                = [...energyLabels];
      energyChart.data.datasets[0].data      = [...energyGenData];
      energyChart.data.datasets[1].data      = [...energyConsData];
      energyChart.update('none');
    }
  }

  // ── Render one telemetry payload (from device.js / RTDB) ─────
  function renderData(data) {
    if (!data) return;

    Object.keys(SENSORS).forEach(key => {
      if (!ENERGY_KEYS.includes(key)) updateCard(key, data[key]);
    });
    updateEnergy(data);

    // Last update time — prefer the device's own status/last_seen
    const lastUpEl = document.getElementById('dash-last-update');
    if (lastUpEl) {
      if (data.last_seen) {
        lastUpEl.textContent = new Date(data.last_seen).toLocaleTimeString();
      } else if (data.timestamp?.toDate) {
        lastUpEl.textContent = data.timestamp.toDate().toLocaleTimeString();
      } else {
        lastUpEl.textContent = new Date().toLocaleTimeString();
      }
    }

    // Forward to monitoring charts
    ALHYDRA.monitoring?.pushData(data);

    // Refresh dashboard hero KPI chips
    ALHYDRA.widgets?.refresh();
  }

  // Live telemetry arrives via renderData(), pushed by device.js from the
  // Realtime Database. Quick controls on this page write straight to
  // rtdb kontrol/* through ALHYDRA.device.setKontrol.

  // ── Energy Chart ───────────────────────
  function initEnergyChart() {
    const canvas = document.getElementById('dash-energy-chart');
    if (!canvas) return;
    // Avoid "Canvas is already in use" if init() runs again (e.g. token refresh)
    if (energyChart) { energyChart.destroy(); energyChart = null; }
    const existing = Chart.getChart?.(canvas);
    if (existing) existing.destroy();
    energyChart = new Chart(canvas, {
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
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { display: false },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94A3B8', maxTicksLimit: 5, callback: v => v + 'W' }
          }
        }
      }
    });
  }

  // ── Demo / Simulation Mode ─────────────
  // Seeded from the last real RTDB reading so demo mode drifts away from
  // reality instead of jumping to invented numbers.
  function startSimulation() {
    const live = ALHYDRA.device?.getState?.().telemetry || {};
    let simPh = live.ph ?? 7.2, simLight = live.light ?? 1800, simTurb = live.turbidity ?? 12.5,
        simTempAmb = live.temp_ambient ?? 28.3, simHum = live.humidity ?? 65.0,
        simTempW = live.temp_water ?? 24.1, simWaterLvl = live.water_level ?? 78,
        simGen = live.current_gen ?? 3.2, simCons = live.current_cons ?? 2.5,
        simSoc = live.battery_soc ?? 60;
    const capWh = live.battery_capacity_wh;

    simInterval = setInterval(() => {
      const rand = (v, d) => Math.max(0, v + (Math.random()-0.5)*2*d);
      const data = {
        ph:           parseFloat(rand(simPh, 0.15).toFixed(2)),
        light:        parseFloat(rand(simLight, 80).toFixed(0)),
        turbidity:    parseFloat(rand(simTurb, 1.5).toFixed(1)),
        temp_ambient: parseFloat(rand(simTempAmb, 0.4).toFixed(1)),
        humidity:     parseFloat(rand(simHum, 1.5).toFixed(1)),
        temp_water:   parseFloat(rand(simTempW, 0.3).toFixed(1)),
        water_level:  parseFloat(Math.min(100, rand(simWaterLvl, 1.2)).toFixed(0)),
        current_gen:  parseFloat(rand(simGen, 0.2).toFixed(2)),
        current_cons: parseFloat(rand(simCons, 0.15).toFixed(2)),
        battery_soc:  parseFloat(Math.min(100, rand(simSoc, 0.4)).toFixed(0)),
        voltage: 220,
      };
      data.power_gen  = parseFloat((data.current_gen  * 12).toFixed(1));
      data.power_cons = parseFloat((data.current_cons * 12).toFixed(1));
      if (capWh !== undefined) data.battery_capacity_wh = capWh;

      // drift
      simPh       = data.ph;        simLight    = data.light;
      simTurb     = data.turbidity; simTempAmb  = data.temp_ambient;
      simHum      = data.humidity;  simTempW    = data.temp_water;
      simWaterLvl = data.water_level; simSoc     = data.battery_soc;
      simGen      = data.current_gen; simCons    = data.current_cons;

      renderData(data);
      const lastUpEl = document.getElementById('dash-last-update');
      if (lastUpEl) lastUpEl.textContent = new Date().toLocaleTimeString() + ' (demo)';
    }, 2000);
  }

  function stopSimulation() {
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
  }

  function toggleSimulate() {
    simActive = !simActive;
    const btn = document.getElementById('dash-simulate-btn');
    if (simActive) {
      stopSimulation();
      startSimulation();
      if (btn) { btn.style.background = 'rgba(245,158,11,0.2)'; btn.style.borderColor = 'var(--amber)'; btn.style.color = 'var(--amber)'; }
      ALHYDRA.app.toast('Demo mode ON — showing simulated data', 'warning');
    } else {
      stopSimulation();
      // Repaint immediately from the last real RTDB snapshot
      const live = ALHYDRA.device?.getState?.().telemetry;
      if (live) renderData(live);
      if (btn) { btn.removeAttribute('style'); }
      ALHYDRA.app.toast('Demo mode OFF — connected to Realtime Database', 'info');
    }
  }

  function isDemo() { return simActive; }

  // ── Init ───────────────────────────────
  function init() {
    initEnergyChart();
    // Repaint from whatever device.js has already received (init order safety)
    const live = ALHYDRA.device?.getState?.().telemetry;
    if (live && Object.keys(live).length > 1) renderData(live);
  }

  return { init, toggleSimulate, renderData, isDemo };
})();
