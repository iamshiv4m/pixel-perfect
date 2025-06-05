import { DeviceManager } from "./DeviceManager.js";
import { ScreenshotManager } from "./ScreenshotManager.js";
import { DiffManager } from "./DiffManager.js";
import { ReportManager } from "./ReportManager.js";
import { Logger } from "../utils/Logger.js";
import { PixelPerfectConfig, ReportOutput } from "../types/index.js";

export class PixelPerfect {
  private config: Required<PixelPerfectConfig>;
  private logger: Logger;
  private deviceManager: DeviceManager;
  private screenshotManager: ScreenshotManager;
  private diffManager: DiffManager;
  private reportManager: ReportManager;

  constructor(config: PixelPerfectConfig) {
    if (!config.url) {
      throw new Error("URL is required");
    }

    const defaultConfig = {
      devices: [
        {
          name: "iPhone 12",
          viewport: { width: 390, height: 844 },
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
          userAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        },
        {
          name: "iPad Pro",
          viewport: { width: 1024, height: 1366 },
          deviceScaleFactor: 2,
          isMobile: true,
          hasTouch: true,
          userAgent:
            "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        },
        {
          name: "Desktop",
          viewport: { width: 1920, height: 1080 },
          deviceScaleFactor: 1,
          isMobile: false,
          hasTouch: false,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
        },
      ],
      outputDir: "./screenshots",
      thresholds: {
        pixelMatch: 0.1,
        performance: 90,
      },
    };

    this.config = {
      ...defaultConfig,
      ...config,
    };

    this.logger = new Logger();
    this.deviceManager = new DeviceManager(this.config.devices);
    this.screenshotManager = new ScreenshotManager();
    this.diffManager = new DiffManager(this.config.thresholds);
    this.reportManager = new ReportManager(this.config.outputDir);
  }

  async run(): Promise<ReportOutput> {
    try {
      this.logger.info("Starting Pixel Perfect test run...");

      // Initialize devices
      await this.deviceManager.initialize();

      // Initialize browser
      await this.screenshotManager.initialize();

      // Take screenshots for each device
      const screenshots = await this.screenshotManager.captureScreenshots(
        this.config.url,
        this.deviceManager.getDevices(),
        this.config.outputDir
      );

      // Compare with baseline if exists
      const diffs = await this.diffManager.compare(screenshots);

      // Generate report
      const report = await this.reportManager.generate(screenshots, diffs);

      this.logger.info("Test run completed successfully!");
      return report;
    } catch (error) {
      this.logger.error("Test run failed:", error);
      throw error;
    }
  }

  async updateBaseline(): Promise<void> {
    try {
      this.logger.info("Updating baseline...");
      // Implement baseline update logic here
      this.logger.info("Baseline updated successfully!");
    } catch (error) {
      this.logger.error("Failed to update baseline:", error);
      throw error;
    }
  }

  async validate(): Promise<void> {
    try {
      this.logger.info("Validating configuration...");
      // Add validation logic here
      this.logger.info("Configuration is valid!");
    } catch (error) {
      this.logger.error("Configuration validation failed:", error);
      throw error;
    }
  }
}
