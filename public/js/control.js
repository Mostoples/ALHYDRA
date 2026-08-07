/* ─────────────────────────────────────────
   control.js — Control-panel activity log.

   The actual relay state lives in the Realtime Database
   (kontrol/aerator|embun|led|pompa) and is read/written by
   device.js. This module only keeps the human-readable log of
   changes made from this browser session.
───────────────────────────────────────── */
'use strict';

ALHYDRA.control = (() => {
  const logEntries = [];

  // ── Log entry ──────────────────────────
  // Called by device.js after a successful write to rtdb kontrol/*
  function addLog(channel, state, by) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    logEntries.unshift({ channel, state, by, ts });
    if (logEntries.length > 50) logEntries.pop();
    renderLog();
  }

  function renderLog() {
    const container = document.getElementById('ctrl-log');
    if (!container) return;
    if (!logEntries.length) {
      container.innerHTML = '<div class="ctrl-log-empty">No activity yet.</div>';
      return;
    }
    container.innerHTML = logEntries.map(e => `
      <div class="ctrl-log-entry">
        <span class="log-time">${e.ts}</span>
        <span class="log-msg">
          <strong>${e.channel}</strong>
          <span class="${e.state ? 'log-on' : 'log-off'}">
            <i class="fa-solid fa-circle-${e.state ? 'play' : 'stop'}"></i>
            ${e.state ? 'ON' : 'OFF'}
          </span>
          by <em>${e.by}</em>
        </span>
      </div>
    `).join('');
  }

  function clearLog() {
    logEntries.length = 0;
    renderLog();
  }

  function init() {
    renderLog();
  }

  return { init, addLog, clearLog };
})();
