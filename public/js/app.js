/* ─────────────────────────────────────────
   app.js — ALHYDRA SPA core
   Handles: routing, topbar clock, toasts,
   notifications, sidebar collapse, auth gate.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.app = (() => {
  // ── State ──────────────────────────────
  const views = ['dashboard', 'monitoring', 'control', 'algae', 'analytics', 'energy', 'impact', 'ai', 'ops', 'alerts', 'encyclopedia', 'profile', 'privacy', 'terms', 'admin', 'settings', 'about'];
  let currentView = 'dashboard';
  let notifications = [];
  let notifPanelOpen = false;
  let clockInterval = null;

  // ── Default thresholds (overridden by Firestore) ──
  window.ALHYDRA_THRESHOLDS = {
    ph:         { min: 6.0, max: 9.0 },
    light:      { min: 200, max: 10000 },
    turbidity:  { max: 50 },
    temp_ambient:{ min: 18, max: 35 },
    humidity:   { min: 40, max: 90 },
    temp_water: { min: 16, max: 32 },
    water_level:{ min: 30, max: 100 },
  };

  // ── Chart.js global defaults ───────────
  function setupChartDefaults() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    Chart.defaults.color           = light ? '#475569' : '#94A3B8';
    Chart.defaults.borderColor     = light ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family     = "'Inter', sans-serif";
    Chart.defaults.font.size       = 12;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.animation.duration     = 400;
  }

  // ── Routing (hash-based) ───────────────
  function navigateTo(viewId) {
    if (!views.includes(viewId)) viewId = 'dashboard';
    if (currentView === viewId) return;

    // Deactivate old
    const old = document.getElementById('view-' + currentView);
    if (old) { old.classList.remove('active'); old.classList.add('hidden'); }
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Activate new
    const next = document.getElementById('view-' + viewId);
    if (next) { next.classList.remove('hidden'); next.classList.add('active'); }
    const navLink = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navLink) navLink.classList.add('active');

    // Update breadcrumb
    const labels = {
      dashboard: 'Dashboard', monitoring: 'Monitoring', control: 'Control Panel',
      algae: 'Microalgae', analytics: 'Analytics', energy: 'Energy Optimization',
      impact: 'Environmental Impact', ai: 'AI Insights', ops: 'Operations', alerts: 'Alert Center',
      encyclopedia: 'Encyclopedia',
      profile: 'My Profile', privacy: 'Privacy Policy', terms: 'Terms of Service',
      admin: 'Admin Console', settings: 'Settings', about: 'About'
    };
    const bc = document.getElementById('breadcrumb-current');
    if (bc) {
      const en = labels[viewId] || viewId;
      bc.textContent = en;
      // keep breadcrumb in sync with the active language
      if (ALHYDRA.i18n?.current?.() === 'id') ALHYDRA.i18n.apply();
    }

    // Sync mobile bottom nav
    document.querySelectorAll('.mbn-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewId);
    });

    // Close mobile sidebar
    closeMobileSidebar();

    // Lifecycle hooks
    const prev = currentView;
    currentView = viewId;

    if (prev === 'monitoring' && ALHYDRA.monitoring) ALHYDRA.monitoring.pause();
    if (viewId === 'monitoring'  && ALHYDRA.monitoring) ALHYDRA.monitoring.resume();
    if (viewId === 'algae'        && ALHYDRA.algae)        ALHYDRA.algae.onEnter();
    if (viewId === 'analytics'    && ALHYDRA.analytics)    ALHYDRA.analytics.onEnter();
    if (viewId === 'energy'       && ALHYDRA.energy)       ALHYDRA.energy.onEnter();
    if (viewId === 'impact'       && ALHYDRA.impact)       ALHYDRA.impact.onEnter();
    if (viewId === 'ai'           && ALHYDRA.ml)           ALHYDRA.ml.onEnter();
    if (viewId === 'ops'          && ALHYDRA.ops)          ALHYDRA.ops.onEnter();
    if (viewId === 'alerts'       && ALHYDRA.alerts)       ALHYDRA.alerts.onEnter();
    if (viewId === 'profile'      && ALHYDRA.profile)     ALHYDRA.profile.onEnter();
    if (viewId === 'privacy'      && ALHYDRA.privacy)     ALHYDRA.privacy.onEnterPrivacy();
    if (viewId === 'terms'        && ALHYDRA.privacy)     ALHYDRA.privacy.onEnterTerms();
    if (viewId === 'admin'        && ALHYDRA.admin)       ALHYDRA.admin.onEnter();
    if (viewId === 'settings'     && ALHYDRA.settings)    ALHYDRA.settings.onEnter();
    if (viewId === 'encyclopedia' && ALHYDRA.encyclopedia) ALHYDRA.encyclopedia.onEnter();
  }

  function initRouter() {
    // Sidebar nav + mobile bottom nav clicks
    document.querySelectorAll('.nav-item, .mbn-item').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const v = link.dataset.view;
        window.location.hash = v;
        navigateTo(v);
      });
    });

    // Hash changes (back/forward)
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '') || 'dashboard';
      navigateTo(h);
    });

    // Initial route
    const init = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(init);
  }

  // ── Clock ──────────────────────────────
  function startClock() {
    const el = document.getElementById('topbar-time');
    if (!el) return;
    function tick() {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick();
    clockInterval = setInterval(tick, 1000);
  }

  // ── Sidebar ────────────────────────────
  function initSidebar() {
    const sidebar  = document.getElementById('sidebar');
    const colBtn   = document.getElementById('sidebar-collapse');
    const menuBtn  = document.getElementById('menu-toggle');

    // Create mobile overlay if not exists
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', closeMobileSidebar);

    colBtn?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    menuBtn?.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }

  function closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
  }

  // ── Theme (dark / light) + Aura toggle ──
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('alhydra-theme', theme); } catch (e) {}
    // Re-tint Chart.js gridlines/text and repaint open charts
    setupChartDefaults();
    if (window.Chart?.instances) {
      Object.values(Chart.instances).forEach(c => { try { c.update('none'); } catch (e) {} });
    }
  }

  function initTheme() {
    const saved = (() => { try { return localStorage.getItem('alhydra-theme'); } catch (e) { return null; } })() || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    const btn = document.getElementById('theme-toggle');
    btn?.addEventListener('click', () => {
      const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      toast(`${next === 'light' ? 'Light' : 'Dark'} mode`, 'info', 1500);
    });

    const auraBtn = document.getElementById('aura-toggle');
    auraBtn?.addEventListener('click', () => {
      const off = document.documentElement.classList.toggle('aura-off');
      try { localStorage.setItem('alhydra-aura', off ? 'off' : 'on'); } catch (e) {}
      auraBtn.classList.toggle('active', !off);
      toast(off ? 'Aura off' : 'Aura on', 'info', 1500);
    });
    if (auraBtn) auraBtn.classList.toggle('active', !document.documentElement.classList.contains('aura-off'));
  }

  // ── Notifications panel ────────────────
  function initNotifPanel() {
    const btn   = document.getElementById('notif-btn');
    const panel = document.getElementById('notif-panel');
    btn?.addEventListener('click', () => {
      notifPanelOpen = !notifPanelOpen;
      panel.classList.toggle('hidden', !notifPanelOpen);
    });
    document.addEventListener('click', e => {
      if (!btn?.contains(e.target) && !panel?.contains(e.target)) {
        notifPanelOpen = false;
        panel?.classList.add('hidden');
      }
    });
  }

  function addNotification(title, msg, type = 'info') {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    notifications.unshift({ title, msg, type, ts });
    if (notifications.length > 30) notifications.pop();
    renderNotifList();
    const badge = document.getElementById('notif-count');
    if (badge) {
      badge.classList.remove('hidden');
      badge.textContent = notifications.length > 9 ? '9+' : notifications.length;
    }
  }

  function clearNotifications() {
    notifications = [];
    renderNotifList();
    const badge = document.getElementById('notif-count');
    if (badge) badge.classList.add('hidden');
  }

  function renderNotifList() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (!notifications.length) {
      list.innerHTML = '<div class="notif-empty">No notifications</div>';
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.type}">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-msg">${n.msg}</div>
        <div class="notif-item-time">${n.ts}</div>
      </div>
    `).join('');
  }

  // ── Toast ──────────────────────────────
  function toast(msg, type = 'info', duration = 3500) {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} toast-icon"></i><span class="toast-msg">${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.classList.add('fade-out');
      setTimeout(() => t.remove(), 350);
    }, duration);
  }

  // ── Connection status ──────────────────
  function updateConnectionStatus(online) {
    const dot   = document.getElementById('conn-dot');
    const label = document.getElementById('conn-label');
    if (dot)   dot.className   = 'status-dot ' + (online ? 'online' : 'offline');
    if (label) label.textContent = online ? 'Online' : 'Offline';
  }

  // ── Auth state → show/hide screens ────
  function onUserSignedIn(user) {
    // Update topbar user info
    const name  = user.displayName || user.email?.split('@')[0] || 'User';
    const email = user.email || '';
    document.getElementById('user-name-display').textContent  = name;
    document.getElementById('user-email-display').textContent = email;
    document.getElementById('user-avatar').textContent        = name.charAt(0).toUpperCase();
    document.getElementById('settings-avatar').textContent    = name.charAt(0).toUpperCase();

    // Show app, hide auth
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    startClock();
    initRouter();
    initSidebar();
    initNotifPanel();
    initTheme();
    ALHYDRA.i18n?.init();
    ALHYDRA.audit?.init();
    setupChartDefaults();

    // Init all modules
    ALHYDRA.dashboard?.init();
    ALHYDRA.monitoring?.init();
    ALHYDRA.control?.init();
    ALHYDRA.analytics?.init();
    ALHYDRA.settings?.init();
    ALHYDRA.encyclopedia?.init();
    ALHYDRA.calibration?.init();
    ALHYDRA.algae?.init();
    ALHYDRA.energy?.init();
    ALHYDRA.impact?.init();
    ALHYDRA.help?.init();
    ALHYDRA.widgets?.init();
    ALHYDRA.onboarding?.init();
    ALHYDRA.profile?.init();
    ALHYDRA.account?.init();
    ALHYDRA.privacy?.init();
    ALHYDRA.admin?.init();
    ALHYDRA.ops?.init();
    ALHYDRA.alerts?.init();
    ALHYDRA.palette?.init();
    ALHYDRA.report?.init();
    ALHYDRA.ml?.init();
    ALHYDRA.chat?.init();
    ALHYDRA.audit?.log('login');

    // Monitor Firestore connectivity via known doc
    window.db.collection('_health').doc('ping')
      .onSnapshot(() => updateConnectionStatus(true), () => updateConnectionStatus(false));
  }

  function onUserSignedOut() {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    if (clockInterval) clearInterval(clockInterval);
  }

  // ── Boot ───────────────────────────────
  function init() {
    // Hide loading after short delay
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
    }, 1800);

    window.auth.onAuthStateChanged(user => {
      if (user) {
        onUserSignedIn(user);
      } else {
        setTimeout(() => {
          document.getElementById('auth-screen').classList.remove('hidden');
          document.getElementById('loading-screen').classList.add('hidden');
        }, 1800);
        onUserSignedOut();
      }
    });
  }

  return { init, navigateTo, toast, addNotification, clearNotifications, updateConnectionStatus };
})();

// ── Utility helpers (global) ──────────────
function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.querySelector('i').className = isText ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
}

function showForgot() {
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('forgot-form').classList.remove('hidden');
  document.getElementById('forgot-form').classList.add('active');
}
function showLoginTab() {
  document.getElementById('forgot-form').classList.remove('active');
  document.getElementById('forgot-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('active');
}
async function sendReset() {
  const email = document.getElementById('forgot-email').value.trim();
  const msgEl = document.getElementById('forgot-msg');
  if (!email) { ALHYDRA.app.toast('Enter your email', 'warning'); return; }
  try {
    await window.auth.sendPasswordResetEmail(email);
    msgEl.textContent = 'Reset link sent! Check your email.';
    msgEl.classList.remove('hidden');
  } catch(e) {
    ALHYDRA.app.toast(e.message, 'error');
  }
}

// ── Bootstrap ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => ALHYDRA.app.init());
