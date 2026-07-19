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

// Mapeia o status numérico bruto do discord.js (GuildScheduledEventStatus) para o tipo interno
export function mapDiscordScheduledEventStatus(
  rawStatus: string | number,
): DiscordEventStatus {
  const statusMap = <const>{
    "1": "SCHEDULED",
    "2": "ACTIVE",
    "3": "COMPLETED",
    "4": "CANCELED",
  };

  return statusMap[rawStatus.toString()] || "SCHEDULED";
}

// Mapeia o status interno para o platform_id usado na tabela event_status
export function mapEventStatusToPlatformId(status: DiscordEventStatus): string {
  const statusMap = <const>{
    SCHEDULED: "scheduled",
    ACTIVE: "active",
    COMPLETED: "completed",
    CANCELED: "canceled",
  };

  return statusMap[status] || "scheduled";
}
