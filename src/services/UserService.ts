import { Service } from "typedi";
import { User as DiscordUser } from "discord.js";
import UserRepository from "../infrastructure/database/repositories/UserRepository";
import { Prisma, user as UserEntity } from "@prisma/client";

export interface IUserService {
  createUser(data: DiscordUser): Promise<UserEntity>;
  getUserById(id: string | number): Promise<UserEntity | null>;
  updateUser(
    id: number | string,
    data: Prisma.userUpdateInput
  ): Promise<UserEntity>;
  deleteUser(id: number | string): Promise<UserEntity>;
}

@Service()
export class UserService implements IUserService {
  constructor(public userRepository: UserRepository) {}

  /**
   * Cria um novo usuario no banco de dados,
   * caso o usuario ja exista, retorna o usuario existente.
   * @param data Dados do usuario vindo da API do Discord.
   * @returns Usuario criado ou existente.
   */
  async createUser(data: DiscordUser) {
    const user = await this.userRepository.getUserByDiscordId(data.id);
    if (user) return user;
    return this.userRepository.createUser(
      UserMapper.mapDiscordUserToPrismaUser(data)
    );
  }

  /**
   * Retorna um usuario pelo id ou discord id.
   *
   * Se o id for um numero, ele sera buscado pelo id.
   * Se o id for uma string, ele sera buscado pelo discord id.
   * @param id O id ou discord id do usuario.
   * @returns O usuario encontrado ou null caso contrario.
   */
  async getUserById(id: string | number) {
    if (typeof id === "number") return this.userRepository.getUserById(id);
    return this.userRepository.getUserByDiscordId(id);
  }

  /**
   * Atualiza um usuario pelo id ou discord id.
   *
   * Se o id for um numero, ele sera atualizado pelo id.
   * Se o id for uma string, ele sera atualizado pelo discord id.
   * @param id Numero do id do usuario ou discord id.
   * @param data Dados do usuario a serem atualizados.
   * @returns Usuario atualizado.
   */
  async updateUser(id: number | string, data: Prisma.userUpdateInput) {
    if (typeof id === "number") return this.userRepository.updateUser(id, data);
    return this.userRepository.updateUserByDiscord(id, data);
  }

  /**
   * Deleta um usuario pelo id ou discord id.
   *
   * Se o id for um numero, ele sera deletado pelo id.
   * Se o id for uma string, ele sera deletado pelo discord id.
   *
   * @param id - O id ou discord id do usuario a ser deletado.
   * @returns Uma promessa que resolva para o usuario deletado.
   */
  async deleteUser(id: number | string) {
    if (typeof id === "number") return this.userRepository.deleteUserById(id);
    return this.userRepository.deleteUserByDiscordId(id);
  }
}

export class UserMapper {
  /**
   * Mapea um objeto DiscordUser para um objeto Prisma.userCreateInput.
   * @param discordUser O objeto DiscordUser a ser mapeado.
   * @returns Um objeto Prisma.userCreateInput mapeado a partir do DiscordUser.
   */
  public static mapDiscordUserToPrismaUser(
    discordUser: DiscordUser
  ): Prisma.userCreateInput {
    return {
      discord_id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.globalName,
      created_at: discordUser.createdTimestamp,
      bot: discordUser.bot,
    };
  }
}
