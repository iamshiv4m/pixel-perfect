# Pixel Perfect CLI Documentation

## Overview

Pixel Perfect CLI is a powerful tool for automated visual regression testing. It helps you ensure your website looks perfect across different devices and screen sizes.

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
npm run pixel-perfect -- --url https://your-website.com
```

### Update Baseline Screenshots

```bash
npm run pixel-perfect -- --url https://your-website.com --update-baseline
```

## Command Line Options

| Option              | Alias | Description                      | Default       |
| ------------------- | ----- | -------------------------------- | ------------- |
| `--url`             | `-u`  | URL to test (required)           | -             |
| `--update-baseline` | `-b`  | Update baseline screenshots      | false         |
| `--output-dir`      | `-o`  | Output directory for screenshots | ./screenshots |
| `--devices`         | `-d`  | Comma-separated list of devices  | all           |

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
├── baseline/           # Baseline screenshots
│   ├── iPhone 12.png
│   ├── iPad Pro.png
│   └── Desktop.png
├── reports/           # Test reports
│   ├── report-{timestamp}.html
│   └── report-{timestamp}.json
└── diffs/            # Visual diff images
    ├── iPhone 12-diff.png
    ├── iPad Pro-diff.png
    └── Desktop-diff.png
```

## Report Format

The tool generates two types of reports:

1. **HTML Report**

   - Visual comparison of screenshots
   - Diff highlights
   - Device-wise results
   - Summary statistics

2. **JSON Report**

```json
{
  "timestamp": "2024-03-21T10:00:00Z",
  "summary": {
    "totalDevices": 3,
    "devicesWithDiffs": 1,
    "totalDiffs": 1
  },
  "screenshots": [...],
  "diffs": [...]
}
```

## Exit Codes

- `0`: All tests passed
- `1`: Tests failed or error occurred

## Examples

### Basic Test Run Example

```bash
npm run pixel-perfect -- --url https://example.com
```

### Custom Output Directory Example

```bash
npm run pixel-perfect -- --url https://example.com --output-dir ./my-screenshots
```

### Update Baseline Example

```bash
npm run pixel-perfect -- --url https://example.com --update-baseline
```

### Specific Devices Example

```bash
npm run pixel-perfect -- --url https://example.com --devices "iPhone 12,Desktop"
```

## Troubleshooting

1. **No Baseline Found**

   - Run with `--update-baseline` to create initial baseline

2. **Screenshot Capture Failed**

   - Ensure URL is accessible
   - Check network connectivity
   - Verify browser dependencies

3. **High Diff Percentage**
   - Adjust pixel match threshold
   - Update baseline if changes are intentional

## Best Practices

1. **Baseline Management**

   - Update baseline after intentional UI changes
   - Keep baseline in version control
   - Review baseline updates carefully

2. **Device Selection**

   - Start with default devices
   - Add more devices based on your user base
   - Consider device-specific features

3. **CI/CD Integration**
   - Run tests on pull requests
   - Block merges on test failures
   - Keep baseline up to date

## Contributing

Feel free to contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT
