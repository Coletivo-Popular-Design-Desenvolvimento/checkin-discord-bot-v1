import { GenericOutputDto } from "@domain/dtos/GenericOutputDto";
import { ChannelEntity } from "@domain/entities/Channel";
import { ChannelIdType } from "./IChannelId";

export interface IUpdateChannel {
  execute(
    id: ChannelIdType,
    data: Partial<ChannelEntity>,
  ): Promise<GenericOutputDto<ChannelEntity>>;
}
