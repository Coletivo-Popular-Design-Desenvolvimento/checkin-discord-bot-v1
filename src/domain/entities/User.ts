import { UserStatus } from "@type/UserStatusEnum";

export class UserEntity {
  // Deveria ser User, mas o discord ja tem User, é MUITO chato ficar importando a coisa errada toda hora.
  constructor(
    public readonly id: number,
    public readonly discordId: string,
    public readonly username: string,
    public readonly bot: boolean,
    public readonly status: UserStatus,
    public readonly globalName?: string | null,
    public readonly joinedAt?: Date | null,
    public readonly discordCreatedAt?: Date | null,
    public readonly createAt?: Date | null,
    public readonly updateAt?: Date | null,
    public readonly lastActive?: Date | null,
    public readonly email?: string | null,
  ) {}
}
