import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { PrismaClient } from "@prisma/client";

describe("PrismaService.isHealthy", () => {
  it("returns true when the database responds", async () => {
    const mockClient = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaClient;
    const service = new PrismaService(mockClient);

    await expect(service.isHealthy()).resolves.toBe(true);
  });

  it("returns false when the database throws", async () => {
    const mockClient = {
      $queryRaw: jest.fn().mockRejectedValue(new Error("connection refused")),
    } as unknown as PrismaClient;
    const service = new PrismaService(mockClient);

    await expect(service.isHealthy()).resolves.toBe(false);
  });
});
