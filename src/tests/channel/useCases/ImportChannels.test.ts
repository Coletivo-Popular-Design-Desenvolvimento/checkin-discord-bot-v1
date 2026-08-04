import { ImportChannels } from "@domain/useCases/channel/ImportChannels";
import {
  IDiscordHistoryFetcher,
  RawHistoricalChannel,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportChannels", () => {
  let importChannels: ImportChannels;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawChannel = (
    overrides: Partial<RawHistoricalChannel> = {},
  ): RawHistoricalChannel => ({
    platformId: "channel-1",
    name: "general",
    url: "https://discord.com/channels/1/channel-1",
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

    importChannels = new ImportChannels(
      mockFetcher,
      mockRepository,
      mockLogger,
    );
  });

  const input = { batchSize: 1 };

  it("should fetch once and save channels chunked by batchSize", async () => {
    mockFetcher.fetchGuildChannels.mockResolvedValue([
      rawChannel({ platformId: "channel-1" }),
      rawChannel({ platformId: "channel-2" }),
    ]);
    mockRepository.saveChannelsBatch.mockResolvedValue({
      channelsUpserted: 1,
    });

    const result = await importChannels.execute(input);

    expect(mockFetcher.fetchGuildChannels).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveChannelsBatch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should map raw channels to channel entities", async () => {
    mockFetcher.fetchGuildChannels.mockResolvedValue([rawChannel()]);
    mockRepository.saveChannelsBatch.mockResolvedValue({
      channelsUpserted: 1,
    });

    await importChannels.execute({ batchSize: 100 });

    expect(mockRepository.saveChannelsBatch).toHaveBeenCalledWith([
      {
        platformId: "channel-1",
        name: "general",
        url: "https://discord.com/channels/1/channel-1",
        createdAt: expect.any(Date),
      },
    ]);
  });

  it("should return zeroed totals when no channels are found", async () => {
    mockFetcher.fetchGuildChannels.mockResolvedValue([]);

    const result = await importChannels.execute(input);

    expect(mockRepository.saveChannelsBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should count skipped channels when repository upserts fewer than fetched", async () => {
    mockFetcher.fetchGuildChannels.mockResolvedValue([
      rawChannel({ platformId: "channel-1" }),
      rawChannel({ platformId: "channel-2" }),
    ]);
    mockRepository.saveChannelsBatch.mockResolvedValue({
      channelsUpserted: 1,
    });

    const result = await importChannels.execute({ batchSize: 100 });

    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("should invoke onProgress once per batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchGuildChannels.mockResolvedValue([
      rawChannel({ platformId: "channel-1" }),
      rawChannel({ platformId: "channel-2" }),
    ]);
    mockRepository.saveChannelsBatch.mockResolvedValue({
      channelsUpserted: 1,
    });

    await importChannels.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      batchNumber: 1,
      fetched: 2,
      created: 1,
    });
  });

  it("should handle fetcher errors and report failure", async () => {
    mockFetcher.fetchGuildChannels.mockRejectedValue(
      new Error("Discord API unavailable"),
    );

    const result = await importChannels.execute(input);

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
