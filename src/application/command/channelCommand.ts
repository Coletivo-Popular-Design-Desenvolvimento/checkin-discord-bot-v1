import { Client, GuildMember, Message, PartialGuildMember } from "discord.js";
import IChannelCommand from "../../domain/interfaces/commands/IChannelCommand";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import ICreateChannel from "../../domain/interfaces/useCases/channel/ICreateChannel";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";
import { OperationCanceledException } from "typescript";
import { IDiscordService } from "../../domain/interfaces/services/IDiscordService";


export class ChannelCommand implements IChannelCommand {
    constructor(
        //ToDo: Verificar discordService é necessario ou implementar ChannelManager para manipulação de canais.
        // Adicionando dependencia para utilizar base e implementar o IOC.
        private readonly discordService: IDiscordService<Message, GuildMember, PartialGuildMember, Client>,
        private readonly logger: ILoggerService,
        private readonly createChannel: ICreateChannel
    ) {}

    async executeNewChannel(): Promise<void> {
        throw OperationCanceledException;
    }
}