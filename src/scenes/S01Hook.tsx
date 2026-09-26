import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrandStripes } from "../components/Frame";
import { ChipIcon, MemoryIcon, NetworkIcon, PowerIcon, TokenIcon } from "../components/Icons";
import { Chevron, Eyebrow, Heading, Label, MaskReveal, Mono, prog, Reveal } from "../components/ui";
import tokens from "../data/tokens.json";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const answer = tokens.o200k_base.en;
const PROMPT = "Why does sovereign AI infrastructure matter?";
const PER_TOKEN = 5; // frames between streamed tokens (scripts/mix_audio.py places ticks on the same grid)

const clampFade = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const S01Hook: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const voiceAt = beat(beats, 0);
  const streamAt = voiceAt + 14;
  const chainAt = beat(beats, 1);
  const titleAt = beat(beats, 2);

  const introOut = clampFade(frame, 40, 56);
  const streamOut = clampFade(frame, chainAt - 12, chainAt + 4);
  const chainOut = clampFade(frame, titleAt - 12, titleAt + 4);
  const typed = Math.floor(interpolate(frame, [30, voiceAt + 6], [0, PROMPT.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shown = Math.max(0, Math.min(answer.count, Math.floor((frame - streamAt) / PER_TOKEN) + 1));

  const chain = [
    { t: "Silicon", s: "GPU · Tensor Cores", I: ChipIcon },
    { t: "Memory", s: "HBM · KV cache", I: MemoryIcon },
    { t: "Network", s: "NVLink · InfiniBand", I: NetworkIcon },
    { t: "Power", s: "kW per node · cooling", I: PowerIcon },
    { t: "Token", s: "the unit of output", I: TokenIcon },
  ];

  return (
    <AbsoluteFill>
      {/* 0 — cold open */}
      {frame < 60 && (
        <AbsoluteFill style={{ opacity: introOut, justifyContent: "center", alignItems: "center" }}>
          <Reveal at={4} y={0} dur={24}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ background: "#fff", padding: "8px 12px", display: "flex" }}>
                <Img src={staticFile("brand/tm-global-logo.png")} style={{ height: 64 }} />
              </div>
              <div style={{ width: 1, height: 56, background: C.line }} />
              <Eyebrow color={C.text} style={{ fontSize: 26 }}>
                TM GPUaaS · Technical briefing
              </Eyebrow>
            </div>
          </Reveal>
        </AbsoluteFill>
      )}

      {/* 1 — a prompt, and the model answering token by token */}
      {frame >= 26 && frame < chainAt + 6 && (
        <AbsoluteFill style={{ opacity: streamOut * prog(frame, 26, 16), justifyContent: "center", paddingLeft: 160, paddingRight: 160 }}>
          <div
            style={{
              border: `1px solid ${C.line}`,
              background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
              boxShadow: "0 60px 120px -50px rgba(0,0,0,0.8)",
              padding: "34px 44px 40px",
              maxWidth: 1600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
              {[C.red, C.orange, C.success].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: 12, background: c, opacity: 0.8 }} />
              ))}
              <Mono size={17} color={C.muted} style={{ marginLeft: 16 }}>
                POST /v1/chat/completions · stream=true
              </Mono>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
              <Label color={C.muted} style={{ width: 110 }}>
                User
              </Label>
              <div style={{ fontFamily: F.body, fontSize: 36, color: C.text }}>
                {PROMPT.slice(0, typed)}
                <span style={{ color: C.orange, opacity: typed < PROMPT.length && frame % 16 < 8 ? 1 : 0 }}>▍</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 30 }}>
              <Label color={C.orange} style={{ width: 110, paddingTop: 16 }}>
                Model
              </Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: 1 }}>
                {answer.pieces.map((piece, i) => {
                  const at = streamAt + i * PER_TOKEN;
                  const p = prog(frame, at, 10);
                  const odd = i % 2 === 1;
                  return (
                    <div
                      key={i}
                      style={{
                        opacity: p,
                        transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * p})`,
                        border: `1px solid ${odd ? C.cobaltBright : C.orange}`,
                        background: odd ? "rgba(77,59,255,0.16)" : "rgba(255,122,0,0.13)",
                        boxShadow: p < 1 ? `0 0 ${24 * (1 - p)}px ${odd ? "rgba(77,59,255,0.9)" : "rgba(255,122,0,0.9)"}` : "none",
                        padding: "12px 16px 8px",
                      }}
                    >
                      <Mono size={38}>{piece.replace(/ /g, "·")}</Mono>
                      <div style={{ fontFamily: F.mono, fontSize: 14, color: C.muted, marginTop: 4 }}>{answer.ids[i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 34, borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
              <Mono size={19} color={C.eyebrow}>
                completion_tokens: <span style={{ color: C.orange }}>{frame >= streamAt ? shown : 0}</span>
              </Mono>
              <Mono size={19} color={C.muted}>
                tokenizer: o200k_base (BPE)
              </Mono>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* 2 — the physical chain behind every token */}
      {frame >= chainAt - 12 && frame < titleAt + 6 && (
        <AbsoluteFill style={{ opacity: chainOut, justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {chain.map(({ t, s, I }, i) => {
              const at = chainAt + i * 9;
              const p = prog(frame, at, 18);
              const last = i === chain.length - 1;
              return (
                <React.Fragment key={t}>
                  {i > 0 && <Chevron size={30} color={C.orange} style={{ opacity: p }} />}
                  <div
                    style={{
                      opacity: p,
                      transform: `translateY(${(1 - p) * 24}px)`,
                      width: 262,
                      height: 290,
                      padding: "30px 26px",
                      border: `1px solid ${last ? C.orange : C.line}`,
                      background: last
                        ? "linear-gradient(180deg, rgba(255,94,0,0.22), rgba(255,94,0,0.05))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                      boxShadow: last ? "0 0 60px -10px rgba(255,94,0,0.45)" : "0 40px 80px -40px rgba(0,0,0,0.8)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <I size={64} color={last ? C.orange : C.eyebrow} draw={prog(frame, at + 4, 26)} />
                    <div style={{ flex: 1 }} />
                    <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 32, color: last ? C.orange : C.text, textTransform: "uppercase" }}>
                      {t}
                    </div>
                    <div style={{ fontFamily: F.body, fontSize: 19, color: C.lead, marginTop: 10 }}>{s}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* 3 — title card */}
      {frame >= titleAt - 4 && (
        <AbsoluteFill>
          <BrandStripes progress={prog(frame, titleAt, 40)} style={{ right: -420, top: -120 }} />
          <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
            <Reveal at={titleAt + 4} x={-20} y={0}>
              <Eyebrow color={C.orangeLight}>A technical briefing · TM GPUaaS</Eyebrow>
            </Reveal>
            <MaskReveal at={titleAt + 8} style={{ marginTop: 26 }}>
              <Heading size={156}>From GPU</Heading>
            </MaskReveal>
            <MaskReveal at={titleAt + 14}>
              <Heading size={156}>
                to{" "}
                <span style={{ color: C.orange, WebkitTextFillColor: C.orange }}>token</span>
              </Heading>
            </MaskReveal>
            <Reveal at={titleAt + 24} style={{ marginTop: 34 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 60, height: 3, background: C.orange }} />
                <div style={{ fontFamily: F.body, fontSize: 32, fontWeight: 300, color: C.lead }}>
                  Hardware, GPU-as-a-Service and the unit economics of AI inference
                </div>
              </div>
            </Reveal>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
