import { Client, Message } from "discord.js";
import { IDiscordService } from "@services/IDiscordService";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IRegisterMessage } from "@interfaces/useCases/message/IRegisterMessage";
import { RegisterMessageInput } from "@interfaces/useCases/message/IRegisterMessage";

export class MessageCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      unknown,
      unknown,
      Client
    >,
    private readonly logger: ILoggerService,
    private readonly registerMessage: IRegisterMessage,
  ) {
    this.executeMessage();
  }

  async executeMessage(): Promise<void> {
    try {
      this.discordService.onMessage(async (message) => {
        if (message.author.bot) {
          return;
        }

        if (!message.guild) {
          return;
        }

        const input = MessageCommand.toRegisterMessageInput(message);
        const result = await this.registerMessage.execute(input);

        if (result.success) {
          this.logger.logToConsole(
            LoggerContextStatus.SUCCESS,
            LoggerContext.COMMAND,
            LoggerContextEntity.MESSAGE,
            `Message registered successfully: ${message.id}`,
          );
        } else {
          this.logger.logToConsole(
            LoggerContextStatus.ERROR,
            LoggerContext.COMMAND,
            LoggerContextEntity.MESSAGE,
            `Failed to register message: ${result.message || "Unknown error"}`,
          );
        }
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.MESSAGE,
        `executeMessage | ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  static toRegisterMessageInput(message: Message): RegisterMessageInput {
    let channelName = "Unknown Channel";
    let channelUrl = "";

    if (message.channel && "name" in message.channel && message.channel.name) {
      channelName = message.channel.name;
    }

    if (message.channel && "url" in message.channel && message.channel.url) {
      channelUrl = message.channel.url;
    } else if (message.guild && message.channel && "id" in message.channel) {
      channelUrl = `https://discord.com/channels/${message.guild.id}/${message.channel.id}`;
    }

    let userJoinedAt: Date | null = null;
    if (message.member && message.member.joinedAt) {
      userJoinedAt = message.member.joinedAt;
    }

    return {
      platformId: message.id,
      platformCreatedAt: new Date(message.createdTimestamp),
      channelId: message.channel.id,
      userId: message.author.id,
      channelName: channelName,
      channelUrl: channelUrl,
      username: message.author.username,
      userGlobalName: message.author.globalName,
      userBot: message.author.bot,
      userPlatformCreatedAt: message.author.createdTimestamp
        ? new Date(message.author.createdTimestamp)
        : undefined,
      userJoinedAt: userJoinedAt,
    };
  }
}
