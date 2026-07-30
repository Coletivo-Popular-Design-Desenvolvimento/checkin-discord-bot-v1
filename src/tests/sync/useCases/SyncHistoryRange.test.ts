import { SyncHistoryRange } from "@domain/useCases/sync/SyncHistoryRange";
import { IImportUsers } from "@interfaces/useCases/user/IImportUsers";
import { IImportUserRoles } from "@interfaces/useCases/role/IImportUserRoles";
import { IImportChannels } from "@interfaces/useCases/channel/IImportChannels";
import { IImportMessages } from "@interfaces/useCases/message/IImportMessages";
import { IImportMessageReactions } from "@interfaces/useCases/messageReaction/IImportMessageReactions";
import { IImportAudioEvents } from "@interfaces/useCases/audioEvent/IImportAudioEvents";
import { ILoggerService } from "@services/ILogger";

describe("SyncHistoryRange", () => {
  let syncHistoryRange: SyncHistoryRange;
  let mockImportUsers: jest.Mocked<IImportUsers>;
  let mockImportUserRoles: jest.Mocked<IImportUserRoles>;
  let mockImportChannels: jest.Mocked<IImportChannels>;
  let mockImportMessages: jest.Mocked<IImportMessages>;
  let mockImportMessageReactions: jest.Mocked<IImportMessageReactions>;
  let mockImportAudioEvents: jest.Mocked<IImportAudioEvents>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const emptyResult = { fetched: 0, created: 0, skipped: 0, failed: 0 };

  beforeEach(() => {
    mockImportUsers = { execute: jest.fn() };
    mockImportUserRoles = { execute: jest.fn() };
    mockImportChannels = { execute: jest.fn() };
    mockImportMessages = { execute: jest.fn() };
    mockImportMessageReactions = { execute: jest.fn() };
    mockImportAudioEvents = { execute: jest.fn() };
    mockLogger = { logToConsole: jest.fn(), logToDatabase: jest.fn() };

    mockImportUsers.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 5, created: 5 },
    });
    mockImportUserRoles.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 3, created: 3 },
    });
    mockImportChannels.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 4, created: 4 },
    });
    mockImportMessages.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 10, created: 10 },
    });
    mockImportMessageReactions.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 6, created: 6 },
    });
    mockImportAudioEvents.execute.mockResolvedValue({
      success: true,
      data: { ...emptyResult, fetched: 2, created: 2 },
    });

    syncHistoryRange = new SyncHistoryRange(
      mockImportUsers,
      mockImportUserRoles,
      mockImportChannels,
      mockImportMessages,
      mockImportMessageReactions,
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

    expect(mockImportUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ batchSize: 50 }),
    );
    expect(mockImportUserRoles.execute).toHaveBeenCalledWith(
      expect.objectContaining({ batchSize: 50 }),
    );
    expect(mockImportChannels.execute).toHaveBeenCalledWith(
      expect.objectContaining({ batchSize: 50 }),
    );
    expect(mockImportMessages.execute).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, batchSize: 50 }),
    );
    expect(mockImportMessageReactions.execute).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, batchSize: 50 }),
    );
    expect(mockImportAudioEvents.execute).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, batchSize: 50 }),
    );
  });

  it("should run all 6 imports and combine results", async () => {
    const result = await syncHistoryRange.execute({});

    expect(result.success).toBe(true);
    expect(result.data.users).toEqual({
      ...emptyResult,
      fetched: 5,
      created: 5,
    });
    expect(result.data.userRoles).toEqual({
      ...emptyResult,
      fetched: 3,
      created: 3,
    });
    expect(result.data.channels).toEqual({
      ...emptyResult,
      fetched: 4,
      created: 4,
    });
    expect(result.data.messages).toEqual({
      ...emptyResult,
      fetched: 10,
      created: 10,
    });
    expect(result.data.messageReactions).toEqual({
      ...emptyResult,
      fetched: 6,
      created: 6,
    });
    expect(result.data.audioEvents).toEqual({
      ...emptyResult,
      fetched: 2,
      created: 2,
    });
    expect(result.data.errors).toEqual([]);
  });

  it("should run the 6 steps in the order: users -> userRoles -> channels -> messages -> messageReactions -> audioEvents", async () => {
    const callOrder: string[] = [];
    mockImportUsers.execute.mockImplementation(async () => {
      callOrder.push("users");
      return { success: true, data: emptyResult };
    });
    mockImportUserRoles.execute.mockImplementation(async () => {
      callOrder.push("userRoles");
      return { success: true, data: emptyResult };
    });
    mockImportChannels.execute.mockImplementation(async () => {
      callOrder.push("channels");
      return { success: true, data: emptyResult };
    });
    mockImportMessages.execute.mockImplementation(async () => {
      callOrder.push("messages");
      return { success: true, data: emptyResult };
    });
    mockImportMessageReactions.execute.mockImplementation(async () => {
      callOrder.push("messageReactions");
      return { success: true, data: emptyResult };
    });
    mockImportAudioEvents.execute.mockImplementation(async () => {
      callOrder.push("audioEvents");
      return { success: true, data: emptyResult };
    });

    await syncHistoryRange.execute({});

    expect(callOrder).toEqual([
      "users",
      "userRoles",
      "channels",
      "messages",
      "messageReactions",
      "audioEvents",
    ]);
  });

  it("should isolate failures: other steps still run when users import throws", async () => {
    mockImportUsers.execute.mockRejectedValue(new Error("users boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportUserRoles.execute).toHaveBeenCalledTimes(1);
    expect(mockImportChannels.execute).toHaveBeenCalledTimes(1);
    expect(mockImportMessages.execute).toHaveBeenCalledTimes(1);
    expect(mockImportMessageReactions.execute).toHaveBeenCalledTimes(1);
    expect(mockImportAudioEvents.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.users).toEqual(emptyResult);
    expect(result.data.errors).toEqual([
      expect.stringContaining("users: users boom"),
    ]);
  });

  it("should isolate failures: other steps still run when userRoles import throws", async () => {
    mockImportUserRoles.execute.mockRejectedValue(new Error("userRoles boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportChannels.execute).toHaveBeenCalledTimes(1);
    expect(mockImportMessages.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.userRoles).toEqual(emptyResult);
    expect(result.data.errors).toEqual([
      expect.stringContaining("userRoles: userRoles boom"),
    ]);
  });

  it("should isolate failures: other steps still run when channels import throws", async () => {
    mockImportChannels.execute.mockRejectedValue(new Error("channels boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportMessages.execute).toHaveBeenCalledTimes(1);
    expect(mockImportMessageReactions.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.channels).toEqual(emptyResult);
    expect(result.data.errors).toEqual([
      expect.stringContaining("channels: channels boom"),
    ]);
  });

  it("should isolate failures: audioEvents still runs when messages import throws", async () => {
    mockImportMessages.execute.mockRejectedValue(new Error("messages boom"));

    const result = await syncHistoryRange.execute({});

    expect(mockImportMessageReactions.execute).toHaveBeenCalledTimes(1);
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

  it("should isolate failures: other steps still run when messageReactions import throws", async () => {
    mockImportMessageReactions.execute.mockRejectedValue(
      new Error("messageReactions boom"),
    );

    const result = await syncHistoryRange.execute({});

    expect(mockImportAudioEvents.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.data.messageReactions).toEqual(emptyResult);
    expect(result.data.errors).toEqual([
      expect.stringContaining("messageReactions: messageReactions boom"),
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
    const onUserProgress = jest.fn();
    const onUserRoleProgress = jest.fn();
    const onChannelProgress = jest.fn();
    const onMessageProgress = jest.fn();
    const onMessageReactionProgress = jest.fn();
    const onAudioEventProgress = jest.fn();

    await syncHistoryRange.execute({
      onUserProgress,
      onUserRoleProgress,
      onChannelProgress,
      onMessageProgress,
      onMessageReactionProgress,
      onAudioEventProgress,
    });

    expect(mockImportUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onUserProgress }),
    );
    expect(mockImportUserRoles.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onUserRoleProgress }),
    );
    expect(mockImportChannels.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onChannelProgress }),
    );
    expect(mockImportMessages.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onMessageProgress }),
    );
    expect(mockImportMessageReactions.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onMessageReactionProgress }),
    );
    expect(mockImportAudioEvents.execute).toHaveBeenCalledWith(
      expect.objectContaining({ onProgress: onAudioEventProgress }),
    );
  });
});
