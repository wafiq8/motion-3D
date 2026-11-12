# Referensi Mode A — Lanskap / Sejarah (termasuk Varian A2 Peta Hidup)

Detail produksi Mode A untuk skill `diorama-basabasi`. Dibedah dari video
asli @motionformat: Pinisi (Sejarah 3D), Tembok Besar China (40 dtk), dan
Sundaland/Zaman Es (55 dtk). Baca file ini sebelum membangun scene.

## Gaya visual

- Diorama 3D stilasi semi-realistis: cahaya sinematik hangat, perspektif
  dan warna natural terasa nyata; permukaan halus dan bersih; latar
  disederhanakan; pohon = gumpalan bola-bola menyatu (merged spheres).
- Rig cahaya TETAP untuk semua video: hemisphere (langit #FFE3B3 /
  tanah #8A6B45, 0.9) + directional senja #FFD9A0 (2.2) dari sudut tetap,
  bayangan lembut, ACES tone mapping exposure 1.1. Material
  MeshStandardMaterial roughness 0.85–1.0, metalness 0.
- Palet dasar (boleh bergeser mengikuti topik/musim — contoh asli memakai
  oranye musim gugur untuk Tembok Besar): sabana #C8A24A, pasir #EAD9B0,
  kayu #6B4226, laut #2E6E8E, senja #F08A2E, emas #D9A62E, kabut #F2D8AE,
  siluet manusia #1F150C, awan #FFF3DC, aksen #FFB03A.
- Awan = 5–9 bola menyatu per gumpalan. Rumput/vegetasi berulang =
  instancing. Tanpa tekstur file luar.

## Tipografi & teks layar

- Judul topik dan label era: SERIF kapital elegan ("TEMBOK BESAR CHINA",
  "DINASTI MING"), putih dengan shadow halus, di atas establishing shot
  BERGERAK (bukan kartu statis).
- Judul readout pada varian peta/teknis: sans tebal.
- Teks besar di scene HANYA untuk: judul, label era, readout data.
  Sisanya lewat subtitle karaoke (halaman 2–4 kata, kata aktif tegas,
  kata kunci berwarna aksen oranye/biru).
- Readout data: teks serif/sans kecil-menengah bergaya label + garis
  penunjuk tipis ke subjek + counter angka yang MENGHITUNG saat disebut.
  Format angka Indonesia (ribuan titik, desimal koma): "21.196 km",
  "> 2.000 tahun", "±400 km".
- Pengecualian hybrid (keputusan user): SATU angka per video — angka
  puncaknya — boleh tampil sebagai angka 3D emas timbul di dalam scene,
  muncul pada ketukan kalimatnya dan utuh di dalam frame. Angka yang
  sama tetap ditampilkan sebagai readout/caption; angka lain tidak
  boleh dibuat 3D.

## Bahasa kamera

- Di dalam satu segmen: perjalanan kontinu — terbang menyusuri subjek,
  menembus gerbang/menara, pull-back menanjak, top-down murni untuk
  menunjukkan skala, zoom-out ekstrem untuk analogi.
- Tangga zoom = struktur argumen: tiap tingkat skala membawa satu
  ketukan kalimat (dek → pegunungan → tampak atas → orbit).
- Antar segmen fakta: fade hitam ±0,1 detik. Hard cut bebas tidak dipakai.
- Subjek yang bergerak (hewan, kapal): kamera ¾ atau samping — dilarang
  top-down murni untuk subjek bergerak; top-down hanya untuk peta/skala.

## Struktur narasi (pilih sesuai topik)

1. **Satu aliran** (topik sistem/proses): kawal satu benang dari masuk
   sampai keluar (paket udara, paket darah, rute perjalanan).
2. **Dua fakta satu topik**: fakta 1 (sering bantahan mitos) → fade →
   fakta 2 sebagai segmen DEMONSTRASI (klaim dibuktikan visual: proses
   dibuat, diuji, dibandingkan).
3. **Mesin waktu peta** (Varian A2, di bawah).

Hook selalu kalimat pertama: pertanyaan, bantahan mitos terkenal, atau
klaim kontraintuitif — hadir sebagai teks + suara + visual ≤ 1,5 detik.

## Penutup

- Beauty shot golden hour; judul/era serif diulang; satu kalimat
  kesimpulan (penonton membawa pulang wawasan). Sesekali — hanya bila
  user memintanya untuk video itu — kalimat penutup boleh berbentuk
  CALL TO VALUE; tidak pernah ajakan membeli.
- Label seri bernomor tampil di frame penutup ("Sejarah Alam 3D · Part N"
  atau seri yang sedang berjalan).
- Fade ke hitam. Jeda payoff 0,3–1 detik diperbolehkan.

## Varian A2 — Peta Hidup (geografi / sejarah wilayah)

Seluruh video = SATU peta relief 3D (terrain timbul dari heightmap di
atas alas seperti maket) sebagai mesin waktu. Dari contoh "Sundaland":

- Header bab era permanen di atas-tengah ("ZAMAN ES" → "HARI INI"),
  berganti hanya saat era berganti; tetap di zona aman atas.
- **Counter parameter menggerakkan dunia:** readout besar ("MUKA LAUT
  −120 m") beranimasi sinkron narasi; keadaan peta (garis pantai,
  daratan muncul/tenggelam, inset kecil pendukung) berubah MENGIKUTI
  angka itu. Parameter yang sama diputar balik untuk memutar waktu.
- Hook: klaim kontraintuitif + garis rute bercahaya yang menggambar
  dirinya di peta.
- Label wilayah muncul di posisi geografis sebenarnya saat disebut
  narasi; garis batas (mis. garis Wallace) tergambar sebagai garis
  putus-putus beranimasi.
- Nama konsep besar ("SUNDALAND") = judul raksasa tepat di momen
  penyatuan/kejadiannya — penamaan adalah payoff segmen.
- Fauna/manusia di atas peta = IKON DATAR 2D piktogram yang bergerak
  sederhana mengikuti rute — bukan model 3D berakting.
- Struktur: klaim → mekanisme (counter bergerak) → penamaan → konsekuensi
  → twist pengecualian ("tapi ada satu … yang tidak pernah …") →
  pembalikan → cermin masa kini: objek modern kecil bergerak di peta,
  permukaan dibuat tembus pandang, lapisan masa lalu menyala di bawahnya.
- Implementasi prosedural: heightmap terrain + bidang air berlevel
  animasi + label DOM. Ini varian paling ringan dirender.
