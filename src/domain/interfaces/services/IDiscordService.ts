import { DiscordGuildScheduledEvent } from "@type/DiscordEventTypes";

export interface IDiscordService<
  M = unknown,
  U = unknown,
  P = unknown,
  T = unknown,
  E = unknown,
> {
  client: T;
  onDiscordStart(handler: () => void): void;
  onMessage(handler: (message: M) => void): void;
  onNewUser(handler: (member: U) => void): void;
  onUserLeave(handler: (member: U | P) => void): void;
  onVoiceEvent(handler: (event: E) => void): void;
  registerEvents(): void;
}
