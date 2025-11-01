import { AudioEventEntity } from "@entities/AudioEvent";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ILoggerService } from "@services/ILogger";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import {
  FinalizeVoiceEventInput,
  IFinalizeVoiceEvent,
} from "@interfaces/useCases/audioEvent/IFinalizeVoiceEvent";

export class FinalizeVoiceEvent implements IFinalizeVoiceEvent {
  constructor(
    private readonly audioEventRepository: IAudioEventRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: FinalizeVoiceEventInput,
  ): Promise<GenericOutputDto<AudioEventEntity>> {
    try {
      const eventToUpdate = await this.audioEventRepository.findByPlatformId(
        input.platformId,
      );

      if (!eventToUpdate) {
        return {
          data: null,
          success: false,
          message: "Event not found",
        };
      }

      const updatedEvent = await this.audioEventRepository.updateById(
        eventToUpdate.id,
        {
          endAt: input.endAt,
          userCount: input.userCount,
          statusId: "completed",
        },
      );

      if (!updatedEvent) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.UNKNOWN_ERROR,
        };
      }

      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.AUDIO_EVENT,
        `Voice event finalized successfully: ${eventToUpdate.name}`,
      );

      return {
        data: updatedEvent,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.AUDIO_EVENT,
        `finalizeVoiceEvent.execute | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }
}
