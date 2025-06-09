# Pixel Perfect CLI Documentation

## Overview

Pixel Perfect CLI is a powerful tool for automated visual regression testing. It helps you ensure your website looks perfect across different devices, browsers, and screen sizes.

## Installation

```bash
# Install globally
npm install -g pixel-perfect

# Or use locally in your project
npm install pixel-perfect --save-dev
```

## Basic Usage

### Run Visual Tests

```bash
# Basic test
pixel-perfect test --url https://your-website.com

# Test with multiple browsers
pixel-perfect test --url https://your-website.com --browsers "chromium,firefox,webkit"
```

### Update Baseline Screenshots

```bash
pixel-perfect update-baseline --url https://your-website.com
```

## Command Line Options

| Option                  | Alias | Description                          | Default                    |
| ----------------------- | ----- | ------------------------------------ | -------------------------- |
| `--url`                 | `-u`  | URL to test (required)               | -                          |
| `--output`              | `-o`  | Output directory for screenshots     | ./screenshots              |
| `--browsers`            | `-b`  | Comma-separated list of browsers     | chromium                   |
| `--devices`             | `-d`  | Comma-separated list of devices      | iPhone 12,iPad Pro,Desktop |
| `--parallel`            | `-p`  | Number of parallel browser instances | 3                          |
| `--ignore-antialiasing` |       | Ignore anti-aliasing differences     | false                      |
| `--ignore-colors`       |       | Compare in grayscale                 | false                      |
| `--ignore-transparency` |       | Ignore transparency differences      | false                      |
| `--threshold`           |       | Pixel matching threshold (0-1)       | 0.1                        |

## Supported Browsers

The tool supports three major browsers:

1. **Chromium** (default)
2. **Firefox**
3. **WebKit**

## Default Devices

The tool comes with three default devices:

1. **iPhone 12**

   - Viewport: 390x844
   - Device Scale Factor: 3
   - Mobile: Yes
   - Touch: Yes

2. **iPad Pro**

   - Viewport: 1024x1366
   - Device Scale Factor: 2
   - Mobile: Yes
   - Touch: Yes

3. **Desktop**
   - Viewport: 1920x1080
   - Device Scale Factor: 1
   - Mobile: No
   - Touch: No

## Output Structure

```text
screenshots/
├── baseline/                    # Baseline screenshots
│   ├── iPhone 12-chromium.png
│   ├── iPhone 12-firefox.png
│   └── ...
├── current/                     # Current test screenshots
│   ├── iPhone 12-chromium.png
│   ├── iPhone 12-firefox.png
│   └── ...
├── diffs/                       # Visual diff images
│   ├── iPhone 12-chromium-diff.png
│   ├── iPhone 12-firefox-diff.png
│   └── ...
└── reports/                     # Test reports
    ├── report-{timestamp}.html
    └── report-{timestamp}.json
```

## Report Format

The tool generates two types of reports:

1. **HTML Report**

   - Visual comparison of screenshots
   - Diff highlights
   - Browser and device-wise results
   - Summary statistics
   - Side-by-side comparison

2. **JSON Report**

```json
{
  "timestamp": "2024-03-21T10:00:00Z",
  "summary": {
    "totalDevices": 3,
    "devicesWithDiffs": 1,
    "totalDiffs": 1
  },
  "screenshots": [
    {
      "device": "iPhone 12",
      "browser": "chromium",
      "filepath": "screenshots/current/iPhone 12-chromium.png",
      "timestamp": "2024-03-21T10:00:00Z",
      "viewport": {
        "width": 390,
        "height": 844
      }
    }
  ],
  "diffs": [
    {
      "device": "iPhone 12",
      "browser": "chromium",
      "hasDiff": true,
      "diffPercentage": 0.5,
      "diffPath": "screenshots/diffs/iPhone 12-chromium-diff.png",
      "message": "Found 100 different pixels (0.5%)"
    }
  ]
}
```

## Examples

### Basic Test Run

```bash
pixel-perfect test --url https://example.com
```

### Multiple Browsers

```bash
pixel-perfect test --url https://example.com --browsers "chromium,firefox,webkit"
```

### Parallel Testing

```bash
pixel-perfect test --url https://example.com --parallel 5
```

### Smart Diffing

```bash
pixel-perfect test --url https://example.com --ignore-antialiasing --ignore-colors
```

### Custom Output Directory

```bash
pixel-perfect test --url https://example.com --output ./my-screenshots
```

### Update Baseline

```bash
pixel-perfect update-baseline --url https://example.com
```

## Troubleshooting

1. **No Baseline Found**

   - Run `update-baseline` command to create initial baseline

2. **Screenshot Capture Failed**

   - Ensure URL is accessible
   - Check network connectivity
   - Verify browser dependencies are installed

3. **High Diff Percentage**

   - Adjust pixel match threshold with `--threshold`
   - Use `--ignore-antialiasing` for minor rendering differences
   - Use `--ignore-colors` for color-only changes
   - Update baseline if changes are intentional

4. **Browser Launch Failed**
   - Ensure browser binaries are installed
   - Check system requirements
   - Try with different browser

## Best Practices

1. **Browser Selection**

   - Start with Chromium for basic testing
   - Add Firefox and WebKit for cross-browser testing
   - Consider your user's browser distribution

2. **Parallel Testing**

   - Adjust parallel instances based on system resources
   - Monitor memory usage with high parallel counts
   - Balance speed vs. resource usage

3. **Smart Diffing**

   - Use `--ignore-antialiasing` for minor rendering differences
   - Use `--ignore-colors` when testing layout only
   - Use `--ignore-transparency` for opaque designs

4. **Baseline Management**

   - Update baseline after intentional UI changes
   - Keep baseline in version control
   - Review baseline updates carefully

5. **CI/CD Integration**
   - Run tests on pull requests
   - Block merges on test failures
   - Keep baseline up to date
   - Use appropriate parallel settings

## Contributing

Feel free to contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT
