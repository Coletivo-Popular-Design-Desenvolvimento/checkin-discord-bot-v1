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
    id: number,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.findUnique({
        where: { id },
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

  async getMessageReactionByUserPlatformId(
    userPlatformId: string,
  ): Promise<MessageReactionEntity[]> {
    try {
      const results = await this.client.messageReaction.findMany({
        where: { user_id: userPlatformId },
        include: { user: true, message: true, channel: true },
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionByUserPlatformId | ${error.message}`,
      );
      return [];
    }
  }

  async updateMessageReaction(
    id: number,
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
        where: { id },
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

  async deleteMessageReaction(id: number): Promise<boolean> {
    try {
      await this.client.messageReaction.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `deleteMessageReaction | ${error.message}`,
      );
      return false;
    }
  }

  private toDomain(reaction: FullMessageReaction): MessageReactionEntity {
    const user = UserEntity.fromPersistence(reaction.user);
    const message = MessageEntity.fromPersistenceWithRelations({
      ...reaction.message,
      user: reaction.user,
      channel: reaction.channel,
    });
    const channel = ChannelEntity.fromPersistence(reaction.channel);

    return new MessageReactionEntity(reaction.id, user, message, channel);
  }
}
