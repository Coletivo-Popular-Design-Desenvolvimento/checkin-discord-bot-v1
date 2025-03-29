import { PrismaClient, user } from "@prisma/client";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUserRepository";
import { PrismaService } from "../prisma/prismaService";
import { UserEntity } from "../../../domain/entities/User";
import { UserStatus } from "../../../domain/types/UserStatusEnum";

class UserRepository implements IUserRepository {
  private client: PrismaClient;

  constructor(private prisma: PrismaService) {
    this.client = this.prisma.getClient();
  }

  /**
   * Cria um novo usuario no banco de dados.
   *
   * @param {Omit<UserEntity, "id">} user Os dados do usuario a ser criado.
   * @returns {Promise<UserEntity>} O usuario criado.
   */
  async create(user: Omit<UserEntity, "id">): Promise<UserEntity> {
    const result = await this.client.user.create({
      data: this.toPersistence(user),
    });
    return this.toDomain(result);
  }

  /**
   * Retorna um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser buscado.
   * @returns {Promise<UserEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findById(id: number): Promise<UserEntity | null> {
    const result = await this.client.user.findUnique({
      where: { id, status: UserStatus.ACTIVE },
    });
    return result ? this.toDomain(result) : null;
  }

  /**
   * Retorna um usuario pelo id do Discord.
   *
   * @param {string} id O id do Discord do usuario a ser buscado.
   * @returns {Promise<UserEntity | null>} O usuario encontrado. Se o usuario nao existir, retorna null.
   */
  async findByDiscordId(id: string): Promise<UserEntity | null> {
    const result = await this.client.user.findUnique({
      where: { discord_id: id, status: UserStatus.ACTIVE },
    });
    return result ? this.toDomain(result) : null;
  }

  /**
   * Retorna uma lista de usuarios.
   *
   * @param {number} [limit] O limite de usuarios a serem retornados.
   * @returns {Promise<UserEntity[]>} A lista de usuarios.
   */
  async listAll(limit?: number): Promise<UserEntity[]> {
    const results = await this.client.user.findMany({
      take: limit,
      where: { status: UserStatus.ACTIVE },
    });
    return results.map((result) => this.toDomain(result));
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
    user: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    const result = await this.client.user.update({
      where: { id },
      data: this.toPersistence(user),
    });
    return result ? this.toDomain(result) : null;
  }

  /**
   * Deleta um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser deletado.
   * @returns {Promise<boolean>} True se o usuario foi deletado, false caso contrario.
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.client.user.delete({
      where: { id },
    });
    return result ? true : false;
  }

  private toDomain(user: user): UserEntity {
    return new UserEntity(
      user.id,
      user.discord_id,
      user.username,
      user.bot,
      user.status,
      user.global_name,
      user.joined_at,
      user.created_at,
      user.update_at,
      user.last_active,
      user.email
    );
  }

  private toPersistence(user: Partial<UserEntity>) {
    return {
      discord_id: user.discordId,
      username: user.username,
      bot: user.bot,
      status: user.status,
      global_name: user.globalName,
      joined_at: user.joinedAt,
      created_at: user.createdAt,
      update_at: user.updateAt,
      last_active: user.lastActive,
      email: user.email,
    };
  }
}

export default UserRepository;
