import { chromium, Browser, BrowserContext } from "playwright";
import path from "path";
import { Logger } from "../utils/Logger.js";
import { Device, Screenshot } from "../types/index.js";

export class ScreenshotManager {
  private logger: Logger;
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();

  constructor() {
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info("Initializing browser...");
      this.browser = await chromium.launch();
      this.logger.info("Browser initialized");
    } catch (error) {
      this.logger.error("Failed to initialize browser:", error);
      throw error;
    }
  }

  async captureScreenshots(
    url: string,
    devices: Device[],
    outputDir: string
  ): Promise<Screenshot[]> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    const screenshots: Screenshot[] = [];
    const capturePromises: Promise<Screenshot>[] = [];

    for (const device of devices) {
      capturePromises.push(this.captureScreenshot(url, device, outputDir));
    }

    try {
      const results = await Promise.all(capturePromises);
      screenshots.push(...results);
    } catch (error) {
      this.logger.error("Failed to capture screenshots:", error);
      throw error;
    }

    return screenshots;
  }

  private async captureScreenshot(
    url: string,
    device: Device,
    outputDir: string
  ): Promise<Screenshot> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    let context = this.contexts.get(device.name);
    if (!context) {
      context = await this.browser.newContext({
        viewport: {
          width: device.viewport.width,
          height: device.viewport.height,
        },
        userAgent: device.userAgent,
      });
      this.contexts.set(device.name, context);
    }

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const screenshotPath = path.join(outputDir, `${device.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await page.close();

    return {
      device: device.name,
      filepath: screenshotPath,
      timestamp: new Date().toISOString(),
      viewport: {
        width: device.viewport.width,
        height: device.viewport.height,
      },
    };
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.contexts.clear();
    }
  }
}
