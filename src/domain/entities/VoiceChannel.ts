import { ChannelEntity } from "./Channel";

export class VoiceChannelEntity extends ChannelEntity {
    constructor(
        id: number,
        discordId: string,
        name: string,
        url: string,
        createdAt: Date,
        public readonly audioEvent: unknown
    ) {
        super(id, discordId, name, url, createdAt);
    }
}