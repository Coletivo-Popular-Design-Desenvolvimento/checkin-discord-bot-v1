import { Client, GuildChannel, GuildMember, Message, PartialGuildMember } from "discord.js";
import IDiscordEvents from "../../domain/interfaces/events/IDiscordEvents";
import IMessageEvents from "../../domain/interfaces/events/IMessageEvents";
import IUserEvents from "../../domain/interfaces/events/IUserEvents";
import IChannelEvents from "../../domain/interfaces/events/IChannelEvents";
import { Logger } from "../../application/services/Logger";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../domain/types/LoggerContextEnum";

export class DiscordService {
    constructor(
        private readonly client: Client,
        private readonly discordEvents: IDiscordEvents<Client>,
        private readonly messageEvents: IMessageEvents<Message,Client>,
        private readonly userEvents: IUserEvents<GuildMember, PartialGuildMember, Client>,
        private readonly channelEvents: IChannelEvents<GuildChannel, Client>,
        private readonly logger: Logger
    ) {}

    registerAllEvents() {
        try {
            this.discordEvents.registerEvents();
            this.messageEvents.registerEvents();
            this.userEvents.registerEvents();
            this.channelEvents.registerEvents();
            this.logger.logToConsole(
                LoggerContextStatus.SUCCESS,
                LoggerContext.SERVICE,
                LoggerContextEntity.SYSTEM,
                "EVENTOS REGISTRADO COM SUCESSO"
            );
        } catch (error) {
            this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.SERVICE,
                LoggerContextEntity.SYSTEM,
                "ERRO AO REGISTRAR EVENTOS"
            );
        }
    }

    async login(token: string) : Promise<void> {
        try {
            await this.client.login(token);
            //ADICIONAR LOG DE INICIALIZAÇÃO OK
        } catch (error) {
            throw new Error("ERRO AO REGISTRAR EVENTOS")   
        }
    }
}