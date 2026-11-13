# Referensi Mode C — Anatomi (Seri Tubuh Manusia)

Detail Mode C untuk skill diorama-basabasi. Inti (SKILL.md) tetap
berlaku penuh: timeline.json, gerbang, validator, aturan teks DOM,
audio, QC. File ini hanya mengganti SISTEM VISUAL dan STRUKTUR
NARASI dari Mode A. Sumber pola: bedah video "Jantung — Seri Tubuh
Manusia · Part 1" milik @motionformat (52,7 detik, nol hard cut).

## Ruang lingkup

- Topik: anatomi & fisiologi tubuh manusia — satu organ/sistem per
  video (jantung & peredaran darah, paru & pernapasan, pencernaan,
  otot, otak, dst). Seri baku: "Seri Tubuh Manusia".
- SATU organ hero per video. Organ lain tampil hanya sebagai bagian
  dari jalur aliran yang diikuti.
- Ini BUKAN diorama lanskap: tidak ada tanah, langit senja, atau
  palet Mode A di mode ini.

## Panggung & model hero

- Panggung = kehampaan (void) ungu gelap dengan bokeh lembut dan
  partikel melayang (sel darah sebagai elemen latar/arus). Organ hero
  melayang di tengah, menjadi satu-satunya panggung.
- Bangun SATU model organ hero prosedural per video, dipakai ulang
  di SEMUA scene video itu — dan simpan sebagai aset untuk video
  organ yang sama berikutnya. Catatan jujur: model organ organik
  adalah bagian tersulit mode ini; cerita ditopang kamera, partikel
  aliran, dan label — bukan detail model. Stilasi glossy yang bersih
  mengalahkan realisme yang tanggung.
- Belahan/interior organ hanya untuk segmen mekanisme (lihat
  Struktur), dinyatakan lewat pill tahap; jangan membelah di segmen
  lain.

## Material & rig cahaya Mode C

- Material organ: glossy seperti vinyl — MeshStandardMaterial
  roughness 0,25–0,45, permukaan halus bersih, TANPA tekstur luar.
- Rig: key light lembut dari depan-atas + rim light kuat dari
  belakang-samping (tepi organ bercahaya) + ambient rendah. Satu rig
  untuk semua scene video itu.
- Jangkar warna (boleh digeser tipis per organ, jangan diganti
  sistemnya): void `#1E1033`–`#2A1450`, organ sesuai anatomi
  (jantung merah muda `#C14B5A`–`#D96A72`), bokeh `#6B4FA8` redup,
  aksen label kuning `#FFD84D`.

## Kode warna aliran — MUTLAK (pembawa informasi utama)

- **Biru** = aliran miskin oksigen (darah terdeoksigenasi / aliran
  masuk). **Merah terang** = aliran kaya oksigen.
- DILARANG membalik arti warna ini — di dalam satu video maupun antar
  video seri. Penonton belajar kode ini sekali dan memakainya terus.
- Partikel aliran = sel instanced (cakram/sfera pipih) bergerak
  mengikuti jalur pembuluh dari frame. Di titik pertukaran (mis.
  alveoli paru), partikel WAJIB terlihat berubah warna biru → merah
  tepat pada kalimat penjelasnya — ini momen kunci mode ini.
- Pembuluh digambar mengikuti kode yang sama: biru untuk jalur
  terdeoksigenasi, merah untuk teroksigenasi.

## Kamera

- Kamera MENGIKUTI satu paket aliran (follow-one-flow): penonton
  mengawal satu paket darah/sinyal/udara dari masuk sampai keluar
  sistem. Jangan melompat antar lokasi tanpa mengikuti paketnya.
- Tangga zoom argumen: organ → sistem → mikroskopis → organ → tubuh
  utuh. Skala mikroskopis (alveoli, kapiler, sel) diperbolehkan dan
  memang ciri mode ini.
- Frame tubuh utuh di ujung tangga = siluet manusia utuh tanpa wajah
  dan tanpa detail — konsisten dengan aturan manusia siluet di inti,
  dipakai sebagai peta posisi organ/aliran.
- Aturan jarak kamera minimum 8 m di inti TIDAK berlaku di mode ini:
  organ hero memang mengisi frame. Yang berlaku: organ selalu utuh
  terbaca (tidak terpotong frame kecuali saat kamera masuk interior
  di segmen mekanisme).

## Tipografi & overlay Mode C

