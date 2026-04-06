import { IMessageReactionRepository } from "@repositories/IMessageReactionRepository";
import { ILoggerService } from "@services/ILogger";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import {
  RemoveMessageReactionInput,
  IRemoveMessageReaction,
} from "@interfaces/useCases/messageReaction/IRemoveMessageReaction";

export class RemoveMessageReaction implements IRemoveMessageReaction {
  constructor(
    private readonly messageReactionRepository: IMessageReactionRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: RemoveMessageReactionInput,
  ): Promise<GenericOutputDto<boolean>> {
    try {
      const reactionEmoji = input.reactionEmoji ?? "";
      const existing =
        await this.messageReactionRepository.findByUserMessageAndEmoji(
          input.userId,
          input.messageId,
          reactionEmoji,
        );

      if (!existing) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.MESSAGE_REACTION,
          `Reaction not in database: user=${input.userId} message=${input.messageId} emoji=${reactionEmoji || "(none)"}`,
        );
        return {
          data: false,
          success: true,
          message: "Reaction not in database",
        };
      }

      const deleted =
        await this.messageReactionRepository.deleteMessageReaction(existing.id);

      if (!deleted) {
        return {
          data: false,
          success: false,
          message: ErrorMessages.UNKNOWN_ERROR,
        };
      }

      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE_REACTION,
        `Reaction removed from database: user=${input.userId} message=${input.messageId} emoji=${reactionEmoji || "(none)"}`,
      );

      return {
        data: true,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE_REACTION,
        `removeMessageReaction.execute | ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        data: false,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }
}
