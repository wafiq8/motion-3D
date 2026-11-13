# Evals — Skenario Uji Skill diorama-basabasi

Jalankan SEBELUM skill dinyatakan selesai dan setiap kali skill diubah
secara berarti. Untuk tiap skenario: jalankan satu sesi TANPA skill
(baseline) dan satu sesi DENGAN skill, pada topik + naskah + MP3 yang
sama, lalu nilai hasil render finalnya dengan asersi di bawah. Skill
lolos bila versi dengan-skill PASS semua asersi kritis (bertanda *)
dan baseline terdokumentasi perbedaannya.

## Tiga skenario wajib

1. **Topik aliran/sistem** (mis. perjalanan satu paket udara/darah/air
   melewati sebuah sistem) — menguji struktur ikuti-satu-aliran dan
   sinkronisasi counter.
2. **Topik data/peta** (Varian A2: satu wilayah, satu parameter berubah
   sepanjang waktu) — menguji counter penggerak dunia, label posisi,
   dan struktur mesin waktu.
3. **Topik bantahan mitos** (satu klaim terkenal yang dipatahkan, dua
   fakta satu topik) — menguji hook bantahan, fade antar segmen, dan
   segmen demonstrasi.

## Asersi lulus/gagal (ukur dari file final + timeline.json)

- * File final: 1080×1920, 30 fps, durasi 30–60 detik (ffprobe).
- * `validate_timeline.py` PASS; semua batas scene ≤ 0,3 detik dari
  awal kalimat pemetaannya.
- * Tidak ada teks terpotong atau keluar zona aman pada contact sheet
  (periksa 3 still per scene).
- * Hook teks+suara+visual hadir dalam 1,5 detik pertama.
- * Counter/readout muncul pada kalimat angkanya (selisih ≤ 0,3 detik).
- * Keheningan tanpa alasan terpanjang ≤ 1 detik; total durasi non-
  narasi di luar jeda payoff ≤ 5 detik.
- * Loudness −14 LUFS ±1, peak ≤ −1 dB.
- * Nol gambar 2D/AI sebagai scene; satu rig cahaya & font yang sama
  di semua scene.
- Manusia hanya siluet; subjek hero tidak close-up (< 8 m).
- Penutup memuat kesimpulan + label seri; fade ke hitam bersih
  (CTV hanya bila diminta untuk video itu).
- Waktu produksi tercatat (untuk target ritme 1–2 video/hari): render
  per-scene + concat berhasil tanpa render ulang menyeluruh.

## Cara mencatat

Simpan hasil tiap run di `evals/hasil/<tanggal>-<skenario>.md`: topik,
versi skill, PASS/FAIL per asersi, tangkapan still bermasalah, dan satu
kalimat pelajaran. Pelajaran yang berulang ≥ 2 kali WAJIB masuk revisi
skill berikutnya — bukan dihafal di kepala sesi.
