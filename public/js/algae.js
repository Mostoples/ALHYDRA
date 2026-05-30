/* ─────────────────────────────────────────
   algae.js — Microalgae Cultivation Management
   · Culture/batch CRUD (Firestore: algae_cultures)
   · Cell-density tracking + growth-phase model
     (specific growth rate μ, doubling time)
   · Harvest prediction & readiness
   · Per-culture growth chart (Chart.js)
   · Sensor-based recommendations vs species optima
   Bilingual (EN/ID) via local L() — re-renders on lang change.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.algae = (() => {

  const COLL = 'algae_cultures';

  // ── Species presets (optimal ranges from literature) ──
  // td = reference doubling time (days). density unit: ×10⁶ cells/mL.
  const SPECIES = {
    chlorella:     { name: 'Chlorella vulgaris',        ph: [6.0, 8.0],  temp: [25, 30], light: [2000, 8000],  td: 1.0, color: '#10B981', use_en: 'Biomass, supplement, feed', use_id: 'Biomassa, suplemen, pakan' },
    spirulina:     { name: 'Spirulina (Arthrospira)',   ph: [8.5, 10.5], temp: [30, 35], light: [2000, 6000],  td: 1.5, color: '#0E9488', use_en: 'Protein supplement',        use_id: 'Suplemen protein' },
    nannochloropsis:{ name: 'Nannochloropsis',          ph: [7.5, 8.5],  temp: [20, 25], light: [1500, 5000],  td: 1.8, color: '#06B6D4', use_en: 'Biodiesel, omega-3',       use_id: 'Biodiesel, omega-3' },
    dunaliella:    { name: 'Dunaliella salina',         ph: [7.0, 9.0],  temp: [20, 30], light: [3000, 10000], td: 2.0, color: '#F59E0B', use_en: 'β-carotene',              use_id: 'β-karoten' },
    haematococcus: { name: 'Haematococcus pluvialis',   ph: [7.0, 7.8],  temp: [20, 25], light: [1000, 4000],  td: 3.0, color: '#EF4444', use_en: 'Astaxanthin',             use_id: 'Astaxanthin' },
    scenedesmus:   { name: 'Scenedesmus sp.',           ph: [6.5, 8.5],  temp: [25, 30], light: [2000, 7000],  td: 1.2, color: '#8B5CF6', use_en: 'Biomass, bioremediation', use_id: 'Biomassa, bioremediasi' },
  };

  let cultures = [];
  let unsub = null;
  let growthChart = null;
  let openId = null;

  // ── i18n helper ────────────────────────
  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const STR = {
    active:        { en: 'Active',        id: 'Aktif' },
    harvested:     { en: 'Harvested',     id: 'Dipanen' },
    contaminated:  { en: 'Contaminated',  id: 'Terkontaminasi' },
    lag:           { en: 'Lag phase',     id: 'Fase lag' },
    exponential:   { en: 'Exponential',   id: 'Eksponensial' },
    late_exp:      { en: 'Late exponential', id: 'Eksponensial akhir' },
    stationary:    { en: 'Stationary',    id: 'Stasioner' },
    decline:       { en: 'Decline',       id: 'Menurun' },
    unknown:       { en: 'Awaiting data', id: 'Menunggu data' },
    days:          { en: 'days',          id: 'hari' },
    day:           { en: 'd',             id: 'h' },
    density:       { en: 'Density',       id: 'Kepadatan' },
    phase:         { en: 'Phase',         id: 'Fase' },
    age:           { en: 'Age',           id: 'Umur' },
    volume:        { en: 'Volume',        id: 'Volume' },
    target:        { en: 'Target',        id: 'Target' },
    toHarvest:     { en: 'Est. harvest',  id: 'Perk. panen' },
    ready:         { en: 'Ready to harvest', id: 'Siap panen' },
    doubling:      { en: 'Doubling time', id: 'Waktu gandakan' },
    log:           { en: 'Log reading',   id: 'Catat ukur' },
    harvest:       { en: 'Harvest',       id: 'Panen' },
    del:           { en: 'Delete',        id: 'Hapus' },
    measurements:  { en: 'Measurements',  id: 'Pengukuran' },
    noMeas:        { en: 'No measurements yet — log the first reading.', id: 'Belum ada pengukuran — catat ukur pertama.' },
    recs:          { en: 'Recommendations', id: 'Rekomendasi' },
    growthCurve:   { en: 'Growth curve',  id: 'Kurva pertumbuhan' },
    statActive:    { en: 'Active cultures', id: 'Kultur aktif' },
    statVolume:    { en: 'Total volume',  id: 'Total volume' },
    statReady:     { en: 'Ready to harvest', id: 'Siap panen' },
    statAvg:       { en: 'Avg. growth μ', id: 'Rata-rata μ' },
    emptyTitle:    { en: 'No cultures yet', id: 'Belum ada kultur' },
    emptyDesc:     { en: 'Add your first microalgae culture to start tracking growth.', id: 'Tambahkan kultur mikroalga pertama untuk mulai melacak pertumbuhan.' },
    addCulture:    { en: 'New Culture',   id: 'Kultur Baru' },
    species:       { en: 'Species',       id: 'Spesies' },
    strain:        { en: 'Strain / label', id: 'Galur / label' },
    vessel:        { en: 'Vessel / location', id: 'Wadah / lokasi' },
    startDate:     { en: 'Start date',    id: 'Tanggal mulai' },
    initDensity:   { en: 'Initial density (×10⁶ cells/mL)', id: 'Kepadatan awal (×10⁶ sel/mL)' },
    targetDensity: { en: 'Target density (×10⁶ cells/mL)', id: 'Target kepadatan (×10⁶ sel/mL)' },
    save:          { en: 'Save',          id: 'Simpan' },
    cancel:        { en: 'Cancel',        id: 'Batal' },
    optimal:       { en: 'Optimal', id: 'Optimal' },
    logTitle:      { en: 'Log measurement', id: 'Catat pengukuran' },
    densityNow:    { en: 'Cell density (×10⁶ cells/mL)', id: 'Kepadatan sel (×10⁶ sel/mL)' },
    fromTurb:      { en: 'Estimate from turbidity sensor', id: 'Estimasi dari sensor kekeruhan' },
    note:          { en: 'Note (optional)', id: 'Catatan (opsional)' },
    confirmDel:    { en: 'Delete this culture permanently?', id: 'Hapus kultur ini secara permanen?' },
    confirmHarv:   { en: 'Mark this culture as harvested?', id: 'Tandai kultur ini sebagai dipanen?' },
    good:          { en: 'within optimal range', id: 'dalam rentang optimal' },
    low:           { en: 'below optimal', id: 'di bawah optimal' },
    high:          { en: 'above optimal', id: 'di atas optimal' },
    allGood:       { en: 'All monitored parameters are within the optimal range for this species. 🎉', id: 'Semua parameter terpantau dalam rentang optimal untuk spesies ini. 🎉' },
    noSensor:      { en: 'Enable Demo Mode or connect sensors to see live recommendations.', id: 'Aktifkan Mode Demo atau hubungkan sensor untuk rekomendasi langsung.' },
  };
  function L(k) { const s = STR[k]; return s ? (s[lang()] || s.en) : k; }

  // ── Math / model ───────────────────────
  const dayMs = 86400000;
  function ageDays(c) {
    const start = c.start_date ? new Date(c.start_date) : null;
    if (!start) return 0;
    return Math.max(0, Math.round((Date.now() - start.getTime()) / dayMs));
  }
  function latestDensity(c) {
    const m = c.measurements || [];
    if (m.length) return m[m.length - 1].density;
    return c.init_density ?? null;
  }
  // Specific growth rate μ (per day) from last two points; doubling time td.
  function growth(c) {
    const m = (c.measurements || []).filter(x => x.density > 0);
    if (m.length < 2) return { mu: null, td: null, phase: 'unknown' };
    const a = m[m.length - 2], b = m[m.length - 1];
    const dt = (new Date(b.date) - new Date(a.date)) / dayMs;
    if (dt <= 0 || a.density <= 0) return { mu: null, td: null, phase: 'unknown' };
    const mu = Math.log(b.density / a.density) / dt;
    const td = mu > 0 ? Math.log(2) / mu : null;
    let phase;
    if (mu > 0.15) phase = 'exponential';
    else if (mu > 0.03) phase = 'late_exp';
    else if (mu >= -0.03) phase = 'stationary';
    else phase = 'decline';
    return { mu, td, phase };
  }
  // Days remaining to reach target at current μ.
  function daysToTarget(c) {
    const g = growth(c);
    const cur = latestDensity(c);
    const tgt = c.target_density;
    if (!g.mu || g.mu <= 0 || !cur || !tgt || cur >= tgt) return null;
    return Math.ceil(Math.log(tgt / cur) / g.mu);
  }
  function isReady(c) {
    const cur = latestDensity(c), tgt = c.target_density;
    const g = growth(c);
    if (cur && tgt && cur >= tgt * 0.95) return true;
    if (g.phase === 'stationary' && cur && tgt && cur >= tgt * 0.8) return true;
    return false;
  }

  // Estimate dry biomass (kg) across active cultures.
  // Conversion: ~0.1 g/L dry weight per (×10⁶ cells/mL). Editable concept.
  const G_PER_DENSITY_L = 0.1;
  function getBiomassEstimate() {
    let kg = 0; const byCulture = [];
    cultures.filter(c => c.status === 'active').forEach(c => {
      const dens = latestDensity(c); const vol = parseFloat(c.volume_l) || 0;
      if (dens && vol) {
        const grams = dens * G_PER_DENSITY_L * vol; // density × g/L × L
        kg += grams / 1000;
        byCulture.push({ id: c.id, name: (SPECIES[c.species]?.name || c.species), kg: grams / 1000 });
      }
    });
    return { kg, byCulture };
  }

  // ── Live sensor snapshot from dashboard DOM ──
  function liveSensors() {
    const get = id => { const el = document.getElementById('val-' + id); if (!el) return null; const n = parseFloat(el.textContent); return isNaN(n) ? null : n; };
    return { ph: get('ph'), temp_water: get('temp_water'), light: get('light'), turbidity: get('turbidity') };
  }
  function recommendations(c) {
    const sp = SPECIES[c.species]; if (!sp) return [];
    const s = liveSensors();
    const out = [];
    const chk = (label, val, range, unit) => {
      if (val == null) return;
      if (val < range[0]) out.push({ ok: false, t: `${label}: ${val}${unit} — ${L('low')} (${L('optimal')} ${range[0]}–${range[1]}${unit})` });
      else if (val > range[1]) out.push({ ok: false, t: `${label}: ${val}${unit} — ${L('high')} (${L('optimal')} ${range[0]}–${range[1]}${unit})` });
      else out.push({ ok: true, t: `${label}: ${val}${unit} — ${L('good')}` });
    };
    chk('pH', s.ph, sp.ph, '');
    chk(lang() === 'id' ? 'Suhu air' : 'Water temp', s.temp_water, sp.temp, '°C');
    chk(lang() === 'id' ? 'Cahaya' : 'Light', s.light, sp.light, ' lx');
    if (!out.length) return [{ ok: true, t: L('noSensor') }];
    return out;
  }

  // ── Firestore ──────────────────────────
  function subscribe() {
    unsub?.();
    try {
      unsub = window.db.collection(COLL).orderBy('created_at', 'desc').onSnapshot(snap => {
        cultures = [];
        snap.forEach(doc => cultures.push({ id: doc.id, ...doc.data() }));
        render();
        if (openId) renderDetail(openId); // refresh open modal
      }, err => console.warn('[algae] listener', err));
    } catch (e) { console.warn('[algae] subscribe', e); }
  }

  async function saveNew(data) {
    try {
      await window.db.collection(COLL).add({
        ...data,
        measurements: data.init_density ? [{ date: data.start_date, density: data.init_density, note: 'inoculation' }] : [],
        status: 'active',
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        owner: window.auth.currentUser?.email || 'unknown',
      });
      ALHYDRA.app.toast(lang() === 'id' ? 'Kultur ditambahkan!' : 'Culture added!', 'success');
      closeModal();
    } catch (e) { ALHYDRA.app.toast('Save failed: ' + e.message, 'error'); }
  }

  async function addMeasurement(id, density, note) {
    const c = cultures.find(x => x.id === id); if (!c) return;
    const m = (c.measurements || []).slice();
    m.push({ date: new Date().toISOString(), density, note: note || '' });
    try {
      await window.db.collection(COLL).doc(id).update({ measurements: m });
      ALHYDRA.app.toast(lang() === 'id' ? 'Pengukuran dicatat' : 'Measurement logged', 'success');
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  async function harvest(id) {
    if (!confirm(L('confirmHarv'))) return;
    try {
      await window.db.collection(COLL).doc(id).update({
        status: 'harvested',
        harvested_date: new Date().toISOString(),
      });
      ALHYDRA.app.toast(lang() === 'id' ? 'Ditandai dipanen' : 'Marked as harvested', 'success');
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  async function remove(id) {
    if (!confirm(L('confirmDel'))) return;
    try {
      await window.db.collection(COLL).doc(id).delete();
      ALHYDRA.app.toast(lang() === 'id' ? 'Kultur dihapus' : 'Culture deleted', 'info');
      if (openId === id) closeModal();
    } catch (e) { ALHYDRA.app.toast('Failed: ' + e.message, 'error'); }
  }

  // ── Render: stats ──────────────────────
  function renderStats() {
    const el = document.getElementById('algae-stats'); if (!el) return;
    const active = cultures.filter(c => c.status === 'active');
    const vol = active.reduce((s, c) => s + (parseFloat(c.volume_l) || 0), 0);
    const ready = active.filter(isReady).length;
    const mus = active.map(growth).map(g => g.mu).filter(v => v != null);
    const avgMu = mus.length ? (mus.reduce((s, v) => s + v, 0) / mus.length) : null;
    const tile = (icon, color, val, label) => `
      <div class="algae-stat">
        <div class="as-ic" style="--c:${color}"><i class="fa-solid ${icon}"></i></div>
        <div><div class="as-val">${val}</div><div class="as-label">${label}</div></div>
      </div>`;
    el.innerHTML =
      tile('fa-bacterium', '#10B981', active.length, L('statActive')) +
      tile('fa-flask', '#06B6D4', vol.toFixed(1) + ' L', L('statVolume')) +
      tile('fa-wheat-awn', '#F59E0B', ready, L('statReady')) +
      tile('fa-arrow-trend-up', '#8B5CF6', avgMu == null ? '—' : avgMu.toFixed(2) + '/' + L('day'), L('statAvg'));
  }

  // ── Render: culture cards ──────────────
  function statusBadge(c) {
    const map = { active: 'good', harvested: 'info', contaminated: 'danger' };
    const cls = map[c.status] || 'info';
    return `<span class="algae-badge ${cls}">${L(c.status)}</span>`;
  }

  function render() {
    renderStats();
    const grid = document.getElementById('algae-grid');
    const empty = document.getElementById('algae-empty');
    if (!grid) return;
    if (!cultures.length) {
      grid.innerHTML = '';
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    grid.innerHTML = cultures.map(c => {
      const sp = SPECIES[c.species] || { name: c.species, color: '#10B981' };
      const g = growth(c);
      const cur = latestDensity(c);
      const tgt = c.target_density;
      const pct = (cur && tgt) ? Math.min(100, (cur / tgt) * 100) : 0;
      const ready = c.status === 'active' && isReady(c);
      const dtt = daysToTarget(c);
      return `
        <div class="algae-card" style="--c:${sp.color}" onclick="ALHYDRA.algae.openDetail('${c.id}')">
          <div class="ac-top">
            <div class="ac-ic"><i class="fa-solid fa-bacterium"></i></div>
            <div class="ac-head">
              <div class="ac-name">${sp.name}</div>
              <div class="ac-sub">${c.strain ? c.strain + ' · ' : ''}${c.vessel || ''}</div>
            </div>
            ${statusBadge(c)}
          </div>
          <div class="ac-density">
            <span class="ac-dval">${cur != null ? cur : '—'}</span>
            <span class="ac-dunit">×10⁶ ${lang() === 'id' ? 'sel/mL' : 'cells/mL'}</span>
            ${ready ? `<span class="ac-ready"><i class="fa-solid fa-wheat-awn"></i> ${L('ready')}</span>` : ''}
          </div>
          <div class="ac-bar-track"><div class="ac-bar-fill" style="width:${pct.toFixed(0)}%"></div></div>
          <div class="ac-meta">
            <span><i class="fa-solid fa-seedling"></i> ${L('phase')}: <b>${L(g.phase)}</b></span>
            <span><i class="fa-solid fa-clock"></i> ${L('age')}: <b>${ageDays(c)} ${L('days')}</b></span>
            ${dtt != null ? `<span><i class="fa-solid fa-wheat-awn"></i> ${L('toHarvest')}: <b>~${dtt} ${L('days')}</b></span>` : ''}
            <span><i class="fa-solid fa-flask"></i> ${c.volume_l || '—'} L</span>
          </div>
        </div>`;
    }).join('');
  }

  // ── Modal helpers ──────────────────────
  function ensureModal() {
    let m = document.getElementById('algae-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'algae-modal';
    m.className = 'enc-modal';
    m.innerHTML = `
      <div class="enc-modal-box" style="max-width:620px">
        <div class="enc-modal-header-bar">
          <span id="algae-modal-title" style="font-size:14px;font-weight:700;color:var(--text-primary)"></span>
          <button onclick="ALHYDRA.algae.closeModal()" title="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="algae-modal-content" class="enc-modal-content"></div>
      </div>`;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    return m;
  }
  function openModal(title, html) {
    const m = ensureModal();
    document.getElementById('algae-modal-title').textContent = title;
    document.getElementById('algae-modal-content').innerHTML = html;
    m.classList.add('open');
  }
  function closeModal() {
    document.getElementById('algae-modal')?.classList.remove('open');
    openId = null;
    if (growthChart) { growthChart.destroy(); growthChart = null; }
  }

  // ── Add-culture form ───────────────────
  function openAdd() {
    const opts = Object.keys(SPECIES).map(k =>
      `<option value="${k}">${SPECIES[k].name}</option>`).join('');
    const today = new Date().toISOString().slice(0, 10);
    openModal(L('addCulture'), `
      <div class="algae-form">
        <div class="sf-group">
          <label>${L('species')}</label>
          <select id="alg-species">${opts}</select>
        </div>
        <div class="sf-row-2">
          <div class="sf-group"><label>${L('strain')}</label><input type="text" id="alg-strain" placeholder="CV-01" /></div>
          <div class="sf-group"><label>${L('vessel')}</label><input type="text" id="alg-vessel" placeholder="PBR-1 / Tower A" /></div>
        </div>
        <div class="sf-row-2">
          <div class="sf-group"><label>${L('startDate')}</label><input type="date" id="alg-start" value="${today}" /></div>
          <div class="sf-group"><label>${L('volume')} (L)</label><input type="number" id="alg-volume" step="0.1" placeholder="10" /></div>
        </div>
        <div class="sf-row-2">
          <div class="sf-group"><label>${L('initDensity')}</label><input type="number" id="alg-init" step="0.01" placeholder="0.5" /></div>
          <div class="sf-group"><label>${L('targetDensity')}</label><input type="number" id="alg-target" step="0.1" placeholder="20" /></div>
        </div>
        <div id="alg-species-hint" class="algae-hint"></div>
        <div class="algae-form-actions">
          <button class="btn-secondary" onclick="ALHYDRA.algae.closeModal()">${L('cancel')}</button>
          <button class="btn-primary" onclick="ALHYDRA.algae.submitNew()"><i class="fa-solid fa-floppy-disk"></i> ${L('save')}</button>
        </div>
      </div>`);
    const sel = document.getElementById('alg-species');
    const hint = () => {
      const sp = SPECIES[sel.value];
      document.getElementById('alg-species-hint').innerHTML = sp ?
        `<i class="fa-solid fa-circle-info"></i> ${L('optimal')}: pH ${sp.ph[0]}–${sp.ph[1]} · ${sp.temp[0]}–${sp.temp[1]}°C · ${sp.light[0]}–${sp.light[1]} lx · ${lang() === 'id' ? sp.use_id : sp.use_en}` : '';
    };
    sel.addEventListener('change', hint); hint();
  }

  function submitNew() {
    const v = id => document.getElementById(id)?.value;
    const num = id => { const n = parseFloat(v(id)); return isNaN(n) ? null : n; };
    const species = v('alg-species');
    if (!species) { ALHYDRA.app.toast(lang() === 'id' ? 'Pilih spesies' : 'Choose a species', 'warning'); return; }
    saveNew({
      species,
      species_name: SPECIES[species]?.name || species,
      strain: v('alg-strain') || '',
      vessel: v('alg-vessel') || '',
      start_date: v('alg-start') ? new Date(v('alg-start')).toISOString() : new Date().toISOString(),
      volume_l: num('alg-volume'),
      init_density: num('alg-init'),
      target_density: num('alg-target'),
    });
  }

  // ── Detail view ────────────────────────
  function openDetail(id) { openId = id; renderDetail(id); }

  function renderDetail(id) {
    const c = cultures.find(x => x.id === id); if (!c) return;
    const sp = SPECIES[c.species] || { name: c.species, color: '#10B981', ph: [], temp: [], light: [] };
    const g = growth(c);
    const cur = latestDensity(c);
    const dtt = daysToTarget(c);
    const meas = (c.measurements || []);

    const stat = (label, val) => `<div class="ad-stat"><span class="ad-l">${label}</span><span class="ad-v">${val}</span></div>`;
    const recs = recommendations(c);

    openModal(sp.name + (c.strain ? ' · ' + c.strain : ''), `
      <div class="algae-detail">
        <div class="ad-stats">
          ${stat(L('density'), (cur != null ? cur : '—') + ' ×10⁶')}
          ${stat(L('phase'), L(g.phase))}
          ${stat(L('age'), ageDays(c) + ' ' + L('days'))}
          ${stat(L('volume'), (c.volume_l || '—') + ' L')}
          ${stat(L('target'), (c.target_density || '—') + ' ×10⁶')}
          ${stat(L('doubling'), g.td ? g.td.toFixed(1) + ' ' + L('days') : '—')}
          ${stat('μ', g.mu != null ? g.mu.toFixed(3) + '/' + L('day') : '—')}
          ${stat(L('toHarvest'), dtt != null ? '~' + dtt + ' ' + L('days') : (isReady(c) ? L('ready') : '—'))}
        </div>

        <div class="ad-section-title">${L('growthCurve')}</div>
        <div class="chart-container" style="height:200px">
          <canvas id="algae-growth-chart"></canvas>
        </div>

        <div class="ad-section-title">${L('recs')}</div>
        <div class="ad-recs">
          ${recs.map(r => `<div class="ad-rec ${r.ok ? 'ok' : 'warn'}"><i class="fa-solid ${r.ok ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> ${r.t}</div>`).join('')}
        </div>

        <div class="ad-section-title">${L('measurements')}</div>
        <div class="ad-meas">
          ${meas.length ? meas.slice().reverse().map(m => `
            <div class="ad-meas-row">
              <span>${new Date(m.date).toLocaleDateString()} ${new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <b>${m.density} ×10⁶</b>
              <span class="ad-meas-note">${m.note || ''}</span>
            </div>`).join('') : `<div class="ad-meas-empty">${L('noMeas')}</div>`}
        </div>

        <div class="algae-form-actions" style="flex-wrap:wrap">
          <button class="btn-primary" onclick="ALHYDRA.algae.openLog('${c.id}')"><i class="fa-solid fa-plus"></i> ${L('log')}</button>
          ${c.status === 'active' ? `<button class="btn-secondary" onclick="ALHYDRA.algae.harvest('${c.id}')"><i class="fa-solid fa-wheat-awn"></i> ${L('harvest')}</button>` : ''}
          <button class="btn-danger" onclick="ALHYDRA.algae.remove('${c.id}')"><i class="fa-solid fa-trash"></i> ${L('del')}</button>
        </div>
      </div>`);

    drawGrowthChart(c, sp);
  }

  function drawGrowthChart(c, sp) {
    const canvas = document.getElementById('algae-growth-chart'); if (!canvas) return;
    const meas = (c.measurements || []).filter(m => m.density > 0);
    const labels = meas.map(m => new Date(m.date).toLocaleDateString());
    const data = meas.map(m => m.density);
    // target reference line
    const tgt = c.target_density ? meas.map(() => c.target_density) : null;
    if (growthChart) growthChart.destroy();
    growthChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: L('density'), data, borderColor: sp.color, backgroundColor: sp.color + '22', borderWidth: 2, pointRadius: 3, fill: true, tension: 0.35 },
          ...(tgt ? [{ label: L('target'), data: tgt, borderColor: '#94A3B8', borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false }] : []),
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } }, x: { ticks: { maxTicksLimit: 6 } } },
      },
    });
  }

  // ── Log-measurement form ───────────────
  function openLog(id) {
    openModal(L('logTitle'), `
      <div class="algae-form">
        <div class="sf-group">
          <label>${L('densityNow')}</label>
          <input type="number" id="alg-log-density" step="0.01" placeholder="12.5" />
          <button class="btn-secondary sm" style="margin-top:8px" onclick="ALHYDRA.algae.fromTurbidity()"><i class="fa-solid fa-droplet"></i> ${L('fromTurb')}</button>
        </div>
        <div class="sf-group"><label>${L('note')}</label><input type="text" id="alg-log-note" placeholder="" /></div>
        <div class="algae-form-actions">
          <button class="btn-secondary" onclick="ALHYDRA.algae.openDetail('${id}')">${L('cancel')}</button>
          <button class="btn-primary" onclick="ALHYDRA.algae.submitLog('${id}')"><i class="fa-solid fa-floppy-disk"></i> ${L('save')}</button>
        </div>
      </div>`);
    openId = id;
  }

  // Rough density estimate from turbidity (NTU): empirical ~0.6 ×10⁶ cells/mL per NTU.
  function fromTurbidity() {
    const el = document.getElementById('val-turbidity');
    const ntu = el ? parseFloat(el.textContent) : NaN;
    const out = document.getElementById('alg-log-density');
    if (!isNaN(ntu) && out) {
      out.value = (ntu * 0.6).toFixed(2);
      ALHYDRA.app.toast(lang() === 'id' ? `Estimasi dari ${ntu} NTU` : `Estimated from ${ntu} NTU`, 'info');
    } else {
      ALHYDRA.app.toast(lang() === 'id' ? 'Sensor kekeruhan tidak tersedia' : 'Turbidity sensor unavailable', 'warning');
    }
  }

  function submitLog(id) {
    const d = parseFloat(document.getElementById('alg-log-density')?.value);
    if (isNaN(d)) { ALHYDRA.app.toast(lang() === 'id' ? 'Masukkan kepadatan' : 'Enter a density', 'warning'); return; }
    const note = document.getElementById('alg-log-note')?.value || '';
    addMeasurement(id, d, note).then(() => openDetail(id));
  }

  // ── Lifecycle ──────────────────────────
  let entered = false;
  function onEnter() { if (!entered) { entered = true; subscribe(); } else { render(); } }
  function init() {
    // re-render dynamic content when the language changes
    window.addEventListener('alhydra:lang', () => { render(); if (openId) renderDetail(openId); });
  }

  return { init, onEnter, openAdd, submitNew, openDetail, openLog, submitLog, fromTurbidity, harvest, remove, closeModal, getBiomassEstimate };
})();
