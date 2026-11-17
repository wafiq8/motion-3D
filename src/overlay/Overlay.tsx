// Semua teks wajib-baca = overlay DOM, diukur dengan @remotion/layout-utils setelah font termuat.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {fitText, measureText} from '@remotion/layout-utils';
import captions from '../data/captions.json';
import {projector} from '../lib/camera';
import {elevM, v3, yOf} from '../lib/geo';
import {clamp, easeOut, fmtID, win} from '../lib/anim';
import {exagAt, flowQ, SEC} from '../lib/story';
import {CUT_LON} from '../three/Stage';

export const SERIF = 'Playfair Display';
export const SANS = 'Inter';
const W = 1080, MAXW = W * 0.9, SAFE_TOP = 250, SAFE_BOT = 1920 - 310, MX = 54;
const ACC = '#FFB03A', NUMC = '#8FE3FF', CREAM = '#FFE7C2';
const SHADOW = '0 2px 4px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.55)';
const GORDON = 'MENURUT GORDON DKK. 2010 · PROGRAM INSTANT';
const KAMI = 'HITUNGAN KAMI · DATA INSTANT';

// ukuran font aman: min(batas, fit) — bila di bawah lantai, pemanggil memecah baris
const fitSize = (text: string, family: string, weight: string, cap: number, within = MAXW, ls = 0) => {
  const f = fitText({text, withinWidth: within, fontFamily: family, fontWeight: weight, letterSpacing: ls ? `${ls}em` : undefined});
  return Math.min(cap, Math.floor(f.fontSize));
};

// ---------------- subtitle karaoke ----------------
type Wd = {w: string; s: number; e: number; k: string};
type Page = {s: number; e: number; words: Wd[]};
const PAGES: (Page & {end: number})[] = (() => {
  const all: (Page & {end: number})[] = [];
  (captions as {id: number; pages: Page[]}[]).forEach((c) => c.pages.forEach((p) => all.push({...p, end: 0})));
  all.forEach((p, i) => { const n = all[i + 1]; p.end = n ? Math.min(n.s, p.e + 0.9) : SEC.end; });
  return all;
})();
const Subtitles: React.FC<{t: number}> = ({t}) => {
  const p = PAGES.find((x) => t >= x.s - 0.04 && t < x.end);
  if (!p) return null;
  const text = p.words.map((w) => w.w).join(' ');
  const size = fitSize(text, SANS, '800', 64);
  const lines = size < 46 ? [p.words.slice(0, Math.ceil(p.words.length / 2)), p.words.slice(Math.ceil(p.words.length / 2))] : [p.words];
  const fs = size < 46 ? fitSize(lines.map((l) => l.map((w) => w.w).join(' ')).sort((a, b) => b.length - a.length)[0], SANS, '800', 64) : size;
  const pop = easeOut((t - p.s + 0.04) / 0.18);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 1920 - SAFE_BOT + 24, textAlign: 'center',
      transform: `translateY(${(1 - pop) * 14}px)`, opacity: pop}}>
      {lines.map((l, li) => (
        <div key={li} style={{fontFamily: SANS, fontWeight: 800, fontSize: fs, lineHeight: 1.18, color: '#fff', textShadow: SHADOW, whiteSpace: 'pre'}}>
          {l.map((w, i) => {
            const active = t >= w.s && t < w.e + 0.05;
            const said = t >= w.s;
            const col = w.k === 'key' ? ACC : w.k === 'num' ? NUMC : '#fff';
            return <React.Fragment key={i}>{i > 0 ? ' ' : ''}<span style={{display: 'inline-block', color: said ? col : '#fff',
              opacity: said ? 1 : 0.55, transform: `translateY(${active ? -4 : 0}px)`, borderBottom: active ? `5px solid ${ACC}` : '5px solid transparent',
              WebkitTextStroke: '1.5px rgba(0,0,0,.35)'}}>{w.w}</span></React.Fragment>;
          })}
        </div>))}
    </div>
  );
};

