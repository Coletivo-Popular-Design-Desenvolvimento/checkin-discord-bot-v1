import ChannelEvents from "../../../application/events/ChannelEvents";
import DiscordEvents from "../../../application/events/DiscordEvents";

export default interface IChannelCommand {
    executeNewChannel(channelEvents: ChannelEvents): Promise<void>;
    executeUpdateChannelExisting(channelEvents: ChannelEvents): Promise<void>;
    executeCopyAllChannelsExisting(channelEvents: ChannelEvents, discordEvents: DiscordEvents): Promise<void>
}