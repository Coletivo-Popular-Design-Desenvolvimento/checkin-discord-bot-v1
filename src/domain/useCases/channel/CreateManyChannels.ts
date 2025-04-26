import { CreateChannelInput } from "../../dtos/channels/channelDto";
import IChannelRepository from "../../interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../../interfaces/services/ILogger";
import ICreateManyChannelsUseCase from "../../interfaces/useCases/channel/ICreateManyChannelUseCase";

export default class CreateManyChannelsUseCase implements ICreateManyChannelsUseCase {
    constructor(private readonly repository: IChannelRepository, logger: ILoggerService) {}
    
    executeAsync(channels: CreateChannelInput[]): Promise<boolean> {

        

        throw new Error("Method not implemented.");
    }   
}