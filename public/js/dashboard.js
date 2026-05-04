/* ─────────────────────────────────────────
   dashboard.js — Real-time sensor cards +
   energy mini-chart + relay quick controls
───────────────────────────────────────── */
'use strict';

ALHYDRA.dashboard = (() => {
  let unsubscribe = null;
  let unsubRelay1 = null;
  let unsubRelay2 = null;
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
    current_gen:  { unit: ' A',  decimals: 2, min: 0,  max: 20,    label: 'A' },
    current_cons: { unit: ' A',  decimals: 2, min: 0,  max: 20,    label: 'A' },
  };

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

    // Alert if danger or warning
    if (status === 'danger') {
      ALHYDRA.app.addNotification(
        `⚠ ${key.toUpperCase()} Alert`,
        `Value ${num.toFixed(cfg.decimals)}${cfg.unit} is out of safe range`,
        'danger'
      );
    }
  }

  // ── Update energy cards ────────────────
  function updateEnergy(data) {
    const voltage = parseFloat(data.voltage || 220);
    const gen  = parseFloat(data.current_gen  || 0);
    const cons = parseFloat(data.current_cons || 0);
    const wGen  = (gen  * voltage).toFixed(0);
    const wCons = (cons * voltage).toFixed(0);
    const wBal  = (gen - cons) * voltage;

    const setEl = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };

    setEl('val-current_gen',  gen.toFixed(2) + ' A');
    setEl('val-power_gen',    wGen + ' W');
    setEl('val-current_cons', cons.toFixed(2) + ' A');
    setEl('val-power_cons',   wCons + ' W');
    setEl('eb-gen',   wGen  + ' W');
    setEl('eb-cons',  wCons + ' W');

    const balEl = document.getElementById('eb-balance');
    if (balEl) {
      balEl.textContent = (wBal >= 0 ? '+' : '') + wBal.toFixed(0) + ' W';
      balEl.style.color = wBal >= 0 ? 'var(--green)' : 'var(--red)';
    }

    // Push to energy chart buffer
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

  // ── Render data from Firestore doc ─────
  function renderData(data) {
    if (!data) return;

    Object.keys(SENSORS).forEach(key => {
      if (key !== 'current_gen' && key !== 'current_cons') {
        updateCard(key, data[key]);
      }
    });
    updateEnergy(data);

    // Last update time
    const lastUpEl = document.getElementById('dash-last-update');
    if (lastUpEl) {
      if (data.timestamp?.toDate) {
        lastUpEl.textContent = data.timestamp.toDate().toLocaleTimeString();
      } else {
        lastUpEl.textContent = new Date().toLocaleTimeString();
      }
    }

    // Forward to monitoring charts
    ALHYDRA.monitoring?.pushData(data);
  }

  // ── Subscribe to Firestore ─────────────
  function subscribe() {
    unsubscribe?.();
    unsubscribe = window.db.collection('sensors').doc('latest')
      .onSnapshot(snap => {
        if (snap.exists) {
          renderData(snap.data());
          ALHYDRA.app.updateConnectionStatus(true);
        }
      }, err => {
        console.warn('Sensor listener error:', err);
        ALHYDRA.app.updateConnectionStatus(false);
      });
  }

  // ── Relay listeners ────────────────────
  function subscribeRelays() {
    const setDashRelay = (relayNum, state) => {
      const chk = document.getElementById(`dash-relay${relayNum}`);
      const lbl = document.getElementById(`dash-relay${relayNum}-label`);
      if (chk) chk.checked = state;
      if (lbl) { lbl.textContent = state ? 'ON' : 'OFF'; lbl.style.color = state ? 'var(--green)' : 'var(--text-muted)'; }
    };

    unsubRelay1?.();
    unsubRelay1 = window.db.collection('relays').doc('pump1')
      .onSnapshot(snap => { if (snap.exists) setDashRelay(1, snap.data().state); });

    unsubRelay2?.();
    unsubRelay2 = window.db.collection('relays').doc('pump2')
      .onSnapshot(snap => { if (snap.exists) setDashRelay(2, snap.data().state); });
  }

  // ── Energy Chart ───────────────────────
  function initEnergyChart() {
    const canvas = document.getElementById('dash-energy-chart');
    if (!canvas) return;
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
  function startSimulation() {
    let simPh = 7.2, simLight = 1800, simTurb = 12.5,
        simTempAmb = 28.3, simHum = 65.0, simTempW = 24.1,
        simGen = 3.2, simCons = 2.5;

    simInterval = setInterval(() => {
      const rand = (v, d) => Math.max(0, v + (Math.random()-0.5)*2*d);
      const data = {
        ph:           parseFloat(rand(simPh, 0.15).toFixed(2)),
        light:        parseFloat(rand(simLight, 80).toFixed(0)),
        turbidity:    parseFloat(rand(simTurb, 1.5).toFixed(1)),
        temp_ambient: parseFloat(rand(simTempAmb, 0.4).toFixed(1)),
        humidity:     parseFloat(rand(simHum, 1.5).toFixed(1)),
        temp_water:   parseFloat(rand(simTempW, 0.3).toFixed(1)),
        current_gen:  parseFloat(rand(simGen, 0.2).toFixed(2)),
        current_cons: parseFloat(rand(simCons, 0.15).toFixed(2)),
        voltage: 220,
        timestamp: null
      };
      // drift
      simPh       = data.ph;       simLight    = data.light;
      simTurb     = data.turbidity; simTempAmb  = data.temp_ambient;
      simHum      = data.humidity;  simTempW    = data.temp_water;
      simGen      = data.current_gen; simCons   = data.current_cons;

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
      unsubscribe?.();
      startSimulation();
      if (btn) { btn.style.background = 'rgba(245,158,11,0.2)'; btn.style.borderColor = 'var(--amber)'; btn.style.color = 'var(--amber)'; }
      ALHYDRA.app.toast('Demo mode ON — showing simulated data', 'warning');
    } else {
      stopSimulation();
      subscribe();
      if (btn) { btn.removeAttribute('style'); }
      ALHYDRA.app.toast('Demo mode OFF — connected to Firestore', 'info');
    }
  }

  // ── Init ───────────────────────────────
  function init() {
    initEnergyChart();
    subscribe();
    subscribeRelays();
  }

  return { init, toggleSimulate, renderData };
})();
