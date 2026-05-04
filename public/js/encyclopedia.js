/* ─────────────────────────────────────────
   encyclopedia.js — ALHYDRA Knowledge Base
   Data sourced from Kaggle datasets &
   peer-reviewed research.
───────────────────────────────────────── */
'use strict';

ALHYDRA.encyclopedia = (() => {

  // ── Knowledge Base Data ────────────────
  // Sources: Kaggle aquaponics dataset (ogbuokiriblessing, 2022),
  // Kaggle simple aquaponic dataset (bobsis, 118k rows),
  // Cornell CEA Lettuce Handbook, Chlorella vulgaris PMC studies.

  const DATA = {

    // ── HYDROPONIC PLANTS ──────────────────
    plants: [
      {
        id: 'lettuce',
        name: 'Selada (Lettuce)',
        latin: 'Lactuca sativa',
        icon: '🥬',
        color: '#10B981',
        type: 'Sayuran Daun',
        harvest: '25–35 hari',
        params: {
          ph:   { min: 5.5, max: 6.5,  unit: 'pH',    note: 'Optimal 6.0' },
          ec:   { min: 0.8, max: 1.8,  unit: 'mS/cm', note: 'Seedling 0.5–0.8' },
          temp: { min: 15,  max: 22,   unit: '°C',    note: 'Ideal 18°C' },
          light:{ min: 10000, max: 30000, unit: 'lux', note: '16h photoperiod' },
          do:   { min: 5,   max: 8,    unit: 'mg/L',  note: 'Min 4 mg/L' },
          humidity: { min: 60, max: 80, unit: '%',    note: 'Ideal 70%' },
        },
        tips: [
          'NFT (Nutrient Film Technique) adalah metode terbaik untuk selada.',
          'Suhu di atas 25°C menyebabkan bolting (berbunga prematur) — hindari.',
          'pH rendah (di bawah 5.5) mengunci Ca dan Mg, menyebabkan tip burn.',
          'EC tinggi (>2.0) menyebabkan daun pahit pada varietas butterhead.',
        ],
        nutrients: { N: 'Tinggi', P: 'Rendah', K: 'Sedang', Ca: 'Tinggi', Mg: 'Sedang' },
        description: 'Tanaman paling populer untuk hidroponik. Siklus panen cepat, tidak membutuhkan banyak energi cahaya, cocok dengan sistem NFT dan DWC. Data Kaggle (118.286 titik pengukuran IoT selama 3 bulan) menunjukkan korelasi kuat antara pH stabil (6.5–7.0) dengan yield yang konsisten.',
        source: 'Cornell CEA Lettuce Handbook + Kaggle Aquaponics Dataset (bobsis, 2023)',
      },
      {
        id: 'bayam',
        name: 'Bayam (Spinach)',
        latin: 'Spinacia oleracea',
        icon: '🌿',
        color: '#059669',
        type: 'Sayuran Daun',
        harvest: '40–50 hari',
        params: {
          ph:   { min: 6.0, max: 7.0,  unit: 'pH',    note: 'Toleran 5.5–7.5' },
          ec:   { min: 1.8, max: 2.3,  unit: 'mS/cm', note: 'EC tinggi untuk nutrisi' },
          temp: { min: 10,  max: 20,   unit: '°C',    note: 'Sensitif panas' },
          light:{ min: 8000, max: 25000, unit: 'lux',  note: '12–14h photoperiod' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Bayam sangat sensitif terhadap suhu tinggi, di atas 24°C menyebabkan bolting.',
          'Kebutuhan Fe (zat besi) tinggi — defisiensi ditandai dengan daun kuning muda.',
          'Tumbuh baik di sistem NFT, wick, atau aeroponik.',
          'Oksigen terlarut minimal 5 mg/L penting untuk akar yang sehat.',
        ],
        nutrients: { N: 'Sangat Tinggi', P: 'Rendah', K: 'Sedang', Ca: 'Tinggi', Fe: 'Tinggi' },
        description: 'Bayam tumbuh cepat dan kaya zat besi. Sangat cocok untuk iklim sejuk atau sistem indoor ber-AC. Membutuhkan EC lebih tinggi daripada selada karena kebutuhan nitrogen yang besar.',
        source: 'Ponics Life Hydroponic Chart + OSU Extension EC/pH Guide',
      },
      {
        id: 'pakcoy',
        name: 'Pakcoy (Bok Choy)',
        latin: 'Brassica rapa subsp. chinensis',
        icon: '🥦',
        color: '#34D399',
        type: 'Sayuran Daun',
        harvest: '30–45 hari',
        params: {
          ph:   { min: 6.0, max: 7.0,  unit: 'pH',   note: 'Optimal 6.5' },
          ec:   { min: 1.5, max: 2.5,  unit: 'mS/cm', note: '' },
          temp: { min: 13,  max: 22,   unit: '°C',   note: 'Hindari >28°C' },
          light:{ min: 10000, max: 30000, unit: 'lux', note: '14–16h' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Tumbuh cepat dan produktif dalam sistem NFT maupun DWC.',
          'Rentan aphid (kutu daun) pada kelembaban rendah.',
          'Potong daun luar saat panen untuk regenerasi (cut-and-come-again).',
        ],
        nutrients: { N: 'Tinggi', P: 'Sedang', K: 'Tinggi', Ca: 'Sedang' },
        description: 'Tanaman crucifer yang ideal untuk iklim tropis seperti Indonesia. Toleran terhadap pH yang sedikit lebih tinggi dibandingkan selada.',
        source: 'Hort Americas Nutritional Factsheet',
      },
      {
        id: 'kangkung',
        name: 'Kangkung (Water Spinach)',
        latin: 'Ipomoea aquatica',
        icon: '🌱',
        color: '#6EE7B7',
        type: 'Sayuran Daun',
        harvest: '25–30 hari',
        params: {
          ph:   { min: 6.0, max: 7.5,  unit: 'pH',   note: 'Toleran lebar' },
          ec:   { min: 1.5, max: 2.5,  unit: 'mS/cm', note: '' },
          temp: { min: 20,  max: 32,   unit: '°C',   note: 'Tahan panas, ideal tropis' },
          light:{ min: 8000, max: 25000, unit: 'lux', note: '12h+' },
          humidity: { min: 60, max: 90, unit: '%', note: 'Toleran lembab' },
        },
        tips: [
          'Sangat cocok untuk iklim tropis Indonesia.',
          'Toleran terhadap suhu tinggi dan kelembaban tinggi.',
          'Sistem rakit apung (DWC) atau NFT cocok untuk kangkung.',
          'Dapat dipanen berulang kali — potong 5 cm dari batang.',
        ],
        nutrients: { N: 'Tinggi', P: 'Sedang', K: 'Tinggi', Ca: 'Sedang' },
        description: 'Sayuran asli Asia Tenggara yang sangat adaptif. Pertumbuhan cepat dan panen bisa dilakukan berkali-kali. Ideal sebagai tanaman pertama untuk pemula hidroponik.',
        source: 'Smart Farming Sensor Data (Kaggle, atharvasoundankar, 2024)',
      },
      {
        id: 'basil',
        name: 'Kemangi (Basil)',
        latin: 'Ocimum basilicum',
        icon: '🌿',
        color: '#A7F3D0',
        type: 'Herbal',
        harvest: '28–35 hari',
        params: {
          ph:   { min: 6.0, max: 7.0,  unit: 'pH',   note: 'Optimal 6.5' },
          ec:   { min: 1.6, max: 2.2,  unit: 'mS/cm', note: '' },
          temp: { min: 18,  max: 30,   unit: '°C',   note: 'Optimal 22–25°C' },
          light:{ min: 15000, max: 40000, unit: 'lux', note: '16h photoperiod' },
          humidity: { min: 50, max: 70, unit: '%', note: 'Kelembaban rendah cegah busuk' },
        },
        tips: [
          'Kemangi membutuhkan cahaya lebih banyak dibanding sayuran daun.',
          'Potong bunga secara rutin untuk mempertahankan kualitas daun.',
          'Suhu rendah (<15°C) menyebabkan daun menghitam.',
          'Aroma semakin kuat saat cahaya matahari tinggi.',
        ],
        nutrients: { N: 'Sedang', P: 'Sedang', K: 'Tinggi', Ca: 'Sedang', Mg: 'Tinggi' },
        description: 'Herba aromatik bernilai ekonomi tinggi. Sangat responsif terhadap kualitas cahaya — lebih banyak PAR = aroma lebih intens. Harga jual tinggi per kilogram.',
        source: 'Urban Harvest Lab Hydroponic Guide + Ponics Life Chart',
      },
      {
        id: 'tomat',
        name: 'Tomat (Tomato)',
        latin: 'Solanum lycopersicum',
        icon: '🍅',
        color: '#EF4444',
        type: 'Buah',
        harvest: '70–90 hari',
        params: {
          ph:   { min: 5.5, max: 6.5,  unit: 'pH',   note: 'Optimal 6.0–6.2' },
          ec:   { min: 2.0, max: 4.0,  unit: 'mS/cm', note: 'Tinggi saat berbuah' },
          temp: { min: 18,  max: 27,   unit: '°C',   note: 'Siang 22–26°C' },
          light:{ min: 25000, max: 60000, unit: 'lux', note: '18h atau cahaya penuh' },
          do:   { min: 6, max: 8, unit: 'mg/L', note: 'Kritis saat pematangan' },
          humidity: { min: 65, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Sistem drip irrigation atau Dutch bucket ideal untuk tomat.',
          'Ca dan K sangat penting — defisiensi Ca menyebabkan blossom end rot.',
          'Polinasi manual diperlukan pada sistem indoor.',
          'EC perlu ditingkatkan bertahap seiring pertumbuhan.',
        ],
        nutrients: { N: 'Sedang', P: 'Tinggi', K: 'Sangat Tinggi', Ca: 'Sangat Tinggi', Mg: 'Tinggi' },
        description: 'Tanaman paling menantang namun bernilai tinggi dalam hidroponik. Memerlukan manajemen nutrisi yang cermat dan support struktur vertikal.',
        source: 'Cornell CEA + Oklahoma State University EC/pH Guide',
      },
      {
        id: 'mint',
        name: 'Mint / Peppermint',
        latin: 'Mentha × piperita',
        icon: '🌱',
        color: '#6EE7B7',
        type: 'Herbal',
        harvest: '30–40 hari',
        params: {
          ph:   { min: 6.5, max: 7.0,  unit: 'pH',   note: 'Toleran 6.0–7.5' },
          ec:   { min: 1.5, max: 2.5,  unit: 'mS/cm', note: '' },
          temp: { min: 15,  max: 25,   unit: '°C',   note: 'Tumbuh baik di suhu sejuk' },
          light:{ min: 10000, max: 30000, unit: 'lux', note: '12–16h' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Mint tumbuh agresif — pisahkan dari tanaman lain.',
          'Aroma tertinggi saat pH 6.5–7.0.',
          'Perbanyakan mudah via stek batang di air.',
        ],
        nutrients: { N: 'Sedang', P: 'Rendah', K: 'Sedang' },
        description: 'Herba dengan pertumbuhan sangat cepat. Panen berkelanjutan dan kebutuhan perawatan rendah. Permintaan pasar stabil untuk minuman dan kuliner.',
        source: 'Number Analytics Hydroponics Guide',
      },
      {
        id: 'chili',
        name: 'Cabai (Chili Pepper)',
        latin: 'Capsicum annuum',
        icon: '🌶️',
        color: '#F59E0B',
        type: 'Buah',
        harvest: '80–100 hari',
        params: {
          ph:   { min: 5.5, max: 6.5,  unit: 'pH',   note: 'Optimal 6.0' },
          ec:   { min: 1.5, max: 3.5,  unit: 'mS/cm', note: 'Tingkatkan saat berbuah' },
          temp: { min: 20,  max: 32,   unit: '°C',   note: 'Tahan panas' },
          light:{ min: 25000, max: 60000, unit: 'lux', note: 'Butuh cahaya tinggi' },
          humidity: { min: 50, max: 70, unit: '%', note: 'Rendah untuk cegah busuk' },
        },
        tips: [
          'Cabai lebih tahan panas dibanding tomat — ideal untuk iklim tropis.',
          'Polinasi manual penting untuk buah yang melimpah.',
          'EC tinggi pada fase pembungaan meningkatkan kadar capsaicin (kepedasan).',
        ],
        nutrients: { N: 'Sedang', P: 'Tinggi', K: 'Sangat Tinggi', Ca: 'Tinggi' },
        description: 'Sangat cocok untuk iklim Indonesia. Nilai ekonomi tinggi per kg dibandingkan sayuran daun. Sistem drip irrigation atau media bed ideal.',
        source: 'Ponics Life Hydroponic Charts + OSU Extension',
      },
    ],

    // ── MICROALGAE ─────────────────────────
    algae: [
      {
        id: 'chlorella',
        name: 'Chlorella vulgaris',
        icon: '🟢',
        color: '#10B981',
        family: 'Chlorophyceae',
        application: 'Pakan ikan, suplemen kesehatan, CO₂ fiksasi',
        params: {
          ph:      { min: 7.0, max: 9.0,  unit: 'pH',   note: 'Optimal 8.0–9.0 monokultur' },
          temp:    { min: 20,  max: 35,   unit: '°C',   note: 'Optimal 25°C, maks 30°C' },
          light:   { min: 5000,max: 15000, unit: 'lux',  note: '~80–250 µmol/m²/s PAR' },
          co2:     { min: 0.5, max: 5,    unit: '% v/v', note: 'CO₂ injeksi mempercepat 3–5×' },
          photoperiod: { val: '16:8', unit: 'L:D', note: 'Light:Dark ratio' },
        },
        productivity: '0.3–1.5 g/L/hari (tergantung sistem dan cahaya)',
        tips: [
          'Blue LED (450 nm) menghasilkan biomassa lebih tinggi dari red LED.',
          'Turbidity NTU berbanding lurus dengan kepadatan sel — bisa dipakai estimasi biomassa.',
          'pH naik saat fotosintesis tinggi karena CO₂ diserap. Pantau sensor ALHYDRA.',
          'Aerasi konstan penting untuk mencegah sedimentasi sel.',
          'Suhu >35°C menyebabkan penurunan tajam pertumbuhan dan kematian sel.',
        ],
        description: 'Mikroalga hijau uniseluler paling banyak dikultivasi di dunia. Kaya protein (50–60%), vitamin B12, klorofil, dan lutein. Dalam sistem ALHYDRA, Chlorella dapat mengonsumsi CO₂ dari lingkungan sekitar dan memproduksi O₂ yang bermanfaat bagi zona hidroponik.',
        source: 'PMC11152938 — Optimal growth conditions Chlorella vulgaris + Frontiers Env Science 2021',
      },
      {
        id: 'spirulina',
        name: 'Spirulina (Arthrospira platensis)',
        icon: '🔵',
        color: '#06B6D4',
        family: 'Cyanobacteria (Oscillatoriaceae)',
        application: 'Suplemen nutrisi, pewarna makanan, antioksidan',
        params: {
          ph:      { min: 8.5, max: 11.0, unit: 'pH',   note: 'Sangat alkalin' },
          temp:    { min: 30,  max: 38,   unit: '°C',   note: 'Optimal 35–37°C' },
          light:   { min: 3000,max: 10000, unit: 'lux',  note: '30–100 µmol/m²/s PAR' },
          salinity:{ min: 20,  max: 70,   unit: 'g/L NaHCO₃', note: 'Media alkali spesifik' },
          photoperiod: { val: '12:12', unit: 'L:D', note: 'Atau cahaya penuh outdoor' },
        },
        productivity: '0.5–2.0 g/L/hari',
        tips: [
          'Media Zarrouk atau medium alkali tinggi (NaHCO₃) sangat penting.',
          'pH sangat tinggi (>9) membatasi pertumbuhan kontaminan alami.',
          'Suhu optimal LEBIH TINGGI dari mikroalga lain — cocok iklim tropis.',
          'Gunakan filter kain halus (80 µm) untuk panen manual.',
          'Cahaya matahari langsung sangat efektif jika area terbuka tersedia.',
        ],
        description: 'Cyanobacteria berbentuk spiral dengan kandungan protein 60–70%. Suplemen kesehatan bernilai sangat tinggi (Rp 200.000–400.000/kg kering). Iklim tropis Indonesia sangat mendukung kultivasi outdoor Spirulina.',
        source: 'Algae Testbed ATP3 NREL (Kaggle: stargarden) + PMC systematic review',
      },
      {
        id: 'scenedesmus',
        name: 'Scenedesmus obliquus',
        icon: '🌊',
        color: '#34D399',
        family: 'Chlorophyceae',
        application: 'Biodiesel feedstock, wastewater treatment, pakan ternak',
        params: {
          ph:   { min: 7.0, max: 9.0,  unit: 'pH',   note: 'Toleran kisaran lebar' },
          temp: { min: 20,  max: 30,   unit: '°C',   note: 'Optimal 25°C' },
          light:{ min: 5000,max: 20000, unit: 'lux',  note: '100–300 µmol/m²/s PAR' },
          photoperiod: { val: '16:8', unit: 'L:D', note: '' },
        },
        productivity: '0.2–1.0 g/L/hari',
        tips: [
          'Lebih tahan terhadap fluktuasi pH dibanding Chlorella.',
          'Efektif untuk pengolahan air limbah (menyerap N dan P).',
          'Kandungan lipid tinggi (12–40% DW) untuk produksi biodiesel.',
          'Toleran terhadap CO₂ tinggi (5–15%) — cocok sistem terintegrasi.',
        ],
        description: 'Mikroalga hijau koloni yang tumbuh cepat dan sangat adaptif. Dalam konteks ALHYDRA, dapat digunakan untuk bioremedasi air nutrisi dari zona hidroponik sebelum resirkulasi.',
        source: 'Algal Research Mendeley datasets + Frontiers Marine Science 2022',
      },
      {
        id: 'haematococcus',
        name: 'Haematococcus pluvialis',
        icon: '🔴',
        color: '#EF4444',
        family: 'Chlorophyceae',
        application: 'Astaxanthin — antioksidan premium',
        params: {
          ph:   { min: 7.0, max: 8.0,  unit: 'pH',   note: '2 fase: vegetatif & stres' },
          temp: { min: 20,  max: 28,   unit: '°C',   note: 'Fase stres: suhu tinggi + cahaya tinggi' },
          light:{ min: 5000,max: 80000, unit: 'lux',  note: 'Stres cahaya tinggi untuk astaxanthin' },
          photoperiod: { val: '18:6', unit: 'L:D', note: 'Fase vegetatif; tutup total fase stres' },
        },
        productivity: 'Astaxanthin: 3–5% DW (bernilai > Rp 800.000/g)',
        tips: [
          'Kultivasi 2 fase: vegetatif (tumbuhkan biomassa) → stres (picu astaxanthin).',
          'Stres cahaya + N-deprivasi memicu akumulasi astaxanthin.',
          'Nilai ekonomi sangat tinggi — premium aquafeed dan kosmetik.',
          'Sensitif kontaminasi — perlu sistem tertutup (photobioreactor).',
        ],
        description: 'Penghasil astaxanthin alami terkaya di dunia. Meskipun lebih sulit dikultivasi, nilai ekonominya jauh lebih tinggi dibanding Chlorella atau Spirulina. Potensial untuk modul komersial ALHYDRA jangka panjang.',
        source: 'Kumar et al. (2015) Renewable Energy Reviews + Algal Research Literature',
      },
      {
        id: 'nannochloropsis',
        name: 'Nannochloropsis sp.',
        icon: '🟡',
        color: '#F59E0B',
        family: 'Eustigmatophyceae',
        application: 'Omega-3 EPA, pakan larva ikan, akuakultur',
        params: {
          ph:      { min: 7.5, max: 8.5, unit: 'pH',    note: '' },
          temp:    { min: 20,  max: 28,  unit: '°C',    note: 'Optimal 22–25°C' },
          light:   { min: 5000,max: 25000,unit: 'lux',   note: '100–400 µmol/m²/s PAR' },
          salinity:{ min: 20,  max: 35,  unit: 'ppt',   note: 'Spesies laut — butuh air asin' },
          photoperiod: { val: '16:8', unit: 'L:D', note: '' },
        },
        productivity: '0.3–0.8 g/L/hari, EPA: 5% DW',
        tips: [
          'Membutuhkan air laut atau media saline — berbeda dari Chlorella.',
          'EPA (eicosapentaenoic acid) sangat berharga untuk industri akuakultur.',
          'Cocok untuk sistem fotobioreaktor tabung vertikal tertutup.',
        ],
        description: 'Mikroalga laut kaya EPA omega-3. Kandungan lipid total 30–40% DW dengan komposisi asam lemak yang ideal untuk pakan larva ikan dan udang. Integrasi dengan akuakultur memberi nilai tambah tinggi.',
        source: 'Nwoba et al. (2019) Bioresource Technology Reviews + ATP3 dataset NREL',
      },
    ],

    // ── SENSOR GUIDE ───────────────────────
    sensors: [
      {
        id: 'ph',
        name: 'pH Sensor',
        icon: 'fa-flask-vial',
        color: '#10B981',
        dataKey: 'ph',
        what: 'Mengukur tingkat keasaman atau kebasaan larutan nutrisi. Skala 0–14; <7 asam, 7 netral, >7 basa.',
        ranges: [
          { label: 'Sangat Asam',   min: 0,   max: 5.0, cls: 'danger',  note: 'Keracunan aluminium dan mangan pada tanaman' },
          { label: 'Asam',          min: 5.0, max: 5.5, cls: 'warning', note: 'Beberapa tanaman toleran; rentan defisiensi Ca/Mg' },
          { label: 'Optimal Hidro', min: 5.5, max: 6.5, cls: 'good',    note: 'Rentang ideal untuk sebagian besar tanaman hidroponik' },
          { label: 'Optimal Alga',  min: 6.5, max: 8.5, cls: 'good',    note: 'Ideal untuk Chlorella, Spirulina' },
          { label: 'Alkali',        min: 8.5, max: 10,  cls: 'warning', note: 'Fe dan Mn mengendap, defisiensi mikronutrien' },
          { label: 'Sangat Alkali', min: 10,  max: 14,  cls: 'danger',  note: 'Toksik untuk sebagian besar organisme' },
        ],
        affects: 'Ketersediaan nutrisi, pertumbuhan akar, aktivitas enzim tanaman, densitas sel alga.',
        kaggleInsight: 'Dataset aquaponics Kaggle (118.286 titik data, 3 bulan): rata-rata pH 6.9, rentang normal 6.5–8.2. Korelasi pH-suhu sangat rendah (r=0.03) — artinya pH bisa dikendalikan secara independen.',
        tips: ['Kalibrasi sensor pH setiap 2–4 minggu dengan buffer pH 4.0 dan 7.0.', 'pH naik alami saat alga fotosintesis (menyerap CO₂). Pantau di ALHYDRA saat siang hari.', 'Gunakan larutan asam fosfat (pH down) atau kalium hidroksida (pH up) untuk adjustment.'],
        hardware: 'Probe analog + modul pH meter; input ke ADC ESP32. Range 0–14 pH, akurasi ±0.1 pH.',
      },
      {
        id: 'turbidity',
        name: 'Turbidity Sensor',
        icon: 'fa-droplet',
        color: '#06B6D4',
        dataKey: 'turbidity',
        what: 'Mengukur kekeruhan air berdasarkan hamburan cahaya oleh partikel tersuspensi. Satuan NTU (Nephelometric Turbidity Unit).',
        ranges: [
          { label: 'Jernih',    min: 0,   max: 10,  cls: 'good',    note: 'Air bersih, ideal untuk hidroponik' },
          { label: 'Rendah',    min: 10,  max: 25,  cls: 'good',    note: 'Sedikit partikel; masih baik' },
          { label: 'Sedang',    min: 25,  max: 50,  cls: 'warning', note: 'Monitor kepadatan alga atau kotoran' },
          { label: 'Keruh',     min: 50,  max: 100, cls: 'danger',  note: 'Filter perlu dibersihkan; alga terlalu padat' },
          { label: 'Sangat Keruh', min: 100, max: 999, cls: 'danger', note: 'Ganti sebagian air, bersihkan sistem' },
        ],
        affects: 'Penetrasi cahaya ke zona akar/alga, konsentrasi sel alga (biomassa), kualitas air.',
        kaggleInsight: 'Dataset aquaponics IoT (ogbuokiriblessing, 12 kolam, 5-detik interval): turbidity diukur dengan sensor TS-300B. Nilai normal kolam ikan aquaponics: 5–40 NTU tergantung kepadatan ikan.',
        alhydraNovelt: '💡 NOVELTY: NTU dapat digunakan sebagai proxy biomassa alga. Hubungan linier NTU vs g/L dapat dikalibrasi dengan sampling manual 10 titik data.',
        tips: ['Bersihkan probe turbidity setiap minggu — endapan kalsium menyebabkan pembacaan palsu.', 'Untuk estimasi biomassa Chlorella: kalibrasi dengan spektrofotometer (OD680) vs NTU.', 'NTU sangat tinggi (>100) di kolam alga adalah tanda budidaya produktif, bukan masalah.'],
        hardware: 'Sensor optik analog (SEN0189 DFRobot atau TS-300B). Range 0–3000 NTU.',
      },
      {
        id: 'temp_water',
        name: 'Water Temperature (DS18B20)',
        icon: 'fa-water',
        color: '#06B6D4',
        dataKey: 'temp_water',
        what: 'Suhu larutan nutrisi yang kontak langsung dengan akar tanaman atau media kultur alga. Diukur dengan sensor suhu tahan air.',
        ranges: [
          { label: 'Terlalu Dingin', min: 0,  max: 15, cls: 'danger',  note: 'Metabolisme terhambat, risiko Pythium' },
          { label: 'Optimal Hidro',  min: 15, max: 22, cls: 'good',    note: 'Ideal untuk sayuran daun' },
          { label: 'Optimal Alga',   min: 22, max: 28, cls: 'good',    note: 'Optimal Chlorella dan Scenedesmus' },
          { label: 'Hangat',         min: 28, max: 32, cls: 'warning', note: 'Oksigen terlarut menurun' },
          { label: 'Terlalu Panas',  min: 32, max: 50, cls: 'danger',  note: 'Stres panas, mortalitas akar dan alga' },
        ],
        affects: 'Kelarutan oksigen (DO), laju penyerapan nutrisi akar, pertumbuhan patogen air, laju pertumbuhan alga.',
        kaggleInsight: 'Dataset aquaponics IoT (bobsis, Kaggle): suhu air tilapia system: 24–27°C optimal. Dataset aquaponics sensor (ogbuokiriblessing): suhu 25.5–30.5°C untuk ikan air hangat.',
        tips: ['DO berkurang ~0.2 mg/L per 1°C kenaikan suhu — pantau DO saat suhu >28°C.', 'Isolasi tanki nutrisi dari paparan matahari langsung.', 'Aerasi kuat membantu menstabilkan suhu dan meningkatkan DO.'],
        hardware: 'DS18B20 waterproof probe (kabel 1-Wire). Akurasi ±0.5°C, range -55 hingga +125°C.',
      },
      {
        id: 'temp_ambient',
        name: 'Ambient Temperature (DHT11)',
        icon: 'fa-temperature-half',
        color: '#EF4444',
        dataKey: 'temp_ambient',
        what: 'Suhu udara sekitar di dalam greenhouse atau area kultivasi. Mempengaruhi transpirasi tanaman, laju evaporasi, dan kondisi kerja sensor.',
        ranges: [
          { label: 'Terlalu Dingin', min: 0,  max: 15, cls: 'danger',  note: 'Pertumbuhan lambat, risiko frost' },
          { label: 'Sejuk',          min: 15, max: 20, cls: 'good',    note: 'Ideal untuk selada, bayam, mint' },
          { label: 'Hangat',         min: 20, max: 28, cls: 'good',    note: 'Optimal untuk sebagian besar tanaman tropis' },
          { label: 'Panas',          min: 28, max: 35, cls: 'warning', note: 'Tingkatkan ventilasi; risiko heat stress' },
          { label: 'Sangat Panas',   min: 35, max: 50, cls: 'danger',  note: 'Inhibisi alga, kerusakan tanaman' },
        ],
        affects: 'Laju transpirasi, evaporasi, fotosintesis, kondisi pertumbuhan alga.',
        kaggleInsight: 'Smart Farming Sensor Data (Kaggle, atharvasoundankar 2024): temperature ambient normal untuk lahan pertanian di Asia Tenggara: 22–32°C. Korelasi positif lemah dengan hasil panen (r≈0.15).',
        tips: ['DHT11 memiliki akurasi ±2°C — cukup untuk monitoring kasar.', 'Untuk akurasi lebih baik, gunakan DHT22 (±0.5°C) atau SHT31.', 'Tempatkan sensor di tempat teduh, jauh dari sumber panas langsung.'],
        hardware: 'DHT11: digital single-wire protocol, range 0–50°C, resolusi 1°C.',
      },
      {
        id: 'humidity',
        name: 'Humidity (DHT11)',
        icon: 'fa-wind',
        color: '#8B5CF6',
        dataKey: 'humidity',
        what: 'Kelembaban relatif udara (RH%). Mempengaruhi laju transpirasi tanaman dan risiko penyakit jamur.',
        ranges: [
          { label: 'Kering',         min: 0,  max: 40, cls: 'danger',  note: 'Tanaman stress, stomata menutup' },
          { label: 'Rendah',         min: 40, max: 55, cls: 'warning', note: 'Transpirasi tinggi, kebutuhan air meningkat' },
          { label: 'Optimal',        min: 55, max: 80, cls: 'good',    note: 'Ideal untuk sebagian besar tanaman hidroponik' },
          { label: 'Lembab',         min: 80, max: 90, cls: 'warning', note: 'Risiko powdery mildew meningkat' },
          { label: 'Sangat Lembab',  min: 90, max: 100, cls: 'danger', note: 'Risiko tinggi Botrytis dan busuk batang' },
        ],
        affects: 'Transpirasi daun, penyerapan Ca (stomata), risiko penyakit jamur, penguapan dari tangki nutrisi.',
        kaggleInsight: 'DHT11 Temperature and Humidity Sensor Dataset (Kaggle, edotfs): pembacaan 1 hari penuh menunjukkan fluktuasi harian RH 40–85% pada lingkungan semi-terbuka.',
        tips: ['Kelembaban tinggi + suhu tinggi = kondisi ideal Botrytis cinerea (busuk abu).', 'Sediakan ventilasi atau kipas angin saat RH >80%.', 'DHT11 hanya akurat ±5% RH — untuk aplikasi kritis gunakan SHT31 (±2% RH).'],
        hardware: 'DHT11: range 20–80% RH, resolusi 1%, sama modul dengan sensor suhu.',
      },
      {
        id: 'light',
        name: 'Light Intensity (LDR/BH1750)',
        icon: 'fa-sun',
        color: '#F59E0B',
        dataKey: 'light',
        what: 'Intensitas cahaya tampak yang diterima oleh tanaman dan alga. Satuan lux = lumen/m². Untuk fotosintesis, parameter kritis adalah PAR (Photosynthetically Active Radiation, 400–700 nm).',
        ranges: [
          { label: 'Gelap',         min: 0,     max: 200,   cls: 'danger',  note: 'Tidak cukup untuk fotosintesis' },
          { label: 'Redup',         min: 200,   max: 2000,  cls: 'warning', note: 'Cukup untuk tanaman shade-tolerant saja' },
          { label: 'Dalam Ruangan', min: 2000,  max: 10000, cls: 'warning', note: 'Memerlukan supplemental LED grow lights' },
          { label: 'Optimal Alga',  min: 5000,  max: 15000, cls: 'good',    note: '~80–250 µmol/m²/s PAR untuk Chlorella' },
          { label: 'Optimal Hidro', min: 15000, max: 40000, cls: 'good',    note: 'Ideal untuk sayuran daun dan herba' },
          { label: 'Cahaya Penuh',  min: 40000, max: 120000, cls: 'good',   note: 'Tomat, cabai, matahari langsung' },
        ],
        affects: 'Laju fotosintesis, produksi biomassa alga, kualitas nutrisi tanaman, warna dan rasa.',
        kaggleInsight: 'Solar Power Generation Data (Kaggle, anikannal): irradiasi puncak matahari di Asia Tenggara mencapai 800–1000 W/m², setara ~80.000–100.000 lux. Sistem tenaga surya ALHYDRA optimal saat lux tinggi = energy generation tinggi juga.',
        tips: ['Gunakan BH1750 (I²C) untuk pembacaan lux digital yang akurat — lebih baik dari LDR analog.', 'Lux ≠ PAR: faktor konversi kasar 1 µmol/m²/s PAR ≈ 54 lux (cahaya putih).', 'Supplemental LED: pilih spektrum 450 nm (biru) + 660 nm (merah) untuk efisiensi maksimum.'],
        hardware: 'BH1750: I²C, range 1–65535 lux, resolusi 1 lux. LDR analog: murah, akurasi rendah.',
      },
      {
        id: 'current_gen',
        name: 'Power Generation (ACS712)',
        icon: 'fa-solar-panel',
        color: '#10B981',
        dataKey: 'current_gen',
        what: 'Mengukur arus listrik dari panel surya dan turbin angin (sumber energi terbarukan). Nilai arus × tegangan = daya (Watt).',
        ranges: [
          { label: 'Tidak Ada Generasi', min: 0,   max: 0.1, cls: 'danger',  note: 'Malam hari atau tidak ada sinar matahari' },
          { label: 'Rendah',             min: 0.1, max: 0.5, cls: 'warning', note: 'Awan tebal atau angin lemah' },
          { label: 'Sedang',             min: 0.5, max: 1.5, cls: 'warning', note: 'Setengah kapasitas' },
          { label: 'Tinggi',             min: 1.5, max: 3.0, cls: 'good',    note: 'Kondisi solar/angin baik' },
          { label: 'Puncak',             min: 3.0, max: 10,  cls: 'good',    note: 'Jam puncak solar 09:00–15:00' },
        ],
        affects: 'Kemampuan menjalankan pompa, sensor, dan sistem tanpa jaringan listrik PLN.',
        kaggleInsight: 'Solar Power Generation Data (Kaggle): pola harian DC power: naik perlahan 06:00–10:00, puncak 10:00–14:00, turun 14:00–18:00. Wind & Solar Daily (Kaggle, henriupton): kombinasi solar+angin mengisi gap masing-masing.',
        tips: ['ACS712 tersedia dalam varian 5A, 20A, 30A — pilih sesuai kapasitas sistem.', 'Kalibrasi offset tegangan (VCC/2 = 0A) saat startup tanpa beban.', 'Pantau Energy Self-Sufficiency Index (ESI) = Gen/Cons × 100% di Analytics.'],
        hardware: 'ACS712 Hall Effect current sensor. Output analog 0–5V. Sensitivitas 66–185 mV/A tergantung varian.',
      },
      {
        id: 'current_cons',
        name: 'Power Consumption (ACS712)',
        icon: 'fa-bolt',
        color: '#F59E0B',
        dataKey: 'current_cons',
        what: 'Mengukur total konsumsi arus listrik sistem — pompa, sensor, controller, lampu LED grow lights. Nilai penting untuk manajemen energi terbarukan.',
        ranges: [
          { label: 'Minimal',    min: 0,   max: 0.2, cls: 'good',    note: 'Hanya sensor aktif, pompa off' },
          { label: 'Rendah',     min: 0.2, max: 0.5, cls: 'good',    note: 'Satu pompa aktif' },
          { label: 'Normal',     min: 0.5, max: 1.5, cls: 'good',    note: 'Operasi normal dengan dua pompa' },
          { label: 'Tinggi',     min: 1.5, max: 3.0, cls: 'warning', note: 'Tambah LED grow lights atau perangkat' },
          { label: 'Berlebihan', min: 3.0, max: 10,  cls: 'danger',  note: 'Melebihi kapasitas generasi terbarukan' },
        ],
        affects: 'Net energy balance, kebutuhan baterai, kelayakan operasi autonomous.',
        kaggleInsight: 'Solar Power Generation & Energy Consumption (Kaggle, pythonafroz): konsumsi sistem pertanian kecil: 50–200 W. Panel surya 100W + turbin 50W sudah cukup untuk sistem ALHYDRA standar.',
        tips: ['Jalankan pompa di jam peak solar (09:00–15:00) untuk efisiensi maksimum.', 'Pompa submersible 12V DC lebih hemat dari 220V AC pada skala kecil.', 'Pasang relay timer atau kontrol otomatis berbasis energy balance.'],
        hardware: 'ACS712 — sama dengan sensor generation. Pasang pada jalur beban utama sistem.',
      },
    ],

    // ── NUTRIENTS / NUTRISI ────────────────
    nutrients: [
      {
        id: 'nitrogen', symbol: 'N', name: 'Nitrogen', color: '#10B981',
        role: 'Komponen utama klorofil, protein, dan asam nukleat. Unsur makro primer untuk pertumbuhan vegetatif.',
        deficiency: 'Daun kuning dimulai dari daun tua (chlorosis), pertumbuhan kerdil, daun kecil.',
        excess: 'Pertumbuhan vegetatif berlebihan, buah sedikit, rentan penyakit, kualitas turun.',
        sources: 'Kalsium nitrat Ca(NO₃)₂, kalium nitrat KNO₃, amonium nitrat NH₄NO₃.',
        ppm: { seedling: '50–150', vegetative: '150–200', fruiting: '100–150' },
      },
      {
        id: 'phosphorus', symbol: 'P', name: 'Fosfor', color: '#8B5CF6',
        role: 'Energi sel (ATP/ADP), perkembangan akar, pembungaan, dan pematangan buah.',
        deficiency: 'Daun berwarna ungu/merah (pada daun tua), pertumbuhan akar buruk, pembungaan terlambat.',
        excess: 'Mengunci serapan Zn, Fe, Ca. Jarang terjadi pada hidroponik terkelola.',
        sources: 'Mono kalium fosfat KH₂PO₄ (paling umum di hidroponik).',
        ppm: { seedling: '30–60', vegetative: '30–60', fruiting: '50–100' },
      },
      {
        id: 'potassium', symbol: 'K', name: 'Kalium', color: '#F59E0B',
        role: 'Regulasi stomata, transport air dan nutrisi, kualitas buah, ketahanan penyakit.',
        deficiency: 'Tepi dan ujung daun tua mengering (tip/edge burn), buah berkualitas rendah.',
        excess: 'Bersaing dengan Mg dan Ca, menyebabkan defisiensi sekunder.',
        sources: 'Kalium nitrat KNO₃, kalium fosfat KH₂PO₄, kalium sulfat K₂SO₄.',
        ppm: { seedling: '100–200', vegetative: '150–250', fruiting: '200–350' },
      },
      {
        id: 'calcium', symbol: 'Ca', name: 'Kalsium', color: '#06B6D4',
        role: 'Struktur dinding sel, pembelahan sel, perkembangan titik tumbuh dan akar.',
        deficiency: 'Tip burn (ujung daun gosong), blossom end rot pada tomat, pertumbuhan pucuk abnormal.',
        excess: 'Sangat jarang. pH tinggi biasanya menyebabkan Ca mengendap.',
        sources: 'Kalsium nitrat Ca(NO₃)₂·4H₂O. Tidak larut dengan fosfat/sulfat — buat larutan A dan B terpisah.',
        ppm: { all: '150–250 ppm' },
      },
      {
        id: 'magnesium', symbol: 'Mg', name: 'Magnesium', color: '#34D399',
        role: 'Atom pusat klorofil, aktivator enzim, translokasi gula antar organ tanaman.',
        deficiency: 'Interveinal chlorosis pada daun tua (urat daun hijau, bagian di antara menguning).',
        excess: 'Jarang. Bersaing dengan Ca dan K pada konsentrasi sangat tinggi.',
        sources: 'Magnesium sulfat MgSO₄·7H₂O (Epsom Salt) — murah dan mudah didapat.',
        ppm: { all: '30–70 ppm' },
      },
      {
        id: 'iron', symbol: 'Fe', name: 'Zat Besi (Iron)', color: '#EF4444',
        role: 'Sintesis klorofil, respirasi, transfer elektron dalam fotosintesis.',
        deficiency: 'Interveinal chlorosis pada daun MUDA (kebalikan Mg) — urat tetap hijau, bagian di antara kuning.',
        excess: 'Toksik pada pH rendah — menyebabkan daun bercak coklat.',
        sources: 'Fe-EDTA atau Fe-DTPA (chelated iron) — tetap tersedia pada pH 5.5–7.0.',
        ppm: { all: '1–5 ppm (butuh chelated form)' },
      },
    ],

    // ── TROUBLESHOOTING ────────────────────
    troubleshooting: [
      {
        id: 'yellow_old',
        symptom: 'Daun tua menguning (chlorosis menyeluruh)',
        icon: '🟡',
        causes: ['Defisiensi Nitrogen (paling umum)', 'Defisiensi Magnesium (jika interveinal)', 'pH terlalu tinggi (>7.5) mengunci nutrisi'],
        solutions: ['Periksa pH — turunkan ke 5.5–6.5 untuk hidroponik', 'Tambah larutan nitrogen (Ca(NO₃)₂)', 'Cek EC — EC terlalu rendah = kekurangan nutrisi global'],
      },
      {
        id: 'tip_burn',
        symptom: 'Ujung daun gosong / coklat (tip burn)',
        icon: '🔥',
        causes: ['Defisiensi Kalsium lokal', 'Aliran udara tidak cukup (stomata tidak buka)', 'pH terlalu rendah mengunci Ca'],
        solutions: ['Tingkatkan aerasi/sirkulasi udara', 'Pastikan pH 6.0–6.5 (optimal serapan Ca)', 'Cek level Ca di nutrisi — minimal 150 ppm'],
      },
      {
        id: 'algae_bloom',
        symptom: 'Air berubah hijau pekat, NTU melonjak',
        icon: '🌊',
        causes: ['Cahaya masuk ke tangki nutrisi', 'Nutrisi N dan P berlebihan', 'Suhu air tinggi (>28°C)'],
        solutions: ['Tutup tangki nutrisi dari paparan cahaya', 'Bersihkan tangki dan ganti air sebagian', 'Turunkan suhu air — tambah aerasi'],
      },
      {
        id: 'root_rot',
        symptom: 'Akar berlendir, berwarna coklat/hitam',
        icon: '🦠',
        causes: ['Pythium sp. (water mold) — suhu air >24°C + DO rendah', 'Aerasi tidak cukup', 'Resirkulasi air kotor'],
        solutions: ['Turunkan suhu air ke <22°C', 'Tingkatkan aerasi (DO minimal 5 mg/L)', 'Cuci sistem dengan H₂O₂ 3% encer', 'Tambah beneficial bacteria (Bacillus subtilis)'],
      },
      {
        id: 'pump_issue',
        symptom: 'Pompa tidak mengalirkan air / tekanan lemah',
        icon: '⚠️',
        causes: ['Filter tersumbat', 'Voltase rendah (solar tidak cukup)', 'Pompa rusak atau impeller tersumbat'],
        solutions: ['Bersihkan filter pompa setiap 2 minggu', 'Cek energy balance di dashboard — pastikan generation > consumption', 'Periksa relay — cek status di Control Panel ALHYDRA'],
      },
      {
        id: 'ph_unstable',
        symptom: 'pH berfluktuasi drastis dalam sehari',
        icon: '📉',
        causes: ['Alga aktif (menyerap CO₂ siang hari, naikkan pH)', 'Buffer kapasitas rendah (nutrisi terlalu encer)', 'Aerasi CO₂ dari dekomposisi organik'],
        solutions: ['Tambah buffering agent (KHCO₃ atau K₂CO₃ kecil)', 'Tingkatkan EC nutrisi (min 1.0 mS/cm)', 'Pantau tren pH siang vs malam di ALHYDRA Monitoring'],
      },
      {
        id: 'energy_deficit',
        symptom: 'Power consumption > power generation',
        icon: '⚡',
        causes: ['Hari berawan/hujan (solar rendah)', 'Terlalu banyak perangkat aktif', 'Baterai habis'],
        solutions: ['Kurangi durasi pompa — jadwalkan saat puncak solar', 'Matikan LED grow light saat siang hari cukup', 'Tambah panel surya atau kapasitas baterai', 'Cek tren di Analytics view ALHYDRA'],
      },
    ],
  };

  // ── State ──────────────────────────────
  let activeTab  = 'plants';
  let activeItem = null;

  // ── Render tab content ─────────────────
  function renderPlants() {
    return `<div class="enc-card-grid">
      ${DATA.plants.map(p => `
        <div class="enc-card" onclick="ALHYDRA.encyclopedia.openDetail('plants','${p.id}')" style="--enc-c:${p.color}">
          <div class="enc-card-icon">${p.icon}</div>
          <div class="enc-card-info">
            <div class="enc-card-name">${p.name}</div>
            <div class="enc-card-latin">${p.latin}</div>
            <div class="enc-card-meta"><span class="enc-tag">${p.type}</span><span class="enc-tag">🌱 ${p.harvest}</span></div>
          </div>
          <i class="fa-solid fa-chevron-right enc-card-arrow"></i>
        </div>`).join('')}
    </div>`;
  }

  function renderAlgae() {
    return `<div class="enc-card-grid">
      ${DATA.algae.map(a => `
        <div class="enc-card" onclick="ALHYDRA.encyclopedia.openDetail('algae','${a.id}')" style="--enc-c:${a.color}">
          <div class="enc-card-icon" style="font-size:24px">${a.icon}</div>
          <div class="enc-card-info">
            <div class="enc-card-name">${a.name}</div>
            <div class="enc-card-latin">${a.family}</div>
            <div class="enc-card-meta" style="font-size:11px;color:var(--text-secondary)">${a.application}</div>
          </div>
          <i class="fa-solid fa-chevron-right enc-card-arrow"></i>
        </div>`).join('')}
    </div>`;
  }

  function renderSensors() {
    return `<div class="enc-card-grid">
      ${DATA.sensors.map(s => `
        <div class="enc-card" onclick="ALHYDRA.encyclopedia.openDetail('sensors','${s.id}')" style="--enc-c:${s.color}">
          <div class="enc-card-icon enc-sensor-icon" style="background:${s.color}20;color:${s.color}">
            <i class="fa-solid ${s.icon}"></i>
          </div>
          <div class="enc-card-info">
            <div class="enc-card-name">${s.name}</div>
            <div class="enc-card-latin" style="font-size:11px">${s.what.substring(0,60)}…</div>
          </div>
          <i class="fa-solid fa-chevron-right enc-card-arrow"></i>
        </div>`).join('')}
    </div>`;
  }

  function renderNutrients() {
    return `<div class="enc-nutrient-grid">
      ${DATA.nutrients.map(n => `
        <div class="enc-nutrient-card" onclick="ALHYDRA.encyclopedia.openDetail('nutrients','${n.id}')" style="--enc-c:${n.color}">
          <div class="enc-nutrient-symbol" style="color:${n.color}">${n.symbol}</div>
          <div class="enc-nutrient-name">${n.name}</div>
          <div class="enc-nutrient-role">${n.role.substring(0,70)}…</div>
        </div>`).join('')}
    </div>`;
  }

  function renderTroubleshooting() {
    return `<div class="enc-trouble-list">
      ${DATA.troubleshooting.map(t => `
        <div class="enc-trouble-item" onclick="ALHYDRA.encyclopedia.openDetail('troubleshooting','${t.id}')">
          <div class="enc-trouble-icon">${t.icon}</div>
          <div class="enc-trouble-content">
            <div class="enc-trouble-symptom">${t.symptom}</div>
            <div class="enc-trouble-causes">${t.causes[0]}${t.causes.length > 1 ? ` +${t.causes.length-1} lainnya` : ''}</div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:var(--text-muted)"></i>
        </div>`).join('')}
    </div>`;
  }

  // ── Render detail modal ────────────────
  function renderParamTable(params) {
    if (!params || !Object.keys(params).length) return '';
    const labels = { ph:'pH', ec:'EC', temp:'Suhu Air/Ambient', light:'Cahaya', do:'DO (Oksigen Terlarut)', humidity:'Kelembaban', co2:'CO₂', salinity:'Salinitas', photoperiod:'Fotoperiod' };
    return `<table class="enc-param-table">
      <thead><tr><th>Parameter</th><th>Min</th><th>Max</th><th>Satuan</th><th>Catatan</th></tr></thead>
      <tbody>
        ${Object.entries(params).map(([k,v]) => `
          <tr>
            <td>${labels[k] || k}</td>
            <td>${v.min !== undefined ? v.min : (v.val || '—')}</td>
            <td>${v.max !== undefined ? v.max : '—'}</td>
            <td>${v.unit}</td>
            <td style="font-size:11px;color:var(--text-secondary)">${v.note || ''}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
  }

  function renderRangeBar(ranges) {
    if (!ranges) return '';
    const clsColor = { good: 'var(--green)', warning: 'var(--amber)', danger: 'var(--red)' };
    return `<div class="enc-range-list">
      ${ranges.map(r => `
        <div class="enc-range-item">
          <div class="enc-range-dot" style="background:${clsColor[r.cls]}"></div>
          <div class="enc-range-info">
            <span class="enc-range-label">${r.label}</span>
            <span class="enc-range-vals">${r.min}–${r.max} ${r.unit || ''}</span>
          </div>
          <div class="enc-range-note">${r.note}</div>
        </div>`).join('')}
    </div>`;
  }

  function openDetail(category, itemId) {
    const collections = { plants: DATA.plants, algae: DATA.algae, sensors: DATA.sensors, nutrients: DATA.nutrients, troubleshooting: DATA.troubleshooting };
    const item = collections[category]?.find(i => i.id === itemId);
    if (!item) return;
    activeItem = item;

    const modal  = document.getElementById('enc-modal');
    const content = document.getElementById('enc-modal-content');
    if (!modal || !content) return;

    let html = '';

    if (category === 'plants') {
      const nutrientPills = Object.entries(item.nutrients || {}).map(([k,v]) => `<span class="enc-tag" style="background:rgba(16,185,129,0.1);color:var(--green)">${k}: ${v}</span>`).join('');
      html = `
        <div class="enc-detail-header" style="--enc-c:${item.color}">
          <span style="font-size:48px;line-height:1">${item.icon}</span>
          <div>
            <h2 style="margin:0;color:var(--text-primary)">${item.name}</h2>
            <em style="color:var(--text-secondary)">${item.latin}</em>
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
              <span class="enc-tag">${item.type}</span>
              <span class="enc-tag">🌱 Panen: ${item.harvest}</span>
            </div>
          </div>
        </div>
        <p class="enc-detail-desc">${item.description}</p>
        <h4>Parameter Optimal</h4>
        ${renderParamTable(item.params)}
        <h4>Nutrisi Utama</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">${nutrientPills}</div>
        <h4>Tips Budidaya</h4>
        <ul class="enc-tips-list">${(item.tips || []).map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="enc-source">📚 Sumber: ${item.source}</div>`;
    } else if (category === 'algae') {
      html = `
        <div class="enc-detail-header" style="--enc-c:${item.color}">
          <span style="font-size:48px;line-height:1">${item.icon}</span>
          <div>
            <h2 style="margin:0;color:var(--text-primary)">${item.name}</h2>
            <em style="color:var(--text-secondary)">${item.family}</em>
            <div style="margin-top:8px"><span class="enc-tag">${item.application}</span></div>
          </div>
        </div>
        <p class="enc-detail-desc">${item.description}</p>
        <h4>Kondisi Kultivasi Optimal</h4>
        ${renderParamTable(item.params)}
        <h4>Produktivitas</h4>
        <p style="background:var(--bg-elevated);padding:10px 14px;border-radius:var(--radius-sm);color:var(--green);font-family:var(--font-mono)">${item.productivity}</p>
        <h4>Tips Kultivasi</h4>
        <ul class="enc-tips-list">${(item.tips || []).map(t => `<li>${t}</li>`).join('')}</ul>
        <div class="enc-source">📚 Sumber: ${item.source}</div>`;
    } else if (category === 'sensors') {
      html = `
        <div class="enc-detail-header" style="--enc-c:${item.color}">
          <div class="enc-sensor-icon-lg" style="background:${item.color}20;color:${item.color}">
            <i class="fa-solid ${item.icon}"></i>
          </div>
          <div>
            <h2 style="margin:0;color:var(--text-primary)">${item.name}</h2>
            <div style="margin-top:6px"><span class="enc-tag">${item.hardware}</span></div>
          </div>
        </div>
        <p class="enc-detail-desc">${item.what}</p>
        <h4>Rentang Nilai & Status</h4>
        ${renderRangeBar(item.ranges)}
        <h4>Dampak terhadap Sistem</h4>
        <p style="color:var(--text-secondary);font-size:13px">${item.affects}</p>
        ${item.kaggleInsight ? `<h4>💡 Insight dari Dataset Kaggle</h4><div class="enc-kaggle-insight">${item.kaggleInsight}</div>` : ''}
        ${item.alhydraNovelt ? `<div class="enc-novelty-box">${item.alhydraNovelt}</div>` : ''}
        <h4>Tips Penggunaan</h4>
        <ul class="enc-tips-list">${(item.tips || []).map(t => `<li>${t}</li>`).join('')}</ul>`;
    } else if (category === 'nutrients') {
      html = `
        <div class="enc-detail-header" style="--enc-c:${item.color}">
          <div class="enc-nutrient-symbol-lg" style="color:${item.color}">${item.symbol}</div>
          <div>
            <h2 style="margin:0;color:var(--text-primary)">${item.name}</h2>
            <em style="color:var(--text-secondary);font-size:13px">${item.sources}</em>
          </div>
        </div>
        <h4>Fungsi dalam Tanaman</h4>
        <p style="color:var(--text-secondary);font-size:13px">${item.role}</p>
        <h4>⚠️ Tanda Defisiensi</h4>
        <p style="color:var(--amber);font-size:13px;background:rgba(245,158,11,0.08);padding:10px 14px;border-radius:var(--radius-sm)">${item.deficiency}</p>
        <h4>Kelebihan</h4>
        <p style="color:var(--red);font-size:13px;background:rgba(239,68,68,0.08);padding:10px 14px;border-radius:var(--radius-sm)">${item.excess}</p>
        <h4>Target PPM</h4>
        <table class="enc-param-table"><thead><tr><th>Fase</th><th>Target (ppm)</th></tr></thead><tbody>
          ${Object.entries(item.ppm || {}).map(([k,v]) => `<tr><td>${k === 'all' ? 'Semua Fase' : k}</td><td style="font-family:var(--font-mono);color:var(--green)">${v}</td></tr>`).join('')}
        </tbody></table>`;
    } else if (category === 'troubleshooting') {
      html = `
        <div class="enc-detail-header" style="--enc-c:#F59E0B">
          <span style="font-size:48px;line-height:1">${item.icon}</span>
          <div>
            <h2 style="margin:0;color:var(--text-primary);font-size:16px">${item.symptom}</h2>
          </div>
        </div>
        <h4>🔍 Penyebab Potensial</h4>
        <ul class="enc-tips-list">${(item.causes || []).map(c => `<li>${c}</li>`).join('')}</ul>
        <h4>✅ Solusi</h4>
        <ul class="enc-tips-list" style="--list-color:var(--green)">${(item.solutions || []).map(s => `<li>${s}</li>`).join('')}</ul>`;
    }

    content.innerHTML = html;
    modal.classList.add('open');
  }

  function closeDetail() {
    document.getElementById('enc-modal')?.classList.remove('open');
    activeItem = null;
  }

  // ── Switch tab ─────────────────────────
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.enc-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    renderCurrentTab();
  }

  function renderCurrentTab() {
    const body = document.getElementById('enc-body');
    if (!body) return;
    const renderers = { plants: renderPlants, algae: renderAlgae, sensors: renderSensors, nutrients: renderNutrients, troubleshooting: renderTroubleshooting };
    body.innerHTML = (renderers[activeTab] || renderPlants)();
  }

  // ── Search ─────────────────────────────
  function search(query) {
    if (!query.trim()) { renderCurrentTab(); return; }
    const q   = query.toLowerCase();
    const all = [...DATA.plants, ...DATA.algae, ...DATA.sensors, ...DATA.nutrients, ...DATA.troubleshooting];
    const hits = all.filter(item =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
    const body = document.getElementById('enc-body');
    if (!body) return;
    if (!hits.length) { body.innerHTML = '<div class="enc-empty">Tidak ada hasil untuk "' + query + '"</div>'; return; }
    body.innerHTML = `<div class="enc-search-results">
      <p style="color:var(--text-secondary);font-size:12px;margin-bottom:12px">${hits.length} hasil untuk "<strong>${query}</strong>"</p>
      ${hits.map(item => {
        const cat = DATA.plants.includes(item) ? 'plants' : DATA.algae.includes(item) ? 'algae' : DATA.sensors.includes(item) ? 'sensors' : DATA.nutrients.includes(item) ? 'nutrients' : 'troubleshooting';
        const icon = item.icon || (item.icon_fa ? `<i class="fa-solid ${item.icon_fa}"></i>` : '📄');
        return `<div class="enc-card" onclick="ALHYDRA.encyclopedia.openDetail('${cat}','${item.id}')" style="--enc-c:${item.color||'#10B981'}">
          <div class="enc-card-icon">${typeof icon === 'string' && icon.startsWith('<') ? icon : icon}</div>
          <div class="enc-card-info">
            <div class="enc-card-name">${item.name}</div>
            <div class="enc-card-latin" style="font-size:11px;color:var(--text-secondary)">${cat.charAt(0).toUpperCase()+cat.slice(1)}</div>
          </div>
          <i class="fa-solid fa-chevron-right enc-card-arrow"></i>
        </div>`;
      }).join('')}
    </div>`;
  }

  // ── Init ───────────────────────────────
  function init() { /* Rendered on demand when view is activated */ }

  function onEnter() {
    renderCurrentTab();

    document.querySelectorAll('.enc-tab-btn').forEach(b => {
      b.addEventListener('click', () => switchTab(b.dataset.tab));
    });

    document.getElementById('enc-search')?.addEventListener('input', e => search(e.target.value));

    document.getElementById('enc-modal-close')?.addEventListener('click', closeDetail);
    document.getElementById('enc-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('enc-modal')) closeDetail();
    });
  }

  return { init, onEnter, openDetail, closeDetail, switchTab, search };
})();
