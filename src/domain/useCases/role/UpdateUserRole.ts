import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { IRoleRepository } from "@repositories/IRoleRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import {
  IUpdateUserRole,
  RoleInput,
  SyncUserRolesInput,
  SyncUserRolesResult,
} from "@interfaces/useCases/role/IUpdateUserRole";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { UserStatus } from "@type/UserStatusEnum";

export class UpdateUserRole implements IUpdateUserRole {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository,
    private readonly createUser: ICreateUser,
    private readonly logger: ILoggerService,
  ) {}

  async syncUserRoles(
    input: SyncUserRolesInput,
  ): Promise<GenericOutputDto<SyncUserRolesResult>> {
    try {
      const { isNew } = await this.ensureUserExists(input);

      let added = 0;
      let removed = 0;

      if (isNew) {
        added = await this.addRoles(input.userPlatformId, input.roles);
      } else {
        const result = await this.diffAndSyncRoles(
          input.userPlatformId,
          input.roles,
        );
        added = result.added;
        removed = result.removed;
      }

      return {
        data: {
          added,
          removed,
          total: input.roles.length,
          isNewUser: isNew,
        },
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.ROLE,
        `UpdateUserRole.syncUserRoles | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  private async diffAndSyncRoles(
    userPlatformId: string,
    discordRoles: RoleInput[],
  ): Promise<{ added: number; removed: number }> {
    const dbRoles =
      await this.roleRepository.findByUserPlatformId(userPlatformId);
    const dbRoleIds = new Set(dbRoles?.map((r) => r.platformId) ?? []);
    const discordRoleIds = new Set(discordRoles.map((r) => r.platformId));

    // Cargos a adicionar: usuario tem mas nao temos registro
    const toAdd = discordRoles.filter((r) => !dbRoleIds.has(r.platformId));

    // Cargos a remover: temos no BD mas nao no discord
    const toRemove =
      dbRoles?.filter((r) => !discordRoleIds.has(r.platformId)) ?? [];

    // Adiciona cargos
    const added = await this.addRoles(userPlatformId, toAdd);

    // Remove cargos
    for (const role of toRemove) {
      await this.roleRepository.removeRoleFromUser(
        role.platformId,
        userPlatformId,
      );
    }

    return { added, removed: toRemove.length };
  }

  private async addRoles(
    userPlatformId: string,
    roles: RoleInput[],
  ): Promise<number> {
    let added = 0;
    for (const role of roles) {
      let dbRole = await this.roleRepository.findByPlatformId(role.platformId);
      if (!dbRole) {
        dbRole = await this.roleRepository.create({
          platformId: role.platformId,
          name: role.name,
          platformCreatedAt: role.platformCreatedAt,
        });
      }

      await this.roleRepository.assignRoleToUser(
        role.platformId,
        userPlatformId,
      );
      added++;
    }
    return added;
  }

  private async ensureUserExists(
    input: SyncUserRolesInput,
  ): Promise<{ isNew: boolean }> {
    const user = await this.userRepository.findByPlatformId(
      input.userPlatformId,
      true,
    );

    if (user) {
      return { isNew: false };
    }

    const createUserResult = await this.createUser.execute({
      platformId: input.userPlatformId,
      username: input.username,
      globalName: input.userGlobalName,
      bot: input.userBot,
      status: UserStatus.ACTIVE,
      platformCreatedAt: input.userPlatformCreatedAt,
      joinedAt: input.userJoinedAt ?? undefined,
      lastActive: undefined,
    });

    if (!createUserResult.success) {
      throw new Error("Falha ao criar usuario: " + input.username);
    }

    return { isNew: true };
  }
}
