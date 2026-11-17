---
name: diorama-basabasi
description: Produksi video edukasi vertikal 9:16 (30–60 detik; Varian A2: 30–120 detik) bergaya 3D dari kode untuk seri edukasi Basabasi berbahasa Indonesia, dalam tiga mode aktif — Mode A: diorama 3D semi-realistis (lanskap/sejarah, termasuk varian peta hidup); Mode B: bongkar benda (cara kerja benda/mesin); Mode C: ilustrasi anatomi 3D glossy (Seri Tubuh Manusia, ikuti-satu-aliran). Dirender dengan Remotion + Three.js; BUKAN footage asli dan BUKAN slideshow gambar AI. Mengunci timeline.json sebagai sumber kebenaran timing dari audio asli, style lock per mode, teks readout overlay DOM anti-kepotong, gerbang still-frame, QC mandiri fail-closed, render cepat per-scene, dan penutup kesimpulan/callback (A2 perjalanan bukti: pertanyaan terbuka) untuk membangun audiens.
---

# Diorama Basabasi — Skill Produksi Video Edukasi Basabasi (v3.0)

> Prinsip inti: **periksa sebelum render, bukan sesudahnya.** Semua yang
> bisa dicek murah (timeline, still-frame, lebar teks) WAJIB lolos dulu.
> Render full-res hanya sekali, di ujung, setelah semua gerbang hijau.
>
> File ini adalah INTI. Detail visual per mode ada di `references/`
> — `mode-a.md` untuk Mode A, `mode-b.md` untuk Mode B, `mode-c.md`
> untuk Mode C (WAJIB dibaca
> yang sesuai mode video ini, sebelum membangun scene). Skenario uji
> ada di `evals/evals.md`. Skrip di `scripts/` dijalankan PERSIS apa
> adanya — jangan menulis ulang fungsinya.

## Keputusan terkunci (dari user, 12 Nov 2026 — jangan diubah diam-diam)

- **Tiga mode aktif: Mode A** (lanskap/sejarah + varian peta hidup),
  **Mode B** (bongkar benda — cara kerja benda/mesin), dan **Mode C**
  (anatomi — Seri Tubuh Manusia). Mode dipilih user per
  video lewat prompt mulai; sesi membaca file referensi mode itu
  sebelum Tahap 2.
- Tujuan: **membangun audiens.** Penutup bawaan = kesimpulan (Mode A)
  / callback (Mode C) + fade ke hitam. Pengecualian Varian A2 struktur
  perjalanan bukti: penutup = verdict singkat + pertanyaan terbuka
  spesifik (lihat references/mode-a.md). TIDAK ada kartu/label seri di
  dalam video dan TIDAK ada pill tahap/penanda posisi di layar
  (keputusan user 13 Nov 2026, v2.8) — identitas seri hanya hidup di
  caption. Call to value HANYA sesekali, bila topiknya pas dan user
  memintanya untuk video itu — bukan elemen wajib. CTA jualan dilarang.
- Angka/data = **HYBRID**: readout layar (overlay DOM) adalah sistem
  utama untuk SEMUA angka. Pengecualian: maksimal SATU angka hero 3D
  emas di dalam scene per video, hanya untuk angka puncak video itu —
  dan angka yang sama WAJIB tetap tampil sebagai readout/caption,
  karena versi 3D adalah penekanan visual, bukan pembawa informasi.
- Durasi final **30–60 detik**, mengikuti audio. Pengecualian
  Varian A2 (format peta): **30–120 detik**.
- Suara: skill ini AGNOSTIK suara — pakai MP3 narasi apa pun yang
  disediakan user di `public/narasi.mp3`.
- Musik: file dari user di `public/musik.*` — jangan memilihkan musik.
- Fakta: sumber dari user adalah rujukan UTAMA dan menang bila
  bertentangan. Sesi BOLEH melengkapi dengan riset web, dengan syarat:
  sumber dicantumkan di laporan akhir, utamakan sumber otoritatif
  (jurnal, lembaga, resmi), dan klaim yang belum terverifikasi WAJIB
  ditandai sebagai belum pasti — dilarang menyajikan tebakan sebagai
  fakta. Kredit sumber dan status kejujuran klaim juga tampil DI
  LAYAR — lihat bagian "Sitasi & label kejujuran di layar".
