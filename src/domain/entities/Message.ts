import { Message, User, Channel, MessageReaction } from "@prisma/client";
import { UserEntity } from "./User";
import { ChannelEntity } from "./Channel";
import { MessageReactionEntity } from "./MessageReaction";

export class MessageEntity {
  constructor(
    public readonly channel: ChannelEntity,
    public readonly user: UserEntity,
    public readonly messageReactions: MessageReactionEntity[],
    public readonly platformId: string,
    public readonly platformCreatedAt: Date,
    public readonly isDeleted: boolean,
    public readonly id?: number | null,
    public readonly createdAt?: Date | null,
  ) {}

  // Método para criar MessageEntity com relacionamentos completos
  public static fromPersistence(
    message: Message & {
      user: User;
      channel: Channel;
      messageReaction?: MessageReaction[];
    },
  ): MessageEntity {
    const userEntity = UserEntity.fromPersistence(message.user);
    const channelEntity = ChannelEntity.fromPersistence(message.channel);

    const messageReaction = message.messageReaction
      ? message.messageReaction.map((mr) =>
          MessageReactionEntity.fromPersistence(mr),
        )
      : [];

    return new MessageEntity(
      channelEntity,
      userEntity,
      messageReaction,
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.id,
      message.created_at,
    );
  }
}
