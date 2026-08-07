/* ─────────────────────────────────────────
   device.js — Live telemetry & control for the
   physical ALHYDRA device via Realtime Database.

   This module is the SINGLE SOURCE OF TRUTH for live data.
   It subscribes to the RTDB, maps the device's field names to
   the app's canonical sensor keys, and pushes the result into
   dashboard → monitoring / widgets / energy / ml / algae / report.

   RTDB shape (https://alhydra-id-default-rtdb.firebaseio.com/):
     kontrol/ { aerator, embun, led, pompa }                       (bool)
     sensor/  { kelembapan, light, ph_raw, ph_value, suhu,
                suhu_air, temp_water, turbidity, water_level }     (number)
     energy/  { battery_capacity_wh, battery_soc, current_cons,
                current_gen, power_cons, power_gen }               (number)
     status/  { ip, last_seen, online, rssi }
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.device = (() => {
  const KONTROL_KEYS = ['aerator', 'embun', 'led', 'pompa'];
  // Every DOM id prefix that mirrors a kontrol channel (control page + dashboard quick controls)
  const KONTROL_PREFIXES = ['dev-kontrol-', 'dash-kontrol-'];

  const KONTROL_LABEL = { aerator: 'Aerator', embun: 'Embun', led: 'LED', pompa: 'Pompa' };

  let sensorRef = null, kontrolRef = null, statusRef = null, energyRef = null;
  let applyingRemote = false; // guards against onchange firing while we set .checked from a snapshot

  // Last snapshot of each RTDB branch — merged into one payload on every update
  const latest = { sensor: null, kontrol: null, status: null, energy: null };

  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

  const num = v => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  };

  /* ── RTDB field names → app canonical sensor keys ──
     The rest of the app (dashboard cards, monitoring charts, ml.js,
     algae.js, ops.js, report.js, calibration.js) reads these keys. */
  function mapTelemetry() {
    const s = latest.sensor || {};
    const e = latest.energy || {};
    const out = { source: 'rtdb' };
    const put = (k, v) => { if (v !== undefined) out[k] = v; };

    put('ph',           num(s.ph_value));
    put('ph_raw',       num(s.ph_raw));
    put('light',        num(s.light));
    put('turbidity',    num(s.turbidity));
    put('temp_ambient', num(s.suhu));
    put('humidity',     num(s.kelembapan));
    // The device reports water temperature as `suhu_air` (DS18B20, 0.0625 °C steps);
    // `temp_water` is kept as a fallback for older firmware.
    put('temp_water',   num(s.suhu_air) ?? num(s.temp_water));
    put('water_level',  num(s.water_level));

    put('current_gen',  num(e.current_gen));
    put('current_cons', num(e.current_cons));
    put('power_gen',    num(e.power_gen));
    put('power_cons',   num(e.power_cons));
    put('battery_soc',  num(e.battery_soc));
    put('battery_capacity_wh', num(e.battery_capacity_wh));

    put('last_seen', latest.status?.last_seen);
    put('online',    latest.status?.online);
    return out;
  }

  // Fan the merged payload out to every consumer.
  function publish() {
    if (ALHYDRA.dashboard?.isDemo?.()) return; // demo mode owns the UI while active
    const data = mapTelemetry();
    ALHYDRA.dashboard?.renderData(data);
    ALHYDRA.energy?.onTelemetry?.(data);
    archive(data);
  }

  /* ── Historical archive ──────────────────
     The RTDB only holds the *current* reading, but Analytics, AI Insights and
     Environmental Impact all read Firestore `sensor_history`. Archive one
     sample per ARCHIVE_INTERVAL. The doc id is the time bucket, so several
     open tabs collapse onto the same document instead of duplicating rows. */
  const ARCHIVE_INTERVAL = 5 * 60 * 1000;
  let lastArchive = 0;

  function archive(data) {
    if (!window.db || !window.auth?.currentUser) return;
    if (!latest.status?.online) return;                 // don't archive a stale device
    if (Date.now() - lastArchive < ARCHIVE_INTERVAL) return;
    if (data.ph === undefined && data.temp_water === undefined) return; // nothing useful yet
    lastArchive = Date.now();

    const bucket = Math.floor(Date.now() / ARCHIVE_INTERVAL) * ARCHIVE_INTERVAL;
    const { source, online, last_seen, ...fields } = data;
    window.db.collection('sensor_history').doc('rtdb_' + bucket).set({
      ...fields,
      source: 'rtdb',
      timestamp: firebase.firestore.Timestamp.fromMillis(bucket),
    }, { merge: true }).catch(e => console.warn('[device] archive', e));
  }

  // ── Raw device cards (dashboard "Perangkat IoT" strip) ──
  function renderSensor(data) {
    latest.sensor = data || {};
    const d = latest.sensor;
    setText('dev-ph_raw',   d.ph_raw   !== undefined ? d.ph_raw : '—');
    setText('dev-ph_value', num(d.ph_value) !== undefined ? num(d.ph_value).toFixed(2) : '—');
    publish();
  }

  function renderEnergy(data) {
    latest.energy = data || {};
    const d = latest.energy;
    const soc = num(d.battery_soc);
    setText('dev-battery', soc !== undefined ? Math.round(soc) + ' %' : '—');
    setText('dev-battery-cap', num(d.battery_capacity_wh) !== undefined ? d.battery_capacity_wh + ' Wh' : '—');
    publish();
  }

  function renderKontrol(data) {
    latest.kontrol = data || {};
    if (!data) return;
    applyingRemote = true;
    KONTROL_KEYS.forEach(key => {
      const state = !!data[key];
      KONTROL_PREFIXES.forEach(prefix => {
        const chk   = document.getElementById(prefix + key);
        const badge = document.getElementById(prefix + key + '-badge');
        const label = document.getElementById(prefix + key + '-label');
        if (chk)   chk.checked = state;
        if (badge) { badge.textContent = state ? 'ON' : 'OFF'; badge.classList.toggle('on', state); }
        if (label) { label.textContent = state ? 'ON' : 'OFF'; label.style.color = state ? 'var(--green)' : 'var(--text-muted)'; }
      });
      const icon = document.getElementById('ctrl-icon-dev-' + key);
      if (icon) icon.classList.toggle('on', state);
    });
    applyingRemote = false;
  }

  function renderStatus(data) {
    latest.status = data || {};
    if (!data) return;
    const online = !!data.online;
    const dot  = document.getElementById('dev-status-dot');
    const text = document.getElementById('dev-status-text');
    if (dot)  dot.className = 'sc-status-dot ' + (online ? 'good' : 'danger');
    if (text) text.textContent = online ? 'Online' : 'Offline';
    setText('dev-status-rssi', data.rssi      !== undefined ? data.rssi + ' dBm' : '—');
    setText('dev-status-ip',   data.ip        || '—');
    setText('dev-status-seen', data.last_seen ? new Date(data.last_seen).toLocaleString() : '—');

    // The device — not Firestore — decides whether the app shows "connected"
    ALHYDRA.app?.updateConnectionStatus(online);
    publish();
  }

  // ── Write a control toggle back to the device ──
  async function setKontrol(key, state) {
    if (applyingRemote || !window.rtdb) return;
    const by = window.auth?.currentUser?.displayName
      || window.auth?.currentUser?.email?.split('@')[0]
      || 'web';
    try {
      await window.rtdb.ref('kontrol/' + key).set(!!state);
      ALHYDRA.app?.toast(`${KONTROL_LABEL[key] || key} ${state ? 'ON' : 'OFF'}`, state ? 'success' : 'info');
      ALHYDRA.control?.addLog(KONTROL_LABEL[key] || key, state, by);
      ALHYDRA.audit?.log('kontrol_toggle', { channel: key, state });
    } catch (e) {
      ALHYDRA.app?.toast(`Gagal mengubah ${key}: ${e.message}`, 'error');
      // revert every mirror of this toggle
      applyingRemote = true;
      KONTROL_PREFIXES.forEach(prefix => {
        const chk = document.getElementById(prefix + key);
        if (chk) chk.checked = !state;
      });
      applyingRemote = false;
    }
  }

  function subscribe() {
    if (!window.rtdb) { console.warn('[device] window.rtdb not initialized'); return; }

    sensorRef?.off();
    sensorRef = window.rtdb.ref('sensor');
    sensorRef.on('value', snap => renderSensor(snap.val()), err => console.warn('[device] sensor listener', err));

    energyRef?.off();
    energyRef = window.rtdb.ref('energy');
    energyRef.on('value', snap => renderEnergy(snap.val()), err => console.warn('[device] energy listener', err));

    kontrolRef?.off();
    kontrolRef = window.rtdb.ref('kontrol');
    kontrolRef.on('value', snap => renderKontrol(snap.val()), err => console.warn('[device] kontrol listener', err));

    statusRef?.off();
    statusRef = window.rtdb.ref('status');
    statusRef.on('value', snap => renderStatus(snap.val()), err => console.warn('[device] status listener', err));
  }

  function init() {
    subscribe();
  }

  // Snapshot for other modules that need raw device state (energy, admin, onboarding)
  function getState() {
    return {
      sensor: latest.sensor, energy: latest.energy,
      kontrol: latest.kontrol, status: latest.status,
      telemetry: mapTelemetry(),
    };
  }

  return { init, setKontrol, getState, KONTROL_KEYS };
})();
