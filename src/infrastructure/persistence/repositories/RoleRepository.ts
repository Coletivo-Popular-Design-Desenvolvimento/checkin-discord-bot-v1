import { RoleEntity } from "@domain/entities/Role";
import {
  CreateRoleInput,
  IRoleRepository,
} from "@domain/interfaces/repositories/IRoleRepository";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prismaService";
import { PrismaMapper } from "./PrismaMapper";

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
        include: { users: { include: { user: true } } },
      });
      if (!result) {
        return null;
      }
      return PrismaMapper.toRoleEntity(result, result.users);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `findByIdRole | ${error.message}`,
      );
    }
    return null;
  }

  async findByUserPlatformId(id: string): Promise<RoleEntity[] | null> {
    try {
      const result = await this.client.role.findMany({
        where: { users: { some: { user_platform_id: id } } },
        include: { users: { include: { user: true } } },
      });
      return result.map((role) => PrismaMapper.toRoleEntity(role, role.users));
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `findByUserPlatformId | ${error.message}`,
      );
    }
    return null;
  }

  async findByPlatformId(id: string): Promise<RoleEntity | null> {
    try {
      const result = await this.client.role.findUnique({
        where: { platform_id: id },
        include: { users: { include: { user: true } } },
      });
      if (!result) {
        return null;
      }
      return PrismaMapper.toRoleEntity(result, result.users);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `findByPlatformId | ${error.message}`,
      );
    }
    return null;
  }

  async listAll(limit?: number): Promise<RoleEntity[]> {
    try {
      const results = await this.client.role.findMany({
        take: limit,
        include: { users: { include: { user: true } } },
      });
      return results.map((result) =>
        PrismaMapper.toRoleEntity(result, result.users),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `listAll | ${error.message}`,
      );
    }
    return [];
  }

  async updateById(
    id: number,
    role: Partial<RoleEntity>,
  ): Promise<RoleEntity | null> {
    try {
      const result = await this.client.role.update({
        where: { id },
        data: this.toPersistence(role),
      });
      return result ? PrismaMapper.toRoleEntity(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `updateById | ${error.message}`,
      );
    }
    return null;
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
    }
    return false;
  }

  async create(role: CreateRoleInput): Promise<RoleEntity> {
    try {
      const result = await this.client.role.create({
        data: {
          platform_id: role.platformId,
          name: role.name,
          platform_created_at: role.platformCreatedAt,
        },
      });
      return PrismaMapper.toRoleEntity(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `create | ${error.message}`,
      );
      throw error;
    }
  }

  async assignRoleToUser(
    rolePlatformId: string,
    userPlatformId: string,
  ): Promise<boolean> {
    try {
      await this.client.role.update({
        where: { platform_id: rolePlatformId },
        data: {
          users: {
            create: {
              user: {
                connect: {
                  platform_id: userPlatformId,
                },
              },
            },
          },
        },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `assignRoleToUser | ${error.message}`,
      );
    }
    return false;
  }

  async removeRoleFromUser(
    rolePlatformId: string,
    userPlatformId: string,
  ): Promise<boolean> {
    try {
      await this.client.role.update({
        where: { platform_id: rolePlatformId },
        data: {
          users: {
            deleteMany: {
              user_platform_id: userPlatformId,
            },
          },
        },
      });
      return true;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.ROLE,
        `removeRoleFromUser | ${error.message}`,
      );
    }
    return false;
  }

  private toPersistence(role: Partial<RoleEntity>) {
    return {
      platform_id: role.platformId,
      name: role.name,
      platform_created_at: role.platformCreatedAt,
    };
  }
}
