import { RegisterMessage } from "@domain/useCases/message/RegisterMessage";
import { IMessageRepository } from "@repositories/IMessageRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { UserStatus } from "@type/UserStatusEnum";
import {
  createMockUserEntity,
  createMockChannelEntity,
  createMockMessageEntity,
} from "@tests/config/constants";

describe("RegisterMessage", () => {
  let registerMessage: RegisterMessage;
  let mockMessageRepository: jest.Mocked<IMessageRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockChannelRepository: jest.Mocked<IChannelRepository>;
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

  beforeEach(() => {
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

    mockUserRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      findByPlatformId: jest.fn(),
      listAll: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
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

    mockCreateUser = {
      execute: jest.fn(),
      executeMany: jest.fn(),
    };

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    registerMessage = new RegisterMessage(
      mockMessageRepository,
      mockUserRepository,
      mockChannelRepository,
      mockCreateUser,
      mockLogger,
    );
  });

  describe("execute", () => {
    it("should successfully register a message when user and channel exist", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(mockMessage);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockMessage);
      expect(mockUserRepository.findByPlatformId).toHaveBeenCalledWith(
        "user123",
        true,
      );
      expect(mockChannelRepository.findByPlatformId).toHaveBeenCalledWith(
        "channel123",
      );
      expect(mockMessageRepository.create).toHaveBeenCalledWith({
        platformId: input.platformId,
        platformCreatedAt: input.platformCreatedAt,
        isDeleted: false,
        channel: mockChannel,
        user: mockUser,
        messageReactions: [],
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "USECASE",
        "MESSAGE",
        `Message registered successfully: ${input.platformId}`,
      );
    });

    it("should create user automatically if user does not exist", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
        username: "New User",
        userBot: false,
        userGlobalName: "New User Global",
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
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(mockMessage);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(true);
      expect(mockCreateUser.execute).toHaveBeenCalledWith({
        platformId: input.userId,
        username: input.username,
        globalName: input.userGlobalName || null,
        bot: input.userBot || false,
        status: UserStatus.ACTIVE,
        platformCreatedAt: undefined,
        joinedAt: null,
        lastActive: undefined,
      });
      expect(mockMessageRepository.create).toHaveBeenCalled();
    });

    it("should create channel automatically if channel does not exist", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
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
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(mockMessage);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(true);
      expect(mockChannelRepository.create).toHaveBeenCalledWith({
        platformId: input.channelId,
        name: input.channelName,
        url: input.channelUrl,
        createdAt: expect.any(Date),
      });
      expect(mockMessageRepository.create).toHaveBeenCalled();
    });

    it("should return error when user data is missing for user creation", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(null);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("User data required for user creation");
      expect(mockCreateUser.execute).not.toHaveBeenCalled();
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when message already exists", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockResolvedValue(mockMessage);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Message already exists");
      expect(result.data).toEqual(mockMessage);
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it("should return error when message creation fails", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(mockChannel);
      mockMessageRepository.findByPlatformId.mockRejectedValue(
        new Error("Not found"),
      );
      mockMessageRepository.create.mockResolvedValue(null);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });

    it("should handle repository errors and log them", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      const error = new Error("Database connection failed");
      mockUserRepository.findByPlatformId.mockRejectedValue(error);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Database connection failed");
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "USECASE",
        "MESSAGE",
        "registerMessage.execute | Database connection failed",
      );
    });

    it("should handle unknown errors gracefully", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
      };

      const error = "Unknown error type";
      mockUserRepository.findByPlatformId.mockRejectedValue(error);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });

    it("should handle channel creation failure", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
        channelName: "New Channel",
        channelUrl: "https://discord.com/channels/123/channel123",
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(mockUser);
      mockChannelRepository.findByPlatformId.mockResolvedValue(null);
      mockChannelRepository.create.mockResolvedValue(null);

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to create channel");
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });

    it("should handle user creation failure", async () => {
      const input = {
        platformId: "message123",
        platformCreatedAt: new Date(),
        channelId: "channel123",
        userId: "user123",
        username: "New User",
        userBot: false,
      };

      mockUserRepository.findByPlatformId.mockResolvedValue(null);
      mockCreateUser.execute.mockResolvedValue({
        success: false,
        data: null,
        message: "User creation failed",
      });

      const result = await registerMessage.execute(input);

      expect(result.success).toBe(false);
      expect(result.message).toBe("User creation failed");
      expect(mockMessageRepository.create).not.toHaveBeenCalled();
    });
  });
});
