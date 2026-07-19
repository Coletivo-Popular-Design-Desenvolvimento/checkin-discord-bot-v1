import { SyncHistoryRange } from "@domain/useCases/sync/SyncHistoryRange";
import { IImportMessages } from "@interfaces/useCases/message/IImportMessages";
import { IImportAudioEvents } from "@interfaces/useCases/audioEvent/IImportAudioEvents";
import { ILoggerService } from "@services/ILogger";

describe("SyncHistoryRange", () => {
  let syncHistoryRange: SyncHistoryRange;
  let mockImportMessages: jest.Mocked<IImportMessages>;
  let mockImportAudioEvents: jest.Mocked<IImportAudioEvents>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const emptyResult = { fetched: 0, created: 0, skipped: 0, failed: 0 };

  beforeEach(() => {
    mockImportMessages = { execute: jest.fn() };
    mockImportAudioEvents = { execute: jest.fn() };
    mockLogger = { logToConsole: jest.fn(), logToDatabase: jest.fn() };

    mockImportMessages.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 10, created: 10 },
    });
    mockImportAudioEvents.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 2, created: 2 },
    });

    syncHistoryRange = new SyncHistoryRange(
      mockImportMessages,
      mockImportAudioEvents,
      mockLogger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should default to the last 3 months and batchSize 1000 when omitted", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-04-15T00:00:00.000Z"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportMessages.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date("2024-01-15T00:00:00.000Z"),
        endDate: new Date("2024-04-15T00:00:00.000Z"),
        batchSize: 1000,
      }),
    );
    expect(result.data.startDate).toEqual(new Date("2024-01-15T00:00:00.000Z"));
    expect(result.data.endDate).toEqual(new Date("2024-04-15T00:00:00.000Z"));
    expect(result.data.batchSize).toBe(1000);
  });

  it("should use explicit startDate/endDate/batchSize when provided", async () => {
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-06-01");

    await syncHistoryRange.execute({ startDate, endDate, batchSize: 50 });

    expect(mockImportMessages.execute).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, batchSize: 50 }),
    );
    expect(mockImportAudioEvents.execute).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, batchSize: 50 }),
    );
  });

  it("should run both imports sequentially and combine results", async () => {
    const result = await syncHistoryRange.execute({});

    expect(result.success).toBe(true);
    expect(result.data.messages).toEqual({
      ...emptyResult,
      fetched: 10,
      created: 10,
    });
    expect(result.data.audioEvents).toEqual({
      ...emptyResult,
      fetched: 2,
      created: 2,
    });
    expect(result.data.errors).toEqual([]);
  });

  it("should isolate failures: audioEvents still runs when messages import throws", async () => {
    mockImportMessages.execute.mockRejectedValue(new Error("messages boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportAudioEvents.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.messages).toEqual(emptyResult);
    expect(result.data.audioEvents).toEqual({
      ...emptyResult,
      fetched: 2,
      created: 2,
    });
    expect(result.data.errors).toEqual([
      expect.stringContaining("messages: messages boom"),
    ]);
  });

  it("should isolate failures: messages still runs when audioEvents import throws", async () => {
    mockImportAudioEvents.execute.mockRejectedValue(new Error("events boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportMessages.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.audioEvents).toEqual(emptyResult);
    expect(result.data.errors).toEqual([
      expect.stringContaining("audioEvents: events boom"),
    ]);
  });

  it("should collect a message when a use case returns success:false without throwing", async () => {
    mockImportMessages.execute.mockResolvedValue({
      success: false,
      data: emptyResult,
      message: "partial failure",
    });

    const result = await syncHistoryRange.execute({});

    expect(result.success).toBe(false);
    expect(result.data.errors).toEqual([
      expect.stringContaining("messages: partial failure"),
    ]);
  });

  it("should forward progress callbacks to the respective use cases", async () => {
    const onMessageProgress = jest.fn();
    const onAudioEventProgress = jest.fn();

    await syncHistoryRange.execute({ onMessageProgress, onAudioEventProgress });

    expect(mockImportMessages.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onMessageProgress }),
    );
    expect(mockImportAudioEvents.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onAudioEventProgress }),
    );
  });
});
