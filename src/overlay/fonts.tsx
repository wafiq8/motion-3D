import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {FONT_SANS, FONT_SERIF} from '../lib/style';

const all = () =>
  Promise.all([
    loadFont({family: FONT_SERIF, url: staticFile('fonts/playfair-display-latin-700-normal.woff2'), weight: '700'}),
    loadFont({family: FONT_SERIF, url: staticFile('fonts/playfair-display-latin-900-normal.woff2'), weight: '900'}),
    loadFont({family: FONT_SANS, url: staticFile('fonts/inter-latin-500-normal.woff2'), weight: '500'}),
    loadFont({family: FONT_SANS, url: staticFile('fonts/inter-latin-700-normal.woff2'), weight: '700'}),
    loadFont({family: FONT_SANS, url: staticFile('fonts/inter-latin-800-normal.woff2'), weight: '800'}),
  ]).then(() => document.fonts.ready);

/** Overlay teks baru dirender SETELAH font termuat, agar ukur fitText akurat. */
export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    all().then(() => {
      setOk(true);
      continueRender(h);
    });
  }, [h]);
  return ok ? <>{children}</> : null;
};
