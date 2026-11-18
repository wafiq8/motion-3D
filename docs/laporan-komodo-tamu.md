# Laporan Produksi — Komodo (storytelling keselamatan tamu)

- Mode: A — Diorama (storytelling kasus nyata) · slug `komodo-tamu`
- Final: `out/komodo-tamu-final.mp4` (1080×1920, 30 fps, 57,50 dtk, H.264 + AAC 48 kHz)
- Preview: `out/komodo-tamu-preview.mp4` (skala 0,5) · Per scene: `out/scenes/scene-1..7.mp4`
- Contact sheet: `out/contact-sheet.png` · Timeline: `docs/timeline.json`

## Tabel kalimat

| No | Kalimat (ringkas) | Mulai | Selesai | Scene |
|---|---|---|---|---|
| 1 | Mei 2017… turis Singapura… memotret dari dekat | 0,00 | 6,60 | 1 |
| 2 | …menyantap bangkai kambing. Kamera terangkat… | 7,03 | 12,16 | 2 |
| 3 | Yang tak ia sadari: bahaya jarang datang… | 12,50 | 15,86 | 3 |
| 4 | Dari samping, komodo lain… menggigit betis kirinya | 16,31 | 21,50 | 3 |
| 5 | …kelenjar bisa… darah sulit membeku… tekanan anjlok… | 21,96 | 31,26 | 4 |
| 6 | 2009… Muhamad Anwar… meninggal… ke Flores | 31,82 | 39,44 | 5 |
| 7 | Turis itu lebih beruntung… Labuan Bajo… Ia selamat. | 39,93 | 45,44 | 6 |
| 8 | Jaga jarak, jangan berpisah dari ranger, awasi… | 45,83 | 52,74 | 7 |
| 9 | Karena komodo selalu tampak lambat… | 53,25 | 56,38 | 7 |

Timing: Whisper large-v3 (`language="id"` dipaksa) hanya untuk waktu per kata; teks dari naskah resmi;
awal kalimat diselaraskan ke jeda hening (silencedetect). Jeda payoff penutup 1,12 dtk (termasuk fade 0,6 dtk).

## Pemetaan scene (frame @30 fps)

| Scene | Kalimat | Frame | Visual inti |
|---|---|---|---|
| 1 | 1 | 0–210 | Establishing savana + lontar, turis berjalan, judul serif PULAU KOMODO · MEI 2017 |
| 2 | 2 | 211–374 | Komodo besar menyantap bangkai kambing (stilistik), kamera terangkat, melangkah |
| 3 | 3–4 | 375–658 | Kamera bergeser, komodo kedua (lebih kecil) dari samping, menerkam betis, siluet terhuyung jatuh |
| 4 | 5 | 659–954 | Potongan rahang (geometri kepala hero yang sama) — kelenjar bisa menyala, partikel bisa, pembuluh darah melebar; readout alur |
| 5 | 6 | 955–1197 | Kilas 2009 (sepia): pohon srikaya, dua komodo di bawahnya, perahu kayu menjauh ke label FLORES; tanpa adegan serangan |
| 6 | 7 | 1198–1374 | Speedboat + ranger, dermaga Labuan Bajo, siluet ditandu masuk klinik; IA SELAMAT |
| 7 | 8–9 | 1375–1724 | Rombongan + ranger bertongkat cabang, lingkaran jarak aman, 3 aturan; komodo istirahat mengangkat kepala pada "detik"; wide savana + judul; fade hitam |

Semua batas scene = awal kalimat pertamanya (selisih 0,00 dtk; frame awal dibulatkan ≤ 0,017 dtk).

## Hasil validator & check_output

- `validate_timeline.py docs/timeline.json` → **PASS SEMUA**
- `check_output.sh out/komodo-tamu-final.mp4` → **PASS SEMUA** (1080×1920 · 30 fps · 57,50 dtk · tanpa keheningan > 1,2 dtk · −14,1 LUFS)
- ebur128 file final: I = −14,0 LUFS, true peak −1,5 dBFS

## QC mandiri 10 poin

