/* ─────────────────────────────────────────
   alerts.js — Alert Center: a persistent, filterable history
   of all notifications (threshold breaches, automation,
   announcements). Hooks ALHYDRA.app.addNotification so every
   alert is also stored (localStorage, capped) and shown here.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.alerts = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    none:  { en: 'No alerts recorded. You’re all clear! 🎉', id: 'Tidak ada peringatan. Semua aman! 🎉' },
    cleared:{ en: 'Alert history cleared', id: 'Riwayat peringatan dihapus' },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  const KEY = 'alhydra_alerts';
  let items = [];
  let flt = 'all';

  function load() { try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200))); } catch (e) {} }

  function record(title, msg, type) {
    load();
    items.unshift({ title, msg, type: type || 'info', ts: Date.now() });
    if (items.length > 200) items.pop();
    save();
    updateBadge();
    if (document.getElementById('view-alerts')?.classList.contains('active')) render();
  }

  function updateBadge() {
    // reflect unread-ish count on the topbar bell (reuse notif badge)
    const badge = document.getElementById('notif-count');
    if (badge && items.length) { badge.classList.remove('hidden'); badge.textContent = items.length > 9 ? '9+' : String(items.length); }
  }

  function filter(f) {
    flt = f;
    document.querySelectorAll('#alerts-filter .tab-btn').forEach(b => b.classList.remove('active'));
    if (event?.target) event.target.classList.add('active');
    render();
  }

  function render() {
    load();
    const host = document.getElementById('alerts-body');
    if (!host) return;
    const rows = flt === 'all' ? items : items.filter(i => i.type === flt);
    if (!rows.length) { host.innerHTML = `<div class="empty-state" style="padding:40px"><i class="fa-solid fa-bell-slash"></i><div class="es-title">${L('none')}</div></div>`; return; }
    const icon = { danger: 'fa-triangle-exclamation', warning: 'fa-circle-exclamation', info: 'fa-circle-info', success: 'fa-circle-check' };
    host.innerHTML = `<div class="alerts-list">${rows.map(a => `
      <div class="alert-row ${a.type}">
        <span class="alert-ic"><i class="fa-solid ${icon[a.type] || icon.info}"></i></span>
        <div class="alert-main"><div class="alert-title">${(a.title || '').replace(/</g, '&lt;')}</div><div class="alert-msg">${(a.msg || '').replace(/</g, '&lt;')}</div></div>
        <span class="alert-time">${new Date(a.ts).toLocaleString()}</span>
      </div>`).join('')}</div>`;
  }

  function onEnter() { render(); }
  function clear() { items = []; save(); render(); updateBadge(); ALHYDRA.app.toast(L('cleared'), 'info'); }

  function init() {
    load(); updateBadge();
    // Wrap app.addNotification so every alert is persisted here.
    if (ALHYDRA.app && ALHYDRA.app.addNotification && !ALHYDRA.app.__alertsWrapped) {
      const orig = ALHYDRA.app.addNotification;
      ALHYDRA.app.addNotification = function (title, msg, type) {
        try { record(title, msg, type); } catch (e) {}
        return orig.apply(this, arguments);
      };
      ALHYDRA.app.__alertsWrapped = true;
    }
    window.addEventListener('alhydra:lang', () => { if (document.getElementById('view-alerts')?.classList.contains('active')) render(); });
  }

  return { init, onEnter, filter, clear, record };
})();
