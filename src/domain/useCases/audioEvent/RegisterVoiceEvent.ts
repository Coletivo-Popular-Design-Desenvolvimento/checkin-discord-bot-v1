import { AudioEventEntity } from "@entities/AudioEvent";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IUserRepository } from "@repositories/IUserRepository";
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

export class RegisterVoiceEvent implements IRegisterVoiceEvent {
  constructor(
    private readonly audioEventRepository: IAudioEventRepository,
    private readonly channelRepository: IChannelRepository,
    private readonly userRepository: IUserRepository,
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

      // Garante que o canal existe no banco
      const channel = await this.findOrCreateChannel(input);
      if (!channel) {
        return {
          data: null,
          success: false,
          message: `Failed to find or create channel: ${input.channelId}`,
        };
      }

      // Garante que o usuário (creator) existe no banco
      const creator = await this.findOrCreateUser(input);
      if (!creator) {
        return {
          data: null,
          success: false,
          message: `Failed to find or create user: ${input.creatorId}`,
        };
      }

      const newEvent = await this.audioEventRepository.create({
        platformId: input.platformId,
        name: input.name,
        statusId: input.status,
        startAt: input.startAt,
        endAt: input.endAt,
        userCount: input.userCount,
        channel: channel,
        creator: creator,
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

  private async findOrCreateChannel(
    input: RegisterVoiceEventInput,
  ): Promise<ChannelEntity | null> {
    try {
      // Tenta encontrar o canal existente
      let channel = await this.channelRepository.findByPlatformId(
        input.channelId,
      );

      // Se não encontrar, cria um novo com dados do Discord
      if (!channel) {
        channel = await this.channelRepository.create({
          platformId: input.channelId,
          name: input.channelName || "Unknown Channel",
          url: input.channelUrl || "",
          createdAt: new Date(),
        });
      }

      return channel;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.AUDIO_EVENT,
        `findOrCreateChannel | ${error.message}`,
      );
      return null;
    }
  }

  private async findOrCreateUser(
    input: RegisterVoiceEventInput,
  ): Promise<UserEntity | null> {
    try {
      // Tenta encontrar o usuário existente
      let user = await this.userRepository.findByPlatformId(input.creatorId);

      // Se não encontrar, cria um novo com dados do Discord
      if (!user) {
        user = await this.userRepository.create({
          platformId: input.creatorId,
          username: input.creatorUsername || "Unknown User",
          bot: false,
          status: UserStatus.ACTIVE,
        });
      }

      return user;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.AUDIO_EVENT,
        `findOrCreateUser | ${error.message}`,
      );
      return null;
    }
  }
}
