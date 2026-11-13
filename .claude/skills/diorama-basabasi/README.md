# diorama-basabasi — Tool Produksi Video Edukasi Basabasi (Mode A)

Skill Claude Code untuk membuat video edukasi vertikal 9:16 (30–60 detik)
bergaya diorama 3D semi-realistis Mode A (lanskap/sejarah + varian peta
hidup) dari kode (Remotion + Three.js), pola Motion Format versi Basabasi,
dengan tujuan membangun audiens. Dirancang agar render final pertama
langsung lolos QC: timing diukur dari audio asli ke dalam satu
timeline.json yang divalidasi mesin, teks readout tidak bisa keluar
frame, ada gerbang still-frame yang murah, dan sesi wajib QC mandiri
fail-closed sebelum menyerahkan hasil.

## Keputusan terkunci (user, 12 Nov 2026)

Mode A saja · tujuan bangun audiens (penutup kesimpulan + label seri;
CTV hanya sesekali bila diminta) · angka = readout layar (hybrid: maks.
satu angka hero 3D emas per video) · durasi 30–60 detik · suara agnostik (MP3 dari user) ·
musik dari user · fakta: sumber user utama, riset web boleh melengkapi
+ wajib cantumkan sumber · operator tunggal ·
target 1–2 video/hari · render cepat per-scene + concat (pola optimasi
Puppeteer/FFmpeg).

## Isi paket

- `SKILL.md` — inti (195 baris): keputusan terkunci, larangan keras,
  aturan timing/timeline.json, style lock ringkas, aturan teks, audio,
  alur 5 tahap dengan 2 gerbang, pipeline render cepat, QC 10 poin.
- `references/mode-a.md` — detail Mode A: gaya visual + palet + rig
  cahaya, tipografi serif, bahasa kamera & tangga zoom, tiga struktur
  narasi, penutup CTV, dan Varian A2 Peta Hidup.
- `templates/tabel-kalimat.md` — format baku tabel kalimat & pemetaan.
- `scripts/validate_timeline.py` — validator fail-closed untuk
  timeline.json (sudah diuji: PASS pada contoh valid).
- `scripts/check_output.sh` — pemeriksa file final via ffprobe/ffmpeg:
  resolusi, fps, durasi 31–55, keheningan, loudness (sudah diuji).
- `evals/evals.md` — 3 skenario uji (aliran, peta, bantahan mitos) +
  asersi lulus/gagal terukur; jalankan sebelum skill disebut selesai.
- `prompt-mulai-sesi-baru.txt` — prompt pendek yang ditempel user sebagai
  pesan pertama setiap produksi baru di sesi Claude Code cloud.

## Cara pasang

Salin folder `diorama-basabasi` ini ke dalam repo kerja, di lokasi:

```
<repo>/.claude/skills/diorama-basabasi/
```

## Cara pakai (alur user)

1. Siapkan: topik + sumber fakta, naskah (atau minta draf), MP3 narasi,
   dan file musik — upload MP3 + musik ke root repo.
2. Buka sesi baru Claude Code cloud pada repo itu, tempel isi
   `prompt-mulai-sesi-baru.txt` yang sudah dilengkapi.
3. Setujui dua gerbang: (a) ringkasan timeline, (b) contact sheet
   still-frame sebelum render gerak.
4. Unduh MP4 final dari sesi.

## Versi

- v2.6 (13 Nov 2026) — target ritme dilunakkan user menjadi 1–2
  video/hari (dari kunci datar 2/hari).
- v2.5 (13 Nov 2026) — gerbang diputuskan user: tetap dua; Gerbang 2
  (still) boleh dilonggarkan bertahap demi efisiensi setelah
  berturut-turut lolos bersih (tangga pelonggaran di SKILL.md);
  Gerbang 1 tidak pernah dilonggarkan.
- v2.4 (13 Nov 2026) — sumber fakta dilonggarkan atas kata user
  ("slow aja"): sumber user tetap rujukan utama, sesi boleh riset web
  untuk melengkapi dengan kewajiban mencantumkan sumber + menandai
  klaim belum terverifikasi.
- v2.3 (13 Nov 2026) — durasi standar dilebarkan user menjadi 30–60
  detik (dari 31–55), termasuk konstanta di kedua skrip pemeriksa.
- v2.2 (13 Nov 2026) — gaya angka diubah user menjadi HYBRID: readout
  layar tetap sistem utama; maksimal satu angka hero 3D emas per video
  untuk angka puncak, selalu diduplikasi readout/caption.
- v2.1 (13 Nov 2026) — koreksi dari user soal penutup: CTV hanya
  sesekali bila diminta untuk video itu, bukan elemen wajib; penutup
  bawaan = kesimpulan + label seri.
- v2.0 (12 Nov 2026) — dibangun ulang dari hasil deep research + jawaban
  user atas 10 pertanyaan desain: struktur progressive disclosure
  (inti + referensi + skrip + eval), fokus Mode A, readout DOM,
  timeline.json tervalidasi, karaoke 2–4 kata, hook teks+suara+visual
  ≤1,5 detik, durasi 31–55 detik, penutup call to value.
- v1.5–v1.1 — fase bedah 5 video contoh @motionformat (Mode A/B/C +
  varian peta). Mode B dan C kini tersimpan sebagai referensi di memori,
  tidak di paket aktif.
- v1.0 — sistem sekali-render awal dari bedah forensik render Komodo.
