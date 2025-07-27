import { PrismaClient, Channel } from "@prisma/client";
import { PrismaService } from "../prisma/prismaService";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../../domain/types/LoggerContextEnum";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import { IChannelRepository } from "../../../domain/interfaces/repositories/IChannelRepository";
import { ChannelEntity } from "../../../domain/entities/Channel";

export class ChannelRepository implements IChannelRepository {
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
   * Cria um novo usuario no banco de dados.
   *
   * @param {Omit<ChannelEntity, "id">} channel Os dados do usuario a ser criado.
   * @returns {Promise<ChannelEntity>} O usuario criado.
   */
  async create(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity> {
    try {
      const result = await this.client.channel.create({
        data: {
          ...this.toPersistence(channel),
          user: {
            connect: channel.user.map((user) => ({
              platform_id: user.platformId,
            })),
          },
          message: {
            connect: channel.message.map((message) => ({
              platform_id: message.platformId,
            })),
          },
          message_reaction: {
            connect: channel.messageReaction.map((messageReaction) => ({
              id: messageReaction.id,
            })),
          },
        },
        include: { user: true, message: true, message_reaction: true },
      });

      return ChannelEntity.fromPersistence(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`,
      );
    }
  }

  async createMany(channel: Omit<ChannelEntity, "id">[]): Promise<number> {
    try {
      const result = await this.client.channel.createMany({
        data: channel.map((channel) => ({
          ...this.toPersistence(channel),
          user: {
            connect: channel.user.map((user) => ({
              platform_id: user.platformId,
            })),
          },
          message: {
            connect: channel.message.map((message) => ({
              platform_id: message.platformId,
            })),
          },
          message_reaction: {
            connect: channel.messageReaction.map((messageReaction) => ({
              id: messageReaction.id,
            })),
          },
        })),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `createMany | ${error.message}`,
      );
    }
  }

  /**
   * Retorna um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findById(id: number): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findUnique({
        where: {
          id,
        },
        include: { user: true, message: true, message_reaction: true },
      });
      return result ? ChannelEntity.fromPersistence(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findById | ${error.message}`,
      );
    }
  }

  /**
   * Retorna um usuario pelo id do Discord.
   *
   * @param {string} id O id do Discord do usuario a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findByPlatformId(id: string): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findFirst({
        where: {
          platform_id: id,
        },
        include: { user: true, message: true, message_reaction: true },
      });
      return result ? ChannelEntity.fromPersistence(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findByPlatformId | ${error.message}`,
      );
    }
  }

  /**
   * Retorna uma lista de usuarios.
   *
   * @param {number} [limit] O limite de usuarios a serem retornados.
   * @returns {Promise<ChannelEntity[]>} A lista de usuarios.
   */
  async listAll(limit?: number): Promise<ChannelEntity[]> {
    try {
      const results = await this.client.channel.findMany({
        take: limit,
        where: {},
        include: { user: true, message: true, message_reaction: true },
      });
      return results.map((result) => ChannelEntity.fromPersistence(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`,
      );
    }
  }

  /**
   * Atualiza um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser atualizado.
   * @param {ChannelEntity} channel Os dados do usuario a ser atualizado.
   * @returns {Promise<ChannelEntity | null>} O usuario atualizado. Se o usuario nao existir, retorna null.
   */
  async updateById(
    id: number,
    channel: Partial<ChannelEntity>,
  ): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.update({
        where: { id },
        data: this.toPersistence(channel),
      });
      return result ? ChannelEntity.fromPersistence(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `updateById | ${error.message}`,
      );
    }
  }

  /**
   * Deleta um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser deletado.
   * @returns {Promise<boolean>} True se o usuario foi deletado, false caso contrario.
   */
  async deleteById(id: number): Promise<boolean> {
    try {
      const result = await this.client.channel.delete({
        where: { id },
      });
      return result ? true : false;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `deleteById | ${error.message}`,
      );
    }
  }

  // toDomain = fromPersistence :O

  private toPersistence(channel: Partial<ChannelEntity>) {
    return {
      platform_id: channel.platformId,
      name: channel.name,
      url: channel.url,
      created_at: channel.createdAt,
    };
  }
}
