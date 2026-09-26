import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CountUp, Label, Mono, Panel, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

/** Scale-up: 8 GPUs fully connected through 4 NVSwitch chips. */
const HgxNode: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const gpus = Array.from({ length: 8 }).map((_, i) => ({ x: 20 + (i % 4) * 150, y: i < 4 ? 20 : 330 }));
  const sw = Array.from({ length: 4 }).map((_, i) => ({ x: 50 + i * 150, y: 190 }));
  const links = prog(frame, at + 10, 30);
  return (
    <svg width={640} height={440} viewBox="0 0 640 440">
      {gpus.flatMap((g, gi) =>
        sw.map((s, si) => (
          <line
            key={`${gi}-${si}`}
            x1={g.x + 60}
            y1={g.y + (gi < 4 ? 90 : 0)}
            x2={s.x + 45}
            y2={s.y + (gi < 4 ? 0 : 60)}
            stroke={C.cobaltBright}
            strokeWidth={1.6}
            strokeOpacity={0.15 + 0.55 * links * (0.6 + 0.4 * Math.sin(frame / 6 + gi + si))}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - links}
          />
        )),
      )}
      {gpus.map((g, i) => {
        const p = prog(frame, at + i * 2, 12);
        return (
          <g key={i} opacity={p}>
            <rect x={g.x} y={g.y} width={120} height={90} fill="rgba(77,59,255,0.18)" stroke={C.cobaltBright} strokeWidth={2} />
            <text x={g.x + 60} y={g.y + 52} textAnchor="middle" fill={C.text} fontFamily={F.heading} fontWeight={900} fontSize={22}>
              GPU {i}
            </text>
          </g>
        );
      })}
      {sw.map((s, i) => (
        <g key={i} opacity={links}>
          <rect x={s.x} y={s.y} width={90} height={60} fill="rgba(255,122,0,0.16)" stroke={C.orange} strokeWidth={2} />
          <text x={s.x + 45} y={s.y + 36} textAnchor="middle" fill={C.orangeLight} fontFamily={F.mono} fontSize={14}>
            NVSwitch
          </text>
        </g>
      ))}
    </svg>
  );
};

/** Scale-out: rail-optimised leaf/spine fabric, one NIC per GPU. */
const Fabric: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const nodes = 4;
  const rails = 8;
  const railColor = (r: number) => `hsl(${245 - r * 22}, 90%, ${62 + (r % 2) * 6}%)`;
  const leafY = 190;
  const spineY = 30;
  const nodeY = 330;
  const leaves = Array.from({ length: rails }).map((_, r) => 40 + r * 110);
  const spines = [150, 370, 590, 810];
  const p1 = prog(frame, at, 24);
  const p2 = prog(frame, at + 18, 24);
  return (
    <svg width={960} height={440} viewBox="0 0 960 440">
      {spines.flatMap((sx, si) =>
        leaves.map((lx, li) => (
          <line key={`${si}-${li}`} x1={sx + 40} y1={spineY + 44} x2={lx + 36} y2={leafY} stroke={C.line} strokeWidth={1.4} opacity={p2} />
        )),
      )}
      {Array.from({ length: nodes }).flatMap((_, n) =>
        Array.from({ length: rails }).map((__, r) => {
          const nx = 30 + n * 235 + r * 24;
          return (
            <line
              key={`${n}-${r}`}
              x1={nx + 8}
              y1={nodeY}
              x2={leaves[r] + 36}
              y2={leafY + 36}
              stroke={railColor(r)}
              strokeWidth={1.6}
              opacity={0.75 * p1}
            />
          );
        }),
      )}
      {spines.map((sx, i) => (
        <g key={i} opacity={p2}>
          <rect x={sx} y={spineY} width={80} height={44} fill="rgba(255,122,0,0.14)" stroke={C.orange} strokeWidth={2} />
          <text x={sx + 40} y={spineY + 28} textAnchor="middle" fill={C.orangeLight} fontFamily={F.mono} fontSize={14}>
            spine
          </text>
        </g>
      ))}
      {leaves.map((lx, r) => (
        <g key={r} opacity={p1}>
          <rect x={lx} y={leafY} width={72} height={36} fill="rgba(255,255,255,0.05)" stroke={railColor(r)} strokeWidth={2} />
          <text x={lx + 36} y={leafY + 24} textAnchor="middle" fill={C.text} fontFamily={F.mono} fontSize={13}>
            rail {r}
          </text>
        </g>
      ))}
      {Array.from({ length: nodes }).map((_, n) => (
        <g key={n} opacity={p1}>
          <rect x={20 + n * 235} y={nodeY} width={210} height={70} fill="rgba(77,59,255,0.14)" stroke={C.cobaltBright} strokeWidth={2} />
          {Array.from({ length: rails }).map((__, r) => (
            <rect key={r} x={30 + n * 235 + r * 24} y={nodeY + 10} width={16} height={16} fill={railColor(r)} />
          ))}
          <text x={125 + n * 235} y={nodeY + 54} textAnchor="middle" fill={C.text} fontFamily={F.mono} fontSize={15}>
            HGX node {n}
          </text>
        </g>
      ))}
      <text x={940} y={nodeY + 40} textAnchor="end" fill={C.muted} fontFamily={F.mono} fontSize={26} opacity={p1}>
        …
      </text>
    </svg>
  );
};

