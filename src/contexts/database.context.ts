import { PrismaService } from "../infrastructure/persistence/prisma/prismaService";
import UserRepository from "../infrastructure/persistence/repositories/UserRepository";
import { IUserRepository } from "../domain/interfaces/repositories/IUserRepository";

/**
 * Inicializa e configura o banco de dados.
 *
 * Esta função cria uma instancia do PrismaService para gerenciar a conexão com o banco de dados
 * e inicializa o UserRepository com essa instância. Ela retorna um objeto contendo as
 * repositórios inicializados para uso na aplicação.
 *
 * @returns {Object} Um objeto contendo as repositórios inicializados.
 */

export function initializeDatabase(prismaService: PrismaService): {
  userRepository: IUserRepository;
} {
  const userRepository = new UserRepository(prismaService);
  return { userRepository };
}
