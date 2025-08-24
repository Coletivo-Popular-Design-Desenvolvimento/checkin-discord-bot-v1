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
  onVoiceEvent(handler: (event: any) => void): void;
  registerEvents(): void;
}
