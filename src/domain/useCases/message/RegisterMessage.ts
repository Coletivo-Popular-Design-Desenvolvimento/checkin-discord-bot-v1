import { MessageEntity } from "@entities/Message";
import { IMessageRepository } from "@repositories/IMessageRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { GenericOutputDto } from "@dtos/GenericOutputDto";
import { ErrorMessages } from "@type/ErrorMessages";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@type/LoggerContextEnum";
import {
  RegisterMessageInput,
  IRegisterMessage,
} from "@interfaces/useCases/message/IRegisterMessage";
import { ChannelEntity } from "@entities/Channel";
import { UserStatus } from "@type/UserStatusEnum";

export class RegisterMessage implements IRegisterMessage {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly userRepository: IUserRepository,
    private readonly channelRepository: IChannelRepository,
    private readonly createUser: ICreateUser,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: RegisterMessageInput,
  ): Promise<GenericOutputDto<MessageEntity>> {
    try {
      let user = await this.userRepository.findByPlatformId(input.userId, true);

      if (!user) {
        if (!input.username) {
          return {
            data: null,
            success: false,
            message: "User data required for user creation",
          };
        }

        const createUserInput = {
          platformId: input.userId,
          username: input.username,
          globalName: input.userGlobalName || null,
          bot: input.userBot || false,
          status: UserStatus.ACTIVE,
          platformCreatedAt: input.userPlatformCreatedAt,
          joinedAt: input.userJoinedAt || null,
          lastActive: undefined,
        };

        const createUserResult = await this.createUser.execute(createUserInput);
        if (!createUserResult.success || !createUserResult.data) {
          return {
            data: null,
            success: false,
            message: createUserResult.message || ErrorMessages.UNKNOWN_ERROR,
          };
        }
        user = createUserResult.data;
      }

      let channel = await this.channelRepository.findByPlatformId(
        input.channelId,
      );

      if (!channel) {
        const channelName = input.channelName || "Unknown Channel";
        const channelUrl = input.channelUrl || "";

        const channelData: Omit<ChannelEntity, "id"> = {
          platformId: input.channelId,
          name: channelName,
          url: channelUrl,
          createdAt: new Date(),
        };

        const newChannel = await this.channelRepository.create(channelData);
        if (!newChannel) {
          return {
            data: null,
            success: false,
            message: "Failed to create channel",
          };
        }
        channel = newChannel;
      }

      const existingMessage = await this.messageRepository
        .findByPlatformId(input.platformId)
        .catch(() => null);

      if (existingMessage) {
        return {
          data: existingMessage,
          success: false,
          message: "Message already exists",
        };
      }

      const messageData: Omit<MessageEntity, "id"> = {
        platformId: input.platformId,
        platformCreatedAt: input.platformCreatedAt,
        isDeleted: false,
        channel: channel,
        user: user,
        messageReactions: [],
      };

      const newMessage = await this.messageRepository.create(messageData);

      if (!newMessage) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.UNKNOWN_ERROR,
        };
      }

      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE,
        `Message registered successfully: ${input.platformId}`,
      );

      return {
        data: newMessage,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE,
        `registerMessage.execute | ${error instanceof Error ? error.message : String(error)}`,
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
