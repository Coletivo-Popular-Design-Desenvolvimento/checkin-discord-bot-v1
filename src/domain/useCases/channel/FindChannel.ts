// import { GenericOutputDto } from "../../dtos/GenericOutputDto";
// import ChannelEntity from "../../entities/Channel";
// import IChannelRepository from "../../interfaces/repositories/IChannelRepository";
// import { ILoggerService } from "../../interfaces/services/ILogger";
// import IFindChannel from "../../interfaces/useCases/channel/IFindChannel";

// export default class FindChannel implements IFindChannel {
//     constructor(private readonly channelRepository: IChannelRepository, private readonly logger: ILoggerService
//     ) {}

//     findAllAsync(limit?: number): Promise<GenericOutputDto<ChannelEntity[]>> {
//         throw new Error("Method not implemented.")
//     }

//     findByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>> {
//         throw new Error("Method not implemented.");
//     }

//     findByNameAsync(name: string): Promise<GenericOutputDto<ChannelEntity>> {
//         throw new Error("Method not implemented.");
//     }
// }
