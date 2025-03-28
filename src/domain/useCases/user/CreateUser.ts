import { UserOutputDto } from "../../dtos/UserOutputDto";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import {
  CreateUserInput,
  ICreateUser,
} from "../../interfaces/useCases/ICreateUser";

export class CreateUser implements ICreateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<UserOutputDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByDiscordId(
        input.discordId
      );
      if (existingUser) {
        return {
          user: existingUser,
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
        globalName: input.globalName,
        createdAt: input.createdAt,
        updateAt: input.updateAt,
        lastActive: input.lastActive,
        email: input.email,
      });

      return {
        user: newUser,
        success: true,
      };
    } catch (error) {
      //Logger aqui
      return {
        user: null,
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
