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

  constructor(private prisma: PrismaService, logger: ILoggerService) {
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
        data: this.toPersistence(channel),
      });
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`
      );
    }
  }

  async createMany(channel: Omit<ChannelEntity, "id">[]): Promise<number> {
    try {
      const result = await this.client.channel.createMany({
        data: channel.map((channel) => this.toPersistence(channel)),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `createMany | ${error.message}`
      );
    }
  }

  /**
   * Retorna um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findById(
    id: number,
    includeInactive?: boolean
  ): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findUnique({
        where: {
          id,
        },
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findById | ${error.message}`
      );
    }
  }

  /**
   * Retorna um usuario pelo id do Discord.
   *
   * @param {string} id O id do Discord do usuario a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findByDiscordId(
    id: string,
    includeInactive?: boolean
  ): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findFirst({
        where: {
          discord_id: id,
        },
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findByDiscordId | ${error.message}`
      );
    }
  }

  /**
   * Retorna uma lista de usuarios.
   *
   * @param {number} [limit] O limite de usuarios a serem retornados.
   * @returns {Promise<ChannelEntity[]>} A lista de usuarios.
   */
  async listAll(
    limit?: number,
    includeInactive?: boolean
  ): Promise<ChannelEntity[]> {
    try {
      const results = await this.client.channel.findMany({
        take: limit,
        where: {},
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`
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
    channel: Partial<ChannelEntity>
  ): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.update({
        where: { id },
        data: this.toPersistence(channel),
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `updateById | ${error.message}`
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
        `deleteById | ${error.message}`
      );
    }
  }
  private toDomain(channel: Channel): ChannelEntity {
    return new ChannelEntity(
      channel.id,
      channel.discord_id,
      channel.name,
      channel.url,
      channel.created_at
    );
  }

  private toPersistence(channel: Partial<ChannelEntity>) {
    return {
      discord_id: channel.discordId,
      name: channel.name,
      url: channel.url,
      created_at: channel.createdAt
    };
  }
}
