import ChannelEntity from "../../entities/Channel";

export interface IChannelRepository {
    listAllAsync(limit?: number): Promise<ChannelEntity[]>;
    findByIdAsync(id: number): Promise<ChannelEntity>;
    findByNameAsync(name: string): Promise<ChannelEntity>;
    createAsync(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity>;
    updateAsync(id: number, channel: Partial<ChannelEntity>): Promise<void>;
    deleteAsync(id: number): Promise<void>
}