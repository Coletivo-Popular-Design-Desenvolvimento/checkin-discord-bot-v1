import { UserOutputDto } from "../../dtos/UserOutputDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IUpdateUser } from "../../interfaces/useCases/IUpdateUser";

export class UpdateUser implements IUpdateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    id: number | string,
    data: Partial<UserEntity>
  ): Promise<UserOutputDto> {
    try {
      let user: UserEntity;

      if (typeof id === "string") {
        user = await this.userRepository.findByDiscordId(id);
      } else if (typeof id === "number") {
        user = await this.userRepository.findById(id);
      }

      if (!user) {
        return {
          user: null,
          success: false,
          message: `User not found with id ${id}`,
        };
      }

      const updatedUser = await this.userRepository.updateById(user.id, data);
      return {
        user: updatedUser,
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        message: error.message,
      };
    }
  }
}
