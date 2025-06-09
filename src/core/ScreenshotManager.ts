import path from "path";
import { Logger } from "../utils/Logger.js";
import type { Device, Screenshot } from "../types/index";
import { BrowserManager, BrowserType } from "./BrowserManager.js";

/**
 * Manages browser lifecycle and screenshot capture for each device.
 * Uses Playwright to launch browsers, navigate to URLs, and capture screenshots.
 */
export class ScreenshotManager {
  private logger: Logger;
  private browserManager: BrowserManager;
  private maxParallelBrowsers: number;

  /**
   * Creates a new ScreenshotManager instance.
   * @param maxParallelBrowsers - Maximum number of parallel browser instances (default: 3)
   */
  constructor(maxParallelBrowsers: number = 3) {
    this.logger = new Logger();
    this.maxParallelBrowsers = maxParallelBrowsers;
    this.browserManager = new BrowserManager({
      type: "chromium",
      headless: true,
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
      timeout: 60000, // 60 second timeout
    });
  }

  /**
   * Initializes the browser manager with specified browser types.
   * @param browserTypes - Array of browser types to initialize
   * @throws {Error} If browser initialization fails
   */
  async initialize(browserTypes: BrowserType[] = ["chromium"]): Promise<void> {
    try {
      this.logger.info("Initializing browsers...");
      await Promise.all(
        browserTypes.map((type) => this.browserManager.initializeBrowser(type))
      );
      this.logger.info("Browsers initialized");
    } catch (error: unknown) {
      this.logger.error("Failed to initialize browsers:", error);
      throw new Error(
        `Browser initialization failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Captures screenshots for each device by navigating to the given URL.
   * Implements parallel testing across multiple browsers.
   * @param url - The URL to capture screenshots from
   * @param devices - Array of device configurations
   * @param outputDir - Directory to save the screenshots
   * @returns {Promise<Screenshot[]>} Array of screenshot metadata
   * @throws {Error} If screenshot capture fails
   */
  async captureScreenshots(
    url: string,
    devices: Device[],
    outputDir: string
  ): Promise<Screenshot[]> {
    const screenshots: Screenshot[] = [];
    const errors: Error[] = [];

    try {
      // Process devices in parallel batches
      for (let i = 0; i < devices.length; i += this.maxParallelBrowsers) {
        const batch = devices.slice(i, i + this.maxParallelBrowsers);
        const batchPromises = batch.map((device) =>
          this.captureScreenshot(url, device, outputDir).catch(
            (error: unknown) => {
              const err =
                error instanceof Error ? error : new Error(String(error));
              errors.push(err);
              return null;
            }
          )
        );

        const batchResults = await Promise.all(batchPromises);
        screenshots.push(
          ...batchResults.filter((s): s is Screenshot => s !== null)
        );
      }

      if (errors.length > 0) {
        this.logger.warn(
          `Completed with ${errors.length} errors. Check logs for details.`
        );
      }

      return screenshots;
    } catch (error: unknown) {
      this.logger.error("Failed to capture screenshots:", error);
      throw new Error(
        `Screenshot capture failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Captures a screenshot for a single device and browser type.
   * @param url - The URL to capture a screenshot from
   * @param device - The device configuration
   * @param outputDir - Directory to save the screenshot
   * @returns {Promise<Screenshot>} Screenshot metadata
   * @throws {Error} If screenshot capture fails
   */
  private async captureScreenshot(
    url: string,
    device: Device,
    outputDir: string
  ): Promise<Screenshot> {
    const context = await this.browserManager.createContext(device, "chromium");
    const page = await context.newPage();
    const screenshotPath = path.join(
      outputDir,
      `${device.name.toLowerCase().replace(/\s+/g, "-")}.png`
    );

    try {
      this.logger.info(`Capturing screenshot for ${device.name}...`);

      // Navigate with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          break;
        } catch (error: unknown) {
          retries--;
          if (retries === 0) throw error;
          this.logger.warn(
            `Navigation failed for ${device.name}, retrying... (${retries} attempts left)`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Wait for network to be idle
      await page
        .waitForLoadState("networkidle", { timeout: 10000 })
        .catch(() => {
          this.logger.warn(
            `Network did not become idle for ${device.name}, proceeding anyway...`
          );
        });

      // Take screenshot
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      this.logger.info(`Screenshot captured for ${device.name}`);
      return {
        device: device.name,
        browser: "chromium",
        filepath: screenshotPath,
        timestamp: new Date().toISOString(),
        viewport: device.viewport,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to capture screenshot for ${device.name}:`,
        error
      );
      throw new Error(
        `Screenshot capture failed for ${device.name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      await page.close();
    }
  }

  /**
   * Closes all browser instances and cleans up resources.
   */
  async cleanup(): Promise<void> {
    try {
      await this.browserManager.cleanup();
      this.logger.info("Browser cleanup completed");
    } catch (error: unknown) {
      this.logger.error("Browser cleanup failed:", error);
      throw new Error(
        `Cleanup failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
