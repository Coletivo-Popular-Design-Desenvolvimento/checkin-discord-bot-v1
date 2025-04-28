import DiscordEvents from "../../../application/events/DiscordEvents";
import UserEvents from "../../../application/events/UserEvents";

export interface IUserCommand {
  executeNewUser(userEvents: UserEvents): Promise<void>;
  executeAllUsers(discordEvents: DiscordEvents, userEvents: UserEvents): Promise<void>;
  executeUserLeave(userEvents: UserEvents): Promise<void>;
}
