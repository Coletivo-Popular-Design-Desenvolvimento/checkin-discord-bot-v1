import { ChannelEntity } from "./Channel";
import { MessageEntity } from "./Message";
import { UserEntity } from "./User";
import {Channel, Message, MessageReaction, User} from "@prisma/client";

export class MessageReactionEntity {
  constructor(
    public readonly id: number,
    public readonly user?: UserEntity,
    public readonly message?: MessageEntity,
    public readonly channel?: ChannelEntity,
  ) {
  }

  public static fromPersistence(messageReact: MessageReaction, user?: User, message?: Message, channel?: Channel): MessageReactionEntity {
    return new MessageReactionEntity(
        messageReact.id,
        UserEntity.fromPersistence(user),
        MessageEntity.fromPersistence(message),
        ChannelEntity.fromPersistence(channel)
    );
  }
}
