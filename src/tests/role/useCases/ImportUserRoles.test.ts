import { ImportUserRoles } from "@domain/useCases/role/ImportUserRoles";
import {
  IDiscordHistoryFetcher,
  RawHistoricalUserRoleAssignment,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import { ILoggerService } from "@services/ILogger";

describe("ImportUserRoles", () => {
  let importUserRoles: ImportUserRoles;
  let mockFetcher: jest.Mocked<IDiscordHistoryFetcher>;
  let mockRepository: jest.Mocked<IHistoricalImportRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const rawAssignment = (
    overrides: Partial<RawHistoricalUserRoleAssignment> = {},
  ): RawHistoricalUserRoleAssignment => ({
    userId: "user-1",
    username: "TestUser",
    userGlobalName: null,
    userBot: false,
    roleId: "role-1",
    roleName: "Member",
    rolePlatformCreatedAt: new Date("2022-01-01"),
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

    importUserRoles = new ImportUserRoles(
      mockFetcher,
      mockRepository,
      mockLogger,
    );
  });

  const input = { batchSize: 1 };

  it("should fetch once and save assignments chunked by batchSize", async () => {
    mockFetcher.fetchGuildMemberRoles.mockResolvedValue([
      rawAssignment({ userId: "user-1", roleId: "role-1" }),
      rawAssignment({ userId: "user-2", roleId: "role-2" }),
    ]);
    mockRepository.saveUserRolesBatch.mockResolvedValue({
      usersUpserted: 1,
      rolesUpserted: 1,
      assignmentsCreated: 1,
    });

    const result = await importUserRoles.execute(input);

    expect(mockFetcher.fetchGuildMemberRoles).toHaveBeenCalledTimes(1);
    expect(mockRepository.saveUserRolesBatch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fetched: 2,
      created: 2,
      skipped: 0,
      failed: 0,
    });
  });

  it("should build unique users/roles and map assignments", async () => {
    mockFetcher.fetchGuildMemberRoles.mockResolvedValue([
      rawAssignment({ userId: "user-1", roleId: "role-1" }),
      rawAssignment({ userId: "user-1", roleId: "role-2", roleName: "Admin" }),
    ]);
    mockRepository.saveUserRolesBatch.mockResolvedValue({
      usersUpserted: 1,
      rolesUpserted: 2,
      assignmentsCreated: 2,
    });

    await importUserRoles.execute({ batchSize: 100 });

    expect(mockRepository.saveUserRolesBatch).toHaveBeenCalledWith({
      users: [
        {
          platformId: "user-1",
          username: "TestUser",
          bot: false,
          status: 1,
          globalName: null,
        },
      ],
      roles: [
        {
          platformId: "role-1",
          name: "Member",
          platformCreatedAt: new Date("2022-01-01"),
        },
        {
          platformId: "role-2",
          name: "Admin",
          platformCreatedAt: new Date("2022-01-01"),
        },
      ],
      assignments: [
        { userPlatformId: "user-1", rolePlatformId: "role-1" },
        { userPlatformId: "user-1", rolePlatformId: "role-2" },
      ],
    });
  });

  it("should return zeroed totals when no assignments are found (member with only @everyone)", async () => {
    mockFetcher.fetchGuildMemberRoles.mockResolvedValue([]);

    const result = await importUserRoles.execute(input);

    expect(mockRepository.saveUserRolesBatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("should count skipped assignments when repository creates fewer than fetched (already assigned)", async () => {
    mockFetcher.fetchGuildMemberRoles.mockResolvedValue([
      rawAssignment({ userId: "user-1", roleId: "role-1" }),
      rawAssignment({ userId: "user-2", roleId: "role-2" }),
    ]);
    mockRepository.saveUserRolesBatch.mockResolvedValue({
      usersUpserted: 2,
      rolesUpserted: 2,
      assignmentsCreated: 1,
    });

    const result = await importUserRoles.execute({ batchSize: 100 });

    expect(result.data).toEqual({
      fetched: 2,
      created: 1,
      skipped: 1,
      failed: 0,
    });
  });

  it("should invoke onProgress once per batch", async () => {
    const onProgress = jest.fn();
    mockFetcher.fetchGuildMemberRoles.mockResolvedValue([
      rawAssignment({ userId: "user-1", roleId: "role-1" }),
      rawAssignment({ userId: "user-2", roleId: "role-2" }),
    ]);
    mockRepository.saveUserRolesBatch.mockResolvedValue({
      usersUpserted: 1,
      rolesUpserted: 1,
      assignmentsCreated: 1,
    });

    await importUserRoles.execute({ ...input, onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, {
      batchNumber: 1,
      fetched: 2,
      created: 1,
    });
  });

  it("should handle fetcher errors and report failure", async () => {
    mockFetcher.fetchGuildMemberRoles.mockRejectedValue(
      new Error("Discord API unavailable"),
    );

    const result = await importUserRoles.execute(input);

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
