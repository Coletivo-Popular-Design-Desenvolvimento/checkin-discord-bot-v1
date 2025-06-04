import { PrismaClient, Channel } from "@prisma/client";
import IChannelRepository from "../../../domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import { PrismaService } from "../prisma/prismaService";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../../domain/types/LoggerContextEnum";
import ChannelEntity from "../../../domain/entities/Channel";

export default class ChannelRepository implements IChannelRepository {
  private client: PrismaClient;
  private logger: ILoggerService;

  constructor(
    private prisma: PrismaService,
    logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
    this.logger = logger;
  }
  async listAllAsync(limit?: number): Promise<ChannelEntity[]> {
    try {
      const results = await this.client.channel.findMany({
        take: limit,
      });
      return results.map((c) => this.toDomain(c));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `listAll | ${error.message}`,
      );
      return [];
    }
  }

  async findByIdAsync(id: number): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findFirst({
        where: {
          id: id,
        },
      });
      if (!result) {
        return null;
      }
      return this.toDomain(result);
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

  async findByDiscordIdAsync(discordId: string): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.findFirst({
        where: {
          discord_id: discordId,
        },
      });
      if (!result) {
        return null;
      }
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findByDiscordId | ${error.message}`,
      );
      return null;
    }
  }
  async createAsync(
    channel: Omit<ChannelEntity, "id">,
  ): Promise<ChannelEntity | null> {
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
        `create | ${error.message}`,
      );
      return null;
    }
  }
  async createManyAsync(channels: Omit<ChannelEntity, "id">[]): Promise<number | null> {
    try {
      const dataToCreate = channels.map((c) => this.toPersistence(c));
      const result = await this.client.channel.createMany({
        data: dataToCreate,
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
      return null;
    }
  }

  async updateAsync(
    id: number,
    channel: Partial<ChannelEntity>,
  ): Promise<void> {
    try {
      await this.client.channel.update({
        where: {
          id: id,
        },
        data: this.toPersistence(channel),
      });
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `update | ${error.message}`,
      );
    }
  }

  /**
   * Desabilita o canal do banco de dados
   *
   * @param {number} id O canal a ser desabilitado.
   */
  // async disableChannel(id: number): Promise<void> {
  //     try {
  //         await this.client.$transaction(async (tx) => {
  //             const channel = await tx.channel.findFirst({
  //                 where: {
  //                     id: id
  //                 }
  //             });
  //             if(!channel.active) {
  //                 throw new Error("Canal já desativado");
  //             }
  //             await tx.channel.update({
  //                 where: { id: channel.id },
  //                 data: { active: false }
  //             });
  //         });
  //     } catch (error) {
  //         this.logger.logToConsole(
  //             LoggerContextStatus.ERROR,
  //             LoggerContext.REPOSITORY,
  //             LoggerContextEntity.CHANNEL,
  //             `createMany | ${error.Message}`
  //         );
  //     }
  // }
  async deleteAsync(id: number): Promise<ChannelEntity | null> {
    try {
      const result = await this.client.channel.delete({
        where: {
          id: id,
        },
      });
      return this.toDomain(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `delete | ${error.message}`,
      );
      return null;
    }
  }

  private toDomain(channel: Channel): ChannelEntity {
    return new ChannelEntity(
      channel.id,
      channel.discord_id,
      channel.name,
      channel.url,
      channel.created_at,
    );
  }

  private toPersistence(channel: Partial<ChannelEntity> | Omit<ChannelEntity, "id">) {
    return {
      discord_id: channel.discordId,
      name: channel.name,
      url: channel.url,
      created_at: channel.createAt,
    };
  }
}
