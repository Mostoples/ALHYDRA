/* ─────────────────────────────────────────
   settings.js — Thresholds, system config,
   user profile, password change
───────────────────────────────────────── */
'use strict';

ALHYDRA.settings = (() => {

  // ── Load thresholds from Firestore ─────
  async function loadThresholds() {
    try {
      const snap = await window.db.collection('settings').doc('thresholds').get();
      if (!snap.exists) return;
      const d = snap.data();
      setInput('thr-ph-min',       d.ph?.min);
      setInput('thr-ph-max',       d.ph?.max);
      setInput('thr-light-min',    d.light?.min);
      setInput('thr-light-max',    d.light?.max);
      setInput('thr-turb-max',     d.turbidity?.max);
      setInput('thr-tempamb-min',  d.temp_ambient?.min);
      setInput('thr-tempamb-max',  d.temp_ambient?.max);
      setInput('thr-hum-min',      d.humidity?.min);
      setInput('thr-hum-max',      d.humidity?.max);
      setInput('thr-tempw-min',    d.temp_water?.min);
      setInput('thr-tempw-max',    d.temp_water?.max);
      // Apply to global
      Object.assign(window.ALHYDRA_THRESHOLDS, d);
    } catch(e) { /* no thresholds yet */ }
  }

  // ── Save thresholds to Firestore ───────
  async function saveThresholds() {
    const data = {
      ph:           { min: num('thr-ph-min'),      max: num('thr-ph-max')      },
      light:        { min: num('thr-light-min'),   max: num('thr-light-max')   },
      turbidity:    { max: num('thr-turb-max')                                 },
      temp_ambient: { min: num('thr-tempamb-min'), max: num('thr-tempamb-max') },
      humidity:     { min: num('thr-hum-min'),     max: num('thr-hum-max')     },
      temp_water:   { min: num('thr-tempw-min'),   max: num('thr-tempw-max')   },
    };
    try {
      await window.db.collection('settings').doc('thresholds').set(data);
      Object.assign(window.ALHYDRA_THRESHOLDS, data);
      ALHYDRA.app.toast('Thresholds saved!', 'success');
      ALHYDRA.audit?.log('threshold_save', {});
      ALHYDRA.onboarding?.refreshChecklist?.();
    } catch(e) {
      ALHYDRA.app.toast('Save failed: ' + e.message, 'error');
    }
  }

  // ── Load system settings ───────────────
  async function loadSystem() {
    try {
      const snap = await window.db.collection('settings').doc('system').get();
      if (!snap.exists) return;
      const d = snap.data();
      setInput('sys-site-name', d.site_name);
      setInput('sys-voltage',   d.voltage);
      setInput('sys-interval',  d.log_interval);
    } catch(e) { /* no system settings yet */ }
  }

  // ── Save system settings ───────────────
  async function saveSystem() {
    const data = {
      site_name:    strVal('sys-site-name'),
      voltage:      num('sys-voltage'),
      log_interval: num('sys-interval'),
      updated_at:   firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
      await window.db.collection('settings').doc('system').set(data, { merge: true });
      ALHYDRA.app.toast('System config saved!', 'success');
    } catch(e) {
      ALHYDRA.app.toast('Save failed: ' + e.message, 'error');
    }
  }

  // ── Load user profile ──────────────────
  async function loadProfile() {
    const user = window.auth.currentUser;
    if (!user) return;
    setInput('prof-name',  user.displayName || '');
    setInput('prof-email', user.email || '');
  }

  // ── Update profile ─────────────────────
  async function updateProfile() {
    const user = window.auth.currentUser;
    if (!user) return;
    const name = strVal('prof-name');
    if (!name) { ALHYDRA.app.toast('Name cannot be empty', 'warning'); return; }
    try {
      await user.updateProfile({ displayName: name });
      await window.db.collection('users').doc(user.uid).set({ name, updated_at: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      // Update topbar
      document.getElementById('user-name-display').textContent = name;
      document.getElementById('user-avatar').textContent       = name.charAt(0).toUpperCase();
      document.getElementById('settings-avatar').textContent   = name.charAt(0).toUpperCase();
      ALHYDRA.app.toast('Profile updated!', 'success');
    } catch(e) {
      ALHYDRA.app.toast('Update failed: ' + e.message, 'error');
    }
  }

  // ── Change password ────────────────────
  async function changePassword() {
    const user = window.auth.currentUser;
    if (!user) return;
    const pw = strVal('prof-pw');
    if (!pw || pw.length < 6) { ALHYDRA.app.toast('Password must be at least 6 characters', 'warning'); return; }
    try {
      await user.updatePassword(pw);
      document.getElementById('prof-pw').value = '';
      ALHYDRA.app.toast('Password changed!', 'success');
    } catch(e) {
      if (e.code === 'auth/requires-recent-login') {
        ALHYDRA.app.toast('Please sign out and sign in again before changing your password.', 'warning', 6000);
      } else {
        ALHYDRA.app.toast('Error: ' + e.message, 'error');
      }
    }
  }

  // ── Helpers ────────────────────────────
  function setInput(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.value = val;
  }
  function num(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
  }
  function strVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  // ── Gemini API key (localStorage) ─────
  function saveGeminiKey() {
    const key = strVal('gemini-api-key');
    const statusEl = document.getElementById('gemini-key-status');
    if (key) {
      localStorage.setItem('alhydra_gemini_key', key);
      if (statusEl) { statusEl.textContent = '✅ API key saved. Reload the chat to activate.'; statusEl.className = 'sf-note success'; }
      ALHYDRA.app.toast('Gemini API key saved!', 'success');
    } else {
      localStorage.removeItem('alhydra_gemini_key');
      if (statusEl) { statusEl.textContent = 'API key removed — demo mode active.'; statusEl.className = 'sf-note'; }
      ALHYDRA.app.toast('Gemini key removed.', 'info');
    }
  }

  function loadGeminiKeyField() {
    const inp     = document.getElementById('gemini-api-key');
    const statusEl = document.getElementById('gemini-key-status');
    const key     = localStorage.getItem('alhydra_gemini_key') || '';
    if (inp) inp.value = key;
    if (statusEl) {
      statusEl.textContent = key ? '✅ Gemini AI is active.' : '💡 No key — running in demo mode.';
      statusEl.className   = key ? 'sf-note success' : 'sf-note';
    }
  }

  function onEnter() {
    loadProfile();
    loadThresholds();
    loadSystem();
    loadGeminiKeyField();
    ALHYDRA.calibration?.onSettingsEnter();
  }

  function init() {
    loadThresholds();
  }

  return { init, onEnter, saveThresholds, saveSystem, updateProfile, changePassword, saveGeminiKey };
})();
