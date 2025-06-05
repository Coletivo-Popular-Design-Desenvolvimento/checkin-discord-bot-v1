import { AudioEventEntity } from "@domain/entities/AudioEvent";
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
      prismaMock.audioEvent.create.mockResolvedValue(
        mockDbAudioEventCreatedValue,
      );
      const event = await audioEventRepository.create(
        mockAudioEventCreatePayload,
      );

      expect(prismaMock.audioEvent.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.create).toHaveBeenCalledWith({
        data: {
          channel_id: mockAudioEventCreatePayload.channelId,
          creator_id: mockAudioEventCreatePayload.creatorId,
          name: mockAudioEventCreatePayload.name,
          description: mockAudioEventCreatePayload.description,
          status_id: mockAudioEventCreatePayload.statusId,
          start_at: mockAudioEventCreatePayload.startAt,
          end_at: mockAudioEventCreatePayload.endAt,
          user_count: mockAudioEventCreatePayload.userCount,
          image: mockAudioEventCreatePayload.image,
        },
      });
      expect(event).toEqual(
        new AudioEventEntity(
          mockDbAudioEventCreatedValue.id,
          mockDbAudioEventCreatedValue.channel_id,
          mockDbAudioEventCreatedValue.creator_id,
          mockDbAudioEventCreatedValue.name,
          mockDbAudioEventCreatedValue.status_id,
          mockDbAudioEventCreatedValue.start_at,
          mockDbAudioEventCreatedValue.end_at,
          mockDbAudioEventCreatedValue.user_count,
          mockDbAudioEventCreatedValue.created_at,
          mockDbAudioEventCreatedValue.description,
          mockDbAudioEventCreatedValue.image,
        ),
      );
    });

    it("should log an error and return null if creation fails", async () => {
      prismaMock.audioEvent.create.mockRejectedValue(new Error("DB error"));
      const event = await audioEventRepository.create(
        mockAudioEventCreatePayload,
      );
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        "create | DB error",
      );
      expect(event).toBeNull();
    });
  });

  describe("createMany", () => {
    it("should create multiple audio events and return the count", async () => {
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
      prismaMock.audioEvent.createMany.mockRejectedValue(new Error("DB error"));
      const count = await audioEventRepository.createMany([
        mockAudioEventCreatePayload,
      ]);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        "createMany | DB error",
      );
      expect(count).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return an audio event by id", async () => {
      prismaMock.audioEvent.findUnique.mockResolvedValue(mockDbAudioEventValue);
      const event = await audioEventRepository.findById(1);

      expect(prismaMock.audioEvent.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.audioEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
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
      });
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });

    it("should filter by statusId if provided", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      await audioEventRepository.listAll({ statusId: 1 });
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { status_id: 1 },
        orderBy: { start_at: "desc" },
      });
    });
  });

  describe("findByChannelId", () => {
    it("should return audio events by channelId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByChannelId(101);
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { channel_id: 101 },
        orderBy: { start_at: "desc" },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("findByCreatorId", () => {
    it("should return audio events by creatorId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByCreatorId(202);
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { creator_id: 202 },
        orderBy: { start_at: "desc" },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("findByStatusId", () => {
    it("should return audio events by statusId", async () => {
      prismaMock.audioEvent.findMany.mockResolvedValue([mockDbAudioEventValue]);
      const events = await audioEventRepository.findByStatusId(1);
      expect(prismaMock.audioEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { status_id: 1 },
        orderBy: { start_at: "desc" },
      });
      expect(events[0]).toEqual(mockAudioEventEntityValue);
    });
  });

  describe("updateById", () => {
    it("should update an audio event by id", async () => {
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
          name: mockAudioEventUpdatePayload.name,
          status_id: mockAudioEventUpdatePayload.statusId,
          user_count: mockAudioEventUpdatePayload.userCount,
          // other fields should be undefined if not in payload
          channel_id: undefined,
          creator_id: undefined,
          description: undefined,
          start_at: undefined,
          end_at: undefined,
          image: undefined,
        },
      });
      expect(event?.name).toBe(mockAudioEventUpdatePayload.name);
      expect(event?.statusId).toBe(mockAudioEventUpdatePayload.statusId);
    });

    it("should log an error and return null if update fails", async () => {
      prismaMock.audioEvent.update.mockRejectedValue(new Error("DB error"));
      const event = await audioEventRepository.updateById(
        1,
        mockAudioEventUpdatePayload,
      );
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.AUDIO_EVENT,
        "updateById | DB error",
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
