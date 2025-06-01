import ChannelEntity from "../../entities/Channel";

export default interface IChannelRepository {
  listAllAsync(limit?: number): Promise<ChannelEntity[]>;
  findByIdAsync(id: number): Promise<ChannelEntity>;
  findByDiscordIdAsync(discordId: string): Promise<ChannelEntity | null>;
  createAsync(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity>;
  createManyAsync(channels: Omit<ChannelEntity, "id">[]): Promise<void>;
  updateAsync(id: number, channel: Partial<ChannelEntity>): Promise<void>;
  deleteAsync(id: number): Promise<void>;
}
