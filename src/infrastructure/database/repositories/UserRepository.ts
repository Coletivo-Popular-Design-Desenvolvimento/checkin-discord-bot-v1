import { Prisma, PrismaClient, user } from "@prisma/client";
import { Service } from "typedi";

export interface IUserRepository {
  createUser(user: user): Promise<user>;
  getUserById(id: number): Promise<user | null>;
  getUserByDiscordId(id: string): Promise<user | null>;
  getAllUsers(): Promise<user[]>;
  updateUser(id: number, user: user): Promise<user>;
  updateUserByDiscord(discordId: string, user: user): Promise<user>;
  deleteUserById(id: number): Promise<user>;
  deleteUserByDiscordId(id: string): Promise<user>;
}

@Service()
class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo usuario no banco de dados.
   *
   * @param {Prisma.userCreateInput} user Os dados do usuario a ser criado.
   * @returns {Promise<user>} O usuario criado.
   */
  async createUser(user: Prisma.userCreateInput): Promise<user> {
    return this.prisma.user.create({ data: user });
  }

  /**
   * Retorna um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser buscado.
   * @returns {Promise<user>} O usuario encontrado. Se o usuario nao existir, lanca um erro.
   */
  async getUserById(id: number): Promise<user> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Retorna um usuario pelo discord id.
   *
   * @param {string} id O discord id do usuario a ser buscado.
   * @returns {Promise<user | null>} O usuario encontrado ou null caso contrario.
   */
  async getUserByDiscordId(id: string): Promise<user | null> {
    return this.prisma.user.findUnique({
      where: { discord_id: id },
    });
  }

  /**
   * Retorna todos os usuarios do banco de dados.
   *
   * @returns {Promise<user[]>} Uma lista de usuarios.
   */
  async getAllUsers(): Promise<user[]> {
    return this.prisma.user.findMany();
  }

  /**
   * Atualiza um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser atualizado.
   * @param {Prisma.userUpdateInput} user Dados do usuario a serem atualizados.
   * @returns {Promise<user>} O usuario atualizado.
   */
  async updateUser(id: number, user: Prisma.userUpdateInput): Promise<user> {
    return this.prisma.user.update({
      where: { id },
      data: user,
    });
  }

  /**
   * Atualiza um usuario pelo discord id.
   *
   * @param {string} discordId O discord id do usuario a ser atualizado.
   * @param {Prisma.userUpdateInput} user Dados do usuario a serem atualizados.
   * @returns {Promise<user>} O usuario atualizado.
   */
  async updateUserByDiscord(
    discordId: string,
    user: Prisma.userUpdateInput
  ): Promise<user> {
    return this.prisma.user.update({
      where: { discord_id: discordId },
      data: user,
    });
  }

  /**
   * Deleta um usuario pelo id.
   *
   * @param {number} id O id do usuario a ser deletado.
   * @returns Uma promessa que resolva para o usuario deletado.
   */
  async deleteUserById(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Deleta um usuario pelo discord id.
   *
   * @param {string} id O discord id do usuario a ser deletado.
   * @returns {Promise<user>} O usuario deletado.
   */
  async deleteUserByDiscordId(id: string): Promise<user> {
    return this.prisma.user.delete({
      where: { discord_id: id },
    });
  }
}

export default UserRepository;
