import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ILoggerService } from "@services/ILogger";
import { RegisterVoiceEvent } from "@domain/useCases/audioEvent/RegisterVoiceEvent";
import { FinalizeVoiceEvent } from "@domain/useCases/audioEvent/FinalizeVoiceEvent";

export function initializeVoiceEventUseCases(
  audioEventRepository: IAudioEventRepository,
  logger: ILoggerService,
): {
  registerVoiceEvent: RegisterVoiceEvent;
  finalizeVoiceEvent: FinalizeVoiceEvent;
} {
  const registerVoiceEvent = new RegisterVoiceEvent(
    audioEventRepository,
    logger,
  );
  const finalizeVoiceEvent = new FinalizeVoiceEvent(
    audioEventRepository,
    logger,
  );

  return { registerVoiceEvent, finalizeVoiceEvent };
}