// ---------------- readout berkredit ----------------
type Row = {t: number; value: number; dec?: number; prefix?: string; unit: string; label?: string};
type RO = {a: number; b: number; y: number; title: string; rows: Row[]; credit: string; anchor?: [number, number]; side?: 'L' | 'R'};
const READOUTS: RO[] = [
  {a: 0.76, b: 5.9, y: 640, title: 'AIR PASIFIK KE HINDIA', rows: [{t: 0.76, value: 15, unit: 'JUTA m³/DETIK'}], credit: GORDON},
  {a: SEC.s3, b: 24.2, y: 1040, title: 'DEBIT RATA-RATA 2004–2006', rows: [{t: SEC.s3, value: 15, unit: 'JUTA m³/DETIK'},
    {t: SEC.pools, value: 6000, unit: 'KOLAM RENANG OLIMPIADE', label: 'SETIAP DETIK'}], credit: `${GORDON}\n6.000 KOLAM: ${KAMI} (±2.500 m³/KOLAM)`},
  {a: 25.66, b: 32.5, y: 330, title: 'PROGRAM INSTANT', rows: [{t: 25.66, value: 3, unit: 'TAHUN (2004–2006)'},
    {t: SEC.mooring, value: 11, unit: 'STASIUN PENGUKUR ARUS'}], credit: GORDON},
  {a: SEC.q116, b: 47.15, y: 330, title: 'SELAT MAKASSAR', rows: [{t: SEC.q116, value: 11.6, dec: 1, unit: 'JUTA m³/DETIK'},
    {t: SEC.frac, value: 77, prefix: '±', unit: '% SELURUH ARUS MASUK', label: 'LEBIH DARI 3/4'}], credit: `${GORDON}\n77%: ${KAMI} (11,6 ÷ 15)`, anchor: [118.4, -2.6]},
  {a: SEC.lombokW, b: 67.1, y: 330, title: 'PINTU 1 · SELAT LOMBOK', rows: [{t: SEC.lombokW, value: 20, unit: 'KM LEBAR TERSEMPIT'},
    {t: SEC.sill + 0.7, value: 350, unit: 'M AMBANG DANGKAL'}, {t: SEC.q26, value: 2.6, dec: 1, unit: 'JUTA m³/DETIK'}], credit: GORDON, anchor: [115.72, -8.62]},
  {a: SEC.q49, b: 72.9, y: 330, title: 'PINTU 2 · SELAT OMBAI', rows: [{t: SEC.q49, value: 4.9, dec: 1, unit: 'JUTA m³/DETIK'}], credit: GORDON, anchor: [125.05, -8.45]},
  {a: SEC.timorW, b: 76.6, y: 330, title: 'PINTU 3 · CELAH TIMOR', rows: [{t: SEC.timorW, value: 160, unit: 'KM LEBAR'},
    {t: SEC.q75, value: 7.5, dec: 1, unit: 'JUTA m³/DETIK'}], credit: GORDON, anchor: [124.4, -10.9]},
];
const Readout: React.FC<{t: number; r: RO; proj: ReturnType<typeof projector>}> = ({t, r, proj}) => {
  const a = win(t, r.a, r.b, 0.3, 0.3);
  if (a <= 0) return null;
  const x0 = MX + 6;
  const rows = r.rows.filter((row) => t >= row.t - 0.05);
  let anchorEl: React.ReactNode = null;
  if (r.anchor) {
    const p = proj(v3(r.anchor[0], r.anchor[1], 0.08));
    if (p.ok && p.y > SAFE_TOP && p.y < SAFE_BOT && p.x > 20 && p.x < W - 20) {
      const ly = r.y + 70 + rows.length * 108 + 40;
      anchorEl = <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
        <line x1={x0 + 30} y1={ly} x2={p.x} y2={p.y} stroke="#fff" strokeWidth={2.5} strokeOpacity={0.85} />
        <circle cx={p.x} cy={p.y} r={9} fill={ACC} stroke="#fff" strokeWidth={3} />
      </svg>;
    }
  }
  const credits = r.credit.split('\n');
  return (
    <>
      {anchorEl}
      <div style={{position: 'absolute', left: x0, top: r.y, maxWidth: MAXW - 12, opacity: a, transform: `translateX(${(1 - a) * -24}px)`,
        background: 'rgba(6,16,28,.66)', borderLeft: `5px solid ${ACC}`, borderRadius: 14, padding: '16px 26px 16px 24px'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: '0.12em', color: CREAM}}>{r.title}</div>
        {rows.map((row, i) => {
          const k = easeOut((t - row.t) / 0.9);
          const v = row.value * k;
          const num = (row.prefix ?? '') + fmtID(v, row.dec ?? 0);
          const numFs = Math.min(92, fitSize(num + ' ' + row.unit, SANS, '800', 92, MAXW - 80) * 1.6);
          return <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4, whiteSpace: 'nowrap'}}>
            <span style={{fontFamily: SANS, fontWeight: 800, fontSize: numFs, color: '#fff', textShadow: SHADOW, fontVariantNumeric: 'tabular-nums'}}>{num}</span>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1.1}}>
              {row.unit}{row.label ? <><br /><span style={{color: ACC, fontSize: 24}}>{row.label}</span></> : null}</span>
          </div>;
        })}
        {credits.map((c, i) => <div key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 21, color: '#cfe3f2', opacity: 0.9,
          marginTop: i === 0 ? 10 : 2, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>{c}</div>)}
      </div>
    </>
  );
};