- Operator tunggal: user sendiri, dari tablet. Semua hasil WAJIB tampil
  sebagai file di sesi (still, preview, final) agar bisa diunduh.
- Target ritme: **1–2 video/hari**. Efisiensi adalah syarat desain —
  pakai ulang scaffold, primitif, dan komponen; jangan membangun ulang
  yang sudah ada.
- Gerbang: TETAP DUA — Gerbang 1 (ringkasan timeline) dan Gerbang 2
  (contact sheet still). Pelonggaran demi efisiensi BOLEH, bertahap,
  berbasis bukti, dan hanya untuk Gerbang 2:
  · Setelah 3 video berturut-turut lolos Gerbang 2 TANPA revisi visual
    mayor: format ringan — 1 still per scene.
  · Setelah 3 video lagi lolos bersih dalam format ringan: Gerbang 2
    menjadi opsional untuk jenis scene yang sudah terbukti (still tetap
    wajib untuk scene/jenis visual baru).
  · Gerbang 1 TIDAK pernah dilonggarkan — murah, dan menangkap kesalahan
    termahal (pemetaan kalimat).
  · Setiap pelonggaran dicatat di laporan akhir; satu revisi visual
    mayor mengembalikan format penuh; user boleh mencabut pelonggaran
    kapan saja.

## Larangan keras

- Dilarang gambar AI/foto/2D/sprite sebagai scene. Model unduhan dan
  tekstur/data luar HANYA boleh dipakai mengikuti bagian "Aset unduhan
  & data luar"; di luar itu semua visual = geometri 3D prosedural
  Three.js.
- Dilarang letterbox; kamera native 9:16.
- Gerakan hanya dari kamera di ruang 3D (parallax nyata). Dilarang
  mensimulasikan gerak via zoom/pan gambar 2D.
- Manusia hanya siluet gelap kecil tanpa wajah. Subjek utama Mode A
  tidak close-up (jarak kamera minimum 8 m untuk hewan/objek hero
  lanskap) — di Varian A2 aturan ini tidak berlaku (hero objek
  peta, boleh close tracking) dan di Mode C aturan jarak ini tidak
  berlaku: organ hero
  memang mengisi frame; di Mode B aturan ini hanya mengikat framing
  tahap konteks — objek hero di tahap lab memang mengisi frame
  (lihat references/mode-b.md dan references/mode-c.md).
- Satu renderer, satu set material, satu rig cahaya untuk semua scene.
- Dilarang menebak durasi dari jumlah kata/storyboard. Timing HANYA dari
  audio asli (lihat Timing).
- Dilarang animasi dari `useFrame()`, `Math.random()`, `Date.now()`, atau
  akumulasi frame — semua gerak diturunkan dari `useCurrentFrame()` dan
  konstanta acak ber-seed tetap.


## Aset unduhan & data luar (amendemen jalur sudutpeta — Item 1)

Sejak versi ini, larangan total atas model unduhan dan tekstur/data
luar DICABUT dan diganti aturan berlisensi berikut. Di luar aturan ini,
semua visual tetap geometri 3D prosedural Three.js.

Model 3D unduhan (hero/prop) diizinkan bila SEMUA syarat terpenuhi:
1. Lisensinya mengizinkan pemakaian komersial: CC BY, CC0, atau lisensi
   Polyfork. DILARANG: BY-NC, BY-SA, Standard, editorial-only.
2. Badge lisensi dicek di halaman modelnya sendiri sebelum diunduh;
   nama model, pembuat, lisensi, dan tanggal cek dicatat untuk laporan
   akhir (lihat Output dan laporan).
3. File di-vendor ke repo proyek (GLB) — DILARANG hotlink CDN atau
   mengambil file saat render; render harus tetap deterministik.
4. Kredit pembuat + lisensi dicantumkan di laporan akhir dan di
   caption postingan.

