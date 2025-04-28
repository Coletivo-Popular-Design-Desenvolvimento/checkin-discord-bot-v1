jest.mock("@prisma/client", () => {
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

import { initializeDatabase } from "../../contexts/database.context";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { UserRepository } from "../../infrastructure/persistence/repositories/UserRepository";
import { PrismaClient } from "@prisma/client";

describe("initializeDatabase", () => {
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  it("should work with default client", () => {
    const { userRepository } = initializeDatabase(mockLogger);
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(userRepository).toBeInstanceOf(UserRepository);
  });

  it("should work with injected client", () => {
    const mockClient = new PrismaClient();
    const prismaService = new PrismaService(mockClient);
    const { userRepository } = initializeDatabase(mockLogger, prismaService);
    expect(userRepository).toBeInstanceOf(UserRepository);
  });
});
