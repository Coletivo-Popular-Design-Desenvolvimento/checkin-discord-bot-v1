// Tipos para eventos do Discord relacionados a eventos agendados
export interface DiscordGuildScheduledEvent {
  id: string;
  name: string;
  status: DiscordEventStatus;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  userCount?: number;
  channelId?: string;
  creatorId?: string;
  description?: string;
  image?: string;
}

export type DiscordEventStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELED"
  | "SCHEDULED";

export interface DiscordVoiceEvent extends DiscordGuildScheduledEvent {
  channelId: string;
  creatorId: string;
}
