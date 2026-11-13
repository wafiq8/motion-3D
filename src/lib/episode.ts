// Konfigurasi per-episode (satu-satunya file isi yang berganti antar video seri).
import {C} from './style';
export const EP = {
  comp: 'LeakyGut',
  slug: 'leaky-gut',
  part: 2,
  title: ['LEAKY GUT —', 'USUS BOCOR'],
  series: 'SERI TUBUH MANUSIA',
  seriesSub: 'Part 2 · Leaky Gut — Usus Bocor',
  // pill tahap: nama pos + titik warna semantik (status aliran saat itu)
  pos: [
    {name: 'USUS', dot: C.endotoxinGlow},
    {name: 'DINDING USUS', dot: C.endotoxinGlow},
    {name: 'ALIRAN DARAH', dot: C.inflame},
    {name: 'PEMBULUH DARAH', dot: C.inflame},
    {name: 'ORGAN VITAL', dot: C.inflame},
    {name: 'PEMULIHAN', dot: C.bloodRed},
  ],
  // kata kunci karaoke (warna aksen)
  key: ['usus', 'racun', 'bakteri', 'jahat', 'bocor', 'leaky', 'gut', 'endotoksin', 'darah', 'peradangan', 'kolesterol', 'plak', 'penyumbat', 'jantung', 'hati', 'otak', 'rusak', 'penyakit', 'merenggang', 'iritasi'],
  // kalimat yang captionnya dibawakan teks besar penutup (bukan karaoke)
  bigTextSentences: [6],
};
