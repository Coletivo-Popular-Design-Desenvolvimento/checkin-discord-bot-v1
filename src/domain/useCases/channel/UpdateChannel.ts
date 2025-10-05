import { GenericOutputDto } from "@domain/dtos/GenericOutputDto";
import { ChannelEntity } from "@domain/entities/Channel";
import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ChannelIdType } from "@domain/interfaces/useCases/channel/IChannelId";
import { IUpdateChannel } from "@domain/interfaces/useCases/channel/IUpdateChannel";
import { ErrorMessages } from "@domain/types/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";

export class UpdateChannel implements IUpdateChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  public async execute(
    id: ChannelIdType,
    data: Partial<ChannelEntity>,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    try {
      const channel =
        typeof id === "string"
          ? await this.channelRepository.findByPlatformId(id)
          : await this.channelRepository.findById(id);

      if (!channel) {
        return {
          data: null,
          success: false,
          message: `${ErrorMessages.CHANNEL_NOT_FOUND} ${id}`,
        };
      }

      const updatedChannel = await this.channelRepository.updateById(
        channel.id,
        data,
      );

      return {
        data: { ...updatedChannel },
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `UpdateChannel.execute | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message: error.message,
      };
    }
  }
}
