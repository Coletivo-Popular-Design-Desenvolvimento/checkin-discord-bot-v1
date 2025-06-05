export class AudioEventEntity {
  constructor(
    public readonly id: number,
    public readonly channelId: number,
    public readonly creatorId: number,
    public readonly name: string,
    public readonly statusId: number, // Represents the foreign key to EventStatus
    public readonly startAt: Date,
    public readonly endAt: Date,
    public readonly userCount: number,
    public readonly createdAt: Date,
    public readonly description?: string | null,
    public readonly image?: string | null,
  ) {}
}
