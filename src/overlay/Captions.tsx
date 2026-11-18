import React, {useMemo} from 'react';
import {measureText} from '@remotion/layout-utils';
import {TL, Word} from '../timeline';
import {SANS} from './fonts';
import {MAXW, SAFE_X, ACCENT, shadow, H, SAFE_BOTTOM} from './Text';

const KEY = new Set(['komodo', 'singapura', 'kambing', 'bangkai', 'samping', 'kecil', 'betis', 'kirinya', 'bisa', 'racunnya', 'darah', 'membeku', 'anjlok',
  'lama', 'anwar', 'flores', 'selamat', 'beruntung', 'jarak', 'ranger', 'sekelilingmu', 'lambat', 'kelenjar', 'meninggal', 'kehabisan', '2017', '2009', 'muhamad']);
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
const CAP = 74, FLOOR = 54;
const width = (ws: Word[], fs: number) => measureText({text: ws.map((w) => w.w).join(' '), fontFamily: SANS, fontWeight: '800', fontSize: fs}).width;

type Page = {words: Word[]; a: number; b: number; fs: number};
export const buildPages = (): Page[] => {
  const pages: Page[] = [];
  TL.sentences.forEach((s0, si) => {
    // spoken numbers are shown as digits ("dua ribu tujuh belas" -> "2017"), timing spans the spoken words
    const NUM: [string, string][] = [['dua ribu tujuh belas', '2017'], ['dua ribu sembilan', '2009']];
    let words = [...s0.words];
    NUM.forEach(([spoken, digits]) => {
      const n = spoken.split(' ').length;
      for (let i = 0; i + n <= words.length; i++) {
        if (words.slice(i, i + n).map((w) => norm(w.w)).join(' ') === spoken) {
          const tail = words[i + n - 1].w.replace(/^[^.,:;]*/, '');
          words = [...words.slice(0, i), {w: digits + tail, s: words[i].s, e: words[i + n - 1].e}, ...words.slice(i + n)];
        }
      }
    });
    const s = {...s0, words};
    const groups: Word[][] = [];
    let cur: Word[] = [];
    s.words.forEach((w, i) => {
      cur.push(w);
      const punct = /[.,:;!?]$/.test(w.w);
      const next = s.words[i + 1];
      const tooWide = next && width([...cur, next], FLOOR) > MAXW;
      if (cur.length >= 4 || (punct && cur.length >= 2) || tooWide || (punct && next && /[.:]$/.test(w.w))) { groups.push(cur); cur = []; }
    });
    if (cur.length) {
      const last = groups[groups.length - 1];
      if (cur.length === 1 && last && last.length <= 3 && width([...last, ...cur], FLOOR) <= MAXW) last.push(...cur); else groups.push(cur);
    }
    const nextStart = TL.sentences[si + 1]?.start_s ?? TL.total_duration_s;
    groups.forEach((g, gi) => {
      const a = g[0].s - 0.04;
      const b = groups[gi + 1] ? groups[gi + 1][0].s - 0.04 : Math.min(s.end_s + 0.35, nextStart - 0.04);
      const fs = Math.floor(Math.min(CAP, (CAP * MAXW) / width(g, CAP)));
      if (fs < FLOOR) throw new Error('caption page too wide: ' + g.map((x) => x.w).join(' '));
      pages.push({words: g, a, b, fs});
    });
  });
  return pages;
};

export const Captions: React.FC<{t: number; hide?: boolean}> = ({t}) => {
  const pages = useMemo(buildPages, []);
  const pg = pages.find((p) => t >= p.a && t < p.b);
  if (!pg) return null;
  return (
    <div style={{position: 'absolute', left: SAFE_X, width: MAXW, top: H - SAFE_BOTTOM - 150, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: pg.fs, whiteSpace: 'nowrap', textShadow: shadow, WebkitTextStroke: '1.5px rgba(20,14,8,0.55)'}}>
        {pg.words.map((w, i) => {
          const active = t >= w.s - 0.04;
          const key = KEY.has(norm(w.w));
          const color = active ? (key ? ACCENT : '#FFFFFF') : 'rgba(255,255,255,0.55)';
          return <span key={i} style={{color, marginRight: i < pg.words.length - 1 ? '0.26em' : 0, display: 'inline-block', transform: active && t < w.e ? 'scale(1.06)' : 'scale(1)'}}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};
