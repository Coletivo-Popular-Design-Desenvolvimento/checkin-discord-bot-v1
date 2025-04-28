// orquestra os useCases command de user.

import { GuildMember } from "discord.js";
import { CreateUserInput, ICreateUser } from "../../domain/interfaces/useCases/user/ICreateUser";
import { IUpdateUser } from "../../domain/interfaces/useCases/user/IUpdateUser";
import { UserStatus } from "../../domain/types/UserStatusEnum";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import { IUserCommand } from "../../domain/interfaces/commands/IUserCommand";
import { DiscordModule } from "../../contexts/DiscordModule";
import UserEvents from "../events/UserEvents";
import DiscordEvents from "../events/DiscordEvents";

export class UserCommand implements IUserCommand {
  constructor(
    private readonly logger: ILoggerService,
    private readonly createUser: ICreateUser,
    private readonly updateUser: IUpdateUser
  ) {
    this.setupEventHandlers();
  }

  async executeNewUser(userEvents: UserEvents): Promise<void> {
    try {
      userEvents.onNewUser(async (member) => {
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

  async executeAllUsers(discordEvents: DiscordEvents, userEvents: UserEvents): Promise<void> {
    try {
      discordEvents.onDiscordStart(async () => {
        const guildId = [...userEvents.client.guilds.cache.values()][0]
          ?.id;
        const guild = await userEvents.client.guilds.fetch(guildId);
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
  async executeUserLeave(userEvents: UserEvents): Promise<void> {
    try {
      userEvents.onUserLeave(async (member) => {
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

  private setupEventHandlers() {
    const userEvents = DiscordModule.getUserEvents();
    const discordEvents = DiscordModule.getDiscordEvents();
    this.executeNewUser(userEvents);
    this.executeAllUsers(discordEvents, userEvents);
    this.executeUserLeave(userEvents);
  }
}
