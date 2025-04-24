import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";

export type CreateChannelInput = Omit<ChannelEntity, "id">;

export default interface ICreateChannelUseCase {
    executeAsync(channel: CreateChannelInput): Promise<GenericOutputDto<ChannelEntity>>;
}