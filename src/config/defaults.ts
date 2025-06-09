import type { PixelPerfectConfig } from "../types/index.js";
import { DEVICE_PRESETS } from "./devices.js";

/**
 * Default configuration for Pixel Perfect testing.
 * These defaults are optimized for most web applications.
 */
export const DEFAULT_CONFIG: Required<Omit<PixelPerfectConfig, "url">> = {
  // Output directory for screenshots and reports
  outputDir: "./screenshots",

  // Default browsers to test with
  browsers: ["chromium"],

  // Default devices to test with (mobile, tablet, desktop)
  devices: [
    { name: "iPhone 12", ...DEVICE_PRESETS["iPhone 12"] },
    { name: "iPad Pro", ...DEVICE_PRESETS["iPad Pro"] },
    { name: "Desktop", ...DEVICE_PRESETS["Desktop"] },
  ],

  // Maximum number of parallel browser instances
  maxParallelBrowsers: 3,

  // Visual diffing options
  diffOptions: {
    // Threshold for pixel matching (0.1 = 10% difference allowed)
    threshold: 0.1,

    // Ignore anti-aliasing differences
    ignoreAntialiasing: true,

    // Ignore color differences (useful for dark/light mode testing)
    ignoreColors: false,

    // Ignore transparency differences
    ignoreTransparency: true,

    // Regions to ignore in diffing (e.g. dynamic content)
    ignoreRegions: [],
  },
};
