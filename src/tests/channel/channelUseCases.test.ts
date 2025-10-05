import { ILoggerService } from "@domain/interfaces/services/ILogger";
import { ErrorMessages } from "@domain/types/ErrorMessages";
import {
  LoggerContext,
  LoggerContextEntity,
  LoggerContextStatus,
} from "@domain/types/LoggerContextEnum";
import { CreateChannel } from "@domain/useCases/channel/CreateChannel";
import { DeleteChannel } from "@domain/useCases/channel/DeleteChannel";
import { UpdateChannel } from "@domain/useCases/channel/UpdateChannel";
import { ChannelRepository } from "@infra/repositories/ChannelRepository";
import { mockDeep, MockProxy } from "jest-mock-extended";

const mockChannelId = {
  id: 1,
};

const mockChannelValue = {
  platformId: "1234567890",
  name: "channel-name",
  url: "https://discord.com/channels/999999999999999999/999999999999999999",
  createdAt: new Date(),
};

const mockChannelCompleteData = {
  ...mockChannelId,
  platformId: "1234567890",
  name: "channel-name",
  url: "https://discord.com/channels/999999999999999999/999999999999999999",
  createdAt: new Date(),
  user: [],
  message: [],
  messageReaction: [],
};

describe("Channel useCases", () => {
  let createChannelCase: CreateChannel;
  let updateChannelCase: UpdateChannel;
  let deleteChannelCase: DeleteChannel;

  let channelRepository: MockProxy<ChannelRepository>;
  let loggerMock: MockProxy<ILoggerService>;

  beforeEach(() => {
    loggerMock = mockDeep<ILoggerService>();
    channelRepository = mockDeep<ChannelRepository>();
    createChannelCase = new CreateChannel(channelRepository, loggerMock);
    updateChannelCase = new UpdateChannel(channelRepository, loggerMock);
    deleteChannelCase = new DeleteChannel(channelRepository, loggerMock);
  });

  describe("createChannel", () => {
    it("should create a new channel", async () => {
      const mockChannel = { ...mockChannelValue, ...mockChannelId };
      const mockResponse = {
        success: true,
        data: mockChannel,
        message: "Channel saved successfully",
      };

      channelRepository.create.mockResolvedValue(mockChannel);

      const result = await createChannelCase.execute(mockChannelValue);

      expect(result).toEqual(mockResponse);
      expect(channelRepository.create).toHaveBeenCalledTimes(1);
      expect(channelRepository.create).toHaveBeenCalledWith({
        ...mockChannelValue,
        id: undefined,
      });
    });

    it("should handle error when failing to create a channel", async () => {
      const errorMessage = "Something went wrong!";
      channelRepository.create.mockRejectedValue(new Error(errorMessage));

      const result = await createChannelCase.execute(mockChannelValue);

      expect(result).toBeUndefined();
      expect(loggerMock.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.COMMAND,
        LoggerContextEntity.USER,
        `executeCreateChannel | ${errorMessage}`,
      );
    });
  });

  describe("updateChannel", () => {
    it("should update a channel", async () => {
      const id = 1;
      const channelChangedData = {
        platformId: "1234567890",
        name: "main-hall",
        url: "https://discord.com/channels/999999999999999999/999999999999999999",
        createdAt: new Date(),
      };

      const updatedChannel = {
        ...mockChannelCompleteData,
        name: "main-hall",
      };

      channelRepository.findById.mockResolvedValue(mockChannelCompleteData);
      channelRepository.updateById.mockResolvedValue(updatedChannel);

      const result = await updateChannelCase.execute(id, channelChangedData);

      expect(result).toEqual({
        success: true,
        data: updatedChannel,
      });

      expect(channelRepository.updateById).toHaveBeenCalledTimes(1);
      expect(channelRepository.updateById).toHaveBeenCalledWith(
        id,
        channelChangedData,
      );
    });

    it("should update a channel by platformId", async () => {
      const platformId = "1234567890";
      const id = 1;
      const channelChangedData = {
        platformId: "1234567890",
        name: "main-hall",
        url: "https://discord.com/channels/999999999999999999/999999999999999999",
        createdAt: new Date(),
      };

      const updatedChannel = {
        ...mockChannelCompleteData,
        name: "main-hall",
      };

      channelRepository.findByPlatformId.mockResolvedValue(
        mockChannelCompleteData,
      );
      channelRepository.updateById.mockResolvedValue(updatedChannel);

      const result = await updateChannelCase.execute(
        platformId,
        channelChangedData,
      );

      expect(result).toEqual({
        success: true,
        data: updatedChannel,
      });

      expect(channelRepository.updateById).toHaveBeenCalledTimes(1);
      expect(channelRepository.updateById).toHaveBeenCalledWith(
        id,
        channelChangedData,
      );
    });

    it("should returns a not found response when channel not found", async () => {
      const id = 1;
      const channelChangedData = {
        platformId: "1234567890",
        name: "main-hall",
        url: "https://discord.com/channels/999999999999999999/999999999999999999",
        createdAt: new Date(),
      };

      const result = await updateChannelCase.execute(id, channelChangedData);

      expect(result).toEqual({
        success: false,
        data: null,
        message: `${ErrorMessages.CHANNEL_NOT_FOUND} ${id}`,
      });
      expect(channelRepository.findById).toHaveBeenCalledTimes(1);
      expect(channelRepository.findById).toHaveBeenCalledWith(id);
      expect(channelRepository.updateById).not.toHaveBeenCalledTimes(1);
    });

    it("should return error when failing to update a channel", async () => {
      const id = 1;
      const errorMessage = `Channel not found with id ${id}`;
      const channelChangedData = {
        platformId: "1234567890",
        name: "main-hall",
        url: "https://discord.com/channels/999999999999999999/999999999999999999",
        createdAt: new Date(),
      };
      channelRepository.findById.mockResolvedValue(mockChannelCompleteData);
      channelRepository.updateById.mockRejectedValue(new Error(errorMessage));

      const result = await updateChannelCase.execute(id, channelChangedData);

      expect(result).toEqual({
        success: false,
        data: null,
        message: errorMessage,
      });
      expect(loggerMock.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `UpdateChannel.execute | ${errorMessage}`,
      );
    });
  });

  describe("deleteChannel", () => {
    it("should delete a channel", async () => {
      const id = 1;
      channelRepository.findById.mockResolvedValue(mockChannelCompleteData);
      channelRepository.deleteById.mockResolvedValue(true);

      const result = await deleteChannelCase.execute(id);

      expect(result).toEqual({
        success: true,
        data: true,
      });

      expect(channelRepository.deleteById).toHaveBeenCalledTimes(1);
      expect(channelRepository.deleteById).toHaveBeenCalledWith(id);
    });

    it("should update a channel by platformId", async () => {
      const platformId = "1234567890";

      channelRepository.findByPlatformId.mockResolvedValue(
        mockChannelCompleteData,
      );
      channelRepository.deleteById.mockResolvedValue(true);

      const result = await deleteChannelCase.execute(platformId);

      expect(result).toEqual({
        success: true,
        data: true,
      });

      expect(channelRepository.deleteById).toHaveBeenCalledTimes(1);
      expect(channelRepository.deleteById).toHaveBeenCalledWith(
        mockChannelCompleteData.id,
      );
    });

    it("should returns a not found response when channel not found", async () => {
      const id = 1;

      const result = await deleteChannelCase.execute(id);

      expect(result).toEqual({
        success: false,
        data: null,
        message: `${ErrorMessages.CHANNEL_NOT_FOUND} ${id}`,
      });
      expect(channelRepository.findById).toHaveBeenCalledTimes(1);
      expect(channelRepository.findById).toHaveBeenCalledWith(id);
      expect(channelRepository.deleteById).not.toHaveBeenCalledTimes(1);
    });

    it("should return error when failing to delete a channel", async () => {
      const id = 1;
      const errorMessage = `Channel not found with id ${id}`;
      channelRepository.findById.mockResolvedValue(mockChannelCompleteData);
      channelRepository.deleteById.mockRejectedValue(new Error(errorMessage));

      const result = await deleteChannelCase.execute(id);

      expect(result).toEqual({
        success: false,
        data: false,
        message: errorMessage,
      });
      expect(loggerMock.logToConsole).toHaveBeenCalledWith(
        LoggerContextStatus.ERROR,
        LoggerContext.USECASE,
        LoggerContextEntity.CHANNEL,
        `DeleteChannel.execute | ${errorMessage}`,
      );
    });
  });
});
