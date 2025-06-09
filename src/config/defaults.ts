import type { PixelPerfectConfig } from "../types/index.js";
import { DEVICE_PRESETS } from "./devices.js";

/**
 * Default configuration for Pixel Perfect testing.
 * This includes default devices, browsers, and diff options.
 */
export const DEFAULT_CONFIG: Required<Omit<PixelPerfectConfig, "url">> = {
  outputDir: "./screenshots",
  browsers: ["chromium"],
  devices: [
    { name: "iPhone 12", ...DEVICE_PRESETS["iPhone 12"] },
    { name: "iPad Pro", ...DEVICE_PRESETS["iPad Pro"] },
    { name: "Desktop", ...DEVICE_PRESETS["Desktop"] },
  ],
  maxParallelBrowsers: 3,
  diffOptions: {
    threshold: 0.1,
    ignoreAntialiasing: false,
    ignoreColors: false,
    ignoreTransparency: false,
    ignoreRegions: [],
  },
};
