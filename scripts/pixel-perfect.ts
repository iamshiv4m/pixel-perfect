#!/usr/bin/env node
import { PixelPerfect } from "../src/core/PixelPerfect.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .option("url", {
      alias: "u",
      description: "URL to test",
      type: "string",
      demandOption: true,
    })
    .option("update-baseline", {
      alias: "b",
      description: "Update baseline screenshots",
      type: "boolean",
      default: false,
    })
    .option("output-dir", {
      alias: "o",
      description: "Output directory for screenshots",
      type: "string",
      default: "./screenshots",
    })
    .option("devices", {
      alias: "d",
      description: "Comma-separated list of devices to test",
      type: "string",
      default: "all",
    })
    .help().argv;

  try {
    const pixelPerfect = new PixelPerfect({
      url: argv.url,
      outputDir: argv.outputDir,
      // Add more config options as needed
    });

    if (argv.updateBaseline) {
      console.log("🔄 Updating baseline screenshots...");
      await pixelPerfect.updateBaseline();
      console.log("✅ Baseline updated successfully!");
    } else {
      console.log("🔍 Running visual tests...");
      const report = await pixelPerfect.run();
      console.log("📊 Test Report:", report);

      if (report.report.summary.devicesWithDiffs > 0) {
        console.error("❌ Tests failed!");
        process.exit(1);
      } else {
        console.log("✅ All tests passed!");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
