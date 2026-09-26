import timing from "./data/timing.json";
import voiceover from "./data/voiceover.json";

// Mirrors scripts/timeline.py — keep the two in sync.
export const ORDER = ["hook", "silicon", "cluster", "gpuaas", "tokens", "phases", "kvcache", "serving", "economics", "stack", "outro"] as const;
export type SceneId = (typeof ORDER)[number];
export type SceneTiming = { id: SceneId; from: number; duration: number; lead: number; beats: number[] };

type VO = Record<string, { duration: number; sentences: number[] }>;

export const TIMING = timing;

export const buildTimeline = (): SceneTiming[] => {
  const vo = voiceover as VO;
  let from = 0;
  return ORDER.map((id, i) => {
    const v = vo[id] ?? { duration: 6, sentences: [0] };
    const lead = timing.leadIn + (i === 0 ? timing.intro : 0);
    const duration =
      Math.ceil(v.duration * timing.fps) + lead + (i === ORDER.length - 1 ? timing.outroHold : 0);
    const beats = v.sentences.map((t) => Math.round(t * timing.fps) + lead);
    const item = { id, from, duration, lead, beats };
    from += duration;
    return item;
  });
};

export const totalFrames = () => buildTimeline().reduce((a, s) => a + s.duration, 0);
