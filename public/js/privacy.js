/* ─────────────────────────────────────────
   privacy.js — Privacy Policy + Terms of Service pages.
   Renders full bilingual legal content into
   #privacy-body and #terms-body.
───────────────────────────────────────── */
'use strict';

window.ALHYDRA = window.ALHYDRA || {};

ALHYDRA.privacy = (() => {

  function lang() { return ALHYDRA.i18n?.current?.() || 'en'; }
  const updated = '2026-05-31';

  const PRIVACY = {
    en: `
      <p class="legal-updated">Last updated: ${updated}</p>
      <p>ALHYDRA ("we", "the app") is a smart monitoring dashboard for hybrid algae-hydroponic
      cultivation. This policy explains what we collect, why, and your choices. We built ALHYDRA
      to respect your data and collect only what is needed to operate the service.</p>
      <h3>1. Information we collect</h3>
      <ul>
        <li><b>Account data:</b> your email, display name, and (optionally) avatar, bio, and location that you provide.</li>
        <li><b>Operational data:</b> sensor readings, cultures, tasks, notes, harvest/maintenance logs and settings you create.</li>
        <li><b>Activity logs:</b> in-app actions (login, control changes, settings updates) for your own audit timeline and security.</li>
        <li><b>Technical data:</b> basic device/browser info needed for the app to function.</li>
      </ul>
      <h3>2. How we use it</h3>
      <p>To authenticate you, display your dashboard, run features you request (analytics, AI insights,
      automation), and keep the system secure. We do <b>not</b> sell your data or use it for advertising.</p>
      <h3>3. Where it is stored</h3>
      <p>Data is stored in <b>Google Firebase</b> (Authentication & Cloud Firestore). Firebase processes
      data under Google's security and privacy terms. Your optional Gemini API key is stored only in your
      browser's local storage and is never sent to our servers.</p>
      <h3>4. Sharing</h3>
      <p>We do not share your personal data with third parties except: (a) Google Firebase as our
      infrastructure provider, and (b) when required by law. Administrators of your ALHYDRA instance can
      see aggregate system metrics and account roles, not your private API keys.</p>
      <h3>5. Your rights & controls</h3>
      <ul>
        <li><b>Access:</b> all data you create is visible in your dashboard at any time.</li>
        <li><b>Correction:</b> edit your profile and settings directly in the app.</li>
        <li><b>Deletion:</b> contact the project maintainers via GitHub to request account and data removal.</li>
      </ul>
      <h3>6. Data retention</h3>
      <p>We keep your data while your account is active. When you delete your account, your profile and
      owned records are removed; backups expire on Firebase's normal cycle.</p>
      <h3>7. Children</h3>
      <p>ALHYDRA is intended for researchers, growers, and students. It is not directed at children under 13.</p>
      <h3>8. Changes</h3>
      <p>We may update this policy; the "last updated" date will change. Continued use means acceptance.</p>
      <h3>9. Contact</h3>
      <p>Questions? Reach the project maintainers via the GitHub repository:
      <a href="https://github.com/Mostoples/ALHYDRA" target="_blank" rel="noopener">github.com/Mostoples/ALHYDRA</a>.</p>`,
    id: `
      <p class="legal-updated">Terakhir diperbarui: ${updated}</p>
      <p>ALHYDRA ("kami", "aplikasi") adalah dasbor pemantauan cerdas untuk budidaya alga-hidroponik
      hibrida. Kebijakan ini menjelaskan data apa yang kami kumpulkan, mengapa, dan pilihan Anda. Kami
      membangun ALHYDRA untuk menghormati data Anda dan hanya mengumpulkan yang diperlukan.</p>
      <h3>1. Informasi yang kami kumpulkan</h3>
      <ul>
        <li><b>Data akun:</b> email, nama tampilan, dan (opsional) avatar, bio, serta lokasi yang Anda berikan.</li>
        <li><b>Data operasional:</b> pembacaan sensor, kultur, tugas, catatan, log panen/pemeliharaan, dan pengaturan yang Anda buat.</li>
        <li><b>Log aktivitas:</b> tindakan dalam aplikasi (login, perubahan kontrol, pembaruan pengaturan) untuk linimasa audit & keamanan Anda.</li>
        <li><b>Data teknis:</b> info dasar perangkat/peramban agar aplikasi berfungsi.</li>
      </ul>
      <h3>2. Cara kami menggunakannya</h3>
      <p>Untuk mengautentikasi Anda, menampilkan dasbor, menjalankan fitur yang Anda minta (analitik,
      wawasan AI, otomasi), dan menjaga keamanan sistem. Kami <b>tidak</b> menjual data Anda atau
      menggunakannya untuk iklan.</p>
      <h3>3. Tempat penyimpanan</h3>
      <p>Data disimpan di <b>Google Firebase</b> (Authentication & Cloud Firestore) sesuai ketentuan
      keamanan & privasi Google. Kunci API Gemini opsional Anda hanya disimpan di penyimpanan lokal
      peramban dan tidak pernah dikirim ke server kami.</p>
      <h3>4. Pembagian data</h3>
      <p>Kami tidak membagikan data pribadi Anda kepada pihak ketiga kecuali: (a) Google Firebase sebagai
      penyedia infrastruktur, dan (b) bila diwajibkan hukum. Administrator dapat melihat metrik sistem
      agregat dan peran akun, bukan kunci API pribadi Anda.</p>
      <h3>5. Hak & kontrol Anda</h3>
      <ul>
        <li><b>Akses:</b> semua data yang Anda buat terlihat di dasbor Anda kapan saja.</li>
        <li><b>Koreksi:</b> ubah profil dan pengaturan langsung di aplikasi.</li>
        <li><b>Penghapusan:</b> hubungi pengelola proyek melalui GitHub untuk meminta penghapusan akun dan data.</li>
      </ul>
      <h3>6. Retensi data</h3>
      <p>Data disimpan selama akun aktif. Saat Anda menghapus akun, profil & catatan milik Anda dihapus;
      cadangan kedaluwarsa sesuai siklus normal Firebase.</p>
      <h3>7. Anak-anak</h3>
      <p>ALHYDRA ditujukan untuk peneliti, pekebun, dan pelajar. Tidak ditujukan untuk anak di bawah 13 tahun.</p>
      <h3>8. Perubahan</h3>
      <p>Kami dapat memperbarui kebijakan ini; tanggal "terakhir diperbarui" akan berubah. Penggunaan
      berkelanjutan berarti persetujuan.</p>
      <h3>9. Kontak</h3>
      <p>Ada pertanyaan? Hubungi pengelola proyek melalui repositori GitHub:
      <a href="https://github.com/Mostoples/ALHYDRA" target="_blank" rel="noopener">github.com/Mostoples/ALHYDRA</a>.</p>`,
  };

  const TERMS = {
    en: `
      <p class="legal-updated">Last updated: ${updated}</p>
      <p>By using ALHYDRA you agree to these terms. Please read them together with our Privacy Policy.</p>
      <h3>1. The service</h3>
      <p>ALHYDRA provides monitoring, analytics, and decision-support tools for algae-hydroponic systems.
      It is provided for research, educational, and operational support purposes.</p>
      <h3>2. Accounts</h3>
      <p>You are responsible for keeping your credentials secure and for activity under your account. Provide
      accurate information and keep it up to date.</p>
      <h3>3. Acceptable use</h3>
      <ul>
        <li>Do not misuse the service, attempt to breach security, or disrupt other users.</li>
        <li>Do not upload unlawful content or use the app to violate any law.</li>
        <li>Automated access must respect Firebase quotas and fair use.</li>
      </ul>
      <h3>4. AI & recommendations disclaimer</h3>
      <p>AI insights, suitability scores, forecasts, and automation suggestions are <b>decision support only</b>.
      They may be inaccurate. Always verify with real measurements before acting on irrigation, dosing, or
      equipment changes. You are responsible for outcomes in your own system.</p>
      <h3>5. Research disclaimer</h3>
      <p>Encyclopedia values and references are provided for general guidance from published sources.
      Conditions vary by species, strain, climate, and equipment — validate against your context.</p>
      <h3>6. Availability</h3>
      <p>The service is provided "as is" without warranties. We do not guarantee uninterrupted or error-free
      operation, and are not liable for losses arising from use, to the maximum extent permitted by law.</p>
      <h3>7. Changes & termination</h3>
      <p>We may modify or discontinue features. You may stop using the service and delete your account anytime.</p>
      <h3>8. Contact</h3>
      <p>Project & source: <a href="https://github.com/Mostoples/ALHYDRA" target="_blank" rel="noopener">github.com/Mostoples/ALHYDRA</a>.</p>`,
    id: `
      <p class="legal-updated">Terakhir diperbarui: ${updated}</p>
      <p>Dengan menggunakan ALHYDRA Anda menyetujui ketentuan ini. Baca bersama Kebijakan Privasi kami.</p>
      <h3>1. Layanan</h3>
      <p>ALHYDRA menyediakan alat pemantauan, analitik, dan pendukung keputusan untuk sistem
      alga-hidroponik, untuk tujuan riset, edukasi, dan dukungan operasional.</p>
      <h3>2. Akun</h3>
      <p>Anda bertanggung jawab menjaga keamanan kredensial dan aktivitas pada akun Anda. Berikan informasi
      akurat dan jaga tetap mutakhir.</p>
      <h3>3. Penggunaan yang dapat diterima</h3>
      <ul>
        <li>Jangan menyalahgunakan layanan, menembus keamanan, atau mengganggu pengguna lain.</li>
        <li>Jangan mengunggah konten melanggar hukum atau memakai aplikasi untuk melanggar hukum.</li>
        <li>Akses otomatis harus menghormati kuota Firebase dan penggunaan wajar.</li>
      </ul>
      <h3>4. Penafian AI & rekomendasi</h3>
      <p>Wawasan AI, skor kesesuaian, prakiraan, dan saran otomasi adalah <b>pendukung keputusan saja</b>
      dan bisa tidak akurat. Selalu verifikasi dengan pengukuran nyata sebelum bertindak pada irigasi,
      dosis, atau perubahan peralatan. Anda bertanggung jawab atas hasil pada sistem Anda.</p>
      <h3>5. Penafian riset</h3>
      <p>Nilai dan referensi ensiklopedia adalah panduan umum dari sumber terpublikasi. Kondisi berbeda
      menurut spesies, galur, iklim, dan peralatan — validasi sesuai konteks Anda.</p>
      <h3>6. Ketersediaan</h3>
      <p>Layanan disediakan "sebagaimana adanya" tanpa jaminan. Kami tidak menjamin operasi tanpa gangguan
      atau bebas galat, dan tidak bertanggung jawab atas kerugian akibat penggunaan, sejauh diizinkan hukum.</p>
      <h3>7. Perubahan & penghentian</h3>
      <p>Kami dapat mengubah atau menghentikan fitur. Anda dapat berhenti memakai layanan dan menghapus akun kapan saja.</p>
      <h3>8. Kontak</h3>
      <p>Proyek & sumber: <a href="https://github.com/Mostoples/ALHYDRA" target="_blank" rel="noopener">github.com/Mostoples/ALHYDRA</a>.</p>`,
  };

  function wrap(html) {
    return `<div class="legal-card">${html}</div>`;
  }
  function renderPrivacy() { const el = document.getElementById('privacy-body'); if (el) el.innerHTML = wrap(PRIVACY[lang()] || PRIVACY.en); }
  function renderTerms()   { const el = document.getElementById('terms-body');   if (el) el.innerHTML = wrap(TERMS[lang()]   || TERMS.en);   }

  function onEnterPrivacy() { renderPrivacy(); }
  function onEnterTerms() { renderTerms(); }

  function init() {
    window.addEventListener('alhydra:lang', () => {
      if (document.getElementById('view-privacy')?.classList.contains('active')) renderPrivacy();
      if (document.getElementById('view-terms')?.classList.contains('active')) renderTerms();
    });
  }

  return { init, onEnterPrivacy, onEnterTerms };
})();
