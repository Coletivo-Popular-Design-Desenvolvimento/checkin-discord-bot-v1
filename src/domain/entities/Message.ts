export class MessageEntity {
  constructor(
    public readonly channelId: string,
    public readonly platformId: string,
    public readonly platformCreatedAt: Date,
    public readonly isDeleted: boolean,
    public readonly userId: string,
    public readonly id?: number | null,
    public readonly createdAt?: Date | null,
  ) {}
}
