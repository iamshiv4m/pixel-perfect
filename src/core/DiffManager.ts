import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { Logger } from "@utils/Logger";
import type { Screenshot, DiffResult, TestReport } from "../types/index";

/**
 * Compares screenshots to baselines using pixelmatch and sharp.
 * Provides methods to compare images and generate diff reports.
 */
export class DiffManager {
  private logger: Logger;
  private thresholds: {
    pixelMatch: number;
  };

  /**
   * Creates a new DiffManager instance.
   * @param thresholds - Optional thresholds for pixel matching.
   */
  constructor(thresholds: { pixelMatch?: number } = {}) {
    this.logger = new Logger();
    this.thresholds = {
      pixelMatch: 0.1,
      ...thresholds,
    };
  }

  /**
   * Compares screenshots to their baselines.
   * @param screenshots - Array of screenshot metadata.
   * @returns {Promise<DiffResult[]>} Array of diff results.
   * @throws {Error} If comparison fails.
   */
  async compare(screenshots: Screenshot[]): Promise<DiffResult[]> {
    try {
      this.logger.info("Starting visual diff comparison...");
      const diffs: DiffResult[] = [];

      for (const screenshot of screenshots) {
        const diff = await this.compareScreenshot(screenshot);
        diffs.push(diff);
      }

      return diffs;
    } catch (error) {
      this.logger.error("Failed to compare screenshots:", error);
      throw error;
    }
  }

  /**
   * Compares a single screenshot to its baseline.
   * @param screenshot - Screenshot metadata.
   * @returns {Promise<DiffResult>} Diff result.
   * @throws {Error} If comparison fails.
   */
  private async compareScreenshot(screenshot: Screenshot): Promise<DiffResult> {
    try {
      const { device, filepath } = screenshot;
      const baselinePath = path.join(
        path.dirname(filepath),
        "baseline",
        path.basename(filepath)
      );

      // Check if baseline exists
      try {
        await fs.access(baselinePath);
      } catch {
        this.logger.warn(
          `No baseline found for ${device}, skipping comparison`
        );
        return {
          device,
          hasDiff: false,
          diffPercentage: 0,
          diffPath: null,
          message: "No baseline available for comparison",
        };
      }

      // Load and process images
      const [currentImage, baselineImage] = await Promise.all([
        sharp(filepath).raw().toBuffer(),
        sharp(baselinePath).raw().toBuffer(),
      ]);

      const { width, height } = await sharp(filepath).metadata();
      const diffImage = Buffer.alloc(width! * height! * 4);

      // Compare images
      const diffPixels = pixelmatch(
        currentImage,
        baselineImage,
        diffImage,
        width!,
        height!,
        {
          threshold: this.thresholds.pixelMatch,
          includeAA: true,
        }
      );

      const diffPercentage = (diffPixels / (width! * height!)) * 100;
      const hasDiff = diffPercentage > 0;

      let diffPath: string | null = null;
      if (hasDiff) {
        // Save diff image
        diffPath = filepath.replace(".png", "-diff.png");
        await sharp(diffImage, {
          raw: {
            width: width!,
            height: height!,
            channels: 4,
          },
        })
          .png()
          .toFile(diffPath);
      }

      return {
        device,
        hasDiff,
        diffPercentage,
        diffPath,
        message: hasDiff
          ? `Found ${diffPixels} different pixels (${diffPercentage.toFixed(
              2
            )}%)`
          : "No differences found",
      };
    } catch (error) {
      this.logger.error(
        `Failed to compare screenshot for ${screenshot.device}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Generates a summary report from diff results.
   * @param diffs - Array of diff results.
   * @returns {Promise<TestReport>} Test report.
   * @throws {Error} If report generation fails.
   */
  async generateDiffReport(diffs: DiffResult[]): Promise<TestReport> {
    try {
      const report: TestReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalDevices: diffs.length,
          devicesWithDiffs: diffs.filter((d) => d.hasDiff).length,
          totalDiffs: diffs.reduce((sum, d) => sum + (d.hasDiff ? 1 : 0), 0),
        },
        screenshots: [],
        diffs,
      };

      return report;
    } catch (error) {
      this.logger.error("Failed to generate diff report:", error);
      throw error;
    }
  }
}