// perbandingan jatah tiga pintu (kal. 13 "jatah terbesar")
const ShareBars: React.FC<{t: number}> = ({t}) => {
  const a = win(t, SEC.share, SEC.s8 + 0.2, 0.35, 0.35);
  if (a <= 0) return null;
  const data = [['LOMBOK', 2.6, '20 KM'], ['OMBAI', 4.9, ''], ['TIMOR', 7.5, '160 KM']] as const;
  return <div style={{position: 'absolute', left: MX + 6, top: 330, width: MAXW - 12, opacity: a, background: 'rgba(6,16,28,.66)',
    borderLeft: `5px solid ${ACC}`, borderRadius: 14, padding: '16px 26px'}}>
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: '0.12em', color: CREAM}}>JATAH TIAP PINTU KELUAR</div>
    {data.map(([n, q, w], i) => {
      const k = easeOut((t - SEC.share - i * 0.15) / 0.7);
      return <div key={n} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
        <div style={{width: 150, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff'}}>{n}</div>
        <div style={{height: 34, width: (q / 7.5) * 520 * k, background: i === 2 ? ACC : '#ff6a4a', borderRadius: 6}} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#fff', whiteSpace: 'nowrap'}}>{fmtID(q * k, 1)} jt <span style={{fontSize: 22, color: CREAM}}>{w}</span></div>
      </div>;
    })}
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 21, color: '#cfe3f2', marginTop: 12, letterSpacing: '0.04em'}}>{GORDON}</div>
  </div>;
};

// counter parameter S8: debit "bernapas" + legenda layer
const Breath: React.FC<{t: number}> = ({t}) => {
  const a = win(t, SEC.napas + 0.4, SEC.s9 - 0.1, 0.35, 0.4);
  if (a <= 0) return null;
  const q = flowQ(t);
  const pos = clamp((q - 8) / 13);
  return <div style={{position: 'absolute', left: MX + 6, top: 330, width: MAXW - 12, opacity: a, background: 'rgba(6,16,28,.66)',
    borderLeft: `5px solid ${ACC}`, borderRadius: 14, padding: '16px 26px'}}>
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: '0.12em', color: CREAM}}>DEBIT ARLINDO · BERAYUN</div>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 92, color: '#fff', fontVariantNumeric: 'tabular-nums', textShadow: SHADOW}}>{fmtID(q, 1)}</span>
      <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff'}}>JUTA m³/DETIK</span>
    </div>
    <div style={{position: 'relative', height: 26, marginTop: 6, borderRadius: 13, background: 'linear-gradient(90deg,#3a6a8a,#ff5a3c)'}}>
      <div style={{position: 'absolute', left: `${pos * 100}%`, top: -7, width: 8, height: 40, marginLeft: -4, background: '#fff', borderRadius: 4, boxShadow: '0 0 8px #000'}} />
    </div>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 6}}>
      <span>8</span><span>LEGENDA: TEBAL &amp; TERANG GARIS = DEBIT</span><span>21</span></div>
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, color: ACC, marginTop: 8}}>TERCATAT 10–19 JUTA m³/DETIK (2004–2006)</div>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 21, color: '#cfe3f2', marginTop: 6, letterSpacing: '0.04em'}}>{GORDON}</div>
  </div>;
};

