import { FinalizeVoiceEvent } from "@domain/useCases/audioEvent/FinalizeVoiceEvent";
import { IAudioEventRepository } from "@repositories/IAudioEventRepository";
import { ILoggerService } from "@services/ILogger";
import { AudioEventEntity } from "@entities/AudioEvent";
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { UserStatus } from "@type/UserStatusEnum";

describe("FinalizeVoiceEvent", () => {
  let finalizeVoiceEvent: FinalizeVoiceEvent;
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

  const mockFinalizedAudioEvent = new AudioEventEntity(
    1,
    "event123",
    "Test Voice Event",
    "completed",
    new Date(),
    new Date(),
    3,
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

    finalizeVoiceEvent = new FinalizeVoiceEvent(
      mockAudioEventRepository,
      mockLogger,
    );
  });

  describe("execute", () => {
    it("should successfully finalize a voice event", async () => {
      const input = {
        platformId: "event123",
        endAt: new Date(),
        userCount: 3,
      };

      mockAudioEventRepository.listAll.mockResolvedValue([mockAudioEvent]);
      mockAudioEventRepository.updateById.mockResolvedValue(mockFinalizedAudioEvent);

      const result = await finalizeVoiceEvent.execute(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFinalizedAudioEvent);
      expect(mockAudioEventRepository.listAll).toHaveBeenCalledWith({ limit: 100 });
      expect(mockAudioEventRepository.updateById).toHaveBeenCalledWith(1, {
        endAt: input.endAt,
        userCount: input.userCount,
        statusId: "completed",
      });
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "USECASE",
        "AUDIO_EVENT",
        "Voice event finalized successfully: Test Voice Event",
      );
    });

    it("should return error when event is not found", async () => {
      const input = {
        platformId: "nonexistent",
        endAt: new Date(),
        userCount: 3,
      };

      mockAudioEventRepository.listAll.mockResolvedValue([]);

      const result = await finalizeVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Event not found");
    });

    it("should return error when repository update fails", async () => {
      const input = {
        platformId: "event123",
        endAt: new Date(),
        userCount: 3,
      };

      mockAudioEventRepository.listAll.mockResolvedValue([mockAudioEvent]);
      mockAudioEventRepository.updateById.mockResolvedValue(null);

      const result = await finalizeVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });

    it("should handle repository errors and log them", async () => {
      const input = {
        platformId: "event123",
        endAt: new Date(),
        userCount: 3,
      };

      const error = new Error("Database connection failed");
      mockAudioEventRepository.listAll.mockRejectedValue(error);

      const result = await finalizeVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Database connection failed");
      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "USECASE",
        "AUDIO_EVENT",
        "finalizeVoiceEvent.execute | Database connection failed",
      );
    });

    it("should handle unknown errors gracefully", async () => {
      const input = {
        platformId: "event123",
        endAt: new Date(),
        userCount: 3,
      };

      const error = "Unknown error type";
      mockAudioEventRepository.listAll.mockRejectedValue(error);

      const result = await finalizeVoiceEvent.execute(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe("Unknown error occurred");
    });
  });
});
