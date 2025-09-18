import { IChannelCommand } from "@domain/interfaces/commands/IChannelCommand";
import { IDiscordService } from "@domain/interfaces/services/IDiscordService";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  CreateChannelType,
  ICreateChannel,
} from "@domain/interfaces/useCases/channel/ICreateChannel";
import { IDeleteChannel } from "@domain/interfaces/useCases/channel/IDeleteChannel";
import { IUpdateChannel } from "@domain/interfaces/useCases/channel/IUpdateChannel";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import {
  Client,
  Events,
  GuildChannel,
  GuildMember,
  Message,
  PartialGuildMember,
  PermissionsBitField,
} from "discord.js";

export class ChannelCommand implements IChannelCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      GuildMember,
      PartialGuildMember,
      Client
    >,
    private readonly logger: ILoggerService,
    private readonly createChannel: ICreateChannel,
    private readonly updateChannel: IUpdateChannel,
    private readonly deleteChannel: IDeleteChannel,
  ) {
    this.handleCreateChannel();
    this.handleUpdateChannel();
    this.handleDeleteChannel();
  }

  private get discordClient(): Client {
    return this.discordService.client;
  }

  public async handleCreateChannel(): Promise<void> {
    try {
      this.discordClient.on(
        Events.ChannelCreate,
        this.onChannelCreated.bind(this),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.CHANNEL,
        `Fail to create channel, \ncause:\n ${error.message}`,
      );
    }
  }

  public async handleUpdateChannel(): Promise<void> {
    try {
      this.discordClient.on(
        Events.ChannelUpdate,
        this.onChannelUpdated.bind(this),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.CHANNEL,
        `Fail to update channel, \ncause:\n ${error.message}`,
      );
    }
  }

  public async handleDeleteChannel(): Promise<void> {
    try {
      this.discordClient.on(
        Events.ChannelDelete,
        this.onChannelDeleted.bind(this),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.CHANNEL,
        `Fail to delete channel, \ncause:\n ${error.message}`,
      );
    }
  }

  private async onChannelCreated(channel: GuildChannel): Promise<void> {
    this.checkIfBotHasChannelPermissions(channel);
    await this.createChannel.execute(
      ChannelCommand.toChannelCreateEntity(channel),
    );
  }

  private async onChannelUpdated(channel: GuildChannel): Promise<void> {
    this.checkIfBotHasChannelPermissions(channel);
    await this.updateChannel.execute(
      channel.id,
      ChannelCommand.toChannelCreateEntity(channel),
    );
  }

  private async onChannelDeleted(channel: GuildChannel): Promise<void> {
    this.checkIfBotHasChannelPermissions(channel);
    await this.deleteChannel.execute(channel.id);
  }

  private checkIfBotHasChannelPermissions(channel: GuildChannel): void {
    if (!channel.guild) {
      console.log("❌ Canal não pertence a uma guild");
      return;
    }

    const botMember = channel.guild.members.cache.get(
      this.discordClient.user.id,
    );
    if (!botMember) {
      console.log("❌ Bot member não encontrado na guild do canal");
      return;
    }

    const requiredPermissions = [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ManageChannels,
    ];

    const hasPermissions = requiredPermissions.every((permission) =>
      channel.permissionsFor(botMember).has(permission),
    );

    if (!hasPermissions) {
      console.log("❌ Bot falta permissões no canal:");
      requiredPermissions.forEach((permission) => {
        const hasPerm = channel.permissionsFor(botMember).has(permission);
        console.log(`   ${hasPerm ? "✅" : "❌"} ${permission}`);
      });
    }
  }

  private static toChannelCreateEntity(
    discordChannel: GuildChannel,
  ): CreateChannelType {
    return {
      platformId: discordChannel.id,
      name: discordChannel.name,
      url: discordChannel.url,
      createdAt: discordChannel.createdAt,
    };
  }
}
