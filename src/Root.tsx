import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, getStaticFiles, staticFile } from 'remotion';
import { SCENES, VIDEO } from './styleLock';
import { Scene1Hook } from './scenes/Scene1Hook';
import { ScenePending } from './scenes/ScenePending';
import { Scene2Fossil } from './scenes/Scene2Fossil';
import { Scene3Rivals } from './scenes/Scene3Rivals';
import { Scene4Islands } from './scenes/Scene4Islands';
import { Scene5DNA } from './scenes/Scene5DNA';
import { Scene6Contrast } from './scenes/Scene6Contrast';
import { Scene7Legacy } from './scenes/Scene7Legacy';

const NARRATION = 'narasi-komodo.mp3';

/** Slot audio narasi: otomatis aktif bila public/narasi-komodo.mp3 tersedia. */
const NarrationSlot: React.FC = () => {
  const has = getStaticFiles().some((f) => f.name === NARRATION);
  return has ? <Audio src={staticFile(NARRATION)} /> : null;
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  S1: Scene1Hook,
  S2: Scene2Fossil,
  S3: Scene3Rivals,
  S4: Scene4Islands,
  S5: Scene5DNA,
  S6: Scene6Contrast,
  S7: Scene7Legacy,
};

/** Komposisi utama 60 detik — 7 scene, hard cut (Sequence berurutan tanpa transisi). */
export const KomodoDiorama60: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#F2D8AE' }}>
    {SCENES.map((s) => {
      const C = SCENE_COMPONENTS[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id} premountFor={0}>
          {C ? <C /> : <ScenePending id={s.id} />}
        </Sequence>
      );
    })}
    <NarrationSlot />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KomodoDiorama60"
      component={KomodoDiorama60}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={VIDEO.durationInFrames}
    />
    {/* Komposisi per-scene untuk preview/QC */}
    {SCENES.map((s) =>
      SCENE_COMPONENTS[s.id] ? (
        <Composition
          key={s.id}
          id={`Scene-${s.id}`}
          component={SCENE_COMPONENTS[s.id]}
          width={VIDEO.width}
          height={VIDEO.height}
          fps={VIDEO.fps}
          durationInFrames={s.to - s.from}
        />
      ) : null,
    )}
  </>
);
