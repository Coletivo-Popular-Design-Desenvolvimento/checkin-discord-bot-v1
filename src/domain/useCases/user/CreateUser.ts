import { CreateManyUserOutputDto } from "../../dtos/CreateManyUserOutputDto";
import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import { UserEntity } from "../../entities/User";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import { ILoggerService } from "../../interfaces/services/ILogger";
import {
  CreateUserInput,
  ICreateUser,
} from "../../interfaces/useCases/user/ICreateUser";
import { ErrorMessages } from "../../types/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "../../types/LoggerContextEnum";
import { CommonMessages } from "../../types/CommonMessages";
import { UserStatus } from "../../types/UserStatusEnum";

export class CreateUser implements ICreateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService
  ) {}

  async execute(input: CreateUserInput): Promise<GenericOutputDto<UserEntity>> {
    try {
      if (input.bot) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.NO_BOT,
        };
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findByDiscordId(
        input.discordId,
        true
      );
      if (existingUser) {
        if (existingUser.status === UserStatus.INACTIVE) {
          const reactivatedUser = await this.userRepository.updateById(
            existingUser.id,
            {
              status: UserStatus.ACTIVE,
            }
          );
          return {
            data: reactivatedUser,
            success: true,
            message: CommonMessages.REACTIVATE_USER,
          };
        }
        return {
          data: existingUser,
          success: false,
          message: ErrorMessages.USER_ALREADY_EXISTS,
        };
      }

      // Create new user
      const newUser = await this.userRepository.create({
        ...input,
        status: UserStatus.ACTIVE,
      });

      return {
        data: newUser,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `createUser.execute | ${error.message}`
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  async executeMany(
    users: CreateUserInput[]
  ): Promise<GenericOutputDto<CreateManyUserOutputDto>> {
    try {
      const created = await this.userRepository.createMany(
        users.filter((user) => !user.bot)
      );
      return {
        data: {
          created,
          failed: users.length - created,
        },
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `CreateUser.executeMany | ${error.message}`
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }
}
