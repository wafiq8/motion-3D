import raw from '../docs/timeline.json';

export type Word = {w: string; s: number; e: number};
export type Sentence = {id: number; text: string; start_s: number; end_s: number; scene: number; words: Word[]};
export type Scene = {id: number; sentence_ids: number[]; start_s: number; end_s: number};
export const TL = raw as unknown as {fps: number; total_duration_s: number; audio_duration_s: number; sentences: Sentence[]; scenes: Scene[]};
export const FPS = 30;

export const sent = (id: number) => TL.sentences.find((s) => s.id === id)!;
/** start time (s) of the first word in sentence `id` that begins with `prefix` (case-insensitive), nth occurrence */
export const wt = (id: number, prefix: string, nth = 0): number => {
  const ws = sent(id).words.filter((w) => w.w.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(prefix.toLowerCase()));
  if (!ws[nth]) throw new Error(`word ${prefix} not in sentence ${id}`);
  return ws[nth].s;
};
export const sceneOf = (t: number) => {
  for (let i = TL.scenes.length - 1; i >= 0; i--) if (t >= TL.scenes[i].start_s) return TL.scenes[i];
  return TL.scenes[0];
};
export const sc = (id: number) => TL.scenes.find((s) => s.id === id)!;
