import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chevron, Chip, Footnote, Label, Mono, prog, Reveal, SceneTitle } from "../components/ui";
import tokens from "../data/tokens.json";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const PALETTE = ["#4D3BFF", "#FF7A00", "#16A3A0", "#C04BFF", "#FFB020", "#3D8BFF"];

const TokenRow: React.FC<{ pieces: string[]; ids?: number[]; at: number; size?: number; stagger?: number }> = ({
  pieces,
  ids,
  at,
  size = 34,
  stagger = 3,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {pieces.map((piece, i) => {
        const p = prog(frame, at + i * stagger, 10);
        const col = PALETTE[i % PALETTE.length];
        return (
          <div
            key={i}
            style={{
              opacity: p,
              transform: `scale(${0.85 + 0.15 * p})`,
              background: `${col}2A`,
              borderBottom: `3px solid ${col}`,
              padding: "8px 10px 6px",
            }}
          >
            <Mono size={size}>{piece.replace(/ /g, "·")}</Mono>
            {ids && (
              <div style={{ fontFamily: F.mono, fontSize: 14, color: C.muted, marginTop: 4, textAlign: "center" }}>{ids[i]}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Embedding: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 90 }}>
      {Array.from({ length: 64 }).map((_, i) => {
        const v = Math.sin(i * 12.9898) * 43758.5453;
        const h = (v - Math.floor(v)) * 2 - 1;
        const p = prog(frame, at + i * 0.6, 10);
        return (
          <div
            key={i}
            style={{
              width: 9,
              height: Math.abs(h) * 42 * p + 2,
              background: h > 0 ? C.cobaltBright : C.orange,
              alignSelf: h > 0 ? "flex-end" : "flex-start",
              marginTop: h > 0 ? 0 : 45,
              marginBottom: h > 0 ? 45 : 0,
            }}
          />
        );
      })}
    </div>
  );
};

const en = tokens.o200k_base.en;
const msO = tokens.o200k_base.ms;
const msC = tokens.cl100k_base.ms;
const pct = (a: number) => Math.round((a / en.count - 1) * 100);

export const S05Tokens: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const cmpAt = beat(beats, 5);
  const aOut = interpolate(frame, [cmpAt - 10, cmpAt + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const typed = Math.floor(interpolate(frame, [beat(beats, 0, 4), beat(beats, 1, 10)], [0, en.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const rows = [
    { lang: "English", enc: "o200k_base", d: en, delta: null as number | null },
    { lang: "Bahasa Melayu", enc: "o200k_base", d: msO, delta: pct(msO.count) },
    { lang: "Bahasa Melayu", enc: "cl100k_base", d: msC, delta: pct(msC.count) },
  ];

  return (
    <AbsoluteFill>
      <SceneTitle chapter="04" eyebrow="Tokenization" title="The model's native unit" />

      {/* A — text → tokens → IDs → embeddings */}
      <AbsoluteFill style={{ opacity: aOut }}>
        <div style={{ position: "absolute", left: 120, right: 120, top: 340 }}>
          <Reveal at={beat(beats, 0)}>
            <Label>Input text</Label>
            <div style={{ fontFamily: F.body, fontSize: 38, color: C.text, marginTop: 12, height: 50 }}>
              {en.text.slice(0, typed)}
              <span style={{ opacity: frame % 20 < 10 && typed < en.text.length ? 1 : 0, color: C.orange }}>▍</span>
            </div>
          </Reveal>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
            <Reveal at={beat(beats, 2)}>
              <Label>Byte-pair encoding → token IDs</Label>
            </Reveal>
            <Reveal at={beat(beats, 3)} x={-10} y={0}>
              <div style={{ display: "flex", gap: 10 }}>
                <Chip>cl100k_base · ~100K vocab</Chip>
                <Chip color={C.orange}>o200k_base · ~200K vocab</Chip>
              </div>
            </Reveal>
          </div>
          <div style={{ marginTop: 16 }}>
            <TokenRow pieces={en.pieces} ids={en.ids} at={beat(beats, 2, 8)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: 44 }}>
            <Reveal at={beat(beats, 4)}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Mono size={30} color={C.orange}>
                  id {en.ids[4]}
                </Mono>
                <Chevron size={26} />
                <Mono size={24} color={C.lead}>
                  E[{en.ids[4]}] ∈ ℝ<sup>4096</sup>
                </Mono>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 18, color: C.muted, marginTop: 8 }}>
                embedding lookup · d_model = 4,096 (Llama 3.1 8B)
              </div>
            </Reveal>
            <Embedding at={beat(beats, 4, 10)} />
          </div>
        </div>
      </AbsoluteFill>

      {/* B — tokenization is not language-neutral */}
      {frame >= cmpAt - 4 && (
        <div style={{ position: "absolute", left: 120, right: 120, top: 340 }}>
          <Reveal at={cmpAt}>
            <Label color={C.orangeLight}>Same meaning · different token bill</Label>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 26 }}>
            {rows.map((r, i) => {
              const at = i === 0 ? cmpAt + 6 : beat(beats, 6, (i - 1) * 50);
              const p = prog(frame, at, 24);
              return (
                <div key={i} style={{ opacity: Math.min(1, p * 2) }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginBottom: 10 }}>
                    <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 24, color: C.text, textTransform: "uppercase" }}>
                      {r.lang}
                    </span>
                    <Mono size={18} color={C.muted}>
                      {r.enc}
                    </Mono>
                    <span style={{ flex: 1 }} />
                    <Mono size={30} color={C.text}>
                      {Math.round(r.d.count * p)} tokens
                    </Mono>
                    {r.delta !== null && (
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontWeight: 900,
                          fontSize: 30,
                          color: C.orange,
                          width: 130,
                          textAlign: "right",
                          opacity: p,
                        }}
                      >
                        +{r.delta}%
                      </span>
                    )}
                    {r.delta === null && <span style={{ width: 130 }} />}
                  </div>
                  <TokenRow pieces={r.d.pieces} at={at} size={24} stagger={2} />
                </div>
              );
            })}
          </div>
          <Reveal at={beat(beats, 7)} style={{ marginTop: 34 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {["More prefill FLOPs", "More KV cache", "Higher latency", "Higher cost per request"].map((t) => (
                <Chip key={t} color={C.accent} fill>
                  {t}
                </Chip>
              ))}
            </div>
          </Reveal>
        </div>
      )}
      <Footnote at={beat(beats, 2)}>Token splits computed with OpenAI tiktoken (cl100k_base, o200k_base). “·” marks a leading space.</Footnote>
    </AbsoluteFill>
  );
};
