/* ─────────────────────────────────────────
   i18n.js — Bilingual support (EN ⇄ ID)
   Source HTML is English; switching to ID swaps matching text
   nodes (whitespace-normalized lookup), preserving icons,
   live sensor values, and leading/trailing spacing. Reversible:
   each translated node caches its original English in node.__en.
   Runs on BOTH the landing page and the app shell.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.i18n = (() => {

  // Areas we must NOT translate (dynamic chat, code snippet, and the
  // already-Indonesian knowledge/calibration content).
  const SKIP_SEL = '#chat-messages, .code-block, code, #enc-body, #enc-modal-content, #calib-section, #calib-modal, [data-no-i18n]';

  // ── Dictionary: English (normalized) → Indonesian ──
  const EN2ID = {
    // ===== LANDING — navbar =====
    'About': 'Tentang',
    'Features': 'Fitur',
    'Technology': 'Teknologi',
    'How It Works': 'Cara Kerja',
    'Contact': 'Kontak',
    'Launch Dashboard': 'Buka Dasbor',

    // ===== LANDING — hero =====
    'AIoT-Based Smart Monitoring': 'Pemantauan Cerdas Berbasis AIoT',
    'Algae-Hydroponic Dual-Renewable Apparatus': 'Algae-Hydroponic Dual-Renewable Apparatus',
    'Hybrid Multi Tower Cultivation integrating Microalgae, Horticulture, and Hydroponic Towers powered by Solar Panels and Wind Turbines — monitored in real time through an intelligent AIoT cloud platform.':
      'Budidaya Multi-Menara Hibrida yang memadukan Mikroalga, Hortikultura, dan Menara Hidroponik, ditenagai Panel Surya dan Turbin Angin — dipantau secara real-time melalui platform cloud AIoT yang cerdas.',
    'Explore System': 'Jelajahi Sistem',
    'Sensors': 'Sensor',
    'Energy Sources': 'Sumber Energi',
    'Real-time': 'Real-time',
    'Data Updates': 'Pembaruan Data',
    'Cloud': 'Cloud',
    'Platform': 'Platform',

    // ===== LANDING — about =====
    'About the Research': 'Tentang Riset',
    'Sustainable Agriculture': 'Pertanian Berkelanjutan',
    'Meets Smart Technology': 'Bertemu Teknologi Cerdas',
    'ALHYDRA is a research initiative that integrates three cultivation paradigms — microalgae bioreactors, vertical horticulture towers, and hydroponic systems — into a single unified structure powered entirely by renewable energy.':
      'ALHYDRA adalah inisiatif riset yang memadukan tiga paradigma budidaya — bioreaktor mikroalga, menara hortikultura vertikal, dan sistem hidroponik — ke dalam satu struktur terpadu yang sepenuhnya ditenagai energi terbarukan.',
    'An IoT sensor network continuously monitors water quality, environmental conditions, and energy balance. All data is transmitted to Firebase and visualized in a real-time web dashboard accessible from anywhere.':
      'Jaringan sensor IoT memantau kualitas air, kondisi lingkungan, dan keseimbangan energi secara terus-menerus. Semua data dikirim ke Firebase dan divisualisasikan di dasbor web real-time yang dapat diakses dari mana saja.',
    'Zero fossil-fuel operation': 'Operasi tanpa bahan bakar fosil',
    'Real-time remote monitoring': 'Pemantauan jarak jauh real-time',
    'Automated irrigation control': 'Kontrol irigasi otomatis',
    'Cloud-based data analytics': 'Analitik data berbasis cloud',

    // ===== LANDING — features =====
    'Core Capabilities': 'Kemampuan Inti',
    'Everything You Need': 'Semua yang Anda Butuhkan',
    'In One Platform': 'Dalam Satu Platform',
    'Multi-Tower Cultivation': 'Budidaya Multi-Menara',
    'Three integrated cultivation systems — microalgae photobioreactors, vertical horticulture towers, and NFT hydroponic channels — operating simultaneously in a controlled environment.':
      'Tiga sistem budidaya terpadu — fotobioreaktor mikroalga, menara hortikultura vertikal, dan kanal hidroponik NFT — beroperasi bersamaan di lingkungan terkendali.',
    'Dual Renewable Energy': 'Energi Terbarukan Ganda',
    'Solar photovoltaic panels combined with small-scale wind turbines provide a reliable, carbon-neutral power supply. Energy generation and consumption are monitored in real time.':
      'Panel fotovoltaik surya dipadukan turbin angin skala kecil memberi pasokan daya andal dan netral karbon. Pembangkitan dan konsumsi energi dipantau real-time.',
    'Real-Time Monitoring': 'Pemantauan Real-Time',
    'Live dashboard with auto-updating charts for all 8 sensor channels. Values are streamed from hardware to Firebase Firestore and displayed with sub-second latency.':
      'Dasbor langsung dengan grafik yang diperbarui otomatis untuk 8 kanal sensor. Nilai dialirkan dari perangkat ke Firebase Firestore dan ditampilkan dengan latensi di bawah satu detik.',
    'Smart Pump Control': 'Kontrol Pompa Cerdas',
    'Remotely control irrigation pumps via relay switches through the web dashboard. Control commands are synced instantly to IoT devices through Firestore real-time listeners.':
      'Kendalikan pompa irigasi dari jarak jauh via sakelar relai melalui dasbor web. Perintah kontrol disinkronkan seketika ke perangkat IoT melalui listener real-time Firestore.',
    'Threshold Alerting': 'Peringatan Ambang',
    'Configurable alert thresholds for every sensor. Instant notifications when pH, temperature, turbidity, or any other parameter drifts outside the safe operating range.':
      'Ambang peringatan yang dapat dikonfigurasi untuk tiap sensor. Notifikasi instan saat pH, suhu, kekeruhan, atau parameter lain keluar dari rentang operasi aman.',
    'Historical Analytics': 'Analitik Historis',
    'Explore trends with date-range charts backed by Firestore time-series data. View pH evolution, energy trends, temperature profiles, and compare across time periods.':
      'Telusuri tren dengan grafik rentang tanggal berbasis data deret waktu Firestore. Lihat evolusi pH, tren energi, profil suhu, dan bandingkan antar periode.',

    // ===== LANDING — technology / sensors =====
    'Sensor Network': 'Jaringan Sensor',
    '8 Sensors.': '8 Sensor.',
    'Complete Coverage.': 'Cakupan Lengkap.',
    'Every critical parameter is measured, logged, and visualized in real time.':
      'Setiap parameter penting diukur, dicatat, dan divisualisasikan secara real-time.',
    'pH Sensor': 'Sensor pH',
    'Monitors water acidity/alkalinity. Optimal range 6.5–8.5 pH for healthy plant growth and microalgae cultivation.':
      'Memantau keasaman/alkalinitas air. Rentang optimal 6.5–8.5 pH untuk pertumbuhan tanaman dan budidaya mikroalga yang sehat.',
    'Light Intensity': 'Intensitas Cahaya',
    'BH1750 or LDR-based lux measurement for photosynthesis optimization and solar tracking analysis.':
      'Pengukuran lux berbasis BH1750 atau LDR untuk optimasi fotosintesis dan analisis pelacakan surya.',
    'Turbidity Sensor': 'Sensor Kekeruhan',
    'DHT11 — Temp & Humidity': 'DHT11 — Suhu & Kelembaban',
    'Water Temperature': 'Suhu Air',
    'DS18B20 waterproof probe monitors nutrient solution temperature. Ideal range 18–28°C for maximum root activity.':
      'Probe tahan air DS18B20 memantau suhu larutan nutrisi. Rentang ideal 18–28°C untuk aktivitas akar maksimal.',
    'ACS712 — Consumption': 'ACS712 — Konsumsi',
    'Current sensor measuring total electrical consumption of pumps, lights, and controllers in amperes and watts.':
      'Sensor arus mengukur total konsumsi listrik pompa, lampu, dan kontroler dalam ampere dan watt.',
    'ACS712 — Generation': 'ACS712 — Pembangkitan',
    'Current sensor on the renewable energy input line (solar + wind), reporting total generated power for energy balance analysis.':
      'Sensor arus pada jalur input energi terbarukan (surya + angin), melaporkan total daya yang dihasilkan untuk analisis keseimbangan energi.',
    'Relay Module — Pumps': 'Modul Relai — Pompa',
    'Dual-channel relay controls irrigation pump 1 and pump 2. Toggle remotely from the dashboard with instant state sync via Firestore.':
      'Relai dua kanal mengontrol pompa irigasi 1 dan 2. Alihkan dari jarak jauh lewat dasbor dengan sinkronisasi status seketika via Firestore.',

    // ===== LANDING — how it works =====
    'System Architecture': 'Arsitektur Sistem',
    'From Field': 'Dari Lapangan',
    'To Dashboard': 'Ke Dasbor',
    'Sense': 'Deteksi',
    'ESP32/Arduino reads data from 8 sensors every 30 seconds — pH, light, turbidity, temperature, humidity, water temp, and dual current sensors.':
      'ESP32/Arduino membaca data dari 8 sensor setiap 30 detik — pH, cahaya, kekeruhan, suhu, kelembaban, suhu air, dan dua sensor arus.',
    'Transmit': 'Kirim',
    'Monitor': 'Pantau',
    'The web dashboard subscribes to Firestore real-time listeners, updating charts and sensor cards automatically. Control relay states are written back to Firestore instantly.':
      'Dasbor web berlangganan listener real-time Firestore, memperbarui grafik dan kartu sensor secara otomatis. Status relai kontrol ditulis kembali ke Firestore seketika.',
    'Hardware Layer': 'Lapisan Perangkat Keras',
    'Solar Panel': 'Panel Surya',
    'Wind Turbine': 'Turbin Angin',
    'Cloud Layer': 'Lapisan Cloud',
    'Application Layer': 'Lapisan Aplikasi',
    'Dashboard': 'Dasbor',
    'Analytics': 'Analitik',

    // ===== LANDING — stats =====
    'Sensor Channels': 'Kanal Sensor',
    'Renewable Sources': 'Sumber Terbarukan',
    'Cloud Infrastructure': 'Infrastruktur Cloud',

    // ===== LANDING — CTA / footer =====
    'Get Started': 'Mulai',
    'Ready to Monitor': 'Siap Memantau',
    'Your System?': 'Sistem Anda?',
    'Access the ALHYDRA dashboard to view real-time sensor data, control irrigation pumps, and analyze historical trends — from any device, anywhere.':
      'Akses dasbor ALHYDRA untuk melihat data sensor real-time, mengontrol pompa irigasi, dan menganalisis tren historis — dari perangkat apa pun, di mana saja.',
    'Open Dashboard': 'Buka Dasbor',
    'View on GitHub': 'Lihat di GitHub',
    'Secured with Firebase Authentication. Data encrypted in transit.':
      'Diamankan dengan Firebase Authentication. Data dienkripsi saat transit.',
    'Algae-Hydroponic Dual-Renewable Apparatus — smart monitoring for sustainable agriculture.':
      'Algae-Hydroponic Dual-Renewable Apparatus — pemantauan cerdas untuk pertanian berkelanjutan.',
    'System': 'Sistem',
    'Research': 'Riset',
    'Stack': 'Teknologi',
    'Control Panel': 'Panel Kontrol',
    'Settings': 'Pengaturan',
    'About ALHYDRA': 'Tentang ALHYDRA',
    'All rights reserved.': 'Hak cipta dilindungi.',

    // ===== APP — auth screen =====
    'Smart Monitoring System': 'Sistem Pemantauan Cerdas',
    'Sign In': 'Masuk',
    'Register': 'Daftar',
    'Email': 'Email',
    'Password': 'Kata Sandi',
    'Forgot password?': 'Lupa kata sandi?',
    'or': 'atau',
    'Continue with Google': 'Lanjutkan dengan Google',
    'Full Name': 'Nama Lengkap',
    'Create Account': 'Buat Akun',
    'Enter your email to receive a password reset link.': 'Masukkan email Anda untuk menerima tautan reset kata sandi.',
    'Back': 'Kembali',
    'Send Reset Link': 'Kirim Tautan Reset',

    // ===== APP — sidebar / sections =====
    'MAIN': 'UTAMA',
    'ANALYSIS': 'ANALISIS',
    'INTELLIGENCE': 'KECERDASAN',
    'KNOWLEDGE': 'PENGETAHUAN',
    'SYSTEM': 'SISTEM',
    'AI Insights': 'Wawasan AI',
    'Encyclopedia': 'Ensiklopedia',
    'CULTIVATION': 'BUDIDAYA',
    'Microalgae': 'Mikroalga',
    'Microalgae Management': 'Manajemen Mikroalga',
    'Manage cultures, track growth & schedule harvests': 'Kelola kultur, lacak pertumbuhan & jadwalkan panen',
    'New Culture': 'Kultur Baru',
    'No cultures yet': 'Belum ada kultur',
    'Add your first microalgae culture to start tracking growth.': 'Tambahkan kultur mikroalga pertama untuk mulai melacak pertumbuhan.',
    // Water level (dashboard card)
    'Water Level': 'Level Air',
    'Optimal: 30 – 100 %': 'Optimal: 30 – 100 %',
    // Energy & Impact nav + headers
    'ENERGY & IMPACT': 'ENERGI & DAMPAK',
    'Energy Optimization': 'Optimasi Energi',
    'Environmental Impact': 'Dampak Lingkungan',
    'Dynamic energy management & automatic backup system': 'Manajemen energi dinamis & sistem cadangan otomatis',
    'Estimated CO₂ savings, carbon capture & water conservation': 'Estimasi penghematan CO₂, penangkapan karbon & konservasi air',
    'Simulated from net balance': 'Disimulasikan dari selisih bersih',
    'Generation vs consumption': 'Pembangkitan vs konsumsi',
    'Live recommendations': 'Rekomendasi langsung',
    'Advanced': 'Lanjutan',
    'Auto-backup tuning': 'Penyetelan auto-cadangan',
    // Quick help
    'Quick Help': 'Bantuan Cepat',
    'Connecting…': 'Menghubungkan…',
    'Online': 'Daring',
    'Offline': 'Luring',

    // ===== APP — dashboard =====
    'Real-time overview of all system parameters': 'Ikhtisar real-time semua parameter sistem',
    'Demo Mode': 'Mode Demo',
    'pH Level': 'Level pH',
    'Turbidity': 'Kekeruhan',
    'Temp. Ambient': 'Suhu Ambient',
    'Humidity': 'Kelembaban',
    'Water Temp.': 'Suhu Air',
    'Power Generated': 'Daya Dihasilkan',
    'Power Consumed': 'Daya Dikonsumsi',
    'Solar + Wind': 'Surya + Angin',
    'System load': 'Beban sistem',
    'Pump Control': 'Kontrol Pompa',
    'Pump 1': 'Pompa 1',
    'Pump 2': 'Pompa 2',
    'Generated': 'Dihasilkan',
    'Consumed': 'Dikonsumsi',
    'Balance': 'Selisih',
    'Energy Overview (Last 30 readings)': 'Ikhtisar Energi (30 pembacaan terakhir)',

    // ===== APP — monitoring =====
    'Live sensor data — updates automatically': 'Data sensor langsung — diperbarui otomatis',
    'Water Quality': 'Kualitas Air',
    'Environment': 'Lingkungan',
    'Energy': 'Energi',
    'Ambient Temp.': 'Suhu Ambient',
    'Power Generation vs Consumption': 'Pembangkitan vs Konsumsi Daya',
    'Generation Current': 'Arus Pembangkitan',
    'Consumption Current': 'Arus Konsumsi',

    // ===== APP — control =====
    'Manual relay control for irrigation pumps': 'Kontrol relai manual untuk pompa irigasi',
    'Primary irrigation pump': 'Pompa irigasi utama',
    'Secondary irrigation pump': 'Pompa irigasi sekunder',
    'Last changed': 'Terakhir diubah',
    'By': 'Oleh',
    'Control Log': 'Log Kontrol',
    'Clear': 'Bersihkan',

    // ===== APP — analytics =====
    'Historical sensor data and trends': 'Data & tren sensor historis',
    'From': 'Dari',
    'To': 'Sampai',
    'Load': 'Muat',
    'Avg pH': 'Rata-rata pH',
    'Avg Temp Ambient': 'Rata-rata Suhu Ambient',
    'Avg Water Temp': 'Rata-rata Suhu Air',
    'Avg Turbidity': 'Rata-rata Kekeruhan',
    'Total Readings': 'Total Pembacaan',
    'pH History': 'Riwayat pH',
    'Turbidity History': 'Riwayat Kekeruhan',
    'Temperature History (Ambient & Water)': 'Riwayat Suhu (Ambient & Air)',
    'Energy History (Generation vs Consumption W)': 'Riwayat Energi (Pembangkitan vs Konsumsi W)',
    'No data for the selected range. Adjust the date range or use Demo Mode.':
      'Tidak ada data untuk rentang terpilih. Sesuaikan rentang tanggal atau gunakan Mode Demo.',

    // ===== APP — AI Insights =====
    'On-device machine learning · forecasting, anomaly detection & explainable AI':
      'Machine learning di perangkat · prakiraan, deteksi anomali & AI yang dapat dijelaskan',
    'Model ready': 'Model siap',
    'Retrain': 'Latih Ulang',
    'System Health Score': 'Skor Kesehatan Sistem',
    'Regression model · 0–100': 'Model regresi · 0–100',
    'Analyzing…': 'Menganalisis…',
    'Training model on recent sensor history…': 'Melatih model pada riwayat sensor terbaru…',
    'Anomaly Detection': 'Deteksi Anomali',
    'Z-score outlier model (|z| > 2)': 'Model outlier Z-score (|z| > 2)',
    'Scanning sensors…': 'Memindai sensor…',
    'Next-Reading Forecast': 'Prakiraan Pembacaan Berikutnya',
    'Least-squares linear trend per sensor': 'Tren linear least-squares per sensor',
    'Explainable AI — Feature Attribution': 'AI yang Dapat Dijelaskan — Atribusi Fitur',
    'Why the model predicts this health score': 'Mengapa model memprediksi skor kesehatan ini',
    'Per-feature contribution to current prediction': 'Kontribusi tiap fitur pada prediksi saat ini',
    'Each bar is the additive contribution of one sensor to the predicted health score (linear-SHAP: βᵢ × standardized deviation). Green raises the score, red lowers it.':
      'Tiap batang adalah kontribusi aditif satu sensor terhadap skor kesehatan (linear-SHAP: βᵢ × deviasi terstandarisasi). Hijau menaikkan skor, merah menurunkan.',
    'Model:': 'Model:',
    'Training rows:': 'Baris pelatihan:',
    'Data:': 'Data:',
    'Updated:': 'Diperbarui:',

    // ===== APP — settings =====
    'Alert thresholds and system configuration': 'Ambang peringatan & konfigurasi sistem',
    'Alert Thresholds': 'Ambang Peringatan',
    'pH Min / Max': 'pH Min / Maks',
    'Light Intensity Min / Max (lux)': 'Intensitas Cahaya Min / Maks (lux)',
    'Turbidity Max (NTU)': 'Kekeruhan Maks (NTU)',
    'Ambient Temp. Min / Max (°C)': 'Suhu Ambient Min / Maks (°C)',
    'Humidity Min / Max (%)': 'Kelembaban Min / Maks (%)',
    'Water Temp. Min / Max (°C)': 'Suhu Air Min / Maks (°C)',
    'Save Thresholds': 'Simpan Ambang',
    'System Configuration': 'Konfigurasi Sistem',
    'Site Name': 'Nama Situs',
    'Voltage Reference (V)': 'Referensi Tegangan (V)',
    'Sensor Log Interval (seconds)': 'Interval Log Sensor (detik)',
    'Save Config': 'Simpan Konfigurasi',
    'User Profile': 'Profil Pengguna',
    'Display Name': 'Nama Tampilan',
    'Update Profile': 'Perbarui Profil',
    'Change Password': 'Ubah Kata Sandi',
    'New Password': 'Kata Sandi Baru',
    'Sign Out': 'Keluar',
    'AI Assistant (Gemini)': 'Asisten AI (Gemini)',
    'Save API Key': 'Simpan Kunci API',
    'IoT Integration (ESP32/Arduino)': 'Integrasi IoT (ESP32/Arduino)',

    // ===== APP — about view =====
    'Cultivation': 'Budidaya',
    'Multi-tower hydroponic and microalgae cultivation in a controlled environment.':
      'Budidaya hidroponik multi-menara dan mikroalga di lingkungan terkendali.',
    'Renewable Energy': 'Energi Terbarukan',
    'Dual-source power from solar panels and wind turbines, monitored in real time.':
      'Daya dua sumber dari panel surya dan turbin angin, dipantau real-time.',
    'Continuous monitoring of pH, turbidity, and water temperature for optimal growth.':
      'Pemantauan berkelanjutan pH, kekeruhan, dan suhu air untuk pertumbuhan optimal.',
    'AIoT Monitoring': 'Pemantauan AIoT',
    'Cloud-based smart monitoring with Firebase and IoT sensors providing real-time insights.':
      'Pemantauan cerdas berbasis cloud dengan Firebase dan sensor IoT memberi wawasan real-time.',
    'Sensor Specifications': 'Spesifikasi Sensor',
    'Sensor': 'Sensor',
    'Parameter': 'Parameter',
    'Unit': 'Satuan',
    'Optimal Range': 'Rentang Optimal',
    'Controlled': 'Terkendali',

    // ===== APP — chat / notifications =====
    'Smart Assistant': 'Asisten Cerdas',
    'Overview': 'Ikhtisar',
    'pH Status': 'Status pH',
    'Water': 'Air',
    'Tips': 'Tips',
    'Pumps': 'Pompa',
    'Notifications': 'Notifikasi',
    'Clear all': 'Bersihkan semua',
    'No notifications': 'Tidak ada notifikasi',
  };

  // Attribute strings (placeholder / title) EN → ID
  const ATTR = {
    'you@example.com': 'anda@contoh.com',
    'Min 6 characters': 'Min 6 karakter',
    'Your name': 'Nama Anda',
    'Ask about sensors, energy, recommendations…': 'Tanya soal sensor, energi, rekomendasi…',
    'Toggle dark / light': 'Ganti gelap / terang',
    'Toggle aura': 'Ganti aura',
    'Quick Help / Bantuan Cepat': 'Bantuan Cepat / Quick Help',
    'Notifications': 'Notifikasi',
    'Sign Out': 'Keluar',
    'Collapse sidebar': 'Ciutkan sidebar',
    'Clear chat': 'Bersihkan obrolan',
    'Close': 'Tutup',
    'Send message': 'Kirim pesan',
    'Language / Bahasa': 'Bahasa / Language',
  };

  // Normalized lookup (collapse internal whitespace) for robust matching.
  const norm = s => s.replace(/\s+/g, ' ').trim();
  const NORM = {};
  Object.keys(EN2ID).forEach(k => { NORM[norm(k)] = EN2ID[k]; });

  let lang = 'en';

  function isSkipped(node) {
    const el = node.parentElement;
    return !el || el.closest(SKIP_SEL) || el.closest('script, style');
  }

  function translateTextNodes(toID) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (isSkipped(node)) return;
      const raw = node.nodeValue;
      if (!raw.trim()) return;

      if (toID) {
        const hit = NORM[norm(raw)];
        if (hit) {
          if (node.__en == null) node.__en = raw;
          const lead  = raw.match(/^\s*/)[0];
          const trail = raw.match(/\s*$/)[0];
          node.nodeValue = lead + hit + trail;
        }
      } else if (node.__en != null) {
        node.nodeValue = node.__en;
        node.__en = null;
      }
    });
  }

  function translateAttrs(toID) {
    ['placeholder', 'title'].forEach(attr => {
      document.querySelectorAll('[' + attr + ']').forEach(el => {
        if (el.closest(SKIP_SEL)) return;
        const cacheKey = '_en_' + attr;
        if (toID) {
          const cur = el.getAttribute(attr);
          if (ATTR[cur]) {
            if (el.dataset[cacheKey] == null) el.dataset[cacheKey] = cur;
            el.setAttribute(attr, ATTR[cur]);
          }
        } else if (el.dataset[cacheKey] != null) {
          el.setAttribute(attr, el.dataset[cacheKey]);
          delete el.dataset[cacheKey];
        }
      });
    });
  }

  function updateToggleLabel() {
    document.querySelectorAll('[data-lang-label]').forEach(el => {
      el.textContent = lang === 'id' ? 'ID' : 'EN';
    });
    document.documentElement.setAttribute('lang', lang);
  }

  // Re-apply current language (call after dynamic content renders).
  function apply() {
    const toID = lang === 'id';
    translateTextNodes(toID);
    translateAttrs(toID);
    updateToggleLabel();
    // Let dynamic modules (e.g. algae) re-render their JS-built content.
    try { window.dispatchEvent(new CustomEvent('alhydra:lang', { detail: { lang } })); } catch (e) {}
  }

  function set(next) {
    lang = next === 'id' ? 'id' : 'en';
    try { localStorage.setItem('alhydra-lang', lang); } catch (e) {}
    apply();
  }

  function toggle() {
    set(lang === 'id' ? 'en' : 'id');
    ALHYDRA.app?.toast?.(lang === 'id' ? 'Bahasa Indonesia' : 'English', 'info', 1500);
  }

  function current() { return lang; }

  function init() {
    try { lang = localStorage.getItem('alhydra-lang') || 'en'; } catch (e) { lang = 'en'; }
    apply();
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      if (!btn.__wired) { btn.__wired = true; btn.addEventListener('click', toggle); }
    });
  }

  // Self-init for the landing page; the app shell calls init() again post-auth.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, apply, set, toggle, current };
})();
