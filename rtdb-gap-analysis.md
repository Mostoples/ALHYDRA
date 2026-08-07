# Realtime Database ↔ App ALHYDRA

RTDB: `https://alhydra-id-default-rtdb.firebaseio.com/`

## 1. Struktur RTDB (live, dari device fisik)

```
energy/  { battery_capacity_wh, battery_soc,
           current_cons, current_gen, power_cons, power_gen }
kontrol/ { aerator, embun, led, pompa }                       (bool)
sensor/  { kelembapan, light, ph_raw, ph_value, suhu,
           suhu_air, temp_water, turbidity, water_level }
status/  { ip, last_seen, online, rssi }
```

## 2. Pemetaan RTDB → kunci sensor aplikasi

`public/js/device.js` adalah **satu-satunya sumber data live**. Ia berlangganan ke
empat branch RTDB, memetakan nama field perangkat ke kunci kanonik aplikasi, lalu
mendorongnya ke `dashboard.renderData()`. Seluruh modul lain (monitoring, widgets,
energy, ml, algae, ops, report, calibration, chat) membaca hasilnya — jadi tidak ada
lagi yang perlu tahu soal RTDB.

| Path RTDB | Kunci aplikasi | Tampil di |
|---|---|---|
| `sensor.ph_value` | `ph` | kartu pH, chart pH, ML, kalibrasi |
| `sensor.ph_raw` | `ph_raw` | kartu diagnostik perangkat |
| `sensor.light` | `light` | kartu Light Intensity, chart |
| `sensor.turbidity` | `turbidity` | kartu Turbidity, chart, algae |
| `sensor.suhu` | `temp_ambient` | kartu Temp. Ambient, chart |
| `sensor.kelembapan` | `humidity` | kartu Humidity, chart |
| `sensor.suhu_air` (fallback `temp_water`) | `temp_water` | kartu Water Temp., chart |
| `sensor.water_level` | `water_level` | kartu Water Level, KPI hero |
| `energy.current_gen` / `power_gen` | `current_gen` / `power_gen` | kartu energi, chart, Impact |
| `energy.current_cons` / `power_cons` | `current_cons` / `power_cons` | kartu energi, chart |
| `energy.battery_soc` | `battery_soc` | kartu Battery, SOC halaman Energy, KPI hero |
| `energy.battery_capacity_wh` | `battery_capacity_wh` | sisa Wh, dasar hitung SOC |
| `kontrol.*` | — | toggle Control Panel + quick control Dashboard (baca **dan** tulis) |
| `status.online` | — | indikator koneksi topbar, badge status |
| `status.rssi` / `ip` / `last_seen` | — | kartu diagnostik, waktu update terakhir, panel Admin |

`sensor.suhu_air` dipakai sebagai suhu air utama (nilainya berkelipatan 0,0625 °C —
ciri khas DS18B20 12-bit); `sensor.temp_water` disimpan sebagai fallback firmware lama.

Daya dibaca langsung dari `energy.power_gen` / `power_cons`. Perkalian arus × 220 V
hanya dipakai jika firmware mengirim arus tanpa daya.

## 3. Yang bukan (dan tidak perlu) dari RTDB

| Data | Sumber | Alasan |
|---|---|---|
| Ambang batas, kalibrasi, mode energi | Firestore | konfigurasi aplikasi, bukan telemetri |
| Kultur alga, tugas, aturan otomasi, audit | Firestore | data operasional pengguna |
| Riwayat sensor (`sensor_history`) | Firestore | RTDB hanya menyimpan nilai *saat ini* |

**Arsip riwayat:** RTDB tidak punya histori, sedangkan Analytics, AI Insights dan
Environmental Impact membacanya. `device.js` menulis satu sampel telemetri ke
`sensor_history` setiap 5 menit, dengan id dokumen berbasis *time bucket* supaya
beberapa tab yang terbuka bersamaan menimpa dokumen yang sama, bukan menggandakan baris.

## 4. Yang dihapus

- Langganan Firestore `sensors/latest` di dashboard — digantikan RTDB.
- Relay demo Firestore `relays/pump1|pump2` beserta dua kartu "Pump 1 / Pump 2"
  di Control Panel dan quick control dashboard — digantikan empat kanal
  `kontrol/*` yang nyata.
- Ping konektivitas Firestore `_health/ping` — indikator topbar sekarang
  mengikuti `status.online` milik perangkat.
- Aksi otomasi `pump1off` / `pump2off` → sekarang `off_pompa`, `off_aerator`,
  `off_led`, `off_embun` (aturan lama tetap jalan lewat pemetaan legacy).
