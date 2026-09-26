import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "../theme";

/** Pure 0→1 eased progress; safe to call inside loops/conditionals. */
export const prog = (frame: number, at: number, dur = 18) =>
  interpolate(frame, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

/** 0→1 entrance progress starting at `at` (frames, scene-local). */
export const useIn = (at: number, dur = 18) => prog(useCurrentFrame(), at, dur);

export const useSpring = (at: number, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, mass: 0.8 } });
};

export const Reveal: React.FC<{
  at: number;
  y?: number;
  x?: number;
  dur?: number;
  blur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, y = 24, x = 0, dur = 18, blur = 6, style, children }) => {
  const p = useIn(at, dur);
  return (
    <div
      style={{
        opacity: p,
        transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px)`,
        filter: p < 1 && blur ? `blur(${(1 - p) * blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Text slides up from behind a mask — the classic broadcast title reveal. */
export const MaskReveal: React.FC<{ at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  dur = 22,
  style,
  children,
}) => {
  const p = useIn(at, dur);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = C.eyebrow,
  style,
}) => (
  <div
    style={{
      fontFamily: F.heading,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Heading: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({
  children,
  size = 68,
  style,
}) => (
  <div
    style={{
      fontFamily: F.heading,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.02,
      textTransform: "uppercase",
      color: C.text,
      letterSpacing: "-0.005em",
      backgroundImage: "linear-gradient(180deg, #FFFFFF 30%, #C9D0FF 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: style?.color ? undefined : "transparent",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Chapter title block, top-left of the content area. */
export const SceneTitle: React.FC<{ chapter: string; eyebrow: string; title: React.ReactNode; at?: number }> = ({
  chapter,
  eyebrow,
  title,
  at = 4,
}) => {
  const bar = useIn(at, 20);
  return (
    <div style={{ position: "absolute", left: 120, top: 150 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44 * bar, height: 3, background: `linear-gradient(90deg, ${C.orange}, ${C.accent})` }} />
        <Reveal at={at + 4} x={-16} y={0} blur={0}>
          <Eyebrow>
            <span style={{ color: C.orange }}>{chapter}</span>
            <span style={{ margin: "0 14px", opacity: 0.5 }}>/</span>
            {eyebrow}
          </Eyebrow>
        </Reveal>
      </div>
      <MaskReveal at={at + 8} style={{ marginTop: 16 }}>
        <Heading>{title}</Heading>
      </MaskReveal>
    </div>
  );
};

export const Panel: React.FC<{
  style?: React.CSSProperties;
  accent?: string;
  children: React.ReactNode;
}> = ({ style, accent, children }) => (
  <div
    style={{
      background: "linear-gradient(180deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 100%)",
      border: `1px solid ${C.line}`,
      borderTop: accent ? `3px solid ${accent}` : `1px solid ${C.line}`,
      boxShadow: "0 40px 80px -40px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
      padding: "26px 30px",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.eyebrow,
  size = 17,
  style,
}) => (
  <div
    style={{
      fontFamily: F.heading,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 26,
  color = C.lead,
  style,
}) => (
  <div style={{ fontFamily: F.body, fontWeight: 400, fontSize: size, lineHeight: 1.4, color, ...style }}>{children}</div>
);

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 26,
  color = C.text,
  style,
}) => (
  <span style={{ fontFamily: F.mono, fontSize: size, color, fontVariantNumeric: "tabular-nums", ...style }}>
    {children}
  </span>
);

/** Big stat that counts up from 0 to `value` starting at `at`. */
export const CountUp: React.FC<{
  at: number;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
  dur?: number;
}> = ({ at, value, decimals = 0, prefix = "", suffix = "", size = 72, color = C.text, dur = 30 }) => {
  const p = useIn(at, dur);
  const v = value * p;
  return (
    <span
      style={{
        fontFamily: F.heading,
        fontWeight: 900,
        fontSize: size,
        color,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.01em",
      }}
    >
      {prefix}
      {v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; color?: string; fill?: boolean; style?: React.CSSProperties }> = ({
  children,
  color = C.eyebrow,
  fill,
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: F.heading,
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      padding: "8px 14px",
      border: `1px solid ${fill ? color : C.line}`,
      background: fill ? color : "transparent",
      color: fill ? "#fff" : color,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Brand chevron arrow (same path as the .tm-btn arrow). */
export const Chevron: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
  size = 28,
  color = C.orange,
  style,
}) => (
  <svg width={size * 0.74} height={size} viewBox="0 0 29.5 40" style={style}>
    <path d="M19.2,20L0,0h9.4l20.1,20L9.4,40H0L19.2,20z" fill={color} />
  </svg>
);

export const Footnote: React.FC<{ children: React.ReactNode; at?: number }> = ({ children, at = 20 }) => (
  <Reveal at={at} y={0} style={{ position: "absolute", left: 120, bottom: 64 }}>
    <div style={{ fontFamily: F.body, fontSize: 16, color: C.muted, letterSpacing: "0.02em" }}>{children}</div>
  </Reveal>
);
