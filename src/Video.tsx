import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background, BrandWipe, Chapter, Chrome, Grain } from "./components/Frame";
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
import { buildTimeline, SceneId, TIMING } from "./timeline";
import "./fonts.css";

const SCENES: Record<SceneId, { label: string; C: React.FC<SceneProps> }> = {
  hook: { label: "Intro", C: S01Hook },
  silicon: { label: "The silicon", C: S02Silicon },
  cluster: { label: "Scale-up & scale-out", C: S03Cluster },
  gpuaas: { label: "GPU-as-a-Service", C: S04Gpuaas },
  tokens: { label: "Tokenization", C: S05Tokens },
  phases: { label: "Prefill vs decode", C: S06Phases },
  kvcache: { label: "KV cache", C: S07KvCache },
  serving: { label: "Serving stack", C: S08Serving },
  economics: { label: "Token economics", C: S09Economics },
  stack: { label: "Value stack", C: S10Stack },
  outro: { label: "Outro", C: S11Outro },
};

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      '900 40px "HK Grotesk Wide"',
      '700 40px "HK Grotesk Wide"',
      '300 40px "Roboto"',
      '400 40px "Roboto"',
      '500 40px "Roboto"',
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

/** Slow cinematic push-in across each scene. */
const PushIn: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, duration], [1, 1.025]);
  return <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

export const GpuToToken: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const tl = buildTimeline();
  const chapters: Chapter[] = tl.map(({ id, from, duration, lead }) => ({ id, label: SCENES[id].label, from, duration, lead }));
  const half = Math.round(TIMING.wipe / 2);
  const total = tl[tl.length - 1].from + tl[tl.length - 1].duration;
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [total - 24, total], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        <Background />
        {tl.map(({ id, from, duration, beats }) => {
          const Scene = SCENES[id].C;
          return (
            <Sequence key={id} from={from} durationInFrames={duration} name={id}>
              <PushIn duration={duration}>
                <Scene duration={duration} beats={beats} />
              </PushIn>
            </Sequence>
          );
        })}
        <Chrome chapters={chapters} />
        {tl.slice(1).map(({ id, from }) => (
          <Sequence key={`wipe-${id}`} from={from - half} durationInFrames={TIMING.wipe} name={`wipe-${id}`}>
            <BrandWipe duration={TIMING.wipe} />
          </Sequence>
        ))}
        <Grain />
      </AbsoluteFill>
      <Audio src={staticFile("audio/soundtrack.m4a")} />
    </AbsoluteFill>
  );
};
