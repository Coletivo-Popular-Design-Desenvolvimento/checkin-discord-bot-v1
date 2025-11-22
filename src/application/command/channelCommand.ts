import { ChannelType, Client, GuildChannel, Message } from "discord.js";
import { IDiscordService } from "@services/IDiscordService";
import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "@services/ILogger";
import { SyncChannels } from "@domain/useCases/channel/SyncChannels";
import { CreateChannel } from "@domain/useCases/channel/CreateChannel";
import { UpdateChannel } from "@domain/useCases/channel/UpdateChannel";
import { DeleteChannel } from "@domain/useCases/channel/DeleteChannel";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IChannelCommand } from "@interfaces/commands/IChannelCommand";
import { ChannelEntity } from "@domain/entities/Channel";

export class ChannelCommand implements IChannelCommand {
  constructor(
    private readonly discordService: IDiscordService<
      Message,
      unknown,
      unknown,
      Client
    >,
    private readonly logger: ILoggerService,
    private readonly channelRepository: IChannelRepository,
  ) {
    this.syncChannelsUseCase = new SyncChannels(
      this.channelRepository,
      this.logger,
    );
    this.createChannelUseCase = new CreateChannel(
      this.channelRepository,
      this.logger,
    );
    this.updateChannelUseCase = new UpdateChannel(
      this.channelRepository,
      this.logger,
    );
    this.deleteChannelUseCase = new DeleteChannel(
      this.channelRepository,
      this.logger,
    );
    this.executeAllChannels();
    this.listenToChannelEvents();
  }

  private readonly syncChannelsUseCase: SyncChannels;
  private readonly createChannelUseCase: CreateChannel;
  private readonly updateChannelUseCase: UpdateChannel;
  private readonly deleteChannelUseCase: DeleteChannel;

  async executeAllChannels(): Promise<void> {
    try {
      this.discordService.onDiscordStart(async () => {
        const guildId = [...this.discordService.client.guilds.cache.values()][0]
          ?.id;

        if (!guildId) {
          this.logger.logToConsole(
            LoggerContextStatus.ERROR,
            LoggerContext.COMMAND,
            LoggerContextEntity.CHANNEL,
            "executeAllChannels | No guild found",
          );
          return;
        }

        const guild = await this.discordService.client.guilds.fetch(guildId);
        const channels = await guild.channels.fetch();

        const channelEntities = Array.from(channels.values())
          .filter(
            (channel) =>
              channel !== null &&
              !channel.isThread() &&
              channel.type !== ChannelType.GuildCategory,
          )
          .map((channel) =>
            ChannelCommand.toChannelEntity(channel as GuildChannel, guildId),
          );

        if (channelEntities.length > 0) {
          const result =
            await this.syncChannelsUseCase.execute(channelEntities);
          const createdCount =
            result && result.success && result.data ? result.data.created : 0;
          this.logger.logToConsole(
            LoggerContextStatus.SUCCESS,
            LoggerContext.COMMAND,
            LoggerContextEntity.CHANNEL,
            `executeAllChannels | ${createdCount} channels synchronized`,
          );
        }

        this.listenToChannelEvents();
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.CHANNEL,
        `executeAllChannels | ${error.message}`,
      );
    }
  }

  //LISTENERS DE CRIAÇÃO, ATUALIZAÇÃO E REMOÇÃO DE CANAIS
  listenToChannelEvents(): void {
    const client = this.discordService.client;

    //CANAL CRIADO
    client.on("channelCreate", async (discordChannel) => {
      try {
        if (
          discordChannel.isThread() ||
          discordChannel.type === ChannelType.GuildCategory
        )
          return;

        const guildId = discordChannel.guild.id;

        const channelEntity = ChannelCommand.toChannelEntity(
          discordChannel as GuildChannel,
          guildId,
        );

        await this.createChannelUseCase.execute(channelEntity);

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelCreate | Canal criado: ${discordChannel.name}`,
        );
      } catch (error) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelCreate | ${error.message}`,
        );
      }
    });

    //CANAL ATUALIZADO
    client.on("channelUpdate", async (oldChannel, newChannel) => {
      try {
        if (
          !newChannel ||
          newChannel.isThread() ||
          newChannel.type === ChannelType.GuildCategory
        )
          return;

        const updatedEntity = {
          platformId: newChannel.id,
          name: (newChannel as GuildChannel).name,
          url: undefined,
          createdAt: undefined,
        } as Partial<ChannelEntity>;

        await this.updateChannelUseCase.execute(newChannel.id, updatedEntity);

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelUpdate | Canal atualizado: ${(oldChannel as GuildChannel).name} → ${(newChannel as GuildChannel).name}`,
        );
      } catch (error) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelUpdate | ${error.message}`,
        );
      }
    });

    //CANAL DELETADO
    client.on("channelDelete", async (discordChannel) => {
      try {
        await this.deleteChannelUseCase.execute(discordChannel.id);

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelDelete | Canal deletado: ${(discordChannel as GuildChannel).name}`,
        );
      } catch (error) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.COMMAND,
          LoggerContextEntity.CHANNEL,
          `channelDelete | ${error.message}`,
        );
      }
    });
  }

  /**
   * Converte um channel do Discord para o Entity do banco
   */
  static toChannelEntity(
    discordChannel: GuildChannel,
    guildId: string,
  ): Omit<ChannelEntity, "id"> {
    const channelUrl =
      discordChannel.isTextBased() && discordChannel.id
        ? `https://discord.com/channels/${guildId}/${discordChannel.id}`
        : "";

    return {
      platformId: discordChannel.id,
      name: discordChannel.name || "Unknown",
      url: channelUrl,
      createdAt: discordChannel.createdTimestamp
        ? new Date(discordChannel.createdTimestamp)
        : new Date(),
      user: [],
      message: [],
      messageReaction: [],
    };
  }
}
