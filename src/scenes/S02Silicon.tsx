import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Chip, CountUp, Footnote, Label, Mono, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

const COLS = 12;
const ROWS = 11; // 12 × 11 = 132 SMs (H100 SXM5)

const GpuDie: React.FC<{ smAt: number; hbmAt: number }> = ({ smAt, hbmAt }) => {
  const frame = useCurrentFrame();
  const W = 760;
  const H = 600;
  const die = { x: 190, y: 90, w: 380, h: 420 };
  const cell = { w: die.w / COLS, h: die.h / ROWS };
  const hbm = prog(frame, hbmAt, 20);
  const stacks = [0, 1, 2].flatMap((i) => [
    { x: 40, y: 100 + i * 140 },
    { x: 610, y: 100 + i * 140 },
  ]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="pkg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#141a4a" />
          <stop offset="1" stopColor="#0a0d2c" />
        </linearGradient>
      </defs>
      {/* package / interposer */}
      <rect x={10} y={40} width={W - 20} height={H - 80} fill="url(#pkg)" stroke={C.line} strokeWidth={2} />
      <text x={30} y={72} fill={C.muted} fontFamily={F.mono} fontSize={16}>
        CoWoS interposer
      </text>
      {/* HBM stacks + data lanes */}
      {stacks.map((s, i) => {
        const flow = (frame * 3 + i * 17) % 60;
        const left = s.x < die.x;
        const x1 = left ? s.x + 110 : s.x;
        const x2 = left ? die.x : die.x + die.w;
        return (
          <g key={i}>
            <rect
              x={s.x}
              y={s.y}
              width={110}
              height={110}
              fill={`rgba(255,122,0,${0.08 + hbm * 0.22})`}
              stroke={hbm > 0.1 ? C.orange : C.line}
              strokeWidth={2}
            />
            {[0, 1, 2, 3].map((l) => (
              <line key={l} x1={s.x + 10} x2={s.x + 100} y1={s.y + 24 + l * 20} y2={s.y + 24 + l * 20} stroke={C.orange} strokeOpacity={0.25 + hbm * 0.4} />
            ))}
            <text x={s.x + 55} y={s.y + 138} textAnchor="middle" fill={C.orangeLight} fontFamily={F.mono} fontSize={15}>
              HBM
            </text>
            {[0, 1, 2].map((l) => (
              <line
                key={l}
                x1={x1}
                x2={x2}
                y1={s.y + 35 + l * 20}
                y2={s.y + 35 + l * 20}
                stroke={C.orange}
                strokeWidth={2}
                strokeDasharray="8 12"
                strokeDashoffset={left ? -flow : flow}
                opacity={hbm}
              />
            ))}
          </g>
        );
      })}
      {/* compute die */}
      <rect x={die.x - 8} y={die.y - 8} width={die.w + 16} height={die.h + 16} fill="#0b0f36" stroke={C.cobaltBright} strokeWidth={2} />
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const order = (c + r) / (COLS + ROWS);
        const p = prog(frame, smAt + order * 40, 10);
        const pulse = 0.55 + 0.45 * Math.sin(frame / 7 + i * 0.7);
        return (
          <rect
            key={i}
            x={die.x + c * cell.w + 2}
            y={die.y + r * cell.h + 2}
            width={cell.w - 4}
            height={cell.h - 4}
            fill={C.cobaltBright}
            opacity={0.12 + p * 0.6 * pulse}
          />
        );
      })}
      <text x={die.x + die.w / 2} y={die.y + die.h + 44} textAnchor="middle" fill={C.eyebrow} fontFamily={F.mono} fontSize={17}>
        GH100 die · 132 SMs · 4th-gen Tensor Cores
      </text>
    </svg>
  );
};

