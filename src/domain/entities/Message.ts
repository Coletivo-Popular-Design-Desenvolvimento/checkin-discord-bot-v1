export class MessageEntity {
    constructor(
      public readonly channelId: number,
      public readonly discordId: string,
      public readonly discordCreatedAt: Date,
      public readonly isDeleted: boolean,
      public readonly userId: number,
      public readonly id?: number | null,
      public readonly createAt?: Date | null,
    ) {}
  }
  