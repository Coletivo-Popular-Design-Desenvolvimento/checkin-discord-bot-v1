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

  // Método mantido para compatibilidade com código existente
  // Cria MessageEntity com IDs primitivos (será usado temporariamente)
  public static fromPersistence(message: Message): MessageEntity {
    // Para manter compatibilidade, criamos entidades simples com apenas os IDs
    // Isso será substituído quando o repositório for atualizado
    const channelEntity = new ChannelEntity(
      0, // id temporário
      message.channel_id,
      "temp-channel", // nome temporário
      "temp-url", // url temporária
      new Date(), // data temporária
    );

    const userEntity = new UserEntity(
      0, // id temporário
      message.user_id,
      "temp-user", // username temporário
      false, // bot temporário
      1, // status temporário
      null, // globalName
      null, // joinedAt
      null, // platformCreatedAt
      null, // createAt
      null, // updateAt
      null, // lastActive
      null, // email
    );

    return new MessageEntity(
      channelEntity,
      userEntity,
      [], // messageReactions vazio por enquanto
      message.platform_id,
      message.platform_created_at,
      message.is_deleted,
      message.id,
      message.created_at,
    );
  }

  // Novo método para criar MessageEntity com relacionamentos completos
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
