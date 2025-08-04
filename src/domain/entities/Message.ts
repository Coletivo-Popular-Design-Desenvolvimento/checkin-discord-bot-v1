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

    // ! TODO: usar o método fromPersistence para MessageReactionEntity que tá lá no branch da feat/channel
    // const messageReaction = message.messageReaction
    //   ? message.messageReaction.map((mr) =>
    //       MessageReactionEntity.fromPersistence(mr),
    //     )
    //   : [];

    return new MessageEntity(
      channelEntity,
      userEntity,
      [],
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.id,
      message.created_at,
    );
  }

  // Getter para compatibilidade com código que espera channelId
  public get channelId(): string {
    return this.channel.platformId;
  }

  // Getter para compatibilidade com código que espera userId
  public get userId(): string {
    return this.user.platformId;
  }
}
