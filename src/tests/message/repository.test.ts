import { MessageEntity } from "../../domain/entities/Message";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { MessageRepository } from "../../infrastructure/persistence/repositories/MessageRepository";
import {
  createNumerousMocks,
  createMockMessageEntity,
  messageDbModel,
  mockDbMessageValue,
  mockMessageUpdateValue,
  mockMessageValue,
} from "../config/constants";

import { prismaMock } from "../config/singleton";

describe("MessageRepository", () => {
  let messageRepository: MessageRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  beforeAll(() => {
    const mockLogger: ILoggerService = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message); // Simulate logging to console.error
    });
    messageRepository = new MessageRepository(prismaServiceMock, mockLogger);
  });

  describe("findById", () => {
    it("should return a message by id", async () => {
      const id = 1;

      prismaMock.message.findUnique.mockResolvedValue(mockDbMessageValue);

      const message = await messageRepository.findById(id);

      expect(prismaMock.message.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
        where: { id },
      });

      expect(message).toHaveProperty("id", 1);
      expect(message).toHaveProperty("platformId", mockMessageValue.platformId);
    });

    it("should return null when no message is found", async () => {
      const id = 3;

      prismaMock.message.findUnique.mockResolvedValue(null);

      const message = await messageRepository.findById(id);

      expect(prismaMock.message.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findUnique).toHaveBeenCalledWith({
        where: { id },
      });

      expect(message).toBeNull();
    });
  });

  describe("findByChannelId", () => {
    it("should return a list of active messages by channel id", async () => {
      const channelId = mockMessageValue.channelId;

      prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

      const messages = await messageRepository.findByChannelId(channelId);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { channel_id: channelId, is_deleted: false },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", 1);
      expect(messages[0]).toHaveProperty(
        "channelId",
        mockMessageValue.channelId,
      );
    });

    it("should return a list of all messages by channel id", async () => {
      const channelId = mockMessageValue.channelId;

      prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

      const messages = await messageRepository.findByChannelId(channelId, true);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { channel_id: channelId },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", 1);
      expect(messages[0]).toHaveProperty(
        "channelId",
        mockMessageValue.channelId,
      );
    });

    it("should return empty array when no message is found", async () => {
      const channelId = "23232676";

      prismaMock.message.findMany.mockResolvedValue([]);

      const message = await messageRepository.findByChannelId(channelId);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { channel_id: channelId, is_deleted: false },
      });

      expect(message).toHaveLength(0);
    });

    it("should return no message if error occurs", async () => {
      const channelId = "32687576";

      prismaMock.message.findMany.mockRejectedValue(new Error());

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.findByChannelId(channelId);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { channel_id: channelId, is_deleted: false },
      });

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });

  describe("findByplatformId", () => {
    it("should return a message by discord id", async () => {
      const platformId = mockMessageValue.platformId;

      prismaMock.message.findFirst.mockResolvedValue(mockDbMessageValue);

      const message = await messageRepository.findByPlatformId(platformId);

      expect(prismaMock.message.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
      });

      expect(message).toHaveProperty("id", 1);
      expect(message).toHaveProperty("platformId", mockMessageValue.platformId);
    });

    it("should return null if no message is found", async () => {
      const platformId = mockMessageValue.platformId;

      prismaMock.message.findFirst.mockResolvedValue(null);

      const message = await messageRepository.findByPlatformId(platformId);

      expect(prismaMock.message.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
      });

      expect(message).toBeNull();
    });

    it("should not return message if error occurs", async () => {
      const platformId = "23232687576";

      prismaMock.message.findFirst.mockRejectedValue(new Error());

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.findByPlatformId(platformId);

      expect(prismaMock.message.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
      });

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });

  describe("findByUserId", () => {
    it("should return a list of active messages by user id", async () => {
      const userId = mockMessageValue.userId;

      prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

      const messages = await messageRepository.findByUserId(userId);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { user_id: userId, is_deleted: false },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", 1);
      expect(messages[0]).toHaveProperty("userId", mockMessageValue.userId);
    });

    it("should return a list of all messages by user id", async () => {
      const userId = mockMessageValue.userId;

      prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

      const messages = await messageRepository.findByUserId(userId, true);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty("id", 1);
      expect(messages[0]).toHaveProperty("userId", mockMessageValue.userId);
    });

    it("should return empty array when no message is found", async () => {
      const userId = "23232676";

      prismaMock.message.findMany.mockResolvedValue([]);

      const messages = await messageRepository.findByUserId(userId);

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { user_id: userId, is_deleted: false },
      });

      expect(messages).toHaveLength(0);
    });
  });

  describe("create methods suite", () => {
    const today = new Date();

    // Criamos uma entidade de teste completa
    const messageToCreate = createMockMessageEntity({
      platformCreatedAt: today,
      createdAt: today,
    });

    describe("create", () => {
      it("should insert into db a new message", async () => {
        prismaMock.message.create.mockResolvedValue(mockDbMessageValue);

        const newMessage = await messageRepository.create(messageToCreate);

        expect(prismaMock.message.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.message.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            channel_id: messageToCreate.channelId,
            platform_id: messageToCreate.platformId,
            user_id: messageToCreate.userId,
          }),
        });

        expect(newMessage).toHaveProperty("id", 1);
      });

      it("should NOT insert into db if an error occurs", async () => {
        const error = new Error("could not create");
        prismaMock.message.create.mockRejectedValue(error);

        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        const response = await messageRepository.create(messageToCreate);

        expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

        expect(response).toBeUndefined();
      });
    });

    describe("createMany", () => {
      const otherMessageToCreate: Omit<MessageEntity, "id"> = {
        ...messageToCreate,
        channelId: "3",
        userId: "2",
      };
      const messagesToCreate = [messageToCreate, otherMessageToCreate];

      it("should insert into db new messages", async () => {
        prismaMock.message.createMany.mockResolvedValue({
          count: messagesToCreate.length,
        });

        const totalCreated =
          await messageRepository.createMany(messagesToCreate);

        expect(prismaMock.message.createMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.message.createMany).toHaveBeenCalledWith({
          data: expect.arrayContaining(
            messagesToCreate.map((msg) => {
              return {
                channel_id: msg.channelId,
                platform_id: msg.platformId,
                user_id: msg.userId,
                created_at: expect.anything(),
                platform_created_at: expect.anything(),
                is_deleted: false,
                id: undefined,
              };
            }),
          ),
          skipDuplicates: true,
        });

        expect(totalCreated).toEqual(messagesToCreate.length);
      });

      it("should NOT insert into db if an error occurs", async () => {
        const error = new Error("could not create");
        prismaMock.message.createMany.mockRejectedValue(error);

        const spy = jest.spyOn(console, "error").mockImplementation(() => {});

        const response = await messageRepository.createMany(messagesToCreate);

        expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

        expect(response).toBeUndefined();
      });
    });
  });

  describe("deleteById", () => {
    it("if db returns entity, should delete message succesfully", async () => {
      prismaMock.message.delete.mockResolvedValue(mockDbMessageValue);

      const deleted = await messageRepository.deleteById(mockMessageValue.id);

      expect(prismaMock.message.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.delete).toHaveBeenCalledWith({
        where: { id: mockMessageValue.id },
      });

      expect(deleted).toBeTruthy();
    });

    it("if error occurs, should log it", async () => {
      const error = new Error();
      prismaMock.message.delete.mockRejectedValue(error);

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.deleteById(mockMessageValue.id);

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });

  describe("listAll", () => {
    it("should bring all active messages", async () => {
      prismaMock.message.findMany.mockResolvedValue([mockDbMessageValue]);

      const response = await messageRepository.listAll();

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        where: { is_deleted: false },
      });

      expect(response).toHaveLength(1);
      expect(response[0]).toHaveProperty(
        "platformId",
        mockDbMessageValue.platform_id,
      );
      expect(response[0]).toHaveProperty("userId", mockDbMessageValue.user_id);
    });

    it("when limit is given, should bring that amount or less of active messages", async () => {
      const limit = 10;
      const mockDbReturn = createNumerousMocks(limit);

      prismaMock.message.findMany.mockResolvedValue(mockDbReturn);

      const response = await messageRepository.listAll({ limit });

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        take: limit,
        where: { is_deleted: false },
      });

      expect(response).toHaveLength(limit);
      expect(response[0]).toHaveProperty("platformId", "1000");
      expect(response[0]).toHaveProperty("userId", "10");
    });

    it("should bring all messages, including soft deleted", async () => {
      const mockDeleted: messageDbModel = {
        id: 4,
        user_id: "4",
        platform_id: "343534353",
        channel_id: "2345424",
        created_at: new Date("2025-04-01"),
        platform_created_at: new Date("2025-04-01"),
        is_deleted: true,
      };

      prismaMock.message.findMany.mockResolvedValue([
        mockDbMessageValue,
        mockDeleted,
      ]);

      const response = await messageRepository.listAll({
        includeDeleted: true,
      });

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { is_deleted: undefined },
      });

      expect(response).toHaveLength(2);
      expect(response[0]).toHaveProperty("isDeleted", false);
      expect(response[1]).toHaveProperty("isDeleted", true);
    });

    it("should bring all messages, including soft deleted, within a limit", async () => {
      const limit = 5;
      const mockedDbResponse = createNumerousMocks(limit, true);

      prismaMock.message.findMany.mockResolvedValue(mockedDbResponse);

      const response = await messageRepository.listAll({
        limit,
        includeDeleted: true,
      });

      expect(prismaMock.message.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith({
        take: limit,
        where: { is_deleted: undefined },
      });

      expect(response).toHaveLength(limit);
      expect(response[0]).toHaveProperty("isDeleted", true);
      expect(response[1]).toHaveProperty("isDeleted", false);
    });

    it("if error occurs, should log it and return no messages", async () => {
      const error = new Error();
      prismaMock.message.findMany.mockRejectedValue(error);

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.listAll();

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });

  describe("updateById", () => {
    it("should update message successfully", async () => {
      prismaMock.message.update.mockResolvedValue(mockMessageUpdateValue);

      const updatedMessage = await messageRepository.updateById(
        mockMessageValue.id,
        {
          ...mockMessageValue,
          isDeleted: true,
        },
      );

      expect(prismaMock.message.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.message.update).toHaveBeenCalledWith({
        data: {
          ...mockMessageUpdateValue,
          created_at: undefined,
          discord_created_at: undefined,
          id: undefined,
        },
        where: { id: mockMessageValue.id },
      });

      expect(updatedMessage).not.toBeNull();
      expect(updatedMessage).toHaveProperty("isDeleted", true);
    });

    it("should NOT update message if error occurs", async () => {
      const error = new Error();
      prismaMock.message.update.mockRejectedValue(error);

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await messageRepository.updateById(mockMessageValue.id, {
        ...mockMessageValue,
        isDeleted: true,
      });

      expect(spy).toHaveBeenCalledWith(LoggerContextStatus.ERROR);

      expect(response).toBeUndefined();
    });
  });
});
