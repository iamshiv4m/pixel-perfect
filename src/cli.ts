#!/usr/bin/env node

/**
 * Pixel Perfect CLI
 *
 * Provides commands to run responsive visual regression tests and update baselines.
 *
 * Usage:
 *   pixel-perfect test --url <url> [--devices <devices>] [--output <dir>] [--threshold <number>]
 *   pixel-perfect update-baseline --url <url> [--output <dir>]
 *
 * Commands:
 *   test            Run responsive tests on a URL
 *   update-baseline Update baseline screenshots
 *
 * Options:
 *   -u, --url <url>         URL to test
 *   -d, --devices <devices> Comma-separated list of devices (default: iPhone 12,iPad Pro,Desktop)
 *   -o, --output <dir>      Output directory (default: ./screenshots)
 *   -t, --threshold <num>   Pixel match threshold (default: 0.1)
 */

import { Command } from "commander";
import { PixelPerfect } from "./core/PixelPerfect.js";
import { Logger } from "./utils/Logger.js";
import type { Device } from "./types/index.js";

const program = new Command();
const logger = new Logger();

/**
 * Predefined device configurations for CLI usage.
 */
const deviceMap: Record<string, Device> = {
  "iPhone 12": {
    name: "iPhone 12",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
  "iPad Pro": {
    name: "iPad Pro",
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
  Desktop: {
    name: "Desktop",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
  },
};

program
  .name("pixel-perfect")
  .description("Automated Responsive Testing Platform")
  .version("0.1.0");

/**
 * 'test' command: Runs responsive tests on the specified URL and devices.
 *
 * Options:
 *   -u, --url <url>         URL to test (required)
 *   -d, --devices <devices> Comma-separated list of devices (default: iPhone 12,iPad Pro,Desktop)
 *   -o, --output <dir>      Output directory (default: ./screenshots)
 *   -t, --threshold <num>   Pixel match threshold (default: 0.1)
 */
program
  .command("test")
  .description("Run responsive tests on a URL")
  .requiredOption("-u, --url <url>", "URL to test")
  .option(
    "-d, --devices <devices>",
    "Comma-separated list of devices to test",
    "iPhone 12,iPad Pro,Desktop"
  )
  .option(
    "-o, --output <dir>",
    "Output directory for screenshots and reports",
    "./screenshots"
  )
  .option("-t, --threshold <number>", "Pixel match threshold (0-1)", "0.1")
  .action(
    async (options: {
      url: string;
      devices: string;
      output: string;
      threshold: string;
    }) => {
      try {
        const deviceNames = options.devices.split(",");
        const devices = deviceNames.map((name) => deviceMap[name]);

        const tester = new PixelPerfect({
          url: options.url,
          devices,
          outputDir: options.output,
          thresholds: {
            pixelMatch: parseFloat(options.threshold),
          },
        });

        logger.info(`Starting tests for ${options.url}`);
        logger.info(`Testing on devices: ${deviceNames.join(", ")}`);

        const report = await tester.run();

        logger.success("Tests completed successfully!");
        logger.info(`Report generated at: ${report.htmlPath}`);

        process.exit(0);
      } catch (error) {
        logger.error("Test run failed:", error);
        process.exit(1);
      }
    }
  );

/**
 * 'update-baseline' command: Updates baseline screenshots for the specified URL.
 *
 * Options:
 *   -u, --url <url>         URL to test (required)
 *   -o, --output <dir>      Output directory (default: ./screenshots)
 */
program
  .command("update-baseline")
  .description("Update baseline screenshots")
  .requiredOption("-u, --url <url>", "URL to test")
  .option(
    "-o, --output <dir>",
    "Output directory containing screenshots",
    "./screenshots"
  )
  .action(async (options: { url: string; output: string }) => {
    try {
      const tester = new PixelPerfect({
        url: options.url,
        outputDir: options.output,
      });

      logger.info("Updating baseline screenshots...");
      await tester.updateBaseline();

      logger.success("Baseline updated successfully!");
      process.exit(0);
    } catch (error) {
      logger.error("Failed to update baseline:", error);
      process.exit(1);
    }
  });

program.parse();
