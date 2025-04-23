import { IChannelRepository } from "../domain/interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../domain/interfaces/services/ILogger";
import { CreateChannel } from "../domain/useCases/channel/CreateChannel";
import { FindChannel } from "../domain/useCases/channel/FindChannel";

export function initializeChannelUseCases(channelRepository: IChannelRepository, logger: ILoggerService) {
    const createChannelUseCase = new CreateChannel(channelRepository, logger)
    const findChannelUseCase = new FindChannel(channelRepository, logger);

    return { 
        createChannelUseCase,
        findChannelUseCase
    }
}