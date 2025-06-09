import { DeviceManager } from "./DeviceManager.js";
import { ScreenshotManager } from "./ScreenshotManager.js";
import { DiffManager } from "./DiffManager.js";
import { ReportManager } from "./ReportManager.js";
import { Logger } from "../utils/Logger.js";
import type { PixelPerfectConfig, ReportOutput } from "../types/index.js";
import { DEFAULT_CONFIG } from "../config/defaults.js";
import path from "path";
import fs from "fs/promises";

/**
 * Main orchestrator class for the Pixel Perfect testing platform.
 * Manages the full test lifecycle: device setup, screenshot capture, diffing, and report generation.
 */
export class PixelPerfect {
  private config: Required<PixelPerfectConfig>;
  private logger: Logger;
  private deviceManager: DeviceManager;
  private screenshotManager: ScreenshotManager;
  private diffManager: DiffManager;
  private reportManager: ReportManager;

  /**
   * Creates a new PixelPerfect instance.
   * @param config - Configuration object. Must include a URL.
   * @throws {Error} If URL is not provided.
   */
  constructor(config: PixelPerfectConfig) {
    if (!config.url) {
      throw new Error("URL is required");
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    this.logger = new Logger();
    this.deviceManager = new DeviceManager(this.config.devices);
    this.screenshotManager = new ScreenshotManager(
      this.config.maxParallelBrowsers
    );
    this.diffManager = new DiffManager(this.config.diffOptions);
    this.reportManager = new ReportManager(this.config.outputDir);
  }

  /**
   * Runs the full test workflow:
   * 1. Initializes devices
   * 2. Launches the browser
   * 3. Captures screenshots for each device
   * 4. Compares screenshots with baselines
   * 5. Generates a test report
   * @returns {Promise<ReportOutput>} The generated report output.
   */
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

  /**
   * Updates the baseline screenshots for all configured devices.
   * This will:
   * 1. Create a baseline directory if it doesn't exist
   * 2. Take new screenshots
   * 3. Move them to the baseline directory
   * @throws {Error} If baseline update fails
   */
  async updateBaseline(): Promise<void> {
    try {
      this.logger.info("Updating baseline...");

      // Initialize devices and browser
      await this.deviceManager.initialize();
      await this.screenshotManager.initialize();

      // Create baseline directory
      const baselineDir = path.join(this.config.outputDir, "baseline");
      await fs.mkdir(baselineDir, { recursive: true });

      // Take new screenshots
      const screenshots = await this.screenshotManager.captureScreenshots(
        this.config.url,
        this.deviceManager.getDevices(),
        this.config.outputDir
      );

      // Move screenshots to baseline directory
      for (const screenshot of screenshots) {
        const baselinePath = path.join(
          baselineDir,
          path.basename(screenshot.filepath)
        );
        await fs.rename(screenshot.filepath, baselinePath);
        this.logger.info(`Updated baseline for ${screenshot.device}`);
      }

      this.logger.success("Baseline updated successfully!");
    } catch (error) {
      this.logger.error("Failed to update baseline:", error);
      throw error;
    } finally {
      // Cleanup
      await this.screenshotManager.cleanup();
    }
  }

  /**
   * Validates the current configuration.
   * This method is a placeholder and should be implemented as needed.
   */
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
