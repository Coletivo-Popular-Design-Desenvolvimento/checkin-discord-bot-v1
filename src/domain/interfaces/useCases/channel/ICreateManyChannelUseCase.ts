import { Channel, Collection } from "discord.js";

export default interface ICreateManyChannelUseCase {
  executeAsync(channels: Collection<string, Channel>): Promise<void>;
}
