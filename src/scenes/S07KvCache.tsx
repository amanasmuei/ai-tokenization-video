import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Footnote, Label, Mono, Panel, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

/** New query attends over cached K/V of all previous tokens. */
const Attention: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const n = 9;
  return (
    <svg width={760} height={300} viewBox="0 0 760 300">
      {Array.from({ length: n }).map((_, i) => {
        const p = prog(frame, at + i * 4, 10);
        const x = 20 + i * 76;
        return (
          <g key={i} opacity={p}>
            <rect x={x} y={20} width={60} height={50} fill="rgba(77,59,255,0.35)" stroke={C.cobaltBright} />
            <text x={x + 30} y={52} textAnchor="middle" fill={C.text} fontFamily={F.mono} fontSize={18}>
              K{i}
            </text>
            <rect x={x} y={80} width={60} height={50} fill="rgba(255,122,0,0.25)" stroke={C.orange} />
            <text x={x + 30} y={112} textAnchor="middle" fill={C.text} fontFamily={F.mono} fontSize={18}>
              V{i}
            </text>
          </g>
        );
      })}
      {(() => {
        const p = prog(frame, at + n * 4 + 6, 16);
        const qx = 20 + n * 76;
        return (
          <g opacity={p}>
            <rect x={qx - 76 * 4} y={220} width={60} height={50} fill={C.accent} />
            <text x={qx - 76 * 4 + 30} y={252} textAnchor="middle" fill="#fff" fontFamily={F.mono} fontSize={18} fontWeight={700}>
              q
            </text>
            {Array.from({ length: n }).map((_, i) => (
              <line
                key={i}
                x1={qx - 76 * 4 + 30}
                y1={220}
                x2={50 + i * 76}
                y2={130}
                stroke={C.orangeLight}
                strokeOpacity={0.3 + 0.4 * Math.abs(Math.sin(frame / 8 + i))}
                strokeWidth={1.5}
              />
            ))}
            <text x={qx - 76 * 4 + 76} y={252} fill={C.lead} fontFamily={F.body} fontSize={18}>
              new query attends to every cached K, V
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

const NODE_GB = 640; // 8 × 80 GB HBM
const WEIGHTS_GB = 141; // 70.6 B params × 2 bytes
const KV_SEQ_GB = 42.9; // 327,680 B × 131,072 tokens

export const S07KvCache: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const barAt = beat(beats, 3);
  const seqs = Math.floor((NODE_GB - WEIGHTS_GB) / KV_SEQ_GB);
  return (
    <AbsoluteFill>
      <SceneTitle chapter="06" eyebrow="Memory" title="The KV cache" />

      <Reveal at={beat(beats, 0)} style={{ position: "absolute", left: 110, top: 330 }}>
        <Label>Self-attention with a key/value cache</Label>
        <div style={{ marginTop: 14 }}>
          <Attention at={beat(beats, 0, 10)} />
        </div>
      </Reveal>

      <div style={{ position: "absolute", left: 960, right: 120, top: 330, display: "flex", flexDirection: "column", gap: 24 }}>
        <Reveal at={beat(beats, 1)}>
          <Panel accent={C.cobaltBright}>
            <Label>Per token · Llama 3.1 70B · BF16 · GQA</Label>
            <div style={{ marginTop: 16, lineHeight: 1.65 }}>
              <Mono size={24} color={C.lead}>
                2 (K,V) × 80 layers × 8 KV heads
              </Mono>
              <br />
              <Mono size={24} color={C.lead}>
                × 128 head_dim × 2 bytes
              </Mono>
              <br />
              <Mono size={32}>
                = 327,680 B ≈ <span style={{ color: C.orange, fontWeight: 700 }}>320 KiB / token</span>
              </Mono>
            </div>
          </Panel>
        </Reveal>
        <Reveal at={beat(beats, 2)}>
          <Panel accent={C.orange}>
            <Label color={C.orangeLight}>Per sequence · 128K context</Label>
            <div style={{ marginTop: 14 }}>
              <Mono size={32}>
                320 KiB × 131,072 ≈ <span style={{ color: C.orange, fontWeight: 700 }}>40 GiB</span>
              </Mono>
            </div>
          </Panel>
        </Reveal>
      </div>

      {/* HBM budget of one 8-GPU node */}
      <Reveal at={barAt} style={{ position: "absolute", left: 120, right: 120, top: 790 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Label>HBM budget · 8× H100 node · 640 GB</Label>
          <Mono size={22} color={C.text}>
            ≤ <span style={{ color: C.orange, fontWeight: 700 }}>{seqs}</span> concurrent full-context sequences
          </Mono>
        </div>
        <div style={{ display: "flex", height: 64, marginTop: 14, background: "rgba(255,255,255,0.05)", gap: 3 }}>
          <div
            style={{
              width: `${(WEIGHTS_GB / NODE_GB) * 100}%`,
              background: C.cobalt,
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
            }}
          >
            <Mono size={18}>weights 141 GB</Mono>
          </div>
          {Array.from({ length: seqs }).map((_, i) => {
            const p = prog(frame, barAt + 10 + i * 5, 10);
            return (
              <div
                key={i}
                style={{
                  width: `${(KV_SEQ_GB / NODE_GB) * 100}%`,
                  background: `rgba(255,122,0,${0.35 + 0.35 * p})`,
                  opacity: p,
                  transform: `scaleY(${0.5 + 0.5 * p})`,
                }}
              />
            );
          })}
        </div>
        <div style={{ marginTop: 10 }}>
          <Mono size={16} color={C.muted}>
            KV cache (orange) competes with batch size → throughput. Before activations, runtime overhead and fragmentation.
          </Mono>
        </div>
      </Reveal>
      <Footnote at={beat(beats, 1)}>Llama 3.1 70B: 80 layers, 64 query heads, 8 KV heads, head_dim 128, 128K context.</Footnote>
    </AbsoluteFill>
  );
};
