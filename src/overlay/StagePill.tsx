import React from 'react';
import {C, FONT_SANS, W} from '../lib/style';
import {fitSize} from './fit';
import {clamp} from '../lib/time';

export const POS = ['MULUT', 'KERONGKONGAN', 'LAMBUNG', 'USUS DUA BELAS JARI', 'VILI USUS', 'DUA JALUR', 'HATI', 'SELURUH TUBUH'];

/** Satu-satunya HUD: pill tahap satu baris + penanda progres "pos n/8". */
export const StagePill: React.FC<{n: number; t: number; t0: number}> = ({n, t, t0}) => {
  const name = POS[n - 1];
  const label = `${name}   pos ${n}/8`;
  const size = fitSize(label, FONT_SANS, '800', W * 0.9 - 140, 38, 26, 0.06) ?? 26;
  const k = clamp((t - t0) / 0.3);
  return (
    <div style={{position: 'absolute', top: 268, left: 0, width: W, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '16px 30px', borderRadius: 999, background: C.pillBg, border: '2px solid rgba(255,216,77,0.35)', boxShadow: '0 6px 24px rgba(0,0,0,0.45)', opacity: 0.4 + 0.6 * k}}>
        <div style={{width: 22, height: 22, borderRadius: 11, background: C.gold, boxShadow: `0 0 16px ${C.gold}`}} />
        <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, letterSpacing: `${0.06 * size}px`, color: C.text, whiteSpace: 'nowrap'}}>{name}</div>
        <div style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: size * 0.72, color: 'rgba(255,255,255,0.62)', whiteSpace: 'nowrap'}}>pos {n}/8</div>
        <div style={{display: 'flex', gap: 5}}>
          {Array.from({length: 8}, (_, i) => (
            <div key={i} style={{width: 9, height: 9, borderRadius: 5, background: i < n ? C.gold : 'rgba(255,255,255,0.22)'}} />
          ))}
        </div>
      </div>
    </div>
  );
};
