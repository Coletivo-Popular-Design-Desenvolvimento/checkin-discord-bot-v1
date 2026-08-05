import { ImportMessageReactions } from "@domain/useCases/messageReaction/ImportMessageReactions";
import {
  IDiscordHistoryFetcher,
  RawHistoricalMessageReaction,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportMessageReactions", () => {
  let importMessageReactions: ImportMessageReactions;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawReaction = (
    overrides: Partial<RawHistoricalMessageReaction> = {},
  ): RawHistoricalMessageReaction => ({
    messageId: "message-1",
    channelId: "channel-1",
    channelName: "general",
    channelUrl: "https://discord.com/channels/1/channel-1",
    messagePlatformCreatedAt: new Date("2024-01-01"),
    userId: "user-1",
    username: "TestUser",
    userGlobalName: null,
    userBot: false,
    reactionEmoji: "👍",
    ...overrides,
  });

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

    importMessageReactions = new ImportMessageReactions(
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

  it("should import a single batch of reactions", async () => {
    mockFetcher.fetchNextMessageReactionsBatch.mockResolvedValue({
      reactions: [rawReaction()],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessageReactionsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      reactionsCreated: 1,
    });

    const result = await importMessageReactions.execute(input);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 1,
      created: 1,
      skipped: 0,
      failed: 0,
    });
    expect(mockRepository.saveMessageReactionsBatch).toHaveBeenCalledWith({
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
      reactions: [
        {
          userPlatformId: "user-1",
          messagePlatformId: "message-1",
          channelPlatformId: "channel-1",
          reactionEmoji: "👍",
          reactedAt: new Date("2024-01-01"),
        },
      ],
    });
  });

  it("should loop across multiple batches until done", async () => {
    mockFetcher.fetchNextMessageReactionsBatch
      .mockResolvedValueOnce({
        reactions: [rawReaction({ messageId: "message-1" })],
        cursor: { channelIndex: 0, before: "message-1" },
        done: false,
      })
      .mockResolvedValueOnce({
        reactions: [rawReaction({ messageId: "message-2" })],
        cursor: { channelIndex: 1 },
        done: true,
      });

    mockRepository.saveMessageReactionsBatch
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        reactionsCreated: 1,
      })
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        reactionsCreated: 1,
      });

    const result = await importMessageReactions.execute(input);

    expect(mockFetcher.fetchNextMessageReactionsBatch).toHaveBeenCalledTimes(2);
    expect(mockFetcher.fetchNextMessageReactionsBatch).toHaveBeenNthCalledWith(
      2,
      {
        startDate: input.startDate,
        endDate: input.endDate,
        batchSize: input.batchSize,
        cursor: { channelIndex: 0, before: "message-1" },
      },
    );
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should skip saving when a batch has no reactions", async () => {
    mockFetcher.fetchNextMessageReactionsBatch.mockResolvedValue({
      reactions: [],
      cursor: { channelIndex: 5 },
      done: true,
    });

    const result = await importMessageReactions.execute(input);

    expect(mockRepository.saveMessageReactionsBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should count skipped reactions when repository creates fewer than fetched (duplicate)", async () => {
    mockFetcher.fetchNextMessageReactionsBatch.mockResolvedValue({
      reactions: [
        rawReaction({ userId: "user-1", reactionEmoji: "👍" }),
        rawReaction({ userId: "user-2", reactionEmoji: "👍" }),
      ],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessageReactionsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 2,
      reactionsCreated: 1,
    });

    const result = await importMessageReactions.execute(input);

    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("should discard bot reactions upstream and only forward non-bot users to the repository", async () => {
    mockFetcher.fetchNextMessageReactionsBatch.mockResolvedValue({
      reactions: [rawReaction({ userId: "user-1", userBot: false })],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessageReactionsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      reactionsCreated: 1,
    });

    await importMessageReactions.execute(input);

    const callArg = mockRepository.saveMessageReactionsBatch.mock.calls[0][0];
    expect(callArg.users.every((user) => user.bot === false)).toBe(true);
  });

  it("should invoke onProgress once per non-empty batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchNextMessageReactionsBatch.mockResolvedValue({
      reactions: [rawReaction()],
      cursor: { channelIndex: 1 },
      done: true,
    });
    mockRepository.saveMessageReactionsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      reactionsCreated: 1,
    });

    await importMessageReactions.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledWith({
      batchNumber: 1,
      fetched: 1,
      created: 1,
    });
  });

  it("should log the failed batch (with referenced message ids) and continue to the next one when saveMessageReactionsBatch throws", async () => {
    mockFetcher.fetchNextMessageReactionsBatch
      .mockResolvedValueOnce({
        reactions: [rawReaction({ messageId: "message-orphan" })],
        cursor: { channelIndex: 0, before: "message-orphan" },
        done: false,
      })
      .mockResolvedValueOnce({
        reactions: [rawReaction({ messageId: "message-2" })],
        cursor: { channelIndex: 1 },
        done: true,
      });

    mockRepository.saveMessageReactionsBatch
      .mockRejectedValueOnce(
        new Error("referenced message(s) not found: message-orphan"),
      )
      .mockResolvedValueOnce({
        channelsUpserted: 1,
        usersUpserted: 1,
        reactionsCreated: 1,
      });

    const result = await importMessageReactions.execute(input);

    expect(mockFetcher.fetchNextMessageReactionsBatch).toHaveBeenCalledTimes(2);
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
      expect.stringContaining(
        "lote 1 falhou (mensagens referenciadas: message-orphan)",
      ),
    );
  });

  it("should handle fetcher errors and report failure isolated from other batches", async () => {
    mockFetcher.fetchNextMessageReactionsBatch.mockRejectedValue(
      new Error("message not persisted"),
    );

    const result = await importMessageReactions.execute(input);

    expect(result.success).toBe(false);
    expect(result.message).toBe("message not persisted");
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
      expect.stringContaining("message not persisted"),
    );
  });
});
