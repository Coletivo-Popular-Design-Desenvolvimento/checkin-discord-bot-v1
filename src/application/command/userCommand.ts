// orquestra os useCases command de user.

import { Client, GuildMember, Message, PartialGuildMember } from "discord.js";
import { IDiscordService } from "../../domain/interfaces/services/IDiscordService";
import {
  CreateUserInput,
  ICreateUser,
} from "../../domain/interfaces/useCases/user/ICreateUser";
import { IUpdateUser } from "../../domain/interfaces/useCases/user/IUpdateUser";
import { UserStatus } from "../../domain/types/UserStatusEnum";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../domain/types/LoggerContextEnum";
import { IUserCommand } from "../../domain/interfaces/commands/IUserCommand";

export class UserCommand implements IUserCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client
    >,
    private readonly logger: ILoggerService,
    private readonly createUser: ICreateUser,
    private readonly updateUser: IUpdateUser
  ) {
    this.executeNewUser();
    this.executeAllUsers();
    this.executeUserLeave();
  }
  async executeNewUser(): Promise<void> {
    try {
      this.discordService.onNewUser(async (member) => {
        await this.createUser.execute(UserCommand.toUserEntity(member));
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeNewUser | ${error.message}`
      );
    }
  }

  async executeAllUsers(): Promise<void> {
    try {
      this.discordService.onDiscordStart(async () => {
        const guildId = [...this.discordService.client.guilds.cache.values()][0]
          ?.id;
        const guild = await this.discordService.client.guilds.fetch(guildId);
        const members = await guild.members.fetch();
        this.createUser.executeMany(
          members.map((member) => UserCommand.toUserEntity(member))
        );
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeAllUsers | ${error.message}`
      );
    }
  }
  async executeUserLeave(): Promise<void> {
    try {
      this.discordService.onUserLeave(async (member) => {
        await this.updateUser.executeInvertUserStatus(member.id);
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeUserLeave | ${error.message}`
      );
    }
  }

  static toUserEntity(discordUser: GuildMember): CreateUserInput {
    return {
      discordId: discordUser.id,
      username: discordUser.user.username,
      globalName: discordUser.user.globalName,
      bot: discordUser.user.bot,
      status: UserStatus.ACTIVE,
      discordCreatedAt: discordUser.user.createdTimestamp
        ? new Date(discordUser.user.createdTimestamp)
        : undefined,
      joinedAt: discordUser.joinedTimestamp
        ? new Date(discordUser.joinedTimestamp)
        : undefined,
      lastActive: undefined,
    };
  }
}
