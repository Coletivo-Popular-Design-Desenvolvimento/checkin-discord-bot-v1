import { VoiceEventService } from "@application/services/VoiceEventService";
import { IRegisterVoiceEvent } from "@interfaces/useCases/audioEvent/IRegisterVoiceEvent";
import { IFinalizeVoiceEvent } from "@interfaces/useCases/audioEvent/IFinalizeVoiceEvent";
import { ILoggerService } from "@services/ILogger";
import { AudioEventEntity } from "@entities/AudioEvent";
import { ChannelEntity } from "@entities/Channel";
import { UserEntity } from "@entities/User";
import { UserStatus } from "@type/UserStatusEnum";
import { DiscordEventStatus } from "@type/DiscordEventTypes";

describe("VoiceEventService", () => {
  let voiceEventService: VoiceEventService;
  let mockRegisterVoiceEvent: jest.Mocked<IRegisterVoiceEvent>;
  let mockFinalizeVoiceEvent: jest.Mocked<IFinalizeVoiceEvent>;
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
    mockRegisterVoiceEvent = {
      execute: jest.fn(),
    };

    mockFinalizeVoiceEvent = {
      execute: jest.fn(),
    };

    mockLogger = {
      logToConsole: jest.fn(),
      logToDatabase: jest.fn(),
    };

    voiceEventService = new VoiceEventService(
      mockRegisterVoiceEvent,
      mockFinalizeVoiceEvent,
      mockLogger,
    );
  });

  describe("handleVoiceEventStarted", () => {
    it("should successfully handle voice event started", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "ACTIVE" as DiscordEventStatus,
        scheduledStartAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
        description: "Test description",
        image: "test-image.jpg",
      };

      mockRegisterVoiceEvent.execute.mockResolvedValue({
        success: true,
        data: mockAudioEvent,
      });

      await voiceEventService.handleVoiceEventStarted(mockEvent);

      expect(mockRegisterVoiceEvent.execute).toHaveBeenCalledWith({
        platformId: "event123",
        name: "Test Voice Event",
        statusId: "active",
        startAt: mockEvent.scheduledStartAt,
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
        description: "Test description",
        image: "test-image.jpg",
      });

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "SERVICE",
        "AUDIO_EVENT",
        "Voice event started detected: Test Voice Event",
      );
    });

    it("should handle registration failure", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "ACTIVE" as DiscordEventStatus,
        scheduledStartAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
      };

      mockRegisterVoiceEvent.execute.mockResolvedValue({
        success: false,
        data: null,
        message: "Registration failed",
      });

      await voiceEventService.handleVoiceEventStarted(mockEvent);

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "SERVICE",
        "AUDIO_EVENT",
        "Failed to register voice event: Registration failed",
      );
    });
  });

  describe("handleVoiceEventEnded", () => {
    it("should successfully handle voice event ended", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "COMPLETED" as DiscordEventStatus,
        scheduledEndAt: new Date(),
        userCount: 3,
      };

      mockFinalizeVoiceEvent.execute.mockResolvedValue({
        success: true,
        data: mockAudioEvent,
      });

      await voiceEventService.handleVoiceEventEnded(mockEvent);

      expect(mockFinalizeVoiceEvent.execute).toHaveBeenCalledWith({
        platformId: "event123",
        endAt: mockEvent.scheduledEndAt,
        userCount: 3,
      });

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "SERVICE",
        "AUDIO_EVENT",
        "Voice event ended detected: Test Voice Event",
      );
    });

    it("should handle finalization failure", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "COMPLETED" as DiscordEventStatus,
        scheduledEndAt: new Date(),
        userCount: 3,
      };

      mockFinalizeVoiceEvent.execute.mockResolvedValue({
        success: false,
        data: null,
        message: "Finalization failed",
      });

      await voiceEventService.handleVoiceEventEnded(mockEvent);

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "ERROR",
        "SERVICE",
        "AUDIO_EVENT",
        "Failed to finalize voice event: Finalization failed",
      );
    });
  });

  describe("processVoiceEvent", () => {
    it("should process active voice event", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "ACTIVE" as DiscordEventStatus,
        scheduledStartAt: new Date(),
        userCount: 5,
        channelId: "channel123",
        creatorId: "user123",
      };

      mockRegisterVoiceEvent.execute.mockResolvedValue({
        success: true,
        data: mockAudioEvent,
      });

      await voiceEventService.processVoiceEvent(mockEvent);

      expect(mockRegisterVoiceEvent.execute).toHaveBeenCalled();
    });

    it("should process completed voice event", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "COMPLETED" as DiscordEventStatus,
        scheduledEndAt: new Date(),
        userCount: 3,
      };

      mockFinalizeVoiceEvent.execute.mockResolvedValue({
        success: true,
        data: mockAudioEvent,
      });

      await voiceEventService.processVoiceEvent(mockEvent);

      expect(mockFinalizeVoiceEvent.execute).toHaveBeenCalled();
    });

    it("should handle other status changes", async () => {
      const mockEvent = {
        id: "event123",
        name: "Test Voice Event",
        status: "SCHEDULED" as DiscordEventStatus,
        scheduledStartAt: new Date(),
      };

      await voiceEventService.processVoiceEvent(mockEvent);

      expect(mockLogger.logToConsole).toHaveBeenCalledWith(
        "SUCCESS",
        "SERVICE",
        "AUDIO_EVENT",
        "Voice event status change detected: Test Voice Event - SCHEDULED",
      );
    });
  });
});
