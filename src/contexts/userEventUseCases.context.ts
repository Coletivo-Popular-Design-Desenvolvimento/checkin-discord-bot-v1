import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { CreateUserEvent } from "@useCases/userEvent/CreateUserEvent";
import { IUserEventRepository } from "../domain/interfaces/repositories/IUserEventRepository";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { IRegisterVoiceEvent } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";

export function initializeUserEventUseCases(
  userEventRepository: IUserEventRepository,
  userRepository: IUserRepository,
  audioEventRepository: IAudioEventRepository,
  createUser: ICreateUser,
  registerVoiceEvent: IRegisterVoiceEvent,
  logger: ILoggerService,
) {
  const createUserEventCase = new CreateUserEvent(
    userEventRepository,
    userRepository,
    audioEventRepository,
    createUser,
    registerVoiceEvent,
    logger,
  );

  return { createUserEventCase };
}
