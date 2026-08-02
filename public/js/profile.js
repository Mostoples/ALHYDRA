/* ─────────────────────────────────────────
   profile.js — Profile view: identity, stats, preferences, security.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.profile = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }

  const T = {
    /* identity */
    displayName:  { en: 'Display Name',     id: 'Nama Tampilan' },
    bio:          { en: 'Bio',              id: 'Bio' },
    location:     { en: 'Location',         id: 'Lokasi' },
    email:        { en: 'Email',            id: 'Email' },
    member:       { en: 'Member since',     id: 'Anggota sejak' },
    upload:       { en: 'Upload photo',     id: 'Unggah foto' },
    edit:         { en: 'Edit Profile',     id: 'Edit Profil' },
    save:         { en: 'Save',             id: 'Simpan' },
    cancel:       { en: 'Cancel',           id: 'Batal' },
    saved:        { en: 'Profile saved!',   id: 'Profil tersimpan!' },
    /* stats */
    daysActive:   { en: 'Days Active',      id: 'Hari Aktif' },
    lastLogin:    { en: 'Last Login',       id: 'Login Terakhir' },
    emailStatus:  { en: 'Email',            id: 'Email' },
    verified:     { en: 'Verified',         id: 'Terverifikasi' },
    unverified:   { en: 'Unverified',       id: 'Belum Verifikasi' },
    accountType:  { en: 'Account Type',     id: 'Tipe Akun' },
    /* preferences */
    preferences:  { en: 'Preferences',      id: 'Preferensi' },
    theme:        { en: 'Theme',            id: 'Tema' },
    darkMode:     { en: 'Dark',             id: 'Gelap' },
    lightMode:    { en: 'Light',            id: 'Terang' },
    language:     { en: 'Language',         id: 'Bahasa' },
    /* security */
    security:     { en: 'Security',         id: 'Keamanan' },
    uid:          { en: 'User ID',          id: 'ID Pengguna' },
    provider:     { en: 'Sign-in Method',   id: 'Metode Masuk' },
    lastSignIn:   { en: 'Last Sign-in',     id: 'Masuk Terakhir' },
    changePass:   { en: 'Change Password',  id: 'Ganti Password' },
    copied:       { en: 'Copied!',          id: 'Tersalin!' },
    /* legal */
    legal:        { en: 'Legal',                                    id: 'Legal' },
    viewPrivacy:  { en: 'Privacy Policy',                           id: 'Kebijakan Privasi' },
    privacyDesc:  { en: 'How we collect, use, and protect your personal data', id: 'Bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda' },
    viewTerms:    { en: 'Terms of Service',                         id: 'Ketentuan Layanan' },
    termsDesc:    { en: 'Rules and guidelines for using ALHYDRA',   id: 'Aturan dan panduan penggunaan ALHYDRA' },
    /* roles */
    roles: {
      admin:    { en: 'Administrator', id: 'Administrator' },
      operator: { en: 'Operator',      id: 'Operator' },
      viewer:   { en: 'Viewer',        id: 'Pengamat' },
    },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  const EMOJIS = ['🌱','🌿','🍃','🦠','☀️','💧','⚡','🔬','🧪','🌍','🐟','🌊'];
  let profile = {};
  let editMode = false;

  /* ── Helpers ──────────────────────────── */
  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function avatarHtml() {
    return ALHYDRA.app.avatarMarkup({ avatar: profile.avatar, photoURL: profile.photoURL, name: profile.name });
  }

  function relativeTime(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 2)  return lang() === 'id' ? 'Baru saja' : 'Just now';
    if (m < 60) return lang() === 'id' ? `${m} mnt lalu` : `${m}m ago`;
    if (h < 24) return lang() === 'id' ? `${h} jam lalu` : `${h}h ago`;
    if (d < 30) return lang() === 'id' ? `${d} hari lalu` : `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function daysActive(dateStr) {
    if (!dateStr) return '—';
    return Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
  }

  /* ── Load ─────────────────────────────── */
  async function loadProfile() {
    const u = window.auth?.currentUser;
    if (!u) return;
    let data = {};
    try {
      const s = await window.db.collection('users').doc(u.uid).get();
      if (s.exists) data = s.data();
    } catch (e) {}
    profile = {
      name:         data.name      || u.displayName || u.email?.split('@')[0] || 'User',
      bio:          data.bio       || '',
      location:     data.location  || '',
      email:        u.email        || '',
      avatar:       data.avatar    || '',
      photoURL:     data.photoURL  || u.photoURL || '',
      role:         ALHYDRA.audit?.role?.() || data.role || 'operator',
      created:      data.created_at?.toDate ? data.created_at.toDate() : null,
      uid:          u.uid,
      emailVerified:u.emailVerified,
      creationTime: u.metadata?.creationTime || null,
      lastSignInTime:u.metadata?.lastSignInTime || null,
      providerId:   u.providerData?.[0]?.providerId || 'password',
    };
  }

  async function onEnter() {
    editMode = false;
    const host = document.getElementById('profile-body');
    if (!host) return;
    host.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i></div>`;
    await loadProfile();
    render();
  }

  /* ── VIEW mode ─────────────────────────── */
  function renderView() {
    const isAdmin     = ALHYDRA.audit?.isAdmin?.();
    const roleLabel   = (T.roles[profile.role] || T.roles.operator)[lang()];
    const memberDate  = profile.created ? profile.created.toLocaleDateString() : null;
    const days        = daysActive(profile.creationTime);
    const isDark      = document.documentElement.getAttribute('data-theme') !== 'light';
    const isEN        = lang() === 'en';
    const providerIcon = profile.providerId === 'google.com' ? 'fa-brands fa-google' : 'fa-solid fa-envelope';
    const providerName = profile.providerId === 'google.com' ? 'Google' : (lang() === 'id' ? 'Email & Password' : 'Email & Password');

    return `
      <div class="pf-stack">

        <!-- ① Identity Card -->
        <div class="pf-card pf-identity">
          <button class="pf-edit-icon" onclick="ALHYDRA.profile.startEdit()" title="${L('edit')}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <div class="pf-identity-top">
            <div class="pf-avatar-lg">${avatarHtml()}</div>
            <div class="pf-identity-info">
              <div class="pf-name">${escapeHtml(profile.name)}</div>
              <div class="pf-email-row">
                <i class="fa-solid fa-at"></i>
                <span>${escapeHtml(profile.email)}</span>
              </div>
              <div class="pf-badges">
                <span class="pf-role ${isAdmin ? 'admin' : ''}">
                  <i class="fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-user'}"></i> ${roleLabel}
                </span>
                <span class="pf-badge-verify ${profile.emailVerified ? 'ok' : 'warn'}">
                  <i class="fa-solid ${profile.emailVerified ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
                  ${L(profile.emailVerified ? 'verified' : 'unverified')}
                </span>
              </div>
            </div>
          </div>
          ${(profile.bio || profile.location) ? `
          <div class="pf-identity-meta">
            ${profile.bio      ? `<div class="pf-meta-item"><i class="fa-solid fa-quote-left"></i><span>${escapeHtml(profile.bio)}</span></div>` : ''}
            ${profile.location ? `<div class="pf-meta-item"><i class="fa-solid fa-location-dot"></i><span>${escapeHtml(profile.location)}</span></div>` : ''}
            ${memberDate ? `<div class="pf-meta-item"><i class="fa-regular fa-calendar"></i><span>${L('member')} ${memberDate}</span></div>` : ''}
          </div>` : memberDate ? `
          <div class="pf-identity-meta">
            <div class="pf-meta-item"><i class="fa-regular fa-calendar"></i><span>${L('member')} ${memberDate}</span></div>
          </div>` : ''}
        </div>

        <!-- ② Stats Grid -->
        <div class="pf-stats-grid">
          <div class="pf-stat-card">
            <div class="pf-stat-icon" style="--sc:#10B981"><i class="fa-solid fa-calendar-days"></i></div>
            <div class="pf-stat-val">${days}</div>
            <div class="pf-stat-lbl">${L('daysActive')}</div>
          </div>
          <div class="pf-stat-card">
            <div class="pf-stat-icon" style="--sc:#06B6D4"><i class="fa-solid fa-clock"></i></div>
            <div class="pf-stat-val pf-stat-sm">${relativeTime(profile.lastSignInTime)}</div>
            <div class="pf-stat-lbl">${L('lastLogin')}</div>
          </div>
          <div class="pf-stat-card">
            <div class="pf-stat-icon" style="--sc:${profile.emailVerified ? '#10B981' : '#F59E0B'}">
              <i class="fa-solid fa-${profile.emailVerified ? 'shield-halved' : 'triangle-exclamation'}"></i>
            </div>
            <div class="pf-stat-val pf-stat-sm">${L(profile.emailVerified ? 'verified' : 'unverified')}</div>
            <div class="pf-stat-lbl">${L('emailStatus')}</div>
          </div>
          <div class="pf-stat-card">
            <div class="pf-stat-icon" style="--sc:#8B5CF6"><i class="fa-solid ${isAdmin ? 'fa-shield-halved' : 'fa-user-gear'}"></i></div>
            <div class="pf-stat-val pf-stat-sm">${roleLabel}</div>
            <div class="pf-stat-lbl">${L('accountType')}</div>
          </div>
        </div>

        <!-- ③ Preferences + Security (2-col on desktop) -->
        <div class="pf-two-col">

          <!-- Preferences -->
          <div class="pf-card">
            <div class="pf-section-title">
              <i class="fa-solid fa-sliders"></i> ${L('preferences')}
            </div>
            <div class="pf-pref-list">
              <div class="pf-pref-row">
                <div class="pf-pref-label">
                  <i class="fa-solid ${isDark ? 'fa-moon' : 'fa-sun'}"></i>
                  <span>${L('theme')}</span>
                </div>
                <button class="pf-theme-pill ${isDark ? 'dark' : 'light'}" onclick="ALHYDRA.profile.toggleTheme()">
                  <span class="pf-pill-knob"></span>
                  <span class="pf-pill-txt dark-lbl">${L('darkMode')}</span>
                  <span class="pf-pill-txt light-lbl">${L('lightMode')}</span>
                </button>
              </div>
              <div class="pf-pref-row">
                <div class="pf-pref-label">
                  <i class="fa-solid fa-language"></i>
                  <span>${L('language')}</span>
                </div>
                <div class="pf-lang-toggle">
                  <button class="pf-lang-btn ${isEN ? 'active' : ''}" onclick="ALHYDRA.profile.setLang('en')">EN</button>
                  <button class="pf-lang-btn ${!isEN ? 'active' : ''}" onclick="ALHYDRA.profile.setLang('id')">ID</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="pf-card">
            <div class="pf-section-title">
              <i class="fa-solid fa-lock"></i> ${L('security')}
            </div>
            <div class="pf-sec-list">
              <div class="pf-sec-row">
                <span class="pf-sec-key">${L('provider')}</span>
                <span class="pf-sec-val">
                  <i class="${providerIcon}"></i> ${providerName}
                </span>
              </div>
              <div class="pf-sec-row">
                <span class="pf-sec-key">${L('lastSignIn')}</span>
                <span class="pf-sec-val">${profile.lastSignInTime ? new Date(profile.lastSignInTime).toLocaleString() : '—'}</span>
              </div>
              <div class="pf-sec-row pf-uid-row">
                <span class="pf-sec-key">${L('uid')}</span>
                <span class="pf-uid-val">${profile.uid || '—'}</span>
                <button class="pf-copy-btn" onclick="ALHYDRA.profile.copyUid()" title="Copy">
                  <i class="fa-regular fa-copy"></i>
                </button>
              </div>
              ${profile.providerId === 'password' ? `
              <button class="pf-change-pass-btn" onclick="ALHYDRA.app.navigateTo('settings')">
                <i class="fa-solid fa-key"></i> ${L('changePass')}
              </button>` : ''}
            </div>
          </div>

        </div><!-- /pf-two-col -->

        <!-- ④ Legal -->
        <div class="pf-legal-section">
          <div class="pf-section-title">
            <i class="fa-solid fa-scale-balanced"></i> ${L('legal')}
          </div>
          <div class="pf-legal-cards">
            <button class="pf-legal-item" onclick="ALHYDRA.app.navigateTo('privacy')">
              <div class="pf-legal-item-icon" style="--lc:#10B981">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div class="pf-legal-item-body">
                <div class="pf-legal-item-title">${L('viewPrivacy')}</div>
                <div class="pf-legal-item-desc">${L('privacyDesc')}</div>
              </div>
              <i class="fa-solid fa-chevron-right pf-legal-item-arrow"></i>
            </button>
            <button class="pf-legal-item" onclick="ALHYDRA.app.navigateTo('terms')">
              <div class="pf-legal-item-icon" style="--lc:#06B6D4">
                <i class="fa-solid fa-file-contract"></i>
              </div>
              <div class="pf-legal-item-body">
                <div class="pf-legal-item-title">${L('viewTerms')}</div>
                <div class="pf-legal-item-desc">${L('termsDesc')}</div>
              </div>
              <i class="fa-solid fa-chevron-right pf-legal-item-arrow"></i>
            </button>
          </div>
        </div>

      </div>`;
  }

  /* ── EDIT mode ─────────────────────────── */
  function renderEdit() {
    return `
      <div class="pf-card pf-edit-card">
        <div class="pf-avatar-col">
          <div class="pf-avatar pf-avatar-lg" id="pf-avatar">${avatarHtml()}</div>
          <div class="pf-emoji-row">${EMOJIS.map(e =>
            `<button class="pf-emoji-btn" type="button" onclick="ALHYDRA.profile.pickEmoji('${e}')">${e}</button>`
          ).join('')}</div>
          <label class="pf-upload-label">
            <i class="fa-solid fa-upload"></i> ${L('upload')}
            <input type="file" accept="image/*" onchange="ALHYDRA.profile.onFile(event)" hidden />
          </label>
        </div>
        <div class="pf-form-col">
          <div class="sf-group">
            <label>${L('displayName')}</label>
            <input type="text" id="pf-name" value="${escapeHtml(profile.name)}" />
          </div>
          <div class="sf-group">
            <label>${L('bio')}</label>
            <input type="text" id="pf-bio" value="${escapeHtml(profile.bio)}" placeholder="Algae researcher…" />
          </div>
          <div class="sf-group">
            <label>${L('location')}</label>
            <input type="text" id="pf-loc" value="${escapeHtml(profile.location)}" placeholder="Jakarta, ID" />
          </div>
          <div class="pf-form-actions">
            <button class="btn-primary" onclick="ALHYDRA.profile.save()">
              <i class="fa-solid fa-floppy-disk"></i> ${L('save')}
            </button>
            <button class="btn-secondary" onclick="ALHYDRA.profile.cancelEdit()">
              ${L('cancel')}
            </button>
          </div>
        </div>
      </div>`;
  }

  function render() {
    const host = document.getElementById('profile-body');
    if (!host) return;
    host.innerHTML = editMode ? renderEdit() : renderView();
  }

  function startEdit()  { editMode = true;  render(); }
  function cancelEdit() { editMode = false; render(); }

  /* ── Avatar helpers ──────────────────────── */
  function pickEmoji(e) {
    profile.avatar = e;
    const el = document.getElementById('pf-avatar');
    if (el) el.innerHTML = `<span class="pf-emoji">${e}</span>`;
  }

  function onFile(ev) {
    const f = ev.target.files?.[0];
    if (!f) return;
    if (f.size > 600 * 1024) {
      ALHYDRA.app.toast(lang() === 'id' ? 'Gambar terlalu besar (maks 600KB)' : 'Image too large (max 600KB)', 'warning');
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      profile.avatar = r.result;
      const el = document.getElementById('pf-avatar');
      if (el) el.innerHTML = `<img src="${r.result}" alt="avatar" />`;
    };
    r.readAsDataURL(f);
  }

  /* ── Preferences actions ──────────────── */
  function toggleTheme() {
    // Delegate to app.js theme system if available
    if (ALHYDRA.app?.applyTheme) {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      ALHYDRA.app.applyTheme(cur === 'dark' ? 'light' : 'dark');
    } else {
      const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('alhydra-theme', next); } catch (e) {}
      const mc = document.getElementById('meta-theme-color');
      if (mc) mc.setAttribute('content', next === 'light' ? '#EEF2F8' : '#0A0F1E');
      if (window.Chart?.instances) {
        try {
          if (typeof setupChartDefaults === 'function') setupChartDefaults();
        } catch (e) {}
        Object.values(Chart.instances).forEach(c => { try { c.update('none'); } catch (e) {} });
      }
    }
    render();
  }

  function setLang(code) {
    ALHYDRA.i18n?.set?.(code);
    render();
  }

  function copyUid() {
    const uid = profile.uid;
    if (!uid) return;
    navigator.clipboard?.writeText(uid)
      .then(() => ALHYDRA.app.toast(L('copied'), 'success', 1500))
      .catch(() => ALHYDRA.app.toast(uid, 'info', 4000));
  }

  /* ── Save ──────────────────────────────── */
  async function save() {
    const u = window.auth?.currentUser;
    if (!u) return;
    const patch = {
      name:     document.getElementById('pf-name')?.value.trim() || profile.name,
      bio:      document.getElementById('pf-bio')?.value.trim()  || '',
      location: document.getElementById('pf-loc')?.value.trim()  || '',
      avatar:   profile.avatar || '',
    };
    try {
      await window.db.collection('users').doc(u.uid).set(patch, { merge: true });
      if (patch.name !== u.displayName) await u.updateProfile({ displayName: patch.name }).catch(() => {});
      profile = { ...profile, ...patch };
      ALHYDRA.app.applyUserAvatar({ avatar: profile.avatar, photoURL: profile.photoURL, name: patch.name });
      const nameEl = document.getElementById('user-name-display');
      if (nameEl) nameEl.textContent = patch.name;
      ALHYDRA.app.toast(L('saved'), 'success');
      ALHYDRA.audit?.log('profile_update', { fields: Object.keys(patch) });
      ALHYDRA.onboarding?.refreshChecklist?.();
      editMode = false;
      render();
    } catch (e) {
      ALHYDRA.app.toast('Save failed: ' + e.message, 'error');
    }
  }

  function init() {
    window.addEventListener('alhydra:lang', () => {
      if (document.getElementById('view-profile')?.classList.contains('active')) render();
    });
  }

  return { init, onEnter, startEdit, cancelEdit, pickEmoji, onFile, save, toggleTheme, setLang, copyUid };
})();
