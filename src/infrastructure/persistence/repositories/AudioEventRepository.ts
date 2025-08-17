import { PrismaClient } from "@prisma/client";
import { AudioEventEntity } from "@domain/entities/AudioEvent";
import {
  IAudioEventRepository,
  AudioEventListAllInput,
} from "@domain/interfaces/repositories/IAudioEventRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "../prisma/prismaService";

export class AudioEventRepository implements IAudioEventRepository {
  private client: PrismaClient;

  constructor(
    private prisma: PrismaService,
    private logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
    this.logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.REPOSITORY,
      LoggerContextEntity.AUDIO_EVENT,
      "AudioEventRepository initialized",
    );
  }

  private toPersistence(
    eventData: Partial<Omit<AudioEventEntity, "id" | "createdAt">>,
  ) {
    return {
      platform_id: eventData.platformId,
      channel_id: eventData.channel?.platformId,
      creator_id: eventData.creator?.platformId,
      name: eventData.name,
      status_id: eventData.statusId,
      start_at: eventData.startAt,
      end_at: eventData.endAt,
      user_count: eventData.userCount,
      description: eventData.description,
      image: eventData.image,
    };
  }

  async create(
    eventData: Omit<AudioEventEntity, "id" | "createdAt">,
  ): Promise<AudioEventEntity | null> {
    try {
      const result = await this.client.audioEvent.create({
        data: this.toPersistence(eventData),
        include: { channel: true, creator: true },
      });
      return AudioEventEntity.fromPersistence(result, result.channel, result.creator);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `create | ${error.message}`,
      );
      return null;
    }
  }

  async createMany(
    eventsData: Omit<AudioEventEntity, "id" | "createdAt">[],
  ): Promise<number | null> {
    try {
      const result = await this.client.audioEvent.createMany({
        data: eventsData.map((event) => this.toPersistence(event)),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `createMany | ${error.message}`,
      );
      return null;
    }
  }

  async findById(id: number): Promise<AudioEventEntity | null> {
    try {
      const result = await this.client.audioEvent.findUnique({
        where: { id },
        include: { channel: true, creator: true },
      });
      return result
        ? AudioEventEntity.fromPersistence(result, result.channel, result.creator)
        : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `findById | ${error.message}`,
      );
      return null;
    }
  }

  async listAll(params?: AudioEventListAllInput): Promise<AudioEventEntity[]> {
    try {
      const whereClause: {
        status_id?: string;
        channel_id?: string;
        creator_id?: string;
      } = {};
      if (params?.statusId) whereClause.status_id = params.statusId;
      if (params?.channelId) whereClause.channel_id = params.channelId;
      if (params?.creatorId) whereClause.creator_id = params.creatorId;

      const results = await this.client.audioEvent.findMany({
        take: params?.limit,
        where: whereClause,
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
      return results.map((result) =>
        AudioEventEntity.fromPersistence(result, result.channel, result.creator),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `listAll | ${error.message}`,
      );
      return [];
    }
  }

  async findByChannelId(channelId: string): Promise<AudioEventEntity[]> {
    return this.listAll({ channelId });
  }

  async findByCreatorId(creatorId: string): Promise<AudioEventEntity[]> {
    return this.listAll({ creatorId });
  }

  async findByStatusId(statusId: string): Promise<AudioEventEntity[]> {
    return this.listAll({ statusId });
  }

  async updateById(
    id: number,
    eventData: Partial<Omit<AudioEventEntity, "id" | "createdAt">>,
  ): Promise<AudioEventEntity | null> {
    try {
      const result = await this.client.audioEvent.update({
        where: { id },
        data: this.toPersistence(eventData),
        include: { channel: true, creator: true },
      });
      return AudioEventEntity.fromPersistence(result, result.channel, result.creator);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `updateById | ${error.message}`,
      );
      return null;
    }
  }

  async deleteById(id: number): Promise<boolean> {
    try {
      await this.client.audioEvent.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `deleteById | ${error.message}`,
      );
      return false;
    }
  }
}
