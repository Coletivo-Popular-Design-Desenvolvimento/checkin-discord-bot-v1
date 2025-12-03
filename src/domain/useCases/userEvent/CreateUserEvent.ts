import { CreateManyUserOutputDto } from "@dtos/CreateManyUserOutputDto";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEventEntity } from "@entities/UserEvent";
import { IUserEventRepository } from "@repositories/IUserEventRepository";
import { ILoggerService } from "@services/ILogger";
import {
  CreateUserEventInput,
  ICreateUserEvent,
} from "@interfaces/useCases/userEvent/ICreateUserEvent";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { IUserRepository } from "@repositories/IUserRepository";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { UserStatus } from "@type/UserStatusEnum";
import { IRegisterVoiceEvent } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";

export class CreateUserEvent implements ICreateUserEvent {
  constructor(
    private readonly userEventRepository: IUserEventRepository,
    private readonly userRepository: IUserRepository,
    private readonly audioEventRepository: IAudioEventRepository,
    private readonly createUser: ICreateUser,
    private readonly registerVoiceEvent: IRegisterVoiceEvent,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: CreateUserEventInput,
  ): Promise<GenericOutputDto<UserEventEntity>> {
    try {
      const toCreate = await this.toRepositoryCreateInput(input);

      if (toCreate.user.bot) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.NO_BOT,
        };
      }

      const newUserEvent = await this.userEventRepository.create(toCreate);

      if (newUserEvent) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.USER_EVENT,
          `UserEvent created: ${input.eventType} - User: ${input.userPlatformId}`,
        );
      }

      return {
        data: newUserEvent,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER_EVENT,
        `CreateUserEvent.execute | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  async executeMany(
    inputs: CreateUserEventInput[],
  ): Promise<GenericOutputDto<CreateManyUserOutputDto>> {
    try {
      const toCreate = await Promise.all(
        inputs.map(async (input) => await this.toRepositoryCreateInput(input)),
      );
      const validEvents = toCreate.filter((userEvent) => !userEvent.user.bot);

      if (!validEvents) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.NO_BOT,
        };
      }

      const created = await this.userEventRepository.createMany(validEvents);
      return {
        data: {
          created,
          failed: inputs.length - created,
        },
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER_EVENT,
        `CreateUserEvent.executeMany | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  private async toRepositoryCreateInput(
    input: CreateUserEventInput,
  ): Promise<Omit<UserEventEntity, "id">> {
    const {
      userPlatformId,
      channelPlatformId,
      userDiscordInfo,
      channelDiscordInfo,
      ...userEventData
    } = input;
    const user = await this.getUser(userPlatformId, userDiscordInfo);
    const event = await this.getAudioEvent(
      channelPlatformId,
      channelDiscordInfo,
      userPlatformId,
    );
    return { user, event, ...userEventData };
  }

  private async getUser(
    userPlatformId: UserEventEntity["user"]["platformId"],
    userDiscordInfo?: CreateUserEventInput["userDiscordInfo"],
  ) {
    let user = await this.userRepository.findByPlatformId(userPlatformId);

    if (!user && userDiscordInfo) {
      // Cria o usuário automaticamente usando o CreateUser UseCase
      const result = await this.createUser.execute({
        platformId: userPlatformId,
        username: userDiscordInfo.username,
        bot: userDiscordInfo.bot,
        globalName: userDiscordInfo.globalName,
        status: UserStatus.ACTIVE,
        joinedAt: new Date(),
        createAt: new Date(),
        updateAt: new Date(),
        lastActive: new Date(),
        email: null,
        platformCreatedAt: null,
      });

      if (!result.success || !result.data) {
        throw new Error(`Failed to create user: ${userPlatformId}`);
      }

      user = result.data;
    } else if (!user) {
      throw new Error(`${ErrorMessages.USER_NOT_FOUND} ${userPlatformId}`);
    }

    return user;
  }

  private async getAudioEvent(
    channelPlatformId: UserEventEntity["event"]["channel"]["platformId"],
    channelDiscordInfo?: CreateUserEventInput["channelDiscordInfo"],
    userPlatformId?: string,
  ) {
    const allEvents =
      await this.audioEventRepository.findByChannelId(channelPlatformId);

    // Filtra apenas eventos ativos (não finalizados)
    const activeEvents = allEvents.filter(
      (event) => event.statusId === "active" || event.statusId === "scheduled",
    );

    if (activeEvents.length === 0) {
      // Cria um AudioEvent automaticamente se não existir nenhum ativo
      if (channelDiscordInfo && userPlatformId) {
        const result = await this.registerVoiceEvent.execute({
          platformId: `auto-${channelPlatformId}-${Date.now()}`,
          name: channelDiscordInfo.name || "Voice Session",
          status: "active",
          startAt: new Date(),
          endAt: null,
          userCount: 1,
          channelId: channelPlatformId,
          channelName: channelDiscordInfo.name,
          channelUrl: channelDiscordInfo.url,
          creatorId: userPlatformId,
          description: "Automatically created voice session",
        });

        if (!result.success || !result.data) {
          throw new Error(
            `Failed to create AudioEvent for channel: ${channelPlatformId}`,
          );
        }

        return result.data;
      }

      throw new Error(
        `${ErrorMessages.AUDIO_EVENT_NOT_FOUND} ${channelPlatformId}`,
      );
    }

    // Se houver múltiplos eventos ativos, usa o mais recente
    if (activeEvents.length > 1) {
      return activeEvents.sort((a, b) => b.id - a.id)[0];
    }

    return activeEvents[0];
  }
}
