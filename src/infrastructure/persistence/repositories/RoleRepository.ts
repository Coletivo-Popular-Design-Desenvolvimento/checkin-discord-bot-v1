import { RoleEntity } from "@domain/entities/Role";
import { IRoleRepository } from "@domain/interfaces/repositories/IRoleRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prismaService";

export class RoleRepository implements IRoleRepository {
  private client: PrismaClient;
  private logger: ILoggerService;

  constructor(
    private prisma: PrismaService,
    logger: ILoggerService,
  ) {
    this.client = this.prisma.getClient();
    this.logger = logger;
  }

  async findById(id: number): Promise<RoleEntity | null> {
    try {
      const result = await this.client.role.findUnique({
        where: { id },
        include: { user_role: { include: { user: true } } },
      });
      return RoleEntity.fromPersistence(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `findByIdRole | ${error.message}`,
      );
    }
  }
  async findByUserPlatformId(id: string): Promise<RoleEntity[] | null> {
    try {
      const result = await this.client.role.findMany({
        where: { user_role: { some: { user: { platform_id: id } } } },
        include: { user_role: { include: { user: true } } },
      });
      return result.map(RoleEntity.fromPersistence);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `UserPlatformId | ${error.message}`,
      );
    }
  }
  async findByPlatformId(id: string): Promise<RoleEntity | null> {
    try {
      const result = await this.client.role.findUnique({
        where: { platform_id: id },
        include: { user_role: { include: { user: true } } },
      });
      return RoleEntity.fromPersistence(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `findByPlataformIdRole | ${error.message}`,
      );
    }
  }
  async listAll(limit?: number): Promise<RoleEntity[]> {
    try {
      const results = await this.client.role.findMany({
        take: limit,
        include: { user_role: { include: { user: true } } },
      });
      return results.map((result) => this.toDomain(result));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `listAll | ${error.message}`,
      );
    }
  }
  async updateById(
    id: number,
    role: Partial<RoleEntity>,
  ): Promise<RoleEntity | null> {
    try {
      const result = await this.client.role.update({
        where: { id },
        data: this.toPersistence(role),
        include: { user_role: { include: { user: true } } },
      });
      return result ? this.toDomain(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `updateById | ${error.message}`,
      );
    }
  }

  async deleteById(id: number): Promise<boolean> {
    try {
      await this.client.role.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `deleteRole | ${error.message}`,
      );
      return false;
    }
  }

  private toDomain(
    role: Prisma.RoleGetPayload<{
      include: { user_role: { include: { user: true } } };
    }>,
  ): RoleEntity {
    return RoleEntity.fromPersistence(role);
  }

  private toPersistence(role: Partial<RoleEntity>) {
    return {
      platform_id: role.platformId,
      name: role.name,
      platform_created_at: role.platformCreatedAt,
      platformCreated_at: role.platformCreatedAt,
      user: role.user,
    };
  }
}
