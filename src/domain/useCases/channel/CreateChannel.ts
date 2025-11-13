import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  CreateChannelType,
  ICreateChannel,
} from "@domain/interfaces/useCases/channel/ICreateChannel";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";

export class CreateChannel implements ICreateChannel {
  constructor(
    private readonly channelRepository: IChannelRepository,
    private readonly logger: ILoggerService,
  ) {}

  public async execute(channel: CreateChannelType): Promise<void> {
    try {
      const createdChannel = await this.channelRepository.create(channel);
      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `Channel ${createdChannel.id} - ${createdChannel.name} saved successfully`,
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `executeCreateChannel | ${error.message}`,
      );
    }
  }
}
