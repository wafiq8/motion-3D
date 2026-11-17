// Jadwal ketukan (detik) — semuanya diambil dari docs/timeline.json (awal kalimat / awal kata).
import timeline from '../../docs/timeline.json';
const S = (id: number) => timeline.sentences.find((s) => s.id === id)!.start_s;
const Sc = (id: number) => timeline.scenes.find((s) => s.id === id)!.start_s;
export const SEC = {
  s1: Sc(1), s2: Sc(2), s2b: S(4), s3: Sc(3), s4: Sc(4), s5: Sc(5), s6: Sc(6), s7: Sc(7), s8: Sc(8), s9: Sc(9),
  end: timeline.total_duration_s,
  pools: 21.60,      // kata "enam ribu"
  instant: 26.76,    // "program internasional INSTANT"
  mooring: 28.86,    // "sebelas stasiun"
  mindanao: 34.20, sulawesi: 36.44, makassar: 38.54,
  q116: 42.70,       // "sebelas koma enam juta"
  frac: 44.96,       // "lebih dari tiga perempat"
  lifamatola: 50.94, banda: 53.82,
  gate1: 57.20, gate2: 57.48, gate3: 57.78, // "tiga pintu keluar"
  lombok: 59.08, lombokW: 60.72, sill: 62.04, q26: 64.48,
  ombai: 68.26, q49: 69.86,
  timor: 72.10, timorW: 73.62, q75: 75.58, share: 76.76,
  verdict: 79.36, napas: 82.84, q10: 85.28, q19: 86.16, elnino: 89.30,
  q1: 98.24, q2: 99.82,
};
const sm = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
// Debit "bernapas" (juta m3/dtk): counter parameter yang menggerakkan dunia (S8)
export const flowQ = (t: number): number => {
  if (t < SEC.napas) return 15;
  if (t < SEC.q10) return 15 - 5 * sm((t - SEC.napas) / (SEC.q10 - SEC.napas));            // turun ke 10
  if (t < SEC.q19 + 0.5) return 10 + 9 * sm((t - SEC.q10) / (SEC.q19 + 0.5 - SEC.q10));      // naik ke 19
  if (t < SEC.elnino) return 19 - 4 * sm((t - SEC.q19 - 0.5) / (SEC.elnino - SEC.q19 - 0.5)) + 1.2 * Math.sin((t - SEC.q19) * 3.4) * (1 - sm((t - SEC.q19) / 2.6));
  if (t < SEC.s9) return 15 - 4.5 * sm((t - SEC.elnino) / 1.6);                                 // El Niño melemahkan
  return 10.5 + 4.5 * sm((t - SEC.s9) / 3);
};

// S5: potongan batimetri terbuka (0..1) dan eksagerasi vertikal — dipakai panggung & overlay
const ramp = (t: number, a: number, d: number) => sm((t - a) / d);
export const cutOpenAt = (t: number) => Math.min(ramp(t, SEC.s5, 1.0), 1 - ramp(t, SEC.s6 - 0.9, 0.8));
export const exagAt = (t: number) => 1 + 3.0 * cutOpenAt(t);
