# Pixel Perfect

Automated Responsive Testing Platform

---

Pixel Perfect is a CLI tool for automated responsive visual regression testing. It captures website screenshots across multiple devices, compares them to baselines, and generates detailed HTML/JSON reports highlighting layout shifts, broken UI, and inconsistencies.

## Features

- 📱 Multi-device, multi-viewport screenshot capture
- 🔍 Visual diffing against baselines
- 📊 Baseline management
- 📝 Modern HTML and JSON reports
- 🚀 Extensible, modular TypeScript codebase
- ⚡ Parallel browser testing
- 🎨 Smart diffing with configurable options

## Installation

```sh
# Install globally
npm install -g pixel-perfect

# Or use locally
npm install pixel-perfect --save-dev
```

## Quick Start

1. **Run your first test:**

```sh
pixel-perfect test --url https://example.com
```

2. **Update baselines:**

```sh
pixel-perfect update-baseline --url https://example.com
```

## Usage Guide

### Basic Testing

```sh
# Test with default devices (iPhone 12, iPad Pro, Desktop)
pixel-perfect test --url https://example.com

# Test specific devices
pixel-perfect test --url https://example.com --devices "iPhone 12,Desktop"

# Custom output directory
pixel-perfect test --url https://example.com --output ./my-screenshots
```

### Advanced Options

```sh
# Adjust pixel matching threshold (0-1)
pixel-perfect test --url https://example.com --threshold 0.05

# Ignore anti-aliasing differences
pixel-perfect test --url https://example.com --ignore-antialiasing

# Ignore color differences (useful for dark/light mode)
pixel-perfect test --url https://example.com --ignore-colors

# Ignore transparency
pixel-perfect test --url https://example.com --ignore-transparency
```

### Baseline Management

```sh
# Update baselines for all devices
pixel-perfect update-baseline --url https://example.com

# Update baselines for specific devices
pixel-perfect update-baseline --url https://example.com --devices "iPhone 12,Desktop"
```

## Configuration

### Default Devices

The tool comes with predefined device configurations:

- Mobile: iPhone 12, iPhone 14, Pixel 8, etc.
- Tablet: iPad Pro, iPad Air, etc.
- Desktop: 1920x1080, 2560x1440, etc.

### Custom Configuration

Create a `pixel-perfect.config.js` file:

```js
module.exports = {
  devices: [
    {
      name: "Custom Device",
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent: "Mozilla/5.0 ...",
    },
  ],
  diffOptions: {
    threshold: 0.1,
    ignoreAntialiasing: true,
    ignoreColors: false,
    ignoreTransparency: true,
  },
};
```

## Troubleshooting

### Common Issues

1. **Browser Launch Fails**

   - Ensure Playwright browsers are installed: `npx playwright install`
   - Check system requirements for headless browser support

2. **Screenshot Size Mismatch**

   - Run `update-baseline` to refresh baseline screenshots
   - Verify device configurations match between test and baseline

3. **Network Timeouts**

   - Increase timeout in configuration
   - Check network connectivity
   - Verify URL accessibility

4. **Visual Diffs Too Sensitive**
   - Adjust threshold value
   - Enable ignoreAntialiasing
   - Configure ignoreRegions for dynamic content

### Debug Mode

Run with debug logging:

```sh
DEBUG=pw:api pixel-perfect test --url https://example.com
```

## Project Structure

```
pixel-perfect/
├── src/
│   ├── core/           # Core managers
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities
│   └── cli.ts          # CLI entry point
├── screenshots/        # Test outputs
├── reports/           # Test reports
└── tests/             # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
