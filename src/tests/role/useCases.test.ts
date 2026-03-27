import { mockDeep, MockProxy } from "jest-mock-extended";
import { UpdateUserRole } from "@useCases/role/UpdateUserRole";
import { IRoleRepository } from "@repositories/IRoleRepository";
import { IUserRepository } from "@repositories/IUserRepository";
import { ICreateUser } from "@interfaces/useCases/user/ICreateUser";
import { ILoggerService } from "@services/ILogger";
import { UserStatus } from "@type/UserStatusEnum";
import { RoleEntity } from "@domain/entities/Role";
import { UserEntity } from "@domain/entities/User";

const mockUserEntity: UserEntity = {
  id: 1,
  platformId: "user-123",
  username: "testuser",
  globalName: "Test User",
  bot: false,
  status: UserStatus.ACTIVE,
  joinedAt: new Date("2025-01-01"),
  platformCreatedAt: new Date("2025-01-01"),
  createAt: new Date("2025-01-01"),
  updateAt: new Date("2025-01-01"),
  lastActive: new Date("2025-01-01"),
  email: null,
};

const mockRoleEntity: RoleEntity = {
  id: 1,
  platformId: "role-123",
  name: "Cargo Teste",
  createdAt: new Date("2025-01-01"),
  platformCreatedAt: new Date("2025-01-01"),
  user: [],
};

const mockSyncInput = {
  userPlatformId: "user-123",
  username: "testuser",
  userGlobalName: "Usuario Teste",
  userBot: false,
  userPlatformCreatedAt: new Date("2025-01-01"),
  userJoinedAt: new Date("2025-01-01"),
  roles: [
    {
      platformId: "role-123",
      name: "Test Role",
      platformCreatedAt: new Date("2025-01-01"),
    },
    {
      platformId: "role-456",
      name: "Another Role",
      platformCreatedAt: new Date("2025-01-01"),
    },
  ],
};

