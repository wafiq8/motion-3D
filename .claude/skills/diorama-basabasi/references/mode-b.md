# Referensi Mode B — Bongkar Benda (Cara Kerja Benda/Mesin)

Detail Mode B untuk skill diorama-basabasi. Inti (SKILL.md) tetap
berlaku penuh: timeline.json, gerbang, validator, aturan teks DOM,
audio, QC. File ini hanya mengganti SISTEM VISUAL dan STRUKTUR
NARASI dari Mode A. Sumber pola: bedah dua video @motionformat —
rice cooker (31,1 detik) dan mesin jet (31,3 detik), 12 Nov 2026.
Mode B diaktifkan user 13 Nov 2026 (v2.9) dalam versi BERSIH:
grammar bongkarnya dipakai, tetapi HUD permanen referensi
(breadcrumb, counter zoom, minimap) TIDAK dipakai — sesuai putusan
riset 12 Nov 2026 (tumpukan HUD dibuang) dan arah v2.8 (tanpa
penanda layar permanen).

## Ruang lingkup

- Topik: cara kerja benda/mesin/peralatan — SATU objek per video
  (rice cooker, mesin jet, AC, pompa, kipas, dsb). Seri bebas
  (bukan seri baku seperti Mode C).
- Pertanyaan pemandu selalu: "benda ini kok bisa melakukan X?" —
  video menjawab dengan MEMBONGKAR mekanismenya, bukan dengan
  daftar fitur atau spesifikasi.
- Mode B memakai DUA tahap dunia (unik di mode ini): tahap KONTEKS
  (diorama tempat benda itu hidup) dan tahap LAB (ruang teknis
  tempat benda dibongkar).

## Panggung & model hero

- Tahap konteks: diorama hangat gaya Mode A (ruangan isometrik /
  lanskap mini) tempat objek tampil utuh di habitatnya. Palet dan
  rig cahaya mengikuti Mode A.
- Tahap lab: latar grid teknis gelap (grid halus, cahaya fokus ke
  objek) — objek menjadi satu-satunya panggung, mirip void Mode C
  tetapi bertekstur grid.
- Transisi konteks → lab: kamera zoom kontinu masuk ke objek; di
  titik terdalam zoom, latar konteks memudar atau iris melingkar
  mengembang menjadi latar lab. Tidak ada hard cut di dalam
  transisi ini.
- Bangun SATU model objek hero prosedural per video. Tampak
  ledakan (bagian terpisah mengikuti sumbu rakitan) dan belahan
  (clip plane / separuh cangkang dilepas) WAJIB diturunkan dari
  model yang sama — dilarang mengganti model antar fase.
- Bagian internal yang tak terlihat dari luar (elemen pemanas,
  magnet sensor, poros, ruang bakar) dimodelkan prosedural
  sederhana dengan stilasi bersih — bukan realisme teknis, bukan
  model unduhan.

## Kamera

- Perjalanan kamera kontinu adalah tulang punggung: konteks →
  zoom ke objek (boleh bersarang dua tingkat: bandara → pesawat →
  mesin) → lab → makro mekanisme → tarik mundur untuk payoff.
- Aturan jarak minimum 8 m di inti hanya relevan untuk framing
  tahap konteks yang menampilkan subjek hidup; objek hero di tahap
  lab MEMANG mengisi frame.
- Di fase belahan berjalan, kamera boleh mengorbit pelan atau
  tracking mengikuti aliran; jangan memotong ke sudut lain di
  tengah satu kalimat proses.

## Tipografi & overlay Mode B

- **Tanpa kartu judul:** hook adalah kalimat pertama narasi itu
  sendiri (pertanyaan/paradoks cara kerja) di atas shot konteks.
  Objek diperkenalkan lewat label leader-line saat zoom
  ("RICE COOKER — penanak nasi listrik"), bukan kartu judul.
- **Tanpa HUD permanen:** dilarang breadcrumb, counter zoom (×N),
  minimap, dan pill tahap — di semua frame. Navigasi dibaca
  penonton dari perjalanan kamera, label objek, dan judul fase.
- **Judul fase sesaat:** saat fase berganti (DIBONGKAR / DIBELAH /
  SAAT MENYALA), tampilkan SATU label fase kecil bergaya readout
  selama ±1 detik di zona aman atas, lalu hilang. Ini penanda bab,
  bukan HUD.
