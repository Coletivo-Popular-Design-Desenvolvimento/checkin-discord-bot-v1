import { GenericOutputDto } from "../../domain/dtos/GenericOutputDto";
import ChannelEntity from "../../domain/entities/Channel";
import IChannelQuery from "../../domain/interfaces/queries/IChannelQuery";

export class ChannelQuery implements IChannelQuery {
    executeFindAllAsync(): Promise<GenericOutputDto<ChannelEntity>> {
        throw new Error("Method not implemented.");
    }

    executeFindByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>> {
        throw new Error("Method not implemented.");
    }

    executeFindByDiscordIdAsync(name: string): Promise<GenericOutputDto<ChannelEntity>> {
        throw new Error("Method not implemented.");
    }
}