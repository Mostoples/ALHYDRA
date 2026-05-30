/* ─────────────────────────────────────────
   admin.js — Admin console (gated by ALHYDRA.audit.isAdmin()).
   Tabs: Overview/KPIs, Users, Announcements, Feedback, Moderation.
   Also loads the active announcement banner for ALL users.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.admin = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    denied:   { en: 'Admin access required.', id: 'Perlu akses admin.' },
    overview: { en: 'Overview', id: 'Ikhtisar' },
    users:    { en: 'Users', id: 'Pengguna' },
    announce: { en: 'Announcements', id: 'Pengumuman' },
    feedback: { en: 'Feedback', id: 'Masukan' },
    moderation:{ en: 'Moderation', id: 'Moderasi' },
    totalUsers:{ en: 'Total users', id: 'Total pengguna' },
    admins:   { en: 'Admins', id: 'Admin' },
    cultures: { en: 'Cultures', id: 'Kultur' },
    sensorDocs:{ en: 'Sensor records', id: 'Catatan sensor' },
    lastIoT:  { en: 'Last IoT write', id: 'Tulis IoT terakhir' },
    energyNow:{ en: 'Energy now', id: 'Energi kini' },
    search:   { en: 'Search users…', id: 'Cari pengguna…' },
    promote:  { en: 'Make admin', id: 'Jadikan admin' },
    demote:   { en: 'Revoke admin', id: 'Cabut admin' },
    suspend:  { en: 'Suspend', id: 'Tangguhkan' },
    unsuspend:{ en: 'Unsuspend', id: 'Pulihkan' },
    role:     { en: 'Role', id: 'Peran' },
    postNew:  { en: 'Post announcement', id: 'Kirim pengumuman' },
    annTitle: { en: 'Title', id: 'Judul' },
    annBody:  { en: 'Message', id: 'Pesan' },
    annType:  { en: 'Type', id: 'Jenis' },
    publish:  { en: 'Publish', id: 'Terbitkan' },
    active:   { en: 'Active announcements', id: 'Pengumuman aktif' },
    none:     { en: 'Nothing here yet.', id: 'Belum ada apa-apa.' },
    resolve:  { en: 'Resolve', id: 'Selesaikan' },
    resolved: { en: 'Resolved', id: 'Selesai' },
    modHint:  { en: 'Edit default alert thresholds applied to all users.', id: 'Ubah ambang peringatan default untuk semua pengguna.' },
    saveThr:  { en: 'Save default thresholds', id: 'Simpan ambang default' },
    sendFb:   { en: 'Send feedback to admins', id: 'Kirim masukan ke admin' },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  let tab = 'overview';
  let usersCache = [];

  function adminAudit(action, meta) {
    try {
      window.db.collection('audit_admin').add({
        by: window.auth?.currentUser?.email || '', action, meta: meta || '',
        ts: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    } catch (e) {}
  }

  async function onEnter() {
    const host = document.getElementById('admin-body');
    if (!host) return;
    // gate
    const ok = await new Promise(res => { ALHYDRA.audit?.onReady?.(() => res(ALHYDRA.audit.isAdmin())); if (!ALHYDRA.audit) res(false); });
    if (!ok) {
      host.innerHTML = `<div class="empty-state"><i class="fa-solid fa-lock"></i><div class="es-title">${L('denied')}</div></div>`;
      return;
    }
    renderShell();
    renderTab();
  }

  function renderShell() {
    const host = document.getElementById('admin-body');
    if (!host) return;
    const tabs = [['overview', 'fa-gauge-high'], ['users', 'fa-users'], ['announce', 'fa-bullhorn'], ['feedback', 'fa-comment-dots'], ['moderation', 'fa-gavel']];
    host.innerHTML = `
      <div class="tab-bar">
        ${tabs.map(([t, ic]) => `<button class="tab-btn ${t === tab ? 'active' : ''}" onclick="ALHYDRA.admin.go('${t}')"><i class="fa-solid ${ic}"></i> ${L(t)}</button>`).join('')}
      </div>
      <div id="admin-tab"></div>`;
  }

  function go(t) { tab = t; renderShell(); renderTab(); }

  function renderTab() {
    const c = document.getElementById('admin-tab');
    if (!c) return;
    c.innerHTML = `<div class="empty-state" style="padding:24px"><i class="fa-solid fa-circle-notch fa-spin"></i></div>`;
    if (tab === 'overview') renderOverview(c);
    else if (tab === 'users') renderUsers(c);
    else if (tab === 'announce') renderAnnounce(c);
    else if (tab === 'feedback') renderFeedback(c);
    else if (tab === 'moderation') renderModeration(c);
  }

  // ── Overview / KPIs ──
  async function renderOverview(c) {
    const count = async (coll) => { try { const s = await window.db.collection(coll).limit(1000).get(); return s.size; } catch (e) { return '—'; } };
    const users = await (async () => { try { const s = await window.db.collection('users').limit(1000).get(); usersCache = []; s.forEach(d => usersCache.push({ id: d.id, ...d.data() })); return usersCache; } catch (e) { return []; } })();
    const admins = users.filter(u => u.role === 'admin' || ALHYDRA.audit.ADMIN_EMAILS.includes((u.email || '').toLowerCase())).length;
    const cultures = await count('algae_cultures');
    const sensorDocs = await count('sensor_history');
    let lastIoT = '—';
    try { const s = await window.db.collection('sensors').doc('latest').get(); const t = s.data()?.timestamp; lastIoT = t?.toDate ? t.toDate().toLocaleString() : (typeof t === 'string' ? t : '—'); } catch (e) {}
    const e = ALHYDRA.energy?.getState?.();
    const tile = (icon, color, val, label) => `<div class="ai-card" style="padding:16px"><div class="ai-card-head" style="margin-bottom:8px"><div class="ai-ic" style="background:${color}"><i class="fa-solid ${icon}"></i></div><div><div class="kpi-val" style="font-size:22px">${val}</div><div class="kpi-label">${label}</div></div></div></div>`;
    c.innerHTML = `<div class="ai-grid">
      ${tile('fa-users', '#10B981', users.length, L('totalUsers'))}
      ${tile('fa-shield-halved', '#EF4444', admins, L('admins'))}
      ${tile('fa-bacterium', '#06B6D4', cultures, L('cultures'))}
      ${tile('fa-database', '#8B5CF6', sensorDocs, L('sensorDocs'))}
      ${tile('fa-clock', '#F59E0B', `<span style="font-size:13px">${lastIoT}</span>`, L('lastIoT'))}
      ${tile('fa-bolt', '#3B82F6', e ? `${e.balanceW}W` : '—', L('energyNow'))}
    </div>`;
  }

  // ── Users ──
  async function renderUsers(c) {
    if (!usersCache.length) { try { const s = await window.db.collection('users').limit(1000).get(); usersCache = []; s.forEach(d => usersCache.push({ id: d.id, ...d.data() })); } catch (e) {} }
    const rows = usersCache.slice().sort((a, b) => (a.email || '').localeCompare(b.email || ''));
    c.innerHTML = `
      <div class="adm-toolbar"><input type="text" id="adm-user-search" class="adm-search" placeholder="${L('search')}" oninput="ALHYDRA.admin.filterUsers(this.value)" /></div>
      <div class="adm-user-list" id="adm-user-list">${rows.map(userRow).join('')}</div>`;
  }
  function userRow(u) {
    const isAdm = u.role === 'admin' || ALHYDRA.audit.ADMIN_EMAILS.includes((u.email || '').toLowerCase());
    const boot = ALHYDRA.audit.ADMIN_EMAILS.includes((u.email || '').toLowerCase());
    const suspended = u.suspended;
    return `<div class="adm-user ${suspended ? 'susp' : ''}">
      <div class="adm-user-av">${(u.name || u.email || '?').charAt(0).toUpperCase()}</div>
      <div class="adm-user-info"><div class="adm-user-name">${u.name || '—'}</div><div class="adm-user-email">${u.email || u.id}</div></div>
      <span class="adm-role ${isAdm ? 'admin' : ''}">${isAdm ? 'admin' : (u.role || 'operator')}</span>
      <div class="adm-user-actions">
        ${boot ? '' : isAdm
          ? `<button class="btn-secondary sm" onclick="ALHYDRA.admin.setRole('${u.id}','operator')">${L('demote')}</button>`
          : `<button class="btn-secondary sm" onclick="ALHYDRA.admin.setRole('${u.id}','admin')">${L('promote')}</button>`}
        <button class="btn-secondary sm" onclick="ALHYDRA.admin.toggleSuspend('${u.id}', ${suspended ? 'false' : 'true'})">${suspended ? L('unsuspend') : L('suspend')}</button>
      </div>
    </div>`;
  }
  function filterUsers(q) {
    q = (q || '').toLowerCase();
    const list = document.getElementById('adm-user-list');
    if (!list) return;
    const rows = usersCache.filter(u => (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q));
    list.innerHTML = rows.map(userRow).join('') || `<div class="pf-act-empty">${L('none')}</div>`;
  }
  async function setRole(uid, role) {
    try {
      await window.db.collection('users').doc(uid).set({ role }, { merge: true });
      const u = usersCache.find(x => x.id === uid); if (u) u.role = role;
      adminAudit('set_role', { uid, role });
      ALHYDRA.app.toast('Role updated', 'success');
      filterUsers(document.getElementById('adm-user-search')?.value || '');
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }
  async function toggleSuspend(uid, val) {
    try {
      await window.db.collection('users').doc(uid).set({ suspended: val }, { merge: true });
      const u = usersCache.find(x => x.id === uid); if (u) u.suspended = val;
      adminAudit('suspend', { uid, suspended: val });
      ALHYDRA.app.toast(val ? 'User suspended' : 'User restored', 'info');
      filterUsers(document.getElementById('adm-user-search')?.value || '');
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  // ── Announcements ──
  async function renderAnnounce(c) {
    let anns = [];
    try { const s = await window.db.collection('announcements').orderBy('ts', 'desc').limit(20).get(); s.forEach(d => anns.push({ id: d.id, ...d.data() })); } catch (e) {}
    c.innerHTML = `
      <div class="settings-card" style="margin-bottom:14px">
        <h3 class="settings-card-title"><i class="fa-solid fa-bullhorn"></i> ${L('postNew')}</h3>
        <div class="settings-form">
          <div class="sf-group"><label>${L('annTitle')}</label><input type="text" id="ann-title" /></div>
          <div class="sf-group"><label>${L('annBody')}</label><input type="text" id="ann-body" /></div>
          <div class="sf-group"><label>${L('annType')}</label><select id="ann-type"><option value="info">info</option><option value="success">success</option><option value="warning">warning</option></select></div>
          <button class="btn-primary" onclick="ALHYDRA.admin.publish()"><i class="fa-solid fa-paper-plane"></i> ${L('publish')}</button>
        </div>
      </div>
      <h4 style="margin:6px 0 10px;color:var(--text-secondary)">${L('active')}</h4>
      <div class="adm-ann-list">${anns.length ? anns.map(a => `
        <div class="adm-ann ${a.type || 'info'}">
          <div><b>${a.title || ''}</b><div style="font-size:12.5px;color:var(--text-secondary)">${a.body || ''}</div></div>
          <button class="btn-secondary sm" onclick="ALHYDRA.admin.delAnn('${a.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`).join('') : `<div class="pf-act-empty">${L('none')}</div>`}</div>`;
  }
  async function publish() {
    const title = document.getElementById('ann-title')?.value.trim();
    const body = document.getElementById('ann-body')?.value.trim();
    const type = document.getElementById('ann-type')?.value || 'info';
    if (!title) { ALHYDRA.app.toast('Title required', 'warning'); return; }
    try {
      await window.db.collection('announcements').add({ title, body, type, active: true, ts: firebase.firestore.FieldValue.serverTimestamp(), by: window.auth?.currentUser?.email || '' });
      adminAudit('announce', { title });
      ALHYDRA.app.toast('Published', 'success');
      renderTab();
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }
  async function delAnn(id) {
    try { await window.db.collection('announcements').doc(id).delete(); adminAudit('announce_delete', { id }); renderTab(); } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  // ── Feedback ──
  async function renderFeedback(c) {
    let fb = [];
    try { const s = await window.db.collection('feedback').orderBy('ts', 'desc').limit(50).get(); s.forEach(d => fb.push({ id: d.id, ...d.data() })); } catch (e) {}
    c.innerHTML = fb.length ? `<div class="adm-fb-list">${fb.map(f => `
      <div class="adm-fb ${f.resolved ? 'done' : ''}">
        <div class="adm-fb-main"><div class="adm-fb-msg">${(f.message || '').replace(/</g, '&lt;')}</div><div class="adm-fb-meta">${f.email || 'anon'} · ${f.ts?.toDate ? f.ts.toDate().toLocaleString() : ''}</div></div>
        <button class="btn-secondary sm" onclick="ALHYDRA.admin.resolveFb('${f.id}', ${f.resolved ? 'false' : 'true'})">${f.resolved ? L('resolved') : L('resolve')}</button>
      </div>`).join('')}</div>` : `<div class="pf-act-empty">${L('none')}</div>`;
  }
  async function resolveFb(id, val) {
    try { await window.db.collection('feedback').doc(id).set({ resolved: val }, { merge: true }); adminAudit('feedback_resolve', { id, val }); renderTab(); } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  // ── Moderation: default thresholds ──
  function renderModeration(c) {
    const thr = window.ALHYDRA_THRESHOLDS || {};
    const row = (id, label, val) => `<div class="sf-group"><label>${label}</label><input type="number" step="0.1" id="${id}" value="${val ?? ''}" /></div>`;
    c.innerHTML = `
      <div class="settings-card">
        <h3 class="settings-card-title"><i class="fa-solid fa-gavel"></i> ${L('moderation')}</h3>
        <p class="sf-note" style="margin-bottom:12px">${L('modHint')}</p>
        <div class="settings-form sf-grid2">
          ${row('adm-ph-min', 'pH min', thr.ph?.min)}${row('adm-ph-max', 'pH max', thr.ph?.max)}
          ${row('adm-tw-min', 'Water °C min', thr.temp_water?.min)}${row('adm-tw-max', 'Water °C max', thr.temp_water?.max)}
          ${row('adm-turb', 'Turbidity max', thr.turbidity?.max)}${row('adm-wl-min', 'Water level min %', thr.water_level?.min)}
        </div>
        <button class="btn-primary" onclick="ALHYDRA.admin.saveThresholds()"><i class="fa-solid fa-floppy-disk"></i> ${L('saveThr')}</button>
      </div>`;
  }
  async function saveThresholds() {
    const n = id => { const v = parseFloat(document.getElementById(id)?.value); return isNaN(v) ? undefined : v; };
    const data = { ph: { min: n('adm-ph-min'), max: n('adm-ph-max') }, temp_water: { min: n('adm-tw-min'), max: n('adm-tw-max') }, turbidity: { max: n('adm-turb') }, water_level: { min: n('adm-wl-min'), max: 100 } };
    try {
      await window.db.collection('settings').doc('thresholds').set(data, { merge: true });
      Object.assign(window.ALHYDRA_THRESHOLDS, data);
      adminAudit('default_thresholds', {});
      ALHYDRA.app.toast('Default thresholds saved', 'success');
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  // ── Announcement banner for ALL users ──
  async function loadBanner() {
    const host = document.getElementById('announcement-banner');
    if (!host) return;
    let latest = null;
    try {
      const s = await window.db.collection('announcements').orderBy('ts', 'desc').limit(1).get();
      s.forEach(d => latest = { id: d.id, ...d.data() });
    } catch (e) { return; }
    if (!latest) { host.style.display = 'none'; return; }
    let dismissed = null;
    try { dismissed = localStorage.getItem('alhydra_ann_dismiss'); } catch (e) {}
    if (dismissed === latest.id) { host.style.display = 'none'; return; }
    host.style.display = '';
    host.className = 'ann-banner ' + (latest.type || 'info');
    host.innerHTML = `<i class="fa-solid fa-bullhorn"></i> <b>${latest.title || ''}</b> <span>${latest.body || ''}</span>
      <button onclick="ALHYDRA.admin.dismissBanner('${latest.id}')" aria-label="Dismiss">&times;</button>`;
  }
  function dismissBanner(id) {
    try { localStorage.setItem('alhydra_ann_dismiss', id); } catch (e) {}
    const host = document.getElementById('announcement-banner'); if (host) host.style.display = 'none';
  }

  function init() {
    window.addEventListener('alhydra:lang', () => {
      if (document.getElementById('view-admin')?.classList.contains('active')) { renderShell(); renderTab(); }
    });
    // Load announcement banner for everyone, shortly after boot.
    setTimeout(loadBanner, 2500);
  }

  return { init, onEnter, go, filterUsers, setRole, toggleSuspend, publish, delAnn, resolveFb, saveThresholds, dismissBanner, loadBanner };
})();
