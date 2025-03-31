import { UserStatus } from "../types/UserStatusEnum";

export class UserEntity {
  // Deveria ser User, mas o discord ja tem User, é MUITO chato ficar importando a coisa errada toda hora.
  constructor(
    public readonly id: number,
    public readonly discordId: string,
    public readonly username: string,
    public readonly bot: boolean,
    public readonly status: UserStatus,
    public readonly globalName?: string | null,
    public readonly joinedAt?: number | null,
    public readonly createdAt?: number | null,
    public readonly updateAt?: number | null,
    public readonly lastActive?: number | null,
    public readonly email?: string | null
  ) {}
}
