import { AudioEventEntity } from "@entities/AudioEvent";
import { GenericOutputDto } from "@dtos/GenericOutputDto";

// Input DTO para finalizar um evento de voz
export interface FinalizeVoiceEventInput {
  platformId: string;
  endAt: Date;
  userCount: number;
}

export interface IFinalizeVoiceEvent {
  execute(input: FinalizeVoiceEventInput): Promise<GenericOutputDto<AudioEventEntity>>;
}
