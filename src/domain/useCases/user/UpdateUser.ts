import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEntity } from "@entities/User";
import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { IUpdateUser } from "@interfaces/useCases/user/IUpdateUser";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import { UserStatus } from "@type/UserStatusEnum";

export class UpdateUser implements IUpdateUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService,
  ) {}
  async execute(
    id: number | string,
    data: Partial<UserEntity>,
  ): Promise<GenericOutputDto<UserEntity>> {
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
          message: `${ErrorMessages.USER_NOT_FOUND} ${id}`,
        };
      }

      const updatedUser = await this.userRepository.updateById(user.id, data);
      return {
        data: updatedUser,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `UpdateUser.execute | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message: error.message,
      };
    }
  }

  async executeInvertUserStatus(
    id: number | string,
  ): Promise<GenericOutputDto<UserEntity>> {
    try {
      let user: UserEntity;

      if (typeof id === "string") {
        user = await this.userRepository.findByDiscordId(id, true);
      } else if (typeof id === "number") {
        user = await this.userRepository.findById(id, true);
      }

      if (!user) {
        return {
          data: null,
          success: false,
          message: `${ErrorMessages.USER_NOT_FOUND} ${id}`,
        };
      }

      const updatedUser = await this.userRepository.updateById(user.id, {
        ...user,
        status:
          user.status === UserStatus.ACTIVE
            ? UserStatus.INACTIVE
            : UserStatus.ACTIVE,
      });

      return {
        data: updatedUser,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `UpdateUser.executeDisableUser | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message: error.message,
      };
    }
  }
}
