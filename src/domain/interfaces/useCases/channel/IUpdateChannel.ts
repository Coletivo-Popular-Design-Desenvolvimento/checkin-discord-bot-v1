import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ChannelEntity } from "@entities/Channel";

export interface IUpdateChannel {
  execute(
    id: number | string,
    data: Partial<ChannelEntity>,
  ): Promise<GenericOutputDto<ChannelEntity>>;
}
