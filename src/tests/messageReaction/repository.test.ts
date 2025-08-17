import { MessageReaction, User, Message, Channel } from "@prisma/client";
import { ChannelEntity } from "../../domain/entities/Channel";
import { MessageEntity } from "../../domain/entities/Message";
import { MessageReactionEntity } from "../../domain/entities/MessageReaction";
import { UserEntity } from "../../domain/entities/User";
import { CreateMessageReactionData } from "../../domain/dtos/CreateMessageReactionData";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../domain/types/LoggerContextEnum";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { MessageReactionRepository } from "../../infrastructure/persistence/repositories/MessageReactionRepository";
import { prismaMock } from "../config/singleton";
import { UpdateMessageReactionData } from "@domain/interfaces/repositories/IMessageReactionRepository";

// --- Mocks Completos para a Nova Arquitetura ---

const mockDate = new Date();

// Mocks dos modelos do Prisma (como se viessem do DB)
const mockDbUser: User = {
  id: 1,
  platform_id: "user123",
  username: "TestUser",
  global_name: "Test User",
  joined_at: mockDate,
  platform_created_at: mockDate,
  update_at: mockDate,
  last_active: mockDate,
  create_at: mockDate,
  bot: false,
  email: "test@test.com",
  status: 1,
};

const mockDbMessage: Message = {
  id: 10,
  platform_id: "message456",
  channel_id: "channel789",
  is_deleted: false,
  user_id: "user123",
  platform_created_at: mockDate,
  created_at: mockDate,
};

const mockDbChannel: Channel = {
  id: 20,
  platform_id: "channel789",
  name: "test-channel",
  url: "http://test.channel",
  created_at: mockDate,
};

const mockDbMessageReaction: MessageReaction = {
  id: 100,
  user_id: "user123",
  message_id: "message456",
  channel_id: "channel789",
};

// Mock do que o Prisma retorna com `include`
const mockFullMessageReaction = {
  ...mockDbMessageReaction,
  user: mockDbUser,
  message: mockDbMessage,
  channel: mockDbChannel,
};

// Mocks das Entidades de Domínio (simulando o retorno das factories)
const mockUserEntity = UserEntity.fromPersistence(mockDbUser);
const mockMessageEntity = MessageEntity.fromPersistence(
  mockDbMessage,
  mockDbUser,
  mockDbChannel,
);
const mockChannelEntity = ChannelEntity.fromPersistence(mockDbChannel);

