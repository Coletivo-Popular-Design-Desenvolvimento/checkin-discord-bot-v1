import { RoleEntity } from "../../entities/Role";

export interface IRoleRepository {
  findById(id: number): Promise<RoleEntity | null>;
  findByUserId(id: string): Promise<RoleEntity | null>;
  findByUserPlatformId(id: string): Promise<RoleEntity | null>;
  findByPlatformId(id: string): Promise<RoleEntity | null>;
  listAll(limit?: number): Promise<RoleEntity[]>;
  updateById(id: number, role: Partial<RoleEntity>): Promise<RoleEntity | null>;
  deleteById(id: number): Promise<boolean>;
}
