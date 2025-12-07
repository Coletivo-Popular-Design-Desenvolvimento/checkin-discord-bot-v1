import { AudioEvent, Channel, User } from "@prisma/client";
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

  public static fromPersistence(
    prismaEvent: AudioEvent,
    channel?: Channel,
    user?: User,
  ) {
    return new AudioEventEntity(
      prismaEvent.id,
      prismaEvent.platform_id,
      prismaEvent.name,
      prismaEvent.status_id,
      prismaEvent.start_at,
      prismaEvent.end_at,
      prismaEvent.user_count,
      prismaEvent.created_at,
      prismaEvent.description,
      prismaEvent.image,
      channel && ChannelEntity.fromPersistence(channel),
      user && UserEntity.fromPersistence(user),
    );
  }
}
