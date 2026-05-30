/* ─────────────────────────────────────────
   help.js — Quick Help button + contextual guide
   Floating button opens a modal with help for the
   currently visible view + general FAQ. Bilingual.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.help = (() => {

  function lang(){ return ALHYDRA.i18n?.current?.() || 'en'; }

  // Per-view help content (bilingual)
  const VIEWS = {
    dashboard: {
      icon:'fa-gauge-high',
      en:{ title:'Dashboard', body:['Live overview of all sensors with status colors (green = optimal, amber = caution, red = alert).','Use <b>Demo Mode</b> to simulate data when no hardware is connected.','Toggle pumps directly from the Pump Control card.'] },
      id:{ title:'Dasbor', body:['Ikhtisar langsung semua sensor dengan warna status (hijau = optimal, kuning = waspada, merah = peringatan).','Gunakan <b>Mode Demo</b> untuk simulasi data saat perangkat belum terhubung.','Alihkan pompa langsung dari kartu Kontrol Pompa.'] },
    },
    monitoring:{
      icon:'fa-chart-line',
      en:{ title:'Monitoring', body:['Real-time charts grouped into Water Quality, Environment, and Energy tabs.','Charts auto-update from live sensor data.'] },
      id:{ title:'Pemantauan', body:['Grafik real-time dikelompokkan ke tab Kualitas Air, Lingkungan, dan Energi.','Grafik diperbarui otomatis dari data sensor langsung.'] },
    },
    control:{
      icon:'fa-sliders',
      en:{ title:'Control Panel', body:['Turn irrigation pumps ON/OFF remotely. State syncs instantly to the IoT device via Firestore.','Every action is recorded in the Control Log.'] },
      id:{ title:'Panel Kontrol', body:['Nyalakan/matikan pompa irigasi dari jarak jauh. Status tersinkron seketika ke perangkat IoT via Firestore.','Setiap tindakan tercatat di Log Kontrol.'] },
    },
    algae:{
      icon:'fa-bacterium',
      en:{ title:'Microalgae', body:['Add cultures, log cell density, and track growth phase & doubling time.','<b>Estimate from turbidity</b> auto-fills density from the turbidity sensor.','Harvest readiness and days-to-target are predicted from the growth rate.'] },
      id:{ title:'Mikroalga', body:['Tambah kultur, catat kepadatan sel, dan lacak fase pertumbuhan & waktu penggandaan.','<b>Estimasi dari kekeruhan</b> mengisi kepadatan dari sensor kekeruhan.','Kesiapan panen & hari menuju target diprediksi dari laju pertumbuhan.'] },
    },
    energy:{
      icon:'fa-bolt',
      en:{ title:'Energy Optimization', body:['Choose a mode: <b>Auto</b> (engages backup automatically on sustained deficit), <b>Renewable only</b>, or <b>Backup</b>.','Battery SOC is simulated from the net power balance.','Follow the optimization tips to schedule loads when surplus is available.'] },
      id:{ title:'Optimasi Energi', body:['Pilih mode: <b>Otomatis</b> (mengaktifkan cadangan otomatis saat defisit berkelanjutan), <b>Hanya terbarukan</b>, atau <b>Cadangan</b>.','SOC baterai disimulasikan dari keseimbangan daya bersih.','Ikuti saran optimasi untuk menjadwalkan beban saat ada surplus.'] },
    },
    impact:{
      icon:'fa-earth-asia',
      en:{ title:'Environmental Impact', body:['Estimates CO₂ avoided (renewable energy), CO₂ captured (algae), water saved, and tree-equivalents.','Inputs auto-fill from history & cultures — adjust the editable assumptions for your region.'] },
      id:{ title:'Dampak Lingkungan', body:['Memperkirakan CO₂ dihindari (energi terbarukan), CO₂ ditangkap (alga), air dihemat, dan setara pohon.','Masukan terisi otomatis dari riwayat & kultur — sesuaikan asumsi untuk wilayah Anda.'] },
    },
    analytics:{
      icon:'fa-chart-bar',
      en:{ title:'Analytics', body:['Explore historical trends. Pick a date range or a quick range (1h–7d).','Summary stats show averages over the selected window.'] },
      id:{ title:'Analitik', body:['Telusuri tren historis. Pilih rentang tanggal atau rentang cepat (1j–7h).','Statistik ringkas menampilkan rata-rata pada jendela terpilih.'] },
    },
    ai:{
      icon:'fa-brain',
      en:{ title:'AI Insights', body:['On-device ML health score, forecasting, anomaly detection, and explainable AI.','Press <b>Retrain</b> to refit the model on the latest history.'] },
      id:{ title:'Wawasan AI', body:['Skor kesehatan ML di perangkat, prakiraan, deteksi anomali, dan AI yang dapat dijelaskan.','Tekan <b>Latih Ulang</b> untuk melatih model pada riwayat terbaru.'] },
    },
    settings:{
      icon:'fa-gear',
      en:{ title:'Settings', body:['Set alert thresholds, system config, and your profile.','Add a <b>Gemini API key</b> to unlock full AI assistant responses.','Calibrate each sensor in the Calibration section.'] },
      id:{ title:'Pengaturan', body:['Atur ambang peringatan, konfigurasi sistem, dan profil Anda.','Tambahkan <b>kunci API Gemini</b> untuk membuka respons asisten AI penuh.','Kalibrasi tiap sensor di bagian Kalibrasi.'] },
    },
  };

  const GENERAL = {
    en:[
      ['How do I connect my IoT device?','Send sensor data via the Firebase REST API to <code>sensors/latest</code>. See Settings → IoT Integration for the exact payload.'],
      ['No data showing?','Enable <b>Demo Mode</b> on the Dashboard to preview the app with simulated readings.'],
      ['Change language / theme?','Use the 🌐 language and 🌙 theme buttons in the top bar.'],
      ['Smarter AI answers?','Add a free Gemini API key in Settings → AI Assistant.'],
    ],
    id:[
      ['Bagaimana menghubungkan perangkat IoT?','Kirim data sensor via Firebase REST API ke <code>sensors/latest</code>. Lihat Pengaturan → Integrasi IoT untuk format payload.'],
      ['Data tidak muncul?','Aktifkan <b>Mode Demo</b> di Dasbor untuk pratinjau dengan data simulasi.'],
      ['Ganti bahasa / tema?','Gunakan tombol 🌐 bahasa dan 🌙 tema di bilah atas.'],
      ['Jawaban AI lebih pintar?','Tambahkan kunci API Gemini gratis di Pengaturan → Asisten AI.'],
    ],
  };

  function currentView(){
    const v = document.querySelector('.view.active');
    if (!v) return 'dashboard';
    return v.id.replace('view-','');
  }

  function open(){
    const m = ensureModal();
    const lg = lang();
    const vk = currentView();
    const vc = VIEWS[vk] || VIEWS.dashboard;
    const loc = vc[lg] || vc.en;
    const gen = GENERAL[lg] || GENERAL.en;
    const headTip = lg==='id'?'Panduan halaman ini':'Help for this page';
    const faqTitle = lg==='id'?'Pertanyaan umum':'Frequently asked';

    document.getElementById('help-modal-content').innerHTML = `
      <div class="help-context">
        <div class="help-ctx-head"><span class="help-ctx-ic"><i class="fa-solid ${vc.icon}"></i></span>
          <div><div class="help-ctx-sub">${headTip}</div><div class="help-ctx-title">${loc.title}</div></div>
        </div>
        <ul class="help-list">${loc.body.map(b=>`<li>${b}</li>`).join('')}</ul>
      </div>
      <div class="help-faq-title">${faqTitle}</div>
      <div class="help-faq">
        ${gen.map(([q,a])=>`<details class="help-faq-item"><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </div>
      <button class="btn-primary full-width" onclick="ALHYDRA.help.openChat()" style="margin-top:14px">
        <i class="fa-solid fa-robot"></i> ${lg==='id'?'Tanya Asisten AI':'Ask the AI Assistant'}
      </button>
      <button class="btn-secondary full-width" onclick="ALHYDRA.help.runTour()" style="margin-top:8px">
        <i class="fa-solid fa-route"></i> ${lg==='id'?'Ikuti tur aplikasi':'Take the app tour'}
      </button>`;
    m.classList.add('open');
  }
  function close(){ document.getElementById('help-modal')?.classList.remove('open'); }
  function openChat(){ close(); ALHYDRA.chat?.togglePanel?.(); }
  function runTour(){ close(); ALHYDRA.onboarding?.startTour?.(); }

  function ensureModal(){
    let m=document.getElementById('help-modal');
    if (m) return m;
    m=document.createElement('div');
    m.id='help-modal'; m.className='enc-modal';
    m.innerHTML=`<div class="enc-modal-box" style="max-width:520px">
      <div class="enc-modal-header-bar">
        <span style="font-size:14px;font-weight:700;color:var(--text-primary)"><i class="fa-solid fa-circle-question" style="color:var(--cyan)"></i> ${lang()==='id'?'Bantuan Cepat':'Quick Help'}</span>
        <button onclick="ALHYDRA.help.close()" title="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div id="help-modal-content" class="enc-modal-content"></div>
    </div>`;
    m.addEventListener('click',e=>{ if(e.target===m) close(); });
    document.body.appendChild(m);
    return m;
  }

  function init(){
    document.getElementById('help-fab')?.addEventListener('click', open);
  }

  return { init, open, close, openChat, runTour };
})();
