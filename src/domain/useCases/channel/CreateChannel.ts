import { CreateManyChannelOutputDto } from "@dtos/CreateManyChannelOutputDto";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ChannelEntity } from "@entities/Channel";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ILoggerService } from "@services/ILogger";
import {
  ICreateChannel,
  CreateChannelInput,
} from "@interfaces/useCases/channel/ICreateChannel";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";

export class CreateChannel implements ICreateChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: CreateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    try {
      const existing = await this.channelRepository.findByPlatformId(
        input.platformId,
      );
      if (existing) {
        return {
          data: existing,
          success: false,
          message: `Channel already exists ${input.platformId}`,
        };
      }

      const created = await this.channelRepository.create(input);
      return {
        data: created,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `CreateChannel.execute | ${error.message}`,
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
    channels: CreateChannelInput[],
  ): Promise<GenericOutputDto<CreateManyChannelOutputDto>> {
    try {
      const created = await this.channelRepository.createMany(channels);
      return {
        data: {
          created,
          failed: channels.length - created,
        },
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `CreateChannel.executeMany | ${error.message}`,
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
