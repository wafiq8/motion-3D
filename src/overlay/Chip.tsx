import React from 'react';
import {C, FONT_SANS, SAFE, W, H} from '../lib/style';
import {fitSize} from './fit';
import {clamp} from '../lib/time';

/**
 * Chip label anatomi: menempel ke titik organ (anchor terproyeksi) lewat garis penunjuk.
 * active 0..1 = menyala warna aliran; appear 0..1 = muncul.
 * side: posisi kotak relatif anchor. Kotak dijepit ke zona aman.
 */
export const Chip: React.FC<{
  anchor: {x: number; y: number};
  box: {x: number; y: number}; // titik tengah kotak (px)
  text: string;
  sub?: string;
  subs?: {text: string; k: number}[];
  color?: string;
  active: number;
  appear: number;
  maxW?: number;
  subPrefix?: string;
}> = ({anchor, box, text, sub, subs = [], color = C.gold, active, appear, maxW = W * 0.62, subPrefix = '✓ '}) => {
  if (appear <= 0.01) return null;
  const size = fitSize(text, FONT_SANS, '800', maxW - 56, 44, 30) ?? 30;
  const subSize = sub ? fitSize(sub, FONT_SANS, '500', maxW - 56, 30, 22) ?? 22 : 0;
  const a = clamp(active);
  const glowA = 0.35 + 0.65 * a;
  // jepit pusat kotak agar tetap di zona aman (perkiraan lebar dari ukuran font)
  const estW = Math.min(maxW, Math.max(text.length * size * 0.6, sub ? sub.length * subSize * 0.55 : 0) + 56);
  const bx = clamp(box.x, SAFE.left + estW / 2, SAFE.right - estW / 2);
  const by = clamp(box.y, SAFE.top + 200, SAFE.bottom - 260);
  const ax = clamp(anchor.x, 0, W);
  const ay = clamp(anchor.y, 0, H);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: appear}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeOpacity={glowA} strokeWidth={4} />
        <circle cx={ax} cy={ay} r={12} fill={color} fillOpacity={glowA} stroke="#10081F" strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: bx,
          top: by,
          transform: 'translate(-50%,-50%)',
          maxWidth: maxW,
          padding: '14px 28px',
          borderRadius: 22,
          background: 'rgba(16,8,32,0.86)',
          border: `3px solid ${color}`,
          borderColor: a > 0.5 ? color : 'rgba(255,255,255,0.28)',
          boxShadow: a > 0.05 ? `0 0 ${34 * a}px ${color}` : 'none',
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, color: a > 0.5 ? C.text : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{text}</div>
        {subs.map((sb) => {
          const ss = fitSize(sb.text, FONT_SANS, '700', maxW - 56, 30, 22) ?? 22;
          return sb.k > 0.01 ? <div key={sb.text} style={{fontFamily: FONT_SANS, fontWeight: 700, fontSize: ss, color: C.text, opacity: sb.k, marginTop: 6, whiteSpace: 'nowrap'}}>{subPrefix + sb.text}</div> : null;
        })}
        {sub && <div style={{fontFamily: FONT_SANS, fontWeight: 500, fontSize: subSize, color: 'rgba(255,255,255,0.85)', marginTop: 6, whiteSpace: 'nowrap'}}>{sub}</div>}
      </div>
    </div>
  );
};
