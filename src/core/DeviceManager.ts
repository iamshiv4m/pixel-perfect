import { Logger } from "@utils/Logger";
import type { Device } from "../types/index";

const DEVICE_PRESETS: Record<string, Omit<Device, "name">> = {
  "iPhone SE": {
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
  "iPhone 12": {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
  },
  "iPhone 12 Pro Max": {
    viewport: { width: 428, height: 926 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
  },
  "iPad Pro": {
    viewport: { width: 1024, height: 1366 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
  },
  Desktop: {
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  },
  "Ultra Wide": {
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
  },
  "Galaxy S21": {
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36",
  },
};

/**
 * Manages device presets and custom device configurations.
 * Provides methods to initialize, retrieve, add, and remove devices.
 */
export class DeviceManager {
  private logger: Logger;
  private devices: Device[] = [
    {
      name: "iPhone SE",
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    },
    {
      name: "iPhone 12",
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    },
    {
      name: "iPad Pro",
      viewport: { width: 1024, height: 1366 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    },
    {
      name: "Galaxy S21",
      viewport: { width: 360, height: 800 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.105 Mobile Safari/537.36",
    },
    {
      name: "Desktop",
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
    },
  ];

  /**
   * Creates a new DeviceManager instance.
   * @param customDevices - Optional array of custom devices to add to the default list.
   */
  constructor(customDevices?: Device[]) {
    this.logger = new Logger();
    if (customDevices) {
      this.devices = [...this.devices, ...customDevices];
    }
  }

  /**
   * Initializes the devices by validating against presets.
   * @throws {Error} If a device preset is not found.
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info("Initializing devices...");

      for (const deviceName of this.devices.map((device) => device.name)) {
        if (!DEVICE_PRESETS[deviceName]) {
          throw new Error(`Device preset not found: ${deviceName}`);
        }

        this.devices = [
          ...this.devices,
          {
            ...DEVICE_PRESETS[deviceName],
            name: deviceName,
          },
        ];
      }

      this.logger.info(`Initialized ${this.devices.length} devices`);
    } catch (error) {
      this.logger.error("Failed to initialize devices:", error);
      throw error;
    }
  }

  /**
   * Returns the list of configured devices.
   * @returns {Device[]} Array of device configurations.
   */
  getDevices(): Device[] {
    return this.devices;
  }

  /**
   * Returns a device by its name.
   * @param name - The name of the device to retrieve.
   * @returns {Device | undefined} The device configuration or undefined if not found.
   */
  getDevice(name: string): Device | undefined {
    return this.devices.find((device) => device.name === name);
  }

  /**
   * Adds a new device to the list.
   * @param device - The device configuration to add.
   */
  addDevice(device: Device): void {
    this.devices.push(device);
  }

  /**
   * Removes a device by its name.
   * @param deviceName - The name of the device to remove.
   */
  removeDevice(deviceName: string): void {
    this.devices = this.devices.filter((device) => device.name !== deviceName);
  }

  /**
   * Returns the number of configured devices.
   * @returns {number} The count of devices.
   */
  getDeviceCount(): number {
    return this.devices.length;
  }
}
