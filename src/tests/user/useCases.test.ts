import { UserRepository } from "../../infrastructure/persistence/repositories/UserRepository";
import { mockDeep, MockProxy } from "jest-mock-extended";
import { CreateUser } from "../../domain/useCases/user/CreateUser";
import { FindUser } from "../../domain/useCases/user/FindUser";
import { UpdateUser } from "../../domain/useCases/user/UpdateUser";
import { UserStatus } from "../../domain/types/UserStatusEnum";
import { ErrorMessages } from "../../domain/types/ErrorMessages";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";

// Mock da entidade que representa o usuário no banco de dados.
const mockUserValue = {
  id: 1,
  discordId: "1234567890",
  username: "John Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  globalName: undefined,
  joinedAt: undefined,
  createdAt: undefined,
  updateAt: undefined,
  lastActive: undefined,
  email: undefined,
};

const mockUserValue2 = {
  id: 2,
  discordId: "1234567890",
  username: "Jane Doe",
  bot: false,
  status: UserStatus.ACTIVE,
  globalName: undefined,
  joinedAt: undefined,
  createdAt: undefined,
  updateAt: undefined,
  lastActive: undefined,
  email: undefined,
};

describe("User useCases", () => {
  let userRepository: MockProxy<UserRepository>;
  let createUserCase: CreateUser;
  let findUserCase: FindUser;
  let updateUserCase: UpdateUser;
  beforeEach(() => {
    const mockLogger: ILoggerService = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    // Mock da classe UserRepository, que sera injetada no UserService.
    userRepository = mockDeep<UserRepository>();
    createUserCase = new CreateUser(userRepository, mockLogger);
    findUserCase = new FindUser(userRepository, mockLogger);
    updateUserCase = new UpdateUser(userRepository, mockLogger);
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      // Mock da funcao que cria um novo usuario no banco de dados do repositorio.
      // -- ARRANGE --
      userRepository.create.mockResolvedValue(mockUserValue);
      userRepository.findByDiscordId.mockResolvedValue(null);

      // Invoca o metodo createUser do UserService.
      // -- ACT --
      const adjustedUser = { ...mockUserValue, id: undefined };
      const result = await createUserCase.execute(adjustedUser);

      // Verifica o resultado.
      // -- ASSERT --
      expect(result).toEqual({ success: true, data: mockUserValue });
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockUserValue,
        id: undefined,
      });
    });

    it("should return existing user", async () => {
      userRepository.findByDiscordId.mockResolvedValue(mockUserValue2);

      const result = await createUserCase.execute(mockUserValue2);

      expect(result).toEqual({
        success: false,
        data: mockUserValue2,
        message: ErrorMessages.USER_ALREADY_EXISTS,
      });
      expect(userRepository.findByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.findByDiscordId).toHaveBeenCalledWith(
        mockUserValue2.discordId,
        true
      );
    });

    it("should fail to create an user for a bot", async () => {
      userRepository.findByDiscordId.mockResolvedValue(null);

      const result = await createUserCase.execute({
        ...mockUserValue,
        bot: true,
      });

      expect(result).toEqual({
        success: false,
        data: null,
        message: ErrorMessages.NO_BOT,
      });
      expect(userRepository.create).toHaveBeenCalledTimes(0);
    });

    it("create many users, but no bots", async () => {
      const users = [
        {
          discordId: "1234567890",
          username: "John Doe",
          bot: false,
          status: UserStatus.ACTIVE,
        },
        {
          discordId: "1234567891",
          username: "Jane Doe",
          bot: false,
          status: UserStatus.ACTIVE,
        },
        {
          discordId: "666",
          username: "The Bad Bot",
          bot: true,
          status: UserStatus.ACTIVE,
        },
      ];

      userRepository.createMany.mockResolvedValue(2);

      const result = await createUserCase.executeMany(users);

      expect(result).toEqual({
        success: true,
        data: { created: 2, failed: 1 },
      });
      expect(userRepository.createMany).toHaveBeenCalledTimes(1);
      expect(userRepository.createMany).toHaveBeenCalledWith(
        users
          .filter((user) => !user.bot)
          .map((user) => ({
            ...user,
          }))
      );
    });
  });

  describe("getUserById", () => {
    it("should get a user by id", async () => {
      const id = 1;

      userRepository.findById.mockResolvedValue(mockUserValue);

      const result = await findUserCase.execute(id);

      expect(result).toEqual({ success: true, data: mockUserValue });
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(id);
    });

    it("should get a user by discord id", async () => {
      const id = "1234567890";

      userRepository.findByDiscordId.mockResolvedValue(mockUserValue);

      const result = await findUserCase.execute(id);

      expect(result).toEqual({ success: true, data: mockUserValue });
      expect(userRepository.findByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.findByDiscordId).toHaveBeenCalledWith(id);
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

      userRepository.updateById.mockResolvedValue(mockUserValue2);
      userRepository.findById.mockResolvedValue(mockUserValue);

      const result = await updateUserCase.execute(id, userData);

      expect(result).toEqual({ success: true, data: mockUserValue2 });
      expect(userRepository.updateById).toHaveBeenCalledTimes(1);
      expect(userRepository.updateById).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          username: mockUserValue2.username,
          status: UserStatus.ACTIVE,
          bot: false,
          discordId: mockUserValue2.discordId,
        })
      );
    });

    it("update usar by discord id", async () => {
      const discordId = "1234567890";
      const id = 1;
      const userData = {
        discordId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      userRepository.updateById.mockResolvedValue(mockUserValue2);
      userRepository.findByDiscordId.mockResolvedValue(mockUserValue);

      const result = await updateUserCase.execute(discordId, userData);

      expect(result).toEqual({ success: true, data: mockUserValue2 });
      expect(userRepository.updateById).toHaveBeenCalledTimes(1);
      expect(userRepository.updateById).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          username: mockUserValue2.username,
          status: UserStatus.ACTIVE,
          bot: false,
          discordId: mockUserValue2.discordId,
        })
      );
    });

    it("user not found", async () => {
      const id = 1;
      const userData = {
        discordId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      const result = await updateUserCase.execute(id, userData);

      expect(result).toEqual({
        success: false,
        data: null,
        message: `${ErrorMessages.USER_NOT_FOUND} ${id}`,
      });
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(id);
      expect(userRepository.updateById).not.toHaveBeenCalledTimes(1);
    });

    it("should disable an user", async () => {
      const id = 2;
      const userData = {
        discordId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      userRepository.updateById.mockResolvedValue(mockUserValue2);
      userRepository.findById.mockResolvedValue(mockUserValue2);

      const result = await updateUserCase.executeInvertUserStatus(id);

      expect(result).toEqual({ success: true, data: mockUserValue2 });
      expect(userRepository.updateById).toHaveBeenCalledTimes(1);
      expect(userRepository.updateById).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          username: mockUserValue2.username,
          status: UserStatus.INACTIVE,
          bot: false,
          discordId: mockUserValue2.discordId,
        })
      );
    });
  });
});
