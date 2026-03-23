import {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { IDiscordService } from "@services/IDiscordService";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IRegisterMessageReaction } from "@interfaces/useCases/messageReaction/IRegisterMessageReaction";
import { RegisterMessageReactionInput } from "@interfaces/useCases/messageReaction/IRegisterMessageReaction";
import { Client } from "discord.js";

export class MessageReactionCommand {
  constructor(
    private readonly discordService: IDiscordService<
      unknown,
      unknown,
      unknown,
      Client,
      unknown,
      unknown,
      unknown,
      MessageReaction | PartialMessageReaction,
      User | PartialUser
    >,
    private readonly logger: ILoggerService,
    private readonly registerMessageReaction: IRegisterMessageReaction,
  ) {
    this.executeReactionHandler();
  }

  private executeReactionHandler(): void {
    try {
      this.discordService.onReactionAdd(this.handleReaction.bind(this));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.MESSAGE_REACTION,
        `executeReactionHandler | ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async handleReaction(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): Promise<void> {
    try {
      if (user.bot) {
        return;
      }

      if (reaction.partial) {
        await reaction.fetch();
      }
      if (reaction.message.partial) {
        await reaction.message.fetch();
      }

      const input = MessageReactionCommand.toRegisterMessageReactionInput(
        reaction,
        user,
      );

      const result = await this.registerMessageReaction.execute(input);

      const emojiLabel =
        reaction.emoji.name ??
        reaction.emoji.id ??
        reaction.emoji.identifier ??
        "";
      const logPayload = `user_id=${input.userId} message_id=${input.messageId} reaction=${emojiLabel}`;

      if (result.success) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.MESSAGE_REACTION,
          `Reaction registered: ${logPayload}`,
        );
      } else {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.MESSAGE_REACTION,
          `Failed to register reaction (${logPayload}): ${result.message ?? "Unknown error"}`,
        );
      }
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.MESSAGE_REACTION,
        `handleReaction | ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static toRegisterMessageReactionInput(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ): RegisterMessageReactionInput {
    const message = reaction.message;
    const channel = message.channel;
    const emoji =
      reaction.emoji.identifier ??
      reaction.emoji.name ??
      reaction.emoji.id ??
      "";

    let channelName = "Unknown Channel";
    let channelUrl = "";

    if (channel && "name" in channel && channel.name) {
      channelName = channel.name;
    }
    if (channel && "url" in channel && channel.url) {
      channelUrl = channel.url;
    } else if (message.guild && channel && "id" in channel) {
      channelUrl = `https://discord.com/channels/${message.guild.id}/${channel.id}`;
    }

    let userJoinedAt: Date | null = null;
    const member = message.guild?.members.resolve(user.id);
    if (member?.joinedAt) {
      userJoinedAt = member.joinedAt;
    }

    return {
      userId: user.id,
      messageId: message.id,
      channelId: channel.id,
      reactionEmoji: emoji,
      reactedAt: new Date(),
      username: "username" in user ? user.username : undefined,
      userGlobalName: "globalName" in user ? user.globalName : undefined,
      userBot: "bot" in user ? user.bot : undefined,
      userPlatformCreatedAt:
        "createdTimestamp" in user && user.createdTimestamp
          ? new Date(user.createdTimestamp)
          : undefined,
      userJoinedAt,
      channelName,
      channelUrl,
      messagePlatformCreatedAt: message.createdTimestamp
        ? new Date(message.createdTimestamp)
        : undefined,
    };
  }
}
