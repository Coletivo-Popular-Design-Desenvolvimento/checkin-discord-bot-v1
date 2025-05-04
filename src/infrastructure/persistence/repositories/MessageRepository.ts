import { PrismaClient } from "@prisma/client";
import { Message } from "discord.js";
import { MessageEntity } from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../../domain/types/LoggerContextEnum";
import { PrismaService } from "../prisma/prismaService";

export class MessageRepository implements IMessageRepository {
  private client: PrismaClient;
  private logger: ILoggerService;

  constructor(private prisma: PrismaService, logger: ILoggerService) {
    this.client = this.prisma.getClient();
    this.logger = logger;
  }

  async create(message: Omit<MessageEntity, "id">): Promise<MessageEntity> {
    try {
        const result = await this.client.message.create({
          data: this.toPersistence(message),
        });
        return this.toDomain(result);
      } catch (error) {
        this.logger.logToConsole(
          LoggerContextStatus.ERROR,
          LoggerContext.REPOSITORY,
          LoggerContextEntity.USER,
          `create | ${error.message}`
        );
    }
  }
  createMany(messages: Omit<MessageEntity, "id">[]): Promise<number> {
    throw new Error("Method not implemented.");
  }
  findById(id: number): Promise<MessageEntity | null> {
    throw new Error("Method not implemented.");
  }
  findByDiscordId(id: string): Promise<MessageEntity | null> {
    throw new Error("Method not implemented.");
  }
  listAll(limit?: number): Promise<MessageEntity[]> {
    throw new Error("Method not implemented.");
  }
  updateById(id: number, message: Partial<MessageEntity>): Promise<MessageEntity | null> {
    throw new Error("Method not implemented.");
  }
  deleteById(id: number): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  
private toDomain(message: Message): MessageEntity {
    return new MessageEntity(
      message.channelId,
      message.id,
      message.createdAt,
      message.author.id,
    );
  } 


  private toPersistence(message: Partial<MessageEntity>) {
      return {
        discord_id: message.discordId,
        channel_id: message.channelId,
        user_id: message.userId,
        discord_created_at: message.discordCreatedAt,
        created_at: message.createAt,
      };
    }
}