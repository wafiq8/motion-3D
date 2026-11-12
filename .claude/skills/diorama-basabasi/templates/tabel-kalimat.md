# Tabel Kalimat & Pemetaan Scene — [JUDUL VIDEO]

- File audio: `public/narasi.mp3`
- Durasi audio terukur: [..] detik
- FPS komposisi: 30
- Metode: transkripsi bertimestamp (Whisper) + verifikasi jeda hening.
- Aturan: batas scene = detik MULAI kalimat pertama scene berikutnya.
  Toleransi selisih potongan aktual vs tabel: ≤ 0,3 detik.
  Pemetaan berdasarkan ISI kalimat, dilarang mengelompokkan kalimat
  demi mengisi durasi scene.

## Tabel Kalimat

| No | Kalimat | Mulai (dtk) | Selesai (dtk) | Frame mulai | Frame selesai | Scene |
|----|---------|-------------|---------------|-------------|---------------|-------|
| 1  | …       | 0.00        | …             | 0           | …             | 1     |
| 2  | …       | …           | …             | …           | …             | 1     |

## Pemetaan Scene

| Scene | Kalimat | Frame range | Visual inti | Teks layar (jadwal mengikuti kalimatnya) |
|-------|---------|-------------|-------------|------------------------------------------|
| 1     | 1–2     | 0–…         | …           | Judul hook (kalimat 1) · Sorot: … (kalimat 2) |
| 2     | …       | …–…         | …           | Angka emas: … (saat kalimat … diucapkan)    |

## Cek akhir pra-produksi

- [ ] Total frame scene terakhir menutup di akhir audio + kartu penutup.
- [ ] Zona tanpa narasi di akhir ≤ 5 detik.
- [ ] Setiap teks layar punya jadwal yang terikat ke nomor kalimat.
- [ ] Tabel ini sudah ditampilkan ke user dan disetujui.
