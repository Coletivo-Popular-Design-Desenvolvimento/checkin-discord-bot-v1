import {
  PrismaClient,
  Message,
  User,
  Channel,
  MessageReaction,
} from "@prisma/client";
import { MessageEntity } from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/interfaces/repositories/IMessageRepository";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../../domain/types/LoggerContextEnum";
import { PrismaService } from "../prisma/prismaService";
import { MessageRepositoryListAllInput } from "../../../domain/types/MessageListAllInput";

export class MessageRepository implements IMessageRepository {
  private client: PrismaClient;
  private logger: ILoggerService;

  constructor(
    private prisma: PrismaService,
    logger: ILoggerService,
  ) {
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
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });
      return this.toDomainWithRelations(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `create | ${error.message}`,
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
      });

      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `createMany | ${error.message}`,
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
        `deleteById | ${error.message}`,
      );
    }
  }

  /**
   * @description Método para buscar uma mensagem a partir do seu Id
   * @param {Number} id Id da mensagem na nossa base de dados
   * @returns {MessageEntity} Caso exista na base, uma mensagem. Senão, retorna nulo
   */
  async findById(id: number): Promise<MessageEntity | null> {
    try {
      const result = await this.client.message.findUnique({
        where: {
          id,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });

      return result ? this.toDomainWithRelations(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findById | ${error.message}`,
      );
    }
  }

  /**
   * @description Método para buscar mensagens de um canal
   * @param {Boolean} includeDeleted Caso queira listar inclusive as mensagens apagadas. Por padrão, elas não serão listadas
   * @param {String} channelId Id do canal
   * @returns {MessageEntity[]} Lista de mensagens
   */
  async findByChannelId(
    channelId: string,
    includeDeleted?: boolean,
  ): Promise<MessageEntity[]> {
    try {
      const messages = await this.client.message.findMany({
        where: {
          channel_id: channelId,
          is_deleted: includeDeleted ? undefined : false,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });

      return messages.map((message) => this.toDomainWithRelations(message));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findByChannelId | ${error.message}`,
      );
    }
  }

  /**
   * @description Método para buscar uma mensagem pelo seu identificador do Discord
   * @param {String} platformId Id que o Discord usa para identificar a mensagem
   * @returns {MessageEntity} Lista de mensagens
   */
  async findByPlatformId(platformId: string): Promise<MessageEntity | null> {
    try {
      const message = await this.client.message.findFirst({
        where: {
          platform_id: platformId,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });

      return message ? this.toDomainWithRelations(message) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findByPlatformId | ${error.message}`,
      );
    }
  }

  /**
   * @description Método para buscar mensagens de um usuário
   * @param {Boolean} includeDeleted Caso queira incluir as mensagens apagadas. Por padrão, elas não serão listadas
   * @param {String} userId Id do usuário
   * @returns {MessageEntity[]} Lista de mensagens
   */
  async findByUserId(
    userId: string,
    includeDeleted?: boolean,
  ): Promise<MessageEntity[]> {
    try {
      const results = await this.client.message.findMany({
        where: {
          user_id: userId,
          is_deleted: includeDeleted ? undefined : false,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });
      return results.map((result) => this.toDomainWithRelations(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `findById | ${error.message}`,
      );
    }
  }

  /**
   * @description Método para listar múltiplas mensagens
   * @param {Boolean} params.includeDeleted Caso queira listar inclusive as mensagens apagadas. Por padrão, elas não serão listadas
   * @param {Number} params.limit Quantidade de registros a serem retornados pela base de dados
   * @returns {MessageEntity[]} Lista de mensagens
   */
  async listAll(
    params?: MessageRepositoryListAllInput,
  ): Promise<MessageEntity[]> {
    try {
      let limit, includeDeleted;
      if (params) {
        limit = params?.limit;
        includeDeleted = Boolean(params.includeDeleted);
      }

      const results = await this.client.message.findMany({
        take: limit,
        where: {
          is_deleted: includeDeleted ? undefined : false,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });
      return results.map((result) => this.toDomainWithRelations(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `listAll | ${error.message}`,
      );
    }
  }
  async updateById(
    id: number,
    message: Partial<MessageEntity>,
  ): Promise<MessageEntity | null> {
    try {
      const result = await this.client.message.update({
        data: this.toPersistence(message),
        where: {
          id,
        },
        include: {
          user: true,
          channel: true,
          message_reaction: true,
        },
      });

      return result ? this.toDomainWithRelations(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.MESSAGE,
        `updateById | ${error.message}`,
      );
    }
  }

  private toDomain(message: Message): MessageEntity {
    // Usando o método fromPersistence para compatibilidade temporária
    // Será atualizado para usar fromPersistenceWithRelations
    return MessageEntity.fromPersistence(message);
  }

  private toDomainWithRelations(
    message: Message & {
      user: User;
      channel: Channel;
      message_reaction?: MessageReaction[];
    },
  ): MessageEntity {
    // Usando o novo método com relacionamentos completos
    return MessageEntity.fromPersistenceWithRelations(message);
  }

  private toPersistence(message: Partial<MessageEntity>) {
    return {
      platform_id: message.platformId,
      channel_id: message.channelId, // Usa getter para compatibilidade
      is_deleted: message.isDeleted,
      user_id: message.userId, // Usa getter para compatibilidade
      platform_created_at: message.platformCreatedAt,
      created_at: message.createdAt,
    };
  }
}
