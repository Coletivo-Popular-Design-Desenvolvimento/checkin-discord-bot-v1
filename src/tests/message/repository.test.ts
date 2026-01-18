import { MessageEntity } from "@domain/entities/Message";
import { ChannelEntity } from "@domain/entities/Channel";
import { UserEntity } from "@domain/entities/User";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { LoggerContextStatus } from "@domain/types/LoggerContextEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { MessageRepository } from "@infra/repositories/MessageRepository";
import {
  createMockMessageEntity,
  mockMessageValue,
  mockUserValue,
  mockChannelEntityForRelations,
  mockMessageToBeCreated,
} from "@tests/config/constants";

import { UserRepository } from "@infra/repositories/UserRepository";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";

describe("MessageRepository", () => {
  let messageRepository: MessageRepository;
  let userRepository: UserRepository;
  let channelRepository: ChannelRepository;
  let messageUser: UserEntity;
  let messageChannel: ChannelEntity;
  let messageToBeFound: MessageEntity;

  beforeEach(async () => {
    const mockLogger: ILoggerService = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message); // Simulate logging to console.error
    });

    messageRepository = new MessageRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    channelRepository = new ChannelRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );
    userRepository = new UserRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    messageUser = await userRepository.create(mockUserValue);
    messageChannel = await channelRepository.create(
      mockChannelEntityForRelations,
    );

    const messageToCreate = mockMessageToBeCreated(messageChannel, messageUser);
    messageToBeFound = await messageRepository.create(messageToCreate);
  });

  afterEach(async () => {
    await messageRepository.deleteById(messageToBeFound.id);
    await userRepository.deleteById(messageUser.id);
    await channelRepository.deleteById(messageChannel.id);
  });

  describe("findById", () => {
    it("should return a message by id", async () => {
      const result = await messageRepository.findById(messageToBeFound.id);

      expect(result).toHaveProperty("id", messageToBeFound.id);
      expect(result).toHaveProperty("platformId", messageToBeFound.platformId);

      await messageRepository.deleteById(messageToBeFound.id);
    });

    it("should return null when no message is found", async () => {
      const id = 3;

      const message = await messageRepository.findById(id);

      expect(message).toBeNull();
    });
  });

  describe("findByChannelId", () => {
    it("should return a list of active messages by channel id", async () => {
      const messages = await messageRepository.findByChannelId(
        messageChannel.platformId,
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", messageToBeFound.id);
    });

    it("should return a list of all messages by channel id", async () => {
      const messages = await messageRepository.findByChannelId(
        messageChannel.platformId,
        true,
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", messageToBeFound.id);
      expect(messages[0]).toHaveProperty(
        "channel",
        expect.objectContaining({
          platformId: messageToBeFound.channel.platformId,
        }),
      );
    });

    it("should return empty array when no message is found", async () => {
      const channelId = "23232676";

      const message = await messageRepository.findByChannelId(channelId);

      expect(message).toHaveLength(0);
    });
  });

  describe("findByplatformId", () => {
    it("should return a message by discord id", async () => {
      const message = await messageRepository.findByPlatformId(
        messageToBeFound.platformId,
      );

      expect(message).toHaveProperty("id", messageToBeFound.id);
    });

    it("should return null if no message is found", async () => {
      const platformId = mockMessageValue.platformId;

      const message = await messageRepository.findByPlatformId(platformId);

      expect(message).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return a list of active messages by user id", async () => {
      const messages = await messageRepository.findByUserId(
        messageUser.platformId,
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", messageToBeFound.id);
      expect(messages[0]).toHaveProperty(
        "user",
        expect.objectContaining({
          platformId: messageToBeFound.user.platformId,
        }),
      );
    });

    it("should return a list of all messages by user id", async () => {
      const messages = await messageRepository.findByUserId(
        messageUser.platformId,
        true,
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", messageToBeFound.id);
      expect(messages[0]).toHaveProperty(
        "user",
        expect.objectContaining({
          platformId: messageToBeFound.user.platformId,
        }),
      );
    });

    it("should return empty array when no message is found", async () => {
      const userId = "23232676";
      const messages = await messageRepository.findByUserId(userId);

      expect(messages).toHaveLength(0);
    });
  });

  describe("create methods suite", () => {
    describe("createMany", () => {
      it("should insert into db new messages", async () => {
        const newMessage1 = createMockMessageEntity({
          platformId: "new-message-1-platform-id",
          channel: messageChannel,
          user: messageUser,
        });
        const newMessage2 = createMockMessageEntity({
          isDeleted: true,
          platformId: "new-message-2-platform-id",
          channel: messageChannel,
          user: messageUser,
        });
        const messagesToCreate = [newMessage1, newMessage2];

        const totalCreated =
          await messageRepository.createMany(messagesToCreate);

        expect(totalCreated).toEqual(messagesToCreate.length);

        const createdMessage1 = await messageRepository.findByPlatformId(
          newMessage1.platformId,
        );
        const createdMessage2 = await messageRepository.findByPlatformId(
          newMessage2.platformId,
        );
        if (createdMessage1) {
          await messageRepository.deleteById(createdMessage1.id);
        }
        if (createdMessage2) {
          await messageRepository.deleteById(createdMessage2.id);
        }
      });

      it("should NOT insert into db if an error occurs", async () => {
        const invalidMessage = createMockMessageEntity({
          channel: null,
          user: null,
        });

        const spyConsole = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        //forcing column value with type different from defined on schema
        Object.assign(invalidMessage, {
          platformId: 123,
        });

        const response = await messageRepository.createMany([invalidMessage]);

        expect(response).toEqual(0);
        expect(spyConsole).toHaveBeenCalledWith(LoggerContextStatus.ERROR);
      });
    });
  });

  describe("deleteById", () => {
    it("if db returns entity, should delete message succesfully", async () => {
      const messageEntity = createMockMessageEntity({
        platformId: "deleted-platform-id",
        channel: messageChannel,
        user: messageUser,
      });
      const messageToDelete = await messageRepository.create(messageEntity);
      const deleted = await messageRepository.deleteById(messageToDelete.id);

      expect(deleted).toBeTruthy();
    });

    it("if error occurs, should log it", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.deleteById(mockMessageValue.id);

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });

  describe("listAll", () => {
    it("should bring all active messages", async () => {
      const response = await messageRepository.listAll();

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty(
        "platformId",
        messageToBeFound.platformId,
      );
      expect(response[0]).toHaveProperty(
        "user",
        expect.objectContaining({
          platformId: messageToBeFound.user.platformId,
        }),
      );
    });

    it("when limit is given, should bring that amount or less of active messages", async () => {
      const limit = 10;

      const response = await messageRepository.listAll({ limit });

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty(
        "platformId",
        messageToBeFound.platformId,
      );
      expect(response[0]).toHaveProperty(
        "user",
        expect.objectContaining({
          platformId: messageToBeFound.user.platformId,
        }),
      );
    });

    it("should bring all messages, including soft deleted", async () => {
      const mockDeleted = createMockMessageEntity({
        isDeleted: true,
        platformId: "deleted-message-platform-id",
        channel: messageChannel,
        user: messageUser,
      });

      await messageRepository.create(mockDeleted);

      const response = await messageRepository.listAll({
        includeDeleted: true,
      });

      expect(response).toHaveLength(2);
      expect(response[0]).toHaveProperty("isDeleted", false);
      expect(response[1]).toHaveProperty("isDeleted", true);
    });

    it("should bring all messages, including soft deleted, within a limit", async () => {
      const limit = 5;
      const mockDeleted = createMockMessageEntity({
        isDeleted: true,
        platformId: "deleted-message-platform-id",
        channel: messageChannel,
        user: messageUser,
      });

      await messageRepository.create(mockDeleted);

      const response = await messageRepository.listAll({
        limit,
        includeDeleted: true,
      });

      expect(response).toHaveLength(2);
      expect(response[0]).toHaveProperty("isDeleted", false);
      expect(response[1]).toHaveProperty("isDeleted", true);
    });
  });

  describe("updateById", () => {
    it("should update message successfully", async () => {
      // Criamos uma entidade completa para update
      const messageEntityToUpdate = {
        ...messageToBeFound,
        isDeleted: true,
      };

      const updatedMessage = await messageRepository.updateById(
        messageEntityToUpdate.id,
        messageEntityToUpdate,
      );

      expect(updatedMessage).not.toBeNull();
      expect(updatedMessage).toHaveProperty("isDeleted", true);
    });

    it("should NOT update message if error occurs", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      // Criamos uma entidade completa para o teste de erro
      const messageEntityToUpdate = createMockMessageEntity({
        isDeleted: true,
      });

      const response = await messageRepository.updateById(
        mockMessageValue.id,
        messageEntityToUpdate,
      );

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });
});
