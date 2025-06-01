import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";

export default interface IFindChannel {
  findAllAsync(limit?: number): Promise<GenericOutputDto<ChannelEntity[]>>;
  findByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>>;
  findByNameAsync(name: string): Promise<GenericOutputDto<ChannelEntity>>;
}
