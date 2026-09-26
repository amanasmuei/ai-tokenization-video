export type SceneProps = {
  /** Scene length in frames. */
  duration: number;
  /** Frame (scene-local) at which each narration sentence starts. */
  beats: number[];
};

/** Beat lookup that tolerates re-timed voiceovers with fewer sentences. */
export const beat = (beats: number[], i: number, offset = 0) =>
  (beats[Math.min(i, beats.length - 1)] ?? 0) + offset;
