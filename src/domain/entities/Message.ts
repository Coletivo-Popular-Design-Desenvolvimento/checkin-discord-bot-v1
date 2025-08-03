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
  public static fromPersistenceWithRelations(
    message: Message & {
      user: User;
      channel: Channel;
      message_reaction?: MessageReaction[];
    },
  ): MessageEntity {
    const userEntity = UserEntity.fromPersistence(message.user);
    const channelEntity = ChannelEntity.fromPersistence(message.channel);

    // Evita referência circular - MessageReactions serão adicionados posteriormente se necessário
    const messageReactions: MessageReactionEntity[] = [];

    return new MessageEntity(
      channelEntity,
      userEntity,
      messageReactions,
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
