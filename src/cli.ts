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

const program = new Command();
const logger = new Logger();

program
  .name("pixel-perfect")
  .description("Automated Responsive Testing Platform")
  .version("1.0.0");

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
  .description("Run visual regression tests on a URL")
  .requiredOption("-u, --url <url>", "URL to test (e.g. https://example.com)")
  .option(
    "-d, --devices <devices>",
    "Comma-separated list of devices to test (e.g. 'iPhone 12,iPad Pro,Desktop')",
    "iPhone 12,iPad Pro,Desktop"
  )
  .option(
    "-o, --output <dir>",
    "Output directory for screenshots and reports",
    "./screenshots"
  )
  .option(
    "-t, --threshold <number>",
    "Pixel match threshold (0-1, default: 0.1)",
    "0.1"
  )
  .option("--ignore-antialiasing", "Ignore anti-aliasing differences", true)
  .option(
    "--ignore-colors",
    "Ignore color differences (useful for dark/light mode)",
    false
  )
  .option("--ignore-transparency", "Ignore transparency differences", true)
  .action(async (options) => {
    try {
      const pixelPerfect = new PixelPerfect({
        url: options.url,
        outputDir: options.output,
        devices: options.devices.split(","),
        diffOptions: {
          threshold: parseFloat(options.threshold),
          ignoreAntialiasing: options.ignoreAntialiasing,
          ignoreColors: options.ignoreColors,
          ignoreTransparency: options.ignoreTransparency,
        },
      });

      await pixelPerfect.run();
    } catch (error) {
      logger.error("Test failed:", error);
      process.exit(1);
    }
  });

/**
 * 'update-baseline' command: Updates baseline screenshots for the specified URL.
 *
 * Options:
 *   -u, --url <url>         URL to test (required)
 *   -o, --output <dir>      Output directory (default: ./screenshots)
 */
program
  .command("update-baseline")
  .description("Update baseline screenshots for a URL")
  .requiredOption("-u, --url <url>", "URL to capture baselines for")
  .option(
    "-d, --devices <devices>",
    "Comma-separated list of devices to capture",
    "iPhone 12,iPad Pro,Desktop"
  )
  .option(
    "-o, --output <dir>",
    "Output directory for baselines",
    "./screenshots"
  )
  .action(async (options) => {
    try {
      const pixelPerfect = new PixelPerfect({
        url: options.url,
        outputDir: options.output,
        devices: options.devices.split(","),
      });

      await pixelPerfect.updateBaseline();
    } catch (error) {
      logger.error("Failed to update baseline:", error);
      process.exit(1);
    }
  });

// Add examples to help
program.addHelpText(
  "after",
  `
Examples:
  # Run tests on example.com with default devices
  $ pixel-perfect test --url https://example.com

  # Test specific devices with custom threshold
  $ pixel-perfect test --url https://example.com --devices "iPhone 12,Desktop" --threshold 0.05

  # Update baselines for a URL
  $ pixel-perfect update-baseline --url https://example.com

  # Test with custom output directory
  $ pixel-perfect test --url https://example.com --output ./my-screenshots
`
);

program.parse();
