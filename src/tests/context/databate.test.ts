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
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import UserRepository from "../../infrastructure/persistence/repositories/UserRepository";
import { PrismaClient } from "@prisma/client";

describe("initializeDatabase", () => {
  it("should work with default client", () => {
    const mockClient = new PrismaClient();
    const prismaService = new PrismaService(mockClient);
    const { userRepository } = initializeDatabase(prismaService);
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(userRepository).toBeInstanceOf(UserRepository);
  });

  it("should work with injected client", () => {
    const mockClient = new PrismaClient();
    const prismaService = new PrismaService(mockClient);
    const { userRepository } = initializeDatabase(prismaService);
    expect(userRepository).toBeInstanceOf(UserRepository);
  });
});
