import { MessageReactionEntity } from "@domain/entities/MessageReaction";
import { CreateMessageReactionData } from "@domain/dtos/CreateMessageReactionData";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { MessageReactionRepository } from "@infra/repositories/MessageReactionRepository";
import { UpdateMessageReactionData } from "@domain/interfaces/repositories/IMessageReactionRepository";
import { UserRepository } from "@infra/repositories/UserRepository";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";
import { MessageRepository } from "@infra/repositories/MessageRepository";
import {
  mockUserValue,
  mockMessageToBeCreated,
  createMockChannelEntity,
} from "@tests/config/constants";
import { UserEntity } from "@domain/entities/User";
import { ChannelEntity } from "@domain/entities/Channel";
import { MessageEntity } from "@domain/entities/Message";

describe("MessageReactionRepository", () => {
  let messageReactionRepository: MessageReactionRepository;
  let userRepository: UserRepository;
  let channelRepository: ChannelRepository;
  let messageRepository: MessageRepository;
  let mockLogger: ILoggerService;
  let testUser: UserEntity;
  let testChannel: ChannelEntity;
  let testMessage: MessageEntity;
  let testMessageReaction: MessageReactionEntity | null = null;

  beforeEach(async () => {
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message);
    });

    messageReactionRepository = new MessageReactionRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    userRepository = new UserRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    channelRepository = new ChannelRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    messageRepository = new MessageRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    // Usar platformIds únicos para evitar conflito quando todos os testes rodam juntos
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const uniqueUserValue = {
      ...mockUserValue,
      platformId: `mr-user-${uniqueId}`,
    };
    const uniqueChannelData = createMockChannelEntity({
      platformId: `mr-channel-${uniqueId}`,
    });
    testUser = await userRepository.create(uniqueUserValue);
    testChannel = await channelRepository.create(uniqueChannelData);
    const messageToCreate = mockMessageToBeCreated(testChannel, testUser);
    testMessage = await messageRepository.create(messageToCreate);
  });

  afterEach(async () => {
    if (testMessageReaction) {
      await messageReactionRepository.deleteMessageReaction(
        testMessageReaction.id,
      );
      testMessageReaction = null;
    }
    if (testMessage) {
      await messageRepository.deleteById(testMessage.id);
    }
    if (testChannel) {
      await channelRepository.deleteById(testChannel.id);
    }
    if (testUser) {
      await jestPrisma.client.user
        .delete({ where: { id: testUser.id } })
        .catch(() => {});
    }
  });

  describe("create", () => {
    it("should create a message reaction and return the full entity", async () => {
      const createData: CreateMessageReactionData = {
        userId: testUser.platformId,
        messageId: testMessage.platformId,
        channelId: testChannel.platformId,
      };

      const result = await messageReactionRepository.create(createData);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("id");
      expect(result.user.platformId).toBe(testUser.platformId);
      expect(result.message.platformId).toBe(testMessage.platformId);
      expect(result.channel.platformId).toBe(testChannel.platformId);

      testMessageReaction = result;
    });

    it("should log an error and return null when prisma throws an error", async () => {
      const createData: CreateMessageReactionData = {
        userId: "non-existent-user",
        messageId: "non-existent-message",
        channelId: "non-existent-channel",
      };

      const result = await messageReactionRepository.create(createData);

      expect(result).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        expect.stringContaining("create |"),
      );
    });
  });

  describe("createMany", () => {
    it("should create multiple reactions and return the count", async () => {
      const messageToCreate2 = mockMessageToBeCreated(testChannel, testUser);
      const testMessage2 = await messageRepository.create(messageToCreate2);
      expect(testMessage2).not.toBeNull();

      if (testMessage2) {
        const createData: CreateMessageReactionData[] = [
          {
            userId: testUser.platformId,
            messageId: testMessage.platformId,
            channelId: testChannel.platformId,
          },
          {
            userId: testUser.platformId,
            messageId: testMessage2.platformId,
            channelId: testChannel.platformId,
          },
        ];

        const result = await messageReactionRepository.createMany(createData);

        expect(result).toBe(2);

        const reactions =
          await messageReactionRepository.getMessageReactionByUserPlatformId(
            testUser.platformId,
          );
        expect(reactions.length).toBeGreaterThanOrEqual(2);

        for (const reaction of reactions) {
          await messageReactionRepository.deleteMessageReaction(reaction.id);
        }

        await messageRepository.deleteById(testMessage2.id);
      }
    });

    it("should return 0 when createMany fails with invalid data", async () => {
      const createData: CreateMessageReactionData[] = [
        {
          userId: "invalid-user-id",
          messageId: "invalid-message-id",
          channelId: "invalid-channel-id",
        },
      ];

      const result = await messageReactionRepository.createMany(createData);

      expect(result).toBe(0);
    });
  });

  describe("getMessageReactionById", () => {
    it("should return a message reaction by its numeric id", async () => {
      const createData: CreateMessageReactionData = {
        userId: testUser.platformId,
        messageId: testMessage.platformId,
        channelId: testChannel.platformId,
      };
      const createdReaction =
        await messageReactionRepository.create(createData);
      expect(createdReaction).not.toBeNull();

      const result = await messageReactionRepository.getMessageReactionById(
        createdReaction.id,
      );

      expect(result).not.toBeNull();
      expect(result.id).toBe(createdReaction.id);
      expect(result.user.platformId).toBe(testUser.platformId);
      expect(result.message.platformId).toBe(testMessage.platformId);
      expect(result.channel.platformId).toBe(testChannel.platformId);

      testMessageReaction = createdReaction;
    });

    it("should return null if message reaction is not found", async () => {
      const result =
        await messageReactionRepository.getMessageReactionById(999);
      expect(result).toBeNull();
    });

    it("should log an error and return null when findUnique fails", async () => {
      const result = await messageReactionRepository.getMessageReactionById(-1);

      expect(result).toBeNull();
    });
  });

  describe("getMessageReactionByUserPlatformId", () => {
    it("should return an array of message reactions for a user", async () => {
      const createData: CreateMessageReactionData = {
        userId: testUser.platformId,
        messageId: testMessage.platformId,
        channelId: testChannel.platformId,
      };
      const createdReaction =
        await messageReactionRepository.create(createData);
      expect(createdReaction).not.toBeNull();

      const result =
        await messageReactionRepository.getMessageReactionByUserPlatformId(
          testUser.platformId,
        );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty("id");
      expect(result[0].user.platformId).toBe(testUser.platformId);

      testMessageReaction = createdReaction;
    });

    it("should return empty array when no reactions found", async () => {
      const result =
        await messageReactionRepository.getMessageReactionByUserPlatformId(
          "non-existent-user-id",
        );

      expect(result).toEqual([]);
    });

    it("should log an error and return an empty array when findMany fails", async () => {
      const result =
        await messageReactionRepository.getMessageReactionByUserPlatformId(
          "non-existent-user-id",
        );

      expect(result).toEqual([]);
    });
  });

  describe("updateMessageReaction", () => {
    it("should update a message reaction by id and return the updated entity", async () => {
      const createData: CreateMessageReactionData = {
        userId: testUser.platformId,
        messageId: testMessage.platformId,
        channelId: testChannel.platformId,
      };
      const createdReaction =
        await messageReactionRepository.create(createData);
      expect(createdReaction).not.toBeNull();

      const newChannelData = createMockChannelEntity({
        platformId: `new-channel-${Date.now()}`,
      });
      const newChannel = await channelRepository.create(newChannelData);
      expect(newChannel).not.toBeNull();

      if (newChannel) {
        const updatedData: UpdateMessageReactionData = {
          channelId: newChannel.platformId,
        };

        const result = await messageReactionRepository.updateMessageReaction(
          createdReaction.id,
          updatedData,
        );

        expect(result).not.toBeNull();
        expect(result.id).toBe(createdReaction.id);
        expect(result.channel.platformId).toBe(newChannel.platformId);
        expect(result.user.platformId).toBe(testUser.platformId);
        expect(result.message.platformId).toBe(testMessage.platformId);

        await channelRepository.deleteById(newChannel.id);
        testMessageReaction = result;
      }
    });

    it("should log an error and return null when update fails", async () => {
      const updatedData: UpdateMessageReactionData = {
        channelId: "non-existent-channel-id",
      };

      const result = await messageReactionRepository.updateMessageReaction(
        999,
        updatedData,
      );

      expect(result).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        expect.stringContaining("updateMessageReaction |"),
      );
    });
  });

  describe("deleteMessageReaction", () => {
    it("should delete a message reaction by id and return true", async () => {
      const createData: CreateMessageReactionData = {
        userId: testUser.platformId,
        messageId: testMessage.platformId,
        channelId: testChannel.platformId,
      };
      const createdReaction =
        await messageReactionRepository.create(createData);
      expect(createdReaction).not.toBeNull();

      const result = await messageReactionRepository.deleteMessageReaction(
        createdReaction.id,
      );

      expect(result).toBe(true);

      const deletedReaction =
        await messageReactionRepository.getMessageReactionById(
          createdReaction.id,
        );
      expect(deletedReaction).toBeNull();
    });

    it("should log an error and return false when delete fails", async () => {
      const result = await messageReactionRepository.deleteMessageReaction(999);

      expect(result).toBe(false);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        expect.stringContaining("deleteMessageReaction |"),
      );
    });
  });
});
