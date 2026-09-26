import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Chip, Label, Mono, Panel, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

/** Timeline: one wide parallel prefill block, then a train of sequential decode steps. */
const Timeline: React.FC<{ prefillAt: number; decodeAt: number }> = ({ prefillAt, decodeAt }) => {
  const frame = useCurrentFrame();
  const pf = prog(frame, prefillAt, 24);
  const steps = 22;
  return (
    <div style={{ position: "relative", height: 250 }}>
      {/* prefill: many tokens processed in parallel */}
      <div style={{ position: "absolute", left: 0, top: 30, width: 380 * pf, height: 150, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: 4, width: 380, height: 150 }}>
          {Array.from({ length: 16 * 6 }).map((_, i) => (
            <div key={i} style={{ background: C.cobaltBright, opacity: 0.35 + 0.4 * Math.abs(Math.sin(frame / 5 + i)) }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 196, opacity: pf }}>
        <Label>Prefill · parallel</Label>
      </div>
      {/* TTFT marker */}
      <div style={{ position: "absolute", left: 392, top: 0, height: 200, borderLeft: `2px dashed ${C.orange}`, opacity: pf }} />
      <div style={{ position: "absolute", left: 404, top: 0, opacity: pf }}>
        <Mono size={18} color={C.orange}>
          TTFT
        </Mono>
      </div>
      {/* decode: one token per forward pass */}
      {Array.from({ length: steps }).map((_, i) => {
        const p = prog(frame, decodeAt + i * 5, 6);
        return (
          <div key={i} style={{ position: "absolute", left: 420 + i * 48, top: 30, opacity: p }}>
            <div style={{ width: 38, height: 150, border: `1px solid ${C.orange}`, background: "rgba(255,122,0,0.08)", position: "relative" }}>
              <div style={{ position: "absolute", left: 8, top: 8, width: 20, height: 20, background: C.orange }} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 420, top: 196, opacity: prog(frame, decodeAt, 12) }}>
        <Label color={C.orangeLight}>Decode · one token per step · every step re-reads all weights</Label>
      </div>
    </div>
  );
};

/** Position (0–100%) of an arithmetic intensity on a 0.1 → 1000 FLOP/byte log axis. */
const logPos = (x: number) => ((Math.log10(x) + 1) / 4) * 100;

export const S06Phases: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const util = prog(frame, beat(beats, 6), 30);
  return (
    <AbsoluteFill>
      <SceneTitle chapter="05" eyebrow="Inference mechanics" title="Prefill vs decode" />

      <div style={{ position: "absolute", left: 120, right: 120, top: 340 }}>
        <Timeline prefillAt={beat(beats, 1)} decodeAt={beat(beats, 3)} />
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <Reveal at={beat(beats, 2)} y={10}>
            <Chip color={C.cobaltBright} fill>
              Compute-bound
            </Chip>
          </Reveal>
          <Reveal at={beat(beats, 4)} y={10} style={{ marginLeft: 195 }}>
            <Chip color={C.accent} fill>
              Memory-bandwidth-bound
            </Chip>
          </Reveal>
        </div>
      </div>

      <div style={{ position: "absolute", left: 120, right: 120, top: 700, display: "flex", gap: 28 }}>
        <Reveal at={beat(beats, 5)} style={{ flex: 1.35 }}>
          <Panel accent={C.orange} style={{ height: 250 }}>
            <Label color={C.orangeLight}>Roofline for a single stream · Llama 3.1 8B · BF16 · H100</Label>
            <div style={{ marginTop: 22, lineHeight: 1.7 }}>
              <Mono size={30}>t/token ≥ weight bytes ÷ HBM bandwidth</Mono>
              <br />
              <Mono size={30} color={C.lead}>
                = 16 GB ÷ 3.35 TB/s ≈ <span style={{ color: C.orange }}>4.8 ms</span>
              </Mono>
              <br />
              <Mono size={30}>
                ⇒ ceiling ≈ <span style={{ color: C.orange, fontWeight: 700 }}>~200 tokens/s</span>
              </Mono>
            </div>
          </Panel>
        </Reveal>
        <Reveal at={beat(beats, 6)} style={{ flex: 1 }}>
          <Panel accent={C.cobaltBright} style={{ height: 250 }}>
            <Label>Arithmetic intensity</Label>
            <div style={{ marginTop: 18, fontFamily: F.body, fontSize: 21, color: C.lead }}>
              Batch-1 decode ≈ 1 FLOP/byte · H100 ridge ≈ 295 FLOP/byte
            </div>
            <div style={{ marginTop: 22, height: 26, background: "rgba(255,255,255,0.06)", position: "relative" }}>
              <div style={{ width: `${logPos(1) * util}%`, height: "100%", background: C.orange }} />
              <div style={{ position: "absolute", left: `${logPos(295)}%`, top: -6, height: 38, borderLeft: `2px solid ${C.eyebrow}` }} />
              <div style={{ position: "absolute", left: `${logPos(295)}%`, top: 36, transform: "translateX(-50%)" }}>
                <Mono size={14} color={C.muted}>ridge</Mono>
              </div>
              <div style={{ position: "absolute", left: 0, top: 36 }}>
                <Mono size={14} color={C.muted}>log scale</Mono>
              </div>
            </div>
            <div style={{ marginTop: 34 }}>
              <Mono size={20} color={C.text}>
                Tensor Cores {"<"} 1% busy — the GPU waits on memory
              </Mono>
            </div>
          </Panel>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
