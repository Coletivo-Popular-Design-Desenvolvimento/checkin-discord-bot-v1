import { GuildChannel } from "discord.js";
import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import ChannelEntity from "../../entities/Channel";
import IChannelRepository from "../../interfaces/repositories/IChannelRepository";
// import { ILoggerService } from "../../interfaces/services/ILogger";
import IUpdateChannelUseCase, {
  UpdateChannelInput,
} from "../../interfaces/useCases/channel/IUpdateChannelUseCase";

export default class UpdateChannelUseCase implements IUpdateChannelUseCase {
  // constructor(private readonly channelRepository: IChannelRepository, private readonly logger: ILoggerService) { }
  constructor(private readonly channelRepository: IChannelRepository) {}

  async executeAsync(
    oldChannel: Partial<GuildChannel>,
    newChannel: UpdateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>> {
    const channelAlready = await this.channelRepository.findByDiscordIdAsync(
      oldChannel.id,
    );
    if (channelAlready === null) {
      return {
        data: null,
        success: false,
        message: "Channel not found",
      };
    }
    await this.channelRepository.updateAsync(newChannel.id, newChannel);
    return {
      data: newChannel,
      success: true,
    };
  }
}
