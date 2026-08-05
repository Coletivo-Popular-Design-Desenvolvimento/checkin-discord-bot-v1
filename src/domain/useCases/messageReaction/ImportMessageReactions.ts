import { ChannelEntity } from "@entities/Channel";
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
  MessageHistoryCursor,
  RawHistoricalMessageReaction,
} from "@services/IDiscordHistoryFetcher";
import {
  IHistoricalImportRepository,
  RawMessageReactionAssignment,
} from "@repositories/IHistoricalImportRepository";
import {
  IImportMessageReactions,
  ImportMessageReactionsInput,
  ImportMessageReactionsResult,
} from "@interfaces/useCases/messageReaction/IImportMessageReactions";

export class ImportMessageReactions implements IImportMessageReactions {
  constructor(
    private readonly discordHistoryFetcher: IDiscordHistoryFetcher,
    private readonly historicalImportRepository: IHistoricalImportRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: ImportMessageReactionsInput,
  ): Promise<GenericOutputDto<ImportMessageReactionsResult>> {
    const totals: ImportMessageReactionsResult = {
      fetched: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    };

    const failedBatches: number[] = [];

    try {
      let cursor: MessageHistoryCursor | undefined;
      let done = false;
      let batchNumber = 0;

      while (!done) {
        const batch =
          await this.discordHistoryFetcher.fetchNextMessageReactionsBatch({
            startDate: input.startDate,
            endDate: input.endDate,
            batchSize: input.batchSize,
            cursor,
          });
        batchNumber += 1;
        totals.fetched += batch.reactions.length;

        if (batch.reactions.length > 0) {
          try {
            const { channels, users } = this.buildUniqueChannelsAndUsers(
              batch.reactions,
            );
            const reactions: RawMessageReactionAssignment[] =
              batch.reactions.map((raw) => this.toReactionAssignment(raw));

            const saveResult =
              await this.historicalImportRepository.saveMessageReactionsBatch({
                channels: [...channels.values()],
                users: [...users.values()],
                reactions,
              });

            totals.created += saveResult.reactionsCreated;
            totals.skipped += reactions.length - saveResult.reactionsCreated;

            this.logger.logToConsole(
              LoggerContextStatus.SUCCESS,
              LoggerContext.USECASE,
              LoggerContextEntity.HISTORICAL_SYNC,
              `ImportMessageReactions | lote ${batchNumber}: fetched=${batch.reactions.length} created=${saveResult.reactionsCreated}`,
            );

            input.onProgress?.({
              batchNumber,
              fetched: totals.fetched,
              created: totals.created,
            });
          } catch (batchError) {
            totals.failed += batch.reactions.length;
            failedBatches.push(batchNumber);
            const messageIds = [
              ...new Set(batch.reactions.map((reaction) => reaction.messageId)),
            ].join(", ");
            this.logger.logToConsole(
              LoggerContextStatus.ERROR,
              LoggerContext.USECASE,
              LoggerContextEntity.HISTORICAL_SYNC,
              `ImportMessageReactions | lote ${batchNumber} falhou (mensagens referenciadas: ${messageIds}) | ${batchError instanceof Error ? batchError.message : String(batchError)}`,
            );
          }
        }

        cursor = batch.cursor;
        done = batch.done;
      }

      return {
        data: totals,
        success: failedBatches.length === 0,
        message:
          failedBatches.length > 0
            ? `lote(s) ${failedBatches.join(", ")} falharam ao salvar (${totals.failed} reações)`
            : undefined,
      };
    } catch (error) {
      totals.failed = totals.fetched - totals.created - totals.skipped;
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.HISTORICAL_SYNC,
        `ImportMessageReactions.execute | ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        data: totals,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  private buildUniqueChannelsAndUsers(
    reactions: RawHistoricalMessageReaction[],
  ): {
    channels: Map<string, Omit<ChannelEntity, "id">>;
    users: Map<string, Omit<UserEntity, "id">>;
  } {
    const channels = new Map<string, Omit<ChannelEntity, "id">>();
    const users = new Map<string, Omit<UserEntity, "id">>();

    for (const reaction of reactions) {
      if (!channels.has(reaction.channelId)) {
        channels.set(reaction.channelId, {
          platformId: reaction.channelId,
          name: reaction.channelName,
          url: reaction.channelUrl,
          createdAt: new Date(),
        });
      }

      if (!users.has(reaction.userId)) {
        users.set(reaction.userId, {
          platformId: reaction.userId,
          username: reaction.username,
          bot: reaction.userBot,
          status: UserStatus.ACTIVE,
          globalName: reaction.userGlobalName,
          platformCreatedAt: reaction.userPlatformCreatedAt,
          joinedAt: reaction.userJoinedAt,
        });
      }
    }

    return { channels, users };
  }

  private toReactionAssignment(
    raw: RawHistoricalMessageReaction,
  ): RawMessageReactionAssignment {
    return {
      userPlatformId: raw.userId,
      messagePlatformId: raw.messageId,
      channelPlatformId: raw.channelId,
      reactionEmoji: raw.reactionEmoji,
      reactedAt: raw.messagePlatformCreatedAt,
    };
  }
}
