/* ─────────────────────────────────────────
   audit.js — Activity/audit logging + role &
   admin detection (foundation for profile & admin).
   - ALHYDRA.audit.log(action, meta) → writes activity_logs
   - ALHYDRA.audit.isAdmin() / role() / ready()
   Email allowlist bootstraps admins; users/{uid}.role overrides.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.audit = (() => {

  // Bootstrap admin emails (also enforced in firestore.rules).
  const ADMIN_EMAILS = ['cooxnime@gmail.com', 'mersif.storage1@gmail.com'];

  let _role = 'operator';
  let _ready = false;
  const _waiters = [];

  function uid()   { return window.auth?.currentUser?.uid || null; }
  function email() { return (window.auth?.currentUser?.email || '').toLowerCase(); }

  function isAdmin() { return _role === 'admin' || ADMIN_EMAILS.includes(email()); }
  function role()    { return isAdmin() ? 'admin' : _role; }
  function ready()   { return _ready; }
  function onReady(fn) { if (_ready) fn(); else _waiters.push(fn); }

  // Load the user's role from users/{uid}; auto-promote allowlisted emails.
  async function loadRole() {
    const id = uid();
    if (!id) { _ready = true; _flush(); return; }
    try {
      const snap = await window.db.collection('users').doc(id).get();
      const data = snap.exists ? snap.data() : {};
      _role = data.role || 'operator';
      // Auto-promote bootstrap admins and persist once.
      if (ADMIN_EMAILS.includes(email()) && _role !== 'admin') {
        _role = 'admin';
        window.db.collection('users').doc(id).set({ role: 'admin' }, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.warn('[audit] role load failed', e);
    }
    _ready = true;
    _flush();
    // Reflect admin state on <html> so CSS can show/hide admin-only UI.
    document.documentElement.classList.toggle('is-admin', isAdmin());
  }
  function _flush() { while (_waiters.length) { try { _waiters.shift()(); } catch (e) {} } }

  // Write an audit entry (fire-and-forget; never blocks UI).
  function log(action, meta) {
    const id = uid();
    if (!id) return;
    try {
      window.db.collection('activity_logs').add({
        uid: id,
        email: email(),
        action: String(action || 'unknown'),
        meta: meta || {},
        ts: firebase.firestore.FieldValue.serverTimestamp(),
        ua: navigator.userAgent.slice(0, 160),
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function init() {
    loadRole();
  }

  return { init, log, isAdmin, role, ready, onReady, ADMIN_EMAILS };
})();
