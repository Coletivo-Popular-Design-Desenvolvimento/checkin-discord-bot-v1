import { PrismaClient, Channel } from "@prisma/client";
import { IChannelRepository } from "../../../domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../../../domain/interfaces/services/ILogger";
import { PrismaService } from "../prisma/prismaService";
import { LoggerContext, LoggerContextEntity, LoggerContextStatus } from "../../../domain/types/LoggerContextEnum";
import ChannelEntity from "../../../domain/entities/Channel";

export default class ChannelRepository implements IChannelRepository {
    private client: PrismaClient;
    private logger: ILoggerService;

    constructor(private prisma: PrismaService, logger: ILoggerService) {
        this.client = this.prisma.getClient();
        this.logger = logger;
    }

    async listAllAsync(limit?: number): Promise<ChannelEntity[]> {
        try {
            const results = await this.client.channel.findMany({
                take: limit
            });
            return results.map((c) => this.mapToEntity(c));
        } catch (error) {
            this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.REPOSITORY,
                LoggerContextEntity.CHANNEL,
                `listAll | ${error.Message}`
            );
        }
    }

    async findByIdAsync(id: number): Promise<ChannelEntity> {
        try {
            const result = await this.client.channel.findFirst({
                where: {
                    id: id
                }
            });
            return this.mapToEntity(result);
        } catch (error) {
            this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.REPOSITORY,
                LoggerContextEntity.CHANNEL,
                `findById | ${error.Message}`
            );
        }
    }

    async findByNameAsync(name: string): Promise<ChannelEntity> {
        try {
            const result = await this.client.channel.findFirst({
                where: {
                    name: name
                }
            });
            return this.mapToEntity(result);
        } catch (error) {
            this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.REPOSITORY,
                LoggerContextEntity.CHANNEL,
                `findByName | ${error.Message}`
            );
        }
    }

    /**
    * Cria um novo canal no banco de dados.
    *
    * @param {Omit<ChannelEntity, "id">} channel Os dados do canal a ser criado.
    * @returns {Promise<ChannelEntity>} O canal criado.
    */
    async createAsync(channel: Omit<ChannelEntity, "id">): Promise<ChannelEntity> {
        try {
            const result = await this.client.channel.create({
                data: {
                    discord_id: channel.discordId,
                    name: channel.name,
                    url: channel.url,
                    created_at: channel.createAt
                }
            });
            return this.mapToEntity(result);
        } catch (error) {
            this.logger.logToConsole(
                LoggerContextStatus.ERROR,
                LoggerContext.REPOSITORY,
                LoggerContextEntity.CHANNEL,
                `create | ${error.Message}`
            );
        }
    }

    private mapToEntity(channel: Channel): ChannelEntity {
        return new ChannelEntity(
            channel.id,
            channel.discord_id,
            channel.name,
            channel.url,
            channel.created_at);
    }
}