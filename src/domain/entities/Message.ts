import { Message } from "@prisma/client";

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

  public static fromPersistence(message: Message): MessageEntity {
    return new MessageEntity(
      message.channel_id,
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.user_id,
      message.id,
      message.created_at,
    );
  }
}
