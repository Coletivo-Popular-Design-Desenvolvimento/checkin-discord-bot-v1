import { Client, GatewayIntentBits } from "discord.js";
import DiscordEvents from "../application/events/DiscordEvents";
import UserEvents from "../application/events/UserEvents";
import ChannelEvents from "../application/events/ChannelEvents";
import MessageEvents from "../application/events/MessageEvents";
import { Logger } from "../application/services/Logger";
import { DiscordService } from "../infrastructure/discord/DiscordService";

const EVENT_INTENTS_MAP = {
    ClientReady: [],
    MessageCreate: [GatewayIntentBits.GuildMessages],
    GuildMemberAdd: [GatewayIntentBits.GuildMembers,GatewayIntentBits.Guilds],
  } as const;

export class DiscordModule {
    private static instance: DiscordService;
    private static client: Client;
    private static channelEvents: ChannelEvents;
    private static discordEvents: DiscordEvents;
    private static messageEvents: MessageEvents;
    private static userEvents: UserEvents;

    static intiialize(logger: Logger): DiscordService {
        if (this.instance) return this.instance;
        const intents = Object.values(EVENT_INTENTS_MAP).flat();

        this.client = new Client({intents})
        this.channelEvents = new ChannelEvents(this.client);
        this.discordEvents = new DiscordEvents(this.client);
        this.messageEvents = new MessageEvents(this.client);
        this.userEvents = new UserEvents(this.client);

        this.instance = new DiscordService(
            this.client,
            this.discordEvents,
            this.messageEvents,
            this.userEvents,
            this.channelEvents,
            logger
        );
        return this.instance;
    }

    static getInstance(): DiscordService {
        if (!this.instance) {
            throw new Error("DiscordModule not initialized");
        }
        return this.instance;
    }

    static getChannelEvents(): ChannelEvents {
        if(!this.channelEvents) {
            throw new Error("ChannelEvents not initialized");
        }
        return this.channelEvents;
    }

    static getUserEvents(): UserEvents {
        if (!this.userEvents) {
          throw new Error("UserEvents not initialized");
        }
        return this.userEvents;
    }
    
    static getDiscordEvents(): DiscordEvents {
        if (!this.discordEvents) {
            throw new Error("DiscordEvents not initialized");
        }
        return this.discordEvents;
    }
}
