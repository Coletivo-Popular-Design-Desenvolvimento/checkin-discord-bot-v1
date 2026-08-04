import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { AudioEventEntity } from "@entities/AudioEvent";
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
  RawHistoricalAudioEvent,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import {
  IImportAudioEvents,
  ImportAudioEventsInput,
  ImportAudioEventsResult,
} from "@interfaces/useCases/audioEvent/IImportAudioEvents";

export class ImportAudioEvents implements IImportAudioEvents {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportAudioEventsInput,
  ): Promise<GenericOutputDto<ImportAudioEventsResult>> {
    const totals: ImportAudioEventsResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    try {
      const rawEvents =
        await this.discordHistoryFetcher.fetchAudioEventsInRange({
          startDate: input.startDate,
          endDate: input.endDate,
        });
      totals.fetched = rawEvents.length;

      const chunks = this.chunk(rawEvents, input.batchSize);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const { channels, users } = this.buildUniqueChannelsAndUsers(chunk);
        const audioEvents = chunk.map((raw) =>
          this.toAudioEventEntity(raw, channels, users),
        );

        const saveResult =
          await this.historicalImportRepository.saveAudioEventsBatch({
            channels: [...channels.values()],
            users: [...users.values()],
            audioEvents,
          });

        totals.created += saveResult.audioEventsCreated;
        totals.skipped += audioEvents.length - saveResult.audioEventsCreated;

        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.HISTORICAL_SYNC,
          `ImportAudioEvents | lote ${i + 1}: fetched=${chunk.length} created=${saveResult.audioEventsCreated}`,
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
        `ImportAudioEvents.execute | ${error instanceof Error ? error.message : String(error)}`,
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

  private buildUniqueChannelsAndUsers(events: RawHistoricalAudioEvent[]): {
    channels: Map<string, Omit<ChannelEntity, "id">>;
    users: Map<string, Omit<UserEntity, "id">>;
  } {
    const channels = new Map<string, Omit<ChannelEntity, "id">>();
    const users = new Map<string, Omit<UserEntity, "id">>();

    for (const event of events) {
      if (!channels.has(event.channelId)) {
        channels.set(event.channelId, {
          platformId: event.channelId,
          name: event.channelName,
          url: event.channelUrl,
          createdAt: new Date(),
        });
      }

      if (!users.has(event.creatorId)) {
        users.set(event.creatorId, {
          platformId: event.creatorId,
          username: event.creatorUsername,
          bot: false,
          status: UserStatus.ACTIVE,
        });
      }
    }

    return { channels, users };
  }

  private toAudioEventEntity(
    raw: RawHistoricalAudioEvent,
    channels: Map<string, Omit<ChannelEntity, "id">>,
    users: Map<string, Omit<UserEntity, "id">>,
  ): Omit<AudioEventEntity, "id" | "createdAt"> {
    const channel = channels.get(raw.channelId)!;
    const creator = users.get(raw.creatorId)!;

    return {
      platformId: raw.platformId,
      name: raw.name,
      statusId: raw.statusId,
      startAt: raw.startAt,
      endAt: raw.endAt,
      userCount: raw.userCount,
      description: raw.description,
      image: raw.image,
      // id é um placeholder: a persistência conecta por platformId, não por este id numérico
      channel: { id: 0, ...channel },
      creator: { id: 0, ...creator },
    };
  }
}
