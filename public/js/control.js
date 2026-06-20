/* ─────────────────────────────────────────
   control.js — Relay/pump control panel
───────────────────────────────────────── */
'use strict';

ALHYDRA.control = (() => {
  let unsubRelay1 = null;
  let unsubRelay2 = null;
  const logEntries = [];

  // ── Set relay state in Firestore ───────
  async function setRelay(relayNum, state) {
    const user = window.auth.currentUser;
    if (!user) { ALHYDRA.app.toast('Not authenticated', 'error'); return; }

    const docId  = 'pump' + relayNum;
    const byName = user.displayName || user.email?.split('@')[0] || 'user';
    const now    = firebase.firestore.FieldValue.serverTimestamp();

    try {
      await window.db.collection('relays').doc(docId).set({
        state,
        updated_at: now,
        updated_by: byName
      });
      ALHYDRA.app.toast(`Pump ${relayNum} turned ${state ? 'ON' : 'OFF'}`, state ? 'success' : 'info');
      addLog(relayNum, state, byName);
      ALHYDRA.audit?.log('relay_toggle', { pump: relayNum, state });
    } catch(e) {
      ALHYDRA.app.toast('Failed to update relay: ' + e.message, 'error');
      // Revert UI
      const chk = document.getElementById(`ctrl-relay${relayNum}`);
      const dchk= document.getElementById(`dash-relay${relayNum}`);
      if (chk)  chk.checked  = !state;
      if (dchk) dchk.checked = !state;
    }
  }

  // ── Log entry ──────────────────────────
  function addLog(relayNum, state, by) {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    logEntries.unshift({ relayNum, state, by, ts });
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
          Pump <strong>${e.relayNum}</strong>
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

  // ── Apply relay state to UI ────────────
  function applyState(relayNum, data) {
    const state  = data.state;
    const byName = data.updated_by || '—';
    const ts     = data.updated_at?.toDate?.()
      ? data.updated_at.toDate().toLocaleString()
      : '—';

    // Control panel toggles
    const ctrlChk  = document.getElementById(`ctrl-relay${relayNum}`);
    const dashChk  = document.getElementById(`dash-relay${relayNum}`);
    const icon     = document.getElementById(`ctrl-icon-${relayNum}`);
    const badge    = document.getElementById(`ctrl-badge-${relayNum}`);
    const timeEl   = document.getElementById(`ctrl-relay${relayNum}-time`);
    const byEl     = document.getElementById(`ctrl-relay${relayNum}-by`);
    const dashLbl  = document.getElementById(`dash-relay${relayNum}-label`);

    if (ctrlChk) ctrlChk.checked  = state;
    if (dashChk) dashChk.checked  = state;

    if (icon)  { icon.classList.toggle('on', state); }
    if (badge) { badge.textContent = state ? 'ON' : 'OFF'; badge.classList.toggle('on', state); }
    if (timeEl)  timeEl.textContent = ts;
    if (byEl)    byEl.textContent   = byName;
    if (dashLbl) {
      dashLbl.textContent   = state ? 'ON' : 'OFF';
      dashLbl.style.color   = state ? 'var(--green)' : 'var(--text-muted)';
    }
  }

  // ── Subscribe to Firestore relay docs ──
  function subscribeRelays() {
    unsubRelay1?.();
    unsubRelay2?.();

    unsubRelay1 = window.db.collection('relays').doc('pump1')
      .onSnapshot(snap => { if (snap.exists) applyState(1, snap.data()); },
                  err => console.warn('[control] relay1 listener', err));

    unsubRelay2 = window.db.collection('relays').doc('pump2')
      .onSnapshot(snap => { if (snap.exists) applyState(2, snap.data()); },
                  err => console.warn('[control] relay2 listener', err));
  }

  // ── Ensure relay docs exist ────────────
  // Swallows its own errors (offline / permission) so the init chain that
  // calls .then(subscribeRelays) can never produce an uncaught rejection.
  async function ensureRelaydDocs() {
    try {
      const batch = window.db.batch();
      const p1 = window.db.collection('relays').doc('pump1');
      const p2 = window.db.collection('relays').doc('pump2');
      const [s1, s2] = await Promise.all([p1.get(), p2.get()]);
      if (!s1.exists) batch.set(p1, { state: false, updated_at: firebase.firestore.FieldValue.serverTimestamp(), updated_by: 'system' });
      if (!s2.exists) batch.set(p2, { state: false, updated_at: firebase.firestore.FieldValue.serverTimestamp(), updated_by: 'system' });
      await batch.commit();
    } catch (e) { console.warn('[control] ensureRelayDocs', e); }
  }

  function init() {
    ensureRelaydDocs().then(subscribeRelays);
    renderLog();
  }

  return { init, setRelay, clearLog };
})();
