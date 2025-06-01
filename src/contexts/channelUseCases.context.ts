import IChannelRepository from "../domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../domain/interfaces/services/ILogger";
import CreateChannel from "../domain/useCases/channel/CreateChannel";
import CreateManyChannels from "../domain/useCases/channel/CreateManyChannels";
// import FindChannel from "../domain/useCases/channel/FindChannel";
import UpdateChannel from "../domain/useCases/channel/UpdateChannel";

export function initializeChannelUseCases(
  channelRepository: IChannelRepository,
  logger: ILoggerService,
) {
  const createChannelUseCase = new CreateChannel(channelRepository, logger);
  const createManyChannelUseCase = new CreateManyChannels(
    channelRepository,
    logger,
  );
  // const findChannelUseCase = new FindChannel(channelRepository, logger);
  const updateChannelUseCase = new UpdateChannel(channelRepository, logger);

  return {
    createChannelUseCase,
    createManyChannelUseCase,
    // findChannelUseCase,
    updateChannelUseCase,
  };
}
