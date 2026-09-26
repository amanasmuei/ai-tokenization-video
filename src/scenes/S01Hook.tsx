import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chevron, Eyebrow, Heading, Label, Mono, prog, Reveal } from "../components/ui";
import tokens from "../data/tokens.json";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const answer = tokens.o200k_base.en;

export const S01Hook: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const chainAt = beat(beats, 1);
  const titleAt = beat(beats, 2);
  const streamOut = interpolate(frame, [chainAt - 10, chainAt + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chainOut = interpolate(frame, [titleAt - 10, titleAt + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const perToken = 5;

  return (
    <AbsoluteFill>
      {/* 1 — tokens streaming out of a model */}
      <AbsoluteFill style={{ opacity: streamOut, justifyContent: "center", paddingLeft: 160, paddingRight: 160 }}>
        <Reveal at={2}>
          <Label>Model output · streamed token by token</Label>
        </Reveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34, maxWidth: 1500 }}>
          {answer.pieces.map((piece, i) => {
            const at = 14 + i * perToken;
            const p = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                  border: `1px solid ${i % 2 ? C.cobaltBright : C.orange}`,
                  background: i % 2 ? "rgba(77,59,255,0.14)" : "rgba(255,122,0,0.12)",
                  padding: "14px 18px 10px",
                }}
              >
                <Mono size={42}>{piece.replace(/ /g, "·")}</Mono>
                <div style={{ fontFamily: F.mono, fontSize: 15, color: C.muted, marginTop: 6 }}>id {answer.ids[i]}</div>
              </div>
            );
          })}
        </div>
        <Reveal at={14 + answer.pieces.length * perToken + 6} style={{ marginTop: 36 }}>
          <Mono size={22} color={C.eyebrow}>
            {answer.count} tokens · o200k_base BPE vocabulary
          </Mono>
        </Reveal>
      </AbsoluteFill>

      {/* 2 — the physical chain behind each token */}
      {frame >= chainAt - 12 && (
        <AbsoluteFill style={{ opacity: chainOut, justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {[
              ["Silicon", "GPU · Tensor Cores"],
              ["Memory", "HBM · KV cache"],
              ["Network", "NVLink · InfiniBand"],
              ["Power", "kW per node · cooling"],
              ["Token", "the unit of output"],
            ].map(([t, s], i) => {
              const p = prog(frame, chainAt + i * 9, 16);
              const last = i === 4;
              return (
                <React.Fragment key={t}>
                  {i > 0 && <Chevron size={30} color={C.orange} style={{ opacity: p }} />}
                  <div
                    style={{
                      opacity: p,
                      transform: `translateY(${(1 - p) * 20}px)`,
                      width: 250,
                      padding: "30px 24px",
                      border: `1px solid ${last ? C.orange : C.line}`,
                      background: last ? "rgba(255,94,0,0.14)" : C.panel,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontWeight: 900,
                        fontSize: 34,
                        color: last ? C.orange : C.text,
                        textTransform: "uppercase",
                      }}
                    >
                      {t}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: 20, color: C.lead, marginTop: 10 }}>{s}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* 3 — title card */}
      {frame >= titleAt - 4 && (
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
          <Reveal at={titleAt}>
            <Eyebrow color={C.orangeLight}>A technical briefing · TM GPUaaS</Eyebrow>
          </Reveal>
          <Reveal at={titleAt + 6} style={{ marginTop: 26 }}>
            <Heading size={150}>
              From GPU
              <br />
              to <span style={{ color: C.orange }}>token</span>
            </Heading>
          </Reveal>
          <Reveal at={titleAt + 16} style={{ marginTop: 34 }}>
            <div style={{ fontFamily: F.body, fontSize: 34, fontWeight: 300, color: C.lead }}>
              Hardware, GPU-as-a-Service and the unit economics of AI inference
            </div>
          </Reveal>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
