import { OutputDto } from "../../dtos/OutPutDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { IFindUser } from "../../interfaces/useCases/IFindUser";

export class FindUser implements IFindUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number | string): Promise<OutputDto<UserEntity>> {
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

      return {
        data: user,
        success: true,
      };
    } catch (error) {
      // Logger
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async executeFindAll(limit?: number): Promise<OutputDto<UserEntity[]>> {
    try {
      const users = await this.userRepository.listAll(limit);
      return {
        data: users,
        success: true,
      };
    } catch (error) {
      // Logger
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
