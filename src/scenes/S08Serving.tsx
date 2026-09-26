import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label, prog, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

type Tech = { name: string; target: string; how: string; b: number; off?: number };

const TECH: Tech[] = [
  { name: "Continuous batching", target: "Weight-read amortisation", how: "Requests join and leave the batch every decode step", b: 1 },
  { name: "PagedAttention", target: "KV fragmentation", how: "Block-allocated KV cache, near-zero waste, sharing", b: 2 },
  { name: "FlashAttention", target: "HBM traffic", how: "IO-aware tiling keeps attention in on-chip SRAM", b: 3 },
  { name: "FP8 / FP4", target: "Bytes per weight", how: "2–4× fewer bytes than BF16 per decode step", b: 4 },
  { name: "Speculative decoding", target: "Sequential steps", how: "Draft k tokens, verify all in one forward pass", b: 5 },
  { name: "Prefix caching", target: "Redundant prefill", how: "Reuse KV of shared system prompts & documents", b: 6 },
  { name: "Disaggregated serving", target: "TTFT vs ITL trade-off", how: "Separate prefill and decode GPU pools, tuned apart", b: 6, off: 45 },
];

export const S08Serving: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const engAt = beat(beats, 7);
  return (
    <AbsoluteFill>
      <SceneTitle chapter="07" eyebrow="Serving stack" title="Where throughput is won" />
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 340,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 22,
        }}
      >
        {TECH.map((t, i) => {
          const at = beat(beats, t.b, t.off ?? 0);
          const p = prog(frame, at, 18);
          const active = Math.max(0, 1 - Math.abs(frame - at - 30) / 45);
          return (
            <div
              key={t.name}
              style={{
                opacity: 0.1 + 0.9 * p,
                transform: `translateY(${(1 - p) * 24}px)`,
                height: 290,
                padding: "26px 26px",
                border: `1px solid ${p > 0.5 ? C.cobaltBright : C.line}`,
                borderTop: `3px solid ${active > 0.05 ? C.orange : C.cobaltBright}`,
                background: `rgba(24,0,231,${0.08 + active * 0.22})`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontFamily: F.mono, fontSize: 18, color: C.orange }}>{String(i + 1).padStart(2, "0")}</div>
              <div
                style={{
                  fontFamily: F.heading,
                  fontWeight: 900,
                  fontSize: 27,
                  color: C.text,
                  textTransform: "uppercase",
                  marginTop: 12,
                  lineHeight: 1.1,
                }}
              >
                {t.name}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 20, color: C.lead, marginTop: 14, lineHeight: 1.4 }}>{t.how}</div>
              <div style={{ flex: 1 }} />
              <Label size={14} color={C.orangeLight}>
                Attacks · {t.target}
              </Label>
            </div>
          );
        })}
        {/* engines */}
        <div
          style={{
            opacity: prog(frame, engAt, 18),
            height: 290,
            padding: "26px 26px",
            background: `linear-gradient(135deg, ${C.cobalt}, ${C.navy})`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Label color="#fff">Inference engines</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["vLLM", "SGLang", "TensorRT-LLM"].map((e, i) => (
              <div
                key={e}
                style={{
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 30,
                  color: "#fff",
                  opacity: prog(frame, engAt + 8 + i * 8, 12),
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <Label size={14} color={C.orangeLight}>
            Order-of-magnitude vs naive batch-1
          </Label>
        </div>
      </div>
    </AbsoluteFill>
  );
};
