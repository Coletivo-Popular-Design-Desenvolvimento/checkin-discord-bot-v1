import { Channel, Message, MessageReaction, User } from "@prisma/client";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { MessageReactionEntity } from "@entities/MessageReaction";

export class ChannelEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly createdAt: Date,
    public readonly user?: UserEntity[],
    public readonly message?: MessageEntity[],
    public readonly messageReaction?: MessageReactionEntity[],
  ) {}

  public static fromPersistence(
    channel: Channel,
    user?: User[],
    message?: Message[],
    messageReaction?: MessageReaction[],
  ): ChannelEntity {
    return new ChannelEntity(
      channel.id,
      channel.platform_id,
      channel.name,
      channel.url,
      channel.created_at,
      (user ?? []).map((user) => UserEntity.fromPersistence(user)) || [],
      (message ?? []).map((message) =>
        MessageEntity.fromPersistence(message),
      ) || [],
      (messageReaction || []).map((messageReaction) =>
        MessageReactionEntity.fromPersistence(messageReaction),
      ) || [],
    );
  }
}
