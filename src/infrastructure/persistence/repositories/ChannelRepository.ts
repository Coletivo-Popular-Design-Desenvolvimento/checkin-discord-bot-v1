import { PrismaClient } from "@prisma/client";
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
        include: { message: true, message_reaction: true },
      });

      if (channel.user?.length) {
        await Promise.all(
          channel.user.map((user) =>
            this.client.userChannel.create({
              data: {
                user: { connect: { platform_id: user.platformId } },
                channel: { connect: { id: result.id } },
              },
            }),
          ),
        );
      }

      return ChannelEntity.fromPersistence(
        result,
        [],
        result.message,
        result.message_reaction,
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`,
      );
      throw error;
    }
  }

  async createMany(channel: Omit<ChannelEntity, "id">[]): Promise<number> {
    try {
      // createMany do Prisma não suporta inclusão de relacionamentos, por isso as associações precisam ser gerenciadas manualmente.

      const creations = await Promise.all(
        channel.map(async (ch) => {
          const createdChannel = await this.client.channel.create({
            data: {
              ...this.toPersistence(ch),
              message: {
                connect: ch.message.map((message) => ({
                  platform_id: message.platformId,
                })),
              },
              message_reaction: {
                connect: ch.messageReaction.map((reaction) => ({
                  id: reaction.id,
                })),
              },
            },
          });

          if (ch.user.length > 0) {
            await this.client.userChannel.createMany({
              data: ch.user.map((user) => ({
                user_id: user.platformId,
                channel_id: createdChannel.platform_id,
              })),
              skipDuplicates: true,
            });
          }
          return createdChannel;
        }),
      );

      return creations.length;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `createMany | ${error.message}`,
      );
      return 0;
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
        include: {
          user_channel: {
            include: { user: true },
          },
          message: true,
          message_reaction: true,
        },
      });

      if (!result) return null;

      return ChannelEntity.fromPersistence(
        result,
        result.user_channel.map((uc) => uc.user),
        result.message,
        result.message_reaction,
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findById | ${error.message}`,
      );
      return null;
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
        include: {
          user_channel: { include: { user: true } },
          message: true,
          message_reaction: true,
        },
      });

      if (!result) return null;

      return ChannelEntity.fromPersistence(
        result,
        result.user_channel.map((uc) => uc.user),
        result.message,
        result.message_reaction,
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findByPlatformId | ${error.message}`,
      );
      return null;
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
        include: {
          user_channel: { include: { user: true } },
          message: true,
          message_reaction: true,
        },
      });

      return results.map((result) =>
        ChannelEntity.fromPersistence(
          result,
          result.user_channel.map((uc) => uc.user),
          result.message,
          result.message_reaction,
        ),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${error.message}`,
      );
      return [];
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

  private toPersistence(channel: Partial<ChannelEntity>) {
    return {
      platform_id: channel.platformId,
      name: channel.name,
      url: channel.url,
      created_at: channel.createdAt,
    };
  }
}
