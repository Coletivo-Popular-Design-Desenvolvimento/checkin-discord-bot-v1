import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IDeleteChannel } from "@interfaces/useCases/channel/IDeleteChannel";
import { ErrorMessages } from "@type/ErrorMessages";
import { ILoggerService } from "@services/ILogger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { ChannelEntity } from "@domain/entities/Channel";

export class DeleteChannel implements IDeleteChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(id: number | string): Promise<GenericOutputDto<boolean>> {
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

      await this.channelRepository.deleteById(channel.id);
      return {
        data: true,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `DeleteChannel.execute | ${error.message}`,
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
