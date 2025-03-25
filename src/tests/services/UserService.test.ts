import { UserMapper, UserService } from "../../services/UserService";
import UserRepository from "../../infrastructure/database/repositories/UserRepository";
import { mockDeep, MockProxy } from "jest-mock-extended";
import { User } from "discord.js";

// Mock da entidade que representa o usuário no banco de dados.
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

const mockUserValue2 = {
  id: 2,
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

// Mock da entidade recebida da API do Discord.
const userData = mockDeep<User>();

userData.id = "1234567890";
userData.username = "John Doe";
userData.bot = false;

const userData2 = mockDeep<User>();

userData2.id = "1234567890";
userData2.username = "Jane Doe";
userData2.bot = false;

describe("UserService", () => {
  let service: UserService;
  let userRepository: MockProxy<UserRepository>;

  beforeEach(() => {
    // Mock da classe UserRepository, que sera injetada no UserService.
    userRepository = mockDeep<UserRepository>();
    service = new UserService(userRepository);
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      // Mock da funcao que cria um novo usuario no banco de dados do repositorio.
      // -- ARRANGE --
      userRepository.createUser.mockResolvedValue(mockUserValue);
      userRepository.getUserByDiscordId.mockResolvedValue(null);

      // Invoca o metodo createUser do UserService.
      // -- ACT --
      const result = await service.createUser(userData);

      // Verifica o resultado.
      // -- ASSERT --
      expect(result).toEqual(mockUserValue);
      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        UserMapper.mapDiscordUserToPrismaUser(userData)
      );
    });

    it("should return existing user", async () => {
      userRepository.getUserByDiscordId.mockResolvedValue(mockUserValue2);

      const result = await service.createUser(userData2);

      expect(result).toEqual(mockUserValue2);
      expect(userRepository.getUserByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserByDiscordId).toHaveBeenCalledWith(
        UserMapper.mapDiscordUserToPrismaUser(userData2).discord_id
      );
    });
  });

  describe("getUserById", () => {
    it("should get a user by id", async () => {
      const id = 1;

      userRepository.getUserById.mockResolvedValue(mockUserValue);

      const result = await service.getUserById(id);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(id);
    });

    it("should get a user by discord id", async () => {
      const id = "1234567890";

      userRepository.getUserByDiscordId.mockResolvedValue(mockUserValue);

      const result = await service.getUserById(id);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.getUserByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserByDiscordId).toHaveBeenCalledWith(id);
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

      userRepository.updateUser.mockResolvedValue(mockUserValue);

      const result = await service.updateUser(id, userData);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUser).toHaveBeenCalledWith(id, userData);
    });

    it("update usar by discord id", async () => {
      const id = "1234567890";
      const userData = {
        discord_id: "1234567890",
        username: "Jane Doe",
        bot: false,
      };

      userRepository.updateUserByDiscord.mockResolvedValue(mockUserValue);

      const result = await service.updateUser(id, userData);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.updateUserByDiscord).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUserByDiscord).toHaveBeenCalledWith(
        id,
        userData
      );
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user by id", async () => {
      const id = 1;

      userRepository.deleteUserById.mockResolvedValue(mockUserValue);

      const result = await service.deleteUser(id);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.deleteUserById).toHaveBeenCalledTimes(1);
      expect(userRepository.deleteUserById).toHaveBeenCalledWith(id);
    });

    it("should delete a user by discord id", async () => {
      const id = "1234567890";

      userRepository.deleteUserByDiscordId.mockResolvedValue(mockUserValue);

      const result = await service.deleteUser(id);

      expect(result).toEqual(mockUserValue);
      expect(userRepository.deleteUserByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.deleteUserByDiscordId).toHaveBeenCalledWith(id);
    });
  });

  describe("test user mapper", () => {
    it("should map user to prisma user", () => {
      const prismaUser = UserMapper.mapDiscordUserToPrismaUser(userData);
      // não é possivel fazer deep equality por causa do mock de user.
      expect(prismaUser.discord_id).toEqual("1234567890");
      expect(prismaUser.username).toEqual("John Doe");
      expect(prismaUser.bot).toEqual(false);
    });
  });
});
