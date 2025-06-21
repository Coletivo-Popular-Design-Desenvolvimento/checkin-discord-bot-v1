import {
  PrismaClient,
  MessageReaction,
  User,
  Message,
  Channel,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prismaService";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../../domain/types/LoggerContextEnum";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import {
  IMessageReactionRepository,
  UpdateMessageReactionData,
} from "../../../domain/interfaces/repositories/IMessageReactionRepository";
import { MessageReactionEntity } from "../../../domain/entities/MessageReaction";
import { UserEntity } from "../../../domain/entities/User";
import { MessageEntity } from "../../../domain/entities/Message";
import { ChannelEntity } from "../../../domain/entities/Channel";
import { CreateMessageReactionData } from "@domain/dtos/CreateMessageReactionData";

type FullMessageReaction = MessageReaction & {
  user: User;
  message: Message;
  channel: Channel;
};

export class MessageReactionRepository implements IMessageReactionRepository {
  private client: PrismaClient;
  private logger: ILoggerService;

  constructor(
    private prisma: PrismaService,
    logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
    this.logger = logger;
  }

  async create(
    data: CreateMessageReactionData,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.create({
        data: {
          user: { connect: { platform_id: data.userId } },
          message: { connect: { platform_id: data.messageId } },
          channel: { connect: { platform_id: data.channelId } },
        },
        include: { user: true, message: true, channel: true },
      });
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `create | ${error.message}`,
      );
      return null;
    }
  }

  async createMany(data: CreateMessageReactionData[]): Promise<number> {
    try {
      const result = await this.client.messageReaction.createMany({
        data: data.map((d) => ({
          user_id: d.userId,
          message_id: d.messageId,
          channel_id: d.channelId,
        })),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `createMany | ${error.message}`,
      );
      return 0;
    }
  }

  async getMessageReactionById(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.findUnique({
        where: {
          user_id_message_id: { user_id: userId, message_id: messageId },
        },
        include: { user: true, message: true, channel: true },
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionById | ${error.message}`,
      );
      return null;
    }
  }

  async getMessageReactionByUserId(
    userId: string,
  ): Promise<MessageReactionEntity[]> {
    try {
      const results = await this.client.messageReaction.findMany({
        where: { user_id: userId },
        include: { user: true, message: true, channel: true },
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionByUserId | ${error.message}`,
      );
      return [];
    }
  }

  async getMessageReactionByUserDiscordId(
    userId: string,
  ): Promise<MessageReactionEntity[]> {
    return this.getMessageReactionByUserId(userId);
  }

  async getMessageReactionByDiscordId(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null> {
    return this.getMessageReactionById(userId, messageId);
  }

  async updateMessageReaction(
    userId: string,
    messageId: string,
    data: UpdateMessageReactionData,
  ): Promise<MessageReactionEntity | null> {
    try {
      const persistenceData: Prisma.MessageReactionUpdateInput = {};
      if (data.userId)
        persistenceData.user = { connect: { platform_id: data.userId } };
      if (data.messageId)
        persistenceData.message = { connect: { platform_id: data.messageId } };
      if (data.channelId)
        persistenceData.channel = { connect: { platform_id: data.channelId } };

      const result = await this.client.messageReaction.update({
        where: {
          user_id_message_id: { user_id: userId, message_id: messageId },
        },
        data: persistenceData,
        include: { user: true, message: true, channel: true },
      });
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `updateMessageReaction | ${error.message}`,
      );
      return null;
    }
  }

  async deleteMessageReaction(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.delete({
        where: {
          user_id_message_id: { user_id: userId, message_id: messageId },
        },
        include: { user: true, message: true, channel: true },
      });
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `deleteMessageReaction | ${error.message}`,
      );
      return null;
    }
  }

  private toDomain(reaction: FullMessageReaction): MessageReactionEntity {
    const user = new UserEntity(
      reaction.user.id,
      reaction.user.platform_id,
      reaction.user.username,
      reaction.user.bot,
      reaction.user.status,
      reaction.user.global_name,
      reaction.user.joined_at,
      reaction.user.platform_created_at,
      reaction.user.create_at,
      reaction.user.update_at,
      reaction.user.last_active,
      reaction.user.email,
    );

    const message = new MessageEntity(
      reaction.message.channel_id,
      reaction.message.platform_id,
      reaction.message.platform_created_at,
      reaction.message.is_deleted,
      reaction.message.user_id,
      reaction.message.id,
      reaction.message.created_at,
    );

    const channel = new ChannelEntity(
      reaction.channel.id,
      reaction.channel.platform_id,
      reaction.channel.name,
      reaction.channel.url,
      reaction.channel.created_at,
    );

    return new MessageReactionEntity(reaction.id, user, message, channel);
  }
}
