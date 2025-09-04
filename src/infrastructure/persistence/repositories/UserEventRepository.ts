import { EventType, PrismaClient } from "@prisma/client";
import { UserEventEntity } from "@domain/entities/UserEvent";
import {
  IUserEventRepository,
  UserEventListAllInput,
} from "@domain/interfaces/repositories/IUserEventRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "../prisma/prismaService";

export class UserEventRepository implements IUserEventRepository {
  private client: PrismaClient;

  constructor(
    private prisma: PrismaService,
    private logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
    this.logger.logToConsole(
      LoggerContextStatus.SUCCESS,
      LoggerContext.REPOSITORY,
      LoggerContextEntity.USER_EVENT,
      "UserEventRepository initialized",
    );
  }

  private toPersistence(eventData: Omit<UserEventEntity, "id">) {
    return {
      event_type: eventData.eventType,
      created_at: eventData.createdAt,
      user_id: eventData.user.platformId,
      event_id: eventData.event.platformId,
    };
  }

  async create(
    eventData: Omit<UserEventEntity, "id">,
  ): Promise<UserEventEntity | null> {
    try {
      const result = await this.client.userEvent.create({
        data: this.toPersistence(eventData),
        include: { user: true, event: true },
      });
      return UserEventEntity.fromPersistence(result, result.user, result.event);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        `create | ${error.message}`,
      );
      return null;
    }
  }

  async createMany(
    eventsData: Omit<UserEventEntity, "id">[],
  ): Promise<number | null> {
    try {
      const result = await this.client.userEvent.createMany({
        data: eventsData.map((event) => this.toPersistence(event)),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        `createMany | ${error.message}`,
      );
      return null;
    }
  }

  async findById(id: number): Promise<UserEventEntity | null> {
    try {
      const result = await this.client.userEvent.findUnique({
        where: { id },
        include: { user: true, event: true },
      });
      return result
        ? UserEventEntity.fromPersistence(result, result.user, result.event)
        : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        `findById | ${error.message}`,
      );
      return null;
    }
  }

  async listAll(params?: UserEventListAllInput): Promise<UserEventEntity[]> {
    try {
      const whereClause: {
        event_type?: EventType;
        event_id?: string;
        user_id?: string;
      } = {};
      if (params?.eventType) whereClause.event_type = params.eventType;
      if (params?.eventId) whereClause.event_id = params.eventId;
      if (params?.userId) whereClause.user_id = params.userId;

      const results = await this.client.userEvent.findMany({
        take: params?.limit,
        where: whereClause,
        orderBy: { created_at: "desc" },
        include: { user: true, event: true },
      });
      return results.map((result) =>
        UserEventEntity.fromPersistence(result, result.user, result.event),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        `listAll | ${error.message}`,
      );
      return [];
    }
  }

  async findByEventId(eventId: string): Promise<UserEventEntity[]> {
    return this.listAll({ eventId });
  }

  async findByUserId(userId: string): Promise<UserEventEntity[]> {
    return this.listAll({ userId });
  }

  async findByEventType(eventType: EventType): Promise<UserEventEntity[]> {
    return this.listAll({ eventType });
  }

  async deleteById(id: number): Promise<boolean> {
    try {
      await this.client.userEvent.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        `deleteById | ${error.message}`,
      );
      return false;
    }
  }
}
