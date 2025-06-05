# Pixel Perfect

Automated Responsive Testing Platform

## Overview

Pixel Perfect is an automated visual regression and responsive testing platform for web applications. It captures screenshots across multiple devices, compares them with baselines, and generates detailed reports to ensure your UI remains consistent and bug-free.

## Features

- Visual regression testing
- Responsive testing across multiple devices
- CLI tool for easy integration
- TypeScript for type safety
- Extensible device profiles
- Screenshot diffing and reporting

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### CLI Usage

```bash
# Test a website
./dist/cli.js test -u https://your-website.com

# Update baselines
./dist/cli.js update -u https://your-website.com
```

## Device Profiles

You can customize device profiles in the configuration or extend the built-in list. (See `DeviceManager` for details.)

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

### Development

- Lint: `npm run lint`
- Format: `npm run lint:fix`
- Build: `npm run build`
- Test: `npm test`

## License

MIT
