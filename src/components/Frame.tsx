import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../theme";

/** Dark TM band: cobalt glow top-left, orange glow bottom-right, slow-drifting engineering grid. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.25) % 80;
  const glowShift = Math.sin(frame / 240) * 4;
  return (
    <AbsoluteFill style={{ background: C.bandBase }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${15 + glowShift}% 8%, rgba(24,0,231,0.46), transparent 38%),
                       radial-gradient(circle at ${88 - glowShift}% 92%, rgba(255,122,0,0.18), transparent 36%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `${drift}px ${drift}px`,
          opacity: 0.22,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

export type Chapter = { id: string; label: string; from: number; duration: number };

/** Persistent broadcast chrome: logo lockup, chapter indicator, timeline progress. */
export const Chrome: React.FC<{ chapters: Chapter[] }> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const idx = Math.max(
    0,
    chapters.findIndex((c) => frame >= c.from && frame < c.from + c.duration),
  );
  const intro = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const isEdge = idx === 0 || idx === chapters.length - 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intro }}>
      {/* logo lockup */}
      <div style={{ position: "absolute", left: 120, top: 52, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ background: "#fff", padding: "6px 10px", display: "flex" }}>
          <Img src={staticFile("brand/tm-global-logo.png")} style={{ height: 44 }} />
        </div>
        <div style={{ width: 1, height: 34, background: C.line }} />
        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, letterSpacing: "0.2em", color: C.text }}>
          TM GPUAAS
        </div>
      </div>

      {/* chapter indicator */}
      {!isEdge && (
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 64,
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "0.2em",
            color: C.eyebrow,
            textTransform: "uppercase",
          }}
        >
          From GPU to token
          <span style={{ color: C.orange, marginLeft: 18 }}>{String(idx).padStart(2, "0")}</span>
          <span style={{ opacity: 0.45 }}> / {String(chapters.length - 2).padStart(2, "0")}</span>
        </div>
      )}

      {/* segmented progress bar */}
      <div style={{ position: "absolute", left: 120, right: 120, bottom: 34, display: "flex", gap: 6 }}>
        {chapters.map((c) => {
          const p = interpolate(frame, [c.from, c.from + c.duration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={c.id} style={{ flex: c.duration, height: 3, background: "rgba(255,255,255,0.1)" }}>
              <div
                style={{
                  width: `${p * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.cobaltBright}, ${C.orange})`,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
