import { UserRepository } from "@infra/repositories/UserRepository";
import { mockDeep, MockProxy } from "jest-mock-extended";
import { CreateUser } from "@useCases/user/CreateUser";
import { FindUser } from "@useCases/user/FindUser";
import { UpdateUser } from "@useCases/user/UpdateUser";
import { UserStatus } from "@type/UserStatusEnum";
import { ErrorMessages } from "@type/ErrorMessages";
import { ILoggerService } from "@services/ILogger";

// Mock da entidade que representa o usuário no banco de dados.
const mockUserValue = {
  id: 1,
  platformId: "1234567890",
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
  platformId: "1234567890",
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
      userRepository.findByPlatformId.mockResolvedValue(null);

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
      userRepository.findByPlatformId.mockResolvedValue(mockUserValue2);

      const result = await createUserCase.execute(mockUserValue2);

      expect(result).toEqual({
        success: false,
        data: mockUserValue2,
        message: ErrorMessages.USER_ALREADY_EXISTS,
      });
      expect(userRepository.findByPlatformId).toHaveBeenCalledTimes(1);
      expect(userRepository.findByPlatformId).toHaveBeenCalledWith(
        mockUserValue2.platformId,
        true,
      );
    });

    it("should fail to create an user for a bot", async () => {
      userRepository.findByPlatformId.mockResolvedValue(null);

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
        {
          platformId: "666",
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
          })),
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

      userRepository.findByPlatformId.mockResolvedValue(mockUserValue);

      const result = await findUserCase.execute(id);

      expect(result).toEqual({ success: true, data: mockUserValue });
      expect(userRepository.findByPlatformId).toHaveBeenCalledTimes(1);
      expect(userRepository.findByPlatformId).toHaveBeenCalledWith(id);
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
          platformId: mockUserValue2.platformId,
        }),
      );
    });

    it("update usar by discord id", async () => {
      const platformId = "1234567890";
      const id = 1;
      const userData = {
        platformId: "1234567890",
        username: "Jane Doe",
        bot: false,
        status: UserStatus.ACTIVE,
      };

      userRepository.updateById.mockResolvedValue(mockUserValue2);
      userRepository.findByPlatformId.mockResolvedValue(mockUserValue);

      const result = await updateUserCase.execute(platformId, userData);

      expect(result).toEqual({ success: true, data: mockUserValue2 });
      expect(userRepository.updateById).toHaveBeenCalledTimes(1);
      expect(userRepository.updateById).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          username: mockUserValue2.username,
          status: UserStatus.ACTIVE,
          bot: false,
          platformId: mockUserValue2.platformId,
        }),
      );
    });

    it("user not found", async () => {
      const id = 1;
      const userData = {
        platformId: "1234567890",
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
          platformId: mockUserValue2.platformId,
        }),
      );
    });
  });
});
