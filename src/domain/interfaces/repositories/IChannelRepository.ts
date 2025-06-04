import ChannelEntity from "../../entities/Channel";

export default interface IChannelRepository {
  listAllAsync(limit?: number): Promise<ChannelEntity[]>;
  findByIdAsync(id: number): Promise<ChannelEntity | null>;
  findByDiscordIdAsync(discordId: string): Promise<ChannelEntity | null>;
  createAsync(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity | null>;
  createManyAsync(channels: Omit<ChannelEntity, "id">[]): Promise<number | null>;
  updateAsync(id: number, channel: Partial<ChannelEntity>): Promise<void>;
  deleteAsync(id: number): Promise<ChannelEntity | null>;
}
