import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
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
  MessageHistoryCursor,
  RawHistoricalMessage,
} from "@services/IDiscordHistoryFetcher";
import { IHistoricalImportRepository } from "@repositories/IHistoricalImportRepository";
import {
  IImportMessages,
  ImportMessagesInput,
  ImportMessagesResult,
} from "@interfaces/useCases/message/IImportMessages";

export class ImportMessages implements IImportMessages {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportMessagesInput,
  ): Promise<GenericOutputDto<ImportMessagesResult>> {
    const totals: ImportMessagesResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    try {
      let cursor: MessageHistoryCursor | undefined;
      let done = false;
      let batchNumber = 0;

      while (!done) {
        const batch = await this.discordHistoryFetcher.fetchNextMessageBatch({
          startDate: input.startDate,
          endDate: input.endDate,
          batchSize: input.batchSize,
          cursor,
        });
        batchNumber += 1;
        totals.fetched += batch.messages.length;

        if (batch.messages.length > 0) {
          const { channels, users } = this.buildUniqueChannelsAndUsers(
            batch.messages,
          );
          const messages = batch.messages.map((raw) =>
            this.toMessageEntity(raw, channels, users),
          );

          const saveResult =
            await this.historicalImportRepository.saveMessagesBatch({
              channels: [...channels.values()],
              users: [...users.values()],
              messages,
            });

          totals.created += saveResult.messagesCreated;
          totals.skipped += messages.length - saveResult.messagesCreated;

          this.logger.logToConsole(
            LoggerContextStatus.SUCCESS,
            LoggerContext.USECASE,
            LoggerContextEntity.HISTORICAL_SYNC,
            `ImportMessages | lote ${batchNumber}: fetched=${batch.messages.length} created=${saveResult.messagesCreated}`,
          );

          input.onProgress?.({
            batchNumber,
            fetched: totals.fetched,
            created: totals.created,
          });
        }

        cursor = batch.cursor;
        done = batch.done;
      }

      return { data: totals, success: true };
    } catch (error) {
      totals.failed = totals.fetched - totals.created - totals.skipped;
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.HISTORICAL_SYNC,
        `ImportMessages.execute | ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        data: totals,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  private buildUniqueChannelsAndUsers(messages: RawHistoricalMessage[]): {
    channels: Map<string, Omit<ChannelEntity, "id">>;
    users: Map<string, Omit<UserEntity, "id">>;
  } {
    const channels = new Map<string, Omit<ChannelEntity, "id">>();
    const users = new Map<string, Omit<UserEntity, "id">>();

    for (const message of messages) {
      if (!channels.has(message.channelId)) {
        channels.set(message.channelId, {
          platformId: message.channelId,
          name: message.channelName,
          url: message.channelUrl,
          createdAt: new Date(),
        });
      }

      if (!users.has(message.userId)) {
        users.set(message.userId, {
          platformId: message.userId,
          username: message.username,
          bot: message.userBot,
          status: UserStatus.ACTIVE,
          globalName: message.userGlobalName,
          platformCreatedAt: message.userPlatformCreatedAt,
          joinedAt: message.userJoinedAt,
        });
      }
    }

    return { channels, users };
  }

  private toMessageEntity(
    raw: RawHistoricalMessage,
    channels: Map<string, Omit<ChannelEntity, "id">>,
    users: Map<string, Omit<UserEntity, "id">>,
  ): Omit<MessageEntity, "id"> {
    const channel = channels.get(raw.channelId)!;
    const user = users.get(raw.userId)!;

    return {
      // id é um placeholder: a persistência conecta por platformId, não por este id numérico
      channel: { id: 0, ...channel },
      user: { id: 0, ...user },
      messageReactions: [],
      platformId: raw.platformId,
      platformCreatedAt: raw.platformCreatedAt,
      isDeleted: false,
    };
  }
}
