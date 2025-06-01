import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";
import { CreateChannelInput } from "./IUpdateChannelUseCase";

export default interface ICreateChannelUseCase {
  executeAsync(
    channel: CreateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>>;
}
