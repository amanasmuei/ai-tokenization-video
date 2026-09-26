import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BrandStripes } from "../components/Frame";
import { Chevron, Eyebrow, Heading, Mono, prog, Reveal } from "../components/ui";
import { C, F } from "../theme";
import { beat, SceneProps } from "./types";

export const S11Outro: React.FC<SceneProps> = ({ beats, duration }) => {
  const frame = useCurrentFrame();
  const words = ["Silicon", "GPUaaS", "Tokens"];
  const brandAt = beat(beats, 1);
  const el = prog(frame, brandAt - 10, 50);
  const out = interpolate(frame, [duration - 20, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.dark, opacity: out }}>
      <BrandStripes progress={el} scale={1.15} style={{ right: -520, top: -160 }} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {words.map((w, i) => {
            const p = prog(frame, beat(beats, 0, i * 16), 16);
            return (
              <React.Fragment key={w}>
                {i > 0 && <Chevron size={46} color={C.orange} style={{ opacity: p }} />}
                <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
                  <Heading size={84} style={{ color: i === 2 ? C.orange : C.text }}>
                    {w}
                  </Heading>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <Reveal at={brandAt} style={{ marginTop: 90 }}>
          <Eyebrow color={C.orangeLight}>Sovereign GPU cloud for AI</Eyebrow>
        </Reveal>
        <Reveal at={brandAt + 8} style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ background: "#fff", padding: "10px 14px", display: "flex" }}>
              <Img src={staticFile("brand/tm-global-logo.png")} style={{ height: 84 }} />
            </div>
            <Heading size={96} style={{ textTransform: "none" }}>
              TM GPUaaS
            </Heading>
          </div>
        </Reveal>
        <Reveal at={brandAt + 18} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: F.body, fontWeight: 300, fontSize: 32, color: C.lead }}>
            Malaysia-hosted · 100% data residency · built for the token economy
          </div>
        </Reveal>
        <Reveal at={brandAt + 30} style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Chevron size={20} color={C.orange} />
            <Mono size={24} color={C.eyebrow}>
              tmglobal.com.my
            </Mono>
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
