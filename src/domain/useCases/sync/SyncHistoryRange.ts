import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IImportMessages } from "@interfaces/useCases/message/IImportMessages";
import { ImportMessagesResult } from "@interfaces/useCases/message/IImportMessages";
import { IImportAudioEvents } from "@interfaces/useCases/audioEvent/IImportAudioEvents";
import { ImportAudioEventsResult } from "@interfaces/useCases/audioEvent/IImportAudioEvents";
import { IImportUsers } from "@interfaces/useCases/user/IImportUsers";
import { ImportUsersResult } from "@interfaces/useCases/user/IImportUsers";
import { IImportUserRoles } from "@interfaces/useCases/role/IImportUserRoles";
import { ImportUserRolesResult } from "@interfaces/useCases/role/IImportUserRoles";
import { IImportChannels } from "@interfaces/useCases/channel/IImportChannels";
import { ImportChannelsResult } from "@interfaces/useCases/channel/IImportChannels";
import { IImportMessageReactions } from "@interfaces/useCases/messageReaction/IImportMessageReactions";
import { ImportMessageReactionsResult } from "@interfaces/useCases/messageReaction/IImportMessageReactions";
import {
  ISyncHistoryRange,
  SyncHistoryRangeInput,
  SyncHistoryRangeResult,
} from "@interfaces/useCases/sync/ISyncHistoryRange";

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_RANGE_MONTHS = 3;

const EMPTY_IMPORT_RESULT = {
  fetched: 0,
  created: 0,
  skipped: 0,
  failed: 0,
};

type IsolatedResult =
  | ImportMessagesResult
  | ImportAudioEventsResult
  | ImportUsersResult
  | ImportUserRolesResult
  | ImportChannelsResult
  | ImportMessageReactionsResult;

export class SyncHistoryRange implements ISyncHistoryRange {
  constructor(
    private readonly importUsers: IImportUsers,
    private readonly importUserRoles: IImportUserRoles,
    private readonly importChannels: IImportChannels,
    private readonly importMessages: IImportMessages,
    private readonly importMessageReactions: IImportMessageReactions,
    private readonly importAudioEvents: IImportAudioEvents,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: SyncHistoryRangeInput,
  ): Promise<GenericOutputDto<SyncHistoryRangeResult>> {
    const endDate = input.endDate ?? new Date();
    const startDate =
      input.startDate ?? this.subtractMonths(endDate, DEFAULT_RANGE_MONTHS);
    const batchSize = input.batchSize ?? DEFAULT_BATCH_SIZE;

    const errors: string[] = [];

    const users = await this.runIsolated("users", errors, () =>
      this.importUsers.execute({
        batchSize,
        onProgress: input.onUserProgress,
      }),
    );

    const userRoles = await this.runIsolated("userRoles", errors, () =>
      this.importUserRoles.execute({
        batchSize,
        onProgress: input.onUserRoleProgress,
      }),
    );

    const channels = await this.runIsolated("channels", errors, () =>
      this.importChannels.execute({
        batchSize,
        onProgress: input.onChannelProgress,
      }),
    );

    const messages = await this.runIsolated("messages", errors, () =>
      this.importMessages.execute({
        startDate,
        endDate,
        batchSize,
        onProgress: input.onMessageProgress,
      }),
    );

    const messageReactions = await this.runIsolated(
      "messageReactions",
      errors,
      () =>
        this.importMessageReactions.execute({
          startDate,
          endDate,
          batchSize,
          onProgress: input.onMessageReactionProgress,
        }),
    );

    const audioEvents = await this.runIsolated("audioEvents", errors, () =>
      this.importAudioEvents.execute({
        startDate,
        endDate,
        batchSize,
        onProgress: input.onAudioEventProgress,
      }),
    );

    return {
      data: {
        startDate,
        endDate,
        batchSize,
        users,
        userRoles,
        channels,
        messages,
        messageReactions,
        audioEvents,
        errors,
      },
      success: errors.length === 0,
      message: errors.length > 0 ? errors.join("; ") : undefined,
    };
  }

  private async runIsolated<T extends IsolatedResult>(
    label: string,
    errors: string[],
    run: () => Promise<GenericOutputDto<T>>,
  ): Promise<T> {
    try {
      const result = await run();
      if (!result.success && result.message) {
        errors.push(`${label}: ${result.message}`);
      }
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${label}: ${message}`);
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.HISTORICAL_SYNC,
        `SyncHistoryRange.execute | ${label} | ${message}`,
      );
      return { ...EMPTY_IMPORT_RESULT } as T;
    }
  }

  private subtractMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }
}
