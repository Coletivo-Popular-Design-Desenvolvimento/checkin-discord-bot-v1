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
    });    it("should log error and return empty array if Prisma call fails", async () => {
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
      expect(result).toEqual([]);
    });
  });

  describe("findByIdAsync", () => {
    it("should return a channel entity if found by id", async () => {
      (prismaMock.channel.findFirst as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.findByIdAsync(1);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockChannelEntityValue);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should return null if channel is not found by id", async () => {
      (prismaMock.channel.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await channelRepository.findByIdAsync(99);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(result).toBeNull();
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma call fails", async () => {
      const dbError = new Error("DB Error");
      (prismaMock.channel.findFirst as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.findByIdAsync(1);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findById | ${dbError.message}`,
      );
      expect(result).toBeNull();
    });
  });

  describe("findByDiscordIdAsync", () => {
    it("should return a channel entity if found by discord id", async () => {
      (prismaMock.channel.findFirst as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.findByDiscordIdAsync("discord123");

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ 
        where: { discord_id: "discord123" } 
      });
      expect(result).toEqual(mockChannelEntityValue);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should return null if channel is not found by discord id", async () => {
      (prismaMock.channel.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await channelRepository.findByDiscordIdAsync("nonexistent");

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ 
        where: { discord_id: "nonexistent" } 
      });
      expect(result).toBeNull();
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma call fails", async () => {
      const dbError = new Error("DB Error");
      (prismaMock.channel.findFirst as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.findByDiscordIdAsync("discord123");

      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({ 
        where: { discord_id: "discord123" } 
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `findByDiscordId | ${dbError.message}`,
      );
      expect(result).toBeNull();
    });  });
  describe("createAsync", () => {
    it("should create a new channel and return the entity", async () => {
      const createChannelDto: Omit<ChannelEntity, "id"> = {
        name: "general",
        discordId: "discord123",
        url: "http://test.url",
        createAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      (prismaMock.channel.create as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.createAsync(createChannelDto);

      expect(prismaMock.channel.create).toHaveBeenCalledWith({
        data: {
          name: "general",
          discord_id: "discord123",
          url: "http://test.url",
          created_at: new Date("2024-01-01T00:00:00.000Z"),
        }
      });      expect(result).toEqual(mockChannelEntityValue);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma create fails", async () => {
      const createChannelDto: Omit<ChannelEntity, "id"> = {
        name: "general",
        discordId: "discord123",
        url: "http://test.url",
        createAt: new Date("2024-01-01T00:00:00.000Z"),
      };
      const dbError = new Error("Create Error");
      (prismaMock.channel.create as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.createAsync(createChannelDto);

      expect(prismaMock.channel.create).toHaveBeenCalledWith({
        data: {
          name: "general",
          discord_id: "discord123",
          url: "http://test.url",
          created_at: new Date("2024-01-01T00:00:00.000Z"),
        }
      });      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `create | ${dbError.message}`,
      );
      expect(result).toBeNull();
    });
  });
  describe("createManyAsync", () => {
    it("should create multiple channels and return count", async () => {
      const createChannelDtos: Omit<ChannelEntity, "id">[] = [
        {
          name: "general",
          discordId: "discord123",
          url: "http://test.url",
          createAt: new Date("2024-01-01T00:00:00.000Z"),
        },
        {
          name: "random",
          discordId: "discord456",
          url: "http://test2.url",
          createAt: new Date("2024-01-01T00:00:00.000Z"),
        }
      ];

      (prismaMock.channel.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await channelRepository.createManyAsync(createChannelDtos);      expect(prismaMock.channel.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: "general",
            discord_id: "discord123",
            url: "http://test.url",
            created_at: new Date("2024-01-01T00:00:00.000Z"),
          },
          {
            name: "random",
            discord_id: "discord456",
            url: "http://test2.url",
            created_at: new Date("2024-01-01T00:00:00.000Z"),
          }
        ],
        skipDuplicates: true,
      });
      expect(result).toBe(2);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma createMany fails", async () => {
      const createChannelDtos: Omit<ChannelEntity, "id">[] = [
        {
          name: "general",
          discordId: "discord123",
          url: "http://test.url",
          createAt: new Date("2024-01-01T00:00:00.000Z"),
        }
      ];
      const dbError = new Error("CreateMany Error");
      (prismaMock.channel.createMany as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.createManyAsync(createChannelDtos);

      expect(prismaMock.channel.createMany).toHaveBeenCalledWith({
        data: [
          {
            name: "general",
            discord_id: "discord123",
            url: "http://test.url",
            created_at: new Date("2024-01-01T00:00:00.000Z"),
          }
        ],
        skipDuplicates: true,
      });      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `createMany | ${dbError.message}`,
      );
      expect(result).toBeNull();
    });
  });
  describe("updateAsync", () => {
    it("should update an existing channel and return the entity", async () => {
      const updateChannelDto: Partial<ChannelEntity> = {
        name: "updated-general",
      };

      (prismaMock.channel.update as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.updateAsync(1, updateChannelDto);

      expect(prismaMock.channel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "updated-general",
          discord_id: undefined,
          url: undefined,
          created_at: undefined,
        }
      });
      expect(result).toBeUndefined();
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should handle partial updates correctly", async () => {
      const updateChannelDto: Partial<ChannelEntity> = {
        discordId: "new-discord-id",
      };

      (prismaMock.channel.update as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.updateAsync(1, updateChannelDto);

      expect(prismaMock.channel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: undefined,
          discord_id: "new-discord-id",
          url: undefined,
          created_at: undefined,
        }
      });
      expect(result).toBeUndefined();
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma update fails", async () => {
      const updateChannelDto: Partial<ChannelEntity> = {
        name: "updated-general",
      };
      const dbError = new Error("Update Error");
      (prismaMock.channel.update as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.updateAsync(1, updateChannelDto);

      expect(prismaMock.channel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: "updated-general",
          discord_id: undefined,
          url: undefined,
          created_at: undefined,
        }
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `update | ${dbError.message}`,
      );
      expect(result).toBeUndefined();
    });
  });

  describe("deleteAsync", () => {
    it("should delete a channel and return the entity", async () => {
      (prismaMock.channel.delete as jest.Mock).mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.deleteAsync(1);

      expect(prismaMock.channel.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockChannelEntityValue);
      expect(mockLogger.logToConsole).not.toHaveBeenCalled();
    });

    it("should log error and return null if Prisma delete fails", async () => {
      const dbError = new Error("Delete Error");
      (prismaMock.channel.delete as jest.Mock).mockRejectedValue(dbError);

      const result = await channelRepository.deleteAsync(1);

      expect(prismaMock.channel.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.CHANNEL,
        `delete | ${dbError.message}`,
      );
      expect(result).toBeNull();
    });
  });

});
