import chalk from "chalk";

export class Logger {
  private colors: {
    info: typeof chalk.blue;
    success: typeof chalk.green;
    warn: typeof chalk.yellow;
    error: typeof chalk.red;
  };

  constructor() {
    this.colors = {
      info: chalk.blue,
      success: chalk.green,
      warn: chalk.yellow,
      error: chalk.red,
    };
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.colors.info("ℹ INFO:"), message, ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(this.colors.success("✓ SUCCESS:"), message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.log(this.colors.warn("⚠ WARN:"), message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.colors.error("✖ ERROR:"), message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.log(this.colors.info("🔍 DEBUG:"), message, ...args);
    }
  }

  log(message: string, ...args: unknown[]): void {
    console.log(message, ...args);
  }
}
