import { UserEventEntity } from "@domain/entities/UserEvent";
import { UserEntity } from "@domain/entities/User";
import { ILoggerService } from "@domain/interfaces/services/ILogger";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { PrismaService } from "@infra/persistence/prisma/prismaService";
import { UserEventRepository } from "@infra/repositories/UserEventRepository";
import {
  mockDbUserEventCreatedValue,
  mockDbUserEventValue,
  mockUserEventCreatePayload,
  mockUserEventEntityValue,
} from "@tests/config/constants";
import { prismaMock } from "@tests/config/singleton";
import { EventType } from "@prisma/client";
import { AudioEventEntity } from "@entities/AudioEvent";

describe("UserEventRepository", () => {
  let userEventRepository: UserEventRepository;
  const prismaServiceMock = new PrismaService(prismaMock);
  let mockLogger: ILoggerService;

  beforeEach(() => {
    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };
    userEventRepository = new UserEventRepository(
      prismaServiceMock,
      mockLogger,
    );
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new user event", async () => {
      prismaMock.userEvent.create.mockResolvedValue(
        mockDbUserEventCreatedValue,
      );
      const event = await userEventRepository.create(
        mockUserEventCreatePayload,
      );

      expect(prismaMock.userEvent.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.userEvent.create).toHaveBeenCalledWith({
        data: {
          user_id: mockUserEventCreatePayload.user.platformId,
          event_id: mockUserEventCreatePayload.event.platformId,
          at: mockUserEventCreatePayload.at,
          type: mockUserEventCreatePayload.type,
        },
        include: { user: true, event: true },
      });
      expect(event).toEqual(
        new UserEventEntity(
          mockDbUserEventCreatedValue.id,
          mockDbUserEventCreatedValue.type,
          mockDbUserEventCreatedValue.at,
          UserEntity.fromPersistence(mockDbUserEventCreatedValue.user),
          AudioEventEntity.fromPersistence(mockDbUserEventCreatedValue.event),
        ),
      );
    });

    it("should log an error and return null if creation fails", async () => {
      prismaMock.userEvent.create.mockRejectedValue(new Error("DB error"));
      const event = await userEventRepository.create(
        mockUserEventCreatePayload,
      );
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        "create | DB error",
      );
      expect(event).toBeNull();
    });
  });

  describe("createMany", () => {
    it("should create multiple user events and return the count", async () => {
      const eventsData = [
        mockUserEventCreatePayload,
        { ...mockUserEventCreatePayload, type: EventType.LEFT },
      ];
      prismaMock.userEvent.createMany.mockResolvedValue({ count: 2 });
      const count = await userEventRepository.createMany(eventsData);

      expect(prismaMock.userEvent.createMany).toHaveBeenCalledTimes(1);
      expect(count).toBe(2);
    });

    it("should log an error and return null if createMany fails", async () => {
      prismaMock.userEvent.createMany.mockRejectedValue(new Error("DB error"));
      const count = await userEventRepository.createMany([
        mockUserEventCreatePayload,
      ]);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        "createMany | DB error",
      );
      expect(count).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return an user event by id", async () => {
      prismaMock.userEvent.findUnique.mockResolvedValue(mockDbUserEventValue);
      const event = await userEventRepository.findById(1);

      expect(prismaMock.userEvent.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.userEvent.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          include: { user: true, event: true },
        }),
      );
      expect(event).toEqual(mockUserEventEntityValue);
    });

    it("should return null if user event not found", async () => {
      prismaMock.userEvent.findUnique.mockResolvedValue(null);
      const event = await userEventRepository.findById(99);
      expect(event).toBeNull();
    });
  });

  describe("listAll", () => {
    it("should return a list of user events", async () => {
      const dbEvents = [
        mockDbUserEventValue,
        { ...mockDbUserEventValue, id: 2, type: EventType.LEFT },
      ];
      prismaMock.userEvent.findMany.mockResolvedValue(dbEvents);
      const events = await userEventRepository.listAll();

      expect(prismaMock.userEvent.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: {},
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual(mockUserEventEntityValue);
    });

    it("should filter by eventId if provided", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      await userEventRepository.listAll({ eventId: "1" });
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { event_id: "1" },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
    });

    it("should filter by userId if provided", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      await userEventRepository.listAll({ userId: "1234567890" });
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { user_id: "1234567890" },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
    });

    it("should filter by type if provided", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      await userEventRepository.listAll({ type: EventType.LEFT });
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { type: EventType.LEFT },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
    });

    it("should limit query when limit is provided", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      await userEventRepository.listAll({ limit: 99 });
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: 99,
        where: {},
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
    });
  });

  describe("findByEventId", () => {
    it("should return user events by eventId", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      const events = await userEventRepository.findByEventId("1");
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { event_id: "1" },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
      expect(events[0]).toEqual(mockUserEventEntityValue);
    });
  });

  describe("findByUserId", () => {
    it("should return user events by userId", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      const events = await userEventRepository.findByUserId("1234567890");
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { user_id: "1234567890" },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
      expect(events[0]).toEqual(mockUserEventEntityValue);
    });
  });

  describe("findByType", () => {
    it("should return user events by type", async () => {
      prismaMock.userEvent.findMany.mockResolvedValue([mockDbUserEventValue]);
      const events = await userEventRepository.findByType(EventType.JOINED);
      expect(prismaMock.userEvent.findMany).toHaveBeenCalledWith({
        take: undefined,
        where: { type: EventType.JOINED },
        orderBy: { at: "desc" },
        include: { user: true, event: true },
      });
      expect(events[0]).toEqual(mockUserEventEntityValue);
    });
  });

  describe("deleteById", () => {
    it("should delete an user event by id and return true", async () => {
      prismaMock.userEvent.delete.mockResolvedValue(mockDbUserEventValue); // Prisma delete returns the deleted record
      const result = await userEventRepository.deleteById(1);

      expect(prismaMock.userEvent.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.userEvent.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(true);
    });

    it("should log an error and return false if deletion fails", async () => {
      prismaMock.userEvent.delete.mockRejectedValue(new Error("DB error"));
      const result = await userEventRepository.deleteById(1);
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.REPOSITORY,
        LoggerContextEntity.USER_EVENT,
        "deleteById | DB error",
      );
      expect(result).toBe(false);
    });
  });
});
