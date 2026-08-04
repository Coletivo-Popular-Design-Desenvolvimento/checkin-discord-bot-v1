import { ChannelEntity } from "@entities/Channel";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { ILoggerService } from "@services/ILogger";
import {
  IDiscordHistoryFetcher,
  RawHistoricalChannel,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import {
  IImportChannels,
  ImportChannelsInput,
  ImportChannelsResult,
} from "@interfaces/useCases/channel/IImportChannels";

export class ImportChannels implements IImportChannels {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportChannelsInput,
  ): Promise<GenericOutputDto<ImportChannelsResult>> {
    const totals: ImportChannelsResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    try {
      const rawChannels = await this.discordHistoryFetcher.fetchGuildChannels();
      totals.fetched = rawChannels.length;

      const chunks = this.chunk(rawChannels, input.batchSize);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const channels = chunk.map((raw) => this.toChannelEntity(raw));

        const saveResult =
          await this.historicalImportRepository.saveChannelsBatch(channels);

        totals.created += saveResult.channelsUpserted;
        totals.skipped += channels.length - saveResult.channelsUpserted;

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.HISTORICAL_SYNC,
          `ImportChannels | lote ${i + 1}: fetched=${chunk.length} created=${saveResult.channelsUpserted}`,
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
        `ImportChannels.execute | ${error instanceof Error ? error.message : String(error)}`,
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

  private toChannelEntity(
    raw: RawHistoricalChannel,
  ): Omit<ChannelEntity, "id"> {
    return {
      platformId: raw.platformId,
      name: raw.name,
      url: raw.url,
      createdAt: new Date(),
    };
  }
}
