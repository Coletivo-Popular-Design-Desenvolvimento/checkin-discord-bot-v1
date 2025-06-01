import { CreateChannelInput } from "../../dtos/channels/channelDto";
import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import ChannelEntity from "../../entities/Channel";
import IChannelRepository from "../../interfaces/repositories/IChannelRepository";
// import { ILoggerService } from "../../interfaces/services/ILogger";
import ICreateChannelUseCase from "../../interfaces/useCases/channel/ICreateChannelUseCase";

export default class CreateChannel implements ICreateChannelUseCase {
  constructor(
    private readonly channelRepository: IChannelRepository,
    // private readonly logger: ILoggerService,
  ) {}

  async executeAsync(
    channel: CreateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    const existingChannel = await this.channelRepository.findByDiscordIdAsync(
      channel.discordId,
    );
    if (existingChannel) {
      return {
        data: null,
        success: false,
        message: "Channel already exists",
      };
    }
    const newChannel = await this.channelRepository.createAsync({ ...channel });
    return {
      data: newChannel,
      success: true,
    };
  }
}
