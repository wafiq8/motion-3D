import React from 'react';
import {C, FONT_SANS, W} from '../lib/style';
import {WORDS, Word, SENTENCES} from '../lib/time';
import {fitSize} from './fit';

const KEY = new Set(['amilase', 'karbohidrat', 'peristaltik', 'kerongkongan', 'pepsin', 'kimus', 'protein', 'empedu', 'pankreas', 'glukosa', 'amino', 'lemak', 'vili', 'penyerapan', 'kapiler', 'limfa', 'hati', 'racun', 'cadangan', 'jantung', 'otak', 'otot', 'sel', 'mulut', 'lambung', 'nutrisi']);
const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '');

type Page = {words: Word[]; s: number; e: number};
// Halaman 2–4 kata; pecah setelah tanda baca bila sudah >= 2 kata.
const buildPages = (): Page[] => {
  const pages: Page[] = [];
  for (const sent of SENTENCES) {
    const ws = WORDS.filter((w) => w.sent === sent.id);
    let cur: Word[] = [];
    const groups: Word[][] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const punct = /[,.:;—]$/.test(w.w);
      const left = ws.length - i - 1;
      if ((cur.length >= 4 || (punct && cur.length >= 2)) && left !== 1) {
        groups.push(cur);
        cur = [];
      }
    });
    if (cur.length) groups.push(cur);
    // aturan 2–4 kata: gabung halaman 1 kata, pecah halaman > 4 kata
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length === 1 && groups.length > 1) {
        const j = i > 0 ? i - 1 : i + 1;
        if (j < i) groups[j].push(...groups[i]);
        else groups[j].unshift(...groups[i]);
        groups.splice(i, 1);
        i = -1;
        continue;
      }
      const chars = groups[i].map((x) => x.w).join(' ').length;
      if (groups[i].length > 4 || (groups[i].length >= 4 && chars > 32)) {
        const g = groups[i];
        const k = Math.ceil(g.length / 2);
        groups.splice(i, 1, g.slice(0, k), g.slice(k));
        i = -1;
      }
    }
    groups.forEach((g, i) => {
      const next = groups[i + 1];
      pages.push({words: g, s: g[0].s, e: next ? next[0].s : sent.end_s + 0.25});
    });
  }
  return pages;
};
export const PAGES = buildPages();
if (PAGES.some((p) => p.words.length < 2 || p.words.length > 4)) throw new Error('halaman karaoke di luar 2–4 kata');

export const Karaoke: React.FC<{t: number}> = ({t}) => {
  const p = PAGES.find((pg) => t >= pg.s - 0.05 && t < pg.e);
  if (!p) return null;
  const text = p.words.map((w) => w.w).join(' ');
  const fit = fitSize(text, FONT_SANS, '800', W * 0.9 - 64, 64, 44);
  const size = fit ?? 52; // tidak muat di lantai: pecah jadi dua baris
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '16px 32px', borderRadius: 26, background: 'rgba(12,6,26,0.80)', maxWidth: W * 0.9, whiteSpace: fit ? 'nowrap' : 'normal', textAlign: 'center', lineHeight: 1.2, boxShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
        {p.words.map((w, i) => {
          const active = t >= w.s - 0.03;
          const isKey = KEY.has(norm(w.w));
          return (
            <span key={i} style={{fontFamily: FONT_SANS, fontWeight: 800, fontSize: size, color: isKey ? C.accent : C.text, opacity: active ? 1 : 0.42, textShadow: '0 2px 8px rgba(0,0,0,0.85)', marginRight: i < p.words.length - 1 ? size * 0.26 : 0}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