Tekstur & data luar diizinkan KHUSUS untuk panggung peta: citra satelit
S2Cloudless oleh EOX (CC BY 4.0), heightmap GEBCO (atribusi), batas dan
label dari OpenStreetMap (© OpenStreetMap contributors), Natural Earth,
dan Marine Regions (CC BY 4.0). Semua file di-vendor ke repo proyek.

Ukuran setiap aset dan totalnya dicatat di laporan akhir, bersama
catatan waktu render, agar aset yang memberatkan pipeline terlihat
sejak produksi pertama.

## Sitasi & label kejujuran di layar (amendemen jalur sudutpeta — Item 5)

Berlaku untuk SEMUA mode. Kredit sumber dan status kejujuran klaim
tidak cukup hidup di laporan akhir — bagian yang menghadap penonton
WAJIB tampil di layar:

- **Kredit di readout:** setiap readout angka hasil hitungan/olahan
  sesi (jarak terukur, durasi terhitung, persentase turunan) WAJIB
  membawa baris kredit kecil di frame yang sama — pola: "HITUNGAN
  KAMI · JALUR MENURUT DOUBLE DKK. 2014" / "MENURUT THUMS DKK.
  2022". Angka kutipan langsung dikreditkan ke sumbernya dengan cara
  yang sama. Kredit adalah sub-baris readout (teks DOM), bukan teks
  3D, dan tidak memakan jatah satu angka hero.
- **Label kejujuran** — chip kecil sementara, tipografi keluarga
  readout, di zona aman; muncul bersama klaimnya dan hilang
  bersamanya (BUKAN HUD permanen, bukan pill tahap):
  · ILUSTRASI — visual staging yang bisa disangka data/footage asli
    (hero di atas peta data asli, rekonstruksi, penampang).
  · DISEDERHANAKAN — rute/skala/proses yang disederhanakan, mis.
    "JALUR DISEDERHANAKAN".
  · BELUM TERBUKTI — tampil selama kalimat yang menyatakan dugaan
    yang masih diperdebatkan dibacakan.
- Laporan akhir WAJIB mendaftar kredit dan label yang dipakai, per
  scene.

## Timing — timeline.json adalah sumber kebenaran tunggal

1. Pastikan `public/narasi.mp3` ada. Kalau tidak ada: BERHENTI, kabari
   user. Jangan menentukan timing apa pun sebelum audio tersedia.
2. Ambil timestamp per kata dengan hierarki ini:
   a. Timestamp bawaan TTS (mis. ElevenLabs with-timestamps) bila user
      menyediakannya — paling akurat.
   b. Fallback Whisper: model BESAR saja, `language="id"` dipaksa (jangan
      auto-detect), dan Whisper hanya memasok WAKTU — teks kalimat WAJIB
      dari naskah resmi user, bukan dari hasil transkrip (ASR Indonesia
      mudah salah pada angka dan nama).
3. Susun `docs/timeline.json` persis skema ini:

```json
{
  "fps": 30,
  "audio_duration_s": 40.20,
  "total_duration_s": 41.00,
  "sentences": [
    {"id": 1, "text": "…", "start_s": 0.00, "end_s": 3.68, "scene": 1}
  ],
  "scenes": [
    {"id": 1, "sentence_ids": [1, 2], "start_s": 0.00, "end_s": 6.44}
  ]
}
```

   Field `"variant": "A2"` WAJIB diisi untuk produksi Varian A2 —
   validator membaca field ini untuk batas durasi 30–120 detik;
   tanpa field itu batas 30–60 detik berlaku.

4. Aturan pemetaan: batas scene = detik MULAI kalimat pertama scene
   berikutnya; pemetaan berdasarkan ISI kalimat — dilarang mengelompokkan
   kalimat demi mengisi durasi; selisih potongan aktual vs timeline
   ≤ 0,3 detik.
5. Jalankan `python3 scripts/validate_timeline.py docs/timeline.json`.
   Kalau FAIL: perbaiki timeline, ulangi. Dilarang lanjut saat FAIL.
6. Tampilkan ringkasan timeline (jumlah kalimat, pemetaan scene, total
   durasi) ke user dan TUNGGU persetujuan — ini Gerbang 1.
