import { HistoricalImportRepository } from "@infra/repositories/HistoricalImportRepository";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { AudioEventEntity } from "@entities/AudioEvent";
import { UserStatus } from "@type/UserStatusEnum";

describe("HistoricalImportRepository", () => {
  let repository: HistoricalImportRepository;
  let mockLogger: ILoggerService;

  const channel = (
    overrides: Partial<Omit<ChannelEntity, "id">> = {},
  ): Omit<ChannelEntity, "id"> => ({
    platformId: "hist-channel-1",
    name: "hist-channel",
    url: "https://discord.com/channels/1/hist-channel-1",
    createdAt: new Date("2024-01-01"),
    ...overrides,
  });

  const user = (
    overrides: Partial<Omit<UserEntity, "id">> = {},
  ): Omit<UserEntity, "id"> => ({
    platformId: "hist-user-1",
    username: "HistUser",
    bot: false,
    status: UserStatus.ACTIVE,
    globalName: null,
    joinedAt: null,
    platformCreatedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    mockLogger = { logToConsole: jest.fn(), logToDatabase: jest.fn() };
    repository = new HistoricalImportRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
  });

  describe("saveMessagesBatch", () => {
    it("should upsert channels/users and create messages transactionally", async () => {
      const c = channel();
      const u = user();
      const messages: Omit<MessageEntity, "id">[] = [
        {
          channel: { id: 0, ...c },
          user: { id: 0, ...u },
          messageReactions: [],
          platformId: "hist-message-1",
          platformCreatedAt: new Date("2024-01-05"),
          isDeleted: false,
        },
      ];

      const result = await repository.saveMessagesBatch({
        channels: [c],
        users: [u],
        messages,
      });

      expect(result).toEqual({
        channelsUpserted: 1,
        usersUpserted: 1,
        messagesCreated: 1,
      });

      const persistedMessage = await jestPrisma.client.message.findFirst({
        where: { platform_id: "hist-message-1" },
      });
      expect(persistedMessage).not.toBeNull();
      expect(persistedMessage?.channel_id).toBe(c.platformId);
      expect(persistedMessage?.user_id).toBe(u.platformId);

      const persistedChannel = await jestPrisma.client.channel.findUnique({
        where: { platform_id: c.platformId },
      });
      expect(persistedChannel).not.toBeNull();
    });

    it("should skip duplicate messages on re-run (idempotent)", async () => {
      const c = channel();
      const u = user();
      const messages: Omit<MessageEntity, "id">[] = [
        {
          channel: { id: 0, ...c },
          user: { id: 0, ...u },
          messageReactions: [],
          platformId: "hist-message-2",
          platformCreatedAt: new Date("2024-01-05"),
          isDeleted: false,
        },
      ];

      await repository.saveMessagesBatch({
        channels: [c],
        users: [u],
        messages,
      });
      const secondRun = await repository.saveMessagesBatch({
        channels: [c],
        users: [u],
        messages,
      });

      expect(secondRun.messagesCreated).toBe(0);

      const count = await jestPrisma.client.message.count({
        where: { platform_id: "hist-message-2" },
      });
      expect(count).toBe(1);
    });

    it("should log and rethrow when the transaction fails", async () => {
      const oversizedChannel = channel({ name: "x".repeat(300) });

      let caughtError: unknown;
      await repository
        .saveMessagesBatch({
          channels: [oversizedChannel],
          users: [],
          messages: [],
        })
        .catch((error) => {
          caughtError = error;
        });

      expect(caughtError).toBeDefined();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "REPOSITORY",
        "HISTORICAL_SYNC",
        expect.stringContaining("saveMessagesBatch"),
      );
    });
  });

  describe("saveAudioEventsBatch", () => {
    it("should upsert channels/users, create event status if needed, and create audio events", async () => {
      const c = channel({ platformId: "hist-channel-2" });
      const u = user({ platformId: "hist-user-2" });
      const audioEvents: Omit<AudioEventEntity, "id" | "createdAt">[] = [
        {
          platformId: "hist-event-1",
          name: "Hist Event",
          statusId: "hist-status",
          startAt: new Date("2024-01-05"),
          endAt: new Date("2024-01-05T01:00:00.000Z"),
          userCount: 3,
          description: "desc",
          image: undefined,
          channel: { id: 0, ...c },
          creator: { id: 0, ...u },
        },
      ];

      const result = await repository.saveAudioEventsBatch({
        channels: [c],
        users: [u],
        audioEvents,
      });

      expect(result).toEqual({
        channelsUpserted: 1,
        usersUpserted: 1,
        audioEventsCreated: 1,
      });

      const persistedEvent = await jestPrisma.client.audioEvent.findFirst({
        where: { platform_id: "hist-event-1" },
      });
      expect(persistedEvent).not.toBeNull();
      expect(persistedEvent?.status_id).toBe("hist-status");

      const status = await jestPrisma.client.eventStatus.findUnique({
        where: { platform_id: "hist-status" },
      });
      expect(status).not.toBeNull();
    });

    it("should update an existing audio event on re-run instead of failing (idempotent)", async () => {
      const c = channel({ platformId: "hist-channel-3" });
      const u = user({ platformId: "hist-user-3" });
      const baseEvent: Omit<AudioEventEntity, "id" | "createdAt"> = {
        platformId: "hist-event-2",
        name: "Hist Event",
        statusId: "hist-status",
        startAt: new Date("2024-01-05"),
        endAt: null,
        userCount: 3,
        description: "desc",
        image: undefined,
        channel: { id: 0, ...c },
        creator: { id: 0, ...u },
      };

      await repository.saveAudioEventsBatch({
        channels: [c],
        users: [u],
        audioEvents: [baseEvent],
      });

      const updatedResult = await repository.saveAudioEventsBatch({
        channels: [c],
        users: [u],
        audioEvents: [{ ...baseEvent, userCount: 10 }],
      });

      expect(updatedResult.audioEventsCreated).toBe(1);

      const persistedEvent = await jestPrisma.client.audioEvent.findFirst({
        where: { platform_id: "hist-event-2" },
      });
      expect(persistedEvent?.user_count).toBe(10);

      const count = await jestPrisma.client.audioEvent.count({
        where: { platform_id: "hist-event-2" },
      });
      expect(count).toBe(1);
    });

    it("should log and rethrow when connecting to a non-existent channel/creator fails", async () => {
      const audioEvents: Omit<AudioEventEntity, "id" | "createdAt">[] = [
        {
          platformId: "hist-event-invalid",
          name: "Hist Event",
          statusId: "hist-status",
          startAt: new Date("2024-01-05"),
          endAt: null,
          userCount: 0,
          channel: {
            id: 0,
            ...channel({ platformId: "hist-channel-missing" }),
          },
          creator: { id: 0, ...user({ platformId: "hist-user-missing" }) },
        },
      ];

      let caughtError: unknown;
      await repository
        .saveAudioEventsBatch({
          channels: [],
          users: [],
          audioEvents,
        })
        .catch((error) => {
          caughtError = error;
        });

      expect(caughtError).toBeDefined();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "REPOSITORY",
        "HISTORICAL_SYNC",
        expect.stringContaining("saveAudioEventsBatch"),
      );
    });
  });
});
