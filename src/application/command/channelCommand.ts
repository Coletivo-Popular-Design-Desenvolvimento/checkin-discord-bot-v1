import { GuildChannel } from "discord.js";
import IChannelCommand from "../../domain/interfaces/commands/IChannelCommand";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import ICreateChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateChannelUseCase";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import IUpdateChannelUseCase, { CreateChannelInput } from "../../domain/interfaces/useCases/channel/IUpdateChannelUseCase";
import ICreateManyChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateManyChannelUseCase";
import {DiscordModule} from "../../contexts/DiscordModule";
import ChannelEvents from "../events/ChannelEvents";
import DiscordEvents from "../events/DiscordEvents";

export class ChannelCommand implements IChannelCommand {
    constructor(
        private readonly logger: ILoggerService,
        private readonly createChannel: ICreateChannelUseCase,
        private readonly updateChannel: IUpdateChannelUseCase,
        private readonly createManyChannels: ICreateManyChannelUseCase
    ) {
        this.setupEventHandlers();
    }

    async executeNewChannel(channelEvents: ChannelEvents): Promise<void> {
        channelEvents.onChannelCreate(async (c) => {
            const result = await this.createChannel.executeAsync(this.mapToChannelEntity(c));
            if (!result.success) {
                this.logger.logToConsole(
                    LoggerContextStatus.ERROR,
                    LoggerContext.COMMAND,
                    LoggerContextEntity.CHANNEL,
                    `executeNewChannel | ${result.message}`
                );
            }
        });
    }

    async executeUpdateChannelExisting(channelEvents: ChannelEvents): Promise<void> {
        channelEvents.onChannelUpdate(async (oldChannel, newCHannel) => {
            const result = await this.updateChannel.executeAsync(oldChannel, this.mapToChannelEntity(newCHannel));
            if(!result.success) {
                this.logger.logToConsole(
                    LoggerContextStatus.ERROR,
                    LoggerContext.COMMAND,
                    LoggerContextEntity.CHANNEL,
                    `executeUpdateChannel | ${result.message}`
                );
            }
        });
    }

    async executeCopyAllChannelsExisting(channelEvents: ChannelEvents, discordEvents: DiscordEvents): Promise<void> {
        discordEvents.onDiscordStart(async () => {
            const guildId = [...channelEvents.client.guilds.cache.values()][0]?.id;
            const guild = await channelEvents.client.guilds.fetch(guildId);
            const channels = await guild.channels.fetch();
            this.createManyChannels.executeAsync(channels);
        });
    }

    private mapToChannelEntity(discordChannel: GuildChannel): CreateChannelInput {
        return {
            discordId: discordChannel.id,
            name: discordChannel.name,
            url: discordChannel.url,
            createAt: discordChannel.createdAt ? new Date(discordChannel.createdTimestamp) : undefined
        }
    }

    private setupEventHandlers(): void {
        const channelEvents = DiscordModule.getChannelEvents();
        const discordEvents = DiscordModule.getDiscordEvents();
        this.executeNewChannel(channelEvents);
        this.executeUpdateChannelExisting(channelEvents);
        this.executeCopyAllChannelsExisting(channelEvents, discordEvents);
    }
}