7. `total_duration_s` harus masuk rentang formatnya (30–60 detik;
   Varian A2: 30–120 detik). Di luar itu: laporkan ke user
   (narasi kepanjangan/kependekan), jangan memotong atau menambal diam-diam.
   Keheningan tanpa alasan dilarang; jeda payoff 0,3–1 detik di penutup
   diperbolehkan dan dihitung dalam total.

## Style lock (ringkas — detail per mode di references/)

### Mode A (detail di references/mode-a.md)

- Diorama 3D stilasi semi-realistis: palet hangat sinematik, satu rig
  cahaya senja tetap, permukaan halus bersih, latar disederhanakan.
  Palet boleh menyesuaikan topik/musim; rig cahaya dan material tidak.
- Judul topik: tipografi SERIF kapital di atas establishing shot yang
  bergerak. Hook = kalimat pertama narasi (pertanyaan / bantahan mitos /
  paradoks) yang hadir sebagai teks + suara + visual dalam ±1,5 detik
  pertama.
- Subtitle: karaoke per kata dalam halaman **2–4 kata** (bukan satu kata),
  kata aktif tegas, kata kunci berwarna aksen, di zona aman bawah.
- Readout data: counter beranimasi menghitung tepat saat angka disebut
  narasi + label kecil + garis penunjuk; readout berikutnya bergaya sama.
  Satu-satunya teks 3D yang boleh tampil: satu angka hero emas untuk
  angka puncak (lihat Keputusan terkunci).
- Kamera: perjalanan kontinu di dalam segmen; tangga zoom sebagai
  struktur argumen; hard cut hanya antar segmen fakta, berbentuk fade
  hitam ±0,1 detik.
- Struktur narasi: untuk topik sistem/alur pakai "ikuti satu aliran";
  satu video boleh memuat dua fakta satu topik dengan segmen demonstrasi.
- Varian A2 (peta hidup): format peta penuh — terrain satelit +
  heightmap data asli, satu penerbangan kontinu, hero 3D di atas
  peta, tahap bawah permukaan, layer data berlegenda; struktur
  mesin waktu atau perjalanan bukti (detail di references/mode-a.md).
- Penutup: beauty shot + judul/era serif diulang + kalimat kesimpulan.
  Fade ke hitam; tanpa label/kartu seri di dalam video (v2.8).
  (Call to value hanya bila
  diminta untuk video ini.) Pengecualian A2 perjalanan bukti: penutup
  = verdict singkat + pertanyaan terbuka spesifik, bukan kesimpulan
  (detail di references/mode-a.md).

### Mode B — Bongkar Benda (detail di references/mode-b.md)

- DUA tahap dunia: diorama KONTEKS hangat gaya Mode A (benda tampil
  utuh di habitatnya) → tahap LAB berlatar grid teknis gelap tempat
  benda dibongkar; transisi lewat zoom kontinu (latar memudar/iris),
  tanpa hard cut.
- Satu model objek hero prosedural dibangun sekali; tampak ledakan
  dan belahan diturunkan dari model yang sama.
- TANPA kartu judul (hook = kalimat pertama narasi di shot konteks)
  dan TANPA HUD permanen apa pun — breadcrumb, counter zoom, dan
  minimap referensi DIBUANG (putusan riset + arah v2.8). Navigasi
  dari kamera kontinu, label leader-line, dan judul fase sesaat.
- Fase baku: konteks → zoom + label objek → DIBONGKAR (label bagian
  dwibahasa ID + istilah EN, muncul sesuai urutan narasi) → DIBELAH
  (proses dianimasikan + readout proses) → SAAT MENYALA (belahan
  berjalan, ikuti satu aliran, label proses, partikel aliran
  berkode warna semantik) → makro mekanisme penentu → payoff label
  prinsip satu baris saat kamera menarik mundur.
- Penutup Mode B: kalimat kesimpulan/prinsip + fade ke hitam; tanpa
  kartu/label seri (v2.8).

### Mode C — Anatomi (detail di references/mode-c.md)

- BUKAN diorama: satu organ hero 3D glossy melayang di kehampaan ungu
  gelap berbokeh; satu model organ dibangun sekali, dipakai semua
  scene. Seri baku "Seri Tubuh Manusia".
