export interface Device {
  name: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  userAgent: string;
}

export interface Screenshot {
  device: string;
  filepath: string;
  timestamp?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface DiffResult {
  device: string;
  hasDiff: boolean;
  diffPercentage: number;
  diffPath: string | null;
  message: string;
}

export interface TestReport {
  timestamp: string;
  summary: {
    totalDevices: number;
    devicesWithDiffs: number;
    totalDiffs: number;
  };
  screenshots: Screenshot[];
  diffs: DiffResult[];
}

export interface PixelPerfectConfig {
  url: string;
  devices?: Device[];
  outputDir?: string;
  thresholds?: {
    pixelMatch?: number;
    performance?: number;
  };
}

export interface ReportOutput {
  jsonPath: string;
  htmlPath: string;
  report: TestReport;
}
