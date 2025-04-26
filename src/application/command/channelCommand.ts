import { Channel, Client, Collection, GuildChannel } from "discord.js";
import IChannelCommand from "../../domain/interfaces/commands/IChannelCommand";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import ICreateChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateChannelUseCase";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import IUpdateChannelUseCase, { CreateChannelInput } from "../../domain/interfaces/useCases/channel/IUpdateChannelUseCase";
import IChannelEvents from "../../domain/interfaces/events/IChannelEvents";
import ICreateManyChannelUseCase from "../../domain/interfaces/useCases/channel/ICreateManyChannelUseCase";


export class ChannelCommand implements IChannelCommand {
    constructor(
        //ToDo: Verificar discordService é necessario ou implementar ChannelManager para manipulação de canais.
        // Adicionando dependencia para utilizar base e implementar o IOC.
        private readonly channelEvents: IChannelEvents<GuildChannel,Client>,
        private readonly logger: ILoggerService,
        private readonly createChannel: ICreateChannelUseCase,
        private readonly updateChannel: IUpdateChannelUseCase,
        private readonly createManyChannels: ICreateManyChannelUseCase
    ) {
        this.executeNewChannel();
        this.executeUpdateChannelExisting();
        this.executeCopyAllChannelsExisting();
    }

    async executeNewChannel(): Promise<void> {
        this.channelEvents.onChannelCreate(async (c) => {
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

    async executeUpdateChannelExisting(): Promise<void> {
        this.channelEvents.onChannelUpdate(async (oldChannel, newCHannel) => {
            const result = await this.updateChannel.executeAsync(oldChannel, this.mapToChannelEntity(newCHannel));
            if(!result.success) {
                this.logger.logToConsole(
                    LoggerContextStatus.ERROR,
                    LoggerContext.COMMAND,
                    LoggerContextEntity.CHANNEL,
                    `executeUpdateChannel | ${result.message}`
                );
            }
        })
    }

    async executeCopyAllChannelsExisting(): Promise<void> {
        this.channelEvents.onCopyAllChannels(async (client) => {
            const channels: CreateChannelInput[] = this.mapToManyChannelEntity(client.channels.cache)
            const result = await this.createManyChannels.executeAsync(channels);
            if (!result) {
                this.logger.logToConsole(
                    LoggerContextStatus.ERROR,
                    LoggerContext.COMMAND,
                    LoggerContextEntity.CHANNEL,
                    `executeUpdateChannel | ERRO AO ADICIONAR MUITOS CANAIS`
                );
            }
        })
        throw new Error();
    }

    private mapToManyChannelEntity(channels: Collection<string, Channel>): CreateChannelInput[] {
        const channelInputs: CreateChannelInput[] = []
        channels.forEach((channel, id) => {
            let channelName: string | undefined;
            if(channel instanceof GuildChannel){
                channelName = channel.name
            }
            channelInputs.push({
                discordId: id,
                name: channelName,
                url: channel.url,
                createAt: channel.createdAt ? new Date(channel.createdTimestamp) : undefined
            });
        });
        return channelInputs;
    }
    
    private mapToChannelEntity(discordChannel: GuildChannel): CreateChannelInput {
        return {
            discordId: discordChannel.id,
            name: discordChannel.name,
            url: discordChannel.url,
            createAt: discordChannel.createdAt ? new Date(discordChannel.createdTimestamp) : undefined
        }
    }
}