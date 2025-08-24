import { AudioEventEntity } from "@entities/AudioEvent";
import { GenericOutputDto } from "@dtos/GenericOutputDto";

// Input DTO para registrar um evento de voz
export interface RegisterVoiceEventInput {
  platformId: string;
  name: string;
  statusId: string;
  startAt: Date;
  endAt?: Date;
  userCount: number;
  channelId: string;
  creatorId: string;
  description?: string;
  image?: string;
}

export interface IRegisterVoiceEvent {
  execute(input: RegisterVoiceEventInput): Promise<GenericOutputDto<AudioEventEntity>>;
}
