import { ILoggerService } from "@services/ILogger";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { RoleRepository } from "@infra/repositories/RoleRepository";
import { mockDBRoleValue } from "../config/constants";
import { prismaMock } from "../config/singleton";
import { PrismaMapper } from "@infra/repositories/PrismaMapper";

describe("RoleRepository", () => {
  let roleRepository: RoleRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  beforeAll(() => {
    const mockLogger: ILoggerService = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    mockLogger.logToConsole = jest.fn().mockImplementation(() => {
      console.error("ERROR"); // Simulate logging to console.error
    });
    roleRepository = new RoleRepository(prismaServiceMock, mockLogger);
  });

  describe("findById", () => {
    it("should return a role by id", async () => {
      // Bloco de Arrange
      prismaMock.role.findUnique.mockResolvedValue(mockDBRoleValue);

      // Action
      const role = await roleRepository.findById(mockDBRoleValue.id);

      // Assert
      expect(prismaMock.role.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
        where: { id: mockDBRoleValue.id },
        include: { users: true },
      });

      expect(role).toHaveProperty("id", 1);
      expect(role).toHaveProperty("platformId", "1");
      expect(role).toHaveProperty("name", "dev");
      expect(role).toHaveProperty("createdAt", new Date("2025-01-01"));
      expect(role).toHaveProperty("platformCreatedAt", new Date("2025-01-01"));
      expect(role).toHaveProperty(
        "user",
        mockDBRoleValue.users.map((user) => PrismaMapper.toUserEntity(user)),
      );
    });

    it("should return null if user not found", async () => {
      // Arrange
      const id = mockDBRoleValue.id;

      prismaMock.role.findUnique.mockResolvedValue(null);
      // Action
      const role = await roleRepository.findById(id);
      // Assert
      expect(prismaMock.role.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
        where: { id: mockDBRoleValue.id },
        include: { users: true },
      });

      expect(role).toBeUndefined();
    });

    it("should log an error", async () => {
      prismaMock.role.findUnique.mockRejectedValue(new Error());
      const spy = jest.spyOn(console, "error");

      await roleRepository.findById(mockDBRoleValue.id);

      expect(spy).toHaveBeenCalledWith("ERROR");
    });
  });

  //findByUserRolePlatformId
  describe("findByUserPlatformId", () => {
    it("shoud return a role id", async () => {
      const roleData = [mockDBRoleValue];
      prismaMock.role.findMany.mockResolvedValue(roleData);
      const roleArray = await roleRepository.findByUserPlatformId(
        mockDBRoleValue.platform_id,
      );
      const role = roleArray[0];
      expect(role).toHaveProperty("id", 1);
      expect(role).toHaveProperty("platformId", "1");
      expect(role).toHaveProperty("name", "dev");
      expect(role).toHaveProperty("createdAt", new Date("2025-01-01"));
      expect(role).toHaveProperty("platformCreatedAt", new Date("2025-01-01"));
      expect(role).toHaveProperty(
        "user",
        mockDBRoleValue.users.map((user) => PrismaMapper.toUserEntity(user)),
      );
    });
    it("should return null if role not found", async () => {
      const platform_id = mockDBRoleValue.platform_id;
      prismaMock.role.findMany.mockResolvedValue(null);

      const role = await roleRepository.findByUserPlatformId(platform_id);

      expect(prismaMock.role.findMany).toHaveBeenCalledTimes(1);
      expect(role).toBeUndefined();
    });
  });

  describe("findByPlatformId", () => {
    it("shoud return a role by platform id", async () => {
      const platform_id = mockDBRoleValue.platform_id;
      prismaMock.role.findUnique.mockResolvedValue(mockDBRoleValue);

      const role = await roleRepository.findByPlatformId(platform_id);
      expect(prismaMock.role.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
        where: { platform_id: mockDBRoleValue.platform_id },
        include: { users: true },
      });
      expect(role).toHaveProperty("id", 1);
      expect(role).toHaveProperty("platformId", "1");
      expect(role).toHaveProperty("name", "dev");
      expect(role).toHaveProperty("createdAt", new Date("2025-01-01"));
      expect(role).toHaveProperty("platformCreatedAt", new Date("2025-01-01"));
      expect(role).toHaveProperty(
        "user",
        mockDBRoleValue.users.map((user) => PrismaMapper.toUserEntity(user)),
      );
    });
    it("should return null if role not found", async () => {
      const platform_id = mockDBRoleValue.platform_id;
      prismaMock.role.findUnique.mockResolvedValue(null);

      const role = await roleRepository.findByPlatformId(platform_id);

      expect(prismaMock.role.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
        where: { platform_id: platform_id },
        include: { users: true },
      });
      expect(role).toBeUndefined();
    });
  });

  describe("updateRole", () => {
    it("should update a role", async () => {
      const roleData = {
        name: "dev",
      };
      prismaMock.role.update.mockResolvedValue(mockDBRoleValue);

      const role = await roleRepository.updateById(1, roleData);

      expect(prismaMock.role.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: roleData,
        }),
      );
      expect(role).toHaveProperty("id", 1);
      expect(role).toHaveProperty("name", "dev");
    });

    it("should throw an error if role not found", async () => {
      const id = 1;
      const roleData = {
        name: "dev",
      };

      prismaMock.user.update.mockRejectedValue(new Error());
      await roleRepository.updateById(id, roleData);

      expect(prismaMock.role.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: roleData,
        }),
      );
    });
  });

  it("should bring all roles", async () => {
    prismaMock.role.findMany.mockResolvedValue([mockDBRoleValue]);

    const role = await roleRepository.listAll();

    expect(prismaMock.role.findMany).toHaveBeenCalledTimes(1);

    expect(role.length).toBeGreaterThan(0);
    expect(role[0]).toHaveProperty("id", 1);
    expect(role[0]).toHaveProperty("platformId", "1");
  });

  it("should return no roles if database is empty", async () => {
    prismaMock.role.findMany.mockResolvedValue([]);

    const role = await roleRepository.listAll();

    expect(prismaMock.role.findMany).toHaveBeenCalledTimes(1);

    expect(role).toHaveLength(0);
  });

  describe("deleteRoleById", () => {
    it("should delete a role by id", async () => {
      prismaMock.role.delete.mockResolvedValue(mockDBRoleValue);

      const role = await roleRepository.deleteById(mockDBRoleValue.id);

      expect(prismaMock.role.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.delete).toHaveBeenCalledWith({
        where: { id: mockDBRoleValue.id },
      });

      expect(role).toBe(role);
    });

    it("should throw an error", async () => {
      prismaMock.role.delete.mockRejectedValue(new Error());
      const spy = jest.spyOn(console, "error");

      await roleRepository.deleteById(mockDBRoleValue.id);

      expect(spy).toHaveBeenCalledWith("ERROR");

      expect(prismaMock.role.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.role.delete).toHaveBeenCalledWith({
        where: { id: mockDBRoleValue.id },
      });
    });
  });
});
