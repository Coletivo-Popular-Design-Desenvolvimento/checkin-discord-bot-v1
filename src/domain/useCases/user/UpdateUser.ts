import { OutputDto } from "../../dtos/OutPutDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IUpdateUser } from "../../interfaces/useCases/IUpdateUser";
import { UserStatus } from "../../types/UserStatusEnum";

export class UpdateUser implements IUpdateUser {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(
    id: number | string,
    data: Partial<UserEntity>
  ): Promise<OutputDto<UserEntity>> {
    try {
      let user: UserEntity;

      if (typeof id === "string") {
        user = await this.userRepository.findByDiscordId(id);
      } else if (typeof id === "number") {
        user = await this.userRepository.findById(id);
      }

      if (!user) {
        return {
          data: null,
          success: false,
          message: `User not found with id ${id}`,
        };
      }

      const updatedUser = await this.userRepository.updateById(user.id, data);
      return {
        data: updatedUser,
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

  async executeDisableUser(
    id: number | string
  ): Promise<OutputDto<UserEntity>> {
    try {
      let user: UserEntity;

      if (typeof id === "string") {
        user = await this.userRepository.findByDiscordId(id);
      } else if (typeof id === "number") {
        user = await this.userRepository.findById(id);
      }

      if (!user) {
        return {
          data: null,
          success: false,
          message: `User not found with id ${id}`,
        };
      }

      const updatedUser = await this.userRepository.updateById(user.id, {
        ...user,
        status: UserStatus.INACTIVE,
      });
      return {
        data: updatedUser,
        success: true,
      };
    } catch (error) {
      return {
        // Logger
        data: null,
        success: false,
        message: error.message,
      };
    }
  }
}