// ---------------- label geografis ----------------
type GL = {txt: string; lon: number; lat: number; a: number; b: number; wall?: boolean; big?: boolean};
const LABELS: GL[] = [
  {txt: 'SAMUDRA PASIFIK', lon: 130.6, lat: 7.6, a: 0.3, b: 11.2, big: true},
  {txt: 'SAMUDRA HINDIA', lon: 113.5, lat: -12.0, a: 4.9, b: 11.2, big: true},
  {txt: 'SAMUDRA PASIFIK', lon: 130.0, lat: 7.3, a: 15.0, b: 18.7, big: true},
  {txt: 'ARUS MINDANAO', lon: 127.6, lat: 6.0, a: SEC.mindanao, b: 38.4},
  {txt: 'LAUT SULAWESI', lon: 122.6, lat: 3.6, a: SEC.sulawesi, b: 40.0},
  {txt: 'SELAT MAKASSAR', lon: 118.3, lat: -1.4, a: SEC.makassar, b: 42.5},
  {txt: 'KALIMANTAN', lon: 116.2, lat: -0.6, a: 39.74, b: 44.5},
  {txt: 'SULAWESI', lon: 120.6, lat: -2.6, a: 40.38, b: 44.5},
  {txt: 'CELAH LIFAMATOLA', lon: CUT_LON, lat: -1.9, a: SEC.lifamatola, b: 54.6, wall: true},
  {txt: 'LAUT BANDA', lon: CUT_LON, lat: -5.4, a: SEC.banda, b: 54.6, wall: true},
  {txt: 'LAUT BANDA', lon: 126.4, lat: -5.4, a: SEC.s6, b: 58.2},
  {txt: 'LOMBOK', lon: 115.9, lat: -8.65, a: SEC.gate1, b: 59.0},
  {txt: 'OMBAI', lon: 125.05, lat: -8.45, a: SEC.gate2, b: 59.0},
  {txt: 'TIMOR', lon: 124.0, lat: -11.0, a: SEC.gate3, b: 59.0},
  {txt: 'BALI', lon: 115.15, lat: -8.4, a: 59.6, b: 67.0},
  {txt: 'LOMBOK', lon: 116.3, lat: -8.65, a: 59.6, b: 67.0},
  {txt: 'ALOR', lon: 124.6, lat: -8.25, a: 68.4, b: 71.0},
  {txt: 'TIMOR', lon: 125.3, lat: -8.95, a: 68.4, b: 71.0},
  {txt: 'SAMUDRA HINDIA', lon: 120.4, lat: -13.2, a: 76.2, b: 79.3, big: true},
  {txt: 'LOMBOK', lon: 115.9, lat: -8.65, a: SEC.q1, b: SEC.end},
  {txt: 'TIMOR', lon: 124.0, lat: -11.0, a: SEC.q2, b: SEC.end},
];
const GeoLabels: React.FC<{t: number; proj: ReturnType<typeof projector>}> = ({t, proj}) => <>
  {LABELS.map((l, i) => {
    const a = win(t, l.a, l.b, 0.3, 0.3);
    if (a <= 0) return null;
    const y = l.wall ? Math.min(yOf(elevM(l.lon, l.lat)), -0.05) * exagAt(t) + 0.12 : 0.08;
    const p = proj(v3(l.wall ? l.lon + 0.06 : l.lon, l.lat, y));
    const fs = l.big ? 30 : 27;
    const w = measureText({text: l.txt, fontFamily: SANS, fontWeight: '800', fontSize: fs, letterSpacing: '0.1em'}).width + 36;
    const x = clamp(p.x - w / 2, MX, W - MX - w);
    if (!p.ok || p.y < SAFE_TOP + 40 || p.y > SAFE_BOT - 60) return null;
    return <div key={i} style={{position: 'absolute', left: x, top: p.y - 64, width: w, textAlign: 'center', opacity: a}}>
      <div style={{display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: '0.1em', color: '#fff',
        textShadow: SHADOW, padding: '2px 10px', whiteSpace: 'nowrap'}}>{l.txt}</div>
      <svg width={w} height={30} style={{display: 'block'}}><line x1={w / 2} y1={0} x2={p.x - x} y2={26} stroke="#fff" strokeWidth={2} />
        <circle cx={p.x - x} cy={26} r={5} fill={ACC} /></svg>
    </div>;
  })}
</>;

// ---------------- chip kejujuran (sementara, ikut klaimnya) ----------------
const CHIPS: {txt: string; a: number; b: number}[] = [
  {txt: 'JALUR DISEDERHANAKAN', a: 0.4, b: SEC.end},
  {txt: 'ILUSTRASI · PAKET AIR', a: SEC.s2b, b: 79.4},
  {txt: 'ILUSTRASI · 6.000 KOLAM', a: SEC.pools, b: 24.2},
  {txt: 'POSISI MOORING DISEDERHANAKAN', a: SEC.mooring, b: 32.5},
  {txt: 'ILUSTRASI · POTONGAN BATIMETRI', a: SEC.s5 + 0.2, b: SEC.s6},
  {txt: 'KEDALAMAN DIPERBESAR', a: SEC.s5 + 0.2, b: SEC.s6},
  {txt: 'ILUSTRASI · KEMARAU EL NIÑO', a: SEC.elnino, b: SEC.s9 + 0.5},
];
const Chips: React.FC<{t: number}> = ({t}) => {
  const on = CHIPS.map((c) => ({...c, k: win(t, c.a, c.b, 0.25, 0.25)})).filter((c) => c.k > 0);
  return <div style={{position: 'absolute', right: MX, bottom: 1920 - SAFE_BOT + 150, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: 8}}>
    {on.map((c) => <div key={c.txt} style={{opacity: c.k, fontFamily: SANS, fontWeight: 700, fontSize: 21, letterSpacing: '0.1em',
      color: '#fff', background: 'rgba(0,0,0,.5)', border: '1.5px solid rgba(255,255,255,.55)', borderRadius: 8, padding: '5px 12px'}}>{c.txt}</div>)}
  </div>;
};

