import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { CreateUser } from "@useCases/user/CreateUser";
import { FindUser } from "@useCases/user/FindUser";
import { UpdateUser } from "@useCases/user/UpdateUser";

export function initializeUserUseCases(
  userRepository: IUserRepository,
  logger: ILoggerService,
) {
  const createUserCase = new CreateUser(userRepository, logger);
  const findUserCase = new FindUser(userRepository, logger);
  const updateUserCase = new UpdateUser(userRepository, logger);

  return {
    createUserCase,
    findUserCase,
    updateUserCase,
  };
}
