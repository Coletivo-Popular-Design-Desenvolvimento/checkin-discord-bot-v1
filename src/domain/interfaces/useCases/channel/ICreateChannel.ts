import { CreateManyChannelOutputDto } from "@dtos/CreateManyChannelOutputDto";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ChannelEntity } from "@entities/Channel";

export type CreateChannelInput = Omit<ChannelEntity, "id">;

export interface ICreateChannel {
  execute(input: CreateChannelInput): Promise<GenericOutputDto<ChannelEntity>>;
  executeMany(
    channels: CreateChannelInput[],
  ): Promise<GenericOutputDto<CreateManyChannelOutputDto>>;
}
