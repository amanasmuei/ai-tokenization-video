import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Chevron, Label, Mono, Panel, prog, Reveal, SceneTitle } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

type Layer = { name: string; detail: string; beatIdx: number; color: string };

// Top-to-bottom as drawn; each lights up on the sentence that names it.
const LAYERS: Layer[] = [
  { name: "Consumption", detail: "Self-service portal · API · billed per GPU-hour", beatIdx: 6, color: C.orange },
  { name: "Observability", detail: "DCGM · SM utilisation · HBM · power · XID errors", beatIdx: 5, color: C.cobaltBright },
  { name: "Orchestration", detail: "Kubernetes + NVIDIA GPU Operator · Slurm", beatIdx: 3, color: C.cobaltBright },
  { name: "Partitioning", detail: "Multi-Instance GPU (MIG) · up to 7 per H100", beatIdx: 4, color: C.cobaltBright },
  { name: "Compute", detail: "Bare-metal nodes · GPU-passthrough VMs", beatIdx: 2, color: C.cobaltBright },
  { name: "Infrastructure", detail: "GPU clusters · fabric · storage · Tier-III DC", beatIdx: 1, color: C.navy },
];

export const S04Gpuaas: React.FC<SceneProps> = ({ beats }) => {
  const frame = useCurrentFrame();
  const migAt = beat(beats, 4);
  return (
    <AbsoluteFill>
      <SceneTitle chapter="03" eyebrow="GPU-as-a-Service" title="Infrastructure as a platform" />

      {/* layered platform stack */}
      <div style={{ position: "absolute", left: 120, top: 340, width: 900, display: "flex", flexDirection: "column", gap: 12 }}>
        {LAYERS.map((l) => {
          const at = beat(beats, l.beatIdx);
          const p = prog(frame, at, 18);
          const glow = Math.max(0, 1 - Math.abs(frame - at - 20) / 40);
          return (
            <div
              key={l.name}
              style={{
                opacity: 0.12 + 0.88 * p,
                transform: `translateX(${(1 - p) * -30}px)`,
                display: "flex",
                alignItems: "center",
                height: 86,
                border: `1px solid ${p > 0.5 ? l.color : C.line}`,
                background: `linear-gradient(90deg, rgba(24,0,231,${0.1 + glow * 0.25}), rgba(255,255,255,0.02))`,
                boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(77,59,255,${0.5 * glow})` : "none",
              }}
            >
              <div style={{ width: 8, alignSelf: "stretch", background: l.color }} />
              <div style={{ width: 330, paddingLeft: 26 }}>
                <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 25, color: C.text, textTransform: "uppercase" }}>
                  {l.name}
                </div>
              </div>
              <div style={{ fontFamily: F.body, fontSize: 21, color: C.lead }}>{l.detail}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 1090, right: 120, top: 340, display: "flex", flexDirection: "column", gap: 26 }}>
        {/* why a service */}
        <Reveal at={beat(beats, 0)}>
          <Panel accent={C.red} style={{ padding: "22px 26px" }}>
            <Label color={C.orangeLight}>Owning the stack</Label>
            <div style={{ fontFamily: F.body, fontSize: 21, color: C.text, marginTop: 12, lineHeight: 1.5 }}>
              Heavy CAPEX · power & cooling retrofit
              <br />
              New GPU generation every 12–24 months
              <br />
              Idle capacity is sunk cost
            </div>
          </Panel>
        </Reveal>

        {/* MIG partitioning */}
        <Reveal at={migAt}>
          <Label>MIG · one H100, seven isolated instances</Label>
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const p = prog(frame, migAt + 6 + i * 4, 10);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 70,
                    background: `rgba(77,59,255,${0.15 + 0.35 * p})`,
                    border: `1px solid ${C.cobaltBright}`,
                    transform: `scaleY(${0.4 + 0.6 * p})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mono size={14} color={C.text}>
                    1g.10gb
                  </Mono>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8 }}>
            <Mono size={16} color={C.muted}>
              dedicated SMs, L2 slice and HBM per tenant
            </Mono>
          </div>
        </Reveal>

        {/* TM GPUaaS */}
        <Reveal at={beat(beats, 7)}>
          <div
            style={{
              background: `linear-gradient(135deg, ${C.cobalt}, ${C.navy})`,
              padding: "24px 26px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("brand/tm-global-cta-element.svg")}
              style={{ position: "absolute", right: -120, bottom: -130, width: 280, opacity: 0.35 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Chevron size={22} color={C.orange} />
              <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 30, color: "#fff" }}>TM GPUAAS</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 21, color: "#fff", marginTop: 12, lineHeight: 1.5, position: "relative" }}>
              Sovereign GPU cloud · Malaysia-hosted
              <br />
              100% data residency · Tier-III data centres
            </div>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
