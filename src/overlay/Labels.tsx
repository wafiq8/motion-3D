import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {SANS} from './fonts';
import {fit, env, shadow, SAFE_X, MAXW, ACCENT} from './Text';

/** Leader-line label: anchor dot at (x,y) on screen, text box offset by (dx,dy). Clamped to safe area. */
export const Leader: React.FC<{x: number; y: number; dx: number; dy: number; text: string; t: number; a: number; b: number; cap?: number}> = ({x, y, dx, dy, text, t, a, b, cap = 38}) => {
  const o = env(t, a, b, 0.35, 0.3);
  if (o <= 0) return null;
  const fs = fit(text, SANS, '800', cap, 600, '0.08em');
  const tw = measureText({text, fontFamily: SANS, fontWeight: '800', fontSize: fs, letterSpacing: '0.08em'}).width + 28;
  let lx = x + dx, ly = y + dy;
  lx = Math.min(Math.max(lx, SAFE_X + tw / 2), SAFE_X + MAXW - tw / 2);
  ly = Math.min(Math.max(ly, 300), 1560);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: o}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <line x1={x} y1={y} x2={lx} y2={ly + (dy < 0 ? fs * 0.7 : -fs * 0.2)} stroke="#FFF3DC" strokeWidth={3} strokeOpacity={0.9} />
        <circle cx={x} cy={y} r={9} fill={ACCENT} stroke="#1A140E" strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: lx, top: ly, transform: 'translate(-50%, -50%)', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: '0.08em',
        color: '#FFF8EC', textShadow: shadow, whiteSpace: 'nowrap', background: 'rgba(26,20,14,0.55)', padding: '6px 14px', borderRadius: 8}}>{text}</div>
    </div>
  );
};

/** Stacked readout lines (sans bold), each appearing at its own time, with credit sub-line */
export const ReadoutStack: React.FC<{items: {text: string; a: number; accent?: boolean; prefix?: string}[]; credit?: string; t: number; b: number; top: number; cap?: number}> = ({items, credit, t, b, top, cap = 54}) => {
  const visible = items.filter((it) => t >= it.a - 0.05);
  if (!visible.length || t > b) return null;
  const ob = env(t, items[0].a, b, 0.3, 0.35);
  const cfs = credit ? fit(credit, SANS, '700', 26, MAXW) : 0;
  return (
    <div style={{position: 'absolute', left: SAFE_X, width: MAXW, top, opacity: ob, textAlign: 'center'}}>
      {items.map((it, i) => {
        const o = env(t, it.a, b + 10, 0.3, 0.3);
        const label = (it.prefix ?? '') + it.text;
        const fs = fit(label, SANS, '800', cap, MAXW - 40, '0.04em');
        return (
          <div key={i} style={{opacity: o, transform: `translateY(${(1 - o) * 14}px)`, marginBottom: 10}}>
            <span style={{display: 'inline-block', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: '0.04em', color: it.accent ? ACCENT : '#FFF8EC',
              textShadow: shadow, whiteSpace: 'nowrap', background: 'rgba(26,20,14,0.5)', padding: '6px 18px', borderRadius: 10}}>{label}</span>
          </div>
        );
      })}
      {credit && <div style={{marginTop: 6, fontFamily: SANS, fontWeight: 700, fontSize: cfs, letterSpacing: '0.06em', color: '#FFF3DC', textShadow: shadow, whiteSpace: 'nowrap', opacity: env(t, items[0].a, b, 0.3, 0.3)}}>{credit}</div>}
    </div>
  );
};
