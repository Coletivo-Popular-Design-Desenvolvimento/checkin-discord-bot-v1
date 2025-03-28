import { UserListOutputDto } from "../../dtos/UserListOutputDto";
import { UserOutputDto } from "../../dtos/UserOutputDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IFindUser } from "../../interfaces/useCases/IFindUser";

export class FindUser implements IFindUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number | string): Promise<UserOutputDto> {
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

      return {
        user,
        success: true,
      };
    } catch (error) {
      // Logger
      return {
        user: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async executeFindAll(limit?: number): Promise<UserListOutputDto> {
    try {
      const users = await this.userRepository.listAll(limit);
      return {
        users,
        success: true,
      };
    } catch (error) {
      // Logger
      return {
        users: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
