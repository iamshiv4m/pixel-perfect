/**
 * Represents a device configuration for testing.
 */
export interface Device {
  /** Device name (e.g., 'iPhone 12'). */
  name: string;
  /** Viewport dimensions. */
  viewport: {
    width: number;
    height: number;
  };
  /** Device pixel ratio. */
  deviceScaleFactor: number;
  /** Whether the device is mobile. */
  isMobile: boolean;
  /** Whether the device supports touch. */
  hasTouch: boolean;
  /** User agent string for the device. */
  userAgent: string;
}

/**
 * Metadata for a captured screenshot.
 */
export interface Screenshot {
  /** Device name for which the screenshot was taken. */
  device: string;
  /** File path to the screenshot image. */
  filepath: string;
  /** Optional timestamp when the screenshot was taken. */
  timestamp?: string;
  /** Optional viewport dimensions. */
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Result of comparing a screenshot to its baseline.
 */
export interface DiffResult {
  /** Device name. */
  device: string;
  /** Whether a visual difference was detected. */
  hasDiff: boolean;
  /** Percentage of pixels that differ. */
  diffPercentage: number;
  /** File path to the diff image, or null if not applicable. */
  diffPath: string | null;
  /** Message describing the diff result. */
  message: string;
}

/**
 * Aggregated test report for a run.
 */
export interface TestReport {
  /** ISO timestamp of the test run. */
  timestamp: string;
  summary: {
    /** Total number of devices tested. */
    totalDevices: number;
    /** Number of devices with visual differences. */
    devicesWithDiffs: number;
    /** Total number of differences found. */
    totalDiffs: number;
  };
  /** List of screenshots taken. */
  screenshots: Screenshot[];
  /** List of diff results. */
  diffs: DiffResult[];
}

/**
 * Configuration options for Pixel Perfect runs.
 */
export interface PixelPerfectConfig {
  /** Target URL to test. */
  url: string;
  /** Optional list of devices to test. */
  devices?: Device[];
  /** Optional output directory for results. */
  outputDir?: string;
  thresholds?: {
    /** Optional pixel match threshold (0-1). */
    pixelMatch?: number;
    /** Optional performance threshold (0-1). */
    performance?: number;
  };
}

/**
 * Output paths and report object for a generated report.
 */
export interface ReportOutput {
  /** Path to the JSON report file. */
  jsonPath: string;
  /** Path to the HTML report file. */
  htmlPath: string;
  /** The test report object. */
  report: TestReport;
}
