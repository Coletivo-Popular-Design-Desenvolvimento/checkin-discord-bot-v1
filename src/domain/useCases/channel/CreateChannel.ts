import { GenericOutputDto } from "@domain/dtos/GenericOutputDto";
import { ChannelEntity } from "@domain/entities/Channel";
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

  public async execute(
    channel: CreateChannelType,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    try {
      const createdChannel =
        await this.channelRepository.createMinimal(channel);
      return {
        data: { ...createdChannel },
        success: true,
        message: "Channel saved successfully",
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeCreateChannel | ${error.message}`,
      );
    }
  }
}
