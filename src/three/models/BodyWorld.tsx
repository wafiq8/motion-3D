import React from 'react';
import {C} from '../../lib/style';
import {V3} from '../../lib/time';
import {Body, ARTERIES, IVC, HEART_POS, BRAIN_POS} from './Body';
import {Gut} from './Gut';
import {Liver} from './Liver';
import {Brain} from './Brain';
import {Damage} from './Damage';
import {InflameFlow} from './Toxin';

// Peta tubuh utuh (siluet) dengan organ hero seri: usus, hati, jantung, otak.
export const GUT_POS: V3 = [0, 0.5, 0.34];
export const GUT_S = 0.3;
export const LIVER_POS: V3 = [-0.45, 1.5, 0.5];
export const LIVER_S = 0.19;
export const BRAIN_S = 0.46;
export {HEART_POS, BRAIN_POS};
export const toBody = (p: V3): V3 => [GUT_POS[0] + p[0] * GUT_S, GUT_POS[1] + p[1] * GUT_S, GUT_POS[2] + p[2] * GUT_S];
export const ORGANS = {
  heart: {c: HEART_POS, r: [0.34, 0.4, 0.3] as V3},
  liver: {c: [LIVER_POS[0], LIVER_POS[1], LIVER_POS[2] + 0.08] as V3, r: [0.4, 0.2, 0.17] as V3},
  brain: {c: [BRAIN_POS[0], BRAIN_POS[1] + 0.02, BRAIN_POS[2] + 0.05] as V3, r: [0.36, 0.27, 0.36] as V3},
};

export const BodyWorld: React.FC<{
  t: number;
  beat: number;
  inflame: number;
  dmg: {heart: number; liver: number; brain: number};
  health?: number;
  gut: {residue: number; bact: number; tox: number; rinse?: number; slits?: number; heal?: number};
  artBright?: number;
  bodyOpacity?: number;
}> = ({t, beat, inflame, dmg, health = 0, gut, artBright = 0, bodyOpacity = 0.85}) => {
  // darah suram: merah tua redup; pulih: merah terang (kode warna tetap merah)
  const artColor = artBright > 0.5 ? C.bloodRed : '#C2343C';
  return (
    <group>
      <Body t={t} beat={beat} net={0} brain={0} muscle={0} cells={0} bodyOpacity={bodyOpacity} hideBrain artColor={artColor} artEmissive={0.12 + 0.6 * artBright} />
      <group position={GUT_POS} scale={GUT_S}>
        <Gut t={t} healthy={health} {...gut} />
      </group>
      <group position={LIVER_POS} scale={LIVER_S} rotation={[0.1, 0.25, -0.12]}>
        <Liver opacity={1} glowFilter={0} glowStore={0} vessels={false} />
      </group>
      <group position={BRAIN_POS} scale={BRAIN_S}>
        <Brain glow={health} />
      </group>
      <InflameFlow curves={[...ARTERIES, IVC]} t={t} amount={inflame} count={70} size={0.045} speed={0.18} seed={3} zOff={0.06} />
      <Damage center={ORGANS.heart.c} radii={ORGANS.heart.r} t={t} amount={dmg.heart} health={health} seed={1} />
      <Damage center={ORGANS.liver.c} radii={ORGANS.liver.r} t={t} amount={dmg.liver} health={health} seed={2} />
      <Damage center={ORGANS.brain.c} radii={ORGANS.brain.r} t={t} amount={dmg.brain} health={health} seed={3} />
    </group>
  );
};
