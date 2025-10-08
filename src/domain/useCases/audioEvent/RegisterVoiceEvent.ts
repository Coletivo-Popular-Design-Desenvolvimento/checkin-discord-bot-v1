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
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { UserStatus } from "@type/UserStatusEnum";

// Função para criar entidades temporárias com apenas platformId
const createChannelEntity = (platformId: string): ChannelEntity => {
  return new ChannelEntity(0, platformId, "", "", new Date());
};

const createUserEntity = (platformId: string): UserEntity => {
  return new UserEntity(0, platformId, "", false, UserStatus.ACTIVE);
};

export class RegisterVoiceEvent implements IRegisterVoiceEvent {
  constructor(
    private readonly audioEventRepository: IAudioEventRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: RegisterVoiceEventInput,
  ): Promise<GenericOutputDto<AudioEventEntity>> {
    try {
      const validStatusIds = ["scheduled", "active", "completed", "canceled"];
      if (!validStatusIds.includes(input.status)) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.USECASE,
          LoggerContextEntity.AUDIO_EVENT,
          `Invalid statusId: ${input.status}. Must be one of: ${validStatusIds.join(", ")}`,
        );
        return {
          data: null,
          success: false,
          message: `Invalid status: ${input.status}`,
        };
      }

      const newEvent = await this.audioEventRepository.create({
        platformId: input.platformId,
        name: input.name,
        statusId: input.status,
        startAt: input.startAt,
        endAt: input.endAt,
        userCount: input.userCount,
        channel: createChannelEntity(input.channelId),
        creator: createUserEntity(input.creatorId),
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