- **Label bagian** (fase DIBONGKAR): label DOM + leader line,
  format dwibahasa — judul Indonesia kapital + sublabel istilah
  teknis Inggris kecil ("KIPAS DEPAN — fan", "RUANG BAKAR —
  combustion chamber"). Muncul SATU-SATU mengikuti urutan narasi;
  label yang sudah muncul tetap tampil redup sampai fase selesai.
- **Label proses** (fase DIBELAH / SAAT MENYALA): format sama,
  isinya proses, bukan nama bagian ("DIMAMPATKAN KOMPRESOR",
  "SEBAGIAN BESAR LEWAT SAMPING — tidak dibakar").
- **Readout proses:** besaran yang berubah (suhu, tekanan,
  putaran) tampil sebagai readout DOM beranimasi sinkron narasi
  (mis. suhu menanjak ke 100°C, lalu 101→103°C di makro sensor),
  plus indikator status yang menyala/beralih ("MASAK" → "HANGAT").
- **Partikel aliran berkode warna semantik** untuk fase berjalan
  (mis. biru = udara dingin masuk, oranye = gas panas keluar):
  kode ditetapkan di brief produksi video itu, konsisten sepanjang
  video, dan maknanya dijelaskan label proses. Jangan memakai satu
  warna untuk dua makna berbeda di dalam video yang sama.
- Onomatope sebagai teks peristiwa di momen mekanisme ("klik!")
  diperbolehkan, satu-dua kali per video.
- **Payoff:** label prinsip satu baris kapital ("SEMBURAN =
  DORONGAN — gas ke belakang, pesawat ke depan") boleh ditemani
  SATU panah emas besar searah prinsipnya; tampil tepat saat
  kalimat penutup narasi, ketika kamera menarik mundur dari zoom
  terdalam.
- Subtitle karaoke: sama seperti inti (halaman 2–4 kata dalam pill
  gelap, kata kunci berwarna aksen, konsisten satu video).

## Struktur narasi Mode B (wajib)

1. **Hook di konteks** (±0–4 dtk): pertanyaan/paradoks cara kerja
   sebagai kalimat pertama; objek tampil utuh di habitatnya.
2. **Zoom + perkenalan:** kamera masuk ke objek; label leader-line
   nama objek tampil; kalimat undangan zoom dari narasi ("Coba
   kita zoom ke mesinnya.") menjadi penanda transisi.
3. **Masuk lab + DIBONGKAR:** latar berganti lab; objek meledak
   terkontrol mengikuti sumbu rakitan; label bagian muncul satu-
   satu mengikuti urutan narasi.
4. **DIBELAH:** objek terbelah; proses internal dianimasikan —
   aliran masuk, bagian bergerak, readout proses berjalan.
5. **SAAT MENYALA:** belahan berjalan penuh — ikuti SATU aliran
   (satu paket udara/air/arus dari masuk sampai keluar) melewati
   semua tahap proses; label proses menggantikan label bagian.
6. **Makro mekanisme:** zoom terdalam ke SATU mekanisme penentu
   yang menjawab hook (magnet sensor titik Curie, katup, girboks)
   — momen "oh, ternyata ini kuncinya".
7. **Payoff + penutup:** kamera menarik mundur sebagian; label
   prinsip satu baris + kalimat kesimpulan narasi; fade ke hitam.
   (Penutup Mode B = kesimpulan/prinsip; tanpa kartu/label seri —
   v2.8. CTV hanya bila diminta untuk video itu.)

Tidak semua benda punya fase menyala yang terpisah dari belahan —
untuk benda sederhana/pasif, fase 4–5 boleh menyatu (belahan yang
prosesnya berjalan), asal makro mekanisme dan payoff tetap ada.

## Larangan khusus Mode B

- Dilarang HUD permanen jenis apa pun (breadcrumb, counter zoom,
  minimap, pill tahap).
- Dilarang memberi label bagian untuk bagian yang tidak benar-
  benar dimodelkan dan ditunjukkan — label bohong lebih buruk
  daripada tanpa label.
- Dilarang tampak ledakan yang bagiannya saling menembus, atau
  urutan lepas yang tidak masuk akal secara rakitan.
- Dilarang mengganti model objek antar fase.
- Mekanisme yang diklaim narasi harus yang benar-benar
  divisualkan; cara kerja tidak boleh dikarang — sumber fakta
  mengikuti aturan inti (sumber user utama, tambahan wajib
  dicantumkan dan ditandai bila belum terverifikasi).

## QC khusus Mode B (tambahan atas 10 poin inti)

- Label bagian muncul satu-satu sesuai urutan narasi, dan leader
  line-nya menunjuk bagian yang benar di still.
- Tidak ada HUD permanen di still mana pun; judul fase hanya
  sesaat di batas fase.
- Tampak ledakan: tidak ada bagian yang saling menembus; belahan
  memperlihatkan interior yang diklaim narasi.
- Fase berjalan: partikel aliran konsisten kode warnanya dan arah
  alirannya benar (masuk → proses → keluar).
- Readout proses sinkron kalimatnya (≤ 0,3 detik).
- Payoff: label prinsip tampil tepat pada kalimat penutup dan
  isinya sesuai kalimat kesimpulan narasi.
