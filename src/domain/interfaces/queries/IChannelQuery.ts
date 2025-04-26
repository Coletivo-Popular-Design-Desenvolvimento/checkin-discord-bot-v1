import { ManyChannelsDto } from "../../dtos/channels/manyChannelsDto";
import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import ChannelEntity from "../../entities/Channel";

export default interface IChannelQuery {
    executeFindAllAsync(limit?: number): Promise<ManyChannelsDto>;
    executeFindByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>>;
    executeFindByDiscordIdAsync(name: string): Promise<GenericOutputDto<ChannelEntity>>;
}