// A entidade rica que o repositório deve retornar
const mockMessageReactionEntity = new MessageReactionEntity(
  mockFullMessageReaction.id,
  mockUserEntity,
  mockMessageEntity,
  mockChannelEntity,
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
    // Mock das factories para isolar o teste do repositório
    jest.spyOn(UserEntity, "fromPersistence").mockReturnValue(mockUserEntity);
    jest
      .spyOn(MessageEntity, "fromPersistence")
      .mockReturnValue(mockMessageEntity);
    jest
      .spyOn(ChannelEntity, "fromPersistence")
      .mockReturnValue(mockChannelEntity);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a message reaction and return the full entity", async () => {
      const createData: CreateMessageReactionData = {
        userId: "user123",
        messageId: "message456",
        channelId: "channel789",
      };
      prismaMock.messageReaction.create.mockResolvedValue(
        mockFullMessageReaction,
      );

      const result = await messageReactionRepository.create(createData);

      expect(prismaMock.messageReaction.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { platform_id: createData.userId } },
          message: { connect: { platform_id: createData.messageId } },
          channel: { connect: { platform_id: createData.channelId } },
        },
        include: { user: true, message: true, channel: true },
      });
      expect(result).toEqual(mockMessageReactionEntity);
    });

    it("should log an error and return null when prisma throws an error", async () => {
      const createData: CreateMessageReactionData = {
        userId: "user123",
        messageId: "message456",
        channelId: "channel789",
      };
      const errorMessage = "Database connection failed";
      prismaMock.messageReaction.create.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await messageReactionRepository.create(createData);

      expect(result).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `create | ${errorMessage}`,
      );
    });
  });

  describe("createMany", () => {
    it("should create multiple reactions and return the count", async () => {
      const createData: CreateMessageReactionData[] = [
        { userId: "user1", messageId: "msg1", channelId: "ch1" },
        { userId: "user2", messageId: "msg2", channelId: "ch2" },
      ];
      prismaMock.messageReaction.createMany.mockResolvedValue({ count: 2 });

      const result = await messageReactionRepository.createMany(createData);

      expect(result).toBe(2);
      expect(prismaMock.messageReaction.createMany).toHaveBeenCalledWith({
        data: [
          { user_id: "user1", message_id: "msg1", channel_id: "ch1" },
          { user_id: "user2", message_id: "msg2", channel_id: "ch2" },
        ],
        skipDuplicates: true,
      });
    });

    it("should log an error and return 0 when createMany fails", async () => {
      const createData: CreateMessageReactionData[] = [];
      const errorMessage = "Bulk insert failed";
      prismaMock.messageReaction.createMany.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await messageReactionRepository.createMany(createData);

      expect(result).toBe(0);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `createMany | ${errorMessage}`,
      );
    });
  });

  describe("getMessageReactionById", () => {
    it("should return a message reaction by its numeric id", async () => {
      prismaMock.messageReaction.findUnique.mockResolvedValue(
        mockFullMessageReaction,
      );

      const result = await messageReactionRepository.getMessageReactionById(
        mockDbMessageReaction.id,
      );

      expect(prismaMock.messageReaction.findUnique).toHaveBeenCalledWith({
        where: { id: mockDbMessageReaction.id },
        include: { user: true, message: true, channel: true },
      });
      expect(result).toEqual(mockMessageReactionEntity);
    });

    it("should return null if message reaction is not found", async () => {
      prismaMock.messageReaction.findUnique.mockResolvedValue(null);
      const result =
        await messageReactionRepository.getMessageReactionById(999);
      expect(result).toBeNull();
    });

    it("should log an error and return null when findUnique fails", async () => {
      const errorMessage = "Query failed";
      prismaMock.messageReaction.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await messageReactionRepository.getMessageReactionById(
        mockDbMessageReaction.id,
      );

      expect(result).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionById | ${errorMessage}`,
      );
    });
  });

  describe("getMessageReactionByUserPlatformId", () => {
    it("should return an array of message reactions for a user", async () => {
      prismaMock.messageReaction.findMany.mockResolvedValue([
        mockFullMessageReaction,
      ]);

      const result =
        await messageReactionRepository.getMessageReactionByUserPlatformId(
          "user123",
        );

      expect(prismaMock.messageReaction.findMany).toHaveBeenCalledWith({
        where: { user_id: "user123" },
        include: { user: true, message: true, channel: true },
      });
      expect(result).toEqual([mockMessageReactionEntity]);
    });

    it("should log an error and return an empty array when findMany fails", async () => {
      const errorMessage = "Query failed";
      prismaMock.messageReaction.findMany.mockRejectedValue(
        new Error(errorMessage),
      );

      const result =
        await messageReactionRepository.getMessageReactionByUserPlatformId(
          "user123",
        );

      expect(result).toEqual([]);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionByUserPlatformId | ${errorMessage}`,
      );
    });
  });

  describe("updateMessageReaction", () => {
    it("should update a message reaction by id and return the updated entity", async () => {
      const updatedData: UpdateMessageReactionData = {
        channelId: "newChannel123",
      };
      const updatedFullReaction = {
        ...mockFullMessageReaction,
        channel: { ...mockDbChannel, platform_id: "newChannel123" },
      };
      const updatedChannelEntity = ChannelEntity.fromPersistence(
        updatedFullReaction.channel,
      );
      const updatedMessageReactionEntity = new MessageReactionEntity(
        updatedFullReaction.id,
        mockUserEntity,
        mockMessageEntity,
        updatedChannelEntity,
      );

      prismaMock.messageReaction.update.mockResolvedValue(updatedFullReaction);
      // Mock the factory for the updated channel specifically for this test run
      jest
        .spyOn(ChannelEntity, "fromPersistence")
        .mockReturnValueOnce(mockChannelEntity)
        .mockReturnValueOnce(updatedChannelEntity);

      const result = await messageReactionRepository.updateMessageReaction(
        mockDbMessageReaction.id,
        updatedData,
      );

      expect(prismaMock.messageReaction.update).toHaveBeenCalledWith({
        where: { id: mockDbMessageReaction.id },
        data: {
          channel: { connect: { platform_id: updatedData.channelId } },
        },
        include: { user: true, message: true, channel: true },
      });
      expect(result).toEqual(updatedMessageReactionEntity);
    });

    it("should log an error and return null when update fails", async () => {
      const errorMessage = "Update failed";
      prismaMock.messageReaction.update.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await messageReactionRepository.updateMessageReaction(
        mockDbMessageReaction.id,
        {},
      );

      expect(result).toBeNull();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `updateMessageReaction | ${errorMessage}`,
      );
    });
  });

  describe("deleteMessageReaction", () => {
    it("should delete a message reaction by id and return true", async () => {
      prismaMock.messageReaction.delete.mockResolvedValue(
        mockFullMessageReaction,
      );

      const result = await messageReactionRepository.deleteMessageReaction(
        mockDbMessageReaction.id,
      );

      expect(prismaMock.messageReaction.delete).toHaveBeenCalledWith({
        where: { id: mockDbMessageReaction.id },
      });
      expect(result).toBe(true);
    });

    it("should log an error and return false when delete fails", async () => {
      const errorMessage = "Delete failed";
      prismaMock.messageReaction.delete.mockRejectedValue(
        new Error(errorMessage),
      );

      const result = await messageReactionRepository.deleteMessageReaction(
        mockDbMessageReaction.id,
      );

      expect(result).toBe(false);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `deleteMessageReaction | ${errorMessage}`,
      );
    });
  });
});
