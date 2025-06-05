import { promises as fs } from "fs";
import path from "path";
import { Logger } from "../utils/Logger.js";
import {
  Screenshot,
  DiffResult,
  TestReport,
  ReportOutput,
} from "../types/index.js";

export class ReportManager {
  private logger: Logger;
  private outputDir: string;
  private reportsDir: string;

  constructor(outputDir: string) {
    this.logger = new Logger();
    this.outputDir = outputDir;
    this.reportsDir = path.join(outputDir, "reports");
  }

  async generate(
    screenshots: Screenshot[],
    diffs: DiffResult[]
  ): Promise<ReportOutput> {
    try {
      this.logger.info("Generating test report...");
      await fs.mkdir(this.reportsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const report: TestReport = {
        timestamp,
        summary: {
          totalDevices: screenshots.length,
          devicesWithDiffs: diffs.filter((d) => d.hasDiff).length,
          totalDiffs: diffs.reduce((sum, d) => sum + (d.hasDiff ? 1 : 0), 0),
        },
        screenshots: screenshots.map((s) => ({
          device: s.device,
          filepath: s.filepath,
          timestamp: s.timestamp,
          viewport: s.viewport,
        })),
        diffs: diffs.map((d) => ({
          device: d.device,
          hasDiff: d.hasDiff,
          diffPercentage: d.diffPercentage,
          diffPath: d.diffPath,
          message: d.message,
        })),
      };

      // Save JSON report
      const jsonPath = path.join(this.reportsDir, `report-${timestamp}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

      // Generate HTML report
      const htmlPath = path.join(this.reportsDir, `report-${timestamp}.html`);
      await this.generateHtmlReport(report, htmlPath);

      this.logger.info("Test report generated successfully");
      return {
        jsonPath,
        htmlPath,
        report,
      };
    } catch (error) {
      this.logger.error("Failed to generate test report:", error);
      throw error;
    }
  }

  private async generateHtmlReport(
    report: TestReport,
    outputPath: string
  ): Promise<void> {
    try {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Perfect Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .summary {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .device-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .device-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
        }
        .device-card h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .diff {
            color: #e74c3c;
        }
        .no-diff {
            color: #27ae60;
        }
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-top: 10px;
        }
        .timestamp {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .screenshots {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .screenshots > div {
            flex: 1 1 30%;
            min-width: 120px;
        }
        .screenshots p {
            margin: 0 0 5px 0;
            font-size: 0.95em;
            color: #555;
        }
    </style>
</head>
<body>
    <h1>Pixel Perfect Test Report</h1>
    <div class="timestamp">Generated at: ${
      report.timestamp
        ? new Date(report.timestamp).toLocaleString()
        : new Date().toLocaleString()
    }</div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Devices Tested: ${report.summary.totalDevices}</p>
        <p>Devices with Differences: ${report.summary.devicesWithDiffs}</p>
        <p>Total Differences Found: ${report.summary.totalDiffs}</p>
    </div>

    <h2>Device Results</h2>
    <div class="device-grid">
        ${report.diffs
          .map((diff) => {
            const screenshot = report.screenshots.find(
              (s) => s.device === diff.device
            );
            const baselinePath = screenshot
              ? path.relative(
                  this.reportsDir,
                  path.join(
                    path.dirname(screenshot.filepath),
                    "baseline",
                    path.basename(screenshot.filepath)
                  )
                )
              : null;
            const currentPath = screenshot
              ? path.relative(this.reportsDir, screenshot.filepath)
              : null;
            const diffImgPath = diff.diffPath
              ? path.relative(this.reportsDir, diff.diffPath)
              : null;
            return `
            <div class="device-card">
                <h3>${diff.device}</h3>
                <p class="${diff.hasDiff ? "diff" : "no-diff"}">
                    ${diff.message}
                </p>
                <div class="screenshots">
                  <div>
                    <p>Baseline</p>
                    ${
                      baselinePath
                        ? `<img src="${baselinePath}" alt="Baseline for ${diff.device}" onerror="this.style.display='none'">`
                        : "<span>No baseline</span>"
                    }
                  </div>
                  <div>
                    <p>Current</p>
                    ${
                      currentPath
                        ? `<img src="${currentPath}" alt="Current for ${diff.device}" onerror="this.style.display='none'">`
                        : "<span>No current screenshot</span>"
                    }
                  </div>
                  <div>
                    <p>Diff</p>
                    ${
                      diffImgPath
                        ? `<img src="${diffImgPath}" alt="Diff for ${diff.device}" onerror="this.style.display='none'">`
                        : "<span>No diff</span>"
                    }
                  </div>
                </div>
            </div>
          `;
          })
          .join("")}
    </div>
</body>
</html>
      `;
      await fs.writeFile(outputPath, html);
    } catch (error) {
      this.logger.error("Failed to generate HTML report:", error);
      throw error;
    }
  }
}
