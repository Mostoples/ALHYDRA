/* ─────────────────────────────────────────
   profile.js — Profile view: avatar, identity, role badge,
   preferences, and activity/audit timeline.
   Renders into #profile-body. Bilingual.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.profile = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    title:    { en: 'My Profile', id: 'Profil Saya' },
    sub:      { en: 'Manage your identity, preferences and activity', id: 'Kelola identitas, preferensi, dan aktivitas Anda' },
    identity: { en: 'Identity', id: 'Identitas' },
    displayName: { en: 'Display name', id: 'Nama tampilan' },
    bio:      { en: 'Bio', id: 'Bio' },
    location: { en: 'Location', id: 'Lokasi' },
    email:    { en: 'Email', id: 'Email' },
    role:     { en: 'Role', id: 'Peran' },
    member:   { en: 'Member since', id: 'Anggota sejak' },
    avatar:   { en: 'Avatar', id: 'Avatar' },
    avatarHint:{ en: 'Pick an emoji or upload a small image', id: 'Pilih emoji atau unggah gambar kecil' },
    upload:   { en: 'Upload', id: 'Unggah' },
    save:     { en: 'Save profile', id: 'Simpan profil' },
    prefs:    { en: 'Preferences', id: 'Preferensi' },
    landing:  { en: 'Default landing page', id: 'Halaman awal default' },
    units:    { en: 'Temperature units', id: 'Satuan suhu' },
    notif:    { en: 'Enable alert notifications', id: 'Aktifkan notifikasi peringatan' },
    savePrefs:{ en: 'Save preferences', id: 'Simpan preferensi' },
    activity: { en: 'Recent activity', id: 'Aktivitas terbaru' },
    noActivity:{ en: 'No activity recorded yet.', id: 'Belum ada aktivitas tercatat.' },
    dataPriv: { en: 'Data & Privacy', id: 'Data & Privasi' },
    exportJson:{ en: 'Export my data (JSON)', id: 'Ekspor data saya (JSON)' },
    exportCsv:{ en: 'Export sensor history (CSV)', id: 'Ekspor riwayat sensor (CSV)' },
    viewPrivacy:{ en: 'Privacy Policy', id: 'Kebijakan Privasi' },
    viewTerms:{ en: 'Terms of Service', id: 'Ketentuan Layanan' },
    danger:   { en: 'Danger zone', id: 'Zona berbahaya' },
    deleteAcc:{ en: 'Delete my account', id: 'Hapus akun saya' },
    deleteHint:{ en: 'Permanently removes your profile and data. This cannot be undone.', id: 'Menghapus permanen profil & data Anda. Tidak dapat dibatalkan.' },
    saved:    { en: 'Profile saved!', id: 'Profil tersimpan!' },
    prefsSaved:{ en: 'Preferences saved!', id: 'Preferensi tersimpan!' },
    roles:    { admin: { en: 'Administrator', id: 'Administrator' }, operator: { en: 'Operator', id: 'Operator' }, viewer: { en: 'Viewer', id: 'Pengamat' } },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  const EMOJIS = ['🌱', '🌿', '🍃', '🦠', '☀️', '💧', '⚡', '🔬', '🧪', '🌍', '🐟', '🌊'];
  let profile = {};

  async function loadProfile() {
    const u = window.auth?.currentUser;
    if (!u) return {};
    let data = {};
    try { const s = await window.db.collection('users').doc(u.uid).get(); if (s.exists) data = s.data(); } catch (e) {}
    profile = {
      name: data.name || u.displayName || u.email?.split('@')[0] || 'User',
      bio: data.bio || '', location: data.location || '',
      email: u.email || '', avatar: data.avatar || '',
      role: ALHYDRA.audit?.role?.() || data.role || 'operator',
      created: data.created_at?.toDate ? data.created_at.toDate() : null,
      prefs: data.preferences || {},
    };
    return profile;
  }

  function avatarHtml() {
    if (profile.avatar && profile.avatar.startsWith('data:')) return `<img src="${profile.avatar}" alt="avatar" />`;
    if (profile.avatar) return `<span class="pf-emoji">${profile.avatar}</span>`;
    return `<span>${(profile.name || '?').charAt(0).toUpperCase()}</span>`;
  }

  async function onEnter() {
    const host = document.getElementById('profile-body');
    if (!host) return;
    host.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i></div>`;
    await loadProfile();
    render();
    loadActivity();
  }

  function render() {
    const host = document.getElementById('profile-body');
    if (!host) return;
    const roleLabel = (T.roles[profile.role] || T.roles.operator)[lang()];
    const isAdmin = ALHYDRA.audit?.isAdmin?.();
    host.innerHTML = `
      <div class="pf-grid">
        <!-- Identity card -->
        <div class="settings-card pf-identity">
          <div class="pf-avatar-wrap">
            <div class="pf-avatar" id="pf-avatar">${avatarHtml()}</div>
            <div class="pf-id-meta">
              <div class="pf-name">${profile.name}</div>
              <div class="pf-email">${profile.email}</div>
              <span class="pf-role ${isAdmin ? 'admin' : ''}"><i class="fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-user'}"></i> ${roleLabel}</span>
              ${profile.created ? `<div class="pf-since">${L('member')} ${profile.created.toLocaleDateString()}</div>` : ''}
            </div>
          </div>
          <div class="pf-emoji-row">${EMOJIS.map(e => `<button class="pf-emoji-btn" onclick="ALHYDRA.profile.pickEmoji('${e}')">${e}</button>`).join('')}</div>
          <label class="pf-upload"><i class="fa-solid fa-upload"></i> ${L('upload')}
            <input type="file" accept="image/*" id="pf-file" onchange="ALHYDRA.profile.onFile(event)" hidden />
          </label>
        </div>

        <!-- Edit form -->
        <div class="settings-card">
          <h3 class="settings-card-title"><i class="fa-solid fa-id-card"></i> ${L('identity')}</h3>
          <div class="settings-form">
            <div class="sf-group"><label>${L('displayName')}</label><input type="text" id="pf-name" value="${escapeAttr(profile.name)}" /></div>
            <div class="sf-group"><label>${L('bio')}</label><input type="text" id="pf-bio" value="${escapeAttr(profile.bio)}" placeholder="Algae researcher…" /></div>
            <div class="sf-group"><label>${L('location')}</label><input type="text" id="pf-loc" value="${escapeAttr(profile.location)}" placeholder="Jakarta, ID" /></div>
            <button class="btn-primary" onclick="ALHYDRA.profile.save()"><i class="fa-solid fa-floppy-disk"></i> ${L('save')}</button>
          </div>
        </div>

        <!-- Preferences -->
        <div class="settings-card">
          <h3 class="settings-card-title"><i class="fa-solid fa-sliders"></i> ${L('prefs')}</h3>
          <div class="settings-form">
            <div class="sf-group"><label>${L('landing')}</label>
              <select id="pf-landing">
                ${['dashboard','monitoring','algae','energy','analytics','ai'].map(v => `<option value="${v}" ${profile.prefs.landing === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </div>
            <div class="sf-group"><label>${L('units')}</label>
              <select id="pf-units">
                <option value="c" ${profile.prefs.units !== 'f' ? 'selected' : ''}>°C</option>
                <option value="f" ${profile.prefs.units === 'f' ? 'selected' : ''}>°F</option>
              </select>
            </div>
            <label class="pf-check"><input type="checkbox" id="pf-notif" ${profile.prefs.notif !== false ? 'checked' : ''} /> ${L('notif')}</label>
            <button class="btn-primary" onclick="ALHYDRA.profile.savePrefs()"><i class="fa-solid fa-floppy-disk"></i> ${L('savePrefs')}</button>
          </div>
        </div>

        <!-- Data & Privacy -->
        <div class="settings-card">
          <h3 class="settings-card-title"><i class="fa-solid fa-shield-halved"></i> ${L('dataPriv')}</h3>
          <div class="settings-form">
            <button class="btn-secondary" onclick="ALHYDRA.account.exportJson()"><i class="fa-solid fa-file-arrow-down"></i> ${L('exportJson')}</button>
            <button class="btn-secondary" onclick="ALHYDRA.account.exportCsv()"><i class="fa-solid fa-file-csv"></i> ${L('exportCsv')}</button>
            <button class="btn-secondary" onclick="ALHYDRA.app.navigateTo('privacy')"><i class="fa-solid fa-lock"></i> ${L('viewPrivacy')}</button>
            <button class="btn-secondary" onclick="ALHYDRA.app.navigateTo('terms')"><i class="fa-solid fa-file-contract"></i> ${L('viewTerms')}</button>
            <hr class="sf-divider" />
            <h4 style="color:var(--red)">${L('danger')}</h4>
            <p class="sf-note">${L('deleteHint')}</p>
            <button class="btn-danger" onclick="ALHYDRA.account.deleteAccount()"><i class="fa-solid fa-trash"></i> ${L('deleteAcc')}</button>
          </div>
        </div>

        <!-- Activity timeline -->
        <div class="settings-card" style="grid-column:1/-1">
          <h3 class="settings-card-title"><i class="fa-solid fa-clock-rotate-left"></i> ${L('activity')}</h3>
          <div id="pf-activity" class="pf-activity"><div class="empty-state" style="padding:20px"><i class="fa-solid fa-circle-notch fa-spin"></i></div></div>
        </div>
      </div>`;
  }

  function escapeAttr(s) { return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function pickEmoji(e) { profile.avatar = e; const el = document.getElementById('pf-avatar'); if (el) el.innerHTML = `<span class="pf-emoji">${e}</span>`; }
  function onFile(ev) {
    const f = ev.target.files?.[0]; if (!f) return;
    if (f.size > 600 * 1024) { ALHYDRA.app.toast(lang() === 'id' ? 'Gambar terlalu besar (maks 600KB)' : 'Image too large (max 600KB)', 'warning'); return; }
    const r = new FileReader();
    r.onload = () => { profile.avatar = r.result; const el = document.getElementById('pf-avatar'); if (el) el.innerHTML = `<img src="${r.result}" alt="avatar" />`; };
    r.readAsDataURL(f);
  }

  async function save() {
    const u = window.auth?.currentUser; if (!u) return;
    const name = document.getElementById('pf-name')?.value.trim() || profile.name;
    const patch = {
      name, bio: document.getElementById('pf-bio')?.value.trim() || '',
      location: document.getElementById('pf-loc')?.value.trim() || '',
      avatar: profile.avatar || '',
    };
    try {
      await window.db.collection('users').doc(u.uid).set(patch, { merge: true });
      if (name !== u.displayName) await u.updateProfile({ displayName: name }).catch(() => {});
      profile = { ...profile, ...patch };
      // reflect in topbar
      const setTxt = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
      setTxt('user-name-display', name);
      document.getElementById('user-avatar') && (document.getElementById('user-avatar').innerHTML = profile.avatar ? (profile.avatar.startsWith('data:') ? `<img src="${profile.avatar}" style="width:100%;height:100%;border-radius:inherit;object-fit:cover">` : profile.avatar) : name.charAt(0).toUpperCase());
      ALHYDRA.app.toast(L('saved'), 'success');
      ALHYDRA.audit?.log('profile_update', { fields: Object.keys(patch) });
      ALHYDRA.onboarding?.refreshChecklist?.();
    } catch (e) { ALHYDRA.app.toast('Save failed: ' + e.message, 'error'); }
  }

  async function savePrefs() {
    const u = window.auth?.currentUser; if (!u) return;
    const prefs = {
      landing: document.getElementById('pf-landing')?.value || 'dashboard',
      units: document.getElementById('pf-units')?.value || 'c',
      notif: document.getElementById('pf-notif')?.checked !== false,
    };
    try {
      await window.db.collection('users').doc(u.uid).set({ preferences: prefs }, { merge: true });
      profile.prefs = prefs;
      try { localStorage.setItem('alhydra_prefs', JSON.stringify(prefs)); } catch (e) {}
      ALHYDRA.app.toast(L('prefsSaved'), 'success');
      ALHYDRA.audit?.log('prefs_update', prefs);
    } catch (e) { ALHYDRA.app.toast('Save failed: ' + e.message, 'error'); }
  }

  async function loadActivity() {
    const host = document.getElementById('pf-activity');
    if (!host) return;
    const u = window.auth?.currentUser; if (!u) return;
    let rows = [];
    try {
      const s = await window.db.collection('activity_logs').where('uid', '==', u.uid).limit(50).get();
      s.forEach(d => rows.push(d.data()));
      rows.sort((a, b) => (b.ts?.toMillis?.() || 0) - (a.ts?.toMillis?.() || 0));
    } catch (e) { /* index may be building */ }
    if (!rows.length) { host.innerHTML = `<div class="pf-act-empty">${L('noActivity')}</div>`; return; }
    const icons = { login: 'fa-right-to-bracket', profile_update: 'fa-id-card', prefs_update: 'fa-sliders', relay_toggle: 'fa-plug', threshold_save: 'fa-sliders', culture_add: 'fa-bacterium', harvest: 'fa-wheat-awn', onboarding_complete: 'fa-flag-checkered', tour_start: 'fa-route', data_export: 'fa-file-arrow-down' };
    host.innerHTML = rows.slice(0, 40).map(r => {
      const t = r.ts?.toDate ? r.ts.toDate() : null;
      return `<div class="pf-act-row"><span class="pf-act-ic"><i class="fa-solid ${icons[r.action] || 'fa-circle-dot'}"></i></span>
        <span class="pf-act-name">${r.action.replace(/_/g, ' ')}</span>
        <span class="pf-act-time">${t ? t.toLocaleString() : ''}</span></div>`;
    }).join('');
  }

  function init() {
    window.addEventListener('alhydra:lang', () => {
      if (document.getElementById('view-profile')?.classList.contains('active')) { render(); loadActivity(); }
    });
  }

  return { init, onEnter, pickEmoji, onFile, save, savePrefs };
})();