- **Kode warna aliran MUTLAK:** biru = miskin oksigen, merah terang =
  kaya oksigen — tidak pernah dibalik, di video ini maupun antar
  video seri. Partikel sel berubah warna di titik pertukaran, tepat
  pada kalimatnya.
- Struktur WAJIB ikuti-satu-aliran: kamera mengawal satu paket
  melewati seluruh sirkuit; tangga zoom organ → sistem → mikroskopis
  → organ → tubuh utuh (siluet).
- Hook = rujukan waktu-nyata penonton + counter hidup yang berjalan
  sinkron ketukan visual organ sejak detik pertama. Judul serif
  DITUNDA sampai ±5–8 detik (setelah hook), diikuti anotasi fakta.
- TANPA pill tahap dan tanpa HUD apa pun (v2.8): posisi aliran dibaca
  dari perjalanan kamera; chip label anatomi menempel di organ dan
  menyala saat bagiannya aktif.
- Penutup Mode C: counter finale teranimasi + kalimat CALLBACK yang
  memantulkan hook; fade ke hitam; tanpa kartu/label seri (v2.8).
  Dilarang gore/realisme medis grafis.

## Aturan teks (anti-kepotong — penyebab revisi nomor satu)

- SEMUA teks wajib-baca adalah overlay DOM (komponen Remotion), BUKAN
  teks di dalam canvas WebGL. Satu-satunya pengecualian: angka hero 3D
  hybrid di Keputusan terkunci — teks 3D lain dilarang.
- Ukur SETIAP teks dengan `measureText`/`fitText` dari
  `@remotion/layout-utils` SETELAH font termuat; fontSize =
  min(batas mode, hasil fit); lebar maksimum 90% lebar frame; margin aman
  5% semua sisi; hormati zona aman platform (hindari ±250 px atas dan
  ±310 px bawah untuk teks penting).
- Kalau teks tidak muat pada ukuran lantai keterbacaan: PECAH jadi dua
  halaman/baris — dilarang mengecilkan sampai tak terbaca, dilarang
  membiarkan terpotong.
- Kontras: teks terang di atas latar terang wajib outline/shadow gelap.
- Label leader-line mengikuti aturan yang sama.

## Audio

- Narasi adalah master clock: semua batas scene, caption, counter, dan
  kamera membaca `docs/timeline.json` — tidak ada sumber timing kedua.
- Musik dari file user dipasang sebagai bed di bawah narasi (ducking
  sederhana; jangan menutupi kata). Tanpa file musik dari user: jangan
  mengarang musik — kabari user.
- Final dinormalisasi ke −14 LUFS, peak ≤ −1 dB.

## Alur produksi (gerbang tidak boleh dilompati)

- **Tahap 0 — Scaffold:** pakai scaffold proyek yang sudah ada;
  renderer, kamera rig, style lock, dan primitif TIDAK ditulis ulang.
- **Tahap 1 — Timeline:** sesuai bagian Timing → validator PASS →
  Gerbang 1 (persetujuan user).
- **Tahap 2 — Bangun scene** membaca timeline.json dan file referensi
  mode video ini (references/mode-a.md, references/mode-b.md, atau
  references/mode-c.md).
- **Tahap 3 — Gerbang still:** render 3 still per scene (awal/tengah/
  akhir scene) + contact sheet; tampilkan; TUNGGU persetujuan user.
  (Format mengikuti tangga pelonggaran Gerbang 2 di Keputusan terkunci.)
  Perbaiki di tahap still — jauh lebih murah daripada di video.
- **Tahap 4 — Preview + QC mandiri:** render preview skala 0.5, jalankan
  QC di bawah atas hasil sendiri, perbaiki semua temuan (render ulang
  hanya scene yang berubah) sebelum melapor.
- **Tahap 5 — Final:** render full-res SEKALI; jalankan
  `bash scripts/check_output.sh out/<slug>-final.mp4`
  (Varian A2: rentang 30–120 terbaca otomatis dari timeline.json,
  atau beri argumen `30 120`); tampilkan file +
  laporan QC di sesi.

