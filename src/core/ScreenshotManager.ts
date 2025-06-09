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
    } catch (error) {
      this.logger.error("Failed to initialize browsers:", error);
      throw error;
    }
  }

  /**
   * Captures screenshots for each device by navigating to the given URL.
   * Implements parallel testing across multiple browsers.
   * @param url - The URL to capture screenshots from
   * @param devices - Array of device configurations
   * @param outputDir - Directory to save the screenshots
   * @param browserTypes - Array of browser types to use (default: ["chromium"])
   * @returns {Promise<Screenshot[]>} Array of screenshot metadata
   * @throws {Error} If screenshot capture fails
   */
  async captureScreenshots(
    url: string,
    devices: Device[],
    outputDir: string,
    browserTypes: BrowserType[] = ["chromium"]
  ): Promise<Screenshot[]> {
    const screenshots: Screenshot[] = [];

    // Create batches of devices for parallel processing
    const batches = this.createBatches(devices, this.maxParallelBrowsers);

    for (const batch of batches) {
      const batchPromises = batch.flatMap((device) =>
        browserTypes.map((browserType) =>
          this.captureScreenshot(url, device, outputDir, browserType)
        )
      );

      const batchResults = await Promise.all(batchPromises);
      screenshots.push(...batchResults);
    }

    return screenshots;
  }

  /**
   * Captures a screenshot for a single device and browser type.
   * @param url - The URL to capture a screenshot from
   * @param device - The device configuration
   * @param outputDir - Directory to save the screenshot
   * @param browserType - The type of browser to use
   * @returns {Promise<Screenshot>} Screenshot metadata
   * @throws {Error} If screenshot capture fails
   */
  private async captureScreenshot(
    url: string,
    device: Device,
    outputDir: string,
    browserType: BrowserType
  ): Promise<Screenshot> {
    try {
      const context = await this.browserManager.createContext(
        device,
        browserType
      );
      const page = await context.newPage();

      // Wait for network idle and any dynamic content
      await page.goto(url, { waitUntil: "networkidle" });
      await this.waitForDynamicContent(page);

      const screenshotPath = path.join(
        outputDir,
        `${device.name}-${browserType}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await page.close();

      return {
        device: device.name,
        browser: browserType,
        filepath: screenshotPath,
        timestamp: new Date().toISOString(),
        viewport: {
          width: device.viewport.width,
          height: device.viewport.height,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to capture screenshot for ${device.name} on ${browserType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Creates batches of devices for parallel processing.
   * @param devices - Array of devices to batch
   * @param batchSize - Size of each batch
   * @returns {Device[][]} Array of device batches
   */
  private createBatches(devices: Device[], batchSize: number): Device[][] {
    const batches: Device[][] = [];
    for (let i = 0; i < devices.length; i += batchSize) {
      batches.push(devices.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Waits for dynamic content to load and stabilize.
   * @param page - The page to wait for
   */
  private async waitForDynamicContent(page: any): Promise<void> {
    try {
      // Wait for any animations to complete
      await page.waitForTimeout(1000);

      // Wait for any lazy-loaded images
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        );
      });

      // Wait for any dynamic content to settle
      await page.waitForTimeout(500);
    } catch (error) {
      this.logger.warn("Error waiting for dynamic content:", error);
    }
  }

  /**
   * Closes all browser instances and cleans up resources.
   */
  async cleanup(): Promise<void> {
    await this.browserManager.cleanup();
  }
}
