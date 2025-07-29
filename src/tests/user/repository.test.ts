import { UserEntity } from "@entities/User";
import { ILoggerService } from "@services/ILogger";
import { UserStatus } from "@type/UserStatusEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { UserRepository } from "@infra/repositories/UserRepository";
import {
  mockDBUserValue,
  mockUserUpdateValue,
  mockUserValue,
} from "../config/constants";
import { prismaMock } from "../config/singleton";
import { PrismaClient } from "@prisma/client";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  const prismaService = new PrismaService(new PrismaClient());

  beforeAll(() => {
    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message); // Simulate logging to console.error
    });

    userRepository = new UserRepository(prismaService, mockLogger);
  });

  describe("findById", () => {
    // https://github.com/Quramy/jest-prisma/blob/743e9ce1913af0749d2a6703c8314dfcba9553e3/packages/jest-prisma-core/src/delegate.ts#L99
    // it.only("should return a user by id", async (prisma) => {
    //   userRepository = new UserRepository(prisma, mockLogger);
    // });

    it.only("should return a user by id", async () => {
      try {
        await prismaService.getClient().$transaction(async (tx) => {
          userRepository = new UserRepository(
            new PrismaService(tx as PrismaClient),
            mockLogger,
          );
          const result = await userRepository.create(mockUserValue);
          const user = await userRepository.findById(result.id);

          expect(user).toHaveProperty("platformId", "1234567890");
          expect(user).toHaveProperty("username", "John Doe");
          expect(user).toHaveProperty("bot", false);
          throw new Error("Rollback");
        });
      } catch (error) {
        if (error.message !== "Rollback") throw error;
      }
    });

    it("should return null if user not found", async () => {
      const id = 1;

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.findById(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id, status: { in: [UserStatus.ACTIVE] } },
      });

      expect(user).toBeNull();
    });
  });

  describe("findByPlatformId", () => {
    it("should return a user by discord id", async () => {
      const platformId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(mockDBUserValue);

      const user = await userRepository.findByPlatformId(platformId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { platform_id: platformId, status: { in: [UserStatus.ACTIVE] } },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("platformId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const platformId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.findByPlatformId(platformId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { platform_id: platformId, status: { in: [UserStatus.ACTIVE] } },
      });

      expect(user).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const userData: Omit<UserEntity, "id"> = {
        platformId: "1234567890",
        username: "John Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      prismaMock.user.create.mockResolvedValue(mockDBUserValue);

      const user = await userRepository.create(userData);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { ...mockDBUserValue, id: undefined },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("platformId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should create many users", async () => {
      const userData: Omit<UserEntity, "id">[] = [
        {
          platformId: "1234567890",
          username: "John Doe",
          bot: false,
          status: UserStatus.ACTIVE,
        },
        {
          platformId: "1234567891",
          username: "Jane Doe",
          bot: false,
          status: UserStatus.ACTIVE,
        },
      ];

      prismaMock.user.createMany.mockResolvedValue({
        count: 2,
      });

      const user = await userRepository.createMany(userData);

      expect(prismaMock.user.createMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.createMany).toHaveBeenCalledWith({
        data: userData.map((user) => ({
          platform_id: user.platformId,
          username: user.username,
          bot: user.bot,
          status: user.status,
          id: undefined,
          email: undefined,
          created_at: undefined,
          update_at: undefined,
          last_active: undefined,
        })),
        skipDuplicates: true,
      });

      expect(user).toBe(2);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const id = 1;
      const userData = {
        platformId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      prismaMock.user.update.mockResolvedValue(mockUserUpdateValue);

      const user = await userRepository.updateById(id, userData);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...mockUserUpdateValue, id: undefined },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("platformId", "1234567890");
      expect(user).toHaveProperty("username", "Jane Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;
      const userData = {
        platformId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      prismaMock.user.update.mockRejectedValue(new Error());
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      await userRepository.updateById(id, userData);

      expect(spy).toHaveBeenCalledWith("ERROR");

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { ...mockUserUpdateValue, id: undefined },
      });
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user by id", async () => {
      const id = 1;

      prismaMock.user.delete.mockResolvedValue(mockDBUserValue);

      const user = await userRepository.deleteById(id);

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });

      expect(user).toBe(true);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;

      prismaMock.user.delete.mockRejectedValue(new Error());
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await userRepository.deleteById(id);

      expect(spy).toHaveBeenCalledWith("ERROR");

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
