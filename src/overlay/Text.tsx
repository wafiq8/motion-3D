import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {SERIF, SANS} from './fonts';
import {clamp, easeOut} from '../kit/math';

export const W = 1080, H = 1920;
export const SAFE_X = 54;            // 5% margin
export const MAXW = 972;             // 90% of frame width
export const SAFE_TOP = 260, SAFE_BOTTOM = 320;
export const ACCENT = '#FFB03A';
export const shadow = '0 2px 4px rgba(0,0,0,0.75), 0 0 18px rgba(0,0,0,0.45)';

/** fontSize = min(cap, fit(maxWidth)); also returns whether we are above the readability floor */
export const fit = (text: string, family: string, weight: string, cap: number, width = MAXW, letterSpacing?: string) => {
  const f = fitText({text, withinWidth: width, fontFamily: family, fontWeight: weight, letterSpacing}).fontSize;
  return Math.floor(Math.min(cap, f));
};

/** appear/disappear envelope in seconds */
export const env = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(easeOut((t - a) / fi), clamp((b - t) / fo));

export const SerifTitle: React.FC<{lines: {text: string; cap: number; weight?: string; ls?: string}[]; t: number; a: number; b: number; top: number}> = ({lines, t, a, b, top}) => {
  const o = env(t, a, b, 0.5, 0.5);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', top, left: SAFE_X, width: MAXW, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 18}px)`}}>
      {lines.map((l, i) => {
        const fs = fit(l.text, SERIF, l.weight ?? '800', l.cap, MAXW, l.ls);
        return <div key={i} style={{fontFamily: SERIF, fontWeight: l.weight ?? '800', fontSize: fs, letterSpacing: l.ls, color: '#FFF8EC', textShadow: shadow, lineHeight: 1.12, whiteSpace: 'nowrap'}}>{l.text}</div>;
      })}
    </div>
  );
};

/** honesty chip (ILUSTRASI / DISEDERHANAKAN / BELUM TERBUKTI) + optional credit sub-line */
export const Chip: React.FC<{label: string; credit?: string; t: number; a: number; b: number; top?: number}> = ({label, credit, t, a, b, top = SAFE_TOP + 10}) => {
  const o = env(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const cfs = credit ? fit(credit, SANS, '700', 26, MAXW) : 0;
  return (
    <div style={{position: 'absolute', top, left: SAFE_X, width: MAXW, opacity: o}}>
      <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.12em', color: '#1A140E', background: 'rgba(255,236,200,0.92)', padding: '6px 14px', borderRadius: 6, whiteSpace: 'nowrap'}}>{label}</span>
      {credit && <div style={{marginTop: 12, fontFamily: SANS, fontWeight: 700, fontSize: cfs, letterSpacing: '0.06em', color: '#FFF3DC', textShadow: shadow, whiteSpace: 'nowrap'}}>{credit}</div>}
    </div>
  );
};
