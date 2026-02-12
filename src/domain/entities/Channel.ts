import { UserEntity } from "@entities/User";
import { MessageEntity } from "@entities/Message";
import { MessageReactionEntity } from "@entities/MessageReaction";

export class ChannelEntity {
  constructor(
    public readonly id: number,
    public readonly platformId: string,
    public readonly name: string,
    public readonly url: string,
    public readonly createdAt: Date,
    public readonly user?: UserEntity[],
    public readonly message?: MessageEntity[],
    public readonly messageReaction?: MessageReactionEntity[],
  ) {}
}
