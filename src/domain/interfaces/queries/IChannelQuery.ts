import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import ChannelEntity from "../../entities/Channel";

export default interface IChannelQuery {
    executeFindAllAsync(): Promise<GenericOutputDto<ChannelEntity>>;
    executeFindByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>>;
    executeFindByDiscordIdAsync(name: string): Promise<GenericOutputDto<ChannelEntity>>;
}