const Stat: React.FC<{ at: number; value: number; decimals?: number; unit: string; label: string; color?: string }> = ({
  at,
  value,
  decimals,
  unit,
  label,
  color = C.text,
}) => (
  <Reveal at={at} style={{ flex: 1, borderLeft: `2px solid ${color === C.text ? C.cobaltBright : color}`, paddingLeft: 20 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <CountUp at={at} value={value} decimals={decimals} size={60} color={color} />
      <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 22, color }}>{unit}</span>
    </div>
    <div style={{ fontFamily: F.body, fontSize: 19, color: C.lead, marginTop: 6 }}>{label}</div>
  </Reveal>
);

const BW = [
  { name: "H100", gb: 80, tbs: 3.35, mem: "HBM3" },
  { name: "H200", gb: 141, tbs: 4.8, mem: "HBM3e" },
  { name: "B200", gb: 192, tbs: 8.0, mem: "HBM3e", tag: "FP4" },
];

export const S02Silicon: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const barAt = [beat(beats, 4, 20), beat(beats, 5), beat(beats, 6)];
  return (
    <AbsoluteFill>
      <SceneTitle chapter="01" eyebrow="The silicon" title="The accelerator" />
      <Reveal at={beat(beats, 0, 6)} style={{ position: "absolute", left: 90, top: 330 }}>
        <GpuDie smAt={beat(beats, 1)} hbmAt={beat(beats, 4)} />
      </Reveal>

      <div style={{ position: "absolute", left: 960, right: 120, top: 170 }}>
        <Reveal at={beat(beats, 1)}>
          <Label>Compute · NVIDIA H100 SXM</Label>
        </Reveal>
        <div style={{ display: "flex", gap: 28, marginTop: 22 }}>
          <Stat at={beat(beats, 1, 8)} value={132} unit="SMs" label="Streaming multiprocessors" />
          <Stat at={beat(beats, 2)} value={989} unit="TFLOPS" label="Dense BF16" />
          <Stat at={beat(beats, 2, 20)} value={1979} unit="TFLOPS" label="Dense FP8" />
        </div>

        <Reveal at={beat(beats, 3)} style={{ marginTop: 56 }}>
          <Label color={C.orangeLight}>Memory · the other half of the story</Label>
        </Reveal>
        <div style={{ display: "flex", gap: 28, marginTop: 22 }}>
          <Stat at={beat(beats, 4)} value={80} unit="GB" label="HBM3 capacity" color={C.orange} />
          <Stat at={beat(beats, 4, 12)} value={3.35} decimals={2} unit="TB/s" label="HBM bandwidth" color={C.orange} />
          <div style={{ flex: 1 }} />
        </div>

        <Reveal at={beat(beats, 4, 20)} style={{ marginTop: 56 }}>
          <Label>Memory bandwidth by generation</Label>
        </Reveal>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {BW.map((g, i) => {
            const p = prog(frame, barAt[i], 26);
            return (
              <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, p * 3) }}>
                <div style={{ width: 90, fontFamily: F.heading, fontWeight: 900, fontSize: 24, color: C.text }}>{g.name}</div>
                <div style={{ flex: 1, height: 36, background: "rgba(255,255,255,0.05)", position: "relative" }}>
                  <div
                    style={{
                      width: `${(g.tbs / 8) * 100 * p}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${C.cobalt}, ${i === 2 ? C.orange : C.cobaltBright})`,
                    }}
                  />
                  <div style={{ position: "absolute", left: 14, top: 5 }}>
                    <Mono size={20}>
                      {g.tbs.toFixed(2)} TB/s · {g.gb} GB {g.mem}
                    </Mono>
                  </div>
                </div>
                <div style={{ width: 70 }}>{g.tag && p > 0.5 && <Chip color={C.accent} fill>{g.tag}</Chip>}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Footnote at={beat(beats, 2)}>
        Vendor datasheet peak figures, SXM form factor, dense (no sparsity). B200 capacity shown as maximum configuration.
      </Footnote>
    </AbsoluteFill>
  );
};