describe("UpdateUserRole", () => {
  let roleRepository: MockProxy<IRoleRepository>;
  let userRepository: MockProxy<IUserRepository>;
  let createUser: MockProxy<ICreateUser>;
  let logger: MockProxy<ILoggerService>;
  let updateUserRole: UpdateUserRole;

  beforeEach(() => {
    roleRepository = mockDeep<IRoleRepository>();
    userRepository = mockDeep<IUserRepository>();
    createUser = mockDeep<ICreateUser>();
    logger = mockDeep<ILoggerService>();
    updateUserRole = new UpdateUserRole(
      roleRepository,
      userRepository,
      createUser,
      logger,
    );
  });

  describe("syncUserRoles - new user", () => {
    it("should create user and assign all roles", async () => {
      // Usuario nao existe
      userRepository.findByPlatformId.mockResolvedValue(null);
      createUser.execute.mockResolvedValue({
        success: true,
        data: mockUserEntity,
      });

      // Cargos nao existem
      roleRepository.findByPlatformId.mockResolvedValue(null);
      roleRepository.create.mockResolvedValue(mockRoleEntity);
      roleRepository.assignRoleToUser.mockResolvedValue(true);

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        added: 2,
        removed: 0,
        total: 2,
        isNewUser: true,
      });
      expect(createUser.execute).toHaveBeenCalledTimes(1);
      expect(roleRepository.create).toHaveBeenCalledTimes(2);
      expect(roleRepository.assignRoleToUser).toHaveBeenCalledTimes(2);
    });

    it("should create user and reuse existing roles", async () => {
      // Usuario nao existe
      userRepository.findByPlatformId.mockResolvedValue(null);
      createUser.execute.mockResolvedValue({
        success: true,
        data: mockUserEntity,
      });

      // Primeiro cargo existe, segundo nao
      roleRepository.findByPlatformId
        .mockResolvedValueOnce(mockRoleEntity)
        .mockResolvedValueOnce(null);
      roleRepository.create.mockResolvedValue(mockRoleEntity);
      roleRepository.assignRoleToUser.mockResolvedValue(true);

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(true);
      expect(result.data.isNewUser).toBe(true);
      expect(result.data.added).toBe(2);
      expect(roleRepository.create).toHaveBeenCalledTimes(1);
      expect(roleRepository.assignRoleToUser).toHaveBeenCalledTimes(2);
    });

    it("should fail if user creation fails", async () => {
      userRepository.findByPlatformId.mockResolvedValue(null);
      createUser.execute.mockResolvedValue({
        success: false,
        data: null,
        message: "User creation failed",
      });

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(roleRepository.assignRoleToUser).not.toHaveBeenCalled();
    });
  });

  describe("syncUserRoles - existing user", () => {
    it("should add missing roles and remove extra roles", async () => {
      // Usuario existe
      userRepository.findByPlatformId.mockResolvedValue(mockUserEntity);

      // Usuario tem role-999 no BD (deve ser removido)
      const dbRole: RoleEntity = {
        ...mockRoleEntity,
        platformId: "role-999",
        name: "Old Role",
      };
      roleRepository.findByUserPlatformId.mockResolvedValue([dbRole]);

      // Novos cargos nao existem
      roleRepository.findByPlatformId.mockResolvedValue(null);
      roleRepository.create.mockResolvedValue(mockRoleEntity);
      roleRepository.assignRoleToUser.mockResolvedValue(true);
      roleRepository.removeRoleFromUser.mockResolvedValue(true);

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        added: 2,
        removed: 1,
        total: 2,
        isNewUser: false,
      });
      // Deve adicionar 2 novos cargos
      expect(roleRepository.assignRoleToUser).toHaveBeenCalledTimes(2);
      // Deve remover 1 cargo antigo
      expect(roleRepository.removeRoleFromUser).toHaveBeenCalledTimes(1);
      expect(roleRepository.removeRoleFromUser).toHaveBeenCalledWith(
        "role-999",
        "user-123",
      );
    });

    it("should do nothing if roles are in sync", async () => {
      // Usuario existe
      userRepository.findByPlatformId.mockResolvedValue(mockUserEntity);

      // Usuario ja tem os mesmos cargos
      const dbRoles: RoleEntity[] = [
        { ...mockRoleEntity, platformId: "role-123", name: "Test Role" },
        { ...mockRoleEntity, platformId: "role-456", name: "Another Role" },
      ];
      roleRepository.findByUserPlatformId.mockResolvedValue(dbRoles);

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        added: 0,
        removed: 0,
        total: 2,
        isNewUser: false,
      });
      expect(roleRepository.assignRoleToUser).not.toHaveBeenCalled();
      expect(roleRepository.removeRoleFromUser).not.toHaveBeenCalled();
      expect(createUser.execute).not.toHaveBeenCalled();
    });

    it("should only add missing roles when some exist", async () => {
      // Usuario existe
      userRepository.findByPlatformId.mockResolvedValue(mockUserEntity);

      // Usuario tem um dos cargos
      const dbRoles: RoleEntity[] = [
        { ...mockRoleEntity, platformId: "role-123", name: "Test Role" },
      ];
      roleRepository.findByUserPlatformId.mockResolvedValue(dbRoles);

      // Segundo cargo nao existe
      roleRepository.findByPlatformId.mockResolvedValue(null);
      roleRepository.create.mockResolvedValue(mockRoleEntity);
      roleRepository.assignRoleToUser.mockResolvedValue(true);

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(true);
      expect(result.data.added).toBe(1);
      expect(result.data.removed).toBe(0);
      expect(result.data.isNewUser).toBe(false);
      // Deve adicionar apenas 1 cargo faltante
      expect(roleRepository.assignRoleToUser).toHaveBeenCalledTimes(1);
      expect(roleRepository.removeRoleFromUser).not.toHaveBeenCalled();
    });
  });

  describe("syncUserRoles - error handling", () => {
    it("should return error on repository failure", async () => {
      userRepository.findByPlatformId.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await updateUserRole.syncUserRoles(mockSyncInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Database error");
      expect(logger.logToConsole).toHaveBeenCalled();
    });
  });
});
