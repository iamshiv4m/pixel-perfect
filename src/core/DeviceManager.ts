import { Logger } from "../utils/Logger.js";
import type { Device } from "../types/index.js";
import { DEVICE_PRESETS } from "../config/devices.js";

/**
 * Manages device configurations for testing.
 * Handles device initialization and provides access to device settings.
 */
export class DeviceManager {
  private logger: Logger;
  private devices: Device[];

  /**
   * Creates a new DeviceManager instance.
   * @param devices - Array of device configurations or device names to use.
   */
  constructor(devices: (Device | string)[]) {
    this.logger = new Logger();
    this.devices = devices.map((device) => {
      if (typeof device === "string") {
        const preset = DEVICE_PRESETS[device];
        if (!preset) {
          throw new Error(`Unknown device preset: ${device}`);
        }
        return { name: device, ...preset };
      }
      return device;
    });
  }

  /**
   * Initializes the device manager.
   * Currently a no-op but can be extended for future device setup.
   */
  async initialize(): Promise<void> {
    this.logger.info("Initializing devices...");
    // Add any device initialization logic here
  }

  /**
   * Gets the list of configured devices.
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
