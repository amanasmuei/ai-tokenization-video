// Builds English subtitles (SRT) from script/narration.json + src/data/voiceover.json.
// Caption text comes from `text` (display spelling); timing comes from the synthesised `say` sentences.
import { readFileSync, writeFileSync } from "node:fs";

const timing = JSON.parse(readFileSync("src/data/timing.json", "utf8"));
const FPS = timing.fps;
const scenes = JSON.parse(readFileSync("script/narration.json", "utf8"));
const vo = JSON.parse(readFileSync("src/data/voiceover.json", "utf8"));
const split = (t) => t.split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

let offset = 0;
let n = 1;
const out = [];
scenes.forEach((s, idx) => {
  const v = vo[s.id];
  // same maths as src/timeline.ts
  const leadFrames = timing.leadIn + (idx === 0 ? timing.intro : 0);
  const LEAD_IN = leadFrames / FPS;
  const durFrames = Math.ceil(v.duration * FPS) + leadFrames + (idx === scenes.length - 1 ? timing.outroHold : 0);
  const dur = durFrames / FPS;
  const say = v.sentences;
  const text = split(s.text);
  const speechEnd = v.duration - 0.6;
  text.forEach((line, i) => {
    let a, b;
    if (text.length === say.length) {
      a = say[i];
      b = i + 1 < say.length ? say[i + 1] - 0.05 : speechEnd;
    } else {
      // fall back to proportional timing by character count
      const total = text.join(" ").length;
      const before = text.slice(0, i).join(" ").length;
      a = (before / total) * speechEnd;
      b = ((before + line.length) / total) * speechEnd;
    }
    out.push(`${n++}\n${ts(offset + LEAD_IN + a)} --> ${ts(offset + LEAD_IN + b)}\n${line}\n`);
  });
  offset += dur;
});
writeFileSync("script/captions.srt", out.join("\n"));
console.log(`wrote ${n - 1} captions, ${offset.toFixed(1)} s`);
