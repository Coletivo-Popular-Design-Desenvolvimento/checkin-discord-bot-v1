import { Client, Events } from "discord.js";
import IDiscordEvents from "../../domain/interfaces/events/IDiscordEvents";

export default class DiscordEvents implements IDiscordEvents<Client> {
    public readonly client: Client;
    private onDiscordStartHandlers: (() => void)[] = [];

    constructor(client: Client) {
        this.client = client;
    }

    registerEvents(): void {
        this.client.once(Events.ClientReady, () => {
            this.onDiscordStartHandlers.forEach((fn) => fn());
        });
    }

    onDiscordStart(handler: () => void): void {
        this.onDiscordStartHandlers.push(handler);
    }
}