import { ChannelEntity } from "@domain/entities/Channel";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";
import { MessageRepository } from "@infra/repositories/MessageRepository";
import { UserRepository } from "@infra/repositories/UserRepository";
import {
  createMockChannelEntity,
  createMockMessageEntity,
  createMockUserEntity,
} from "@tests/config/constants";

describe("ChannelRepository", () => {
  let channelRepository: ChannelRepository;
  let mockLogger: ILoggerService;
  let channelToBeFound: ChannelEntity;
  let testId: string;
  let channelSequence: number;

  const buildChannel = (
    suffix: string,
    overrides: Partial<ChannelEntity> = {},
  ): ChannelEntity =>
    createMockChannelEntity({
      platformId: `channel-${testId}-${suffix}`,
      name: `Channel ${suffix}`,
      url: `https://discord.test/channels/${suffix}`,
      user: [],
      message: [],
      messageReaction: [],
      ...overrides,
    });

  const createChannel = async (
    overrides: Partial<ChannelEntity> = {},
  ): Promise<ChannelEntity> => {
    channelSequence += 1;
    const channel = buildChannel(String(channelSequence), overrides);
    const createdChannel = await channelRepository.create(channel);

    return createdChannel;
  };

  beforeEach(async () => {
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    channelRepository = new ChannelRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    testId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    channelSequence = 0;
    channelToBeFound = await createChannel();
  });

  describe("findById", () => {
    it("should return a channel by id", async () => {
      const channel = await channelRepository.findById(channelToBeFound.id);

      expect(channel).toMatchObject({
        id: channelToBeFound.id,
        platformId: channelToBeFound.platformId,
        name: channelToBeFound.name,
        url: channelToBeFound.url,
        user: [],
        message: [],
        messageReaction: [],
      });
    });

    it("should return null if the channel is not found", async () => {
      const channel = await channelRepository.findById(
        channelToBeFound.id + 1_000_000,
      );

      expect(channel).toBeNull();
    });

    it("should log an error when the id is invalid", async () => {
      const channel = await channelRepository.findById(Number.NaN);

      expect(channel).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        expect.stringContaining("findById |"),
      );
    });
  });

  describe("findByPlatformId", () => {
    it("should return a channel by Discord id", async () => {
      const channel = await channelRepository.findByPlatformId(
        channelToBeFound.platformId,
      );

      expect(channel).toMatchObject({
        id: channelToBeFound.id,
        platformId: channelToBeFound.platformId,
        name: channelToBeFound.name,
        url: channelToBeFound.url,
      });
    });

    it("should return null if the Discord id is not found", async () => {
      const channel = await channelRepository.findByPlatformId(
        `missing-${testId}`,
      );

      expect(channel).toBeNull();
    });
  });

  describe("create", () => {
    it("should persist and return a new channel", async () => {
      const createdChannel = await createChannel({
        name: "New channel",
        url: "https://discord.test/channels/new",
      });

      const persistedChannel = await channelRepository.findById(
        createdChannel.id,
      );

      expect(persistedChannel).toMatchObject({
        id: createdChannel.id,
        platformId: createdChannel.platformId,
        name: "New channel",
        url: "https://discord.test/channels/new",
      });
    });

    it("should persist users and existing messages", async () => {
      const prismaService = new PrismaService(jestPrisma.client);
      const userRepository = new UserRepository(prismaService, mockLogger);
      const messageRepository = new MessageRepository(
        prismaService,
        mockLogger,
      );
      const user = await userRepository.create(
        createMockUserEntity({ platformId: `user-${testId}` }),
      );
      const message = await messageRepository.create(
        createMockMessageEntity({
          platformId: `message-${testId}`,
          channel: channelToBeFound,
          user,
        }),
      );

      const createdChannel = await channelRepository.create(
        buildChannel("relations", {
          user: [user],
          message: [message],
        }),
      );

      expect(createdChannel.user).toEqual([
        expect.objectContaining({ platformId: user.platformId }),
      ]);
      expect(createdChannel.message).toEqual([
        expect.objectContaining({ platformId: message.platformId }),
      ]);
    });
  });

  describe("createMany", () => {
    it("should persist multiple channels and return the count", async () => {
      const channels = [buildChannel("many-1"), buildChannel("many-2")];

      const count = await channelRepository.createMany(channels);

      expect(count).toBe(channels.length);
      await expect(
        channelRepository.findByPlatformId(channels[0].platformId),
      ).resolves.toMatchObject({ platformId: channels[0].platformId });
      await expect(
        channelRepository.findByPlatformId(channels[1].platformId),
      ).resolves.toMatchObject({ platformId: channels[1].platformId });
    });

    it("should return zero and log when a channel is invalid", async () => {
      const invalidChannel = buildChannel("invalid");
      Object.assign(invalidChannel, {
        platformId: 123,
      });

      const count = await channelRepository.createMany([invalidChannel]);

      expect(count).toBe(0);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        expect.stringContaining("createMany |"),
      );
    });
  });

  describe("listAll", () => {
    it("should return persisted channels", async () => {
      const channels = await channelRepository.listAll();
      const persistedChannel = channels.find(
        (channel) => channel.platformId === channelToBeFound.platformId,
      );

      expect(persistedChannel).toMatchObject({
        id: channelToBeFound.id,
        platformId: channelToBeFound.platformId,
        name: channelToBeFound.name,
        url: channelToBeFound.url,
        user: [],
        message: [],
        messageReaction: [],
      });
    });

    it("should respect the provided limit", async () => {
      await createChannel();

      const channels = await channelRepository.listAll(1);

      expect(channels).toHaveLength(1);
    });
  });

  describe("updateById", () => {
    it("should update a channel by id", async () => {
      const channel = await channelRepository.updateById(channelToBeFound.id, {
        name: "Updated channel",
        url: "https://discord.test/channels/updated",
      });

      expect(channel).toMatchObject({
        id: channelToBeFound.id,
        platformId: channelToBeFound.platformId,
        name: "Updated channel",
        url: "https://discord.test/channels/updated",
      });
    });

    it("should log and return undefined if the channel is not found", async () => {
      const channel = await channelRepository.updateById(
        channelToBeFound.id + 1_000_000,
        {
          name: "Missing channel",
        },
      );

      expect(channel).toBeUndefined();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        expect.stringContaining("updateById |"),
      );
    });
  });

  describe("deleteById", () => {
    it("should delete a channel by id and return true", async () => {
      const deleted = await channelRepository.deleteById(channelToBeFound.id);

      expect(deleted).toBe(true);
      await expect(
        channelRepository.findById(channelToBeFound.id),
      ).resolves.toBeNull();
    });

    it("should log and return undefined if the channel is not found", async () => {
      const deleted = await channelRepository.deleteById(
        channelToBeFound.id + 1_000_000,
      );

      expect(deleted).toBeUndefined();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        expect.stringContaining("deleteById |"),
      );
    });
  });
});
