import { ImportAudioEvents } from "@domain/useCases/audioEvent/ImportAudioEvents";
import {
  IDiscordHistoryFetcher,
  RawHistoricalAudioEvent,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportAudioEvents", () => {
  let importAudioEvents: ImportAudioEvents;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawEvent = (
    overrides: Partial<RawHistoricalAudioEvent> = {},
  ): RawHistoricalAudioEvent => ({
    platformId: "event-1",
    name: "Test Event",
    statusId: "completed",
    startAt: new Date("2024-01-01"),
    endAt: new Date("2024-01-01T01:00:00.000Z"),
    userCount: 5,
    description: "desc",
    image: undefined,
    channelId: "channel-1",
    channelName: "voice-general",
    channelUrl: "https://discord.com/channels/1/channel-1",
    creatorId: "creator-1",
    creatorUsername: "Creator",
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

    importAudioEvents = new ImportAudioEvents(
      mockFetcher,
      mockRepository,
      mockLogger,
    );
  });

  const input = {
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-02-01"),
    batchSize: 1,
  };

  it("should fetch once and save events chunked by batchSize", async () => {
    mockFetcher.fetchAudioEventsInRange.mockResolvedValue([
      rawEvent({ platformId: "event-1" }),
      rawEvent({ platformId: "event-2" }),
    ]);
    mockRepository.saveAudioEventsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      audioEventsCreated: 1,
    });

    const result = await importAudioEvents.execute(input);

    expect(mockFetcher.fetchAudioEventsInRange).toHaveBeenCalledTimes(1);
    expect(mockFetcher.fetchAudioEventsInRange).toHaveBeenCalledWith({
      startDate: input.startDate,
      endDate: input.endDate,
    });
    expect(mockRepository.saveAudioEventsBatch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should build unique channels/users and map event fields", async () => {
    mockFetcher.fetchAudioEventsInRange.mockResolvedValue([rawEvent()]);
    mockRepository.saveAudioEventsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      audioEventsCreated: 1,
    });

    await importAudioEvents.execute({ ...input, batchSize: 100 });

    expect(mockRepository.saveAudioEventsBatch).toHaveBeenCalledWith({
      channels: [
        {
          platformId: "channel-1",
          name: "voice-general",
          url: "https://discord.com/channels/1/channel-1",
          createdAt: expect.any(Date),
        },
      ],
      users: [
        {
          platformId: "creator-1",
          username: "Creator",
          bot: false,
          status: 1,
        },
      ],
      audioEvents: [
        expect.objectContaining({
          platformId: "event-1",
          statusId: "completed",
        }),
      ],
    });
  });

  it("should return zeroed totals when no events are found in range", async () => {
    mockFetcher.fetchAudioEventsInRange.mockResolvedValue([]);

    const result = await importAudioEvents.execute(input);

    expect(mockRepository.saveAudioEventsBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should invoke onProgress once per batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchAudioEventsInRange.mockResolvedValue([
      rawEvent({ platformId: "event-1" }),
      rawEvent({ platformId: "event-2" }),
    ]);
    mockRepository.saveAudioEventsBatch.mockResolvedValue({
      channelsUpserted: 1,
      usersUpserted: 1,
      audioEventsCreated: 1,
    });

    await importAudioEvents.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      batchNumber: 1,
      fetched: 2,
      created: 1,
    });
  });

  it("should handle fetcher errors and report failure", async () => {
    mockFetcher.fetchAudioEventsInRange.mockRejectedValue(
      new Error("Discord API unavailable"),
    );

    const result = await importAudioEvents.execute(input);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Discord API unavailable");
    expect(mockLogger.logToConsole).toHaveBeenCalledWith(
      "ERROR",
      "USECASE",
      "HISTORICAL_SYNC",
      expect.stringContaining("Discord API unavailable"),
    );
  });
});
