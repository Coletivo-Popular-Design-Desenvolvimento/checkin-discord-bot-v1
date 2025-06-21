export class MessageReactionEntity {
  constructor(
    public readonly userId: string,
    public readonly messageId: string,
    public readonly channelId: string,
  ) {}
}