1. **PASS** — validator PASS; final ter-probe 1080×1920, 30 fps, 57,50 dtk; audio sampai akhir (narasi 56,38 dtk + musik fade-out).
2. **PASS** — batas scene 0,00/7,03/12,50/21,96/31,82/39,93/45,83 dtk = awal kalimat 1/2/3/5/6/7/8.
3. **PASS** — semua teks overlay DOM, diukur `fitText`/`measureText` setelah font termuat, lebar ≤ 90%, di luar zona ±250 px atas / ±310 px bawah; tidak ada terpotong di contact sheet & preview. Halaman karaoke 2–4 kata; angka lisan ditampilkan sebagai "2017"/"2009".
4. **PASS** — hook: suara "Mei 2017" + judul serif + establishing shot bergerak sejak frame 0 (judul penuh ≤ 0,25 dtk).
5. **PASS** — readout S4 muncul pada kata "darah", "tekanan", "luka"; label KELENJAR BISA pada "kelenjar"; aturan S7 pada "jaga"/"jangan"/"awasi". Tidak ada angka hero 3D. Tidak ada readout hasil hitungan; kredit kasus/sumber hadir di frame yang sama dengan klaimnya.
6. **PASS** — tidak ada keheningan > 1 dtk; jeda payoff 1,12 dtk berisi musik + fade (nada penutup).
7. **PASS** — −14,0 LUFS, true peak −1,5 dBFS (musik di-duck sidechain di bawah narasi).
8. **PASS** — satu renderer, satu rig (hemisphere #FFE3B3/#8A6B45 0,9 + directional #FFD9A0 2,2, ACES 1,1), satu set material; font Playfair Display (serif) + Inter (sans) di semua scene. Catatan: S4 berlatar gelap (panggung diagram) dan S5 diberi grade sepia DOM sebagai penanda kilas balik — rig & material tetap sama.
9. **PASS** — figur siluet plus: proporsi manusia, sendi bergerak dari timeline, wajah kosong; warna peran turis = kamera abu-biru, ranger = topi + tongkat bercabang hijau zaitun. Komodo hero ≥ 8 m dari kamera di S1–S3, S5, S7 (S4 adalah model diagram kepala, bukan subjek lanskap). Tanpa gore: gigitan = terkaman + siluet terhuyung; bangkai kambing stilistik tanpa luka.
10. **PASS** — penutup: wide shot savana + judul PULAU KOMODO diulang + kalimat kesimpulan (kal. 9); fade ke hitam bersih; tanpa kartu/label seri, pill tahap, atau penanda posisi; tanpa CTA.

## Kredit & label kejujuran per scene

| Scene | Label | Kredit di layar |
|---|---|---|
| 1 | ILUSTRASI · REKONSTRUKSI | KASUS MEI 2017 — AFP / JAKARTA POST |
| 2 | ILUSTRASI · REKONSTRUKSI | KASUS MEI 2017 — AFP / JAKARTA POST |
| 3 | ILUSTRASI · REKONSTRUKSI | KASUS MEI 2017 — AFP / JAKARTA POST |
| 4 | DISEDERHANAKAN | FRY DKK. 2009 · PNAS |
| 5 | ILUSTRASI · REKONSTRUKSI | KASUS 2009 — THE GUARDIAN |
| 6 | ILUSTRASI · REKONSTRUKSI | KASUS MEI 2017 — AFP / JAKARTA POST |
| 7 | — (segmen edukasi, bukan klaim kasus) | — |

Fakta mengikuti brief user (rujukan utama); tidak ada riset web tambahan, tidak ada klaim baru di luar naskah.
Usia korban tidak disebut.

## Aset

- Tidak ada aset unduhan / data luar: semua visual prosedural Three.js (komodo, figur, perahu, klinik, vegetasi).
- Font di-vendor: Playfair Display & Inter (@fontsource, SIL OFL 1.1), `public/fonts/` total ±130 KB.
- Audio dari user: `public/narasi.mp3` (454 KB), `public/musik.mp3` (6,5 MB).

## Catatan waktu render (4 core, Chromium ANGLE/SwiftShader)

- Still 0,5×: ±1,7 dtk/frame · Preview 0,5× penuh: 689 dtk · Final 1080×1920: 753 dtk (per scene 45–199 dtk) · Re-render S3 preview setelah QC: 144 dtk.

## Gerbang

- Gerbang 1 disetujui · Gerbang 2 disetujui tanpa revisi visual mayor (format penuh 3 still/scene; video pertama dalam hitungan tangga pelonggaran: 1/3).
- Temuan QC preview yang diperbaiki: posisi akhir komodo kedua di S3 (badan menembus kaki siluet) → moncong tepat di betis; hanya S3 di-render ulang.

## Usulan caption Instagram

Mei 2017, seorang turis memotret komodo yang sedang makan di Pulau Komodo. Bahaya justru datang dari samping: komodo lain yang lebih kecil menggigit betis kirinya. Ia selamat berkat pertolongan pertama di lokasi, perahu ke Labuan Bajo, dan rumah sakit. Tidak semua orang seberuntung itu — pada 2009, warga Pulau Komodo bernama Muhamad Anwar meninggal kehabisan darah setelah digigit dua komodo.

Kenapa gigitan komodo berbahaya? Kelenjar bisa di rahang bawahnya menghasilkan racun yang membuat darah sulit membeku dan tekanan darah anjlok (Fry dkk., 2009, PNAS).

Kalau berkunjung: jaga jarak, jangan berpisah dari ranger, dan awasi sekelilingmu — bukan cuma komodo di depan kamera.

Sumber kasus: AFP / The Jakarta Post (2017), The Guardian (2009). Visual adalah ilustrasi rekonstruksi 3D.

[LABEL SERI — isi sesuai seri] #komodo #pulaukomodo #labuanbajo #tamannasionalkomodo #wisataaman #edukasi #faktahewan #nusatenggaratimur
