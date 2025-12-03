import { AudioEventEntity } from "@domain/entities/AudioEvent";
import { ChannelEntity } from "@domain/entities/Channel";
import { UserEntity } from "@domain/entities/User";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContextStatus,
  LoggerContext,
  LoggerContextEntity,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { AudioEventRepository } from "@infra/repositories/AudioEventRepository";
import {
  mockDbAudioEventCreatedValue,
  mockAudioEventCreatePayload,
  mockDbAudioEventValue,
  mockAudioEventEntityValue,
  mockDbAudioEventUpdatedValue,
  mockAudioEventUpdatePayload,
} from "@tests/config/constants";
import { prismaMock } from "@tests/config/singleton";

describe("AudioEventRepository", () => {
  let audioEventRepository: AudioEventRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  let mockLogger: ILoggerService;

  beforeEach(() => {
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    audioEventRepository = new AudioEventRepository(
      prismaServiceMock,
      mockLogger,
    );
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new audio event", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue({
        id: 1,
        name: "ACTIVE",
        platform_id: mockAudioEventCreatePayload.statusId,
        created_at: new Date(),
      });

      prismaMock.audioEvent.create.mockResolvedValue(
        mockDbAudioEventCreatedValue,
      );
      const event = await audioEventRepository.create(
        mockAudioEventCreatePayload,
      );

      expect(prismaMock.eventStatus.findUnique).toHaveBeenCalledWith({
        where: { platform_id: mockAudioEventCreatePayload.statusId },
      });
      expect(prismaMock.audioEvent.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.create).toHaveBeenCalledWith({
        data: {
          platform_id: mockAudioEventCreatePayload.platformId,
          name: mockAudioEventCreatePayload.name,
          description: mockAudioEventCreatePayload.description,
          start_at: mockAudioEventCreatePayload.startAt,
          end_at: mockAudioEventCreatePayload.endAt,
          user_count: mockAudioEventCreatePayload.userCount,
          image: mockAudioEventCreatePayload.image,
          channel: {
            connect: {
              platform_id: mockAudioEventCreatePayload.channel.platformId,
            },
          },
          creator: {
            connect: {
              platform_id: mockAudioEventCreatePayload.creator.platformId,
            },
          },
          status: {
            connect: { platform_id: mockAudioEventCreatePayload.statusId },
          },
        },
        include: { channel: true, creator: true, status: true },
      });
      expect(event).toEqual(
        new AudioEventEntity(
          mockDbAudioEventCreatedValue.id,
          mockDbAudioEventCreatedValue.platform_id,
          mockDbAudioEventCreatedValue.name,
          mockDbAudioEventCreatedValue.status_id,
          mockDbAudioEventCreatedValue.start_at,
          mockDbAudioEventCreatedValue.end_at,
          mockDbAudioEventCreatedValue.user_count,
          mockDbAudioEventCreatedValue.created_at,
          mockDbAudioEventCreatedValue.description,
          mockDbAudioEventCreatedValue.image,
          ChannelEntity.fromPersistence(mockDbAudioEventCreatedValue.channel),
          UserEntity.fromPersistence(mockDbAudioEventCreatedValue.creator),
        ),
      );
    });

    it("should log an error and return null", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue(null);

      const event = await audioEventRepository.create(
        mockAudioEventCreatePayload,
      );
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `create | EventStatus with platform_id '${mockAudioEventCreatePayload.statusId}' not found`,
      );
      expect(event).toBeNull();
    });
  });

  describe("createMany", () => {
    it("should create multiple audio events and return the count", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue({
        id: 1,
        name: "ACTIVE",
        platform_id: mockAudioEventCreatePayload.statusId,
        created_at: new Date(),
      });

      const eventsData = [
        mockAudioEventCreatePayload,
        { ...mockAudioEventCreatePayload, name: "Another Event" },
      ];
      prismaMock.audioEvent.createMany.mockResolvedValue({ count: 2 });
      const count = await audioEventRepository.createMany(eventsData);

      expect(prismaMock.audioEvent.createMany).toHaveBeenCalledTimes(1);
      expect(count).toBe(2);
    });

    it("should log an error and return null if createMany fails", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue(null);

      const count = await audioEventRepository.createMany([
        mockAudioEventCreatePayload,
      ]);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `createMany | EventStatus with platform_id '${mockAudioEventCreatePayload.statusId}' not found`,
      );
      expect(count).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return an audio event by id", async () => {
      prismaMock.audioEvent.findUnique.mockResolvedValue(mockDbAudioEventValue);
      const event = await audioEventRepository.findById(1);

      expect(prismaMock.audioEvent.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: { channel: true, creator: true },
        }),
      );
      expect(event).toEqual(mockAudioEventEntityValue);
    });

    it("should return null if audio event not found", async () => {
      prismaMock.audioEvent.findUnique.mockResolvedValue(null);
      const event = await audioEventRepository.findById(99);
      expect(event).toBeNull();
    });
  });

  describe("listAll", () => {
    it("should return a list of audio events", async () => {
      const dbEvents = [
        mockDbAudioEventValue,
        { ...mockDbAudioEventValue, id: 2, name: "Event 2" },
      ];
      prismaMock.audioEvent.findMany.mockResolvedValue(dbEvents);
      const events = await audioEventRepository.listAll();

      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: {},
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });

    it("should filter by statusId if provided", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      await audioEventRepository.listAll({ statusId: "1" });
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { status_id: "1" },
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
    });
  });

  describe("findByChannelId", () => {
    it("should return audio events by channelId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByChannelId("101");
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { channel_id: "101" },
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("findByCreatorId", () => {
    it("should return audio events by creatorId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByCreatorId("202");
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { creator_id: "202" },
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("findByStatusId", () => {
    it("should return audio events by statusId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByStatusId("1");
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { status_id: "1" },
        orderBy: { start_at: "desc" },
        include: { channel: true, creator: true },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("updateById", () => {
    it("should update an audio event by id", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue({
        id: 1,
        name: "COMPLETED",
        platform_id: mockAudioEventUpdatePayload.statusId!,
        created_at: new Date(),
      });

      prismaMock.audioEvent.update.mockResolvedValue(
        mockDbAudioEventUpdatedValue,
      );
      const event = await audioEventRepository.updateById(
        1,
        mockAudioEventUpdatePayload,
      );

      expect(prismaMock.audioEvent.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          platform_id: mockAudioEventUpdatePayload.platformId,
          name: mockAudioEventUpdatePayload.name,
          user_count: mockAudioEventUpdatePayload.userCount,
          status: {
            connect: { platform_id: mockAudioEventUpdatePayload.statusId },
          },
        },
        include: { channel: true, creator: true },
      });
      expect(event?.name).toBe(mockAudioEventUpdatePayload.name);
      expect(event?.statusId).toBe(mockAudioEventUpdatePayload.statusId);
    });

    it("should log an error and return null if update fails", async () => {
      prismaMock.eventStatus.findUnique.mockResolvedValue(null);

      const event = await audioEventRepository.updateById(
        1,
        mockAudioEventUpdatePayload,
      );
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        `updateById | EventStatus with platform_id '${mockAudioEventUpdatePayload.statusId}' not found`,
      );
      expect(event).toBeNull();
    });
  });

  describe("deleteById", () => {
    it("should delete an audio event by id and return true", async () => {
      prismaMock.audioEvent.delete.mockResolvedValue(mockDbAudioEventValue); // Prisma delete returns the deleted record
      const result = await audioEventRepository.deleteById(1);

      expect(prismaMock.audioEvent.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(true);
    });

    it("should log an error and return false if deletion fails", async () => {
      prismaMock.audioEvent.delete.mockRejectedValue(new Error("DB error"));
      const result = await audioEventRepository.deleteById(1);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        "deleteById | DB error",
      );
      expect(result).toBe(false);
    });
  });
});
