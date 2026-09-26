import React from "react";

type P = { size?: number; color?: string; draw?: number };

/** Line icons drawn with a stroke-dash "draw-on" (draw: 0→1). */
const Base: React.FC<P & { children: React.ReactNode }> = ({ size = 64, color = "#AEBBFF", draw = 1, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={2.4}
    strokeLinecap="square"
    style={{ overflow: "visible" }}
  >
    <g strokeDasharray={1} strokeDashoffset={1 - draw} style={{}}>
      {React.Children.map(children, (c) =>
        React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ pathLength?: number }>, { pathLength: 1 }) : c,
      )}
    </g>
  </svg>
);

export const ChipIcon: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="16" y="16" width="32" height="32" />
    <rect x="25" y="25" width="14" height="14" />
    <path d="M22 16V8M32 16V8M42 16V8M22 56V48M32 56V48M42 56V48M16 22H8M16 32H8M16 42H8M56 22H48M56 32H48M56 42H48" />
  </Base>
);

export const MemoryIcon: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="12" y="10" width="40" height="10" />
    <rect x="12" y="24" width="40" height="10" />
    <rect x="12" y="38" width="40" height="10" />
    <path d="M20 52V56M32 52V56M44 52V56" />
  </Base>
);

export const NetworkIcon: React.FC<P> = (p) => (
  <Base {...p}>
    <rect x="26" y="6" width="12" height="12" />
    <rect x="6" y="44" width="12" height="12" />
    <rect x="26" y="44" width="12" height="12" />
    <rect x="46" y="44" width="12" height="12" />
    <path d="M32 18V30M12 44V30H52V44M32 30V44" />
  </Base>
);

export const PowerIcon: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M36 6L14 36H30L26 58L50 26H34L36 6Z" />
  </Base>
);

export const TokenIcon: React.FC<P> = (p) => (
  <Base {...p}>
    <path d="M32 6L55 19V45L32 58L9 45V19L32 6Z" />
    <path d="M24 26H40M32 26V42" />
  </Base>
);
