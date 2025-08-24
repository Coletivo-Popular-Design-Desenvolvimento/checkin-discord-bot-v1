import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ILoggerService } from "@services/ILogger";
import { RegisterVoiceEvent } from "@domain/useCases/audioEvent/RegisterVoiceEvent";
import { FinalizeVoiceEvent } from "@domain/useCases/audioEvent/FinalizeVoiceEvent";
import { VoiceEventService } from "@application/services/VoiceEventService";

export function initializeVoiceEventUseCases(
  audioEventRepository: IAudioEventRepository,
  logger: ILoggerService,
): {
  voiceEventService: VoiceEventService;
} {
  const registerVoiceEvent = new RegisterVoiceEvent(audioEventRepository, logger);
  const finalizeVoiceEvent = new FinalizeVoiceEvent(audioEventRepository, logger);
  
  const voiceEventService = new VoiceEventService(
    registerVoiceEvent,
    finalizeVoiceEvent,
    logger,
  );

  return { voiceEventService };
}
