/* ─────────────────────────────────────────
   onboarding.js — First-use wizard + product tour
   + dashboard setup checklist.
   Bilingual via ALHYDRA.i18n. Persists to users/{uid}.onboarded
   and localStorage (alhydra_onboarded).
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.onboarding = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    welcome:    { en: 'Welcome to ALHYDRA', id: 'Selamat Datang di ALHYDRA' },
    welcomeSub: { en: 'Smart monitoring for your hybrid algae-hydroponic system. Let’s set things up in a few quick steps.', id: 'Pemantauan cerdas untuk sistem alga-hidroponik hibrida Anda. Mari atur dalam beberapa langkah singkat.' },
    chooseLang: { en: 'Choose your language', id: 'Pilih bahasa Anda' },
    chooseTheme:{ en: 'Choose your theme', id: 'Pilih tema Anda' },
    dark:       { en: 'Dark', id: 'Gelap' },
    light:      { en: 'Light', id: 'Terang' },
    goalQ:      { en: 'What best describes you?', id: 'Mana yang paling menggambarkan Anda?' },
    researcher: { en: 'Researcher', id: 'Peneliti' },
    farmer:     { en: 'Grower / Farmer', id: 'Pekebun / Petani' },
    student:    { en: 'Student', id: 'Pelajar' },
    hobbyist:   { en: 'Hobbyist', id: 'Penghobi' },
    demoTitle:  { en: 'Try it with sample data', id: 'Coba dengan data contoh' },
    demoSub:    { en: 'Enable Demo Mode to explore the dashboard with simulated live readings. You can turn it off anytime.', id: 'Aktifkan Mode Demo untuk menjelajah dasbor dengan data simulasi. Bisa dimatikan kapan saja.' },
    enableDemo: { en: 'Enable Demo Mode', id: 'Aktifkan Mode Demo' },
    skip:       { en: 'Skip', id: 'Lewati' },
    back:       { en: 'Back', id: 'Kembali' },
    next:       { en: 'Next', id: 'Lanjut' },
    finish:     { en: 'Start exploring', id: 'Mulai jelajahi' },
    startTour:  { en: 'Take a quick tour', id: 'Ikuti tur singkat' },
    step:       { en: 'Step', id: 'Langkah' },
    of:         { en: 'of', id: 'dari' },
    consent:    { en: 'By continuing you agree to our', id: 'Dengan melanjutkan Anda menyetujui' },
    privacy:    { en: 'Privacy Policy', id: 'Kebijakan Privasi' },
    and:        { en: 'and', id: 'dan' },
    terms:      { en: 'Terms', id: 'Ketentuan' },
    // tour
    tourNav:    { en: 'Navigate between all the tools here — dashboard, monitoring, microalgae, energy, AI and more.', id: 'Navigasi semua alat di sini — dasbor, pemantauan, mikroalga, energi, AI, dan lainnya.' },
    tourHero:   { en: 'Your live system snapshot: health score, energy, cultures and water level at a glance.', id: 'Ringkasan sistem langsung: skor kesehatan, energi, kultur, dan level air sekilas.' },
    tourTheme:  { en: 'Switch language, theme and aura anytime from here.', id: 'Ganti bahasa, tema, dan aura kapan saja dari sini.' },
    tourHelp:   { en: 'Stuck? The Quick Help button explains the current page, and the AI assistant answers questions.', id: 'Bingung? Tombol Bantuan Cepat menjelaskan halaman ini, dan asisten AI menjawab pertanyaan.' },
    tourDone:   { en: 'You’re all set! Explore freely — re-run this tour anytime from Quick Help.', id: 'Selesai! Jelajahi dengan bebas — ulangi tur kapan saja dari Bantuan Cepat.' },
    done:       { en: 'Got it', id: 'Mengerti' },
    // checklist
    clTitle:    { en: 'Complete your setup', id: 'Lengkapi pengaturan Anda' },
    clThresholds:{ en: 'Set alert thresholds', id: 'Atur ambang peringatan' },
    clCulture:  { en: 'Add a microalgae culture', id: 'Tambah kultur mikroalga' },
    clProfile:  { en: 'Complete your profile', id: 'Lengkapi profil Anda' },
    clIoT:      { en: 'Connect an IoT device (or use Demo)', id: 'Hubungkan perangkat IoT (atau pakai Demo)' },
    clDismiss:  { en: 'Dismiss', id: 'Tutup' },
    clDone:     { en: 'All set! 🎉', id: 'Semua beres! 🎉' },
  };
  function L(k) { const s = T[k]; return s ? (s[lang()] || s.en) : k; }

  const wiz = { step: 0, total: 5, goal: null };

  function isOnboarded() {
    try { if (localStorage.getItem('alhydra_onboarded') === '1') return true; } catch (e) {}
    return false;
  }
  function markOnboarded() {
    try { localStorage.setItem('alhydra_onboarded', '1'); } catch (e) {}
    const id = window.auth?.currentUser?.uid;
    if (id) window.db.collection('users').doc(id).set({ onboarded: true }, { merge: true }).catch(() => {});
    ALHYDRA.audit?.log('onboarding_complete', { goal: wiz.goal });
  }

  // ── Wizard ─────────────────────────────
  function ensureModal() {
    let m = document.getElementById('onb-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'onb-modal';
    m.innerHTML = `<div class="onb-box"><div id="onb-content"></div></div>`;
    document.body.appendChild(m);
    return m;
  }

  function open() {
    wiz.step = 0;
    ensureModal().classList.add('open');
    render();
  }
  function close() { document.getElementById('onb-modal')?.classList.remove('open'); }

  function render() {
    const c = document.getElementById('onb-content');
    if (!c) return;
    const dots = Array.from({ length: wiz.total }, (_, i) =>
      `<span class="onb-dot ${i === wiz.step ? 'active' : ''} ${i < wiz.step ? 'done' : ''}"></span>`).join('');
    let body = '';

    if (wiz.step === 0) {
      body = `
        <div class="onb-hero"><div class="onb-logo"><i class="fa-solid fa-leaf"></i></div></div>
        <h2 class="onb-title">${L('welcome')}</h2>
        <p class="onb-sub">${L('welcomeSub')}</p>`;
    } else if (wiz.step === 1) {
      const lg = lang();
      body = `
        <h2 class="onb-title">${L('chooseLang')}</h2>
        <div class="onb-choices">
          <button class="onb-choice ${lg === 'en' ? 'sel' : ''}" onclick="ALHYDRA.onboarding.pickLang('en')"><span class="onb-flag">🇬🇧</span> English</button>
          <button class="onb-choice ${lg === 'id' ? 'sel' : ''}" onclick="ALHYDRA.onboarding.pickLang('id')"><span class="onb-flag">🇮🇩</span> Indonesia</button>
        </div>`;
    } else if (wiz.step === 2) {
      const th = document.documentElement.getAttribute('data-theme') || 'dark';
      body = `
        <h2 class="onb-title">${L('chooseTheme')}</h2>
        <div class="onb-choices">
          <button class="onb-choice ${th === 'dark' ? 'sel' : ''}" onclick="ALHYDRA.onboarding.pickTheme('dark')"><span class="onb-flag">🌙</span> ${L('dark')}</button>
          <button class="onb-choice ${th === 'light' ? 'sel' : ''}" onclick="ALHYDRA.onboarding.pickTheme('light')"><span class="onb-flag">☀️</span> ${L('light')}</button>
        </div>`;
    } else if (wiz.step === 3) {
      const goals = [['researcher', '🔬'], ['farmer', '🌱'], ['student', '🎓'], ['hobbyist', '🪴']];
      body = `
        <h2 class="onb-title">${L('goalQ')}</h2>
        <div class="onb-choices grid">
          ${goals.map(([g, e]) => `<button class="onb-choice ${wiz.goal === g ? 'sel' : ''}" onclick="ALHYDRA.onboarding.pickGoal('${g}')"><span class="onb-flag">${e}</span> ${L(g)}</button>`).join('')}
        </div>`;
    } else if (wiz.step === 4) {
      body = `
        <div class="onb-hero"><div class="onb-logo" style="background:linear-gradient(135deg,#F59E0B,#EF4444)"><i class="fa-solid fa-flask"></i></div></div>
        <h2 class="onb-title">${L('demoTitle')}</h2>
        <p class="onb-sub">${L('demoSub')}</p>
        <button class="btn-primary full-width" style="margin-top:8px" onclick="ALHYDRA.onboarding.enableDemo()"><i class="fa-solid fa-flask"></i> ${L('enableDemo')}</button>
        <p class="onb-consent">${L('consent')} <a href="#privacy" onclick="ALHYDRA.onboarding._go('privacy')">${L('privacy')}</a> ${L('and')} <a href="#terms" onclick="ALHYDRA.onboarding._go('terms')">${L('terms')}</a>.</p>`;
    }

    const isLast = wiz.step === wiz.total - 1;
    c.innerHTML = `
      <button class="onb-skip" onclick="ALHYDRA.onboarding.finish(false)">${L('skip')}</button>
      <div class="onb-body">${body}</div>
      <div class="onb-foot">
        <div class="onb-dots">${dots}</div>
        <div class="onb-actions">
          ${wiz.step > 0 ? `<button class="btn-secondary sm" onclick="ALHYDRA.onboarding.prev()">${L('back')}</button>` : ''}
          ${isLast
            ? `<button class="btn-primary sm" onclick="ALHYDRA.onboarding.finish(true)">${L('finish')}</button>`
            : `<button class="btn-primary sm" onclick="ALHYDRA.onboarding.next()">${L('next')} <i class="fa-solid fa-arrow-right"></i></button>`}
        </div>
      </div>`;
  }

  function next() { if (wiz.step < wiz.total - 1) { wiz.step++; render(); } }
  function prev() { if (wiz.step > 0) { wiz.step--; render(); } }
  function pickLang(l) { ALHYDRA.i18n?.set(l); render(); }
  function pickTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('alhydra-theme', t); } catch (e) {}
    ALHYDRA.app?.toast?.(t === 'light' ? 'Light mode' : 'Dark mode', 'info', 1200);
    render();
  }
  function pickGoal(g) { wiz.goal = g; render(); }
  function enableDemo() {
    try { ALHYDRA.dashboard?.toggleSimulate?.(); } catch (e) {}
  }
  function _go(view) { close(); ALHYDRA.app?.navigateTo?.(view); }

  function finish(showTour) {
    markOnboarded();
    close();
    if (showTour) setTimeout(startTour, 350);
    refreshChecklist();
  }

  // ── Product tour (spotlight coachmarks) ──
  const tourSteps = [
    { sel: '#sidebar .sidebar-nav', key: 'tourNav', pos: 'right' },
    { sel: '#dash-hero', key: 'tourHero', pos: 'bottom' },
    { sel: '#theme-toggle', key: 'tourTheme', pos: 'bottom' },
    { sel: '#help-fab', key: 'tourHelp', pos: 'left' },
    { sel: null, key: 'tourDone', pos: 'center' },
  ];
  let tIdx = 0;

  function ensureTour() {
    let t = document.getElementById('tour-layer');
    if (t) return t;
    t = document.createElement('div');
    t.id = 'tour-layer';
    t.innerHTML = `<div id="tour-spot"></div><div id="tour-pop"></div>`;
    document.body.appendChild(t);
    return t;
  }
  function startTour() {
    // ensure dashboard is visible for the hero step
    ALHYDRA.app?.navigateTo?.('dashboard');
    tIdx = 0;
    ensureTour().classList.add('open');
    renderTour();
    ALHYDRA.audit?.log('tour_start');
  }
  function endTour() { document.getElementById('tour-layer')?.classList.remove('open'); }
  function tourNext() { if (tIdx < tourSteps.length - 1) { tIdx++; renderTour(); } else endTour(); }

  function renderTour() {
    const step = tourSteps[tIdx];
    const spot = document.getElementById('tour-spot');
    const pop  = document.getElementById('tour-pop');
    if (!spot || !pop) return;
    const el = step.sel ? document.querySelector(step.sel) : null;
    const isLast = tIdx === tourSteps.length - 1;

    if (el) {
      const r = el.getBoundingClientRect();
      const pad = 8;
      spot.style.cssText = `display:block;top:${r.top - pad}px;left:${r.left - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;`;
    } else {
      spot.style.display = 'none';
    }

    pop.innerHTML = `
      <div class="tour-text">${L(step.key)}</div>
      <div class="tour-foot">
        <span class="tour-count">${tIdx + 1} / ${tourSteps.length}</span>
        <button class="btn-primary sm" onclick="ALHYDRA.onboarding.tourNext()">${isLast ? L('done') : L('next')}</button>
      </div>
      <button class="tour-x" onclick="ALHYDRA.onboarding.endTour()" aria-label="Close">&times;</button>`;

    // position popover
    pop.style.cssText = 'display:block;';
    const pr = pop.getBoundingClientRect();
    let top, left;
    if (el && step.pos !== 'center') {
      const r = el.getBoundingClientRect();
      if (step.pos === 'right')  { top = r.top; left = Math.min(r.right + 16, window.innerWidth - pr.width - 12); }
      else if (step.pos === 'left')   { top = r.top - pr.height - 8 > 0 ? r.top : r.bottom + 12; left = Math.max(12, r.left - pr.width - 16); }
      else if (step.pos === 'bottom') { top = Math.min(r.bottom + 14, window.innerHeight - pr.height - 12); left = Math.min(Math.max(12, r.left), window.innerWidth - pr.width - 12); }
      else { top = r.bottom + 14; left = r.left; }
    } else {
      top = (window.innerHeight - pr.height) / 2;
      left = (window.innerWidth - pr.width) / 2;
    }
    pop.style.top = Math.max(12, top) + 'px';
    pop.style.left = Math.max(12, left) + 'px';
  }

  // ── Setup checklist (dashboard card) ───
  async function computeChecklist() {
    const items = [];
    // thresholds set?
    let thr = false;
    try { const s = await window.db.collection('settings').doc('thresholds').get(); thr = s.exists; } catch (e) {}
    // culture added?
    let cult = false;
    try { const s = await window.db.collection('algae_cultures').limit(1).get(); cult = !s.empty; } catch (e) {}
    // profile completed?
    let prof = false;
    try { const id = window.auth?.currentUser?.uid; if (id) { const s = await window.db.collection('users').doc(id).get(); prof = !!(s.exists && (s.data().bio || s.data().location || s.data().avatar)); } } catch (e) {}
    // IoT/demo: sensors/latest exists OR demo on
    let iot = false;
    try { const s = await window.db.collection('sensors').doc('latest').get(); iot = s.exists; } catch (e) {}
    items.push({ k: 'clThresholds', done: thr, view: 'settings' });
    items.push({ k: 'clCulture', done: cult, view: 'algae' });
    items.push({ k: 'clProfile', done: prof, view: 'profile' });
    items.push({ k: 'clIoT', done: iot, view: 'settings' });
    return items;
  }

  let dismissed = false;
  async function refreshChecklist() {
    const host = document.getElementById('setup-checklist');
    if (!host) return;
    try { dismissed = localStorage.getItem('alhydra_checklist_dismiss') === '1'; } catch (e) {}
    if (dismissed) { host.innerHTML = ''; host.style.display = 'none'; return; }
    const items = await computeChecklist();
    const doneN = items.filter(i => i.done).length;
    if (doneN === items.length) { host.innerHTML = ''; host.style.display = 'none'; return; }
    host.style.display = '';
    const pct = Math.round((doneN / items.length) * 100);
    host.innerHTML = `
      <div class="chk-head">
        <div><i class="fa-solid fa-list-check"></i> <b>${L('clTitle')}</b> <span class="chk-prog">${doneN}/${items.length}</span></div>
        <button class="chk-dismiss" onclick="ALHYDRA.onboarding.dismissChecklist()">${L('clDismiss')}</button>
      </div>
      <div class="chk-bar"><i style="width:${pct}%"></i></div>
      <div class="chk-items">
        ${items.map(i => `
          <button class="chk-item ${i.done ? 'done' : ''}" onclick="ALHYDRA.app.navigateTo('${i.view}')">
            <i class="fa-solid ${i.done ? 'fa-circle-check' : 'fa-circle'}"></i> ${L(i.k)}
          </button>`).join('')}
      </div>`;
  }
  function dismissChecklist() {
    try { localStorage.setItem('alhydra_checklist_dismiss', '1'); } catch (e) {}
    refreshChecklist();
    ALHYDRA.audit?.log('checklist_dismiss');
  }

  // ── Init ───────────────────────────────
  function init() {
    window.addEventListener('alhydra:lang', () => {
      if (document.getElementById('onb-modal')?.classList.contains('open')) render();
      if (document.getElementById('tour-layer')?.classList.contains('open')) renderTour();
      refreshChecklist();
    });
    window.addEventListener('resize', () => {
      if (document.getElementById('tour-layer')?.classList.contains('open')) renderTour();
    });
    // Trigger onboarding for new users (after a short settle).
    if (!isOnboarded()) setTimeout(open, 1200);
    refreshChecklist();
  }

  return {
    init, open, close, next, prev, pickLang, pickTheme, pickGoal, enableDemo, finish, _go,
    startTour, tourNext, endTour, refreshChecklist, dismissChecklist,
  };
})();
