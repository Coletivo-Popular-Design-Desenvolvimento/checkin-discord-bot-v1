export class MessageEntity {
  constructor(
    public readonly id: number,
    public readonly channelId: number,
    public readonly discordId: string,
    public readonly userId: number,
    public readonly discordCreatedAt: Date,
    public readonly createAt?: Date | null,
  ) {}
}
