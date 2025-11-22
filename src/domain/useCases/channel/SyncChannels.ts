import { CreateManyChannelOutputDto } from "@dtos/CreateManyChannelOutputDto";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ChannelEntity } from "@entities/Channel";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ILoggerService } from "@services/ILogger";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";

export class SyncChannels {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    channels: Omit<ChannelEntity, "id">[],
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
        `SyncChannels.execute | ${error.message}`,
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
