import React from 'react';
import {C, FONT_SANS, FONT_SERIF, W} from '../lib/style';
import {fitSize} from './fit';
import {ramp, WORDS} from '../lib/time';
import {EP} from '../lib/episode';

/** Judul TUNDA serif kapital (awal scene 2). */
export const DelayedTitle: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const k = ramp(t, t0, t0 + 0.45) * (1 - ramp(t, t1 - 0.45, t1));
  if (k <= 0.01) return null;
  const lines = EP.title;
  const size = Math.min(...lines.map((l) => fitSize(l, FONT_SERIF, '900', W * 0.86, 128, 72, 0.04) ?? 72));
  const sub = `${EP.series} · Part ${EP.part}`;
  const subSize = fitSize(sub, FONT_SANS, '700', W * 0.8, 34, 24, 0.12) ?? 24;
  return (
    <div style={{position: 'absolute', top: 380, left: 0, width: W, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 18}px)`}}>
      {lines.map((l) => (
        <div key={l} style={{fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: `${0.04 * size}px`, color: C.text, textShadow: '0 4px 18px rgba(0,0,0,0.85), 0 0 2px #000'}}>
          {l}
        </div>
      ))}
      <div style={{width: 120, height: 4, background: C.accent, margin: '18px auto 14px', borderRadius: 2, boxShadow: `0 0 12px ${C.accent}`}} />
      <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: subSize, letterSpacing: `${0.12 * subSize}px`, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 8px #000'}}>{sub.toUpperCase()}</div>
    </div>
  );
};

type BigLine = {text: string; key?: string[]};
const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '');
/** Waktu muncul tiap kata teks besar = awal kata narasi padanannya (dicari berurutan di kalimat sId). */
const wordTimes = (sId: number, phrases: BigLine[][]): number[][][] => {
  const ws = WORDS.filter((w) => w.sent === sId);
  let i = 0;
  let last = 0;
  return phrases.map((ph) =>
    ph.map((ln) =>
      ln.text.split(' ').map((tok) => {
        const n = norm(tok);
        if (!n) return last; // tanda baca berdiri sendiri ikut kata sebelumnya
        while (i < ws.length && norm(ws[i].w) !== n) i++;
        if (i >= ws.length) throw new Error(`teks besar "${tok}" tidak ada di narasi`);
        last = ws[i++].s;
        return last;
      }),
    ),
  );
};

/**
 * Penutup teks besar bertahap: setiap kata muncul tepat saat diucapkan (pengganti karaoke
 * untuk kalimat penutup), lalu kartu seri.
 */
export const BigClosing: React.FC<{t: number; sId: number; phrases: BigLine[][]; tCard: number; top?: number}> = ({t, sId, phrases, tCard, top = 1000}) => {
  const times = React.useMemo(() => wordTimes(sId, phrases), [sId, phrases]);
  const first = times[0][0][0];
  if (t < first - 0.1) return null;
  const all = phrases.flat();
  const size = Math.min(...all.map((l) => fitSize(l.text, FONT_SERIF, '900', W * 0.88, 86, 52) ?? 52));
  const k2 = ramp(t, tCard, tCard + 0.5);
  const sSize = fitSize(EP.series, FONT_SANS, '800', W * 0.7, 44, 28, 0.14) ?? 28;
  const subSize = fitSize(EP.seriesSub, FONT_SERIF, '700', W * 0.74, sSize * 0.9, 24) ?? 24;
  return (
    <div style={{position: 'absolute', top, left: 0, width: W, textAlign: 'center'}}>
      {phrases.map((ph, pi) => (
        <div key={pi} style={{marginTop: pi ? 22 : 0}}>
          {ph.map((ln, li) => (
            <div key={li} style={{fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
              {ln.text.split(' ').map((tok, wi) => {
                const k = ramp(t, times[pi][li][wi] - 0.06, times[pi][li][wi] + 0.22);
                const isKey = (ln.key ?? []).includes(norm(tok));
                return (
                  <span key={wi} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 16}px)`, color: isKey ? C.accent : C.text, textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 3px #000', marginRight: wi < ln.text.split(' ').length - 1 ? size * 0.24 : 0}}>
                    {tok}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      ))}
      {k2 > 0.01 && (
        <div style={{opacity: k2, position: 'absolute', top: 1440 - top, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '16px 40px', borderRadius: 20, background: 'rgba(16,8,32,0.85)', border: `3px solid ${C.accent}`, boxShadow: '0 0 26px rgba(255,216,77,0.35)'}}>
          <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: sSize, letterSpacing: `${0.14 * sSize}px`, color: C.text}}>{EP.series}</div>
          <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: subSize, color: C.accent, marginTop: 4, whiteSpace: 'nowrap'}}>{EP.seriesSub}</div>
        </div>
      )}
    </div>
  );
};
