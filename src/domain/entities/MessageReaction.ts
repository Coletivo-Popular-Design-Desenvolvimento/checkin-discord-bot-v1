import { ChannelEntity } from "./Channel";
import { MessageEntity } from "./Message";
import { UserEntity } from "./User";

export class MessageReactionEntity {
  constructor(
    public readonly id: number,
    public readonly user?: UserEntity,
    public readonly message?: MessageEntity,
    public readonly channel?: ChannelEntity,
  ) {}
}
