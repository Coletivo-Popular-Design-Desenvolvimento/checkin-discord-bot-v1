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
  RegisterVoiceEventInput,
  IRegisterVoiceEvent,
} from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";

export class RegisterVoiceEvent implements IRegisterVoiceEvent {
  constructor(
    private readonly audioEventRepository: IAudioEventRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(input: RegisterVoiceEventInput): Promise<GenericOutputDto<AudioEventEntity>> {
    try {
      const newEvent = await this.audioEventRepository.create({
        platformId: input.platformId,
        name: input.name,
        statusId: input.statusId,
        startAt: input.startAt,
        endAt: input.endAt,
        userCount: input.userCount,
        channel: { platformId: input.channelId } as any,
        creator: { platformId: input.creatorId } as any,
        description: input.description,
        image: input.image,
      });

      if (!newEvent) {
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
        `Voice event registered successfully: ${input.name}`,
      );

      return {
        data: newEvent,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.AUDIO_EVENT,
        `registerVoiceEvent.execute | ${error.message}`,
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
