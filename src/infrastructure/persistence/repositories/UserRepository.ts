import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "@repositories/IUserRepository";
import { PrismaService } from "../prisma/prismaService";
import { UserEntity } from "@entities/User";
import { UserStatus } from "@type/UserStatusEnum";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@type/LoggerContextEnum";
import { ILoggerService } from "@services/ILogger";

export class UserRepository implements IUserRepository {
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
   * @param {Omit<UserEntity, "id">} user Os dados do usuario a ser criado.
   * @returns {Promise<UserEntity>} O usuario criado.
   */
  async create(user: Omit<UserEntity, "id">): Promise<UserEntity> {
    try {
      const result = await this.client.user.create({
        data: this.toPersistence(user),
      });
      return UserEntity.fromPersistence(result);
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `create | ${error.message}`,
      );
    }
  }

  async createMany(users: Omit<UserEntity, "id">[]): Promise<number> {
    try {
      const result = await this.client.user.createMany({
        data: users.map((user) => this.toPersistence(user)),
        skipDuplicates: true,
      });
      return result.count;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `createMany | ${error.message}`,
      );
    }
  }

  /**
   * Retorna um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser buscado.
   * @returns {Promise<UserEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findById(
    id: number,
    includeInactive?: boolean,
  ): Promise<UserEntity | null> {
    try {
      const result = await this.client.user.findUnique({
        where: {
          id,
          status: {
            in: includeInactive
              ? [UserStatus.ACTIVE, UserStatus.INACTIVE]
              : [UserStatus.ACTIVE],
          },
        },
        include: {
          message: true,
          message_reaction: true,
          user_channel: { include: { channel: true } },
          user_role: { include: { role: true } },
        },
      });

      return result
        ? UserEntity.fromPersistence(
            result,
            result.message,
            result.message_reaction,
            result.user_channel.map((userChannel) => userChannel.channel),
            result.user_role.map((userRole) => userRole.role),
          )
        : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `findById | ${error.message}`,
      );
    }
  }

  /**
   * Retorna um usuario pelo id do Discord.
   *
   * @param {string} id O id do Discord do usuario a ser buscado.
   * @returns {Promise<UserEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findByPlatformId(
    id: string,
    includeInactive?: boolean,
  ): Promise<UserEntity | null> {
    try {
      const result = await this.client.user.findUnique({
        where: {
          platform_id: id,
          status: {
            in: includeInactive
              ? [UserStatus.ACTIVE, UserStatus.INACTIVE]
              : [UserStatus.ACTIVE],
          },
        },
        include: {
          message: true,
          message_reaction: true,
          user_channel: { include: { channel: true } },
          user_role: { include: { role: true } },
        },
      });

      return result
        ? UserEntity.fromPersistence(
            result,
            result.message,
            result.message_reaction,
            result.user_channel.map((userChannel) => userChannel.channel),
            result.user_role.map((userRole) => userRole.role),
          )
        : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `findByPlatformId | ${error.message}`,
      );
    }
  }

  /**
   * Retorna uma lista de usuarios.
   *
   * @param {number} [limit] O limite de usuarios a serem retornados.
   * @returns {Promise<UserEntity[]>} A lista de usuarios.
   */
  async listAll(
    limit?: number,
    includeInactive?: boolean,
  ): Promise<UserEntity[]> {
    try {
      const results = await this.client.user.findMany({
        take: limit,
        where: {
          status: {
            in: includeInactive
              ? [UserStatus.ACTIVE, UserStatus.INACTIVE]
              : [UserStatus.ACTIVE],
          },
        },
        include: {
          message: true,
          message_reaction: true,
          user_channel: { include: { channel: true } },
          user_role: { include: { role: true } },
        },
      });

      return results.map((result) =>
        UserEntity.fromPersistence(
          result,
          result.message,
          result.message_reaction,
          result.user_channel.map((userChannel) => userChannel.channel),
          result.user_role.map((userRole) => userRole.role),
        ),
      );
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `listAll | ${error.message}`,
      );
    }
  }

  /**
   * Atualiza um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser atualizado.
   * @param {UserEntity} user Os dados do usuario a ser atualizado.
   * @returns {Promise<UserEntity | null>} O usuario atualizado. Se o usuario nao existir, retorna null.
   */
  async updateById(
    id: number,
    user: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    try {
      const result = await this.client.user.update({
        where: { id },
        data: this.toPersistence(user),
      });
      return result ? UserEntity.fromPersistence(result) : null;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
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
      const result = await this.client.user.delete({
        where: { id },
      });
      return result ? true : false;
    } catch (error) {
      this.logger.logToConsole(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER,
        `deleteById | ${error.message}`,
      );
    }
  }

  private toPersistence(user: Partial<UserEntity>) {
    return {
      platform_id: user.platformId,
      username: user.username,
      bot: user.bot,
      status: user.status,
      global_name: user.globalName,
      joined_at: user.joinedAt,
      platform_created_at: user.platformCreatedAt,
      update_at: user.updateAt,
      last_active: user.lastActive,
      email: user.email,
    };
  }
}
