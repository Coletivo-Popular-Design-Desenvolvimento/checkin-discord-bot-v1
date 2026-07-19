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

export class SyncHistoryRange implements ISyncHistoryRange {
  constructor(
    private readonly importMessages: IImportMessages,
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

    const messages = await this.runIsolated("messages", errors, () =>
      this.importMessages.execute({
        startDate,
        endDate,
        batchSize,
        onProgress: input.onMessageProgress,
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
      data: { startDate, endDate, batchSize, messages, audioEvents, errors },
      success: errors.length === 0,
      message: errors.length > 0 ? errors.join("; ") : undefined,
    };
  }

  private async runIsolated<
    T extends ImportMessagesResult | ImportAudioEventsResult,
  >(
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
