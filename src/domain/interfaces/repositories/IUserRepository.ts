import { UserEntity } from "../../entities/User";

export interface IUserRepository {
  create(user: Omit<UserEntity, "id">): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByDiscordId(id: string): Promise<UserEntity | null>;
  listAll(limit?: number): Promise<UserEntity[]>;
  updateById(id: number, user: Partial<UserEntity>): Promise<UserEntity | null>;
  deleteById(id: number): Promise<boolean>;
  deleteByDiscordId(id: string): Promise<boolean>;
}
