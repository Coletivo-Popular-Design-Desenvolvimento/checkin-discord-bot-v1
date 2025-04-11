// TODO: Delete fisico em cascata

import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IDeleteUser } from "../../interfaces/useCases/user/IDeleteUser";
import { ErrorMessages } from "../../types/ErrorMessages";

export class DeleteUser implements IDeleteUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number | string): Promise<GenericOutputDto<Boolean>> {
    try {
      let user: UserEntity;

      if (typeof id === "string") {
        await this.userRepository.findByDiscordId(id);
      } else if (typeof id === "number") {
        await this.userRepository.findById(id);
      }

      if (!user) {
        return {
          data: null,
          success: false,
          message: `${ErrorMessages.USER_NOT_FOUND} ${id}`,
        };
      }

      await this.userRepository.deleteById(user.id);
      return {
        data: true,
        success: true,
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
