import { ILoggerService } from "@services/ILogger";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { RoleRepository } from "@infra/repositories/RoleRepository";
import { mockDBRoleValue, mockDBUserValue } from "../config/constants";

describe("RoleRepository", () => {
  let roleRepository: RoleRepository;
  const mockLogger: ILoggerService = {
    logToConsole: jest.fn(),
    logToDatabase: jest.fn(),
  };

  beforeEach(async () => {
    roleRepository = new RoleRepository(
      new PrismaService(jestPrisma.client),
      mockLogger,
    );

    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message);
    });

    await jestPrisma.client.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
    await jestPrisma.client.$executeRaw`TRUNCATE TABLE UserRole`;
    await jestPrisma.client.$executeRaw`TRUNCATE TABLE role`;
    await jestPrisma.client.$executeRaw`TRUNCATE TABLE user`;
    await jestPrisma.client.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
  });

  describe("findById", () => {
    it("should return a role by id", async () => {
      const created = await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });

      const role = await roleRepository.findById(created.id);

      expect(role).toHaveProperty("id", created.id);
      expect(role).toHaveProperty("platformId", mockDBRoleValue.platform_id);
      expect(role).toHaveProperty("name", mockDBRoleValue.name);
      expect(role.createdAt).not.toBeNull();
      expect(role).toHaveProperty(
        "platformCreatedAt",
        mockDBRoleValue.platform_created_at,
      );
      expect(role).toHaveProperty("user", []);
    });

    it("should return null if role not found", async () => {
      const role = await roleRepository.findById(9999);

      expect(role).toBeNull();
    });

    it("should log an error", async () => {
      jest
        .spyOn(jestPrisma.client.role, "findUnique")
        .mockRejectedValueOnce(new Error());
      const spy = jest.spyOn(console, "error");

      const role = await roleRepository.findById(1);

      expect(spy).toHaveBeenCalledWith("ERROR");
      expect(role).toBeNull();
    });
  });

  describe("findByUserPlatformId", () => {
    it("should return roles for a user", async () => {
      await jestPrisma.client.user.create({
        data: {
          platform_id: mockDBUserValue.platform_id,
          username: mockDBUserValue.username,
          bot: mockDBUserValue.bot,
          status: mockDBUserValue.status,
        },
      });
      const created = await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });
      await jestPrisma.client.userRole.create({
        data: {
          user_platform_id: mockDBUserValue.platform_id,
          role_platform_id: mockDBRoleValue.platform_id,
        },
      });

      const roleArray = await roleRepository.findByUserPlatformId(
        mockDBUserValue.platform_id,
      );
      const role = roleArray[0];

      expect(role).toHaveProperty("id", created.id);
      expect(role).toHaveProperty("platformId", mockDBRoleValue.platform_id);
      expect(role).toHaveProperty("name", mockDBRoleValue.name);
      expect(role).toHaveProperty(
        "platformCreatedAt",
        mockDBRoleValue.platform_created_at,
      );
      expect(role.user).toHaveLength(1);
      expect(role.user[0]).toHaveProperty(
        "platformId",
        mockDBUserValue.platform_id,
      );
    });

    it("should return empty array if no roles found", async () => {
      const roles = await roleRepository.findByUserPlatformId("nonexistent-id");

      expect(roles).toHaveLength(0);
    });
  });

  describe("findByPlatformId", () => {
    it("should return a role by platform id", async () => {
      const created = await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });

      const role = await roleRepository.findByPlatformId(created.platform_id);

      expect(role).toHaveProperty("id", created.id);
      expect(role).toHaveProperty("platformId", mockDBRoleValue.platform_id);
      expect(role).toHaveProperty("name", mockDBRoleValue.name);
      expect(role).toHaveProperty(
        "platformCreatedAt",
        mockDBRoleValue.platform_created_at,
      );
      expect(role).toHaveProperty("user", []);
    });

    it("should return null if role not found", async () => {
      const role = await roleRepository.findByPlatformId("nonexistent-id");

      expect(role).toBeNull();
    });
  });

  describe("updateRole", () => {
    it("should update a role", async () => {
      const created = await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });

      const role = await roleRepository.updateById(created.id, {
        name: "updated-dev",
      });

      expect(role).toHaveProperty("id", created.id);
      expect(role).toHaveProperty("name", "updated-dev");
    });

    it("should throw an error if role not found", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      const result = await roleRepository.updateById(9999, { name: "dev" });

      expect(result).toBeNull();
      expect(spy).toHaveBeenCalledWith("ERROR");
    });
  });

  it("should bring all roles", async () => {
    await jestPrisma.client.role.create({
      data: {
        platform_id: mockDBRoleValue.platform_id,
        name: mockDBRoleValue.name,
        platform_created_at: mockDBRoleValue.platform_created_at,
      },
    });

    const roles = await roleRepository.listAll();

    expect(roles).toHaveLength(1);
    expect(roles[0]).toHaveProperty("platformId", mockDBRoleValue.platform_id);
  });

  it("should return no roles if database is empty", async () => {
    const roles = await roleRepository.listAll();

    expect(roles).toHaveLength(0);
  });

  describe("deleteRoleById", () => {
    it("should delete a role by id", async () => {
      const created = await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });

      const result = await roleRepository.deleteById(created.id);

      expect(result).toBe(true);
    });

    it("should throw an error", async () => {
      const spy = jest.spyOn(console, "error");

      const result = await roleRepository.deleteById(9999);

      expect(spy).toHaveBeenCalledWith("ERROR");
      expect(result).toBe(false);
    });
  });

  describe("create", () => {
    it("should create a role", async () => {
      const roleInput = {
        platformId: mockDBRoleValue.platform_id,
        name: mockDBRoleValue.name,
        platformCreatedAt: mockDBRoleValue.platform_created_at,
      };

      const role = await roleRepository.create(roleInput);

      expect(role).toHaveProperty("platformId", roleInput.platformId);
      expect(role).toHaveProperty("name", roleInput.name);
    });

    it("should throw an error on create failure", async () => {
      jest
        .spyOn(jestPrisma.client.role, "create")
        .mockRejectedValueOnce(new Error("Create failed"));
      const spy = jest.spyOn(console, "error");

      await expect(
        roleRepository.create({
          platformId: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platformCreatedAt: mockDBRoleValue.platform_created_at,
        }),
      ).rejects.toThrow();
      expect(spy).toHaveBeenCalledWith("ERROR");
    });
  });

  describe("assignRoleToUser", () => {
    it("should assign a role to a user", async () => {
      await jestPrisma.client.user.create({
        data: {
          platform_id: mockDBUserValue.platform_id,
          username: mockDBUserValue.username,
          bot: mockDBUserValue.bot,
          status: mockDBUserValue.status,
        },
      });
      await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });

      const result = await roleRepository.assignRoleToUser(
        mockDBRoleValue.platform_id,
        mockDBUserValue.platform_id,
      );

      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      const spy = jest.spyOn(console, "error");

      const result = await roleRepository.assignRoleToUser(
        "nonexistent-role",
        mockDBUserValue.platform_id,
      );

      expect(spy).toHaveBeenCalledWith("ERROR");
      expect(result).toBe(false);
    });
  });

  describe("removeRoleFromUser", () => {
    it("should remove a role from a user", async () => {
      await jestPrisma.client.user.create({
        data: {
          platform_id: mockDBUserValue.platform_id,
          username: mockDBUserValue.username,
          bot: mockDBUserValue.bot,
          status: mockDBUserValue.status,
        },
      });
      await jestPrisma.client.role.create({
        data: {
          platform_id: mockDBRoleValue.platform_id,
          name: mockDBRoleValue.name,
          platform_created_at: mockDBRoleValue.platform_created_at,
        },
      });
      await jestPrisma.client.userRole.create({
        data: {
          user_platform_id: mockDBUserValue.platform_id,
          role_platform_id: mockDBRoleValue.platform_id,
        },
      });

      const result = await roleRepository.removeRoleFromUser(
        mockDBRoleValue.platform_id,
        mockDBUserValue.platform_id,
      );

      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      const spy = jest.spyOn(console, "error");

      const result = await roleRepository.removeRoleFromUser(
        "nonexistent-role",
        mockDBUserValue.platform_id,
      );

      expect(spy).toHaveBeenCalledWith("ERROR");
      expect(result).toBe(false);
    });
  });
});
