import { Logger } from "../utils/Logger.js";

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  test("should create logger instance", () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  test("should log info message", () => {
    const consoleSpy = jest.spyOn(console, "log");
    logger.info("test message");
    expect(consoleSpy).toHaveBeenCalled();
  });
});
