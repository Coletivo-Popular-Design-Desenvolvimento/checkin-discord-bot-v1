// Implementa soft delete (marca usuário como INACTIVE)

import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEntity } from "@entities/User";
import { IUserRepository } from "@repositories/IUserRepository";
import { IDeleteUser } from "@interfaces/useCases/user/IDeleteUser";
import { ErrorMessages } from "@type/ErrorMessages";
import { UserStatus } from "@type/UserStatusEnum";

export class DeleteUser implements IDeleteUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number | string): Promise<GenericOutputDto<boolean>> {
    try {
      let user: UserEntity | null = null;

      if (typeof id === "string") {
        user = await this.userRepository.findByPlatformId(id);
      } else if (typeof id === "number") {
        user = await this.userRepository.findById(id);
      }

      if (!user) {
        return {
          data: null,
          success: false,
          message: `${ErrorMessages.USER_NOT_FOUND} ${id}`,
        };
      }

      // Soft delete: marca usuário como INACTIVE
      const updatedUser = await this.userRepository.updateById(user.id, {
        status: UserStatus.INACTIVE,
      });

      return {
        data: updatedUser ? true : false,
        success: updatedUser ? true : false,
        message: updatedUser
          ? "Usuário marcado como inativo"
          : "Falha ao desativar usuário",
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error.message,
      };
    }
  }
}
