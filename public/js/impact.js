/* ─────────────────────────────────────────
   impact.js — Environmental Impact Estimator
   Estimates: CO₂ avoided (renewable electricity),
   CO₂ captured (microalgae biomass), water saved
   (hydroponics vs soil), tree-equivalents.
   Editable assumptions persisted in localStorage.
   Bilingual (EN/ID).
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.impact = (() => {

  // Default factors (editable). Sources noted in UI as estimates.
  const DEF = {
    grid_ef:   0.79,   // kg CO₂ per kWh (Indonesia grid, approx)
    algae_co2: 1.83,   // kg CO₂ fixed per kg dry algae biomass
    tree_year: 21,     // kg CO₂ absorbed per tree per year
    hydro_pct: 85,     // % water saved vs conventional soil farming
    soil_water:300,    // L water per kg yield (soil) reference
  };
  let f = { ...DEF };
  let chart = null;

  function lang(){ return ALHYDRA.i18n?.current?.() || 'en'; }
  const T = {
    period:   { en:'Period', id:'Periode' },
    today:    { en:'Today', id:'Hari ini' },
    week:     { en:'7 days', id:'7 hari' },
    month:    { en:'30 days', id:'30 hari' },
    year:     { en:'1 year', id:'1 tahun' },
    inputs:   { en:'Inputs (auto-estimated, editable)', id:'Masukan (estimasi otomatis, dapat diubah)' },
    energyKwh:{ en:'Renewable energy generated (kWh)', id:'Energi terbarukan dihasilkan (kWh)' },
    biomass:  { en:'Algae biomass produced (kg dry)', id:'Biomassa alga diproduksi (kg kering)' },
    yield_:   { en:'Crop yield (kg)', id:'Hasil panen (kg)' },
    recalc:   { en:'Recalculate', id:'Hitung ulang' },
    co2Avoid: { en:'CO₂ avoided (energy)', id:'CO₂ dihindari (energi)' },
    co2Capt:  { en:'CO₂ captured (algae)', id:'CO₂ ditangkap (alga)' },
    co2Total: { en:'Total CO₂ impact', id:'Total dampak CO₂' },
    trees:    { en:'Tree-years equivalent', id:'Setara pohon-tahun' },
    water:    { en:'Water saved', id:'Air dihemat' },
    breakdown:{ en:'CO₂ breakdown', id:'Rincian CO₂' },
    assum:    { en:'Assumptions', id:'Asumsi' },
    gridEf:   { en:'Grid emission factor (kg CO₂/kWh)', id:'Faktor emisi jaringan (kg CO₂/kWh)' },
    algaeF:   { en:'Algae CO₂ fixation (kg/kg biomass)', id:'Fiksasi CO₂ alga (kg/kg biomassa)' },
    treeF:    { en:'CO₂ per tree-year (kg)', id:'CO₂ per pohon-tahun (kg)' },
    hydroF:   { en:'Hydroponic water saving (%)', id:'Penghematan air hidroponik (%)' },
    saveF:    { en:'Save assumptions', id:'Simpan asumsi' },
    resetF:   { en:'Reset', id:'Atur ulang' },
    note:     { en:'Figures are estimates for awareness/reporting, based on the editable factors above.', id:'Angka merupakan estimasi untuk kesadaran/pelaporan, berdasarkan faktor yang dapat diubah di atas.' },
    kg:       { en:'kg', id:'kg' },
    liters:   { en:'L', id:'L' },
  };
  function L(k){ const s=T[k]; return s?(s[lang()]||s.en):k; }

  let period = 7; // days

  // ── Auto-estimate inputs ───────────────
  async function estimateEnergy(days){
    // Sum current_gen*voltage over recent history; fall back to live × period.
    try {
      const from = new Date(Date.now() - days*86400000);
      const snap = await window.db.collection('sensor_history')
        .where('timestamp','>=',from).orderBy('timestamp','asc').limit(1000).get();
      const rows=[]; snap.forEach(d=>rows.push(d.data()));
      if (rows.length>=2){
        // average generation power (W), × hours in period
        const gs = rows.map(r=>(parseFloat(r.current_gen)||0)*(parseFloat(r.voltage)||220)).filter(v=>!isNaN(v));
        const avgW = gs.reduce((a,b)=>a+b,0)/gs.length;
        return (avgW * days*24) / 1000; // kWh
      }
    } catch(e){ /* fall through */ }
    // fallback: live reading
    const el=document.getElementById('val-current_gen');
    const gA = el ? (parseFloat(el.textContent)||0) : 0;
    return (gA*220 * days*24)/1000;
  }
  function estimateBiomass(){
    const b = ALHYDRA.algae?.getBiomassEstimate?.();
    return b?.kg ?? 0;
  }

  // ── Compute + render ───────────────────
  function compute(){
    const kwh   = parseFloat(document.getElementById('im-energy')?.value)||0;
    const bio   = parseFloat(document.getElementById('im-biomass')?.value)||0;
    const yld   = parseFloat(document.getElementById('im-yield')?.value)||0;

    const co2Energy = kwh * f.grid_ef;
    const co2Algae  = bio * f.algae_co2;
    const co2Total  = co2Energy + co2Algae;
    const trees     = co2Total / (f.tree_year||21);
    const waterSaved= yld * f.soil_water * (f.hydro_pct/100);

    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    const n=(x,d=1)=>x.toLocaleString(undefined,{maximumFractionDigits:d});

    set('im-co2-energy', n(co2Energy)+' '+L('kg'));
    set('im-co2-algae',  n(co2Algae)+' '+L('kg'));
    set('im-co2-total',  n(co2Total)+' '+L('kg'));
    set('im-trees',      n(trees,1));
    set('im-water',      n(waterSaved,0)+' '+L('liters'));

    drawChart(co2Energy, co2Algae);
  }

  function drawChart(a,b){
    const c=document.getElementById('im-chart'); if(!c) return;
    if (chart) chart.destroy();
    chart=new Chart(c,{ type:'doughnut',
      data:{ labels:[L('co2Avoid'),L('co2Capt')], datasets:[{ data:[Math.max(0,a),Math.max(0,b)], backgroundColor:['#10B981','#06B6D4'], borderWidth:0 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'62%',
        plugins:{ legend:{ display:true, position:'bottom', labels:{ boxWidth:12, font:{size:11} } } } }
    });
  }

  async function setPeriod(days){
    period = days;
    document.querySelectorAll('#im-period [data-days]').forEach(b=>b.classList.toggle('active', +b.dataset.days===days));
    const kwh = await estimateEnergy(days);
    const e=document.getElementById('im-energy'); if(e) e.value = kwh.toFixed(1);
    const b=document.getElementById('im-biomass'); if(b) b.value = estimateBiomass().toFixed(3);
    compute();
    refreshLabels();
  }

  function saveFactors(){
    f = {
      grid_ef:   parseFloat(document.getElementById('im-f-grid')?.value)||DEF.grid_ef,
      algae_co2: parseFloat(document.getElementById('im-f-algae')?.value)||DEF.algae_co2,
      tree_year: parseFloat(document.getElementById('im-f-tree')?.value)||DEF.tree_year,
      hydro_pct: parseFloat(document.getElementById('im-f-hydro')?.value)||DEF.hydro_pct,
      soil_water:DEF.soil_water,
    };
    try { localStorage.setItem('alhydra_impact_factors', JSON.stringify(f)); } catch(e){}
    compute();
    ALHYDRA.app.toast(lang()==='id'?'Asumsi disimpan':'Assumptions saved','success');
  }
  function resetFactors(){
    f={...DEF};
    try{ localStorage.removeItem('alhydra_impact_factors'); }catch(e){}
    fillFactors(); compute();
    ALHYDRA.app.toast(lang()==='id'?'Asumsi diatur ulang':'Assumptions reset','info');
  }
  function fillFactors(){
    const s=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v; };
    s('im-f-grid',f.grid_ef); s('im-f-algae',f.algae_co2); s('im-f-tree',f.tree_year); s('im-f-hydro',f.hydro_pct);
  }

  function refreshLabels(){
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    set('im-lbl-period',L('period')); set('im-lbl-inputs',L('inputs'));
    set('im-lbl-energy',L('energyKwh')); set('im-lbl-biomass',L('biomass')); set('im-lbl-yield',L('yield_'));
    set('im-lbl-co2-energy',L('co2Avoid')); set('im-lbl-co2-algae',L('co2Capt'));
    set('im-lbl-co2-total',L('co2Total')); set('im-lbl-trees',L('trees')); set('im-lbl-water',L('water'));
    set('im-lbl-breakdown',L('breakdown')); set('im-lbl-assum',L('assum'));
    set('im-lbl-f-grid',L('gridEf')); set('im-lbl-f-algae',L('algaeF')); set('im-lbl-f-tree',L('treeF')); set('im-lbl-f-hydro',L('hydroF'));
    set('im-note',L('note'));
    set('im-d-today',L('today')); set('im-d-week',L('week')); set('im-d-month',L('month')); set('im-d-year',L('year'));
    const rb=document.getElementById('im-recalc'); if(rb&&rb.lastChild) rb.lastChild.textContent=' '+L('recalc');
    const sf=document.getElementById('im-save-f'); if(sf&&sf.lastChild) sf.lastChild.textContent=' '+L('saveF');
    const rf=document.getElementById('im-reset-f'); if(rf) rf.textContent=L('resetF');
  }

  let entered=false;
  function onEnter(){
    if (!entered){
      entered=true;
      try { const saved=JSON.parse(localStorage.getItem('alhydra_impact_factors')); if(saved) f={...DEF,...saved}; } catch(e){}
      fillFactors();
      setPeriod(7);
    } else { refreshLabels(); compute(); }
  }
  function init(){ window.addEventListener('alhydra:lang', ()=>{ if(entered){ refreshLabels(); compute(); } }); }

  return { init, onEnter, setPeriod, compute, saveFactors, resetFactors };
})();
