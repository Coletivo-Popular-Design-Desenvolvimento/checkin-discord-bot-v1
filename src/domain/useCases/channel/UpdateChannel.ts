import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ChannelEntity } from "@entities/Channel";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ILoggerService } from "@services/ILogger";
import { IUpdateChannel } from "@interfaces/useCases/channel/IUpdateChannel";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";

export class UpdateChannel implements IUpdateChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    id: number | string,
    data: Partial<ChannelEntity>,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    try {
      let channel: ChannelEntity;

      if (typeof id === "string") {
        channel = await this.channelRepository.findByPlatformId(id);
      } else {
        channel = await this.channelRepository.findById(id);
      }

      if (!channel) {
        return {
          data: null,
          success: false,
          message: `${ErrorMessages.UNKNOWN_ERROR} ${id}`,
        };
      }

      const updated = await this.channelRepository.updateById(channel.id, data);
      return {
        data: updated,
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
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }
}
