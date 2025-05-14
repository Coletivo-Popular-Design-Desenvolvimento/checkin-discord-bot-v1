import { PrismaClient, Message } from "@prisma/client";
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

  /**
   * @description Insere uma entidade Mensagem no banco de dados
   * @param {MessageEntity} message Messagem a ser cadastrada 
   * @returns {MessageEntity} Mensagem cadastrada na base de dados, com o id do banco
   */
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
        LoggerContextEntity.MESSAGE,
        `create | ${error.message}`
      );
    }
  }

  /**
   * @description Registrar no banco de dados um lote de mensagens 
   * @param {MessageEntity[]} messages Lista de mensagens a serem criadas 
   * @returns {Number} Quantas mensagens foram armazenadas no banco 
   */
  async createMany(messages: Omit<MessageEntity, "id">[]): Promise<number> {
    try {
      const result = await this.client.message.createMany({
        data: messages.map((message) => this.toPersistence(message)),
        skipDuplicates: true,
      })

      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `createMany | ${error.message}`
      );
    }
  }

  /**
   * @description Método para deletar uma Mensagem da base de dados
   * @param {Number} id Identificador da mensagem 
   * @returns {Boolean} Booleano para indicar sucesso (true) ou falha (false) na deleção
   */
  async deleteById(id: number): Promise<boolean> {
    try {
      const result = await this.client.message.delete({
        where: { id },
      });
      return result ? true : false;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `deleteById | ${error.message}`
      );
    }
  }

  async findById(id: number): Promise<MessageEntity | null> {
    try {
      const result = await this.client.message.findUnique({
        where: {
          id
        }
      });

      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findById | ${error.message}`
      );
    }
  }

  async findByChannelId(channelId: number): Promise<MessageEntity[] | null> {
    try {
      const messages = await this.client.message.findMany({
        where: {
          channel_id: channelId
        }
      });

      return messages.map((message) => this.toDomain(message));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findByChannelId | ${error.message}`
      );
    }
  }

  async findByDiscordId(discordId: string): Promise<MessageEntity[] | null> {
    try {
      const results = await this.client.message.findMany({
        where: {
          discord_id: discordId
        }
      });

      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findByDiscordId | ${error.message}`
      );
    }
  }

   async findByUserId(userId: number): Promise<MessageEntity[] | null> {
    try {
      const results = await this.client.message.findMany({
        where: {
          user_id: userId
        },
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findById | ${error.message}`
      );
    }
  }

  async listAll(limit?: number): Promise<MessageEntity[]> {
    try {
      const results = await this.client.message.findMany({
        take: limit,
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `listAll | ${error.message}`
      );
    }
  }
  async updateById(id: number, message: Partial<MessageEntity>): Promise<MessageEntity | null> {
    try {
      const result = await this.client.message.update({
        data: this.toPersistence(message),
        where: {
          id
        }
      });

      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `updateById | ${error.message}`
      );
    }
  }

  
  private toDomain(message: Message): MessageEntity {
    return new MessageEntity(
      message.channel_id,
      message.discord_id,
      message.discord_created_at,
      message.user_id,
      message.id,
      message.created_at
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