import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile } from "remotion";
import { Background, Chapter, Chrome } from "./components/Frame";
import { SceneFade } from "./components/ui";
import voiceover from "./data/voiceover.json";
import { S01Hook } from "./scenes/S01Hook";
import { S02Silicon } from "./scenes/S02Silicon";
import { S03Cluster } from "./scenes/S03Cluster";
import { S04Gpuaas } from "./scenes/S04Gpuaas";
import { S05Tokens } from "./scenes/S05Tokens";
import { S06Phases } from "./scenes/S06Phases";
import { S07KvCache } from "./scenes/S07KvCache";
import { S08Serving } from "./scenes/S08Serving";
import { S09Economics } from "./scenes/S09Economics";
import { S10Stack } from "./scenes/S10Stack";
import { S11Outro } from "./scenes/S11Outro";
import { SceneProps } from "./scenes/types";
import { FPS } from "./theme";
import "./fonts.css";

type VO = Record<string, { duration: number; sentences: number[] }>;

const SCENES: { id: string; label: string; C: React.FC<SceneProps> }[] = [
  { id: "hook", label: "Intro", C: S01Hook },
  { id: "silicon", label: "The silicon", C: S02Silicon },
  { id: "cluster", label: "Scale-up & scale-out", C: S03Cluster },
  { id: "gpuaas", label: "GPU-as-a-Service", C: S04Gpuaas },
  { id: "tokens", label: "Tokenization", C: S05Tokens },
  { id: "phases", label: "Prefill vs decode", C: S06Phases },
  { id: "kvcache", label: "KV cache", C: S07KvCache },
  { id: "serving", label: "Serving stack", C: S08Serving },
  { id: "economics", label: "Token economics", C: S09Economics },
  { id: "stack", label: "Value stack", C: S10Stack },
  { id: "outro", label: "Outro", C: S11Outro },
];

const LEAD_IN = 12; // frames of visual before narration starts in each scene

export const timeline = () => {
  const vo = voiceover as VO;
  let from = 0;
  return SCENES.map((s) => {
    const v = vo[s.id] ?? { duration: 6, sentences: [0] };
    const duration = Math.ceil(v.duration * FPS) + LEAD_IN;
    const beats = v.sentences.map((t) => Math.round(t * FPS) + LEAD_IN);
    const item = { ...s, from, duration, beats };
    from += duration;
    return item;
  });
};

export const totalFrames = () => timeline().reduce((a, s) => a + s.duration, 0);

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      '900 40px "HK Grotesk Wide"',
      '700 40px "HK Grotesk Wide"',
      '300 40px "Roboto"',
      '400 40px "Roboto"',
      '700 40px "Roboto"',
      '400 40px "JetBrains Mono"',
      '700 40px "JetBrains Mono"',
    ];
    Promise.all(faces.map((f) => document.fonts.load(f)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const GpuToToken: React.FC = () => {
  useFonts();
  const tl = timeline();
  const chapters: Chapter[] = tl.map(({ id, label, from, duration }) => ({ id, label, from, duration }));
  return (
    <AbsoluteFill>
      <Background />
      {tl.map(({ id, C: Scene, from, duration, beats }) => (
        <Sequence key={id} from={from} durationInFrames={duration} name={id}>
          <SceneFade duration={duration}>
            <Scene duration={duration} beats={beats} />
          </SceneFade>
          <Sequence from={LEAD_IN}>
            <Audio src={staticFile(`voiceover/${id}.wav`)} />
          </Sequence>
        </Sequence>
      ))}
      <Chrome chapters={chapters} />
    </AbsoluteFill>
  );
};
