export default interface IChannelEvents<Channel, Client> {
    client: Client;
    registerEvents(): void
    onChannelCreate(handler: (channel: Channel) => void): void
    onChannelUpdate(handler: (oldChannel: Channel, newChannel: Channel) => void): void
}