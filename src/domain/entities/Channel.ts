import { Channel } from "@prisma/client";

export class ChannelEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly createdAt: Date,
  ) {}

  public static fromPersistence(channel: Channel): ChannelEntity {
    return new ChannelEntity(
      channel.id,
      channel.platform_id,
      channel.name,
      channel.url,
      channel.created_at,
    );
  }
}