export const S03Cluster: React.FC<SceneProps> = ({ beats }) => (
  <AbsoluteFill>
    <SceneTitle chapter="02" eyebrow="Scale-up & scale-out" title="From GPU to cluster" />

    <div style={{ position: "absolute", left: 120, top: 330 }}>
      <Reveal at={beat(beats, 1)}>
        <Label>Scale-up · HGX 8-GPU node</Label>
        <div style={{ marginTop: 6 }}>
          <Mono size={20} color={C.lead}>
            NVLink 4 + NVSwitch · 900 GB/s per GPU
          </Mono>
        </div>
      </Reveal>
      <div style={{ marginTop: 18 }}>
        <HgxNode at={beat(beats, 1, 6)} />
      </div>
    </div>

    <div style={{ position: "absolute", left: 840, top: 330 }}>
      <Reveal at={beat(beats, 2)}>
        <Label>Scale-out · rail-optimised fabric</Label>
        <div style={{ marginTop: 6 }}>
          <Mono size={20} color={C.lead}>
            1 NIC per GPU · 400 Gb/s InfiniBand NDR or RoCEv2 Ethernet
          </Mono>
        </div>
      </Reveal>
      <div style={{ marginTop: 18 }}>
        <Fabric at={beat(beats, 2, 8)} />
      </div>
    </div>

    <div style={{ position: "absolute", left: 120, right: 120, bottom: 90, display: "flex", gap: 28 }}>
      <Reveal at={beat(beats, 3)} style={{ flex: 1 }}>
        <Panel accent={C.cobaltBright} style={{ height: 150 }}>
          <Label>Storage</Label>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.text, marginTop: 14 }}>Parallel file system</div>
          <div style={{ fontFamily: F.body, fontSize: 19, color: C.lead, marginTop: 4 }}>Datasets · checkpoints · model weights</div>
        </Panel>
      </Reveal>
      <Reveal at={beat(beats, 4)} style={{ flex: 1 }}>
        <Panel accent={C.orange} style={{ height: 150 }}>
          <Label color={C.orangeLight}>Power · 8-GPU server</Label>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 50, color: C.text }}>~</span>
            <CountUp at={beat(beats, 4)} value={10} size={56} />
            <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 26, color: C.text }}> kW</span>
          </div>
        </Panel>
      </Reveal>
      <Reveal at={beat(beats, 5)} style={{ flex: 1 }}>
        <Panel accent={C.accent} style={{ height: 150 }}>
          <Label color={C.orangeLight}>Rack-scale · GB200 NVL72</Label>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 50, color: C.text }}>~</span>
            <CountUp at={beat(beats, 5)} value={120} size={56} color={C.orange} />
            <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 26, color: C.text }}> kW</span>
            <span style={{ fontFamily: F.body, fontSize: 19, color: C.lead, marginLeft: 16 }}>direct liquid cooling</span>
          </div>
        </Panel>
      </Reveal>
    </div>
  </AbsoluteFill>
);
