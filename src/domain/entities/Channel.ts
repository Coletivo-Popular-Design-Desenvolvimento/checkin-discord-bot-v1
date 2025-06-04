export default class ChannelEntity {
  constructor(
    public readonly id: number,
    public readonly discordId: string,
    public readonly name: string,
    public readonly url: string,
    //public readonly message: Message[]; # Adicionar apos criar entidades para fazer relacionamento #
    //public audioEvent: AudioEvent[]; # Adicionar apos criar entidades para fazer relacionamento #
    //public messageReaction: MessageReaction[]; # Adicionar apos criar entidades para fazer relacionamento #
    public readonly createAt: Date,
  ) {}
}
