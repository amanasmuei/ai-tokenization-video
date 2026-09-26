import React from "react";
import { AbsoluteFill } from "remotion";
import { Chip, CountUp, Footnote, Label, Mono, prog, Reveal, SceneTitle, useSpring } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const GPU_HOUR = 10; // illustrative USD
const costPerM = (tps: number) => (GPU_HOUR / (tps * 3600)) * 1e6;

const Scenario: React.FC<{ at: number; tps: number; title: string; accent: string; hot?: boolean }> = ({
  at,
  tps,
  title,
  accent,
  hot,
}) => {
  const cost = costPerM(tps);
  return (
    <Reveal at={at} style={{ flex: 1 }}>
      <div
        style={{
          border: `1px solid ${hot ? accent : C.line}`,
          borderTop: `3px solid ${accent}`,
          background: hot ? "rgba(255,94,0,0.1)" : C.panel,
          padding: "26px 30px",
          height: 260,
        }}
      >
        <Label color={hot ? C.orangeLight : C.eyebrow}>{title}</Label>
        <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
          <div>
            <Mono size={18} color={C.muted}>
              GPU-hour
            </Mono>
            <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 40, color: C.text }}>${GPU_HOUR}</div>
          </div>
          <div>
            <Mono size={18} color={C.muted}>
              throughput
            </Mono>
            <div>
              <CountUp at={at + 4} value={tps} size={40} />
              <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 20, color: C.text }}> tok/s</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 14 }}>
          <CountUp at={at + 14} value={cost} decimals={2} prefix="$" size={68} color={hot ? C.orange : C.text} />
          <Mono size={22} color={C.lead}>
            per 1M tokens
          </Mono>
        </div>
      </div>
    </Reveal>
  );
};

export const S09Economics: React.FC<SceneProps> = ({ beats }) => {
  const badge = useSpring(beat(beats, 5), 12);
  return (
    <AbsoluteFill>
      <SceneTitle chapter="08" eyebrow="Token economics" title="Cost per million tokens" />

      <Reveal at={beat(beats, 0, 10)} style={{ position: "absolute", left: 120, top: 300 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Chip>Tokens / s / GPU</Chip>
          <Chip>TTFT p95</Chip>
          <Chip>Inter-token latency p95</Chip>
          <Chip color={C.orange}>Goodput = throughput within SLO</Chip>
        </div>
      </Reveal>

      <Reveal at={beat(beats, 1)} style={{ position: "absolute", left: 120, right: 120, top: 380 }}>
        <div
          style={{
            border: `1px solid ${C.line}`,
            background: "rgba(24,0,231,0.12)",
            padding: "30px 40px",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 36, color: C.text, textTransform: "uppercase" }}>
            Cost / 1M tokens
          </div>
          <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 44, color: C.orange }}>=</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Mono size={34}>GPU-hour cost</Mono>
            <div style={{ height: 3, width: "100%", background: C.text, margin: "10px 0" }} />
            <Mono size={34}>tokens/s × 3,600</Mono>
          </div>
          <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 44, color: C.orange }}>×</div>
          <Mono size={38}>10⁶</Mono>
        </div>
      </Reveal>

      <div style={{ position: "absolute", left: 120, right: 120, top: 640, display: "flex", gap: 30, alignItems: "center" }}>
        <Scenario at={beat(beats, 3)} tps={200} title="Naive · batch-1 · BF16" accent={C.cobaltBright} />
        <div
          style={{
            width: 200,
            textAlign: "center",
            transform: `scale(${badge})`,
            opacity: Math.min(1, badge * 1.5),
          }}
        >
          <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 96, color: C.orange, lineHeight: 1 }}>25×</div>
          <Label size={15} color={C.orangeLight} style={{ marginTop: 8 }}>
            Same hardware
          </Label>
        </div>
        <Scenario at={beat(beats, 4)} tps={5000} title="Optimised serving stack" accent={C.accent} hot />
      </div>
      <Footnote at={beat(beats, 3)}>Illustrative figures for explanation only — not a price list.</Footnote>
    </AbsoluteFill>
  );
};
