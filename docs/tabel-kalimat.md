# Tabel Kalimat & Pemetaan Scene — PERJALANAN NUTRISI

- File audio: `public/narasi.mp3` (versi dipercepat 1,18× dari `voice-offer.mp3` 68,36 dtk — disetujui user 13 Nov 2026)
- Durasi audio terukur: 57.97 detik · total komposisi: 58.8 detik
- FPS komposisi: 30
- Metode: Whisper large-v3 (`language=id` dipaksa) untuk waktu + verifikasi jeda hening (silencedetect −35 dB). Teks kalimat dari naskah resmi user.

## Tabel Kalimat

| No | Kalimat | Mulai (dtk) | Selesai (dtk) | Frame mulai | Frame selesai | Scene |
|----|---------|-------------|---------------|-------------|---------------|-------|
| 1 | Perjalanan dimulai di mulut. Gigi menghancurkan makanan, air liur melembutkannya, dan enzim amilase mulai memecah karbohidrat menjadi gumpalan siap telan. | 0.00 | 8.30 | 0 | 249 | 1 |
| 2 | Saat ditelan, otot kerongkongan bergerak peristaltik — meremas bergelombang mendorong makanan turun ke lambung. | 8.67 | 14.05 | 260 | 422 | 2 |
| 3 | Di lambung, asam dan enzim pepsin mengaduk makanan menjadi bubur halus bernama kimus, sambil memecah protein. | 14.39 | 19.94 | 432 | 598 | 3 |
| 4 | Di usus dua belas jari, empedu memecah lemak dan enzim pankreas membongkar sisanya menjadi molekul terkecil: glukosa, asam amino, asam lemak. | 20.29 | 27.94 | 609 | 838 | 4 |
| 5 | Dinding usus halus dilapisi jutaan tonjolan bernama vili, yang memperluas area penyerapan agar molekul nutrisi menembus masuk. | 28.28 | 34.64 | 848 | 1039 | 5 |
| 6 | Di dalam vili, nutrisi terbagi dua: gula dan asam amino masuk kapiler darah, sedangkan lemak lewat pembuluh limfa sebelum bergabung ke aliran darah. | 34.99 | 42.56 | 1050 | 1277 | 6 |
| 7 | Sebelum menyebar, darah dari usus mampir ke hati — racun disaring, kadar gula diatur, sebagian glukosa disimpan sebagai cadangan. | 42.93 | 49.74 | 1288 | 1492 | 7 |
| 8 | Akhirnya, jantung memompa darah penuh nutrisi ke seluruh tubuh: bahan bakar bagi otak, tenaga bagi otot, bahan baku perbaikan bagi setiap sel. | 50.08 | 57.78 | 1502 | 1733 | 8 |

## Pemetaan Scene

| Scene | Kalimat | Frame range | Pill (pos n/8) | Visual inti | Chip label |
|-------|---------|-------------|----------------|-------------|------------|
| 1 | 1 | 0–260 | MULUT · pos 1/8 | Penampang kepala siluet profil: gigi, lidah, kelenjar ludah; bolus emas terbentuk | Pencernaan Mekanis & Enzim Amilase |
| 2 | 2 | 260–432 | KERONGKONGAN · pos 2/8 | Kerongkongan, gelombang peristaltik mendorong bolus emas turun | Gerak Peristaltik |
| 3 | 3 | 432–609 | LAMBUNG · pos 3/8 | Lambung glossy, bolus diaduk jadi kimus | Asam Lambung (HCl) & Enzim Pepsin → Kimus |
| 4 | 4 | 609–848 | USUS DUA BELAS JARI · pos 4/8 | Duodenum + kantong empedu + pankreas; kimus pecah jadi 3 jenis molekul emas | Glukosa • Asam Amino • Asam Lemak |
| 5 | 5 | 848–1050 | VILI USUS · pos 5/8 | Zoom mikroskopis: vili & mikrovili, molekul emas menembus dinding | Vili & Mikrovili |
| 6 | 6 | 1050–1288 | DUA JALUR · pos 6/8 | Di dalam satu vili: kapiler darah vs pembuluh limfa (lakteal) | Kapiler Darah & Pembuluh Limfa |
| 7 | 7 | 1288–1502 | HATI · pos 7/8 | Vena porta → hati, sebagian glukosa disimpan | Hati |
| 8 | 8 | 1502–1764 | SELURUH TUBUH · pos 8/8 | Jantung → siluet tubuh utuh, jaringan arteri merah menyala; teks callback + kartu seri | Distribusi Sistemik |

Judul serif tunda "PERJALANAN NUTRISI": awal scene 2 (8,67 dtk). Teks callback + kartu "Seri Tubuh Manusia — Part 1": akhir scene 8 (±55,7–58,8 dtk), lalu fade hitam.
