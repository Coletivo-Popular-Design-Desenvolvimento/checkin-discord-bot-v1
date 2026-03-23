import { RegisterMessageReaction } from "@domain/useCases/messageReaction/RegisterMessageReaction";
import { IMessageReactionRepository } from "@repositories/IMessageReactionRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IMessageRepository } from "@repositories/IMessageRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { UserStatus } from "@type/UserStatusEnum";
import {
  createMockUserEntity,
  createMockChannelEntity,
  createMockMessageEntity,
  createMockMessageReactionEntity,
} from "@tests/config/constants";

describe("RegisterMessageReaction", () => {
  let registerMessageReaction: RegisterMessageReaction;
  let mockMessageReactionRepository: jest.Mocked<IMessageReactionRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockChannelRepository: jest.Mocked<IChannelRepository>;
  let mockMessageRepository: jest.Mocked<IMessageRepository>;
  let mockCreateUser: jest.Mocked<ICreateUser>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const mockChannel = createMockChannelEntity({
    id: 1,
    platformId: "channel123",
    name: "Test Channel",
    url: "https://discord.com/channels/123/channel123",
  });

  const mockUser = createMockUserEntity({
    id: 1,
    platformId: "user123",
    username: "Test User",
    bot: false,
    status: UserStatus.ACTIVE,
  });

  const mockMessage = createMockMessageEntity({
    id: 1,
    platformId: "message123",
    channel: mockChannel,
    user: mockUser,
    platformCreatedAt: new Date(),
    isDeleted: false,
    messageReactions: [],
  });

  const mockReaction = createMockMessageReactionEntity(
    mockUser,
    mockMessage,
    mockChannel,
    1,
    "👍",
    new Date(),
  );

  beforeEach(() => {
    mockMessageReactionRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      getMessageReactionById: jest.fn(),
      getMessageReactionByUserId: jest.fn(),
      getMessageReactionByUserPlatformId: jest.fn(),
      findByUserMessageAndEmoji: jest.fn(),
      updateMessageReaction: jest.fn(),
      deleteMessageReaction: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByPlatformId: jest.fn(),
      listAll: jest.fn(),
      updateById: jest.fn(),
    };

    mockChannelRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByPlatformId: jest.fn(),
      listAll: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockMessageRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByPlatformId: jest.fn(),
      findByChannelId: jest.fn(),
      findByUserId: jest.fn(),
      listAll: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockCreateUser = {
      execute: jest.fn(),
      executeMany: jest.fn(),
    };

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    registerMessageReaction = new RegisterMessageReaction(
      mockMessageReactionRepository,
      mockUserRepository,
      mockChannelRepository,
      mockMessageRepository,
      mockCreateUser,
      mockLogger,
    );
  });

  describe("execute", () => {
    it("should register reaction when user, channel and message exist", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        reactionEmoji: "👍",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(mockReaction);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReaction);
      expect(
        mockMessageReactionRepository.findByUserMessageAndEmoji,
      ).toHaveBeenCalledWith("user123", "message123", "👍");
      expect(mockMessageReactionRepository.create).toHaveBeenCalledWith({
        userId: input.userId,
        messageId: input.messageId,
        channelId: input.channelId,
        reactionEmoji: input.reactionEmoji,
        reactedAt: undefined,
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "USECASE",
        "MESSAGE_REACTION",
        expect.stringContaining("Reaction registered"),
      );
    });

    it("should create user when user does not exist", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        reactionEmoji: "❤️",
        username: "New User",
        userBot: false,
      };

      const createdUser = createMockUserEntity({
        id: 1,
        platformId: "user123",
        username: "New User",
        bot: false,
        status: UserStatus.ACTIVE,
      });

      mockUserRepository.findByPlatformId.mockResolvedValue(null);
      mockCreateUser.execute.mockResolvedValue({
        success: true,
        data: createdUser,
      });
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(mockReaction);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(true);
      expect(mockCreateUser.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: input.userId,
          username: input.username,
          bot: input.userBot ?? false,
          status: UserStatus.ACTIVE,
        }),
      );
      expect(mockMessageReactionRepository.create).toHaveBeenCalled();
    });

    it("should create channel when channel does not exist", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        channelName: "New Channel",
        channelUrl: "https://discord.com/channels/123/channel123",
      };

      const createdChannel = createMockChannelEntity({
        id: 1,
        platformId: "channel123",
        name: "New Channel",
        url: "https://discord.com/channels/123/channel123",
      });

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(null);
      mockChannelRepository.create.mockResolvedValue(createdChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(mockReaction);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(true);
      expect(mockChannelRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: input.channelId,
          name: input.channelName,
          url: input.channelUrl,
        }),
      );
      expect(mockMessageReactionRepository.create).toHaveBeenCalled();
    });

    it("should create message when message does not exist", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        messagePlatformCreatedAt: new Date(),
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(mockReaction);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(true);
      expect(mockMessageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: input.messageId,
          isDeleted: false,
          channel: mockChannel,
          user: mockUser,
          messageReactions: [],
        }),
      );
      expect(mockMessageReactionRepository.create).toHaveBeenCalled();
    });

    it("should return existing reaction when reaction already registered", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        reactionEmoji: "👍",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        mockReaction,
      );

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReaction);
      expect(result.message).toBe("Reaction already registered");
      expect(mockMessageReactionRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "USECASE",
        "MESSAGE_REACTION",
        expect.stringContaining("Reaction already registered"),
      );
    });

    it("should return error when user data missing for user creation", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(null);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("User data required for user creation");
      expect(mockCreateUser.execute).not.toHaveBeenCalled();
      expect(mockMessageReactionRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when channel creation fails", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
        channelName: "New Channel",
        channelUrl: "https://discord.com/channels/123/channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(null);
      mockChannelRepository.create.mockResolvedValue(null);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to create channel");
      expect(mockMessageReactionRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when message creation fails", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(null);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to create message");
      expect(mockMessageReactionRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when reaction create returns null", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(null);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });

    it("should handle repository errors and log them", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
      };

      const error = new Error("Database connection failed");
      mockUserRepository.findByPlatformId.mockRejectedValue(error);

      const result = await registerMessageReaction.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Database connection failed");
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "USECASE",
        "MESSAGE_REACTION",
        "registerMessageReaction.execute | Database connection failed",
      );
    });

    it("should use empty string for reactionEmoji when not provided", async () => {
      const input = {
        userId: "user123",
        messageId: "message123",
        channelId: "channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);
      mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
        null,
      );
      mockMessageReactionRepository.create.mockResolvedValue(mockReaction);

      await registerMessageReaction.execute(input);

      expect(
        mockMessageReactionRepository.findByUserMessageAndEmoji,
      ).toHaveBeenCalledWith("user123", "message123", "");
      expect(mockMessageReactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user123",
          messageId: "message123",
          channelId: "channel123",
          reactionEmoji: undefined,
        }),
      );
    });
  });
});
