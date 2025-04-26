import { Client, Events, GuildChannel } from "discord.js";
import IChannelEvents from "../../domain/interfaces/events/IChannelEvents";


export default class ChannelEvents implements IChannelEvents<GuildChannel, Client> {
    public readonly client: Client
    private onNewChannelHandlers: ((channel: GuildChannel) => void)[] = [];
    private onUpdateChannelHandlers: ((oldChannel: GuildChannel, newChannel: GuildChannel) => void)[] = [];
    private onCopyAllChannelsForServer: ((client: Client) => void)[] = [];

    constructor(client: Client){
        this.client = client
    }   

    public registerEvents(): void {
        this.client.on(Events.ChannelCreate, (channel) => {
          this.onNewChannelHandlers.forEach((fn) => fn(channel));
        });

        this.client.on(Events.ChannelUpdate, (oldChannel, newChannel) => {
            if (oldChannel instanceof GuildChannel && newChannel instanceof GuildChannel) {
              this.onUpdateChannelHandlers.forEach((fn) => fn(oldChannel, newChannel))
            }
            else {
                throw new Error("Generic error: Erro não tratado | [ChannelEvents]")
            }
        });
    }

    public onChannelCreate(handler: (channel: GuildChannel) => void): void {
        this.onNewChannelHandlers.push(handler);
    }
    
    public onChannelUpdate(handler: (oldChannel: GuildChannel, newChannel: GuildChannel) => void): void {
        this.onUpdateChannelHandlers.push(handler);
    }

    public onCopyAllChannels(handler: (channel: Client) => void): void {
        this.onCopyAllChannelsForServer.push(handler);
    }
} 