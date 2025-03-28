import { PrismaClient } from "@prisma/client";
import { PrismaService } from "../infrastructure/persistence/prisma/prismaService";
import { initializeDatabase } from "./database.context";
import { initializeUseCases } from "./useCases.context";

export function initializeApp() {
  // Aqui vao as dependencias externas
  const prismaClient = new PrismaClient();
  const prismaService = new PrismaService(prismaClient);
  const { userRepository } = initializeDatabase(prismaService);

  // Daqui para baixo, vao as dependencias internas
  const useCases = initializeUseCases(userRepository);

  return {
    ...useCases,
  };
}
