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

export class CreateUserEvent implements ICreateUserEvent {
  constructor(
    private readonly userEventRepository: IUserEventRepository,
    private readonly userRepository: IUserRepository,
    private readonly audioEventRepository: IAudioEventRepository,
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
    const { userPlatformId, channelPlatformId, ...userEventData } = input;
    const user = await this.getUser(userPlatformId);
    const event = await this.getAudioEvent(channelPlatformId);
    return { user, event, ...userEventData };
  }

  private async getUser(userPlatformId: UserEventEntity["user"]["platformId"]) {
    const user = await this.userRepository.findByPlatformId(userPlatformId);
    if (!user) {
      throw new Error(`${ErrorMessages.USER_NOT_FOUND} ${userPlatformId}`);
    }
    return user;
  }

  private async getAudioEvent(
    channelPlatformId: UserEventEntity["event"]["channel"]["platformId"],
  ) {
    const events =
      await this.audioEventRepository.findByChannelId(channelPlatformId);
    if (events.length === 0) {
      throw new Error(
        `${ErrorMessages.AUDIO_EVENT_NOT_FOUND} ${channelPlatformId}`,
      );
    } else if (events.length > 1) {
      throw new Error(
        `${ErrorMessages.TOO_MANY_AUDIO_EVENTS} ${channelPlatformId}: ${events.length}`,
      );
    }
    return events[0];
  }
}
