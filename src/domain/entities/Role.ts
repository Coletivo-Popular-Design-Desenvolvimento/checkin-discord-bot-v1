import * as prisma from "@prisma/client";
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

  public static fromPersistence(
    role: prisma.Role,
    users?: prisma.User[],
  ): RoleEntity {
    return new RoleEntity(
      role.id,
      role.platform_id,
      role.name,
      role.created_at,
      role.platform_created_at,
      users?.map((user) => UserEntity.fromPersistence(user)),
    );
  }
}
