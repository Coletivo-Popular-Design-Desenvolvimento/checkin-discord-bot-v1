import { Client, Events, Message } from "discord.js";
import IMessageEvents from "../../domain/interfaces/events/IMessageEvents";

export default class MessageEvents implements IMessageEvents<Message, Client> {
    public readonly client: Client;
    private onMessageHandlers: ((message: Message) => void)[] = [];
    
    constructor(client: Client) {
        this.client = client;
    }
    
    registerEvents(): void {
        this.client.on(Events.MessageCreate, (message) => {
            this.onMessageHandlers.forEach((fn) => fn(message));
        });
    }
    
    onMessage(handler: (message: Message) => void): void {
        this.onMessageHandlers.push(handler);
    }
}