## Render cepat (pipeline terkunci)

- Render PER SCENE: `out/scenes/scene-N.mp4`; gabung dengan FFmpeg
  concat `-c copy` (parameter codec/resolusi/fps WAJIB identik antar
  scene, kalau tidak gabungan rusak).
- `--concurrency` = jumlah core CPU sesi (cek `nproc`), jangan default.
- Preview selalu `--scale=0.5`; full-res 1080×1920 hanya di Tahap 5.
- Jaga biaya per frame rendah: geometri primitif, instancing untuk
  elemen berulang (rumput/pohon), tanpa efek per-pixel berat.
- Setelah concat, probe ulang file gabungan (check_output.sh) — file
  hasil gabungan adalah yang dinilai, bukan klaim render.

## QC mandiri wajib (fail-closed — semua harus PASS)

1. `validate_timeline.py` PASS dan file final ter-probe: 1080×1920,
   30 fps, durasi masuk rentang format (30–60; A2: 30–120), audio
   ada sampai mendekati akhir.
2. Setiap batas scene ≤ 0,3 detik dari awal kalimat pemetaannya.
3. Tidak ada teks terpotong/keluar zona aman di contact sheet & preview.
4. Hook lengkap (teks+suara+visual) hadir di 1,5 detik pertama.
5. Counter/readout muncul sinkron dengan kalimat angkanya. Angka hero
   3D (bila dipakai) maksimal satu, utuh di dalam frame, dan angkanya
   juga terbaca sebagai readout/caption. Readout hitungan tanpa kredit
   sumber di frame yang sama = FAIL; label kejujuran (ILUSTRASI /
   DISEDERHANAKAN / BELUM TERBUKTI) wajib tampil pada klaim/visual
   pemicunya.
6. Tidak ada keheningan tanpa alasan > 1 detik; jeda payoff ≤ 1 detik.
7. Loudness −14 LUFS ±1, peak ≤ −1 dB.
8. Gaya konsisten antar scene (palet, rig cahaya, font, gaya caption).
9. Manusia hanya siluet. Mode A: subjek hero tidak close-up
  (kecuali Varian A2). Mode B:
   label bagian sesuai urutan narasi dan tidak ada HUD permanen
   (cek khusus Mode B di references/mode-b.md WAJIB ikut diperiksa).
   Mode C:
   organ hero utuh terbaca dan kode warna aliran tidak terbalik
   (cek khusus Mode C di references/mode-c.md WAJIB ikut diperiksa).
10. Penutup memuat kesimpulan (Mode A), kesimpulan/prinsip (Mode B),
    atau callback (Mode C) — khusus A2 perjalanan bukti: verdict +
    pertanyaan terbuka spesifik; fade
    ke hitam bersih; TIDAK ada kartu/label seri, pill tahap, atau
    penanda posisi di frame mana pun (v2.8).
    (CTV hadir hanya bila diminta untuk video ini.)

## Output dan laporan

- `out/scenes/scene-N.mp4`, `out/<slug>-preview.mp4`,
  `out/<slug>-final.mp4`, `out/contact-sheet.png`,
  `docs/timeline.json`.
- Laporan akhir WAJIB memuat: tabel kalimat ringkas, pemetaan scene,
  hasil validator + check_output, hasil 10 poin QC satu per satu,
  dan daftar kredit & label kejujuran per scene.
- Bila memakai aset unduhan/data luar: laporan WAJIB memuat daftar aset
  (nama, pembuat, lisensi, tanggal cek badge, ukuran file), total ukuran
  aset, catatan waktu render, dan baris kredit aset yang siap ditempel
  ke caption.
- Caption Instagram: informatif, menutup dengan label seri + hashtag
  relevan.

## Batas kejujuran skill ini

Skill ini meniadakan kegagalan yang bisa dicek mesin (timing, teks,
konsistensi, spesifikasi file). Ia TIDAK menjamin selera: penilaian
"bagus/tidak" tetap lewat Gerbang still oleh mata user. Karena itu
gerbang tidak boleh dihapus diam-diam — pelonggarannya hanya mengikuti
tangga berbasis bukti di Keputusan terkunci.
