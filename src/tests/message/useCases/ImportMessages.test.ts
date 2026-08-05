import { ImportMessages } from "@domain/useCases/message/ImportMessages";
import {
  IDiscordHistoryFetcher,
  RawHistoricalMessage,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportMessages", () => {
  let importMessages: ImportMessages;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawMessage = (overrides: Partial<RawHistoricalMessage> = {}) =>
    ({
      platformId: "message-1",
      platformCreatedAt: new Date("2024-01-01"),
      channelId: "channel-1",
      channelName: "general",
      channelUrl: "https://discord.com/channels/1/channel-1",
      userId: "user-1",
      username: "TestUser",
      userGlobalName: null,
      userBot: false,
      ...overrides,
    }) as RawHistoricalMessage;

  beforeEach(() => {
    mockFetcher = {
      fetchNextMessageBatch: jest.fn(),
      fetchAudioEventsInRange: jest.fn(),
      fetchGuildMembers: jest.fn(),
      fetchGuildChannels: jest.fn(),
      fetchGuildMemberRoles: jest.fn(),
      fetchNextMessageReactionsBatch: jest.fn(),
    };
    mockRepository = {
      saveMessagesBatch: jest.fn(),
      saveAudioEventsBatch: jest.fn(),
      saveUsersBatch: jest.fn(),
      saveChannelsBatch: jest.fn(),
      saveMessageReactionsBatch: jest.fn(),
      saveUserRolesBatch: jest.fn(),
    };
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    importMessages = new ImportMessages(
      mockFetcher,
      mockRepository,
      mockLogger,
    );
  });

  const input = {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-02-01"),
    batchSize: 100,
  };

  it("should import a single batch of messages", async () => {
    mockFetcher.fetchNextMessageBatch.mockResolvedValue({
      messages: [rawMessage()],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessagesBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      messagesCreated: 1,
    });

    const result = await importMessages.execute(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 1,
      created: 1,
      skipped: 0,
      failed: 0,
    });
    expect(mockRepository.saveMessagesBatch).toHaveBeenCalledWith({
      channels: [
        {
          platformId: "channel-1",
          name: "general",
          url: "https://discord.com/channels/1/channel-1",
          createdAt: expect.any(Date),
        },
      ],
      users: [
        {
          platformId: "user-1",
          username: "TestUser",
          bot: false,
          status: 1,
          globalName: null,
          platformCreatedAt: undefined,
          joinedAt: undefined,
        },
      ],
      messages: [
        expect.objectContaining({
          platformId: "message-1",
          isDeleted: false,
        }),
      ],
    });
  });

  it("should loop across multiple batches until done", async () => {
    mockFetcher.fetchNextMessageBatch
      .mockResolvedValueOnce({
        messages: [rawMessage({ platformId: "message-1" })],
        cursor: { channelIndex: 0, before: "message-1" },
        done: false,
      })
      .mockResolvedValueOnce({
        messages: [rawMessage({ platformId: "message-2" })],
        cursor: { channelIndex: 1 },
        done: true,
      });

    mockRepository.saveMessagesBatch
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        messagesCreated: 1,
      })
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        messagesCreated: 1,
      });

    const result = await importMessages.execute(input);

    expect(mockFetcher.fetchNextMessageBatch).toHaveBeenCalledTimes(2);
    expect(mockFetcher.fetchNextMessageBatch).toHaveBeenNthCalledWith(2, {
      startDate: input.startDate,
      endDate: input.endDate,
      batchSize: input.batchSize,
      cursor: { channelIndex: 0, before: "message-1" },
    });
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should skip saving when a batch has no messages", async () => {
    mockFetcher.fetchNextMessageBatch.mockResolvedValue({
      messages: [],
      cursor: { channelIndex: 5 },
      done: true,
    });

    const result = await importMessages.execute(input);

    expect(mockRepository.saveMessagesBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should count skipped messages when repository creates fewer than fetched", async () => {
    mockFetcher.fetchNextMessageBatch.mockResolvedValue({
      messages: [
        rawMessage({ platformId: "message-1" }),
        rawMessage({ platformId: "message-2" }),
      ],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessagesBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      messagesCreated: 1,
    });

    const result = await importMessages.execute(input);

    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("should invoke onProgress once per non-empty batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchNextMessageBatch.mockResolvedValue({
      messages: [rawMessage()],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessagesBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      messagesCreated: 1,
    });

    await importMessages.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledWith({
      batchNumber: 1,
      fetched: 1,
      created: 1,
    });
  });

  it("should log the failed batch and continue to the next one when saveMessagesBatch throws", async () => {
    mockFetcher.fetchNextMessageBatch
      .mockResolvedValueOnce({
        messages: [rawMessage({ platformId: "message-1" })],
        cursor: { channelIndex: 0, before: "message-1" },
        done: false,
      })
      .mockResolvedValueOnce({
        messages: [rawMessage({ platformId: "message-2" })],
        cursor: { channelIndex: 1 },
        done: true,
      });

    mockRepository.saveMessagesBatch
      .mockRejectedValueOnce(new Error("connection lost"))
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        messagesCreated: 1,
      });

    const result = await importMessages.execute(input);

    expect(mockFetcher.fetchNextMessageBatch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(false);
    expect(result.message).toContain("lote(s) 1");
    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 0,
      failed: 1,
    });
    expect(mockLogger.logToConsole).toHaveBeenCalledWith(
      "ERROR",
      "USECASE",
      "HISTORICAL_SYNC",
      expect.stringContaining("lote 1 falhou (mensagens: message-1)"),
    );
  });

  it("should handle fetcher errors and report failure", async () => {
    mockFetcher.fetchNextMessageBatch.mockRejectedValue(
      new Error("Discord API unavailable"),
    );

    const result = await importMessages.execute(input);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Discord API unavailable");
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
    expect(mockLogger.logToConsole).toHaveBeenCalledWith(
      "ERROR",
      "USECASE",
      "HISTORICAL_SYNC",
      expect.stringContaining("Discord API unavailable"),
    );
  });
});
