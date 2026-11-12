import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, getStaticFiles, staticFile } from 'remotion';
import { SCENES, VIDEO } from './styleLock';
import { Scene1Hook, S1_DURATION } from './scenes/Scene1Hook';
import { ScenePending } from './scenes/ScenePending';

const NARRATION = 'narasi-komodo.mp3';

/** Slot audio narasi: otomatis aktif bila public/narasi-komodo.mp3 tersedia. */
const NarrationSlot: React.FC = () => {
  const has = getStaticFiles().some((f) => f.name === NARRATION);
  return has ? <Audio src={staticFile(NARRATION)} /> : null;
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  S1: Scene1Hook,
  // S2–S7: dibangun SETELAH test render S1 disetujui.
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
    <Composition
      id="KomodoS1Test"
      component={Scene1Hook}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={S1_DURATION}
    />
  </>
);
