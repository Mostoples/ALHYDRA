/* ─────────────────────────────────────────
   ops.js — Operations hub (tabbed):
   Tasks · Notes · Harvest · Maintenance · Automation
   Plus dashboard "upcoming tasks" widget + automation engine
   evaluated against live sensor data. All owner-scoped Firestore.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.ops = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  function uid() { return window.auth?.currentUser?.uid || null; }
  const T = {
    tasks:{en:'Tasks',id:'Tugas'}, notes:{en:'Notes',id:'Catatan'}, harvest:{en:'Harvest',id:'Panen'},
    maint:{en:'Maintenance',id:'Pemeliharaan'}, auto:{en:'Automation',id:'Otomasi'},
    add:{en:'Add',id:'Tambah'}, save:{en:'Save',id:'Simpan'}, cancel:{en:'Cancel',id:'Batal'},
    del:{en:'Delete',id:'Hapus'}, none:{en:'Nothing here yet — add your first item.',id:'Belum ada — tambahkan item pertama.'},
    // tasks
    taskTitle:{en:'Task title',id:'Judul tugas'}, due:{en:'Due date',id:'Tenggat'},
    priority:{en:'Priority',id:'Prioritas'}, low:{en:'Low',id:'Rendah'}, med:{en:'Medium',id:'Sedang'}, high:{en:'High',id:'Tinggi'},
    done:{en:'Done',id:'Selesai'}, overdue:{en:'Overdue',id:'Terlambat'}, today:{en:'Today',id:'Hari ini'},
    upcoming:{en:'Upcoming tasks',id:'Tugas mendatang'},
    // notes
    noteText:{en:'Write a note / observation…',id:'Tulis catatan / observasi…'}, tag:{en:'Tag',id:'Tag'},
    // harvest
    crop:{en:'Crop / species',id:'Tanaman / spesies'}, weight:{en:'Weight (kg)',id:'Berat (kg)'},
    quality:{en:'Quality',id:'Kualitas'}, totalYield:{en:'Total yield',id:'Total hasil'},
    // maintenance
    equip:{en:'Equipment',id:'Peralatan'}, action:{en:'Action done',id:'Tindakan'},
    nextDue:{en:'Next due',id:'Jadwal berikutnya'},
    // automation
    autoHint:{en:'Rules run automatically against live sensor data while the app is open.',id:'Aturan berjalan otomatis terhadap data sensor langsung saat aplikasi terbuka.'},
    when:{en:'When',id:'Jika'}, then:{en:'then',id:'maka'},
    sensor:{en:'Sensor',id:'Sensor'}, op:{en:'is',id:''}, value:{en:'Value',id:'Nilai'},
    actNotify:{en:'Send notification',id:'Kirim notifikasi'},
    actPompaOff:{en:'Turn Pompa OFF',id:'Matikan Pompa'},
    actAeratorOff:{en:'Turn Aerator OFF',id:'Matikan Aerator'},
    actLedOff:{en:'Turn LED OFF',id:'Matikan LED'},
    actEmbunOff:{en:'Turn Embun OFF',id:'Matikan Embun'},
    actBackup:{en:'Engage energy backup',id:'Aktifkan cadangan energi'},
    enable:{en:'Enabled',id:'Aktif'}, addRule:{en:'Add rule',id:'Tambah aturan'},
    saved:{en:'Saved',id:'Tersimpan'}, deleted:{en:'Deleted',id:'Dihapus'},
  };
  function L(k){const s=T[k];return s?(s[lang()]||s.en):k;}

  let tab='tasks';
  const cache={tasks:[],notes:[],harvest_log:[],maintenance:[],automation_rules:[]};

  // ── Firestore helpers ──
  async function loadColl(coll){
    const id=uid(); if(!id) return [];
    try{ const s=await window.db.collection(coll).where('uid','==',id).limit(200).get();
      const arr=[]; s.forEach(d=>arr.push({id:d.id,...d.data()}));
      arr.sort((a,b)=>(b.ts?.toMillis?.()||0)-(a.ts?.toMillis?.()||0));
      cache[coll]=arr; return arr;
    }catch(e){ console.warn('[ops]',coll,e); return []; }
  }
  async function addDoc(coll,data){
    const id=uid(); if(!id) return;
    await window.db.collection(coll).add({...data,uid:id,ts:firebase.firestore.FieldValue.serverTimestamp()});
    ALHYDRA.app.toast(L('saved'),'success');
  }
  async function delDoc(coll,docId){
    await window.db.collection(coll).doc(docId).delete();
    ALHYDRA.app.toast(L('deleted'),'info');
  }
  async function updateDoc(coll,docId,patch){ await window.db.collection(coll).doc(docId).set(patch,{merge:true}); }

  // ── View shell ──
  async function onEnter(){
    const host=document.getElementById('ops-body'); if(!host) return;
    const tabs=[['tasks','fa-list-check'],['notes','fa-note-sticky'],['harvest','fa-wheat-awn'],['maint','fa-screwdriver-wrench'],['auto','fa-robot']];
    host.innerHTML=`<div class="tab-bar">${tabs.map(([t,ic])=>`<button class="tab-btn ${ (t==='maint'?'maintenance':t==='auto'?'automation':t)===mapTab(tab)?'active':''}" onclick="ALHYDRA.ops.go('${t}')"><i class="fa-solid ${ic}"></i> ${L(t)}</button>`).join('')}</div><div id="ops-tab"></div>`;
    renderTab();
  }
  function mapTab(t){return t;}
  function go(t){ tab = (t==='maint'?'maintenance':t==='auto'?'automation':t); onEnter(); }

  async function renderTab(){
    const c=document.getElementById('ops-tab'); if(!c) return;
    c.innerHTML=`<div class="empty-state" style="padding:24px"><i class="fa-solid fa-circle-notch fa-spin"></i></div>`;
    if(tab==='tasks') renderTasks(c);
    else if(tab==='notes') renderNotes(c);
    else if(tab==='harvest') renderHarvest(c);
    else if(tab==='maintenance') renderMaint(c);
    else if(tab==='automation') renderAuto(c);
  }
  function esc(s){return String(s||'').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
  function emptyMsg(){return `<div class="pf-act-empty">${L('none')}</div>`;}

  // ── TASKS ──
  async function renderTasks(c){
    const rows=await loadColl('tasks');
    const now=Date.now();
    const sorted=rows.slice().sort((a,b)=>(a.done?1:0)-(b.done?1:0) || (new Date(a.due||'2999')-new Date(b.due||'2999')));
    c.innerHTML=`
      <div class="ops-form">
        <input type="text" id="t-title" placeholder="${L('taskTitle')}" />
        <input type="date" id="t-due" />
        <select id="t-prio"><option value="low">${L('low')}</option><option value="med" selected>${L('med')}</option><option value="high">${L('high')}</option></select>
        <button class="btn-primary sm" onclick="ALHYDRA.ops.addTask()"><i class="fa-solid fa-plus"></i> ${L('add')}</button>
      </div>
      <div class="ops-list">${sorted.length?sorted.map(t=>{
        const overdue=!t.done && t.due && new Date(t.due) < now-86400000;
        return `<div class="ops-item ${t.done?'done':''} prio-${t.prio||'med'}">
          <button class="ops-check" onclick="ALHYDRA.ops.toggleTask('${t.id}',${t.done?'false':'true'})"><i class="fa-solid ${t.done?'fa-circle-check':'fa-circle'}"></i></button>
          <div class="ops-main"><div class="ops-title">${esc(t.title)}</div>
            <div class="ops-meta">${t.due?`<span class="${overdue?'ov':''}"><i class="fa-solid fa-calendar"></i> ${t.due}${overdue?' · '+L('overdue'):''}</span>`:''} <span class="prio-tag ${t.prio||'med'}">${L(t.prio==='high'?'high':t.prio==='low'?'low':'med')}</span></div>
          </div>
          <button class="ops-del" onclick="ALHYDRA.ops.del('tasks','${t.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`;}).join(''):emptyMsg()}</div>`;
  }
  async function addTask(){
    const title=document.getElementById('t-title')?.value.trim(); if(!title){ALHYDRA.app.toast(L('taskTitle'),'warning');return;}
    await addDoc('tasks',{title,due:document.getElementById('t-due')?.value||'',prio:document.getElementById('t-prio')?.value||'med',done:false});
    ALHYDRA.audit?.log('task_add'); renderTab(); refreshWidget();
  }
  async function toggleTask(id,val){ await updateDoc('tasks',id,{done:val}); renderTab(); refreshWidget(); }

  // ── NOTES ──
  async function renderNotes(c){
    const rows=await loadColl('notes');
    c.innerHTML=`
      <div class="ops-form">
        <input type="text" id="n-text" placeholder="${L('noteText')}" style="flex:2" />
        <input type="text" id="n-tag" placeholder="${L('tag')}" />
        <button class="btn-primary sm" onclick="ALHYDRA.ops.addNote()"><i class="fa-solid fa-plus"></i> ${L('add')}</button>
      </div>
      <div class="ops-notes">${rows.length?rows.map(n=>`
        <div class="ops-note">
          <div class="ops-note-top">${n.tag?`<span class="note-tag">#${esc(n.tag)}</span>`:''}<span class="ops-note-time">${n.ts?.toDate?n.ts.toDate().toLocaleString():''}</span>
            <button class="ops-del" onclick="ALHYDRA.ops.del('notes','${n.id}')"><i class="fa-solid fa-trash"></i></button></div>
          <div class="ops-note-body">${esc(n.text)}</div>
        </div>`).join(''):emptyMsg()}</div>`;
  }
  async function addNote(){
    const text=document.getElementById('n-text')?.value.trim(); if(!text)return;
    await addDoc('notes',{text,tag:document.getElementById('n-tag')?.value.trim()||''});
    ALHYDRA.audit?.log('note_add'); renderTab();
  }

  // ── HARVEST ──
  async function renderHarvest(c){
    const rows=await loadColl('harvest_log');
    const total=rows.reduce((s,r)=>s+(parseFloat(r.weight)||0),0);
    c.innerHTML=`
      <div class="ops-kpi"><i class="fa-solid fa-wheat-awn"></i> ${L('totalYield')}: <b>${total.toFixed(2)} kg</b></div>
      <div class="ops-form">
        <input type="text" id="h-crop" placeholder="${L('crop')}" />
        <input type="number" step="0.01" id="h-weight" placeholder="${L('weight')}" />
        <select id="h-quality"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>
        <button class="btn-primary sm" onclick="ALHYDRA.ops.addHarvest()"><i class="fa-solid fa-plus"></i> ${L('add')}</button>
      </div>
      <div class="chart-container" style="height:180px;margin:8px 0 14px"><canvas id="h-chart"></canvas></div>
      <div class="ops-list">${rows.length?rows.map(h=>`
        <div class="ops-item">
          <span class="ops-check"><i class="fa-solid fa-seedling" style="color:var(--green)"></i></span>
          <div class="ops-main"><div class="ops-title">${esc(h.crop)} · ${(parseFloat(h.weight)||0).toFixed(2)} kg <span class="q-badge q-${h.quality||'A'}">${h.quality||'A'}</span></div>
            <div class="ops-meta">${h.ts?.toDate?h.ts.toDate().toLocaleDateString():''}</div></div>
          <button class="ops-del" onclick="ALHYDRA.ops.del('harvest_log','${h.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`).join(''):emptyMsg()}</div>`;
    drawHarvestChart(rows);
  }
  let hChart=null;
  function drawHarvestChart(rows){
    const cv=document.getElementById('h-chart'); if(!cv) return;
    const sorted=rows.slice().filter(r=>r.ts?.toDate).sort((a,b)=>a.ts.toMillis()-b.ts.toMillis());
    let cum=0; const labels=[],data=[];
    sorted.forEach(r=>{cum+=(parseFloat(r.weight)||0); labels.push(r.ts.toDate().toLocaleDateString()); data.push(cum.toFixed(2));});
    if(hChart)hChart.destroy();
    if(!window.Chart) return;
    hChart=new Chart(cv,{type:'line',data:{labels,datasets:[{label:'Cumulative kg',data,borderColor:'#10B981',backgroundColor:'rgba(16,185,129,.12)',borderWidth:2,fill:true,tension:.35,pointRadius:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  }
  async function addHarvest(){
    const crop=document.getElementById('h-crop')?.value.trim(); const w=parseFloat(document.getElementById('h-weight')?.value);
    if(!crop||isNaN(w)){ALHYDRA.app.toast(L('crop'),'warning');return;}
    await addDoc('harvest_log',{crop,weight:w,quality:document.getElementById('h-quality')?.value||'A'});
    ALHYDRA.audit?.log('harvest',{crop,weight:w}); renderTab();
  }

  // ── MAINTENANCE ──
  async function renderMaint(c){
    const rows=await loadColl('maintenance');
    c.innerHTML=`
      <div class="ops-form">
        <input type="text" id="m-equip" placeholder="${L('equip')}" />
        <input type="text" id="m-action" placeholder="${L('action')}" style="flex:2" />
        <input type="date" id="m-next" title="${L('nextDue')}" />
        <button class="btn-primary sm" onclick="ALHYDRA.ops.addMaint()"><i class="fa-solid fa-plus"></i> ${L('add')}</button>
      </div>
      <div class="ops-list">${rows.length?rows.map(m=>{
        const due=m.next && new Date(m.next) < Date.now();
        return `<div class="ops-item">
          <span class="ops-check"><i class="fa-solid fa-wrench" style="color:var(--amber)"></i></span>
          <div class="ops-main"><div class="ops-title">${esc(m.equip)} — ${esc(m.action)}</div>
            <div class="ops-meta">${m.ts?.toDate?m.ts.toDate().toLocaleDateString():''} ${m.next?`· <span class="${due?'ov':''}">${L('nextDue')}: ${m.next}</span>`:''}</div></div>
          <button class="ops-del" onclick="ALHYDRA.ops.del('maintenance','${m.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`;}).join(''):emptyMsg()}</div>`;
  }
  async function addMaint(){
    const equip=document.getElementById('m-equip')?.value.trim(); const action=document.getElementById('m-action')?.value.trim();
    if(!equip||!action){ALHYDRA.app.toast(L('equip'),'warning');return;}
    await addDoc('maintenance',{equip,action,next:document.getElementById('m-next')?.value||''});
    ALHYDRA.audit?.log('maintenance_add'); renderTab();
  }

  // ── AUTOMATION ──
  const SENSORS=['ph','temp_water','temp_ambient','humidity','turbidity','light','water_level','current_gen','current_cons'];
  async function renderAuto(c){
    const rows=await loadColl('automation_rules');
    c.innerHTML=`
      <p class="sf-note" style="margin-bottom:12px"><i class="fa-solid fa-circle-info"></i> ${L('autoHint')}</p>
      <div class="ops-form wrap">
        <span class="ops-lbl">${L('when')}</span>
        <select id="a-sensor">${SENSORS.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
        <select id="a-op"><option value="lt">&lt;</option><option value="gt">&gt;</option></select>
        <input type="number" step="0.1" id="a-val" placeholder="${L('value')}" style="max-width:110px" />
        <span class="ops-lbl">${L('then')}</span>
        <select id="a-act"><option value="notify">${L('actNotify')}</option>${KONTROL_ACTS.map(k=>`<option value="off_${k}">${L(ACT_LABEL[k])}</option>`).join('')}<option value="backup">${L('actBackup')}</option></select>
        <button class="btn-primary sm" onclick="ALHYDRA.ops.addRule()"><i class="fa-solid fa-plus"></i> ${L('addRule')}</button>
      </div>
      <div class="ops-list">${rows.length?rows.map(r=>`
        <div class="ops-item ${r.enabled===false?'done':''}">
          <button class="ops-check" onclick="ALHYDRA.ops.toggleRule('${r.id}',${r.enabled===false?'true':'false'})"><i class="fa-solid ${r.enabled===false?'fa-toggle-off':'fa-toggle-on'}" style="color:${r.enabled===false?'var(--text-muted)':'var(--green)'}"></i></button>
          <div class="ops-main"><div class="ops-title">${L('when')} <b>${r.sensor}</b> ${r.op==='lt'?'<':'>'} <b>${r.val}</b> → ${actLabel(r.act)}</div>
            <div class="ops-meta">${r.lastFired?('fired: '+new Date(r.lastFired).toLocaleString()):''}</div></div>
          <button class="ops-del" onclick="ALHYDRA.ops.del('automation_rules','${r.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`).join(''):emptyMsg()}</div>`;
  }
  // Automation actions that switch an rtdb kontrol/* channel off.
  // Legacy rules stored as pump1off/pump2off still resolve to real channels.
  const KONTROL_ACTS = ['pompa','aerator','led','embun'];
  const ACT_LABEL = { pompa:'actPompaOff', aerator:'actAeratorOff', led:'actLedOff', embun:'actEmbunOff' };
  const LEGACY_ACT = { pump1off:'pompa', pump2off:'aerator' };
  function actChannel(a){ return LEGACY_ACT[a] || (a.startsWith('off_') && KONTROL_ACTS.includes(a.slice(4)) ? a.slice(4) : null); }
  function actLabel(a){ const ch=actChannel(a); if(ch) return L(ACT_LABEL[ch]); return a==='backup'?L('actBackup'):L('actNotify'); }
  async function addRule(){
    const sensor=document.getElementById('a-sensor')?.value; const op=document.getElementById('a-op')?.value;
    const val=parseFloat(document.getElementById('a-val')?.value); const act=document.getElementById('a-act')?.value;
    if(isNaN(val)){ALHYDRA.app.toast(L('value'),'warning');return;}
    await addDoc('automation_rules',{sensor,op,val,act,enabled:true});
    ALHYDRA.audit?.log('automation_add',{sensor,op,val,act}); renderTab(); loadRules();
  }
  async function toggleRule(id,val){ await updateDoc('automation_rules',id,{enabled:val==='true'||val===true}); renderTab(); loadRules(); }

  // ── Automation engine (runs on live data) ──
  let rules=[]; const fired={};
  async function loadRules(){ const id=uid(); if(!id)return; try{ const s=await window.db.collection('automation_rules').where('uid','==',id).get(); rules=[]; s.forEach(d=>rules.push({id:d.id,...d.data()})); }catch(e){} }
  function liveVal(k){ const el=document.getElementById('val-'+k); if(!el)return null; const n=parseFloat(el.textContent); return isNaN(n)?null:n; }
  function evaluate(){
    if(!rules.length) return;
    rules.filter(r=>r.enabled!==false).forEach(r=>{
      const v=liveVal(r.sensor); if(v===null) return;
      const hit=(r.op==='lt'&&v<r.val)||(r.op==='gt'&&v>r.val);
      const key=r.id;
      if(hit && !fired[key]){
        fired[key]=Date.now();
        runAction(r,v);
        window.db.collection('automation_rules').doc(r.id).set({lastFired:Date.now()},{merge:true}).catch(()=>{});
      } else if(!hit && fired[key] && Date.now()-fired[key]>30000){ delete fired[key]; } // re-arm after condition clears
    });
  }
  function runAction(r,v){
    const msg=`${r.sensor} ${r.op==='lt'?'<':'>'} ${r.val} (now ${v})`;
    const ch = actChannel(r.act);
    if(r.act==='notify'){ ALHYDRA.app.addNotification?.('⚙ Automation', msg,'warning'); ALHYDRA.app.toast('⚙ '+msg,'warning'); }
    else if(ch){ ALHYDRA.device?.setKontrol?.(ch,false); ALHYDRA.app.addNotification?.('⚙ Automation',`${ch} OFF — `+msg,'warning'); }
    else if(r.act==='backup'){ ALHYDRA.energy?.setMode?.('backup'); ALHYDRA.app.addNotification?.('⚙ Automation','Backup engaged — '+msg,'warning'); }
    ALHYDRA.audit?.log('automation_fire',{rule:r.sensor+r.op+r.val,act:r.act});
  }

  // ── Dashboard upcoming-tasks widget ──
  async function refreshWidget(){
    const host=document.getElementById('ops-widget'); if(!host) return;
    const rows=await loadColl('tasks');
    const pending=rows.filter(t=>!t.done).sort((a,b)=>new Date(a.due||'2999')-new Date(b.due||'2999')).slice(0,4);
    if(!pending.length){ host.style.display='none'; return; }
    host.style.display='';
    host.innerHTML=`<div class="opsw-head"><i class="fa-solid fa-list-check"></i> <b>${L('upcoming')}</b>
      <button class="opsw-all" onclick="ALHYDRA.app.navigateTo('ops')">${L('tasks')} →</button></div>
      <div class="opsw-list">${pending.map(t=>{
        const overdue=t.due && new Date(t.due)<Date.now()-86400000;
        return `<button class="opsw-item ${overdue?'ov':''}" onclick="ALHYDRA.app.navigateTo('ops')"><i class="fa-solid fa-circle"></i> ${esc(t.title)} ${t.due?`<span>${t.due}</span>`:''}</button>`;
      }).join('')}</div>`;
  }

  function del(coll,id){ delDoc(coll,id).then(()=>{renderTab(); if(coll==='tasks'){refreshWidget();} if(coll==='automation_rules'){loadRules();}}); }

  let timer=null;
  function init(){
    window.addEventListener('alhydra:lang',()=>{ if(document.getElementById('view-ops')?.classList.contains('active')) onEnter(); refreshWidget(); });
    loadRules();
    refreshWidget();
    if(timer) clearInterval(timer);
    timer=setInterval(evaluate, 4000);
  }

  return { init, onEnter, go, addTask, toggleTask, addNote, addHarvest, addMaint, addRule, toggleRule, del, refreshWidget };
})();
