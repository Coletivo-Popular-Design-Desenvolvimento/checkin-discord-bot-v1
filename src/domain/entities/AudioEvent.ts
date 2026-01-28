import { ChannelEntity } from "./Channel";
import { UserEntity } from "./User";

export class AudioEventEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly statusId: string, // Represents the foreign key to EventStatus
    public readonly startAt: Date,
    public readonly endAt: Date | null,
    public readonly userCount: number,
    public readonly createdAt: Date,
    public readonly description?: string | null,
    public readonly image?: string | null,
    public readonly channel?: ChannelEntity,
    public readonly creator?: UserEntity,
  ) {}
}
