import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chevron, Label, Mono, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const STEPS = [
  { name: "Hardware", unit: "Servers · CAPEX", color: C.navy },
  { name: "GPUaaS", unit: "Per GPU-hour", color: C.cobalt },
  { name: "Tokens", unit: "Per 1M input / output tokens", color: C.accent },
];

const Code: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const lines: [string, string][] = [
    ["POST /v1/chat/completions", C.eyebrow],
    ['{ "model": "llama-3.1-70b-instruct",', C.text],
    ['  "messages": [ … ] }', C.text],
    ["", C.text],
    ['"usage": {', C.lead],
    ['  "prompt_tokens": 1843,', C.orangeLight],
    ['  "completion_tokens": 412 }', C.orangeLight],
    ["", C.text],
    ["bill = 1843·p_in + 412·p_out", C.orange],
  ];
  return (
    <div style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${C.line}`, padding: "24px 28px" }}>
      {lines.map(([l, col], i) => (
        <div key={i} style={{ opacity: prog(frame, at + i * 4, 8), height: 34, whiteSpace: "pre" }}>
          <Mono size={22} color={col}>
            {l}
          </Mono>
        </div>
      ))}
    </div>
  );
};

export const S10Stack: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const kpis = ["GPU-hours sold", "Tokens / s / GPU", "Tokens / watt"];
  const kpiAt = [beat(beats, 3), beat(beats, 3, 20), beat(beats, 4)];
  return (
    <AbsoluteFill>
      <SceneTitle chapter="09" eyebrow="The value stack" title="Moving up the stack" />

      {/* staircase */}
      <div style={{ position: "absolute", left: 120, top: 360, width: 1000, height: 480 }}>
        {STEPS.map((s, i) => {
          const p = prog(frame, beat(beats, 1, i * 22), 20);
          const h = 170 + i * 150;
          return (
            <div
              key={s.name}
              style={{
                position: "absolute",
                left: i * 330,
                bottom: 0,
                width: 310,
                height: h * p,
                background: `linear-gradient(180deg, ${s.color}, rgba(6,1,58,0.6))`,
                border: `1px solid ${i === 2 ? C.orange : C.line}`,
                padding: "22px 24px",
                overflow: "hidden",
              }}
            >
              <div style={{ opacity: p }}>
                <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 34, color: "#fff", textTransform: "uppercase" }}>
                  {s.name}
                </div>
                <div style={{ fontFamily: F.body, fontSize: 20, color: "#fff", opacity: 0.85, marginTop: 8 }}>{s.unit}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 1180, right: 120, top: 330 }}>
        <Reveal at={beat(beats, 2)}>
          <Label>Model-as-a-Service · OpenAI-compatible API</Label>
          <div style={{ marginTop: 14 }}>
            <Code at={beat(beats, 2, 8)} />
          </div>
        </Reveal>
        <Reveal at={beat(beats, 3)} style={{ marginTop: 36 }}>
          <Label color={C.orangeLight}>The provider KPI evolves</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16 }}>
            {kpis.map((k, i) => (
              <React.Fragment key={k}>
                {i > 0 && <Chevron size={18} style={{ opacity: prog(frame, kpiAt[i], 12) }} />}
                <div
                  style={{
                    opacity: prog(frame, kpiAt[i], 12),
                    fontFamily: F.heading,
                    fontWeight: 900,
                    fontSize: 17,
                    whiteSpace: "nowrap",
                    color: i === 2 ? C.orange : i === 0 ? C.muted : C.text,
                    textTransform: "uppercase",
                  }}
                >
                  {k}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
