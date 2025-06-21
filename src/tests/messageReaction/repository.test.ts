import { MessageReaction } from "@prisma/client";
import { MessageReactionEntity } from "../../domain/entities/MessageReaction";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../domain/types/LoggerContextEnum";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { MessageReactionRepository } from "../../infrastructure/persistence/repositories/MessageReactionRepository";
import { prismaMock } from "../config/singleton";

// Mock de dados para os testes
const mockDbMessageReaction: MessageReaction = {
  user_id: "user123",
  message_id: "message456",
  channel_id: "channel789",
};

const mockMessageReactionEntity = new MessageReactionEntity(
  mockDbMessageReaction.user_id,
  mockDbMessageReaction.message_id,
  mockDbMessageReaction.channel_id,
);

describe("MessageReactionRepository", () => {
  let messageReactionRepository: MessageReactionRepository;
  let mockLogger: ILoggerService;

  beforeEach(() => {
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    const prismaServiceMock = new PrismaService(prismaMock);
    messageReactionRepository = new MessageReactionRepository(
      prismaServiceMock,
      mockLogger,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMessageReactionById", () => {
    it("should return a message reaction by user and message id", async () => {
      prismaMock.messageReaction.findUnique.mockResolvedValue(
        mockDbMessageReaction,
      );

      const result = await messageReactionRepository.getMessageReactionById(
        mockMessageReactionEntity.userId,
        mockMessageReactionEntity.messageId,
      );

      expect(prismaMock.messageReaction.findUnique).toHaveBeenCalledWith({
        where: {
          user_id_message_id: {
            user_id: mockMessageReactionEntity.userId,
            message_id: mockMessageReactionEntity.messageId,
          },
        },
      });
      expect(result).toEqual(mockMessageReactionEntity);
    });

    it("should return null if message reaction is not found", async () => {
      prismaMock.messageReaction.findUnique.mockResolvedValue(null);

      const result = await messageReactionRepository.getMessageReactionById(
        "user1",
        "message1",
      );

      expect(result).toBeNull();
    });

    it("should log an error and return null if findUnique fails", async () => {
      const error = new Error("DB error");
      prismaMock.messageReaction.findUnique.mockRejectedValue(error);

      const result = await messageReactionRepository.getMessageReactionById(
        "user1",
        "message1",
      );

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionById | ${error.message}`,
      );
      expect(result).toBeNull();
    });
  });

  describe("getMessageReactionByUserId", () => {
    it("should return an array of message reactions for a given user id", async () => {
      prismaMock.messageReaction.findMany.mockResolvedValue([
        mockDbMessageReaction,
      ]);

      const result = await messageReactionRepository.getMessageReactionByUserId(
        mockMessageReactionEntity.userId,
      );

      expect(prismaMock.messageReaction.findMany).toHaveBeenCalledWith({
        where: { user_id: mockMessageReactionEntity.userId },
      });
      expect(result).toEqual([mockMessageReactionEntity]);
      expect(result.length).toBe(1);
    });

    it("should return an empty array if no reactions are found for the user", async () => {
      prismaMock.messageReaction.findMany.mockResolvedValue([]);

      const result =
        await messageReactionRepository.getMessageReactionByUserId(
          "nonexistentuser",
        );

      expect(result).toEqual([]);
    });
  });

  describe("updateMessageReaction", () => {
    it("should update a message reaction and return the updated entity", async () => {
      const updatedData = { channelId: "newChannel123" };
      const updatedDbReaction = {
        ...mockDbMessageReaction,
        channel_id: updatedData.channelId,
      };
      prismaMock.messageReaction.update.mockResolvedValue(updatedDbReaction);

      const result = await messageReactionRepository.updateMessageReaction(
        mockMessageReactionEntity.userId,
        mockMessageReactionEntity.messageId,
        updatedData,
      );

      expect(prismaMock.messageReaction.update).toHaveBeenCalledWith({
        where: {
          user_id_message_id: {
            user_id: mockMessageReactionEntity.userId,
            message_id: mockMessageReactionEntity.messageId,
          },
        },
        data: {
          user_id: undefined,
          message_id: undefined,
          channel_id: updatedData.channelId,
        },
      });
      expect(result).toEqual(
        new MessageReactionEntity(
          updatedDbReaction.user_id,
          updatedDbReaction.message_id,
          updatedDbReaction.channel_id,
        ),
      );
    });
  });

  describe("deleteMessageReaction", () => {
    it("should delete a message reaction and return the deleted entity", async () => {
      prismaMock.messageReaction.delete.mockResolvedValue(
        mockDbMessageReaction,
      );

      const result = await messageReactionRepository.deleteMessageReaction(
        mockMessageReactionEntity.userId,
        mockMessageReactionEntity.messageId,
      );

      expect(prismaMock.messageReaction.delete).toHaveBeenCalledWith({
        where: {
          user_id_message_id: {
            user_id: mockMessageReactionEntity.userId,
            message_id: mockMessageReactionEntity.messageId,
          },
        },
      });
      expect(result).toEqual(mockMessageReactionEntity);
    });

    it("should log an error and return null if deletion fails", async () => {
      const error = new Error("DB error");
      prismaMock.messageReaction.delete.mockRejectedValue(error);

      const result = await messageReactionRepository.deleteMessageReaction(
        "user1",
        "message1",
      );

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `deleteMessageReaction | ${error.message}`,
      );
      expect(result).toBeNull();
    });
  });
});
