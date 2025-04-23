import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";

export default interface IFindChannel {
    findByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>>;
    findByNameAsync(name: string): Promise<GenericOutputDto<ChannelEntity>>;
}