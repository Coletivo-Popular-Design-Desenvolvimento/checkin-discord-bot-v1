import { Prisma } from "@prisma/client";
import { UserEntity } from "./User";

//
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
    role: Prisma.RoleGetPayload<{
      include: { user_role: { include: { user: true } } };
    }>,
  ): RoleEntity {
    const test = new RoleEntity(
      role.id,
      role.platform_id,
      role.name,
      role.created_at,
      role.platform_created_at,
      role.user_role.map((userRole) =>
        UserEntity.fromPersistence(userRole.user),
      ),
    );
    return test;
  }
}
