import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { UserEntity } from "@entities/User";
import { IUserRepository } from "@repositories/IUserRepository";
import { ILoggerService } from "@services/ILogger";
import { IFindUser } from "@interfaces/useCases/user/IFindUser";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";

export class FindUser implements IFindUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    id: number | string,
  ): Promise<GenericOutputDto<UserEntity | null>> {
    try {
      let user: UserEntity;

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

      return {
        data: user,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `FindUser.execute | ${error.message}`,
      );
      return {
        data: null,
        success: false,
        message:
          error instanceof Error ? error.message : ErrorMessages.UNKNOWN_ERROR,
      };
    }
  }

  async executeFindAll(
    limit?: number,
  ): Promise<GenericOutputDto<UserEntity[]>> {
    try {
      const users = await this.userRepository.listAll(limit);
      return {
        data: users,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.USER,
        `executeFindAll.execute | ${error.message}`,
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
