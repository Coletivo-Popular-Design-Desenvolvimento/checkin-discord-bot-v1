export default interface IMessageEvents<Message, Client> {
    client: Client;
    registerEvents(): void;
    onMessage(handler: (message: Message) => void): void
}