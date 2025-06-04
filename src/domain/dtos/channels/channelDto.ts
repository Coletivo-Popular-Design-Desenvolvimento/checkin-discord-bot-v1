import ChannelEntity from "../../entities/Channel";

export type CreateChannelInput = Omit<ChannelEntity, "id">;
