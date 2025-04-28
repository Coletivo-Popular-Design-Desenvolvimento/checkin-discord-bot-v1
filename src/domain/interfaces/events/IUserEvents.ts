export default interface IUserEvents<GuildMember, PartialGuildMember, Client> {
    client: Client;
    registerEvents(): void;
    onNewUser(handler: (member: GuildMember) => void): void;
    onUserLeave(handler: (member: GuildMember) => void): void;
}