import { Channel } from "@prisma/client";
import ChannelEntity from "../../domain/entities/Channel";
import IChannelRepository from "../../domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import ChannelRepository from "../../infrastructure/persistence/repositories/ChannelRepository";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { prismaMock } from "../config/singleton";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "../../domain/types/LoggerContextEnum";
// Mock data
const mockDbChannelValue: Channel = {
  id: 1,
  discord_id: "discord123",
  name: "Test Channel",
  url: "http://test.url",
  created_at: new Date("2024-01-01T00:00:00.000Z"),
};

const mockChannelEntityValue = new ChannelEntity(
  mockDbChannelValue.id,
  mockDbChannelValue.discord_id,
  mockDbChannelValue.name,
  mockDbChannelValue.url,
  mockDbChannelValue.created_at,
);

describe("ChannelRepository", () => {
  let channelRepository: IChannelRepository;
  let mockLogger: ILoggerService;
  let prismaServiceMock: PrismaService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    prismaServiceMock = new PrismaService(prismaMock);
    channelRepository = new ChannelRepository(prismaServiceMock, mockLogger);
  });

  describe("listAllAsync", () => {
    it("should return a list of channels when no limit is provided", async () => {
      (prismaMock.channel.findMany as jest.Mock).mockResolvedValue([mockDbChannelValue]);

      const result = await channelRepository.listAllAsync();

      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({ take: undefined });
      expect(result).toEqual([mockChannelEntityValue]);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should return a list of channels respecting the limit", async () => {
      (prismaMock.channel.findMany as jest.Mock).mockResolvedValue([mockDbChannelValue]);
      const limit = 5;

      const result = await channelRepository.listAllAsync(limit);

      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({ take: limit });
      expect(result).toEqual([mockChannelEntityValue]);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should return an empty array if no channels are found", async () => {
      (prismaMock.channel.findMany as jest.Mock).mockResolvedValue([]);

      const result = await channelRepository.listAllAsync();

      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({ take: undefined });
      expect(result).toEqual([]);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return undefined if Prisma call fails", async () => {
      const dbError = new Error("DB Error");
      (prismaMock.channel.findMany as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.listAllAsync();

      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({ take: undefined });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `listAll | ${dbError.message}`,
      );
      expect(result).toBeUndefined();
    });
  });

});
