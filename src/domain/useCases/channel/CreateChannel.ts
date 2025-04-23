import { GenericOutputDto } from "../../dtos/GenericOutputDto";
import ChannelEntity from "../../entities/Channel";
import { IChannelRepository } from "../../interfaces/repositories/IChannelRepository";
import { ILoggerService } from "../../interfaces/services/ILogger";
import ICreateChannel, { CreateChannelInput } from "../../interfaces/useCases/channel/ICreateChannel";


export class CreateChannel implements ICreateChannel {
    constructor(private readonly channelRepository: IChannelRepository, private readonly logger: ILoggerService
    ) { }

    executeAsync(channel: CreateChannelInput): Promise<GenericOutputDto<ChannelEntity>> {
        throw new Error("Method not implemented.");
    }
}