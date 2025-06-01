import { GuildChannel } from "discord.js";
import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";

export type CreateChannelInput = Omit<ChannelEntity, "id">;
export type UpdateChannelInput = ChannelEntity;

export default interface IUpdateChannelUseCase {
  executeAsync(
    oldChannel: Partial<GuildChannel>,
    newChannel: CreateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>>;
}
