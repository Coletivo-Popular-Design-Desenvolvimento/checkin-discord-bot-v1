import { IUserRepository } from "../domain/interfaces/repositories/IUserRepository";
import { ILoggerService } from "../domain/interfaces/services/ILogger";
import { CreateUser } from "../domain/useCases/user/CreateUser";
import { FindUser } from "../domain/useCases/user/FindUser";
import { UpdateUser } from "../domain/useCases/user/UpdateUser";

export function initializeUserUseCases(
  userRepository: IUserRepository,
  logger: ILoggerService
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
