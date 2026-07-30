import { ImportUsers } from "@domain/useCases/user/ImportUsers";
import {
  IDiscordHistoryFetcher,
  RawHistoricalUser,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportUsers", () => {
  let importUsers: ImportUsers;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawUser = (
    overrides: Partial<RawHistoricalUser> = {},
  ): RawHistoricalUser => ({
    platformId: "user-1",
    username: "TestUser",
    globalName: null,
    bot: false,
    platformCreatedAt: new Date("2023-01-01"),
    joinedAt: new Date("2023-06-01"),
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

    importUsers = new ImportUsers(mockFetcher, mockRepository, mockLogger);
  });

  const input = { batchSize: 1 };

  it("should fetch once and save users chunked by batchSize", async () => {
    mockFetcher.fetchGuildMembers.mockResolvedValue([
      rawUser({ platformId: "user-1" }),
      rawUser({ platformId: "user-2" }),
    ]);
    mockRepository.saveUsersBatch.mockResolvedValue({ usersUpserted: 1 });

    const result = await importUsers.execute(input);

    expect(mockFetcher.fetchGuildMembers).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveUsersBatch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should map raw users to user entities", async () => {
    mockFetcher.fetchGuildMembers.mockResolvedValue([rawUser()]);
    mockRepository.saveUsersBatch.mockResolvedValue({ usersUpserted: 1 });

    await importUsers.execute({ batchSize: 100 });

    expect(mockRepository.saveUsersBatch).toHaveBeenCalledWith([
      {
        platformId: "user-1",
        username: "TestUser",
        bot: false,
        status: 1,
        globalName: null,
        platformCreatedAt: new Date("2023-01-01"),
        joinedAt: new Date("2023-06-01"),
      },
    ]);
  });

  it("should return zeroed totals when no members are found", async () => {
    mockFetcher.fetchGuildMembers.mockResolvedValue([]);

    const result = await importUsers.execute(input);

    expect(mockRepository.saveUsersBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should count skipped users when repository upserts fewer than fetched", async () => {
    mockFetcher.fetchGuildMembers.mockResolvedValue([
      rawUser({ platformId: "user-1" }),
      rawUser({ platformId: "user-2" }),
    ]);
    mockRepository.saveUsersBatch.mockResolvedValue({ usersUpserted: 1 });

    const result = await importUsers.execute({ batchSize: 100 });

    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("should invoke onProgress once per batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchGuildMembers.mockResolvedValue([
      rawUser({ platformId: "user-1" }),
      rawUser({ platformId: "user-2" }),
    ]);
    mockRepository.saveUsersBatch.mockResolvedValue({ usersUpserted: 1 });

    await importUsers.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      batchNumber: 1,
      fetched: 2,
      created: 1,
    });
  });

  it("should handle fetcher errors and report failure", async () => {
    mockFetcher.fetchGuildMembers.mockRejectedValue(
      new Error("Missing Server Members Intent"),
    );

    const result = await importUsers.execute(input);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Missing Server Members Intent");
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
      expect.stringContaining("Missing Server Members Intent"),
    );
  });
});
