import { UserEntity } from "./User";

export class RoleEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly platformCreatedAt: Date,
    public readonly user: UserEntity[],
  ) {}
}
