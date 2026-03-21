import { RoleEntity } from "../../entities/Role";

export type CreateRoleInput = Omit<RoleEntity, "id" | "createdAt" | "user">;

export interface IRoleRepository {
  findById(id: number): Promise<RoleEntity | null>;
  findByUserPlatformId(id: string): Promise<RoleEntity[] | null>;
  findByPlatformId(id: string): Promise<RoleEntity | null>;
  listAll(limit?: number): Promise<RoleEntity[]>;
  updateById(id: number, role: Partial<RoleEntity>): Promise<RoleEntity | null>;
  deleteById(id: number): Promise<boolean>;
  create(role: CreateRoleInput): Promise<RoleEntity>;
  assignRoleToUser(
    rolePlatformId: string,
    userPlatformId: string,
  ): Promise<boolean>;
  removeRoleFromUser(
    rolePlatformId: string,
    userPlatformId: string,
  ): Promise<boolean>;
}
