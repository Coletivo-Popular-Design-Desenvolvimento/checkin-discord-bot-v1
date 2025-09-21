import { UserStatus } from "@type/UserStatusEnum";
import * as prisma from "@prisma/client";
import { MessageEntity } from "./Message";
import { MessageReactionEntity } from "./MessageReaction";
import { ChannelEntity } from "./Channel";
import { RoleEntity } from "./Role";
import { AudioEventEntity } from "./AudioEvent";

export class UserEntity {
  // Deveria ser User, mas o discord ja tem User, é MUITO chato ficar importando a coisa errada toda hora.
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly username: string,
    public readonly bot: boolean,
    public readonly status: UserStatus,
    public readonly globalName?: string | null,
    public readonly joinedAt?: Date | null,
    public readonly platformCreatedAt?: Date | null,
    public readonly createAt?: Date | null,
    public readonly updateAt?: Date | null,
    public readonly lastActive?: Date | null,
    public readonly email?: string | null,
    public readonly messages?: MessageEntity[],
    public readonly messageReactions?: MessageReactionEntity[],
    public readonly channels?: ChannelEntity[],
    public readonly roles?: RoleEntity[],
    public readonly audioEvents?: AudioEventEntity[],
  ) {}

  public static fromPersistence(
    user: prisma.User,
    messages?: prisma.Message[],
    reactions?: prisma.MessageReaction[],
    channels?: prisma.Channel[],
    roles?: prisma.Role[],
    audioEvents?: prisma.AudioEvent[],
  ): UserEntity {
    return new UserEntity(
      user.id,
      user.platform_id,
      user.username,
      user.bot,
      user.status,
      user.global_name,
      user.joined_at,
      user.platform_created_at,
      user.create_at,
      user.update_at,
      user.last_active,
      user.email,
      messages?.map(MessageEntity.fromPersistence),
      reactions?.map((reaction) =>
        MessageReactionEntity.fromPersistence(reaction),
      ),
      channels?.map((channel) => ChannelEntity.fromPersistence(channel)),
      roles?.map((role) => RoleEntity.fromPersistence(role)),
      audioEvents?.map((event) => AudioEventEntity.fromPersistence(event)),
    );
  }
}
