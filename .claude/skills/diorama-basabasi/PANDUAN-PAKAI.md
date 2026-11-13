# Panduan Pakai — Skill diorama-basabasi (v2.9)

Alur lengkap pemakaian skill ini dari sisi operator (Wafiq, dari
tablet), untuk setiap video. Skill terpasang di repo
`wafiq8/motion-3D` pada `.claude/skills/diorama-basabasi/` dan dipakai
lewat sesi Claude Code cloud pada repo itu (Claude Code memerlukan
paket Claude berbayar — sesuai tabel harga Anthropic, paket Free tidak
termasuk Claude Code).

Prinsipnya: pekerjaan operator cuma menyiapkan bahan, menempel satu
prompt, dan menjawab DUA gerbang. Semua pekerjaan teknis (timeline,
kode scene, render, QC) dikerjakan sesi mengikuti SKILL.md.

## A. Siapkan bahan (di luar sesi, per video)

1. Topik video + mode (A = lanskap/sejarah, B = bongkar benda/cara kerja, C = anatomi) + label seri + nomor part (mis. "Sejarah Alam 3D —
   Part 2" atau "Seri Tubuh Manusia — Part 1").
2. Sumber fakta utama (teks ditempel, atau file yang sudah ada di
   repo). Sumber ini menang bila bertentangan dengan sumber lain;
   sesi boleh melengkapi lewat riset web dengan kewajiban mencantumkan
   sumber di laporan akhir.
3. Naskah narasi final. Kalau belum ada, sesi bisa membuatkan draf
   dari sumber — tetapi draf harus disetujui dulu sebelum produksi
   lanjut (diatur di prompt mulai).
4. MP3 narasi: buat dari naskah memakai TTS pilihan sendiri
   (ElevenLabs, Gemini, atau apa pun — skill ini agnostik suara).
   Total audio wajib masuk 30–60 detik.
5. File musik latar pilihan sendiri (sesi dilarang memilihkan musik).
6. Upload MP3 narasi + file musik ke ROOT repo motion-3D
   (GitHub web dari tablet: Add file → Upload files). Nama file bebas;
   sesi yang memindahkannya ke `public/narasi.mp3` dan
   `public/musik.*`.

## B. Mulai sesi

7. Buka sesi Claude Code cloud BARU pada repo motion-3D.
   Satu sesi = satu video; jangan mencampur dua video dalam satu sesi.
8. Tempel isi `prompt-mulai-sesi-baru.txt` yang sudah dilengkapi:
   topik, sumber, label seri + part, dan naskah (atau status
   "belum ada — buatkan draf").
9. Sesi membaca SKILL.md + file `references/` mode yang dipilih
   dan mulai bekerja
   mengikuti tahap-tahap di bawah. Operator tidak perlu mengetik
   instruksi teknis apa pun lagi.

## C. Alur produksi di dalam sesi (Tahap 0–5 + 2 gerbang)

- **Tahap 0 — Scaffold.** Sesi memakai ulang scaffold proyek yang
  sudah ada (renderer, rig kamera/cahaya, primitif, komponen teks).
  Tidak ada pembangunan ulang dari nol.
- **Tahap 1 — Timeline.** Sesi memindahkan MP3 ke `public/narasi.mp3`
  dan musik ke `public/musik.*`, lalu mengambil timestamp per kata
  (timestamp bawaan TTS bila tersedia; cadangan Whisper model besar,
  bahasa Indonesia dipaksa — teks kalimat selalu dari naskah resmi,
  bukan transkrip). Hasilnya `docs/timeline.json` + Tabel Kalimat:
  setiap scene dipetakan dari ISI kalimat (batas scene = awal kalimat
  pertamanya, toleransi 0,3 detik).
  Sesi menjalankan `scripts/validate_timeline.py` — kalau FAIL,
  timeline diperbaiki dan validator diulang; sesi dilarang lanjut
  dalam keadaan FAIL.
  → **GERBANG 1 (operator):** sesi menampilkan ringkasan timeline
  (jumlah kalimat, pemetaan kalimat → scene, total durasi) lalu
  BERHENTI. Tugas operator: periksa pemetaan masuk akal dan total
  durasi 30–60 detik; balas setuju, atau sebutkan yang harus diubah.
- **Tahap 2 — Bangun scene.** Sesi menulis kode scene (Remotion +
  Three.js) dari timeline.json dan file mode terpilih (mode-a.md /
  mode-b.md / mode-c.md): style lock mode itu,
  hook teks+suara+visual dalam ±1,5 detik pertama, subtitle karaoke
  halaman 2–4 kata, angka sebagai readout layar (maksimal satu angka
  hero 3D emas untuk angka puncak, selalu diduplikasi readout),
  semua teks wajib-baca sebagai overlay DOM terukur anti-kepotong,
  penutup kesimpulan/callback tanpa kartu seri dan tanpa pill
  tahap/penanda posisi (CTV hanya bila diminta untuk
  video ini).
- → **GERBANG 2 (operator):** sesi me-render 3 still per scene
  (awal/tengah/akhir) + satu contact sheet, menampilkannya sebagai
  file di sesi, lalu BERHENTI. Tugas operator: periksa dari tablet —
  teks kepotong? subjek utuh dalam frame? gaya konsisten antar
  scene? — lalu setujui, atau sebutkan scene yang diperbaiki.
  Perbaikan di tahap still jauh lebih murah daripada di video.
- **Tahap 4 — Preview + QC mandiri.** Sesi me-render preview skala
  0.5, menjalankan QC 10 poin atas hasil sendiri (spesifikasi file,
  batas scene ≤0,3 detik, teks aman, hook, sinkronisasi counter,
  keheningan, loudness −14 LUFS ±1, konsistensi gaya, aturan siluet/
  jarak subjek, penutup), memperbaiki semua temuan dengan me-render
  ulang HANYA scene yang berubah, dan menggabungkan per-scene dengan
  FFmpeg concat `-c copy`.
- **Tahap 5 — Final.** Render full-res 1080×1920 SEKALI. Sesi
  menjalankan `scripts/check_output.sh` pada file gabungan, lalu
  menampilkan file final + laporan lengkap di sesi: tabel kalimat,
  pemetaan scene, hasil validator + check_output, hasil QC 10 poin
  satu per satu, dan usulan caption Instagram.

## D. Selesai

10. Unduh `out/<slug>-final.mp4` dari sesi ke tablet, lalu posting
    manual. Artefak produksi tersimpan di sesi/repo: `out/scenes/
    scene-N.mp4`, `out/<slug>-preview.mp4`, `out/contact-sheet.png`,
    `docs/timeline.json`.

## E. Video berikutnya

11. Ulangi dari langkah A dengan sesi BARU. Scaffold, primitif, dan
    komponen dipakai ulang, jadi produksi berikutnya lebih cepat
    dari yang pertama. Target ritme: 1–2 video/hari.

## F. Pelonggaran gerbang (otomatis tercatat, sesuai SKILL.md v2.5)

- Setelah 3 video berturut-turut lolos Gerbang 2 TANPA revisi visual
  mayor → format ringan: 1 still per scene.
- Setelah 3 video lagi lolos bersih dalam format ringan → Gerbang 2
  opsional untuk jenis scene yang sudah terbukti; scene/jenis visual
  baru tetap wajib still.
- Satu revisi visual mayor → kembali ke format penuh.
- Gerbang 1 TIDAK pernah dilonggarkan. Pelonggaran dicatat sesi di
  laporan akhir dan bisa dicabut operator kapan saja.

## G. Kalau macet

- **Sesi berhenti sebelum mulai:** hampir pasti MP3 narasi atau file
  musik belum ada di root repo — memang dirancang berhenti dan
  mengabari. Upload dulu, lalu suruh sesi lanjut.
- **Durasi audio di luar 30–60 detik:** sesi melapor, bukan memotong
  diam-diam. Sesuaikan naskah/TTS, buat MP3 baru.
- **Sesi gagal push hasil ke GitHub (403):** itu izin aplikasi Claude
  milik Anthropic untuk repo ini — berbeda dari aplikasi GitHub Muse
  yang sudah ditambahkan. File hasil tetap bisa diunduh langsung dari
  sesi; menambahkan repo ke aplikasi itu (Settings → Installations →
  Configure → Repository access) menghilangkan blokirnya.
- **Validator/QC gagal:** sesi wajib memperbaiki di tahapnya.
  Jangan meminta sesi melompati gerbang — gerbang itulah yang membuat
  render final pertama biasanya langsung benar.
