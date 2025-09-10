import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { CreateUserEvent } from "@useCases/userEvent/CreateUserEvent";
import { IUserEventRepository } from "../domain/interfaces/repositories/IUserEventRepository";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";

export function initializeUserEventUseCases(
  userEventRepository: IUserEventRepository,
  userRepository: IUserRepository,
  audioEventRepository: IAudioEventRepository,
  logger: ILoggerService,
) {
  const createUserEventCase = new CreateUserEvent(
    userEventRepository,
    userRepository,
    audioEventRepository,
    logger,
  );

  return { createUserEventCase };
}
