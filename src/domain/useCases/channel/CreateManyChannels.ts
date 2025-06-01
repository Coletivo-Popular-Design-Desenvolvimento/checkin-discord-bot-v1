import { Channel, Collection, GuildChannel } from "discord.js";
import { CreateChannelInput } from "../../dtos/channels/channelDto";
import IChannelRepository from "../../interfaces/repositories/IChannelRepository";
// import { ILoggerService } from "../../interfaces/services/ILogger";
import ICreateManyChannelsUseCase from "../../interfaces/useCases/channel/ICreateManyChannelUseCase";

export default class CreateManyChannelsUseCase
  implements ICreateManyChannelsUseCase
{
  // constructor(private readonly repository: IChannelRepository, logger: ILoggerService)
  constructor(private readonly repository: IChannelRepository) {}

  async executeAsync(channels: Collection<string, Channel>): Promise<void> {
    await this.repository.createManyAsync(
      this.mapToManyChannelEntity(channels),
    );
  }

  private mapToManyChannelEntity(
    channels: Collection<string, Channel>,
  ): CreateChannelInput[] {
    const channelInputs: CreateChannelInput[] = [];
    channels.forEach((channel, id) => {
      let channelName: string | undefined;
      if (channel instanceof GuildChannel) {
        channelName = channel.name;
      }
      channelInputs.push({
        discordId: id,
        name: channelName,
        url: channel.url,
        createAt: channel.createdAt
          ? new Date(channel.createdTimestamp)
          : undefined,
      });
    });
    return channelInputs;
  }
}
