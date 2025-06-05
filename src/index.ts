import { PixelPerfect } from "./core/PixelPerfect.js";
import { DeviceManager } from "./core/DeviceManager.js";
import { ScreenshotManager } from "./core/ScreenshotManager.js";
import { DiffManager } from "./core/DiffManager.js";
import { ReportManager } from "./core/ReportManager.js";
import { Logger } from "./utils/Logger.js";

export {
  PixelPerfect,
  DeviceManager,
  ScreenshotManager,
  DiffManager,
  ReportManager,
  Logger,
};

export type {
  Device,
  Screenshot,
  DiffResult,
  TestReport,
  PixelPerfectConfig,
  ReportOutput,
} from "./types/index.js";

export default PixelPerfect;
