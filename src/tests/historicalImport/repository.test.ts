import { HistoricalImportRepository } from "@infra/repositories/HistoricalImportRepository";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { AudioEventEntity } from "@entities/AudioEvent";
import { RoleEntity } from "@entities/Role";
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

  const role = (
    overrides: Partial<Omit<RoleEntity, "id" | "createdAt" | "user">> = {},
  ): Omit<RoleEntity, "id" | "createdAt" | "user"> => ({
    platformId: "hist-role-1",
    name: "HistRole",
    platformCreatedAt: new Date("2024-01-01"),
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

  describe("saveUsersBatch", () => {
    it("should create a new user", async () => {
      const u = user({ platformId: "hist-user-4", username: "NewHistUser" });

      const result = await repository.saveUsersBatch([u]);

      expect(result).toEqual({ usersUpserted: 1 });

      const persistedUser = await jestPrisma.client.user.findUnique({
        where: { platform_id: u.platformId },
      });
      expect(persistedUser).not.toBeNull();
      expect(persistedUser?.username).toBe("NewHistUser");
    });

    it("should update an existing user on re-run without duplicating (idempotent)", async () => {
      const u = user({ platformId: "hist-user-5", username: "OriginalName" });

      await repository.saveUsersBatch([u]);
      await repository.saveUsersBatch([{ ...u, username: "UpdatedName" }]);

      const persistedUser = await jestPrisma.client.user.findUnique({
        where: { platform_id: u.platformId },
      });
      expect(persistedUser?.username).toBe("UpdatedName");

      const count = await jestPrisma.client.user.count({
        where: { platform_id: u.platformId },
      });
      expect(count).toBe(1);
    });
  });

  describe("saveChannelsBatch", () => {
    it("should create a new channel", async () => {
      const c = channel({
        platformId: "hist-channel-4",
        name: "NewHistChannel",
      });

      const result = await repository.saveChannelsBatch([c]);

      expect(result).toEqual({ channelsUpserted: 1 });

      const persistedChannel = await jestPrisma.client.channel.findUnique({
        where: { platform_id: c.platformId },
      });
      expect(persistedChannel).not.toBeNull();
      expect(persistedChannel?.name).toBe("NewHistChannel");
    });

    it("should update an existing channel on re-run without duplicating (idempotent)", async () => {
      const c = channel({
        platformId: "hist-channel-5",
        name: "OriginalName",
      });

      await repository.saveChannelsBatch([c]);
      await repository.saveChannelsBatch([{ ...c, name: "UpdatedName" }]);

      const persistedChannel = await jestPrisma.client.channel.findUnique({
        where: { platform_id: c.platformId },
      });
      expect(persistedChannel?.name).toBe("UpdatedName");

      const count = await jestPrisma.client.channel.count({
        where: { platform_id: c.platformId },
      });
      expect(count).toBe(1);
    });
  });

  describe("saveUserRolesBatch", () => {
    it("should upsert users/roles and create the assignment", async () => {
      const u = user({ platformId: "hist-user-6" });
      const r = role({ platformId: "hist-role-1" });

      const result = await repository.saveUserRolesBatch({
        users: [u],
        roles: [r],
        assignments: [
          { userPlatformId: u.platformId, rolePlatformId: r.platformId },
        ],
      });

      expect(result).toEqual({
        usersUpserted: 1,
        rolesUpserted: 1,
        assignmentsCreated: 1,
      });

      const persistedAssignment = await jestPrisma.client.userRole.findUnique({
        where: {
          user_platform_id_role_platform_id: {
            user_platform_id: u.platformId,
            role_platform_id: r.platformId,
          },
        },
      });
      expect(persistedAssignment).not.toBeNull();
    });

    it("should skip duplicate assignments on re-run (idempotent)", async () => {
      const u = user({ platformId: "hist-user-7" });
      const r = role({ platformId: "hist-role-2" });
      const assignments = [
        { userPlatformId: u.platformId, rolePlatformId: r.platformId },
      ];

      await repository.saveUserRolesBatch({
        users: [u],
        roles: [r],
        assignments,
      });
      const secondRun = await repository.saveUserRolesBatch({
        users: [u],
        roles: [r],
        assignments,
      });

      expect(secondRun.assignmentsCreated).toBe(0);

      const count = await jestPrisma.client.userRole.count({
        where: {
          user_platform_id: u.platformId,
          role_platform_id: r.platformId,
        },
      });
      expect(count).toBe(1);
    });

    it("should not remove an existing assignment absent from the latest batch", async () => {
      const u = user({ platformId: "hist-user-8" });
      const oldRole = role({ platformId: "hist-role-3", name: "OldRole" });
      const newRole = role({ platformId: "hist-role-4", name: "NewRole" });

      await repository.saveUserRolesBatch({
        users: [u],
        roles: [oldRole],
        assignments: [
          { userPlatformId: u.platformId, rolePlatformId: oldRole.platformId },
        ],
      });

      await repository.saveUserRolesBatch({
        users: [u],
        roles: [newRole],
        assignments: [
          { userPlatformId: u.platformId, rolePlatformId: newRole.platformId },
        ],
      });

      const oldAssignment = await jestPrisma.client.userRole.findUnique({
        where: {
          user_platform_id_role_platform_id: {
            user_platform_id: u.platformId,
            role_platform_id: oldRole.platformId,
          },
        },
      });
      expect(oldAssignment).not.toBeNull();

      const newAssignment = await jestPrisma.client.userRole.findUnique({
        where: {
          user_platform_id_role_platform_id: {
            user_platform_id: u.platformId,
            role_platform_id: newRole.platformId,
          },
        },
      });
      expect(newAssignment).not.toBeNull();
    });
  });

  describe("saveMessageReactionsBatch", () => {
    it("should upsert channels/users and create the reaction", async () => {
      const c = channel({ platformId: "hist-channel-6" });
      const authorUser = user({ platformId: "hist-user-9" });
      const reactorUser = user({ platformId: "hist-user-10" });
      const messages: Omit<MessageEntity, "id">[] = [
        {
          channel: { id: 0, ...c },
          user: { id: 0, ...authorUser },
          messageReactions: [],
          platformId: "hist-message-reacted-1",
          platformCreatedAt: new Date("2024-01-05"),
          isDeleted: false,
        },
      ];
      await repository.saveMessagesBatch({
        channels: [c],
        users: [authorUser],
        messages,
      });

      const result = await repository.saveMessageReactionsBatch({
        channels: [c],
        users: [reactorUser],
        reactions: [
          {
            userPlatformId: reactorUser.platformId,
            messagePlatformId: "hist-message-reacted-1",
            channelPlatformId: c.platformId,
            reactionEmoji: "👍",
            reactedAt: new Date("2024-01-05"),
          },
        ],
      });

      expect(result).toEqual({
        channelsUpserted: 1,
        usersUpserted: 1,
        reactionsCreated: 1,
      });

      const persistedReaction =
        await jestPrisma.client.messageReaction.findFirst({
          where: {
            user_id: reactorUser.platformId,
            message_id: "hist-message-reacted-1",
          },
        });
      expect(persistedReaction).not.toBeNull();
      expect(persistedReaction?.reaction_emoji).toBe("👍");
    });

    it("should skip duplicate reactions on re-run (idempotent)", async () => {
      const c = channel({ platformId: "hist-channel-7" });
      const authorUser = user({ platformId: "hist-user-11" });
      const reactorUser = user({ platformId: "hist-user-12" });
      const messages: Omit<MessageEntity, "id">[] = [
        {
          channel: { id: 0, ...c },
          user: { id: 0, ...authorUser },
          messageReactions: [],
          platformId: "hist-message-reacted-2",
          platformCreatedAt: new Date("2024-01-05"),
          isDeleted: false,
        },
      ];
      await repository.saveMessagesBatch({
        channels: [c],
        users: [authorUser],
        messages,
      });

      const reactionInput = {
        channels: [c],
        users: [reactorUser],
        reactions: [
          {
            userPlatformId: reactorUser.platformId,
            messagePlatformId: "hist-message-reacted-2",
            channelPlatformId: c.platformId,
            reactionEmoji: "🎉",
            reactedAt: new Date("2024-01-05"),
          },
        ],
      };

      await repository.saveMessageReactionsBatch(reactionInput);
      const secondRun =
        await repository.saveMessageReactionsBatch(reactionInput);

      expect(secondRun.reactionsCreated).toBe(0);

      const count = await jestPrisma.client.messageReaction.count({
        where: {
          user_id: reactorUser.platformId,
          message_id: "hist-message-reacted-2",
          reaction_emoji: "🎉",
        },
      });
      expect(count).toBe(1);
    });

    it("should log and rethrow when the reaction references a non-existent message/user/channel", async () => {
      const c = channel({ platformId: "hist-channel-8" });
      const reactorUser = user({ platformId: "hist-user-13" });

      let caughtError: unknown;
      await repository
        .saveMessageReactionsBatch({
          channels: [c],
          users: [reactorUser],
          reactions: [
            {
              userPlatformId: reactorUser.platformId,
              messagePlatformId: "hist-message-does-not-exist",
              channelPlatformId: c.platformId,
              reactionEmoji: "👎",
              reactedAt: new Date("2024-01-05"),
            },
          ],
        })
        .catch((error) => {
          caughtError = error;
        });

      expect(caughtError).toBeDefined();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "REPOSITORY",
        "HISTORICAL_SYNC",
        expect.stringContaining("saveMessageReactionsBatch"),
      );
    });
  });
});
