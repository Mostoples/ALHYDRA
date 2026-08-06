# Gap Analysis — Firebase Realtime Database vs App ALHYDRA

RTDB: `https://alhydra-id-default-rtdb.firebaseio.com/`

## 1. Struktur RTDB saat ini (live, dari device fisik)

```
kontrol/ { aerator, embun, led, pompa }             (bool)
sensor/  { kelembapan, ph_raw, ph_value, suhu }     (number)
status/  { ip, last_seen, online, rssi }
```

Semua field di atas **sudah terhubung penuh** ke app (`public/js/device.js` + `public/app.html`, kartu "Perangkat IoT (Live)"):

| Path | Status di app |
|---|---|
| `kontrol.aerator/embun/led/pompa` | ✅ Baca + tulis (toggle di halaman Control) |
| `sensor.kelembapan` | ✅ Ditampilkan |
| `sensor.suhu` | ✅ Ditampilkan |
| `sensor.ph_raw` | ✅ Ditampilkan |
| `sensor.ph_value` | ✅ Ditampilkan *(baru ditambahkan)* |
| `status.online` | ✅ Ditampilkan |
| `status.rssi` | ✅ Ditampilkan |
| `status.last_seen` | ✅ Ditampilkan |
| `status.ip` | ✅ Ditampilkan *(baru ditambahkan)* |

**Tidak ada field RTDB yang tersisa belum dipakai** — semua sudah tersambung.

## 2. Fitur di app yang BELUM punya data di RTDB (masih dummy/Firestore)

Ini bagian yang sebenarnya "kurang dari realtime database" — UI/fitur berikut sudah ada di app, tapi datanya **bukan dari RTDB**, melainkan simulasi, Firestore, atau localStorage. Supaya jadi live sepenuhnya, field-field ini perlu ditambahkan ke RTDB oleh firmware device:

| Fitur di app | Lokasi | Sumber data saat ini | Field RTDB yang perlu ditambahkan |
|---|---|---|---|


## 3. Ringkasan

- **RTDB → App**: 0 field kosong (semua field RTDB sudah dipakai).
- **App → RTDB**: field yang **paling relevan untuk ditambahkan device fisik ke RTDB** (karena ini telemetry sensor real, bukan config) adalah:
  1. `sensor/light`
  2. `sensor/turbidity`
  3. `sensor/temp_water`
  4. `sensor/water_level`
  5. `energy/current_gen`, `energy/power_gen`
  6. `energy/current_cons`, `energy/power_cons`
  7. Split `kontrol/pompa` → `kontrol/pompa1` + `kontrol/pompa2` jika device punya 2 pompa fisik.

Field seperti threshold, kalibrasi, dan alert sifatnya konfigurasi aplikasi, bukan data dari device — jadi wajar tetap di Firestore/localStorage, bukan RTDB.
