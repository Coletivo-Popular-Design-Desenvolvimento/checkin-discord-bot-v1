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
  ): Promise<void> {
    try {
      const channel =
        typeof id === "string"
          ? await this.channelRepository.findByPlatformId(id)
          : await this.channelRepository.findById(id);

      if (!channel) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.USECASE,
          LoggerContextEntity.CHANNEL,
          `UpdateChannel.execute | ${ErrorMessages.CHANNEL_NOT_FOUND} ${id}`,
        );
      }

      const updatedChannel = await this.channelRepository.updateById(
        channel.id,
        data,
      );

      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `Channel ${updatedChannel.id} - ${updatedChannel.name} has been updated`,
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `UpdateChannel.execute | ${error.message}`,
      );
    }
  }
}
