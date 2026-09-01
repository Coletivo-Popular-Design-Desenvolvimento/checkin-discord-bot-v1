import { PrismaClient } from "@prisma/client";

export class PrismaService {
  private client: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.client = prisma;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  public async isHealthy(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