// ---------------- teks besar serif ----------------
const BigText: React.FC<{t: number}> = ({t}) => {
  const items: React.ReactNode[] = [];
  const title = win(t, -1, 5.7, 0.2, 0.5);
  if (title > 0) {
    const l1 = 'ARUS LINTAS', l2 = 'INDONESIA';
    const fs = fitSize(l2, SERIF, '800', 118, MAXW, 0.02);
    items.push(<div key="t" style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: title,
      transform: `translateY(${(1 - title) * 10}px)`}}>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: fs * 0.72, color: '#fff', textShadow: SHADOW, letterSpacing: '0.02em', lineHeight: 1}}>{l1}</div>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: fs, color: '#fff', textShadow: SHADOW, letterSpacing: '0.02em', lineHeight: 1.05}}>{l2}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: ACC, letterSpacing: '0.4em', marginTop: 8, textShadow: SHADOW}}>ARLINDO</div>
    </div>);
  }
  const ben = win(t, SEC.s2, SEC.s2b + 0.2, 0.25, 0.4);
  if (ben > 0) {
    const fs = fitSize('BENARKAH?', SERIF, '800', 150);
    items.push(<div key="b" style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', opacity: ben,
      transform: `scale(${0.92 + 0.08 * easeOut((t - SEC.s2) / 0.4)})`}}>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: fs, color: ACC, textShadow: SHADOW}}>BENARKAH?</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff', textShadow: SHADOW, letterSpacing: '0.06em'}}>SATU-SATUNYA PINTU TROPIS</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff', textShadow: SHADOW, letterSpacing: '0.06em'}}>ANTARA DUA SAMUDRA</div>
    </div>);
  }
  const ver = win(t, SEC.verdict, SEC.napas + 0.3, 0.25, 0.4);
  if (ver > 0) {
    const fs = fitSize('TERBUKTI', SERIF, '800', 140);
    items.push(<div key="v" style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', opacity: ver}}>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: fs, color: '#fff', textShadow: SHADOW}}>TERBUKTI</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: ACC, textShadow: SHADOW, letterSpacing: '0.06em'}}>PINTU TROPIS ANTARA DUA SAMUDRA</div>
    </div>);
  }
  // pertanyaan penutup: tampil saat opsi diucapkan, ditahan selama jeda payoff
  const q = win(t, SEC.q1, SEC.end + 1, 0.4, 0.1);
  if (q > 0) {
    const L = ['LOMBOK', 'yang sempit & dangkal,', 'atau TIMOR', 'yang lebar & dalam?'];
    const k2 = easeOut((t - SEC.q2) / 0.4);
    items.push(<div key="q" style={{position: 'absolute', top: 330, left: MX, right: MX, textAlign: 'center', opacity: q}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: CREAM, letterSpacing: '0.14em', textShadow: SHADOW}}>MANA YANG PALING MENENTUKAN?</div>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 92, color: ACC, textShadow: SHADOW, lineHeight: 1.05, marginTop: 10}}>{L[0]}</div>
      <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 50, color: '#fff', textShadow: SHADOW}}>{L[1]}</div>
      <div style={{opacity: k2}}>
        <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 92, color: ACC, textShadow: SHADOW, lineHeight: 1.05, marginTop: 8}}>{L[2]}</div>
        <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 50, color: '#fff', textShadow: SHADOW}}>{L[3]}</div>
      </div>
    </div>);
  }
  return <>{items}</>;
};

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const proj = projector(t);
  const fade = clamp((t - (SEC.end - 0.55)) / 0.5);
  return (
    <AbsoluteFill>
      <GeoLabels t={t} proj={proj} />
      {READOUTS.map((r, i) => <Readout key={i} t={t} r={r} proj={proj} />)}
      <ShareBars t={t} />
      <Breath t={t} />
      <BigText t={t} />
      <Chips t={t} />
      <Subtitles t={t} />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
