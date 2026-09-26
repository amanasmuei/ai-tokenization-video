import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, F, H, W } from "../theme";

const rand = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Dark TM band: breathing cobalt/orange glows, perspective grid, drifting particles, vignette, grain. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 90);
  const drift = (frame * 0.35) % 80;
  return (
    <AbsoluteFill style={{ background: C.bandBase, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${14 + breathe * 3}% ${6 + breathe * 2}%, rgba(24,0,231,${0.5 + breathe * 0.05}), transparent 42%),
                       radial-gradient(circle at ${88 - breathe * 3}% 94%, rgba(255,122,0,0.2), transparent 38%),
                       radial-gradient(circle at 60% 40%, rgba(77,59,255,0.08), transparent 55%)`,
        }}
      />
      {/* perspective floor grid */}
      <div
        style={{
          position: "absolute",
          left: -W * 0.5,
          width: W * 2,
          top: H * 0.52,
          height: H,
          backgroundImage: `linear-gradient(rgba(174,187,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(174,187,255,0.16) 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          backgroundPosition: `0px ${drift * 1.2}px`,
          transform: "perspective(700px) rotateX(64deg)",
          transformOrigin: "50% 0%",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 55%, transparent 100%)",
          opacity: 0.55,
        }}
      />
      {/* drifting particles */}
      {Array.from({ length: 46 }).map((_, i) => {
        const x = rand(i) * W;
        const speed = 0.15 + rand(i + 99) * 0.35;
        const y = H - ((frame * speed + rand(i + 7) * H) % (H + 40));
        const s = 1.5 + rand(i + 3) * 2.5;
        const tw = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / (18 + rand(i) * 30) + i));
        const orange = i % 7 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 80 + i) * 12,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: orange ? C.orange : "#AEBBFF",
              opacity: tw,
              boxShadow: `0 0 ${s * 4}px ${orange ? "rgba(255,122,0,0.8)" : "rgba(120,110,255,0.8)"}`,
            }}
          />
        );
      })}
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,3,16,0.65) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Static film grain overlay — breaks up gradient banding in the encode. */
export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url(${staticFile("brand/grain.png")})`,
      backgroundSize: "512px 512px",
      mixBlendMode: "overlay",
      opacity: 0.07,
      pointerEvents: "none",
    }}
  />
);

/** TM brand diagonal stripe system (cobalt / navy / orange bands at 45°). */
export const BrandStripes: React.FC<{ progress: number; style?: React.CSSProperties; scale?: number }> = ({
  progress,
  style,
  scale = 1,
}) => {
  const bands = [
    { c: C.navy, w: 150, d: 0 },
    { c: C.cobalt, w: 110, d: 0.08 },
    { c: C.orange, w: 46, d: 0.16 },
    { c: C.cobalt, w: 70, d: 0.22 },
    { c: C.accent, w: 20, d: 0.3 },
  ];
  let x = 0;
  return (
    <div style={{ position: "absolute", width: 900 * scale, height: 1400 * scale, ...style }}>
      {bands.map((b, i) => {
        const p = interpolate(progress, [b.d, b.d + 0.6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        const left = x;
        x += b.w + 22;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: left * scale,
              top: -200 * scale,
              width: b.w * scale,
              height: 1800 * scale,
              background: b.c,
              transform: `skewX(-38deg) translateY(${(1 - p) * 110}%)`,
              opacity: 0.95,
            }}
          />
        );
      })}
    </div>
  );
};

/** Chapter transition: brand stripes sweep in to cover the cut, then pull away to reveal the next chapter. */
export const BrandWipe: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const p = frame / duration;
  const ease = Easing.bezier(0.7, 0, 0.3, 1);
  const m = W * 0.35; // margin so the skewed edges fully leave the frame
  // bottom → top; the accent leads in and trails out
  const layers = [C.accent, C.cobalt, C.navy, C.dark];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {layers.map((c, i) => {
        const inS = i * 0.04;
        const right = interpolate(p, [inS, 0.47], [-m, W + m], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const outS = 0.53 + (layers.length - 1 - i) * 0.04;
        const left = interpolate(p, [outS, Math.min(1, outS + 0.36)], [-m, W + m], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: ease,
        });
        if (right - left <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -120,
              height: H + 240,
              left,
              width: right - left,
              background: c,
              transform: "skewX(-20deg)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export type Chapter = { id: string; label: string; from: number; duration: number; lead?: number };

/** Persistent broadcast chrome: logo lockup, series + chapter indicator, segmented progress. */
export const Chrome: React.FC<{ chapters: Chapter[] }> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const idx = Math.max(
    0,
    chapters.findIndex((c) => frame >= c.from && frame < c.from + c.duration),
  );
  const first = chapters[0];
  const last = chapters[chapters.length - 1];
  const intro = interpolate(frame, [first.lead ?? 0, (first.lead ?? 0) + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outro = interpolate(frame, [last.from, last.from + 15], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const isEdge = idx === 0 || idx === chapters.length - 1;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: intro * outro }}>
      <div style={{ position: "absolute", left: 120, top: 50, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ background: "#fff", padding: "6px 10px", display: "flex" }}>
          <Img src={staticFile("brand/tm-global-logo.png")} style={{ height: 42 }} />
        </div>
        <div style={{ width: 1, height: 34, background: C.line }} />
        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 17, letterSpacing: "0.22em", color: C.text }}>
          TM GPUAAS
        </div>
      </div>

      {!isEdge && (
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "0.22em",
            color: C.eyebrow,
            textTransform: "uppercase",
          }}
        >
          <span style={{ opacity: 0.7 }}>From GPU to token</span>
          <span style={{ width: 28, height: 1, background: C.line }} />
          <span>
            <span style={{ color: C.orange }}>{String(idx).padStart(2, "0")}</span>
            <span style={{ opacity: 0.45 }}> / {String(chapters.length - 2).padStart(2, "0")}</span>
          </span>
        </div>
      )}

      <div style={{ position: "absolute", left: 120, right: 120, bottom: 34, display: "flex", gap: 6 }}>
        {chapters.map((c) => {
          const p = interpolate(frame, [c.from, c.from + c.duration], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div key={c.id} style={{ flex: c.duration, height: 3, background: "rgba(255,255,255,0.08)" }}>
              <div
                style={{
                  width: `${p * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.cobaltBright}, ${C.orange})`,
                  boxShadow: p > 0 && p < 1 ? "0 0 10px rgba(255,122,0,0.7)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
