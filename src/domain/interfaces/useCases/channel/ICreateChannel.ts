import { ChannelEntity } from "@domain/entities/Channel";

export type CreateChannelType = Omit<ChannelEntity, "id">;

export interface ICreateChannel {
  execute(channel: CreateChannelType): Promise<void>;
}
