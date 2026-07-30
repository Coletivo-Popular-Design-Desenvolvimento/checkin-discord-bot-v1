import { UserEntity } from "@entities/User";
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
  RawHistoricalUser,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import {
  IImportUsers,
  ImportUsersInput,
  ImportUsersResult,
} from "@interfaces/useCases/user/IImportUsers";

export class ImportUsers implements IImportUsers {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportUsersInput,
  ): Promise<GenericOutputDto<ImportUsersResult>> {
    const totals: ImportUsersResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    try {
      const rawUsers = await this.discordHistoryFetcher.fetchGuildMembers();
      totals.fetched = rawUsers.length;

      const chunks = this.chunk(rawUsers, input.batchSize);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const users = chunk.map((raw) => this.toUserEntity(raw));

        const saveResult =
          await this.historicalImportRepository.saveUsersBatch(users);

        totals.created += saveResult.usersUpserted;
        totals.skipped += users.length - saveResult.usersUpserted;

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.HISTORICAL_SYNC,
          `ImportUsers | lote ${i + 1}: fetched=${chunk.length} created=${saveResult.usersUpserted}`,
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
        `ImportUsers.execute | ${error instanceof Error ? error.message : String(error)}`,
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

  private toUserEntity(raw: RawHistoricalUser): Omit<UserEntity, "id"> {
    return {
      platformId: raw.platformId,
      username: raw.username,
      bot: raw.bot,
      status: UserStatus.ACTIVE,
      globalName: raw.globalName,
      platformCreatedAt: raw.platformCreatedAt,
      joinedAt: raw.joinedAt,
    };
  }
}
