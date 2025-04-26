import { ManyChannelsDto } from "../../domain/dtos/channels/manyChannelsDto";
import { GenericOutputDto } from "../../domain/dtos/GenericOutputDto";
import ChannelEntity from "../../domain/entities/Channel";
import IChannelQuery from "../../domain/interfaces/queries/IChannelQuery";
import IChannelRepository from "../../domain/interfaces/repositories/IChannelRepository";

export class ChannelQuery implements IChannelQuery {
    constructor(private readonly repository: IChannelRepository) 
    {}

    async executeFindAllAsync(limit?: number): Promise<ManyChannelsDto> {
        const result = await this.repository.listAllAsync(limit);
        return {
            isSuccess: true,
            channels: result,
        }
    }

    async executeFindByIdAsync(id: number): Promise<GenericOutputDto<ChannelEntity>> {
        const result = await this.repository.findByIdAsync(id);
        return {
            success: true,
            data: result
        }
    }

    async executeFindByDiscordIdAsync(discordId: string): Promise<GenericOutputDto<ChannelEntity>> {
        const result = await this.repository.findByDiscordIdAsync(discordId);
        return {
            success: true,
            data: result
        }
    }
}