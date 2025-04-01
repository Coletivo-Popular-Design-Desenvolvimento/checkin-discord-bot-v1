import { IUserRepository } from "../domain/interfaces/repositories/IUserRepository";
import { CreateUser } from "../domain/useCases/user/CreateUser";
import { FindUser } from "../domain/useCases/user/FindUser";
import { UpdateUser } from "../domain/useCases/user/UpdateUser";

export function initializeUseCases(userRepository: IUserRepository) {
  const createUserCase = new CreateUser(userRepository);
  const findUserCase = new FindUser(userRepository);
  const updateUserCase = new UpdateUser(userRepository);

  return {
    createUserCase,
    findUserCase,
    updateUserCase,
  };
}
