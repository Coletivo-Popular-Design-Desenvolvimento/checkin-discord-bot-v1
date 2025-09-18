import { GenericOutputDto } from "@domain/dtos/GenericOutputDto";
import { ChannelIdType } from "./IChannelId";

export interface IDeleteChannel {
  execute(id: ChannelIdType): Promise<GenericOutputDto<boolean>>;
}
