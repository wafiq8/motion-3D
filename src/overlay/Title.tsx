import React from 'react';
import {C, FONT_SANS, FONT_SERIF, W} from '../lib/style';
import {fitSize} from './fit';
import {ramp} from '../lib/time';

/** Judul TUNDA serif kapital (awal scene 2). */
export const DelayedTitle: React.FC<{t: number; t0: number; t1: number}> = ({t, t0, t1}) => {
  const k = ramp(t, t0, t0 + 0.45) * (1 - ramp(t, t1 - 0.45, t1));
  if (k <= 0.01) return null;
  const lines = ['PERJALANAN', 'NUTRISI'];
  const size = Math.min(...lines.map((l) => fitSize(l, FONT_SERIF, '900', W * 0.86, 128, 72, 0.04) ?? 72));
  const sub = 'Seri Tubuh Manusia · Part 1';
  const subSize = fitSize(sub, FONT_SANS, '700', W * 0.8, 34, 24, 0.12) ?? 24;
  return (
    <div style={{position: 'absolute', top: 380, left: 0, width: W, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 18}px)`}}>
      {lines.map((l) => (
        <div key={l} style={{fontFamily: FONT_SERIF, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: `${0.04 * size}px`, color: C.text, textShadow: '0 4px 18px rgba(0,0,0,0.85), 0 0 2px #000'}}>
          {l}
        </div>
      ))}
      <div style={{width: 120, height: 4, background: C.gold, margin: '18px auto 14px', borderRadius: 2, boxShadow: `0 0 12px ${C.gold}`}} />
      <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: subSize, letterSpacing: `${0.12 * subSize}px`, color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 8px #000'}}>{sub.toUpperCase()}</div>
    </div>
  );
};

/** Penutup Mode C: kalimat callback (teks) + kartu seri. */
export const ClosingCard: React.FC<{t: number; tCallback: number; tCard: number; tEnd: number}> = ({t, tCallback, tCard, tEnd}) => {
  const k1 = ramp(t, tCallback, tCallback + 0.5);
  const k2 = ramp(t, tCard, tCard + 0.5);
  if (k1 <= 0.01) return null;
  const l1 = 'Perjalanan dimulai di mulut —';
  const l2 = 'dan berakhir di setiap sel.';
  const size = Math.min(fitSize(l1, FONT_SERIF, '700', W * 0.88, 64, 44) ?? 44, fitSize(l2, FONT_SERIF, '700', W * 0.88, 64, 44) ?? 44);
  const series = 'SERI TUBUH MANUSIA';
  const sSize = fitSize(series, FONT_SANS, '800', W * 0.7, 44, 28, 0.14) ?? 28;
  return (
    <div style={{position: 'absolute', top: 360, left: 0, width: W, textAlign: 'center'}}>
      <div style={{opacity: k1, transform: `translateY(${(1 - k1) * 14}px)`}}>
        {[l1, l2].map((l) => (
          <div key={l} style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: size, lineHeight: 1.18, color: C.text, textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 2px #000'}}>
            {l}
          </div>
        ))}
      </div>
      <div style={{opacity: k2, marginTop: 34, display: 'inline-block', padding: '18px 40px', borderRadius: 20, background: 'rgba(16,8,32,0.85)', border: `3px solid ${C.gold}`, boxShadow: `0 0 26px rgba(242,179,61,0.45)`}}>
        <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: sSize, letterSpacing: `${0.14 * sSize}px`, color: C.text}}>{series}</div>
        <div style={{fontFamily: FONT_SERIF, fontWeight: 700, fontSize: sSize * 0.9, color: C.gold, marginTop: 4}}>Part 1 · Perjalanan Nutrisi</div>
      </div>
      <div style={{opacity: 0 * tEnd}} />
    </div>
  );
};
