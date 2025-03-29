import UserRepository from "../../infrastructure/persistence/repositories/UserRepository";
import { mockDeep, MockProxy } from "jest-mock-extended";
import { CreateUser } from "../../domain/useCases/user/CreateUser";
import { FindUser } from "../../domain/useCases/user/FindUser";
import { UpdateUser } from "../../domain/useCases/user/UpdateUser";
import { UserStatus } from "../../domain/types/UserStatusEnum";

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
    // Mock da classe UserRepository, que sera injetada no UserService.
    userRepository = mockDeep<UserRepository>();
    createUserCase = new CreateUser(userRepository);
    findUserCase = new FindUser(userRepository);
    updateUserCase = new UpdateUser(userRepository);
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      // Mock da funcao que cria um novo usuario no banco de dados do repositorio.
      // -- ARRANGE --
      userRepository.create.mockResolvedValue(mockUserValue);
      userRepository.findByDiscordId.mockResolvedValue(null);

      // Invoca o metodo createUser do UserService.
      // -- ACT --
      const result = await createUserCase.execute(mockUserValue);

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
        message: "User already exists",
      });
      expect(userRepository.findByDiscordId).toHaveBeenCalledTimes(1);
      expect(userRepository.findByDiscordId).toHaveBeenCalledWith(
        mockUserValue2.discordId
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
      expect(userRepository.updateById).toHaveBeenCalledWith(id, userData);
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
      expect(userRepository.updateById).toHaveBeenCalledWith(id, userData);
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
        message: `User not found with id ${id}`,
      });
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(id);
      expect(userRepository.updateById).not.toHaveBeenCalledTimes(1);
    });
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

    const result = await updateUserCase.executeDisableUser(id);

    expect(result).toEqual({ success: true, data: mockUserValue2 });
    expect(userRepository.updateById).toHaveBeenCalledTimes(1);
    expect(userRepository.updateById).toHaveBeenCalledWith(id, {
      ...mockUserValue2,
      status: UserStatus.INACTIVE,
    });
  });
});
