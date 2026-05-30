/* ─────────────────────────────────────────
   energy.js — Dynamic Energy Optimization +
   Automatic Backup System
   · Live generation/consumption balance (W)
   · Simulated battery State-of-Charge (SOC)
   · Auto-backup: switches to backup source on
     sustained deficit (writes energy/config → IoT reads)
   · Load-scheduling recommendations
   Bilingual (EN/ID). Config persisted in Firestore: energy/config
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.energy = (() => {
  const COLL = 'energy', DOC = 'config';

  let cfg = {
    mode: 'auto',              // 'auto' | 'renewable' | 'backup'
    backup_state: false,       // is backup source currently engaged
    backup_threshold_w: 40,    // deficit (W) that triggers auto-backup
    battery_capacity_wh: 1000, // simulated battery capacity
  };
  let unsub = null, timer = null, chart = null, started = false;
  let soc = 60;                // % state of charge (simulated)
  let deficitStreak = 0, surplusStreak = 0, lastTick = null;

  const labels = [], genBuf = [], consBuf = [];
  const MAX = 40;

  // ── i18n ───────────────────────────────
  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    title:       { en: 'Energy mode', id: 'Mode energi' },
    auto:        { en: 'Auto', id: 'Otomatis' },
    renewable:   { en: 'Renewable only', id: 'Hanya terbarukan' },
    backup:      { en: 'Backup', id: 'Cadangan' },
    generated:   { en: 'Generated', id: 'Dihasilkan' },
    consumed:    { en: 'Consumed', id: 'Dikonsumsi' },
    balance:     { en: 'Net balance', id: 'Selisih bersih' },
    surplus:     { en: 'Surplus', id: 'Surplus' },
    deficit:     { en: 'Deficit', id: 'Defisit' },
    soc:         { en: 'Battery (SOC)', id: 'Baterai (SOC)' },
    backupStatus:{ en: 'Backup source', id: 'Sumber cadangan' },
    engaged:     { en: 'ENGAGED', id: 'AKTIF' },
    standby:     { en: 'Standby', id: 'Siaga' },
    flow:        { en: 'Power flow (W)', id: 'Aliran daya (W)' },
    recs:        { en: 'Optimization & actions', id: 'Optimasi & tindakan' },
    threshold:   { en: 'Auto-backup deficit threshold (W)', id: 'Ambang defisit auto-cadangan (W)' },
    capacity:    { en: 'Battery capacity (Wh)', id: 'Kapasitas baterai (Wh)' },
    saveCfg:     { en: 'Save settings', id: 'Simpan pengaturan' },
    manualBackup:{ en: 'Manual backup override', id: 'Override cadangan manual' },
    autoNote:    { en: 'In Auto mode the system engages backup automatically on sustained deficit.', id: 'Pada mode Otomatis, sistem mengaktifkan cadangan otomatis saat defisit berkelanjutan.' },
    rSurplusPump:{ en: 'Surplus available — good time to run pumps / aeration.', id: 'Ada surplus — waktu tepat menjalankan pompa / aerasi.' },
    rSurplusChg: { en: 'Charging battery from renewable surplus.', id: 'Mengisi baterai dari surplus terbarukan.' },
    rDeficitShed:{ en: 'Deficit — defer non-critical loads (lights, extra pumps).', id: 'Defisit — tunda beban non-kritis (lampu, pompa tambahan).' },
    rDeficitBkp: { en: 'Sustained deficit — backup source recommended.', id: 'Defisit berkelanjutan — sumber cadangan disarankan.' },
    rLowSoc:     { en: 'Battery low — reduce load or engage grid/backup.', id: 'Baterai rendah — kurangi beban atau aktifkan jaringan/cadangan.' },
    rBalanced:   { en: 'System balanced — no action needed. 🎉', id: 'Sistem seimbang — tidak perlu tindakan. 🎉' },
    rDayHarvest: { en: 'Daylight + generation high — schedule heavy tasks now.', id: 'Siang + generasi tinggi — jadwalkan tugas berat sekarang.' },
  };
  function L(k){ const s=T[k]; return s ? (s[lang()]||s.en) : k; }

  // ── Live sensor reads (from dashboard DOM) ──
  function num(id){ const el=document.getElementById(id); if(!el) return null; const n=parseFloat(el.textContent); return isNaN(n)?null:n; }
  function watts(){
    const v = 220; // reference voltage
    const gA = num('val-current_gen') ?? 0;
    const cA = num('val-current_cons') ?? 0;
    return { gen: gA*v, cons: cA*v, bal: (gA-cA)*v };
  }

  // ── Firestore config ───────────────────
  function subscribe(){
    unsub?.();
    try {
      unsub = window.db.collection(COLL).doc(DOC).onSnapshot(snap=>{
        if (snap.exists) cfg = { ...cfg, ...snap.data() };
        render();
      }, err=>console.warn('[energy]',err));
    } catch(e){ console.warn('[energy] subscribe',e); }
  }
  async function saveConfig(patch, quiet){
    cfg = { ...cfg, ...patch };
    try {
      await window.db.collection(COLL).doc(DOC).set({
        ...patch,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_by: window.auth?.currentUser?.email || 'web',
      }, { merge:true });
      if(!quiet) ALHYDRA.app.toast(lang()==='id'?'Pengaturan energi disimpan':'Energy settings saved','success');
    } catch(e){ ALHYDRA.app.toast('Save failed: '+e.message,'error'); }
  }

  function setMode(m){
    const patch = { mode:m };
    if (m==='renewable') patch.backup_state=false;
    if (m==='backup')    patch.backup_state=true;
    saveConfig(patch);
    render();
  }
  function toggleManualBackup(on){ saveConfig({ backup_state:on }); }
  function saveAdvanced(){
    const th = parseFloat(document.getElementById('en-threshold')?.value);
    const cap= parseFloat(document.getElementById('en-capacity')?.value);
    saveConfig({
      backup_threshold_w: isNaN(th)?cfg.backup_threshold_w:th,
      battery_capacity_wh: isNaN(cap)?cfg.battery_capacity_wh:cap,
    });
  }

  // ── Core evaluation (tick) ─────────────
  function evaluate(){
    const w = watts();
    const now = Date.now();
    const dt = lastTick ? (now-lastTick)/1000 : 0;
    lastTick = now;

    // Simulate SOC from net energy (charge on surplus, discharge on deficit/backup use)
    if (dt>0 && dt<30){
      const netWh = w.bal * dt/3600;
      const dPct  = (netWh / (cfg.battery_capacity_wh||1000)) * 100;
      soc = Math.max(0, Math.min(100, soc + dPct));
      try { localStorage.setItem('alhydra_soc', soc.toFixed(2)); } catch(e){}
    }

    // Streaks for hysteresis
    if (w.bal < -(cfg.backup_threshold_w||40)) { deficitStreak++; surplusStreak=0; }
    else if (w.bal >= 0) { surplusStreak++; deficitStreak=0; }
    else { deficitStreak=Math.max(0,deficitStreak-1); }

    // Auto-backup logic
    if (cfg.mode==='auto'){
      if ((deficitStreak>=3 || soc<15) && !cfg.backup_state){
        saveConfig({ backup_state:true }, true);
        ALHYDRA.app.addNotification?.(lang()==='id'?'⚡ Cadangan aktif':'⚡ Backup engaged',
          lang()==='id'?'Defisit energi berkelanjutan terdeteksi':'Sustained energy deficit detected','warning');
        ALHYDRA.app.toast(lang()==='id'?'Sistem cadangan diaktifkan otomatis':'Backup auto-engaged','warning');
      } else if (surplusStreak>=3 && soc>25 && cfg.backup_state){
        saveConfig({ backup_state:false }, true);
        ALHYDRA.app.addNotification?.(lang()==='id'?'🌿 Kembali ke terbarukan':'🌿 Back to renewable',
          lang()==='id'?'Surplus energi pulih':'Energy surplus restored','info');
      }
    }

    // Rolling chart buffer
    const ts = new Date().toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'});
    labels.push(ts); genBuf.push(Math.round(w.gen)); consBuf.push(Math.round(w.cons));
    if (labels.length>MAX){ labels.shift(); genBuf.shift(); consBuf.shift(); }
    if (chart){ chart.data.labels=[...labels]; chart.data.datasets[0].data=[...genBuf]; chart.data.datasets[1].data=[...consBuf]; chart.update('none'); }

    render();
  }

  function recommendations(){
    const w = watts(); const out=[];
    const light = num('val-light');
    if (w.bal >= cfg.backup_threshold_w){ out.push({ok:true,t:L('rSurplusPump')}); out.push({ok:true,t:L('rSurplusChg')}); }
    if (light!=null && light>3000 && w.gen>w.cons){ out.push({ok:true,t:L('rDayHarvest')}); }
    if (w.bal < 0 && w.bal >= -(cfg.backup_threshold_w)){ out.push({ok:false,t:L('rDeficitShed')}); }
    if (deficitStreak>=3 || w.bal < -(cfg.backup_threshold_w)){ out.push({ok:false,t:L('rDeficitBkp')}); }
    if (soc<20){ out.push({ok:false,t:L('rLowSoc')}); }
    if (!out.length) out.push({ok:true,t:L('rBalanced')});
    return out;
  }

  // ── Render ─────────────────────────────
  function render(){
    const w = watts();
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };

    set('en-gen',  Math.round(w.gen)+' W');
    set('en-cons', Math.round(w.cons)+' W');
    const balEl=document.getElementById('en-balance');
    if (balEl){ balEl.textContent=(w.bal>=0?'+':'')+Math.round(w.bal)+' W'; balEl.style.color=w.bal>=0?'var(--green)':'var(--red)'; }
    set('en-balance-tag', w.bal>=0?L('surplus'):L('deficit'));

    set('en-soc', Math.round(soc)+'%');
    const socBar=document.getElementById('en-soc-bar');
    if (socBar){ socBar.style.width=soc+'%'; socBar.style.background = soc>50?'var(--green)':soc>20?'var(--amber)':'var(--red)'; }

    const bk=document.getElementById('en-backup-status');
    if (bk){ bk.textContent = cfg.backup_state?L('engaged'):L('standby'); bk.className='en-backup-badge '+(cfg.backup_state?'on':'off'); }

    // mode buttons
    document.querySelectorAll('#en-mode-group [data-mode]').forEach(b=>{
      b.classList.toggle('active', b.dataset.mode===cfg.mode);
    });
    // manual override checkbox
    const mb=document.getElementById('en-manual-backup');
    if (mb){ mb.checked=!!cfg.backup_state; mb.disabled = cfg.mode==='auto'; }
    // advanced inputs
    const th=document.getElementById('en-threshold'); if (th && document.activeElement!==th) th.value=cfg.backup_threshold_w;
    const cap=document.getElementById('en-capacity'); if (cap && document.activeElement!==cap) cap.value=cfg.battery_capacity_wh;
    // labels that depend on language
    set('en-mode-title', L('title'));
    set('en-lbl-auto', L('auto')); set('en-lbl-renewable', L('renewable')); set('en-lbl-backup', L('backup'));
    set('en-lbl-gen', L('generated')); set('en-lbl-cons', L('consumed')); set('en-lbl-balance', L('balance'));
    set('en-lbl-soc', L('soc')); set('en-lbl-backup-status', L('backupStatus'));
    set('en-lbl-flow', L('flow')); set('en-lbl-recs', L('recs'));
    set('en-lbl-threshold', L('threshold')); set('en-lbl-capacity', L('capacity'));
    set('en-lbl-manual', L('manualBackup')); set('en-autonote', L('autoNote'));
    const sc=document.getElementById('en-save-cfg'); if (sc) sc.lastChild && (sc.lastChild.textContent=' '+L('saveCfg'));

    // recommendations
    const rc=document.getElementById('en-recs');
    if (rc){ rc.innerHTML = recommendations().map(r=>`<div class="ad-rec ${r.ok?'ok':'warn'}"><i class="fa-solid ${r.ok?'fa-circle-check':'fa-triangle-exclamation'}"></i> ${r.t}</div>`).join(''); }
  }

  function buildChart(){
    const c=document.getElementById('en-flow-chart'); if(!c) return;
    if (chart) chart.destroy();
    chart=new Chart(c,{ type:'line',
      data:{ labels:[...labels], datasets:[
        { label:'Gen (W)', data:[...genBuf], borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.12)', borderWidth:2, pointRadius:0, fill:true, tension:0.4 },
        { label:'Cons (W)', data:[...consBuf], borderColor:'#F59E0B', backgroundColor:'rgba(245,158,11,0.12)', borderWidth:2, pointRadius:0, fill:true, tension:0.4 },
      ]},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:true, labels:{ boxWidth:12, font:{size:11} } }, tooltip:{ mode:'index', intersect:false } },
        scales:{ x:{ display:false }, y:{ ticks:{ maxTicksLimit:5, callback:v=>v+'W' } } } }
    });
  }

  // ── Lifecycle ──────────────────────────
  function onEnter(){
    if (!started){
      started=true;
      try { soc = parseFloat(localStorage.getItem('alhydra_soc')); if(isNaN(soc)) soc=60; } catch(e){ soc=60; }
      subscribe(); buildChart(); evaluate();
      timer = setInterval(evaluate, 3000);
    } else { buildChart(); render(); }
  }
  function getState(){ const w=watts(); return { mode:cfg.mode, backup:cfg.backup_state, soc:Math.round(soc), balanceW:Math.round(w.bal) }; }
  function init(){ window.addEventListener('alhydra:lang', render); }

  return { init, onEnter, setMode, toggleManualBackup, saveAdvanced, getState };
})();
