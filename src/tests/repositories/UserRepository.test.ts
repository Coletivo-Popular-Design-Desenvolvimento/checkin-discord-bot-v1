import UserRepository from "../../infrastructure/database/repositories/UserRepository";
import { prismaMock } from "../singleton";

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository(prismaMock);
  });

  const mockUserValue = {
    id: 1,
    discord_id: "1234567890",
    username: "John Doe",
    bot: false,
    global_name: "",
    joined_at: 0,
    created_at: 0,
    update_at: 0,
    last_active: 0,
    email: "",
  };

  const mockUserUpdateValue = {
    id: 1,
    discord_id: "1234567890",
    username: "Jane Doe",
    bot: false,
    global_name: "",
    joined_at: 0,
    created_at: 0,
    update_at: 0,
    last_active: 0,
    email: "",
  };

  describe("getUserById", () => {
    it("should return a user by id", async () => {
      const id = 1;

      prismaMock.user.findUnique.mockResolvedValue(mockUserValue);

      const user = await userRepository.getUserById(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const id = 1;

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.getUserById(id);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });

      expect(user).toBeNull();
    });
  });

  describe("getUserByDiscordId", () => {
    it("should return a user by discord id", async () => {
      const discordId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(mockUserValue);

      const user = await userRepository.getUserByDiscordId(discordId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { discord_id: discordId },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should return null if user not found", async () => {
      const discordId = "1234567890";

      prismaMock.user.findUnique.mockResolvedValue(null);

      const user = await userRepository.getUserByDiscordId(discordId);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { discord_id: discordId },
      });

      expect(user).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const userData = {
        discord_id: "1234567890",
        username: "John Doe",
        bot: false,
      };

      prismaMock.user.create.mockResolvedValue(mockUserValue);

      const user = await userRepository.createUser(userData);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userData,
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const id = 1;
      const userData = {
        discord_id: "1234567890",
        username: "Jane Doe",
        bot: false,
      };

      prismaMock.user.update.mockResolvedValue(mockUserUpdateValue);

      const user = await userRepository.updateUser(id, userData);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id },
        data: userData,
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "Jane Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;
      const userData = {
        discord_id: "1234567890",
        username: "Jane Doe",
        bot: false,
      };

      prismaMock.user.update.mockRejectedValue(new Error("User not found"));

      await expect(
        userRepository.updateUser(id, userData)
      ).rejects.toThrowError("User not found");

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id },
        data: userData,
      });
    });
  });

  describe("updateUserByDiscord", () => {
    it("should update a user by discord id", async () => {
      const discordId = "1234567890";
      const userData = {
        discord_id: "1234567890",
        username: "Jane Doe",
        bot: false,
      };

      prismaMock.user.update.mockResolvedValue(mockUserUpdateValue);

      const user = await userRepository.updateUserByDiscord(
        discordId,
        userData
      );

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { discord_id: discordId },
        data: userData,
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "Jane Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const discordId = "1234567890";
      const userData = {
        discord_id: "1234567890",
        username: "Jane Doe",
        bot: false,
      };

      prismaMock.user.update.mockRejectedValue(new Error("User not found"));

      await expect(
        userRepository.updateUserByDiscord(discordId, userData)
      ).rejects.toThrowError("User not found");

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { discord_id: discordId },
        data: userData,
      });
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user by id", async () => {
      const id = 1;

      prismaMock.user.delete.mockResolvedValue(mockUserValue);

      const user = await userRepository.deleteUserById(id);

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const id = 1;

      prismaMock.user.delete.mockRejectedValue(new Error("User not found"));

      await expect(userRepository.deleteUserById(id)).rejects.toThrowError(
        "User not found"
      );

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe("deleteUserByDiscordId", () => {
    it("should delete a user by discord id", async () => {
      const discordId = "1234567890";

      prismaMock.user.delete.mockResolvedValue(mockUserValue);

      const user = await userRepository.deleteUserByDiscordId(discordId);

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { discord_id: discordId },
      });

      expect(user).toHaveProperty("id", 1);
      expect(user).toHaveProperty("discord_id", "1234567890");
      expect(user).toHaveProperty("username", "John Doe");
      expect(user).toHaveProperty("bot", false);
    });

    it("should throw an error if user not found", async () => {
      const discordId = "1234567890";

      prismaMock.user.delete.mockRejectedValue(new Error("User not found"));

      await expect(
        userRepository.deleteUserByDiscordId(discordId)
      ).rejects.toThrowError("User not found");

      expect(prismaMock.user.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { discord_id: discordId },
      });
    });
  });
});
