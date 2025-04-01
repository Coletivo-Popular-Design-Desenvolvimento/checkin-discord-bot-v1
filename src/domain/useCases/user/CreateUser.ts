import { OutputDto } from "../../dtos/OutPutDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import {
  CreateUserInput,
  ICreateUser,
} from "../../interfaces/useCases/ICreateUser";
import { UserStatus } from "../../types/UserStatusEnum";

export class CreateUser implements ICreateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<OutputDto<UserEntity>> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByDiscordId(
        input.discordId
      );
      if (existingUser) {
        return {
          data: existingUser,
          success: false,
          message: "User already exists",
        };
      }

      // Create new user
      const newUser = await this.userRepository.create({
        discordId: input.discordId,
        username: input.username,
        joinedAt: input.joinedAt,
        bot: false,
        status: UserStatus.ACTIVE,
        globalName: input.globalName,
        createdAt: input.createdAt,
        updateAt: input.updateAt,
        lastActive: input.lastActive,
        email: input.email,
      });

      return {
        data: newUser,
        success: true,
      };
    } catch (error) {
      //Logger aqui
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
