import { UserEntity } from "@entities/User";
import { RoleEntity } from "@entities/Role";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ErrorMessages } from "@type/ErrorMessages";
import { UserStatus } from "@type/UserStatusEnum";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { ILoggerService } from "@services/ILogger";
import {
  IDiscordHistoryFetcher,
  RawHistoricalUserRoleAssignment,
} from "@services/IDiscordHistoryFetcher";
import {
  IHistoricalImportRepository,
  RawUserRoleAssignment,
} from "@repositories/IHistoricalImportRepository";
import {
  IImportUserRoles,
  ImportUserRolesInput,
  ImportUserRolesResult,
} from "@interfaces/useCases/role/IImportUserRoles";

export class ImportUserRoles implements IImportUserRoles {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportUserRolesInput,
  ): Promise<GenericOutputDto<ImportUserRolesResult>> {
    const totals: ImportUserRolesResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    try {
      const rawAssignments =
        await this.discordHistoryFetcher.fetchGuildMemberRoles();
      totals.fetched = rawAssignments.length;

      const chunks = this.chunk(rawAssignments, input.batchSize);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const { users, roles } = this.buildUniqueUsersAndRoles(chunk);
        const assignments: RawUserRoleAssignment[] = chunk.map((raw) => ({
          userPlatformId: raw.userId,
          rolePlatformId: raw.roleId,
        }));

        const saveResult =
          await this.historicalImportRepository.saveUserRolesBatch({
            users: [...users.values()],
            roles: [...roles.values()],
            assignments,
          });

        totals.created += saveResult.assignmentsCreated;
        totals.skipped += assignments.length - saveResult.assignmentsCreated;

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.HISTORICAL_SYNC,
          `ImportUserRoles | lote ${i + 1}: fetched=${chunk.length} created=${saveResult.assignmentsCreated}`,
        );

        input.onProgress?.({
          batchNumber: i + 1,
          fetched: totals.fetched,
          created: totals.created,
        });
      }

      return { data: totals, success: true };
    } catch (error) {
      totals.failed = totals.fetched - totals.created - totals.skipped;
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.HISTORICAL_SYNC,
        `ImportUserRoles.execute | ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        data: totals,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }

  private buildUniqueUsersAndRoles(
    assignments: RawHistoricalUserRoleAssignment[],
  ): {
    users: Map<string, Omit<UserEntity, "id">>;
    roles: Map<string, Omit<RoleEntity, "id" | "createdAt" | "user">>;
  } {
    const users = new Map<string, Omit<UserEntity, "id">>();
    const roles = new Map<
      string,
      Omit<RoleEntity, "id" | "createdAt" | "user">
    >();

    for (const assignment of assignments) {
      if (!users.has(assignment.userId)) {
        users.set(assignment.userId, {
          platformId: assignment.userId,
          username: assignment.username,
          bot: assignment.userBot,
          status: UserStatus.ACTIVE,
          globalName: assignment.userGlobalName,
        });
      }

      if (!roles.has(assignment.roleId)) {
        roles.set(assignment.roleId, {
          platformId: assignment.roleId,
          name: assignment.roleName,
          platformCreatedAt: assignment.rolePlatformCreatedAt,
        });
      }
    }

    return { users, roles };
  }
}
