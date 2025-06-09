import { chromium, firefox, webkit, Browser, BrowserContext } from "playwright";
import { Logger } from "../utils/Logger.js";
import type { Device } from "../types/index";

export type BrowserType = "chromium" | "firefox" | "webkit";

interface BrowserConfig {
  type: BrowserType;
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
}

/**
 * Manages multiple browser instances and parallel testing.
 * Supports Chromium, Firefox, and WebKit browsers.
 */
export class BrowserManager {
  private logger: Logger;
  private browsers: Map<BrowserType, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private config: BrowserConfig;

  /**
   * Creates a new BrowserManager instance.
   * @param config - Browser configuration options.
   */
  constructor(config: BrowserConfig) {
    this.logger = new Logger();
    this.config = {
      headless: true,
      slowMo: 0,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Initializes the specified browser.
   * @param type - The type of browser to initialize.
   * @throws {Error} If browser initialization fails.
   */
  async initializeBrowser(type: BrowserType): Promise<void> {
    try {
      this.logger.info(`Initializing ${type} browser...`);

      let browser: Browser;
      switch (type) {
        case "chromium":
          browser = await chromium.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
        case "firefox":
          browser = await firefox.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
        case "webkit":
          browser = await webkit.launch({
            headless: this.config.headless,
            slowMo: this.config.slowMo,
          });
          break;
        default:
          throw new Error(`Unsupported browser type: ${type}`);
      }

      this.browsers.set(type, browser);
      this.logger.info(`${type} browser initialized successfully`);
    } catch (error) {
      this.logger.error(`Failed to initialize ${type} browser:`, error);
      throw error;
    }
  }

  /**
   * Creates a new browser context for a device.
   * @param device - The device configuration.
   * @param browserType - The type of browser to use.
   * @returns {Promise<BrowserContext>} The created browser context.
   * @throws {Error} If browser context creation fails.
   */
  async createContext(
    device: Device,
    browserType: BrowserType
  ): Promise<BrowserContext> {
    const browser = this.browsers.get(browserType);
    if (!browser) {
      throw new Error(`${browserType} browser not initialized`);
    }

    const contextKey = `${browserType}-${device.name}`;
    let context = this.contexts.get(contextKey);

    if (!context) {
      context = await browser.newContext({
        viewport: {
          width: device.viewport.width,
          height: device.viewport.height,
        },
        userAgent: device.userAgent,
        deviceScaleFactor: device.deviceScaleFactor,
        isMobile: device.isMobile,
        hasTouch: device.hasTouch,
      });
      this.contexts.set(contextKey, context);
    }

    return context;
  }

  /**
   * Closes all browser instances and cleans up resources.
   */
  async cleanup(): Promise<void> {
    for (const [type, browser] of this.browsers) {
      try {
        await browser.close();
        this.logger.info(`Closed ${type} browser`);
      } catch (error) {
        this.logger.error(`Error closing ${type} browser:`, error);
      }
    }
    this.browsers.clear();
    this.contexts.clear();
  }

  /**
   * Gets the number of active browser instances.
   */
  getActiveBrowserCount(): number {
    return this.browsers.size;
  }
}
