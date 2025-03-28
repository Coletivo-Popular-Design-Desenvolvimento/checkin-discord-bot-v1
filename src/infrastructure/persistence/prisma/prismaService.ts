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
}
