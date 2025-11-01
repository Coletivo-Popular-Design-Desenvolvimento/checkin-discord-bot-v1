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
   * Cria um novo canal no banco de dados.
   *
   * @param {Omit<ChannelEntity, "id">} channel Os dados do canal a ser criado.
   * @returns {Promise<ChannelEntity>} O canal criado.
   */
  async create(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity> {
    try {
      const result = await this.client.channel.create({
        data: {
          ...this.toPersistence(channel),
          message: {
            connect: channel?.message?.map((message) => ({
              platform_id: message.platformId,
            })),
          },
          message_reaction: {
            connect: channel?.messageReaction?.map((messageReaction) => ({
              id: messageReaction.id,
            })),
          },
          user_channel: channel.user?.length
            ? {
                create: channel.user.map((user) => ({
                  user: { connect: { platform_id: user.platformId } },
                })),
              }
            : undefined,
        },
        include: {
          message: true,
          message_reaction: true,
          user_channel: {
            include: { user: true },
          },
        },
      });

      return ChannelEntity.fromPersistence(
        result,
        result.user_channel?.map((uc) => uc.user) || [],
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
      return null;
    }
  }

  async createMany(channel: Omit<ChannelEntity, "id">[]): Promise<number> {
    let errors = 0;

    await Promise.all(
      channel.map(async (ch) => {
        try {
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
            try {
              await this.client.userChannel.createMany({
                data: ch.user.map((user) => ({
                  user_id: user.platformId,
                  channel_id: createdChannel.platform_id,
                })),
                skipDuplicates: true,
              });
            } catch (userError) {
              this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.REPOSITORY,
                LoggerContextEntity.CHANNEL,
                `createMany userChannel | ${userError.message}`,
              );
            }
          }
          return createdChannel;
        } catch (error) {
          errors++;
          this.logger.logToConsole(
            LoggerContextStatus.ERROR,
            LoggerContext.REPOSITORY,
            LoggerContextEntity.CHANNEL,
            `createMany | ${error.message}`,
          );
          return null;
        }
      }),
    );

    return channel.length - errors;
  }

  /**
   * Retorna um canal pelo id.
   *
   * @param {number} id O id do canal a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O canal encontrado. Se o canal nao existir, retorna null.
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
   * Retorna um canal pelo id do Discord.
   *
   * @param {string} id O id do Discord do canal a ser buscado.
   * @returns {Promise<ChannelEntity | null>} O canal encontrado. Se o canal nao existir, retorna null.
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
   * Retorna uma lista de canais.
   *
   * @param {number} [limit] O limite de canais a serem retornados.
   * @returns {Promise<ChannelEntity[]>} A lista de canais.
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
   * Atualiza um canal pelo id.
   *
   * @param {number} id O id do canal a ser atualizado.
   * @param {ChannelEntity} channel Os dados do canal a ser atualizado.
   * @returns {Promise<ChannelEntity | null>} O canal atualizado. Se o canal nao existir, retorna null.
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
      return ChannelEntity.fromPersistence(result);
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
   * Deleta um canal pelo id.
   *
   * @param {number} id O id do canal a ser deletado.
   * @returns {Promise<boolean>} True se o canal foi deletado, false caso contrario.
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
