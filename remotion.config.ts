import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

// Use the pre-installed headless Chromium when available (offline/sandboxed environments).
const localChrome = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (process.env.REMOTION_CHROME || existsSync(localChrome)) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME ?? localChrome);
}

// Master-quality output.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(100);
Config.setCodec("h264");
Config.setCrf(16);
Config.setX264Preset("slow");
Config.setColorSpace("bt709");
Config.setPixelFormat("yuv420p");
Config.setAudioBitrate("320k");
Config.setConcurrency(4);
