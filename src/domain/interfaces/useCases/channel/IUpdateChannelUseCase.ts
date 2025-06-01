import { GuildChannel } from "discord.js";
import { GenericOutputDto } from "../../../dtos/GenericOutputDto";
import ChannelEntity from "../../../entities/Channel";

// TODO - não deveria usar o DTO aqui?
export type CreateChannelInput = Omit<ChannelEntity, "id">;

// TODO - precisa usar o DTO aqui?
export type UpdateChannelInput = ChannelEntity;

export default interface IUpdateChannelUseCase {
  executeAsync(
    oldChannel: Partial<GuildChannel>,
    newChannel: CreateChannelInput,
  ): Promise<GenericOutputDto<ChannelEntity>>;
}
