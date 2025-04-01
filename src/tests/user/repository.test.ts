import { UserEntity } from "../../domain/entities/User";
import { UserStatus } from "../../domain/types/UserStatusEnum";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import UserRepository from "../../infrastructure/persistence/repositories/UserRepository";
import { mockDBUserValue, mockUserUpdateValue } from "../config/constants";
import { prismaMock } from "../config/singleton";

describe("UserRepository", () => {
  let userRepository: UserRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  beforeAll(() => {
    userRepository = new UserRepository(prismaServiceMock);
  });

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const id = 1;

      prismaMock.user.findUnique.mockResolvedValue(mockDBUserValue);

      const user = await userRepository.findById(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id, status: UserStatus.ACTIVE },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discordId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const id = 1;

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.findById(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id, status: UserStatus.ACTIVE },
      });

      expect(user).toBeNull();
    });
  });

  describe("getUserByDiscordId", () => {
    it("should return a user by discord id", async () => {
      const discordId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(mockDBUserValue);

      const user = await userRepository.findByDiscordId(discordId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { discord_id: discordId, status: UserStatus.ACTIVE },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discordId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const discordId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.findByDiscordId(discordId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { discord_id: discordId, status: UserStatus.ACTIVE },
      });

      expect(user).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const userData: Omit<UserEntity, "id"> = {
        discordId: "1234567890",
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
      expect(user).toHaveProperty("discordId", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const id = 1;
      const userData = {
        discordId: "1234567890",
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
      expect(user).toHaveProperty("discordId", "1234567890");
      expect(user).toHaveProperty("username", "Jane Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;
      const userData = {
        discordId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      prismaMock.user.update.mockRejectedValue(new Error("User not found"));

      await expect(userRepository.updateById(id, userData)).rejects.toThrow(
        "User not found"
      );

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

      prismaMock.user.delete.mockRejectedValue(new Error("User not found"));

      await expect(userRepository.deleteById(id)).rejects.toThrow(
        "User not found"
      );

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
