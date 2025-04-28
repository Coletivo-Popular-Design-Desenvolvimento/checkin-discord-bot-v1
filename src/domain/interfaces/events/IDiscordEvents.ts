export default interface IDiscordEvents<Client> {
    client: Client;
    registerEvents(): void
    onDiscordStart(handler: () => void): void
}