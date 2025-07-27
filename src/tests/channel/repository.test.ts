import { ChannelRepository } from "../../infrastructure/persistence/repositories/ChannelRepository";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { prismaMock } from "../config/singleton";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  mockDbChannelValue,
  mockChannelEntityValue,
  mockChannelUpdatePayload,
  mockDbChannelUpdatedValue, mockDBUserValue,
} from "@tests/config/constants";
import {User} from "discord.js";

describe("ChannelRepository", () => {
  let channelRepository: ChannelRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  beforeAll(() => {
    const mockLogger: ILoggerService = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    mockLogger.logToConsole = jest.fn().mockImplementation((message) => {
      console.error(message);
    });
    channelRepository = new ChannelRepository(prismaServiceMock, mockLogger);
  });

  describe("findById", () => {
    it("should return channel by id", async () => {
      //Arrange
      const id = 1;
      prismaMock.channel.findUnique.mockResolvedValue(mockDbChannelValue);
      //Action
      const channel = await channelRepository.findById(id);
      //Assert
      expect(prismaMock.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findUnique).toHaveBeenCalledWith({
        where: {
          id,
        },
      });

      expect(channel).toHaveProperty("id", 1);
      expect(channel).toHaveProperty("platformId", "discordId");
      expect(channel).toHaveProperty("name", "channelName");
      expect(channel).toHaveProperty("url", "channelUrl");
      expect(channel).toHaveProperty("user", expect.any(Object));
      expect(channel).toHaveProperty("message", expect.any(Object));
      expect(channel).toHaveProperty("messageReactionEntity", expect.any(Object));
    });

    it("should return null if channel not found", async () => {
      //Arrange
      const id = 99;
      prismaMock.channel.findUnique.mockResolvedValue(null);
      //Action
      const channel = await channelRepository.findById(id);
      //Assert
      expect(prismaMock.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(channel).toBeNull();
    });

    it("should log an error if findById fails", async () => {
      const id = 1;
      prismaMock.channel.findUnique.mockRejectedValue(new Error("DB error"));
      const channel = await channelRepository.findById(id);
      expect(channelRepository["logger"].logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "REPOSITORY",
        "CHANNEL",
        "findById | DB error",
      );
      expect(channel).toBeUndefined(); // or null, depending on how you handle errors
    });
  });

  describe("findByPlatformId", () => {
    it("should return channel by discord id", async () => {
      const platformId = "discordId";
      prismaMock.channel.findFirst.mockResolvedValue(mockDbChannelValue);
      const channel = await channelRepository.findByPlatformId(platformId);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
      });
      expect(channel).toEqual(mockChannelEntityValue);
    });

    it("should return null if channel not found by discord id", async () => {
      const platformId = "nonExistentDiscordId";
      prismaMock.channel.findFirst.mockResolvedValue(null);
      const channel = await channelRepository.findByPlatformId(platformId);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
      });
      expect(channel).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new channel", async () => {
      const channelData = {
        platformId: "newDiscordId",
        name: "newChannelName",
        url: "newChannelUrl",
        createdAt: new Date(),
        user: mockDBUserValue,
        message: mockDBUserValue,
        user: mockDBUserValue
      };
      const dbChannelData = {
        id: 2,
        platform_id: channelData.platformId,
        name: channelData.name,
        url: channelData.url,
        created_at: channelData.createdAt,
        user: channelData.user,
        message: channelData.message,
        messageReactionEntity: channelData.messageReactionEntity
      };
      prismaMock.channel.create.mockResolvedValue(dbChannelData);

      const channel = await channelRepository.create(channelData);

      expect(prismaMock.channel.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.create).toHaveBeenCalledWith({
        data: {
          platform_id: channelData.platformId,
          name: channelData.name,
          url: channelData.url,
          created_at: channelData.createdAt,
        },
      });
      expect(channel).toHaveProperty("id", dbChannelData.id);
      expect(channel).toHaveProperty("platformId", channelData.platformId);
    });
  });

  describe("createMany", () => {
    it("should create multiple channels and return the count", async () => {
      const channelsData = [
        {
          platformId: "id1",
          name: "name1",
          url: "url1",
          createdAt: new Date(),
        },
        {
          platformId: "id2",
          name: "name2",
          url: "url2",
          createdAt: new Date(),
        },
      ];
      prismaMock.channel.createMany.mockResolvedValue({ count: 2 });

      const count = await channelRepository.createMany(channelsData);

      expect(prismaMock.channel.createMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.createMany).toHaveBeenCalledWith({
        data: channelsData.map((ch) => ({
          platform_id: ch.platformId,
          name: ch.name,
          url: ch.url,
          created_at: ch.createdAt,
        })),
        skipDuplicates: true,
      });
      expect(count).toBe(2);
    });
  });

  describe("listAll", () => {
    it("should return a list of channels", async () => {
      const dbChannels = [
        mockDbChannelValue,
        { ...mockDbChannelValue, id: 2, platform_id: "discordId2" },
      ];
      prismaMock.channel.findMany.mockResolvedValue(dbChannels);

      const channels = await channelRepository.listAll();

      expect(prismaMock.channel.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: {},
      });
      expect(channels).toHaveLength(2);
      expect(channels[0]).toEqual(mockChannelEntityValue);
    });

    it("should return a list of channels with limit", async () => {
      const dbChannels = [mockDbChannelValue];
      prismaMock.channel.findMany.mockResolvedValue(dbChannels);

      const channels = await channelRepository.listAll(1);

      expect(prismaMock.channel.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({
        take: 1,
        where: {},
      });
      expect(channels).toHaveLength(1);
      expect(channels[0]).toEqual(mockChannelEntityValue);
    });
  });

  describe("updateById", () => {
    it("should update a channel by id", async () => {
      const id = 1;

      prismaMock.channel.update.mockResolvedValue(mockDbChannelUpdatedValue);

      const channel = await channelRepository.updateById(
        id,
        mockChannelUpdatePayload,
      );

      expect(prismaMock.channel.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          name: mockChannelUpdatePayload.name,
          url: mockChannelUpdatePayload.url,
          // platform_id e created_at não devem ser enviados se não estiverem no payload parcial
        },
      });
      expect(channel).toHaveProperty("id", id);
      expect(channel).toHaveProperty("name", mockChannelUpdatePayload.name);
      expect(channel).toHaveProperty("url", mockChannelUpdatePayload.url);
    });

    it("should return null if channel to update is not found", async () => {
      const id = 99;
      prismaMock.channel.update.mockRejectedValue(
        new Error("Record to update not found."),
      ); // Prisma comum erro

      // Mock logger para verificar se o erro é logado
      const spyLogger = jest.spyOn(channelRepository["logger"], "logToConsole");

      const channel = await channelRepository.updateById(
        id,
        mockChannelUpdatePayload,
      );

      expect(prismaMock.channel.update).toHaveBeenCalledTimes(1);
      expect(channel).toBeUndefined(); // Ou null, dependendo da sua lógica de tratamento de erro no repositório
      expect(spyLogger).toHaveBeenCalled();
    });
  });

  describe("deleteById", () => {
    it("should delete a channel by id and return true", async () => {
      const id = 1;
      prismaMock.channel.delete.mockResolvedValue(mockDbChannelValue);

      const result = await channelRepository.deleteById(id);

      expect(prismaMock.channel.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toBe(true);
    });

    it("should return false if channel to delete is not found (or error occurs)", async () => {
      const id = 99;
      prismaMock.channel.delete.mockRejectedValue(
        new Error("Record to delete not found."),
      );
      const spyLogger = jest.spyOn(channelRepository["logger"], "logToConsole");

      const result = await channelRepository.deleteById(id);

      expect(prismaMock.channel.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined(); // Ou false, dependendo da sua lógica de tratamento de erro
      expect(spyLogger).toHaveBeenCalled();
    });
  });
});
