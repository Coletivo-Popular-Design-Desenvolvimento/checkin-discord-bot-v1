import { UserEntity } from "@entities/User";

export interface IUserRepository {
  create(user: Omit<UserEntity, "id">): Promise<UserEntity>;
  createMany(users: Omit<UserEntity, "id">[]): Promise<number>;
  findById(id: number, includeInactive?: boolean): Promise<UserEntity | null>;
  findByPlatformId(
    id: string,
    includeInactive?: boolean,
  ): Promise<UserEntity | null>;
  listAll(limit?: number, includeInactive?: boolean): Promise<UserEntity[]>;
  updateById(id: number, user: Partial<UserEntity>): Promise<UserEntity | null>;
  deleteById(id: number): Promise<boolean>;
}
