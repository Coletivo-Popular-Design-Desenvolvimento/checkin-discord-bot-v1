export interface IDiscordService<
  M = unknown,
  U = unknown,
  P = unknown,
  T = unknown,
  S = unknown,
  C = unknown,
  E = unknown,
  R = unknown,
  U2 = unknown,
> {
  client: T;
  onDiscordStart(handler: () => void): void;
  onMessage(handler: (message: M) => void): void;
  onNewUser(handler: (member: U) => void): void;
  onUserLeave(handler: (member: U | P) => void): void;
  onVoiceEventUserChange(handler: (oldState: S, newState: S) => void): void;
  onVoiceEvent(handler: (event: E) => void): void;
  onReactionAdd(handler: (reaction: R, user: U2) => void): void;
  onReactionRemove(handler: (reaction: R, user: U2) => void): void;
  registerEvents(): void;
  onCreateChannel(handler: (channel: C) => void): void;
  onChangeChannel(handler: (oldChannel: C, newChannel: C) => void): void;
  onDeleteChannel(handler: (channel: C) => void): void;
}
