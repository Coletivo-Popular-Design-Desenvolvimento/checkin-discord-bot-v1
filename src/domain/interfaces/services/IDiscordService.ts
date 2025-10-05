export interface IDiscordService<
  M = unknown,
  U = unknown,
  P = unknown,
  T = unknown,
  C = unknown,
> {
  client: T;
  onDiscordStart(handler: () => void): void;
  onMessage(handler: (message: M) => void): void;
  onNewUser(handler: (member: U) => void): void;
  onUserLeave(handler: (member: U | P) => void): void;
  registerEvents(): void;
  onCreateChannel(handler: (channel: C) => void): void;
  onChangeChannel(handler: (oldChannel: C, newChannel: C) => void): void;
  onDeleteChannel(handler: (channel: C) => void): void;
}
