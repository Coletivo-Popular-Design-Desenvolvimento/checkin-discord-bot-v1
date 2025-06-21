import { PrismaClient, MessageReaction } from "@prisma/client";
import { PrismaService } from "../prisma/prismaService";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../../domain/types/LoggerContextEnum";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import { IMessageReactionRepository } from "../../../domain/interfaces/repositories/IMessageReactionRepository";
import { MessageReactionEntity } from "../../../domain/entities/MessageReaction";

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
    reaction: MessageReactionEntity,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.create({
        data: this.toPersistence(reaction),
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

  async createMany(reactions: MessageReactionEntity[]): Promise<number> {
    try {
      const result = await this.client.messageReaction.createMany({
        data: reactions.map((reaction) => this.toPersistence(reaction)),
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
          user_id_message_id: {
            user_id: userId,
            message_id: messageId,
          },
        },
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
    try {
      const results = await this.client.messageReaction.findMany({
        where: { user_id: userId },
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionByUserDiscordId | ${error.message}`,
      );
      return [];
    }
  }

  async getMessageReactionByDiscordId(
    userId: string,
    messageId: string,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.findUnique({
        where: {
          user_id_message_id: {
            user_id: userId,
            message_id: messageId,
          },
        },
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE_REACTION,
        `getMessageReactionByDiscordId | ${error.message}`,
      );
      return null;
    }
  }

  async updateMessageReaction(
    userId: string,
    messageId: string,
    data: Partial<MessageReactionEntity>,
  ): Promise<MessageReactionEntity | null> {
    try {
      const result = await this.client.messageReaction.update({
        where: {
          user_id_message_id: {
            user_id: userId,
            message_id: messageId,
          },
        },
        data: this.toPersistence(data),
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
          user_id_message_id: {
            user_id: userId,
            message_id: messageId,
          },
        },
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

  private toDomain(reaction: MessageReaction): MessageReactionEntity {
    return new MessageReactionEntity(
      reaction.user_id,
      reaction.message_id,
      reaction.channel_id,
    );
  }

  private toPersistence(reaction: Partial<MessageReactionEntity>) {
    return {
      user_id: reaction.userId,
      message_id: reaction.messageId,
      channel_id: reaction.channelId,
    };
  }
}
