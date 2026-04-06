import { MessageReactionEntity } from "@entities/MessageReaction";
import { ChannelEntity } from "@entities/Channel";
import { IMessageReactionRepository } from "@repositories/IMessageReactionRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { IChannelRepository } from "@repositories/IChannelRepository";
import { IMessageRepository } from "@repositories/IMessageRepository";
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
  RegisterMessageReactionInput,
  IRegisterMessageReaction,
} from "@interfaces/useCases/messageReaction/IRegisterMessageReaction";
import { UserStatus } from "@type/UserStatusEnum";

export class RegisterMessageReaction implements IRegisterMessageReaction {
  constructor(
    private readonly messageReactionRepository: IMessageReactionRepository,
    private readonly userRepository: IUserRepository,
    private readonly channelRepository: IChannelRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly createUser: ICreateUser,
    private readonly logger: ILoggerService,
  ) {}

  async execute(
    input: RegisterMessageReactionInput,
  ): Promise<GenericOutputDto<MessageReactionEntity>> {
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

        const createUserResult = await this.createUser.execute({
          platformId: input.userId,
          username: input.username,
          globalName: input.userGlobalName ?? null,
          bot: input.userBot ?? false,
          status: UserStatus.ACTIVE,
          platformCreatedAt: input.userPlatformCreatedAt,
          joinedAt: input.userJoinedAt ?? null,
          lastActive: undefined,
        });

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
        const channelName = input.channelName ?? "Unknown Channel";
        const channelUrl = input.channelUrl ?? "";

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

      const message = await this.messageRepository
        .findByPlatformId(input.messageId)
        .catch(() => null);

      if (!message) {
        const messageData = {
          platformId: input.messageId,
          platformCreatedAt: input.messagePlatformCreatedAt ?? new Date(),
          isDeleted: false,
          channel,
          user,
          messageReactions: [],
        };

        const newMessage = await this.messageRepository.create(messageData);
        if (!newMessage) {
          return {
            data: null,
            success: false,
            message: "Failed to create message",
          };
        }
      }

      const reactionEmoji = input.reactionEmoji ?? "";
      const existingReaction =
        await this.messageReactionRepository.findByUserMessageAndEmoji(
          input.userId,
          input.messageId,
          reactionEmoji,
        );

      if (existingReaction) {
        this.logger.logToConsole(
          LoggerContextStatus.SUCCESS,
          LoggerContext.USECASE,
          LoggerContextEntity.MESSAGE_REACTION,
          `Reaction registered: user=${input.userId} message=${input.messageId} emoji=${reactionEmoji || "(none)"}`,
        );
        return {
          data: existingReaction,
          success: true,
          message: "Reaction registered",
        };
      }

      const created = await this.messageReactionRepository.create({
        userId: input.userId,
        messageId: input.messageId,
        channelId: input.channelId,
        reactionEmoji: input.reactionEmoji,
        reactedAt: input.reactedAt,
      });

      if (!created) {
        return {
          data: null,
          success: false,
          message: ErrorMessages.UNKNOWN_ERROR,
        };
      }

      this.logger.logToConsole(
        LoggerContextStatus.SUCCESS,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE_REACTION,
        `Reaction registered: user=${input.userId} message=${input.messageId} emoji=${reactionEmoji || "(none)"}`,
      );

      return {
        data: created,
        success: true,
      };
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.MESSAGE_REACTION,
        `registerMessageReaction.execute | ${error instanceof Error ? error.message : String(error)}`,
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
