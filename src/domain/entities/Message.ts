import { Message, User, Channel, MessageReaction } from "@prisma/client";
import { UserEntity } from "./User";
import { ChannelEntity } from "./Channel";
import { MessageReactionEntity } from "./MessageReaction";

export class MessageEntity {
  constructor(
    public readonly channel: ChannelEntity | null,
    public readonly user: UserEntity | null,
    public readonly messageReactions: MessageReactionEntity[],
    public readonly platformId: string,
    public readonly platformCreatedAt: Date,
    public readonly isDeleted: boolean,
    public readonly id?: number | null,
    public readonly createdAt?: Date | null,
  ) {}

  public static fromPersistence(
    message: Message,
    user?: User,
    channel?: Channel,
    messageReactions?: MessageReaction[],
  ): MessageEntity {
    return new MessageEntity(
      channel && ChannelEntity.fromPersistence(channel),
      user && UserEntity.fromPersistence(user),
      (messageReactions || []).map((mr) =>
        MessageReactionEntity.fromPersistence(mr),
      ),
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.id,
      message.created_at,
    );
  }
}
