import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { Logger } from "../utils/Logger.js";
import type { Screenshot, DiffResult, TestReport } from "../types/index";

interface DiffOptions {
  threshold?: number;
  ignoreAntialiasing?: boolean;
  ignoreColors?: boolean;
  ignoreTransparency?: boolean;
  ignoreRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Compares screenshots to baselines using pixelmatch and sharp.
 * Provides methods to compare images and generate diff reports.
 * Implements smart diffing to ignore non-critical changes.
 */
export class DiffManager {
  private logger: Logger;
  private options: Required<DiffOptions>;

  /**
   * Creates a new DiffManager instance.
   * @param options - Optional diffing options.
   */
  constructor(options: DiffOptions = {}) {
    this.logger = new Logger();
    this.options = {
      threshold: 0.1,
      ignoreAntialiasing: true,
      ignoreColors: false,
      ignoreTransparency: true,
      ignoreRegions: [],
      ...options,
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
      const { device, browser, filepath } = screenshot;
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
          `No baseline found for ${device} on ${browser}, skipping comparison`
        );
        return {
          device,
          browser,
          hasDiff: false,
          diffPercentage: 0,
          diffPath: null,
          message: "No baseline available for comparison",
        };
      }

      // Load and process images
      const [currentImage, baselineImage] = await Promise.all([
        this.preprocessImage(filepath),
        this.preprocessImage(baselinePath),
      ]);

      const { width, height } = await sharp(filepath).metadata();
      const diffImage = Buffer.alloc(width! * height! * 4);

      // Compare images with smart diffing
      const diffPixels = pixelmatch(
        currentImage,
        baselineImage,
        diffImage,
        width!,
        height!,
        {
          threshold: this.options.threshold,
          includeAA: !this.options.ignoreAntialiasing,
          alpha: 0.5,
          diffColor: [255, 0, 0],
          diffColorAlt: [0, 0, 255],
          diffMask: true,
        }
      );

      // Apply ignore regions if specified
      if (this.options.ignoreRegions.length > 0) {
        await this.applyIgnoreRegions(diffImage, width!, height!);
      }

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
        browser,
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
        `Failed to compare screenshot for ${screenshot.device} on ${screenshot.browser}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Preprocesses an image for comparison.
   * @param imagePath - Path to the image file.
   * @returns {Promise<Buffer>} Processed image buffer.
   */
  private async preprocessImage(imagePath: string): Promise<Buffer> {
    let image = sharp(imagePath);

    if (this.options.ignoreColors) {
      // Convert to grayscale
      image = image.grayscale();
    }

    return image.raw().toBuffer();
  }

  /**
   * Applies ignore regions to the diff image.
   * @param diffImage - The diff image buffer.
   * @param width - Image width.
   * @param height - Image height.
   */
  private async applyIgnoreRegions(
    diffImage: Buffer,
    width: number,
    height: number
  ): Promise<void> {
    for (const region of this.options.ignoreRegions) {
      for (let y = region.y; y < region.y + region.height; y++) {
        for (let x = region.x; x < region.x + region.width; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = (y * width + x) * 4;
            diffImage[idx] = 0; // R
            diffImage[idx + 1] = 0; // G
            diffImage[idx + 2] = 0; // B
            diffImage[idx + 3] = 0; // A
          }
        }
      }
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
