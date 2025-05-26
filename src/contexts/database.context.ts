import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { UserRepository } from "@infra/repositories/UserRepository";
import { MessageRepository } from "@infra/persistence/repositories/MessageRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { PrismaClient } from "@prisma/client";
import { ILoggerService } from "@services/ILogger";
import { IMessageRepository } from "@domain/interfaces/repositories/IMessageRepository";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";
import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";

/**
 * Inicializa e configura o banco de dados.
 *
 * Esta função cria uma instancia do PrismaService para gerenciar a conexão com o banco de dados
 * e inicializa o UserRepository com essa instância. Ela retorna um objeto contendo as
 * repositórios inicializados para uso na aplicação.
 *
 * @returns {Object} Um objeto contendo as repositórios inicializados.
 */

export function initializeDatabase(
  logger: ILoggerService,
  prismaService?: PrismaService,
): {
  userRepository: IUserRepository;
  messageRepository: IMessageRepository;
  channelRepository: IChannelRepository;
} {
  const prismaClient = new PrismaClient();
  const newPrismaService = new PrismaService(prismaClient);

  const userRepository = new UserRepository(
    prismaService ?? newPrismaService,
    logger,
  );
  const messageRepository = new MessageRepository(
    prismaService ?? newPrismaService,
    logger,
  );
  const channelRepository = new ChannelRepository(
    prismaService ?? newPrismaService,
    logger,
  );

  return { userRepository, messageRepository, channelRepository };
}
