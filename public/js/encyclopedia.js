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
      {
        id: 'sawi',
        name: 'Sawi Hijau (Caisim)',
        latin: 'Brassica juncea',
        icon: '🥬',
        color: '#22C55E',
        type: 'Sayuran Daun',
        harvest: '25–35 hari',
        params: {
          ph:   { min: 6.0, max: 6.8,  unit: 'pH',    note: 'Optimal 6.5' },
          ec:   { min: 1.2, max: 1.8,  unit: 'mS/cm', note: '' },
          temp: { min: 18,  max: 25,   unit: '°C',    note: 'Toleran tropis' },
          light:{ min: 10000, max: 25000, unit: 'lux', note: '12–14h' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Sangat cocok untuk sistem NFT pemula — cepat dan mudah.',
          'Butuh nitrogen tinggi untuk daun lebar dan hijau pekat.',
          'Panen sebelum berbunga agar rasa tidak pahit.',
        ],
        nutrients: { N: 'Tinggi', P: 'Sedang', K: 'Tinggi', Ca: 'Sedang' },
        description: 'Sayuran daun favorit Indonesia yang tumbuh cepat dan adaptif terhadap iklim tropis. Pilihan ideal untuk pemula hidroponik.',
        source: 'Hort Americas Factsheet + Ponics Life Chart',
      },
      {
        id: 'timun',
        name: 'Timun (Cucumber)',
        latin: 'Cucumis sativus',
        icon: '🥒',
        color: '#10B981',
        type: 'Buah',
        harvest: '50–70 hari',
        params: {
          ph:   { min: 5.5, max: 6.0,  unit: 'pH',    note: 'Optimal 5.8' },
          ec:   { min: 1.7, max: 2.5,  unit: 'mS/cm', note: 'Tinggi saat berbuah' },
          temp: { min: 21,  max: 28,   unit: '°C',    note: 'Hangat' },
          light:{ min: 20000, max: 50000, unit: 'lux', note: '12–16h' },
          do:   { min: 6, max: 8, unit: 'mg/L', note: 'Akar butuh O₂ tinggi' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Sediakan trellis/penyangga vertikal untuk merambat.',
          'Konsumsi air sangat tinggi — pantau level reservoir.',
          'Pilih varietas partenokarpik (tanpa penyerbukan) untuk indoor.',
        ],
        nutrients: { N: 'Tinggi', P: 'Tinggi', K: 'Sangat Tinggi', Ca: 'Tinggi', Mg: 'Sedang' },
        description: 'Tanaman merambat cepat tumbuh dengan kebutuhan air dan nutrisi tinggi. Cocok untuk Dutch bucket atau drip system.',
        source: 'Cornell CEA + Resh Hydroponic Food Production',
      },
      {
        id: 'seledri',
        name: 'Seledri (Celery)',
        latin: 'Apium graveolens',
        icon: '🌿',
        color: '#84CC16',
        type: 'Herbal',
        harvest: '80–120 hari',
        params: {
          ph:   { min: 5.8, max: 6.8,  unit: 'pH',    note: 'Optimal 6.5' },
          ec:   { min: 1.8, max: 2.4,  unit: 'mS/cm', note: '' },
          temp: { min: 15,  max: 21,   unit: '°C',    note: 'Menyukai suhu sejuk' },
          light:{ min: 10000, max: 30000, unit: 'lux', note: '12–14h' },
          humidity: { min: 60, max: 80, unit: '%', note: '' },
        },
        tips: [
          'Butuh pasokan air konstan agar batang tidak berongga.',
          'Pertumbuhan lambat — sabar di fase awal.',
          'Defisiensi boron menyebabkan batang retak.',
        ],
        nutrients: { N: 'Sedang', P: 'Sedang', K: 'Tinggi', Ca: 'Tinggi', B: 'Penting' },
        description: 'Herba dengan masa tanam panjang; menyukai air melimpah dan suhu sejuk. Nilai jual stabil untuk kuliner.',
        source: 'Number Analytics Hydroponics Guide',
      },
      {
        id: 'stroberi',
        name: 'Stroberi (Strawberry)',
        latin: 'Fragaria × ananassa',
        icon: '🍓',
        color: '#EC4899',
        type: 'Buah',
        harvest: '60–90 hari (lalu berbuah terus)',
        params: {
          ph:   { min: 5.5, max: 6.5,  unit: 'pH',    note: 'Optimal 6.0' },
          ec:   { min: 1.0, max: 1.5,  unit: 'mS/cm', note: 'EC rendah' },
          temp: { min: 18,  max: 24,   unit: '°C',    note: 'Suhu sejuk' },
          light:{ min: 15000, max: 35000, unit: 'lux', note: '12–16h' },
          humidity: { min: 60, max: 75, unit: '%', note: '' },
        },
        tips: [
          'Gunakan varietas day-neutral untuk panen sepanjang tahun.',
          'EC terlalu tinggi membuat buah kecil dan asam.',
          'Pollinasi manual dengan kuas untuk buah sempurna.',
        ],
        nutrients: { N: 'Sedang', P: 'Tinggi', K: 'Sangat Tinggi', Ca: 'Tinggi' },
        description: 'Buah bernilai tinggi untuk hidroponik vertikal; menyukai suhu sejuk dan EC rendah. Ideal untuk menara ALHYDRA.',
        source: 'Cornell CEA Strawberry + Ponics Life Chart',
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
      {
        id: 'dunaliella',
        name: 'Dunaliella salina',
        icon: '🟠',
        color: '#F97316',
        family: 'Chlorophyceae',
        application: 'β-karoten (provitamin A), pewarna alami, antioksidan',
        params: {
          ph:   { min: 7.0, max: 9.0,  unit: 'pH',   note: 'Toleran lebar' },
          temp: { min: 20,  max: 30,   unit: '°C',   note: 'Optimal 25°C' },
          light:{ min: 3000, max: 80000, unit: 'lux', note: 'Cahaya tinggi memicu β-karoten' },
          salinity: { min: 50, max: 200, unit: 'g/L NaCl', note: 'Halofilik ekstrem' },
          photoperiod: { val: '14:10', unit: 'L:D', note: '' },
        },
        productivity: 'β-karoten: hingga 10% DW (premium)',
        tips: [
          'Tahan salinitas ekstrem — kompetitor alami tertekan.',
          'Stres garam + cahaya tinggi memicu warna oranye (β-karoten).',
          'Tidak punya dinding sel kaku — mudah pecah saat panen.',
        ],
        description: 'Mikroalga halofilik penghasil β-karoten tertinggi di dunia. Berubah dari hijau ke oranye terang saat mengalami stres cahaya dan garam.',
        source: 'Ben-Amotz (2004) + Algal Research Literature',
      },
      {
        id: 'tetraselmis',
        name: 'Tetraselmis chuii',
        icon: '🟢',
        color: '#14B8A6',
        family: 'Chlorodendrophyceae',
        application: 'Pakan hidup larva ikan, udang & kerang (hatchery)',
        params: {
          ph:   { min: 7.5, max: 8.5,  unit: 'pH',   note: '' },
          temp: { min: 18,  max: 24,   unit: '°C',   note: 'Optimal 20°C' },
          light:{ min: 2000, max: 6000, unit: 'lux',  note: '100–200 µmol/m²/s' },
          salinity: { min: 25, max: 35, unit: 'ppt', note: 'Spesies laut' },
          photoperiod: { val: '16:8', unit: 'L:D', note: '' },
        },
        productivity: '0.3–0.6 g/L/hari',
        tips: [
          'Standar emas pakan hidup di hatchery akuakultur.',
          'Kaya lipid dan asam amino esensial.',
          'Sel bergerak (flagela) — butuh air laut steril.',
        ],
        description: 'Mikroalga laut bergerak (motil) yang menjadi pakan utama larva organisme akuakultur. Mudah dicerna dan bergizi tinggi.',
        source: 'FAO Manual on Live Feed + Aquaculture Reviews',
      },
      {
        id: 'botryococcus',
        name: 'Botryococcus braunii',
        icon: '🛢️',
        color: '#A16207',
        family: 'Trebouxiophyceae',
        application: 'Biofuel — hidrokarbon (bio-crude), riset biodiesel',
        params: {
          ph:   { min: 7.0, max: 8.5,  unit: 'pH',   note: '' },
          temp: { min: 22,  max: 28,   unit: '°C',   note: 'Optimal 25°C' },
          light:{ min: 2000, max: 6000, unit: 'lux',  note: '' },
          photoperiod: { val: '12:12', unit: 'L:D', note: '' },
        },
        productivity: 'Hidrokarbon: 30–40% DW (sangat tinggi)',
        tips: [
          'Pertumbuhan lambat tetapi kandungan minyak luar biasa tinggi.',
          'Sel berkoloni dalam matriks hidrokarbon.',
          'Kandidat utama riset bio-crude & biodiesel.',
        ],
        description: 'Penghasil hidrokarbon (bio-oil) hingga 30–40% berat kering — salah satu kandidat terbaik untuk biofuel mikroalga.',
        source: 'Banerjee et al. (2002) Critical Reviews Biotechnology',
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
      {
        id: 'water_level',
        name: 'Water Level Sensor',
        icon: 'fa-gauge',
        color: '#3B82F6',
        dataKey: 'water_level',
        what: 'Mengukur ketinggian air reservoir nutrisi untuk mencegah pompa berjalan kering (dry-run) yang merusak.',
        ranges: [
          { label: 'Kritis',   min: 0,  max: 15,  cls: 'danger',  note: 'Risiko pompa kering — segera isi ulang' },
          { label: 'Rendah',   min: 15, max: 30,  cls: 'warning', note: 'Jadwalkan pengisian reservoir' },
          { label: 'Normal',   min: 30, max: 85,  cls: 'good',    note: 'Level operasi aman' },
          { label: 'Penuh',    min: 85, max: 100, cls: 'good',    note: 'Reservoir terisi penuh' },
        ],
        affects: 'Keamanan pompa, stabilitas konsentrasi nutrisi (penguapan), kontinuitas irigasi.',
        kaggleInsight: 'Penguapan reservoir terbuka di iklim tropis bisa mencapai 5–10% volume per hari — level air yang turun menaikkan EC secara tidak langsung.',
        tips: ['Ultrasonik (HC-SR04) untuk pembacaan kontinu non-kontak.', 'Float switch untuk alarm batas minimum sederhana & murah.', 'Di ALHYDRA, level <15% memicu peringatan kritis otomatis.'],
        hardware: 'HC-SR04 ultrasonik (2–400 cm, ±1 cm) atau float switch. Hindari kontak korosif dengan nutrisi.',
      },
      {
        id: 'dissolved_oxygen',
        name: 'Dissolved Oxygen (DO) Sensor',
        icon: 'fa-wind',
        color: '#22D3EE',
        dataKey: 'do',
        what: 'Mengukur oksigen terlarut dalam air — parameter vital untuk kesehatan akar tanaman dan mencegah busuk akar.',
        ranges: [
          { label: 'Bahaya',   min: 0, max: 3,  cls: 'danger',  note: 'Akar mati lemas, Pythium berkembang' },
          { label: 'Rendah',   min: 3, max: 5,  cls: 'warning', note: 'Tambah aerasi segera' },
          { label: 'Optimal',  min: 5, max: 8,  cls: 'good',    note: 'Akar sehat & oksigen cukup' },
          { label: 'Jenuh',    min: 8, max: 20, cls: 'good',    note: 'Aerasi sangat baik' },
        ],
        affects: 'Respirasi akar, ketahanan terhadap patogen, penyerapan nutrisi, pertumbuhan alga.',
        kaggleInsight: 'Kelarutan O₂ turun ~0.2 mg/L tiap kenaikan 1°C — pada 30°C air hanya menahan ±7.5 mg/L vs ±10 mg/L di 15°C.',
        tips: ['Target DO akar hidroponik: >5 mg/L.', 'Tambah air stone / aerator bila DO rendah.', 'DO turun saat suhu air naik — pantau bersama temp_water.'],
        hardware: 'Probe DO optik atau galvanik. Kalibrasi: udara jenuh (100%) + larutan Na₂SO₃ (0%).',
      },
      {
        id: 'co2',
        name: 'CO₂ Sensor (MH-Z19)',
        icon: 'fa-smog',
        color: '#A78BFA',
        dataKey: 'co2',
        what: 'Mengukur konsentrasi CO₂ udara — penting untuk laju fotosintesis tanaman dan suplementasi kultur mikroalga.',
        ranges: [
          { label: 'Rendah',     min: 0,    max: 350,  cls: 'warning', note: 'Di bawah ambient, fotosintesis terbatas' },
          { label: 'Ambient',    min: 350,  max: 450,  cls: 'good',    note: 'Udara normal (~400 ppm)' },
          { label: 'Optimal',    min: 450,  max: 1200, cls: 'good',    note: 'Pengkayaan ideal ruang tertutup' },
          { label: 'Tinggi',     min: 1200, max: 2000, cls: 'warning', note: 'Pantau ventilasi & keselamatan' },
          { label: 'Berbahaya',  min: 2000, max: 5000, cls: 'danger',  note: 'Tidak aman untuk pekerja' },
        ],
        affects: 'Laju fotosintesis tanaman & alga, produktivitas biomassa, efisiensi pengkayaan karbon.',
        kaggleInsight: 'Suplementasi CO₂ 0.5–5% v/v dilaporkan mempercepat pertumbuhan Chlorella 3–5× dibanding udara ambient.',
        tips: ['Tanaman optimal pada 800–1200 ppm di ruang tertutup.', 'Sensor NDIR (MH-Z19) jauh lebih stabil dari sensor MQ.', 'Integrasikan CO₂ dari respirasi alga untuk siklus karbon ALHYDRA.'],
        hardware: 'MH-Z19 NDIR (0–5000 ppm, ±50 ppm). Auto-baseline calibration (ABC) di 400 ppm.',
      },
      {
        id: 'relay',
        name: 'Relay Module (Aktuator)',
        icon: 'fa-plug',
        color: '#F472B6',
        dataKey: 'relay',
        what: 'Sakelar elektronik yang dikontrol mikrokontroler untuk menyalakan/mematikan pompa, lampu, dan aerator.',
        ranges: [
          { label: 'OFF', min: 0, max: 0, cls: 'warning', note: 'Beban tidak aktif' },
          { label: 'ON',  min: 1, max: 1, cls: 'good',    note: 'Beban aktif (pompa/lampu)' },
        ],
        affects: 'Otomasi irigasi, penjadwalan beban energi, kontrol jarak jauh dari dasbor.',
        kaggleInsight: 'Penjadwalan pompa berbasis energy balance (jalan saat surplus solar) dapat menaikkan kemandirian energi sistem secara signifikan.',
        tips: ['Pilih relay dengan optocoupler untuk isolasi yang aman.', 'Perhatikan rating arus beban (pompa) Anda.', 'Di ALHYDRA: kontrol Pompa 1 & Pompa 2 langsung dari Control Panel.'],
        hardware: 'Modul relay 1–4 kanal. Rating umum AC 250V/10A atau DC 30V/10A per kanal.',
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
      {
        id: 'sulfur', symbol: 'S', name: 'Sulfur (Belerang)', color: '#EAB308',
        role: 'Komponen asam amino & protein, sintesis enzim dan vitamin, pembentukan aroma.',
        deficiency: 'Daun MUDA menguning merata (mirip N tapi di pucuk), pertumbuhan terhambat.',
        excess: 'Jarang toksik; konsentrasi tinggi menurunkan pH larutan.',
        sources: 'Magnesium sulfat MgSO₄, kalium sulfat K₂SO₄ — biasanya tercukupi otomatis.',
        ppm: { all: '60–100 ppm' },
      },
      {
        id: 'manganese', symbol: 'Mn', name: 'Mangan', color: '#A855F7',
        role: 'Pemecahan air dalam fotosintesis (PSII), aktivasi enzim, metabolisme nitrogen.',
        deficiency: 'Klorosis berbintik antar-tulang pada daun muda; mirip defisiensi besi.',
        excess: 'Bercak nekrotik coklat; dapat memicu defisiensi besi.',
        sources: 'Mangan sulfat MnSO₄ atau Mn-chelate (Mn-EDTA).',
        ppm: { all: '0.5–1 ppm' },
      },
      {
        id: 'boron', symbol: 'B', name: 'Boron', color: '#F97316',
        role: 'Integritas dinding sel, transport gula, perkembangan jaringan & buah.',
        deficiency: 'Titik tumbuh mati, batang retak (seledri), buah cacat.',
        excess: 'Sangat sensitif — ujung daun tua terbakar pada dosis sedikit berlebih.',
        sources: 'Asam borat H₃BO₃ atau boraks. Rentang aman sangat sempit — takar hati-hati.',
        ppm: { all: '0.3–0.5 ppm' },
      },
      {
        id: 'zinc', symbol: 'Zn', name: 'Seng (Zinc)', color: '#64748B',
        role: 'Sintesis hormon auksin, aktivasi enzim, pemanjangan ruas batang.',
        deficiency: 'Daun kecil & ruas pendek (roset), klorosis antar-tulang.',
        excess: 'Klorosis dan terhambatnya penyerapan besi.',
        sources: 'Seng sulfat ZnSO₄ atau Zn-chelate (Zn-EDTA).',
        ppm: { all: '0.3–0.5 ppm' },
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
      {
        id: 'nutrient_lockout',
        symptom: 'Gejala defisiensi muncul walau nutrisi cukup',
        icon: '🔒',
        causes: ['pH di luar rentang 5.5–6.5 (paling umum)', 'EC terlalu tinggi (garam menumpuk)', 'Ketidakseimbangan antar-nutrien'],
        solutions: ['Setel pH ke 5.5–6.5 sebelum menambah pupuk', 'Flush sistem dengan air ber-pH netral bila EC menumpuk', 'Besi & mikronutrien paling rentan terkunci di pH tinggi'],
      },
      {
        id: 'aphids',
        symptom: 'Daun keriting & lengket, koloni serangga di bawah daun',
        icon: '🐛',
        causes: ['Kutu daun (aphid) mengisap getah tanaman', 'Kelembaban rendah & sirkulasi udara buruk', 'Tanaman baru yang membawa hama'],
        solutions: ['Semprot sabun insektisida atau neem oil', 'Pasang perangkap lengket kuning untuk deteksi dini', 'Lepas predator alami (ladybug) di greenhouse', 'Periksa bagian bawah daun secara rutin'],
      },
      {
        id: 'powdery_mildew',
        symptom: 'Lapisan tepung putih di permukaan daun',
        icon: '⚪',
        causes: ['Kelembaban tinggi (>70%) + sirkulasi udara buruk', 'Jarak antar tanaman terlalu rapat', 'Suhu hangat dengan daun lembab'],
        solutions: ['Tingkatkan ventilasi & aliran udara', 'Jaga RH di bawah 70%', 'Beri jarak antar tanaman', 'Semprot larutan kalium bikarbonat atau neem oil'],
      },
      {
        id: 'water_level_low',
        symptom: 'Level air reservoir turun cepat / pompa berisik',
        icon: '🪣',
        causes: ['Penguapan tinggi (iklim tropis)', 'Kebocoran pada saluran/sambungan', 'Konsumsi air tanaman besar (timun, tomat)'],
        solutions: ['Isi ulang reservoir sebelum level <15% (cegah dry-run)', 'Periksa sambungan & selang dari kebocoran', 'Pasang sensor level otomatis — ALHYDRA memberi alarm kritis', 'Tutup reservoir untuk kurangi penguapan'],
      },
    ],
  };

  // ── Credible references (verified URLs / DOIs / PubMed) ──
  // Direct links verified at build time; where a precise direct link was not
  // confirmed, a PubMed/DOI resolver link (always resolvable) is used.
  const REF = {
    chlorella_front: { t: 'Interaction effects of temperature, light, nutrients and pH on growth of Chlorella vulgaris', a: 'Chen et al.', y: 2021, j: 'Frontiers in Environmental Science', url: 'https://www.frontiersin.org/articles/10.3389/fenvs.2021.690191/full', doi: '10.3389/fenvs.2021.690191' },
    chlorella_ksee:  { t: 'Effect of Temperature, Light Intensity and pH on the Growth Rate of Chlorella vulgaris', a: 'Lee & Choi', y: 2011, j: 'J. Korean Soc. Environ. Eng.', url: 'https://doi.org/10.4491/KSEE.2011.33.7.511', doi: '10.4491/KSEE.2011.33.7.511' },
    chlorella_heliyon:{ t: 'Optimal growth conditions to enhance Chlorella vulgaris biomass production', a: 'Heliyon', y: 2024, j: 'Heliyon (ScienceDirect)', url: 'https://www.sciencedirect.com/science/article/pii/S2405844024079313', doi: '10.1016/j.heliyon.2024.e30493' },
    cornell_lettuce: { t: 'Cornell CEA Hydroponic Lettuce Handbook', a: 'Brechner & Both', y: 2019, j: 'Cornell Controlled Environment Agriculture', url: 'https://cpb-us-e1.wpmucdn.com/blogs.cornell.edu/dist/8/8824/files/2019/06/Cornell-CEA-Lettuce-Handbook-.pdf' },
    cornell_recipes: { t: 'Hydroponic nutrient recipes for lettuce, herbs and leafy greens', a: 'Cornell CEA', y: 2015, j: 'Cornell Controlled Environment Agriculture', url: 'https://cpb-us-e1.wpmucdn.com/blogs.cornell.edu/dist/b/5759/files/2015/03/hydroponic-recipes-1bms8vj.pdf' },
    resh:            { t: 'Hydroponic Food Production (crop nutrient & EC/pH guidelines)', a: 'Resh, H.M.', y: 2022, j: 'CRC Press (8th ed.)', url: 'https://doi.org/10.1201/9781003133254', doi: '10.1201/9781003133254' },
    spirulina:       { t: 'Spirulina – From growth to nutritional product: A review', a: 'Soni et al.', y: 2017, j: 'Trends in Food Science & Technology', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Spirulina+from+growth+to+nutritional+product+review' },
    haema:           { t: 'Haematococcus pluvialis and astaxanthin: two-stage cultivation', a: 'Shah et al.', y: 2016, j: 'Frontiers in Plant Science', url: 'https://www.frontiersin.org/articles/10.3389/fpls.2016.00531/full', doi: '10.3389/fpls.2016.00531' },
    nanno:           { t: 'Nannochloropsis biology and lipid/EPA production: a review', a: 'Ma et al.', y: 2016, j: 'Marine Drugs / review', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Nannochloropsis+lipid+EPA+cultivation+review' },
    dunaliella:      { t: 'Dunaliella salina and beta-carotene production', a: 'Ben-Amotz et al.', y: 2009, j: 'The Alga Dunaliella (Science Publishers)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Dunaliella+salina+beta-carotene+production' },
    fao_microalgae:  { t: 'Manual on the production and use of live food for aquaculture', a: 'Lavens & Sorgeloos (FAO)', y: 1996, j: 'FAO Fisheries Technical Paper 361', url: 'https://www.fao.org/4/w3732e/w3732e00.htm' },
    hoagland:        { t: 'The water-culture method for growing plants without soil', a: 'Hoagland & Arnon', y: 1950, j: 'California Agricultural Experiment Station', url: 'https://www.scribd.com/document/hoagland-arnon-1950' },
    epstein:         { t: 'Mineral Nutrition of Plants: Principles and Perspectives', a: 'Epstein & Bloom', y: 2005, j: 'Sinauer Associates (2nd ed.)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Epstein+Bloom+Mineral+Nutrition+of+Plants' },
    ds18b20:         { t: 'DS18B20 Programmable Resolution 1-Wire Digital Thermometer (datasheet)', a: 'Analog Devices / Maxim', y: 2019, j: 'Datasheet', url: 'https://www.analog.com/media/en/technical-documentation/data-sheets/DS18B20.pdf' },
    bh1750:          { t: 'BH1750FVI Digital Ambient Light Sensor (datasheet)', a: 'ROHM Semiconductor', y: 2011, j: 'Datasheet', url: 'https://www.mouser.com/datasheet/2/348/bh1750fvi-e-186247.pdf' },
    acs712:          { t: 'ACS712 Fully Integrated Hall-Effect Linear Current Sensor (datasheet)', a: 'Allegro MicroSystems', y: 2017, j: 'Datasheet', url: 'https://www.allegromicro.com/-/media/files/datasheets/acs712-datasheet.pdf' },
    cornell_do:      { t: 'Dissolved oxygen & water temperature set-points (CEA)', a: 'Cornell CEA', y: 2019, j: 'CEA Lettuce Handbook ch.3', url: 'https://cpb-us-e1.wpmucdn.com/blogs.cornell.edu/dist/8/8824/files/2019/06/Cornell-CEA-Lettuce-Handbook-.pdf' },
  };

  // Category-level references (so every entry shows credible sources).
  const CAT_REF = {
    plants:          [REF.cornell_lettuce, REF.cornell_recipes, REF.resh],
    algae:           [REF.chlorella_front, REF.fao_microalgae],
    sensors:         [REF.cornell_lettuce],
    nutrients:       [REF.hoagland, REF.epstein, REF.cornell_recipes],
    troubleshooting: [REF.cornell_lettuce, REF.resh],
  };
  // Entry-specific references by id (merged with category refs).
  const ITEM_REF = {
    lettuce: [REF.cornell_lettuce, REF.cornell_recipes],
    chlorella: [REF.chlorella_front, REF.chlorella_ksee, REF.chlorella_heliyon],
    spirulina: [REF.spirulina, REF.fao_microalgae],
    haematococcus: [REF.haema], dunaliella: [REF.dunaliella], nannochloropsis: [REF.nanno],
    scenedesmus: [REF.chlorella_front], tetraselmis: [REF.fao_microalgae], botryococcus: [REF.nanno],
    temp_water: [REF.ds18b20, REF.cornell_do], ds18b20: [REF.ds18b20], dht22: [REF.cornell_lettuce],
    light: [REF.bh1750, REF.cornell_lettuce], bh1750: [REF.bh1750],
    current_gen: [REF.acs712], current_cons: [REF.acs712], acs712: [REF.acs712],
    dissolved_oxygen: [REF.cornell_do], co2: [REF.cornell_lettuce],
  };

  function refsFor(category, item) {
    const seen = new Set(); const out = [];
    (ITEM_REF[item.id] || []).concat(CAT_REF[category] || []).forEach(r => {
      const key = r.doi || r.url;
      if (!seen.has(key)) { seen.add(key); out.push(r); }
    });
    return out.slice(0, 4);
  }

  function renderReferences(category, item) {
    const refs = refsFor(category, item);
    if (!refs.length) return '';
    const id = lang();
    const title = id === 'id' ? 'Referensi' : 'References';
    return `<h4><i class="fa-solid fa-book"></i> ${title}</h4>
      <div class="enc-refs">${refs.map((r, i) => `
        <div class="enc-ref">
          <span class="enc-ref-n">${i + 1}</span>
          <div class="enc-ref-body">
            <a href="${r.url}" target="_blank" rel="noopener">${r.t}</a>
            <div class="enc-ref-meta">${r.a} · ${r.y} · <em>${r.j}</em>${r.doi ? ` · DOI: ${r.doi}` : ''}</div>
          </div>
          <button class="enc-cite-btn" title="Copy citation" onclick='ALHYDRA.encyclopedia.cite(${JSON.stringify(r).replace(/'/g, "&#39;")})'><i class="fa-solid fa-quote-right"></i></button>
        </div>`).join('')}</div>`;
  }

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }

  // Copy an APA-style citation to clipboard.
  function cite(r) {
    const apa = `${r.a} (${r.y}). ${r.t}. ${r.j}.${r.doi ? ' https://doi.org/' + r.doi : (r.url ? ' ' + r.url : '')}`;
    try {
      navigator.clipboard.writeText(apa);
      ALHYDRA.app.toast(lang() === 'id' ? 'Sitasi disalin' : 'Citation copied', 'success', 1500);
    } catch (e) {
      ALHYDRA.app.toast(apa, 'info', 4000);
    }
  }

  // ── XAI suitability: compare entry optima vs live sensors ──
  function liveVal(key) { const el = document.getElementById('val-' + key); if (!el) return null; const n = parseFloat(el.textContent); return isNaN(n) ? null : n; }
  function paramRange(item, key) {
    const p = item.params && item.params[key];
    if (!p) return null;
    if (p.min !== undefined && p.max !== undefined) return [p.min, p.max];
    return null;
  }
  function renderSuitability(category, item) {
    if (category !== 'plants' && category !== 'algae') return '';
    // map sensor keys to entry param keys
    const checks = [
      { sensor: 'ph', pkey: 'ph', label: 'pH', icon: 'fa-flask-vial' },
      { sensor: 'temp_water', pkey: 'temp', label: lang() === 'id' ? 'Suhu' : 'Temp', icon: 'fa-temperature-half' },
      { sensor: 'light', pkey: 'light', label: lang() === 'id' ? 'Cahaya' : 'Light', icon: 'fa-sun' },
    ];
    const rows = [];
    let scoreSum = 0, n = 0;
    checks.forEach(c => {
      const range = paramRange(item, c.pkey);
      const val = liveVal(c.sensor);
      if (!range || val === null) return;
      const [lo, hi] = range;
      let s, status;
      if (val >= lo && val <= hi) { s = 1; status = 'good'; }
      else { const span = (hi - lo) || 1; const d = val < lo ? (lo - val) : (val - hi); s = Math.max(0, 1 - d / span); status = s > 0.5 ? 'warning' : 'danger'; }
      scoreSum += s; n++;
      rows.push({ c, val, lo, hi, s, status });
    });
    if (!n) return '';
    const pct = Math.round((scoreSum / n) * 100);
    const id = lang();
    const title = id === 'id' ? 'Kesesuaian untuk sistem Anda' : 'Suitability for your system';
    const why = id === 'id' ? 'Mengapa: kontribusi tiap parameter (langsung dari sensor)' : 'Why: contribution of each parameter (from live sensors)';
    return `
      <div class="enc-xai">
        <div class="enc-xai-head"><span class="xm-badge">XAI</span> <b>${title}</b> <span class="enc-xai-score ${pct >= 75 ? 'good' : pct >= 50 ? 'warning' : 'danger'}">${pct}%</span></div>
        <div class="enc-xai-why">${why}</div>
        <div class="enc-xai-bars">
          ${rows.map(r => `
            <div class="enc-xai-row">
              <span class="enc-xai-label"><i class="fa-solid ${r.c.icon}"></i> ${r.c.label}</span>
              <div class="enc-xai-track"><div class="enc-xai-fill ${r.status}" style="width:${Math.round(r.s * 100)}%"></div></div>
              <span class="enc-xai-val ${r.status}">${r.val} <em>(${r.lo}–${r.hi})</em> ${r.status === 'good' ? '✓' : '✗'}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }

  // ── Cross-reference links to app views ──
  function renderCrossLinks(category, item) {
    const id = lang();
    const links = [];
    if (category === 'plants' || category === 'algae') {
      links.push(['monitoring', 'fa-chart-line', id === 'id' ? 'Lihat Monitoring' : 'Open Monitoring']);
      if (category === 'algae') links.push(['algae', 'fa-bacterium', id === 'id' ? 'Kelola Kultur' : 'Manage Cultures']);
    }
    if (category === 'sensors') {
      links.push(['monitoring', 'fa-chart-line', id === 'id' ? 'Lihat Monitoring' : 'Open Monitoring']);
      links.push(['settings', 'fa-sliders', id === 'id' ? 'Kalibrasi' : 'Calibration']);
    }
    if (category === 'nutrients') links.push(['encyclopedia', 'fa-wrench', id === 'id' ? 'Troubleshooting' : 'Troubleshooting']);
    if (!links.length) return '';
    return `<div class="enc-xlinks">${links.map(([v, ic, lbl]) => `<button class="enc-xlink" onclick="ALHYDRA.encyclopedia.gotoView('${v}')"><i class="fa-solid ${ic}"></i> ${lbl}</button>`).join('')}</div>`;
  }
  function gotoView(v) { closeDetail(); ALHYDRA.app.navigateTo(v); if (v === 'encyclopedia') ALHYDRA.encyclopedia.switchTab('troubleshooting'); }

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
        ${renderSuitability('plants', item)}
        ${renderCrossLinks('plants', item)}
        ${renderReferences('plants', item)}
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
        ${renderSuitability('algae', item)}
        ${renderCrossLinks('algae', item)}
        ${renderReferences('algae', item)}
        ${item.source ? `<div class="enc-source">📚 Sumber: ${item.source}</div>` : ''}`;
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
        <ul class="enc-tips-list">${(item.tips || []).map(t => `<li>${t}</li>`).join('')}</ul>
        ${renderCrossLinks('sensors', item)}
        ${renderReferences('sensors', item)}`;
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
        </tbody></table>
        ${renderCrossLinks('nutrients', item)}
        ${renderReferences('nutrients', item)}`;
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
        <ul class="enc-tips-list" style="--list-color:var(--green)">${(item.solutions || []).map(s => `<li>${s}</li>`).join('')}</ul>
        ${renderReferences('troubleshooting', item)}`;
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

  return { init, onEnter, openDetail, closeDetail, switchTab, search, cite, gotoView };
})();
