import { UserEntity } from "@entities/User";
import { ILoggerService } from "@services/ILogger";
import { UserStatus } from "@type/UserStatusEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { UserRepository } from "@infra/repositories/UserRepository";
import {
  mockUserValue,
  createMockUserEntity,
  createMockMessageEntity,
  createMockChannelEntity,
} from "../config/constants";
import { MessageRepository } from "@infra/repositories/MessageRepository";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let messageRepository: MessageRepository;
  let channelRepository: ChannelRepository;
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  beforeEach(() => {
    userRepository = new UserRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    messageRepository = new MessageRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    channelRepository = new ChannelRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    mockLogger.logToConsole = jest.fn().mockImplementation((...message) => {
      console.error(message); // Simulate logging to console.error
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      const result = await userRepository.create(mockUserValue);
      const user = await userRepository.findById(result.id);

      expect(user).toHaveProperty("platformId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const id = 1;
      const user = await userRepository.findById(id);

      expect(user).toBeNull();
    });
  });

  describe("findByPlatformId", () => {
    it("should return a user by discord id", async () => {
      await userRepository.create(mockUserValue);

      const user = await userRepository.findByPlatformId(
        mockUserValue.platformId,
      );

      expect(user).toHaveProperty("platformId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const platformId = "1234567890";
      const user = await userRepository.findByPlatformId(platformId);

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

      const user = await userRepository.create(userData);

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

      const result = await userRepository.createMany(userData);

      expect(result).toBe(2);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const userData = {
        platformId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      const { id } = await userRepository.create(mockUserValue);
      const user = await userRepository.updateById(id, userData);

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

      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      await userRepository.updateById(id, userData);

      expect(spy).toHaveBeenCalledWith("ERROR");
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user by id", async () => {
      const { id } = await userRepository.create(mockUserValue);
      const result = await userRepository.deleteById(id);

      expect(result).toBe(true);
      expect(await userRepository.findById(id)).toBe(null);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      await userRepository.deleteById(id);

      expect(spy).toHaveBeenCalledWith("ERROR");
    });
  });

  describe("listAll", () => {
    it("returns all active users", async () => {
      await userRepository.createMany(
        Array.from({ length: 10 }, createMockUserEntity),
      );

      const result = await userRepository.listAll();

      expect(result).toHaveLength(10);
    });

    it("includes inactive users", async () => {
      await userRepository.createMany(
        Array.from({ length: 7 }, () =>
          createMockUserEntity({ status: UserStatus.ACTIVE }),
        ),
      );

      await userRepository.createMany(
        Array.from({ length: 3 }, () =>
          createMockUserEntity({ status: UserStatus.ACTIVE }),
        ),
      );

      const result = await userRepository.listAll(10, true);

      expect(result).toHaveLength(10);
    });

    it("sets limit clause", async () => {
      await userRepository.createMany(
        Array.from({ length: 10 }, createMockUserEntity),
      );

      const result = await userRepository.listAll(5);

      expect(result).toHaveLength(5);
    });

    it("includes associations", async () => {
      const user = await userRepository.create(mockUserValue);

      const channel = await channelRepository.create(
        createMockChannelEntity({ user: [user] }),
      );

      await messageRepository.create(
        createMockMessageEntity({ user: user, channel: channel }),
      );

      const [result] = await userRepository.listAll();

      expect(result.messages).toHaveLength(1);
      expect(result.channels).toHaveLength(1);
    });
  });
});
