import { Client, GuildChannel, Message, PartialGuildMember } from "discord.js";
import IChannelCommand from "../../domain/interfaces/commands/IChannelCommand";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import ICreateChannelUseCase, { CreateChannelInput } from "../../domain/interfaces/useCases/channel/ICreateChannelUseCase";
import { IDiscordService } from "../../domain/interfaces/services/IDiscordService";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import IUpdateChannelUseCase from "../../domain/interfaces/useCases/channel/IUpdateChannelUseCase";


export class ChannelCommand implements IChannelCommand {
    constructor(
        //ToDo: Verificar discordService é necessario ou implementar ChannelManager para manipulação de canais.
        // Adicionando dependencia para utilizar base e implementar o IOC.
        private readonly discordService: IDiscordService<Message, GuildChannel, PartialGuildMember, Client>,
        private readonly logger: ILoggerService,
        private readonly createChannel: ICreateChannelUseCase,
        private readonly updateChannel: IUpdateChannelUseCase
    ) {
        this.executeNewChannel();
        this.executeUpdateChannelExisting();
    }

    async executeNewChannel(): Promise<void> {
        this.discordService.onChannelCreate(async (c) => {
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
        this.discordService.onChannelUpdate(async (oldChannel, newCHannel) => {
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

    private mapToChannelEntity(discordChannel: GuildChannel): CreateChannelInput {
        return {
            discordId: discordChannel.id,
            name: discordChannel.name,
            url: discordChannel.url,
            createAt: discordChannel.createdAt ? new Date(discordChannel.createdTimestamp) : undefined
        }
    }
}