- **Hook waktu-nyata:** kalimat pertama merujuk waktu penonton saat
  itu juga ("Selama kamu nonton video ini, …") + **counter hidup**
  mulai berjalan di detik pertama (mis. ikon ♥ + angka ketukan yang
  bertambah SINKRON dengan ketukan visual organ, selisih ≤ 0,3
  detik). Counter hidup adalah readout DOM.
- **Judul DITUNDA:** judul topik SERIF kapital baru muncul ±5–8
  detik, SETELAH hook — bukan di frame pertama. Di bawahnya anotasi
  fakta bertumpuk (ukuran, jumlah ruang/bagian) muncul satu-satu
  mengikuti narasi.
- **Pill tahap:** SATU pill satu baris di atas-tengah frame, berisi
  titik warna semantik (biru/merah sesuai status aliran) + nama tahap
  perjalanan saat ini ("Oksigennya sudah dipakai" → "Dipompa ke
  paru-paru" → "Di paru-paru: ambil oksigen" → …). Ini pengecualian
  terukur dari larangan HUD tumpuk di riset: hanya pill ini, satu
  baris, isinya berubah mengikuti posisi aliran — dia pembawa
  struktur aliran, bukan hiasan. Elemen HUD lain tetap dilarang.
- **Chip label anatomi:** label DOM terproyeksi menempel pada bagian
  organ; chip MENYALA berwarna aliran (biru/merah) tepat saat bagian
  itu aktif menurut narasi, redup saat tidak aktif.
- Subtitle karaoke: halaman 2–4 kata dalam pill gelap, kata kunci
  berwarna kuning aksen (konsisten dengan mode ini).
- Onomatope sebagai teks peristiwa ("lub … dub") diperbolehkan di
  segmen mekanisme. Strip sinyal animasi (ECG dsb.) diperbolehkan
  sebagai readout DOM/SVG di segmen mekanisme saja.
- Angka tetap HYBRID per inti: semua angka = readout DOM; counter
  finale adalah readout teranimasi. Angka hero 3D emas secara bawaan
  TIDAK dipakai di Mode C.

## Struktur narasi Mode C (wajib — ikuti satu aliran)

1. **Hook waktu-nyata** (±0–5 dtk): rujukan ke waktu penonton +
   counter hidup mulai + organ hero tampil utuh.
2. **Judul tunda + anotasi** (±5–10 dtk): judul serif muncul, fakta
   ukuran/bagian bertumpuk mengikuti narasi.
3. **Perjalanan aliran** (bagian terbesar): satu paket diikuti
   melewati SELURUH sirkuit/sistem tanpa putus; pill tahap berganti
   di setiap pos; chip menyala mengikuti bagian aktif; tangga zoom
   berjalan (termasuk singgah mikroskopis di titik pertukaran, tempat
   partikel berubah warna).
4. **Segmen mekanisme:** kamera masuk interior (katup/proses kunci),
   onomatope + strip sinyal; jelaskan bunyi/ritme/gerak yang selama
   ini hanya terdengar.
5. **Finale + callback:** counter besar teranimasi untuk angka
   akumulasi narasi (mis. total ketukan per hari, dengan progress
   bar bila cocok), lalu kalimat CALLBACK yang memantulkan hook awal
   ("Semua itu cuma dalam 1 detak") + kartu seri "Seri Tubuh
   Manusia · Part N" di frame penutup. Fade ke hitam.
   (Penutup Mode C = callback + label seri; ini menggantikan beauty
   shot Mode A. CTV tetap hanya bila diminta untuk video itu.)

## Larangan khusus Mode C

- Dilarang gore / realisme medis grafis: tidak ada darah muncrat,
  luka, atau tekstur daging realistis — selalu stilasi glossy bersih.
- Dilarang foto medis, rontgen, atau gambar anatomi luar sebagai
  scene (konsisten larangan inti: semua 3D prosedural).
- Dilarang membalik kode warna aliran, atau memakai biru/merah untuk
  makna lain di video yang sama.
- Dilarang counter hidup yang tidak sinkron ketukan visualnya —
  counter yang bohong lebih buruk daripada tidak ada counter.

## QC khusus Mode C (tambahan atas 10 poin inti)

- Kode warna tidak terbalik di satu pun still; perubahan warna
  partikel di titik pertukaran terlihat jelas dan tepat kalimatnya.
- Counter detak sinkron ketukan visual organ (≤ 0,3 detik) di preview.
- Pill tahap di setiap still sesuai posisi aliran scene itu.
- Chip hanya menyala pada bagian yang sedang aktif menurut narasi.
- Judul tidak muncul sebelum hook selesai (±5 detik pertama bersih
  dari judul).
- Penutup memuat callback ke hook + label seri.
