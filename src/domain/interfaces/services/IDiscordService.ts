export interface IDiscordService<
  M = unknown,
  U = unknown,
  P = unknown,
  T = unknown
> {
  client: T;
  onDiscordStart(handler: () => void): void;
  onMessage(handler: (message: M) => void): void;
  onNewUser(handler: (member: U) => void): void;
  onUserLeave(handler: (member: U | P) => void): void;
  registerEvents(): void;
  onChannelCreate(handler: (channel: U) => void): void;
  onChannelUpdate(handler: (oldChannel: U, newChannel: U) => void): void;
}
