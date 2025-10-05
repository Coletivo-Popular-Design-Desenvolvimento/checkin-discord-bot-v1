import { GenericOutputDto } from "@domain/dtos/GenericOutputDto";
import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ChannelIdType } from "@domain/interfaces/useCases/channel/IChannelId";
import { IDeleteChannel } from "@domain/interfaces/useCases/channel/IDeleteChannel";
import { ErrorMessages } from "@domain/types/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";

export class DeleteChannel implements IDeleteChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  public async execute(id: ChannelIdType): Promise<GenericOutputDto<boolean>> {
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

      const isDeleted = await this.channelRepository.deleteById(channel.id);
      return {
        data: isDeleted,
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
        data: false,
        success: false,
        message: error.message,
      };
    }
  }
}
