import { ChannelEntity } from "../../entities/Channel";

export interface IChannelRepository {
  createMinimal(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity>;
  create(voiceChannel: Omit<ChannelEntity, "id">): Promise<ChannelEntity>;
  createMany(voiceChannels: Omit<ChannelEntity, "id">[]): Promise<number>;
  findById(
    id: number,
    includeInactive?: boolean,
  ): Promise<ChannelEntity | null>;
  findByPlatformId(
    id: string,
    includeInactive?: boolean,
  ): Promise<ChannelEntity | null>;
  listAll(limit?: number, includeInactive?: boolean): Promise<ChannelEntity[]>;
  updateById(
    id: number,
    voiceChannel: Partial<ChannelEntity>,
  ): Promise<ChannelEntity | null>;
  deleteById(id: number): Promise<boolean>;
}
