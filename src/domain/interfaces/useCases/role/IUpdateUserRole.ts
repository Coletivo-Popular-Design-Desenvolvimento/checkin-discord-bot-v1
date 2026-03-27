import { GenericOutputDto } from "@dtos/GenericOutputDto";

export interface RoleInput {
  platformId: string;
  name: string;
  platformCreatedAt: Date;
}

export interface SyncUserRolesInput {
  userPlatformId: string;
  username: string;
  userGlobalName: string | null;
  userBot: boolean;
  userPlatformCreatedAt?: Date;
  userJoinedAt?: Date | null;
  roles: RoleInput[];
}

export interface SyncUserRolesResult {
  added: number;
  removed: number;
  total: number;
  isNewUser: boolean;
}

export interface IUpdateUserRole {
  syncUserRoles(
    input: SyncUserRolesInput,
  ): Promise<GenericOutputDto<SyncUserRolesResult>>;
}
