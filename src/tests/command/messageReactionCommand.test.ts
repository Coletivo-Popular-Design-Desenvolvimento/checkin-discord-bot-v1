import { MessageReactionCommand } from "@application/command/messageReactionCommand";
import { IDiscordService } from "@services/IDiscordService";
import { ILoggerService } from "@services/ILogger";
import { IRegisterMessageReaction } from "@interfaces/useCases/messageReaction/IRegisterMessageReaction";
import { IRemoveMessageReaction } from "@interfaces/useCases/messageReaction/IRemoveMessageReaction";
import { Client, MessageReaction, User } from "discord.js";

describe("MessageReactionCommand", () => {
  let discordService: jest.Mocked<
    IDiscordService<
      unknown,
      unknown,
      unknown,
      Client,
      unknown,
      unknown,
      unknown,
      MessageReaction,
      User
    >
  >;
  let logger: jest.Mocked<ILoggerService>;
  let registerMessageReaction: jest.Mocked<IRegisterMessageReaction>;
  let removeMessageReaction: jest.Mocked<IRemoveMessageReaction>;

  beforeEach(() => {
    discordService = {
      onReactionAdd: jest.fn(),
      onReactionRemove: jest.fn(),
    } as unknown as jest.Mocked<
      IDiscordService<
        unknown,
        unknown,
        unknown,
        Client,
        unknown,
        unknown,
        unknown,
        MessageReaction,
        User
      >
    >;
    logger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    registerMessageReaction = {
      execute: jest.fn().mockResolvedValue({ success: true, data: {} }),
    };
    removeMessageReaction = {
      execute: jest.fn().mockResolvedValue({ success: true, data: true }),
    };
    new MessageReactionCommand(
      discordService,
      logger,
      registerMessageReaction,
      removeMessageReaction,
    );
  });

  it("should register onReactionAdd handler on discordService", () => {
    expect(discordService.onReactionAdd).toHaveBeenCalledTimes(1);
    expect(discordService.onReactionAdd).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("should register onReactionRemove handler on discordService", () => {
    expect(discordService.onReactionRemove).toHaveBeenCalledTimes(1);
    expect(discordService.onReactionRemove).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("should call registerMessageReaction.execute and log when handler is invoked", async () => {
    const handler = (discordService.onReactionAdd as jest.Mock).mock
      .calls[0][0];

    const reactionMock = {
      partial: false,
      emoji: { name: "👍", id: null, identifier: "👍" },
      message: {
        id: "msg123",
        partial: false,
        fetch: jest.fn(),
        channel: {
          id: "ch123",
          name: "general",
          url: "https://discord.com/channels/guild/ch123",
        },
        guild: {
          id: "guild1",
          members: { resolve: jest.fn().mockReturnValue(null) },
        },
        createdTimestamp: Date.now(),
      },
      fetch: jest.fn(),
    };

    const userMock = {
      id: "user123",
      bot: false,
      username: "TestUser",
      globalName: "Test User",
      createdTimestamp: Date.now(),
    };

    await handler(reactionMock, userMock);

    expect(registerMessageReaction.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user123",
        messageId: "msg123",
        channelId: "ch123",
        reactionEmoji: "👍",
        username: "TestUser",
      }),
    );
    expect(logger.logToConsole).toHaveBeenCalledWith(
      "SUCCESS",
      "COMMAND",
      "MESSAGE_REACTION",
      expect.stringMatching(/user_id=user123.*message_id=msg123.*reaction=/),
    );
  });

  it("should not call use case when user is bot", async () => {
    const handler = (discordService.onReactionAdd as jest.Mock).mock
      .calls[0][0];

    const reactionMock = {
      partial: false,
      emoji: { name: "👍", id: null, identifier: "👍" },
      message: {
        id: "msg123",
        partial: false,
        channel: { id: "ch123" },
        guild: null,
        createdTimestamp: Date.now(),
      },
    };

    const userMock = {
      id: "bot456",
      bot: true,
      username: "Bot",
    };

    await handler(reactionMock, userMock);

    expect(registerMessageReaction.execute).not.toHaveBeenCalled();
  });

  it("should call removeMessageReaction.execute when remove handler is invoked", async () => {
    const handler = (discordService.onReactionRemove as jest.Mock).mock
      .calls[0][0];

    const reactionMock = {
      partial: false,
      emoji: { name: "👍", id: null, identifier: "👍" },
      message: {
        id: "msg123",
        partial: false,
        fetch: jest.fn(),
        channel: { id: "ch123" },
        guild: null,
        createdTimestamp: Date.now(),
      },
      fetch: jest.fn(),
    };

    const userMock = {
      id: "user123",
      bot: false,
      username: "TestUser",
    };

    await handler(reactionMock, userMock);

    expect(removeMessageReaction.execute).toHaveBeenCalledWith({
      userId: "user123",
      messageId: "msg123",
      reactionEmoji: "👍",
    });
    expect(logger.logToConsole).toHaveBeenCalledWith(
      "SUCCESS",
      "COMMAND",
      "MESSAGE_REACTION",
      expect.stringMatching(/Reaction removed:.*user_id=user123/),
    );
  });

  it("should not call remove use case when user is bot", async () => {
    const handler = (discordService.onReactionRemove as jest.Mock).mock
      .calls[0][0];

    await handler(
      {
        partial: false,
        emoji: { name: "👍", identifier: "👍" },
        message: { id: "msg123", partial: false, channel: { id: "ch" } },
      },
      { id: "bot1", bot: true },
    );

    expect(removeMessageReaction.execute).not.toHaveBeenCalled();
  });
});
