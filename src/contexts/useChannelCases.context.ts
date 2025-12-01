import { IChannelRepository } from "@domain/interfaces/repositories/IChannelRepository";
import { CreateChannel } from "@domain/useCases/channel/CreateChannel";
import { DeleteChannel } from "@domain/useCases/channel/DeleteChannel";
import { UpdateChannel } from "@domain/useCases/channel/UpdateChannel";
import { ILoggerService } from "@services/ILogger";

export const initializeChannelUseCases = (
  channelRepository: IChannelRepository,
  logger: ILoggerService,
) => {
  const createChannelCase = new CreateChannel(channelRepository, logger);
  const updateChannelCase = new UpdateChannel(channelRepository, logger);
  const deleteChannelCase = new DeleteChannel(channelRepository, logger);
  return {
    createChannelCase,
    updateChannelCase,
    deleteChannelCase,
  };
};
