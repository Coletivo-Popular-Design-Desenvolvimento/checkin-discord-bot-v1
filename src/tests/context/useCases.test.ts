// Mock the database initialization
jest.mock("../../contexts/database.context", () => ({
  initializeDatabase: jest.fn(() => ({
    userRepository: {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findByDiscordId: jest.fn(),
    },
  })),
}));

import { PrismaClient } from "@prisma/client";
import { initializeDatabase } from "../../contexts/database.context";
import { CreateUser } from "../../domain/useCases/user/CreateUser";
import { FindUser } from "../../domain/useCases/user/FindUser";
import { UpdateUser } from "../../domain/useCases/user/UpdateUser";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { mockUserValue } from "../config/constants";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import { initializeUserUseCases } from "../../contexts/useUserCases.context";

describe("initializeUserCases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  it("should initialize all use cases with the repository", () => {
    const prismaClient = new PrismaClient();
    const prismaService = new PrismaService(prismaClient);
    const { userRepository } = initializeDatabase(mockLogger, prismaService);
    const { createUserCase, findUserCase, updateUserCase } =
      initializeUserUseCases(userRepository, mockLogger);

    // Verify instances
    expect(createUserCase).toBeInstanceOf(CreateUser);
    expect(findUserCase).toBeInstanceOf(FindUser);
    expect(updateUserCase).toBeInstanceOf(UpdateUser);

    // Verify database was initialized once
    expect(initializeDatabase).toHaveBeenCalledTimes(1);
  });

  it("should return a singleton instance", async () => {
    // O teste e para garantir que apenas uma instancia do repositorio seja criada
    const prismaClient = new PrismaClient();
    const prismaService = new PrismaService(prismaClient);
    const { userRepository } = initializeDatabase(mockLogger, prismaService);

    const createRepo = (userRepository.create = jest.fn());
    const findRepo = (userRepository.findById = jest.fn());
    const updateRepo = (userRepository.updateById = jest.fn());

    createRepo.mockResolvedValue(mockUserValue);
    findRepo.mockResolvedValue(mockUserValue);
    updateRepo.mockResolvedValue(mockUserValue);

    const firstCall = initializeUserUseCases(userRepository, mockLogger);
    const secondCall = initializeUserUseCases(userRepository, mockLogger);

    const createResult = await secondCall.createUserCase.execute(mockUserValue);
    const findResult = await secondCall.findUserCase.execute(mockUserValue.id);
    const updateResult = await secondCall.updateUserCase.execute(
      mockUserValue.id,
      mockUserValue
    );

    const createResult2 = await firstCall.createUserCase.execute(mockUserValue);
    const findResult2 = await firstCall.findUserCase.execute(mockUserValue.id);
    const updateResult2 = await firstCall.updateUserCase.execute(
      mockUserValue.id,
      mockUserValue
    );

    expect(createResult).toEqual(createResult2);
    expect(findResult).toEqual(findResult2);
    expect(updateResult).toEqual(updateResult2);

    expect(createRepo).toHaveBeenCalledTimes(2);
    expect(findRepo).toHaveBeenCalledTimes(4); // update também chama o find
    expect(updateRepo).toHaveBeenCalledTimes(2);
  });
});
