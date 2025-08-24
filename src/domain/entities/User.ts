import { UserStatus } from "@type/UserStatusEnum";
import { Message, User } from "@prisma/client";
import { MessageEntity } from "./Message";

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
  ) {}

  public static fromPersistence(user: User, messages?: Message[]): UserEntity {
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
    );
  }
}
