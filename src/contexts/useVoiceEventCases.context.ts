import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { RegisterVoiceEvent } from "@domain/useCases/audioEvent/RegisterVoiceEvent";
import { FinalizeVoiceEvent } from "@domain/useCases/audioEvent/FinalizeVoiceEvent";

export function initializeVoiceEventUseCases(
  audioEventRepository: IAudioEventRepository,
  channelRepository: IChannelRepository,
  userRepository: IUserRepository,
  logger: ILoggerService,
): {
  registerVoiceEvent: RegisterVoiceEvent;
  finalizeVoiceEvent: FinalizeVoiceEvent;
} {
  const registerVoiceEvent = new RegisterVoiceEvent(
    audioEventRepository,
    channelRepository,
    userRepository,
    logger,
  );
  const finalizeVoiceEvent = new FinalizeVoiceEvent(
    audioEventRepository,
    logger,
  );

  return { registerVoiceEvent, finalizeVoiceEvent };
}
