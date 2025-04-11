import { Logger } from "../../application/services/Logger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "../../domain/types/LoggerContextEnum";

describe("Logger Service", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    jest.spyOn(global.console, "log").mockImplementation(() => {});
    jest.spyOn(global.console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log an info message to the console", () => {
    logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.REPOSITORY,
      LoggerContextEntity.USER,
      "User created successfully"
    );

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"status":"SUCCESS"')
    );
  });

  it("should log an error message to the console using console.error", () => {
    logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.COMMAND,
      LoggerContextEntity.USER,
      "Authentication failed"
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('"status":"ERROR"')
    );
  });

  it("should log an event with the correct structure", () => {
    logger.logToConsole(
      LoggerContextStatus.ERROR,
      LoggerContext.SERVICE,
      LoggerContextEntity.USER,
      "User update delayed"
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('"message":"User update delayed"')
    );
  });

  it("should include a timestamp in the log event", () => {
    logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.INFRASTRUCTURE,
      LoggerContextEntity.USER,
      "Debugging process"
    );

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/"createdAt":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) // Matches ISO date format
    );
  });
});
