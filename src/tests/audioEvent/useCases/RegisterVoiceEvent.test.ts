import { RegisterVoiceEvent } from "@domain/useCases/audioEvent/RegisterVoiceEvent";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ILoggerService } from "@services/ILogger";
import { AudioEventEntity } from "@entities/AudioEvent";
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { UserStatus } from "@type/UserStatusEnum";

describe("RegisterVoiceEvent", () => {
  let registerVoiceEvent: RegisterVoiceEvent;
  let mockAudioEventRepository: jest.Mocked<IAudioEventRepository>;
  let mockLogger: jest.Mocked<ILoggerService>;

  const mockChannel = new ChannelEntity(
    1,
    "channel123",
    "Test Channel",
    "voice",
    new Date(),
  );

  const mockUser = new UserEntity(
    1,
    "user123",
    "Test User",
    false,
    UserStatus.ACTIVE,
  );

  const mockAudioEvent = new AudioEventEntity(
    1,
    "event123",
    "Test Voice Event",
    "active",
    new Date(),
    undefined,
    5,
    new Date(),
    "Test description",
    undefined,
    mockChannel,
    mockUser,
  );

  beforeEach(() => {
    mockAudioEventRepository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findById: jest.fn(),
      listAll: jest.fn(),
      findByChannelId: jest.fn(),
      findByCreatorId: jest.fn(),
      findByStatusId: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    registerVoiceEvent = new RegisterVoiceEvent(
      mockAudioEventRepository,
      mockLogger,
    );
  });

  describe("execute", () => {
    it("should successfully register a voice event", async () => {
      const input = {
        platformId: "event123",
        name: "Test Voice Event",
        statusId: "active",
        startAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
        description: "Test description",
      };

      mockAudioEventRepository.create.mockResolvedValue(mockAudioEvent);

      const result = await registerVoiceEvent.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAudioEvent);
      expect(mockAudioEventRepository.create).toHaveBeenCalledWith({
        platformId: input.platformId,
        name: input.name,
        statusId: input.statusId,
        startAt: input.startAt,
        endAt: undefined,
        userCount: input.userCount,
        channel: expect.objectContaining({
          platformId: input.channelId,
          id: 0,
          name: "",
          url: "",
        }),
        creator: expect.objectContaining({
          platformId: input.creatorId,
          id: 0,
          username: "",
          bot: false,
          status: UserStatus.ACTIVE,
        }),
        description: input.description,
        image: undefined,
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "USECASE",
        "AUDIO_EVENT",
        "Voice event registered successfully: Test Voice Event",
      );
    });

    it("should return error when repository creation fails", async () => {
      const input = {
        platformId: "event123",
        name: "Test Voice Event",
        statusId: "active",
        startAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
      };

      mockAudioEventRepository.create.mockResolvedValue(null);

      const result = await registerVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });

    it("should handle repository errors and log them", async () => {
      const input = {
        platformId: "event123",
        name: "Test Voice Event",
        statusId: "active",
        startAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
      };

      const error = new Error("Database connection failed");
      mockAudioEventRepository.create.mockRejectedValue(error);

      const result = await registerVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Database connection failed");
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "USECASE",
        "AUDIO_EVENT",
        "registerVoiceEvent.execute | Database connection failed",
      );
    });

    it("should handle unknown errors gracefully", async () => {
      const input = {
        platformId: "event123",
        name: "Test Voice Event",
        statusId: "active",
        startAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
      };

      const error = "Unknown error type";
      mockAudioEventRepository.create.mockRejectedValue(error);

      const result = await registerVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });
  });
});
