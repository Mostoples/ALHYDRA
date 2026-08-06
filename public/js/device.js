/* ─────────────────────────────────────────
   device.js — Live telemetry & control for the
   physical ALHYDRA device via Realtime Database.

   RTDB shape:
     kontrol/ { aerator, embun, led, pompa }            (bool)
     sensor/  { kelembapan, ph_raw, ph_value, suhu }    (number)
     status/  { online, rssi, last_seen, ip }
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.device = (() => {
  const KONTROL_KEYS = ['aerator', 'embun', 'led', 'pompa'];

  let sensorRef  = null;
  let kontrolRef = null;
  let statusRef  = null;
  let applyingRemote = false; // guards against onchange firing while we set .checked from a snapshot

  const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

  function renderSensor(data) {
    if (!data) return;
    if (data.kelembapan !== undefined) setText('dev-kelembapan', parseFloat(data.kelembapan).toFixed(1) + ' %');
    if (data.suhu       !== undefined) setText('dev-suhu',       parseFloat(data.suhu).toFixed(1) + ' °C');
    if (data.ph_raw     !== undefined) setText('dev-ph_raw',     data.ph_raw);
    if (data.ph_value   !== undefined) setText('dev-ph_value',   parseFloat(data.ph_value).toFixed(2));
  }

  function renderKontrol(data) {
    if (!data) return;
    applyingRemote = true;
    KONTROL_KEYS.forEach(key => {
      const state = !!data[key];
      const chk   = document.getElementById('dev-kontrol-' + key);
      const badge = document.getElementById('dev-kontrol-' + key + '-badge');
      if (chk)   chk.checked = state;
      if (badge) { badge.textContent = state ? 'ON' : 'OFF'; badge.classList.toggle('on', state); }
    });
    applyingRemote = false;
  }

  function renderStatus(data) {
    if (!data) return;
    const online = !!data.online;
    const dot  = document.getElementById('dev-status-dot');
    const text = document.getElementById('dev-status-text');
    if (dot)  dot.className = 'sc-status-dot ' + (online ? 'good' : 'danger');
    if (text) text.textContent = online ? 'Online' : 'Offline';
    setText('dev-status-rssi', data.rssi       !== undefined ? data.rssi + ' dBm' : '—');
    setText('dev-status-ip',   data.ip         || '—');
    setText('dev-status-seen', data.last_seen  ? new Date(data.last_seen).toLocaleString() : '—');
  }

  // ── Write a control toggle back to the device ──
  async function setKontrol(key, state) {
    if (applyingRemote || !window.rtdb) return;
    try {
      await window.rtdb.ref('kontrol/' + key).set(!!state);
      ALHYDRA.app?.toast(`${key} ${state ? 'ON' : 'OFF'}`, state ? 'success' : 'info');
    } catch (e) {
      ALHYDRA.app?.toast(`Gagal mengubah ${key}: ${e.message}`, 'error');
      const chk = document.getElementById('dev-kontrol-' + key);
      if (chk) chk.checked = !state; // revert UI on failure
    }
  }

  function subscribe() {
    if (!window.rtdb) { console.warn('[device] window.rtdb not initialized'); return; }

    sensorRef?.off();
    sensorRef = window.rtdb.ref('sensor');
    sensorRef.on('value', snap => renderSensor(snap.val()), err => console.warn('[device] sensor listener', err));

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

  return { init, setKontrol };
})();
