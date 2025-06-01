import ChannelEntity from "../../entities/Channel";

export type ManyChannelsDto = {
  isSuccess: boolean;
  channels: ChannelEntity[];
  message?: string;
};
