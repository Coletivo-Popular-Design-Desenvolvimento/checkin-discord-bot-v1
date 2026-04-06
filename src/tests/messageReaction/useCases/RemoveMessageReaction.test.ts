import { RemoveMessageReaction } from "@domain/useCases/messageReaction/RemoveMessageReaction";
import { IMessageReactionRepository } from "@repositories/IMessageReactionRepository";
import { ILoggerService } from "@services/ILogger";
import {
  createMockUserEntity,
  createMockChannelEntity,
  createMockMessageEntity,
  createMockMessageReactionEntity,
} from "@tests/config/constants";
import { UserStatus } from "@type/UserStatusEnum";
import { ErrorMessages } from "@type/ErrorMessages";

describe("RemoveMessageReaction", () => {
  let removeMessageReaction: RemoveMessageReaction;
  let mockMessageReactionRepository: jest.Mocked<IMessageReactionRepository>;
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

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    removeMessageReaction = new RemoveMessageReaction(
      mockMessageReactionRepository,
      mockLogger,
    );
  });

  it("finds reaction and deletes it", async () => {
    mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
      mockReaction,
    );
    mockMessageReactionRepository.deleteMessageReaction.mockResolvedValue(true);

    const result = await removeMessageReaction.execute({
      userId: "user123",
      messageId: "message123",
      reactionEmoji: "👍",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
    expect(
      mockMessageReactionRepository.findByUserMessageAndEmoji,
    ).toHaveBeenCalledWith("user123", "message123", "👍");
    expect(
      mockMessageReactionRepository.deleteMessageReaction,
    ).toHaveBeenCalledWith(mockReaction.id);
  });

  it("returns success when reaction is not in database (idempotent)", async () => {
    mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
      null,
    );

    const result = await removeMessageReaction.execute({
      userId: "user123",
      messageId: "message123",
      reactionEmoji: "👍",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe(false);
    expect(result.message).toBe("Reaction not in database");
    expect(
      mockMessageReactionRepository.deleteMessageReaction,
    ).not.toHaveBeenCalled();
  });

  it("returns failure when delete returns false", async () => {
    mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
      mockReaction,
    );
    mockMessageReactionRepository.deleteMessageReaction.mockResolvedValue(
      false,
    );

    const result = await removeMessageReaction.execute({
      userId: "user123",
      messageId: "message123",
      reactionEmoji: "👍",
    });

    expect(result.success).toBe(false);
    expect(result.data).toBe(false);
    expect(result.message).toBe(ErrorMessages.UNKNOWN_ERROR);
  });

  it("returns failure and logs on repository error", async () => {
    mockMessageReactionRepository.findByUserMessageAndEmoji.mockRejectedValue(
      new Error("db down"),
    );

    const result = await removeMessageReaction.execute({
      userId: "user123",
      messageId: "message123",
    });

    expect(result.success).toBe(false);
    expect(result.data).toBe(false);
    expect(result.message).toBe("db down");
    expect(mockLogger.logToConsole).toHaveBeenCalledWith(
      "ERROR",
      "USECASE",
      "MESSAGE_REACTION",
      expect.stringContaining("removeMessageReaction.execute"),
    );
  });

  it("uses empty string for reactionEmoji when omitted", async () => {
    mockMessageReactionRepository.findByUserMessageAndEmoji.mockResolvedValue(
      null,
    );

    await removeMessageReaction.execute({
      userId: "user123",
      messageId: "message123",
    });

    expect(
      mockMessageReactionRepository.findByUserMessageAndEmoji,
    ).toHaveBeenCalledWith("user123", "message123", "");
  });
});
