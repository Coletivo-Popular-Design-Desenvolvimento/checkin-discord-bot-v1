import { ChannelIdType } from "./IChannelId";

export interface IDeleteChannel {
  execute(id: ChannelIdType): Promise<void>;
}
