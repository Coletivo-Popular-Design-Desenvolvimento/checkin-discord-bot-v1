import { IRoleRepository } from "@repositories/IRoleRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { UpdateUserRole } from "@domain/useCases/role/UpdateUserRole";
import { IUpdateUserRole } from "@interfaces/useCases/role/IUpdateUserRole";

export function initializeRoleUseCases(
  roleRepository: IRoleRepository,
  userRepository: IUserRepository,
  createUserCase: ICreateUser,
  logger: ILoggerService,
): {
  updateUserRoleCase: IUpdateUserRole;
} {
  const updateUserRoleCase = new UpdateUserRole(
    roleRepository,
    userRepository,
    createUserCase,
    logger,
  );

  return {
    updateUserRoleCase,
  };
}
