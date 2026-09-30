import { Request, Response } from "express";
import { createHealthHandler } from "@infra/http/routes/health.route";
import { ILoggerService } from "@services/ILogger";

describe("health route handler", () => {
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  function mockResponse() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    return { res, status, json };
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("responds 200 with UP status when the database is healthy", async () => {
    const handler = createHealthHandler(
      () => Promise.resolve(true),
      mockLogger,
    );
    const { res, status, json } = mockResponse();

    await handler({} as Request, res, jest.fn());

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "UP", database: "HEALTHY" }),
    );
  });

  it("responds 503 with DOWN status when the database is unreachable", async () => {
    const handler = createHealthHandler(
      () => Promise.resolve(false),
      mockLogger,
    );
    const { res, status, json } = mockResponse();

    await handler({} as Request, res, jest.fn());

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith({
      status: "DOWN",
      database: "UNREACHABLE",
    });
    expect(mockLogger.logToConsole).toHaveBeenCalled();
  });
});
