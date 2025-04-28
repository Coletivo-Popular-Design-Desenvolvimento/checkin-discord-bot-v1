import { Client, Events, GuildMember, Message, PartialGuildMember } from "discord.js";
import IUserEvents from "../../domain/interfaces/events/IUserEvents";

export default class UserEvents implements IUserEvents<GuildMember, PartialGuildMember, Client> {
    public readonly client: Client;
    private onNewUserHandlers: ((member: GuildMember) => void)[] = [];
    private onUserLeaveHandlers: ((member: GuildMember | PartialGuildMember) => void)[] = [];

    constructor(client: Client){
        this.client = client;
    }

    registerEvents(): void {
        this.client.on(Events.GuildMemberAdd, (member) => { 
            this.onNewUserHandlers.forEach((fn) => fn(member));
        });

        //caso de excessao, pois esse evento compartilha o intent com GuildMemberAdd
        this.client.on(Events.GuildMemberRemove, (member) => {
            this.onUserLeaveHandlers.forEach((fn) => fn(member));
        });
    }

    onNewUser(handler: (member: GuildMember) => void): void {
        this.onNewUserHandlers.push(handler);
    }

    onUserLeave(handler: (member: GuildMember) => void): void {
        this.onUserLeaveHandlers.push(handler);
    }
}