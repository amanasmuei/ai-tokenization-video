import React from "react";
import { Composition } from "remotion";
import { GpuToToken, totalFrames } from "./Video";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="GpuToToken" component={GpuToToken} durationInFrames={totalFrames()} fps={FPS} width={W} height={H} />
);
