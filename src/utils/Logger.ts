import chalk from "chalk";

/**
 * Colorful, environment-aware logger for info, success, warning, error, and debug messages.
 */
export class Logger {
  private colors: {
    info: typeof chalk.blue;
    success: typeof chalk.green;
    warn: typeof chalk.yellow;
    error: typeof chalk.red;
  };

  /**
   * Creates a new Logger instance.
   */
  constructor() {
    this.colors = {
      info: chalk.blue,
      success: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
    };
  }

  /**
   * Logs an info message.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  info(message: string, ...args: unknown[]): void {
    console.log(this.colors.info("ℹ INFO:"), message, ...args);
  }

  /**
   * Logs a success message.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  success(message: string, ...args: unknown[]): void {
    console.log(this.colors.success("✓ SUCCESS:"), message, ...args);
  }

  /**
   * Logs a warning message.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  warn(message: string, ...args: unknown[]): void {
    console.log(this.colors.warn("⚠ WARN:"), message, ...args);
  }

  /**
   * Logs an error message.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  error(message: string, ...args: unknown[]): void {
    console.error(this.colors.error("✖ ERROR:"), message, ...args);
  }

  /**
   * Logs a debug message if the DEBUG environment variable is set.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.log(this.colors.info("🔍 DEBUG:"), message, ...args);
    }
  }

  /**
   * Logs a plain message.
   * @param message - The message to log.
   * @param args - Additional arguments to log.
   */
  log(message: string, ...args: unknown[]): void {
    console.log(message, ...args);
  }
}
