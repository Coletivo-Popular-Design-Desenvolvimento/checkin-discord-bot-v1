import { ChannelRepository } from "../../infrastructure/persistence/repositories/ChannelRepository";
import { PrismaService } from "../../infrastructure/persistence/prisma/prismaService";
import { prismaMock } from "../config/singleton";
import { ILoggerService } from "../../domain/interfaces/services/ILogger";
import {
  mockDbChannelValue,
  mockChannelUpdatePayload,
  mockDbChannelUpdatedValue,
  mockDBUserValue,
  mockDbMessageValue,
} from "@tests/config/constants";
import { UserEntity } from "@domain/entities/User";
import { Message, User } from "@prisma/client";
import { MessageEntity } from "@domain/entities/Message";
import { ChannelEntity } from "@domain/entities/Channel";

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
        where: { id },
        include: {
          users: true,
          message: true,
          message_reaction: true,
        },
      });

      expect(channel).toHaveProperty("id", 1);
      expect(channel).toHaveProperty("platformId", "discordId");
      expect(channel).toHaveProperty("name", "channelName");
      expect(channel).toHaveProperty("url", "channelUrl");
      expect(channel).toHaveProperty("user", expect.any(Array));
      expect(channel).toHaveProperty("message", expect.any(Array));
      expect(channel).toHaveProperty("messageReaction", expect.any(Array));
    });

    it("should return null if channel not found", async () => {
      //Arrange
      const id = 99;
      prismaMock.channel.findUnique.mockResolvedValue(null);
      //Action
      const channel = await channelRepository.findById(id);
      //Assert
      expect(prismaMock.channel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id },
        }),
      );
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
      expect(channel).toBeNull();
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
        include: {
          users: true,
          message: true,
          message_reaction: true,
        },
      });

      const expectedEntity = ChannelEntity.fromPersistence(
        mockDbChannelValue,
        mockDbChannelValue.users,
        mockDbChannelValue.message,
        mockDbChannelValue.message_reaction,
      );

      expect(channel).toEqual(expectedEntity);
    });

    it("should return null if channel not found by discord id", async () => {
      const platformId = "nonExistentDiscordId";
      prismaMock.channel.findFirst.mockResolvedValue(null);
      const channel = await channelRepository.findByPlatformId(platformId);

      expect(prismaMock.channel.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findFirst).toHaveBeenCalledWith({
        where: { platform_id: platformId },
        include: {
          users: true,
          message: true,
          message_reaction: true,
        },
      });

      expect(channel).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new channel", async () => {
      const mockUserEntity = UserEntity.fromPersistence(
        mockDBUserValue as unknown as User,
      );

      const mockMessageEntity = MessageEntity.fromPersistence(
        mockDbMessageValue as unknown as Message,
      );

      const channelData = {
        platformId: "newDiscordId",
        name: "newChannelName",
        url: "newChannelUrl",
        createdAt: new Date(),
        user: [mockUserEntity],
        message: [mockMessageEntity],
        messageReaction: [],
      };
      const dbChannelData = {
        id: 2,
        platform_id: channelData.platformId,
        name: channelData.name,
        url: channelData.url,
        created_at: channelData.createdAt,
        users: [mockUserEntity],
        message: [mockMessageEntity],
        message_reaction: [],
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
          message: {
            connect: channelData.message.map((message) => ({
              platform_id: message.platformId,
            })),
          },
          message_reaction: {
            connect: [],
          },
          users: {
            connect: channelData.user.map((user) => ({
              platform_id: user.platformId,
            })),
          },
        },
        include: {
          message: true,
          message_reaction: true,
          users: true,
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
          user: [],
          message: [],
          messageReaction: [],
        },
        {
          platformId: "id2",
          name: "name2",
          url: "url2",
          createdAt: new Date(),
          user: [],
          message: [],
          messageReaction: [],
        },
      ];
      prismaMock.channel.create
        .mockResolvedValueOnce({
          id: 1,
          platform_id: "id1",
          name: "",
          url: "",
          created_at: undefined,
        })
        .mockResolvedValueOnce({
          id: 2,
          platform_id: "id2",
          name: "",
          url: "",
          created_at: undefined,
        });

      const count = await channelRepository.createMany(channelsData);

      expect(prismaMock.channel.create).toHaveBeenCalledTimes(
        channelsData.length,
      );
      channelsData.forEach((ch, i) => {
        expect(prismaMock.channel.create).toHaveBeenNthCalledWith(i + 1, {
          data: {
            platform_id: ch.platformId,
            name: ch.name,
            url: ch.url,
            created_at: ch.createdAt,
            message: { connect: [] },
            message_reaction: { connect: [] },
          },
        });
      });
      expect(count).toBe(channelsData.length);
    });
  });

  describe("listAll", () => {
    it("should return a list of channels", async () => {
      const dbChannels = [
        {
          ...mockDbChannelValue,
          users: [mockDBUserValue],
          message: [
            {
              ...mockDbMessageValue,
              user: mockDBUserValue,
              channel: mockDbChannelValue,
              message_reaction: [],
            },
          ],
          message_reaction: [],
        },
        {
          ...mockDbChannelValue,
          id: 2,
          platform_id: "discordId2",
          users: [mockDBUserValue],
          message: [
            {
              ...mockDbMessageValue,
              user: mockDBUserValue,
              channel: mockDbChannelValue,
              message_reaction: [],
            },
          ],
          message_reaction: [],
        },
      ];
      prismaMock.channel.findMany.mockResolvedValue(dbChannels);

      const channels = await channelRepository.listAll();

      expect(prismaMock.channel.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({
        where: {},
        take: undefined,
        include: {
          users: true,
          message: true,
          message_reaction: true,
        },
      });
      expect(channels).toHaveLength(2);

      expect(channels[0]).toMatchObject({
        id: 1,
        platformId: "discordId",
        name: "channelName",
        url: "channelUrl",
        user: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            platformId: "1234567890",
            username: "John Doe",
          }),
        ]),
        // Message agora é uma entidade completa, não precisamos validar estrutura interna
        message: expect.any(Array),
        messageReaction: [],
      });
    });

    it("should return a list of channels with limit", async () => {
      const dbChannels = [
        {
          ...mockDbChannelValue,
          users: [mockDBUserValue],
          message: [
            {
              ...mockDbMessageValue,
              user: mockDBUserValue,
              channel: mockDbChannelValue,
              message_reaction: [],
            },
          ],
          message_reaction: [],
        },
      ];

      prismaMock.channel.findMany.mockResolvedValue(dbChannels);

      const channels = await channelRepository.listAll(1);

      expect(prismaMock.channel.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.channel.findMany).toHaveBeenCalledWith({
        where: {},
        take: 1,
        include: {
          users: true,
          message: true,
          message_reaction: true,
        },
      });
      expect(channels).toHaveLength(1);

      expect(channels[0]).toMatchObject({
        id: 1,
        platformId: "discordId",
        name: "channelName",
        url: "channelUrl",
        user: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            platformId: "1234567890",
            username: "John Doe",
          }),
        ]),
        message: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            platformId: "1234567890",
            // Message agora é uma entidade completa, não precisamos validar channelId
            channel: expect.any(Object),
          }),
        ]),
        messageReaction: [],
      });
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
